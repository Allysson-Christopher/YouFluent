import { Result } from '@/shared/core/result'
import { InvalidVideoUrlError, InvalidVideoIdError } from '../errors/transcript-errors'

/**
 * YouTube Video ID regex patterns
 *
 * Supports:
 * - youtube.com/watch?v=XXX
 * - youtu.be/XXX
 * - youtube.com/embed/XXX
 */
const YOUTUBE_PATTERNS = [
  /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
  /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
]

/**
 * Valid YouTube video ID format
 * - Exactly 11 characters
 * - Alphanumeric + underscore + hyphen
 */
const VIDEO_ID_REGEX = /^[a-zA-Z0-9_-]{11}$/

/**
 * VideoId Value Object
 *
 * Represents a valid YouTube video ID.
 * Value Objects are immutable and compared by value.
 *
 * INVARIANTS:
 * - value is always exactly 11 characters
 * - value only contains a-z, A-Z, 0-9, _, -
 */
export class VideoId {
  /**
   * Private constructor enforces factory method usage
   */
  private constructor(readonly value: string) {
    Object.freeze(this)
  }

  /**
   * Create VideoId from YouTube URL
   *
   * PRE: url is a non-empty string
   * POST: Returns Success<VideoId> if URL is valid YouTube URL with video ID
   * ERRORS: InvalidVideoUrlError if URL is invalid or not YouTube
   *
   * @param url - YouTube video URL
   * @returns Result with VideoId or InvalidVideoUrlError
   */
  static fromUrl(url: string): Result<VideoId, InvalidVideoUrlError> {
    if (!url || typeof url !== 'string') {
      return Result.fail(new InvalidVideoUrlError(url))
    }

    for (const pattern of YOUTUBE_PATTERNS) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return Result.ok(new VideoId(match[1]))
      }
    }

    return Result.fail(new InvalidVideoUrlError(url))
  }

  /**
   * Create VideoId from raw ID string
   *
   * PRE: id is a non-empty string
   * POST: Returns Success<VideoId> if id matches valid format
   * ERRORS: InvalidVideoIdError if id format is invalid
   *
   * @param id - Raw YouTube video ID (11 characters)
   * @returns Result with VideoId or InvalidVideoIdError
   */
  static fromId(id: string): Result<VideoId, InvalidVideoIdError> {
    if (!id || typeof id !== 'string') {
      return Result.fail(new InvalidVideoIdError(id, 'ID cannot be empty'))
    }

    if (id.length !== 11) {
      return Result.fail(
        new InvalidVideoIdError(id, `Must be exactly 11 characters, got ${id.length}`)
      )
    }

    if (!VIDEO_ID_REGEX.test(id)) {
      return Result.fail(
        new InvalidVideoIdError(id, 'Invalid characters. Only a-z, A-Z, 0-9, _, - allowed')
      )
    }

    return Result.ok(new VideoId(id))
  }

  /**
   * Compare two VideoId instances by value
   *
   * @param other - VideoId to compare with
   * @returns true if values are equal
   */
  equals(other: VideoId): boolean {
    return this.value === other.value
  }

  /**
   * Get string representation
   *
   * @returns The video ID string
   */
  toString(): string {
    return this.value
  }
}
