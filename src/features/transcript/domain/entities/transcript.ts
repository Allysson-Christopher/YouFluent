import { Result } from '@/shared/core/result'
import { TranscriptValidationError } from '../errors/transcript-errors'
import { VideoId } from '../value-objects/video-id'
import { Chunk } from './chunk'

/**
 * Transcript creation properties
 */
export interface TranscriptProps {
  readonly id: string
  readonly videoId: VideoId
  readonly title: string
  readonly language: string
  readonly chunks: Chunk[]
}

/**
 * Transcript Aggregate Root
 *
 * Represents a complete transcript of a YouTube video.
 * Aggregate Root is the entry point for the transcript bounded context.
 *
 * INVARIANTS:
 * - id is non-empty
 * - title is non-empty (after trimming)
 * - language is non-empty
 * - chunks is non-empty
 * - chunks are sorted by index
 */
export class Transcript {
  /**
   * Private constructor enforces factory method usage
   */
  private constructor(
    readonly id: string,
    readonly videoId: VideoId,
    readonly title: string,
    readonly language: string,
    readonly chunks: readonly Chunk[],
    readonly createdAt: Date
  ) {
    Object.freeze(this)
  }

  /**
   * Create a new Transcript
   *
   * PRE: props contains valid id, videoId, title, language, chunks
   * POST: Returns Success<Transcript> if all validations pass
   * ERRORS: TranscriptValidationError with field and message
   *
   * @param props - Transcript creation properties
   * @returns Result with Transcript or TranscriptValidationError
   */
  static create(props: TranscriptProps): Result<Transcript, TranscriptValidationError> {
    // Validate id
    if (!props.id || typeof props.id !== 'string' || props.id.trim() === '') {
      return Result.fail(new TranscriptValidationError('id', 'ID cannot be empty'))
    }

    // Validate title
    if (!props.title || typeof props.title !== 'string' || props.title.trim() === '') {
      return Result.fail(new TranscriptValidationError('title', 'Title cannot be empty'))
    }

    // Validate language
    if (!props.language || typeof props.language !== 'string' || props.language.trim() === '') {
      return Result.fail(new TranscriptValidationError('language', 'Language cannot be empty'))
    }

    // Validate chunks
    if (!props.chunks || !Array.isArray(props.chunks) || props.chunks.length === 0) {
      return Result.fail(
        new TranscriptValidationError('chunks', 'Chunks cannot be empty, at least one required')
      )
    }

    // Sort chunks by index
    const sortedChunks = [...props.chunks].sort((a, b) => a.index - b.index)
    Object.freeze(sortedChunks)

    return Result.ok(
      new Transcript(
        props.id.trim(),
        props.videoId,
        props.title.trim(),
        props.language.trim(),
        sortedChunks,
        new Date()
      )
    )
  }

  /**
   * Get full text by concatenating all chunk texts
   *
   * @returns Full transcript text with spaces between chunks
   */
  get fullText(): string {
    return this.chunks.map((chunk) => chunk.text).join(' ')
  }

  /**
   * Get number of chunks
   *
   * @returns Number of chunks
   */
  get chunkCount(): number {
    return this.chunks.length
  }

  /**
   * Get total duration of the transcript
   *
   * @returns Duration in seconds from start of first chunk to end of last chunk
   */
  get totalDuration(): number {
    if (this.chunks.length === 0) return 0
    const lastChunk = this.chunks[this.chunks.length - 1]
    return lastChunk.endTime
  }

  /**
   * Get chunk at a specific index
   *
   * @param index - Chunk index to find
   * @returns Chunk at index or null if not found
   */
  getChunkByIndex(index: number): Chunk | null {
    if (index < 0) return null
    return this.chunks.find((chunk) => chunk.index === index) ?? null
  }

  /**
   * Get chunk at a specific time
   *
   * @param timeSeconds - Time in seconds
   * @returns Chunk containing the given time or null if not found
   */
  getChunkAtTime(timeSeconds: number): Chunk | null {
    return this.chunks.find((chunk) => chunk.containsTime(timeSeconds)) ?? null
  }
}
