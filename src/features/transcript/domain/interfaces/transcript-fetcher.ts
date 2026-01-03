import { Result } from '@/shared/core/result'
import { VideoId } from '../value-objects/video-id'
import { TranscriptFetchError } from '../errors/transcript-errors'

/**
 * Raw transcript segment from external source
 */
export interface RawTranscriptSegment {
  readonly start: number
  readonly duration: number
  readonly text: string
}

/**
 * Raw transcript data from external source
 */
export interface RawTranscript {
  readonly videoId: string
  readonly title: string
  readonly language: string
  readonly segments: RawTranscriptSegment[]
}

/**
 * TranscriptFetcher Interface
 *
 * Port for fetching transcripts from external sources (Hexagonal Architecture).
 * Implementation lives in Infrastructure layer (e.g., YouTube API).
 *
 * This interface allows dependency inversion - Domain layer
 * defines what it needs, Infrastructure layer provides it.
 */
export interface TranscriptFetcher {
  /**
   * Fetch transcript from external source
   *
   * PRE: videoId is valid
   * POST: Returns RawTranscript if available
   * ERRORS: TranscriptFetchError if fetch fails
   *
   * @param videoId - Video ID to fetch transcript for
   * @returns Result with RawTranscript or TranscriptFetchError
   */
  fetch(videoId: VideoId): Promise<Result<RawTranscript, TranscriptFetchError>>
}
