/**
 * TranscriptMapper
 *
 * Converts between Prisma models and Domain entities.
 * Part of the Infrastructure layer (Mapper pattern).
 *
 * PRE: Prisma data comes from database (assumed valid)
 * POST: Domain entities are fully validated
 */
import type { Transcript as PrismaTranscript, Chunk as PrismaChunk } from '@prisma/client'
import { Transcript } from '../../domain/entities/transcript'
import { Chunk } from '../../domain/entities/chunk'
import { VideoId } from '../../domain/value-objects/video-id'

/**
 * Prisma Transcript with Chunks included
 */
type PrismaTranscriptWithChunks = PrismaTranscript & { chunks: PrismaChunk[] }

/**
 * Prisma create input for Transcript
 */
export interface PrismaTranscriptCreateInput {
  id: string
  videoId: string
  title: string
  language: string
  fullText: string
  createdAt: Date
  chunks: Array<{
    id: string
    index: number
    startTime: number
    endTime: number
    text: string
  }>
}

export class TranscriptMapper {
  /**
   * Convert Prisma Transcript to Domain Transcript
   *
   * PATTERN: Usar Result.ok().value para unwrap, ja que dados do banco sao validos
   *
   * @param prisma - Prisma Transcript with Chunks
   * @returns Domain Transcript
   * @throws Error if database data is invalid (should not happen)
   */
  static toDomain(prisma: PrismaTranscriptWithChunks): Transcript {
    // 1. Convert Chunks first (sorted by index in Transcript.create)
    const domainChunks = prisma.chunks.map((chunk) => {
      const result = Chunk.create({
        id: chunk.id,
        index: chunk.index,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        text: chunk.text,
      })

      // Data from database is assumed valid, unwrap safely
      if (result.isFailure) {
        throw new Error(`Invalid chunk data from database: ${result.error.message}`)
      }

      return result.value
    })

    // 2. Convert VideoId
    const videoIdResult = VideoId.fromId(prisma.videoId)
    if (videoIdResult.isFailure) {
      throw new Error(`Invalid videoId from database: ${prisma.videoId}`)
    }

    // 3. Create Transcript
    const transcriptResult = Transcript.create({
      id: prisma.id,
      videoId: videoIdResult.value,
      title: prisma.title,
      language: prisma.language,
      chunks: domainChunks,
    })

    if (transcriptResult.isFailure) {
      throw new Error(`Invalid transcript data from database: ${transcriptResult.error.message}`)
    }

    return transcriptResult.value
  }

  /**
   * Convert Domain Transcript to Prisma create input
   *
   * @param transcript - Domain Transcript
   * @returns Prisma create input data
   */
  static toPrisma(transcript: Transcript): PrismaTranscriptCreateInput {
    return {
      id: transcript.id,
      videoId: transcript.videoId.value, // IMPORTANT: .value from VideoId
      title: transcript.title,
      language: transcript.language,
      fullText: transcript.fullText,
      createdAt: transcript.createdAt,
      chunks: transcript.chunks.map((chunk) => ({
        id: chunk.id,
        index: chunk.index,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        text: chunk.text,
      })),
    }
  }
}
