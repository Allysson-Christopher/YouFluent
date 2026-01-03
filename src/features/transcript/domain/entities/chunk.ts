import { Result } from '@/shared/core/result'
import { ChunkValidationError } from '../errors/transcript-errors'

/**
 * Chunk creation properties
 */
export interface ChunkProps {
  readonly id: string
  readonly index: number
  readonly startTime: number
  readonly endTime: number
  readonly text: string
}

/**
 * Chunk Entity
 *
 * Represents a segment of a transcript (~30 seconds of video).
 * Entities have identity (id) and can have behavior.
 *
 * INVARIANTS:
 * - id is non-empty
 * - index >= 0
 * - startTime >= 0
 * - endTime > startTime
 * - text is non-empty (after trimming)
 */
export class Chunk {
  /**
   * Private constructor enforces factory method usage
   */
  private constructor(
    readonly id: string,
    readonly index: number,
    readonly startTime: number,
    readonly endTime: number,
    readonly text: string
  ) {
    Object.freeze(this)
  }

  /**
   * Create a new Chunk
   *
   * PRE: props contains valid id, index, startTime, endTime, text
   * POST: Returns Success<Chunk> if all validations pass
   * ERRORS: ChunkValidationError with field and message
   *
   * @param props - Chunk creation properties
   * @returns Result with Chunk or ChunkValidationError
   */
  static create(props: ChunkProps): Result<Chunk, ChunkValidationError> {
    // Validate id
    if (!props.id || typeof props.id !== 'string' || props.id.trim() === '') {
      return Result.fail(new ChunkValidationError('id', 'ID cannot be empty'))
    }

    // Validate index
    if (typeof props.index !== 'number' || props.index < 0) {
      return Result.fail(new ChunkValidationError('index', 'Index must be a non-negative number'))
    }

    // Validate startTime
    if (typeof props.startTime !== 'number' || props.startTime < 0) {
      return Result.fail(
        new ChunkValidationError('startTime', 'Start time must be a non-negative number')
      )
    }

    // Validate endTime
    if (typeof props.endTime !== 'number' || props.endTime <= props.startTime) {
      return Result.fail(
        new ChunkValidationError(
          'endTime',
          `End time must be greater than start time (${props.startTime})`
        )
      )
    }

    // Validate text
    if (!props.text || typeof props.text !== 'string' || props.text.trim() === '') {
      return Result.fail(new ChunkValidationError('text', 'Text cannot be empty'))
    }

    return Result.ok(
      new Chunk(props.id, props.index, props.startTime, props.endTime, props.text.trim())
    )
  }

  /**
   * Calculate chunk duration in seconds
   *
   * @returns Duration in seconds
   */
  get duration(): number {
    return this.endTime - this.startTime
  }

  /**
   * Check if a given time (in seconds) falls within this chunk
   *
   * @param timeSeconds - Time in seconds
   * @returns true if time is within [startTime, endTime)
   */
  containsTime(timeSeconds: number): boolean {
    return timeSeconds >= this.startTime && timeSeconds < this.endTime
  }
}
