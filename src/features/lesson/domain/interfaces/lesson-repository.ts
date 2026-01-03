import { VideoId } from '@/features/transcript/domain/value-objects/video-id'
import { Lesson } from '../entities/lesson'

/**
 * LessonRepository Interface
 *
 * Port for lesson persistence (Hexagonal Architecture).
 * Implementation lives in Infrastructure layer.
 *
 * This interface allows dependency inversion - Domain layer
 * defines what it needs, Infrastructure layer provides it.
 */
export interface LessonRepository {
  /**
   * Save a lesson
   *
   * PRE: lesson is valid
   * POST: lesson is persisted
   * ERRORS: Throws on persistence failure
   *
   * @param lesson - Lesson to save
   */
  save(lesson: Lesson): Promise<void>

  /**
   * Find lesson by video ID
   *
   * PRE: videoId is valid
   * POST: Returns lesson if found, null otherwise
   *
   * @param videoId - Video ID to search by
   * @returns Lesson or null
   */
  findByVideoId(videoId: VideoId): Promise<Lesson | null>

  /**
   * Find lesson by ID
   *
   * PRE: id is a non-empty string
   * POST: Returns lesson if found, null otherwise
   *
   * @param id - Lesson ID to search by
   * @returns Lesson or null
   */
  findById(id: string): Promise<Lesson | null>

  /**
   * Check if lesson exists for video
   *
   * PRE: videoId is valid
   * POST: Returns true if lesson exists
   *
   * @param videoId - Video ID to check
   * @returns true if exists
   */
  exists(videoId: VideoId): Promise<boolean>

  /**
   * Delete lesson by video ID
   *
   * PRE: videoId is valid
   * POST: Lesson is deleted if existed
   *
   * @param videoId - Video ID to delete by
   */
  deleteByVideoId(videoId: VideoId): Promise<void>
}
