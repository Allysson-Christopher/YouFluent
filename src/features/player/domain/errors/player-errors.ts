/**
 * Player Domain Errors
 *
 * All errors are typed values (not exceptions).
 * Each error contains contextual information for debugging.
 */

/**
 * Error when time value is invalid
 */
export class InvalidTimeError {
  readonly _tag = 'InvalidTimeError' as const

  constructor(
    readonly time: number,
    readonly reason: string
  ) {}

  get message(): string {
    return `Invalid time "${this.time}": ${this.reason}`
  }
}

/**
 * Error when playback rate is invalid
 */
export class InvalidPlaybackRateError {
  readonly _tag = 'InvalidPlaybackRateError' as const

  constructor(readonly rate: number) {}

  get message(): string {
    return `Invalid playback rate: ${this.rate}. Must be one of: 0.5, 0.75, 1, 1.25, 1.5`
  }
}

/**
 * Error when seek operation fails
 */
export class SeekError {
  readonly _tag = 'SeekError' as const

  constructor(
    readonly position: number,
    readonly reason: string
  ) {}

  get message(): string {
    return `Seek failed at position ${this.position}: ${this.reason}`
  }
}

/**
 * Union type of all player errors
 */
export type PlayerError = InvalidTimeError | InvalidPlaybackRateError | SeekError
