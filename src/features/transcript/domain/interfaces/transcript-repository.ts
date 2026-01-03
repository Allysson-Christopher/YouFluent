import { Transcript } from '../entities/transcript'
import { VideoId } from '../value-objects/video-id'

/**
 * TranscriptRepository Interface
 *
 * Port for transcript persistence (Hexagonal Architecture).
 * Implementation lives in Infrastructure layer.
 *
 * This interface allows dependency inversion - Domain layer
 * defines what it needs, Infrastructure layer provides it.
 */
export interface TranscriptRepository {
  /**
   * Save a transcript
   *
   * PRE: transcript is valid
   * POST: transcript is persisted
   * ERRORS: Throws on persistence failure
   *
   * @param transcript - Transcript to save
   */
  save(transcript: Transcript): Promise<void>

  /**
   * Find transcript by video ID
   *
   * PRE: videoId is valid
   * POST: Returns transcript if found, null otherwise
   *
   * @param videoId - Video ID to search by
   * @returns Transcript or null
   */
  findByVideoId(videoId: VideoId): Promise<Transcript | null>

  /**
   * Check if transcript exists for video
   *
   * PRE: videoId is valid
   * POST: Returns true if transcript exists
   *
   * @param videoId - Video ID to check
   * @returns true if exists
   */
  exists(videoId: VideoId): Promise<boolean>

  /**
   * Delete transcript by video ID
   *
   * PRE: videoId is valid
   * POST: Transcript is deleted if existed
   *
   * @param videoId - Video ID to delete by
   */
  deleteByVideoId(videoId: VideoId): Promise<void>
}
