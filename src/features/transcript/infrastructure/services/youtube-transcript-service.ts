/**
 * YouTubeTranscriptService
 *
 * Infrastructure service that fetches transcripts from YouTube
 * using the youtube-transcript npm package.
 *
 * Implements TranscriptFetcher interface from domain layer.
 */
import {
  YoutubeTranscript,
  TranscriptResponse,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptVideoUnavailableError,
  YoutubeTranscriptNotAvailableError,
} from 'youtube-transcript'
import { Result } from '@/shared/core/result'
import {
  TranscriptFetcher,
  RawTranscript,
  RawTranscriptSegment,
} from '../../domain/interfaces/transcript-fetcher'
import { VideoId } from '../../domain/value-objects/video-id'
import { TranscriptFetchError } from '../../domain/errors/transcript-errors'

export class YouTubeTranscriptService implements TranscriptFetcher {
  /**
   * Fetch transcript from YouTube
   *
   * PRE: videoId is a valid VideoId value object
   * POST: Returns RawTranscript with segments in seconds
   * ERRORS: TranscriptFetchError with descriptive reason
   *
   * @param videoId - VideoId to fetch transcript for
   * @returns Result with RawTranscript or TranscriptFetchError
   */
  async fetch(videoId: VideoId): Promise<Result<RawTranscript, TranscriptFetchError>> {
    try {
      const response = await YoutubeTranscript.fetchTranscript(videoId.value)

      const segments = this.mapSegments(response)

      const rawTranscript: RawTranscript = {
        videoId: videoId.value,
        title: '', // youtube-transcript doesn't provide title
        language: 'en', // Default to English for MVP
        segments,
      }

      return Result.ok(rawTranscript)
    } catch (error) {
      const reason = this.parseError(error)
      return Result.fail(new TranscriptFetchError(videoId.value, reason))
    }
  }

  /**
   * Map youtube-transcript response to domain segments
   *
   * CRITICAL: Converts offset/duration from milliseconds to seconds
   *
   * @param response - Array of TranscriptResponse from youtube-transcript
   * @returns Array of RawTranscriptSegment in seconds
   */
  private mapSegments(response: TranscriptResponse[]): RawTranscriptSegment[] {
    return response.map((item) => ({
      // youtube-transcript uses 'offset' in milliseconds
      start: item.offset / 1000,
      // duration is in milliseconds
      duration: item.duration / 1000,
      text: this.cleanText(item.text),
    }))
  }

  /**
   * Clean transcript text
   *
   * Removes HTML entities and extra whitespace
   *
   * @param text - Raw text from API
   * @returns Cleaned text
   */
  private cleanText(text: string): string {
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Parse error from youtube-transcript to descriptive reason
   *
   * @param error - Error thrown by youtube-transcript
   * @returns Human-readable reason string
   */
  private parseError(error: unknown): string {
    // Handle youtube-transcript specific error types
    if (error instanceof YoutubeTranscriptDisabledError) {
      return 'Transcript is disabled for this video'
    }

    if (error instanceof YoutubeTranscriptVideoUnavailableError) {
      return 'Video is private or unavailable'
    }

    if (error instanceof YoutubeTranscriptNotAvailableError) {
      return 'Transcript is not available for this video'
    }

    // Handle generic errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase()

      // Check for common error patterns in message
      if (message.includes('disabled') || message.includes('no transcript')) {
        return 'Transcript is disabled for this video'
      }

      if (message.includes('private') || message.includes('unavailable')) {
        return 'Video is private or unavailable'
      }

      if (message.includes('network') || message.includes('fetch')) {
        return 'Network error while fetching transcript'
      }

      return error.message
    }

    return 'Unknown error occurred while fetching transcript'
  }
}
