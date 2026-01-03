'use server'

import prisma from '@/shared/lib/prisma'
import { FetchTranscriptUseCase } from '@/features/transcript/application/use-cases/fetch-transcript'
import { ChunkTranscriptUseCase } from '@/features/transcript/application/use-cases/chunk-transcript'
import { PrismaTranscriptRepository } from '@/features/transcript/infrastructure/repositories/prisma-transcript-repository'
import { SupadataTranscriptService } from '@/features/transcript/infrastructure/services/supadata-transcript-service'

/**
 * DTO for transcript action result (serializable)
 * Simplified for chunk-by-chunk lesson approach (like original Python version)
 */
export interface TranscriptActionResult {
  success: boolean
  error?: {
    type: string
    message: string
  }
  data?: {
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
    }
  }
}

/**
 * Fetch Transcript Server Action
 *
 * Fetches transcript and creates chunks.
 * Lesson content is generated per-chunk on-demand via /api/chunk-lesson.
 * This matches the original Python version behavior.
 *
 * PRE: videoId is 11-char string
 * POST: Returns TranscriptActionResult with chunks
 */
export async function fetchTranscriptAction(
  videoId: string
): Promise<TranscriptActionResult> {
  try {
    // Build dependencies (Composition Root)
    const transcriptRepo = new PrismaTranscriptRepository(prisma)
    const transcriptFetcher = new SupadataTranscriptService()
    const chunker = new ChunkTranscriptUseCase()

    const fetchTranscript = new FetchTranscriptUseCase(
      transcriptRepo,
      transcriptFetcher,
      chunker
    )

    // Execute use case
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const transcriptResult = await fetchTranscript.execute(videoUrl)

    if (transcriptResult.isFailure) {
      return {
        success: false,
        error: {
          type: transcriptResult.error.constructor.name,
          message: 'message' in transcriptResult.error
            ? transcriptResult.error.message
            : 'Failed to fetch transcript'
        }
      }
    }

    const transcript = transcriptResult.value

    // Serialize transcript for client
    return {
      success: true,
      data: {
        transcript: {
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
    }

  } catch (error) {
    console.error('fetchTranscriptAction error:', error)
    return {
      success: false,
      error: {
        type: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }
}
