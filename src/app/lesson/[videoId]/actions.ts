'use server'

import prisma from '@/shared/lib/prisma'
import { Difficulty } from '@/features/lesson/domain/value-objects/difficulty'
import { GenerateLessonUseCase } from '@/features/lesson/application/use-cases/generate-lesson'
import { FetchTranscriptUseCase } from '@/features/transcript/application/use-cases/fetch-transcript'
import { ChunkTranscriptUseCase } from '@/features/transcript/application/use-cases/chunk-transcript'
import { PrismaLessonRepository } from '@/features/lesson/infrastructure/repositories/prisma-lesson-repository'
import { PrismaTranscriptRepository } from '@/features/transcript/infrastructure/repositories/prisma-transcript-repository'
import { YouTubeTranscriptService } from '@/features/transcript/infrastructure/services/youtube-transcript-service'
import { OpenAILessonGenerator } from '@/features/lesson/infrastructure/services/openai-lesson-generator'

/**
 * DTO for lesson action result (serializable)
 */
export interface LessonActionResult {
  success: boolean
  error?: {
    type: string
    message: string
  }
  data?: {
    lesson: {
      id: string
      videoId: string
      title: string
      difficulty: 'easy' | 'medium' | 'hard'
      exercises: Array<{
        id: string
        type: string
        question: string
        options: string[] | null
        answer: string
        explanation: string
        chunkIndex: number
      }>
      vocabulary: Array<{
        id: string
        word: string
        definition: string
        example: string
        partOfSpeech: string
        chunkIndex: number
      }>
    }
    transcript: {
      id: string
      videoId: string
      title: string
      language: string
      chunks: Array<{
        id: string
        index: number
        startTime: number
        endTime: number
        text: string
      }>
    } | null
  }
}

/**
 * Generate Lesson Server Action
 *
 * Orchestrates lesson generation using domain use cases.
 * Serializes entities for client consumption.
 *
 * PRE: videoId is 11-char string, difficultyStr is easy|medium|hard
 * POST: Returns LessonActionResult
 */
export async function generateLesson(
  videoId: string,
  difficultyStr: string
): Promise<LessonActionResult> {
  try {
    // Parse difficulty
    const difficultyResult = Difficulty.fromString(difficultyStr)
    if (difficultyResult.isFailure) {
      return {
        success: false,
        error: { type: 'INVALID_DIFFICULTY', message: 'Invalid difficulty level' }
      }
    }

    // Build dependencies (Composition Root)
    const transcriptRepo = new PrismaTranscriptRepository(prisma)
    const transcriptFetcher = new YouTubeTranscriptService()
    const chunker = new ChunkTranscriptUseCase()

    const fetchTranscript = new FetchTranscriptUseCase(
      transcriptRepo,
      transcriptFetcher,
      chunker
    )

    const lessonRepo = new PrismaLessonRepository(prisma)
    const lessonGenerator = new OpenAILessonGenerator()

    const generateLessonUseCase = new GenerateLessonUseCase(
      lessonRepo,
      fetchTranscript,
      lessonGenerator
    )

    // Execute use case
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const lessonResult = await generateLessonUseCase.execute({
      videoUrl,
      difficulty: difficultyResult.value
    })

    if (lessonResult.isFailure) {
      return {
        success: false,
        error: {
          type: lessonResult.error.constructor.name,
          message: 'message' in lessonResult.error
            ? lessonResult.error.message
            : 'Failed to generate lesson'
        }
      }
    }

    const lesson = lessonResult.value

    // Also fetch transcript for chunks (may be cached)
    const transcriptResult = await fetchTranscript.execute(videoUrl)

    // Serialize lesson for client
    const serializedLesson = {
      id: lesson.id,
      videoId: lesson.videoId.value,
      title: lesson.title,
      difficulty: lesson.difficulty.value,
      exercises: lesson.exercises.map(e => ({
        id: e.id,
        type: e.type.value,
        question: e.question,
        options: e.options ? [...e.options] : null,
        answer: e.answer,
        explanation: e.explanation,
        chunkIndex: e.chunkIndex,
      })),
      vocabulary: lesson.vocabulary.map(v => ({
        id: v.id,
        word: v.word,
        definition: v.definition,
        example: v.example,
        partOfSpeech: v.partOfSpeech,
        chunkIndex: v.chunkIndex,
      })),
    }

    // Serialize transcript if available
    let serializedTranscript = null
    if (transcriptResult.isSuccess) {
      const transcript = transcriptResult.value
      serializedTranscript = {
        id: transcript.id,
        videoId: transcript.videoId.value,
        title: transcript.title,
        language: transcript.language,
        chunks: transcript.chunks.map(c => ({
          id: c.id,
          index: c.index,
          startTime: c.startTime,
          endTime: c.endTime,
          text: c.text,
        })),
      }
    }

    return {
      success: true,
      data: {
        lesson: serializedLesson,
        transcript: serializedTranscript,
      }
    }

  } catch (error) {
    console.error('generateLesson error:', error)
    return {
      success: false,
      error: {
        type: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }
}
