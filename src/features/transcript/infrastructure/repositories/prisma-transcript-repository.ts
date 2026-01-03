/**
 * PrismaTranscriptRepository
 *
 * Implements TranscriptRepository interface using Prisma ORM.
 * Part of the Infrastructure layer (Repository pattern).
 *
 * PRE: PrismaClient is properly configured with database connection
 * POST: Transcripts are persisted/retrieved from PostgreSQL
 */
import { PrismaClient } from '@prisma/client'
import { TranscriptRepository } from '../../domain/interfaces/transcript-repository'
import { Transcript } from '../../domain/entities/transcript'
import { VideoId } from '../../domain/value-objects/video-id'
import { TranscriptMapper } from '../mappers/transcript-mapper'

export class PrismaTranscriptRepository implements TranscriptRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Save a transcript with all its chunks
   *
   * PRE: transcript is valid
   * POST: transcript and chunks are persisted atomically
   *
   * @param transcript - Transcript to save
   */
  async save(transcript: Transcript): Promise<void> {
    const data = TranscriptMapper.toPrisma(transcript)

    // Use nested create for atomic operation
    await this.prisma.transcript.create({
      data: {
        id: data.id,
        videoId: data.videoId,
        title: data.title,
        language: data.language,
        fullText: data.fullText,
        createdAt: data.createdAt,
        chunks: {
          create: data.chunks,
        },
      },
    })
  }

  /**
   * Find transcript by video ID
   *
   * PRE: videoId is valid
   * POST: Returns transcript with sorted chunks, or null if not found
   *
   * @param videoId - Video ID to search by
   * @returns Transcript or null
   */
  async findByVideoId(videoId: VideoId): Promise<Transcript | null> {
    const data = await this.prisma.transcript.findUnique({
      where: { videoId: videoId.value },
      include: {
        chunks: {
          orderBy: { index: 'asc' }, // IMPORTANT: Order chunks by index
        },
      },
    })

    if (!data) return null

    return TranscriptMapper.toDomain(data)
  }

  /**
   * Check if transcript exists for video
   *
   * PRE: videoId is valid
   * POST: Returns true if transcript exists
   *
   * @param videoId - Video ID to check
   * @returns true if exists
   */
  async exists(videoId: VideoId): Promise<boolean> {
    const count = await this.prisma.transcript.count({
      where: { videoId: videoId.value },
    })
    return count > 0
  }

  /**
   * Delete transcript by video ID
   *
   * PRE: videoId is valid
   * POST: Transcript and chunks are deleted (cascade)
   *
   * @param videoId - Video ID to delete by
   */
  async deleteByVideoId(videoId: VideoId): Promise<void> {
    // Cascade delete handles chunks automatically
    await this.prisma.transcript
      .delete({
        where: { videoId: videoId.value },
      })
      .catch(() => {
        // Ignore if not exists
      })
  }
}
