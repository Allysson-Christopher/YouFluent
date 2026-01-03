import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/shared/lib/prisma'
import { ChunkLessonGenerator } from '@/features/lesson/infrastructure/services/chunk-lesson-generator'

/**
 * GET /api/chunk-lesson?transcriptId=xxx&chunkIndex=0
 *
 * Generates (or retrieves cached) lesson content for a single chunk.
 * Matches original Python version: translation, explanation, vocabulary, exercise.
 */
export async function GET(request: NextRequest) {
  const transcriptId = request.nextUrl.searchParams.get('transcriptId')
  const chunkIndexStr = request.nextUrl.searchParams.get('chunkIndex')

  if (!transcriptId) {
    return NextResponse.json({ error: 'Missing transcriptId parameter' }, { status: 400 })
  }

  if (chunkIndexStr === null) {
    return NextResponse.json({ error: 'Missing chunkIndex parameter' }, { status: 400 })
  }

  const chunkIndex = parseInt(chunkIndexStr, 10)
  if (isNaN(chunkIndex) || chunkIndex < 0) {
    return NextResponse.json({ error: 'Invalid chunkIndex parameter' }, { status: 400 })
  }

  try {
    // 1. Check if we have cached lesson for this chunk
    const cachedLesson = await prisma.chunkLesson.findUnique({
      where: {
        transcriptId_chunkIndex: {
          transcriptId,
          chunkIndex,
        },
      },
      include: {
        vocabulary: true,
        exercise: true,
      },
    })

    if (cachedLesson) {
      return NextResponse.json({
        success: true,
        cached: true,
        lesson: {
          translation: cachedLesson.translation,
          explanation: cachedLesson.explanation,
          vocabulary: cachedLesson.vocabulary.map((v) => ({
            word: v.word,
            meaning: v.meaning,
          })),
          exercise: cachedLesson.exercise
            ? {
                question: cachedLesson.exercise.question,
                options: cachedLesson.exercise.options,
                correct: cachedLesson.exercise.correctIndex,
              }
            : null,
        },
      })
    }

    // 2. Get chunk text from transcript
    const chunk = await prisma.chunk.findFirst({
      where: {
        transcriptId,
        index: chunkIndex,
      },
    })

    if (!chunk) {
      return NextResponse.json(
        { error: `Chunk ${chunkIndex} not found for transcript ${transcriptId}` },
        { status: 404 }
      )
    }

    // 3. Generate lesson content
    const generator = new ChunkLessonGenerator()
    const result = await generator.generate(chunk.text)

    if (!result.isSuccess) {
      return NextResponse.json(
        {
          error: result.error._tag,
          message: result.error.message,
        },
        { status: 500 }
      )
    }

    const lessonData = result.value

    // 4. Cache the generated lesson
    const savedLesson = await prisma.chunkLesson.create({
      data: {
        transcriptId,
        chunkIndex,
        translation: lessonData.translation,
        explanation: lessonData.explanation,
        vocabulary: {
          create: lessonData.vocabulary.map((v) => ({
            word: v.word,
            meaning: v.meaning,
          })),
        },
        exercise: {
          create: {
            question: lessonData.exercise.question,
            options: lessonData.exercise.options,
            correctIndex: lessonData.exercise.correct,
          },
        },
      },
      include: {
        vocabulary: true,
        exercise: true,
      },
    })

    return NextResponse.json({
      success: true,
      cached: false,
      lesson: {
        translation: savedLesson.translation,
        explanation: savedLesson.explanation,
        vocabulary: savedLesson.vocabulary.map((v) => ({
          word: v.word,
          meaning: v.meaning,
        })),
        exercise: savedLesson.exercise
          ? {
              question: savedLesson.exercise.question,
              options: savedLesson.exercise.options,
              correct: savedLesson.exercise.correctIndex,
            }
          : null,
      },
    })
  } catch (error) {
    console.error('chunk-lesson error:', error)
    return NextResponse.json(
      {
        error: 'ServiceError',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
