import type { PrismaClient } from '@prisma/client'
import type { LessonRepository } from '@/features/lesson/domain/interfaces/lesson-repository'
import type { Lesson } from '@/features/lesson/domain/entities/lesson'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'
import { LessonMapper } from '../mappers/lesson-mapper'

/**
 * PrismaLessonRepository
 *
 * Prisma implementation of LessonRepository interface.
 * Handles persistence of Lesson aggregates with exercises and vocabulary.
 *
 * Uses:
 * - Nested writes for atomic creation
 * - Ordered queries for consistent results
 * - Cascade delete for cleanup
 */
export class PrismaLessonRepository implements LessonRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Save a lesson with all exercises and vocabulary
   *
   * Uses nested writes for atomic creation of lesson with relations.
   *
   * PRE: lesson is valid, videoId is unique
   * POST: lesson, exercises, vocabulary are persisted
   * ERRORS: Throws on duplicate videoId or persistence failure
   *
   * @param lesson - Lesson to save
   */
  async save(lesson: Lesson): Promise<void> {
    const data = LessonMapper.toPrisma(lesson)

    await this.prisma.lesson.create({
      data: {
        id: data.id,
        videoId: data.videoId,
        title: data.title,
        difficulty: data.difficulty,
        createdAt: data.createdAt,
        exercises: {
          create: data.exercises.map((e) => ({
            id: e.id,
            type: e.type,
            question: e.question,
            answer: e.answer,
            options: e.options,
            explanation: e.explanation,
            chunkIndex: e.chunkIndex,
          })),
        },
        vocabulary: {
          create: data.vocabulary.map((v) => ({
            id: v.id,
            word: v.word,
            definition: v.definition,
            example: v.example,
            partOfSpeech: v.partOfSpeech,
            chunkIndex: v.chunkIndex,
          })),
        },
      },
    })
  }

  /**
   * Find lesson by video ID
   *
   * Includes exercises and vocabulary, ordered by chunkIndex.
   *
   * PRE: videoId is valid
   * POST: Returns lesson if found, null otherwise
   *
   * @param videoId - Video ID to search by
   * @returns Lesson or null
   */
  async findByVideoId(videoId: VideoId): Promise<Lesson | null> {
    const data = await this.prisma.lesson.findUnique({
      where: { videoId: videoId.value },
      include: {
        exercises: { orderBy: { chunkIndex: 'asc' } },
        vocabulary: { orderBy: { chunkIndex: 'asc' } },
      },
    })

    if (!data) return null

    return LessonMapper.toDomain(data)
  }

  /**
   * Find lesson by ID
   *
   * Includes exercises and vocabulary, ordered by chunkIndex.
   *
   * PRE: id is a non-empty string
   * POST: Returns lesson if found, null otherwise
   *
   * @param id - Lesson ID to search by
   * @returns Lesson or null
   */
  async findById(id: string): Promise<Lesson | null> {
    const data = await this.prisma.lesson.findUnique({
      where: { id },
      include: {
        exercises: { orderBy: { chunkIndex: 'asc' } },
        vocabulary: { orderBy: { chunkIndex: 'asc' } },
      },
    })

    if (!data) return null

    return LessonMapper.toDomain(data)
  }

  /**
   * Check if lesson exists for video
   *
   * Uses count query for efficiency.
   *
   * PRE: videoId is valid
   * POST: Returns true if lesson exists
   *
   * @param videoId - Video ID to check
   * @returns true if exists
   */
  async exists(videoId: VideoId): Promise<boolean> {
    const count = await this.prisma.lesson.count({
      where: { videoId: videoId.value },
    })

    return count > 0
  }

  /**
   * Delete lesson by video ID
   *
   * Cascade delete handled by Prisma (onDelete: Cascade in schema).
   *
   * PRE: videoId is valid
   * POST: Lesson and relations are deleted if existed
   *
   * @param videoId - Video ID to delete by
   */
  async deleteByVideoId(videoId: VideoId): Promise<void> {
    // Use deleteMany to not throw on non-existent record
    await this.prisma.lesson.deleteMany({
      where: { videoId: videoId.value },
    })
  }
}
