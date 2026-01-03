/**
 * Transcript Domain Errors
 *
 * All errors are typed values (not exceptions).
 * Each error contains contextual information for debugging.
 */

/**
 * Error when URL is not a valid YouTube URL
 */
export class InvalidVideoUrlError {
  readonly _tag = 'InvalidVideoUrlError' as const

  constructor(readonly url: string) {}

  get message(): string {
    return `Invalid YouTube URL: ${this.url}`
  }
}

/**
 * Error when video ID format is invalid
 */
export class InvalidVideoIdError {
  readonly _tag = 'InvalidVideoIdError' as const

  constructor(
    readonly id: string,
    readonly reason: string
  ) {}

  get message(): string {
    return `Invalid video ID "${this.id}": ${this.reason}`
  }
}

/**
 * Error when chunk validation fails
 */
export class ChunkValidationError {
  readonly _tag = 'ChunkValidationError' as const

  constructor(
    readonly field: string,
    readonly errorMessage: string
  ) {}

  get message(): string {
    return `Chunk validation failed for "${this.field}": ${this.errorMessage}`
  }
}

/**
 * Error when transcript validation fails
 */
export class TranscriptValidationError {
  readonly _tag = 'TranscriptValidationError' as const

  constructor(
    readonly field: string,
    readonly errorMessage: string
  ) {}

  get message(): string {
    return `Transcript validation failed for "${this.field}": ${this.errorMessage}`
  }
}

/**
 * Error when transcript fetch fails
 */
export class TranscriptFetchError {
  readonly _tag = 'TranscriptFetchError' as const

  constructor(
    readonly videoId: string,
    readonly reason: string
  ) {}

  get message(): string {
    return `Failed to fetch transcript for video "${this.videoId}": ${this.reason}`
  }
}

/**
 * Union type of all transcript errors
 */
export type TranscriptError =
  | InvalidVideoUrlError
  | InvalidVideoIdError
  | ChunkValidationError
  | TranscriptValidationError
  | TranscriptFetchError
