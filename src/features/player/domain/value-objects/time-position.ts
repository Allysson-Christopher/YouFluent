import { Result } from '@/shared/core/result'
import { InvalidTimeError } from '../errors/player-errors'

/**
 * TimePosition Value Object
 *
 * Represents the current time position within a video.
 * Value Objects are immutable and compared by value.
 *
 * INVARIANTS:
 * - currentSeconds >= 0
 * - durationSeconds > 0
 * - currentSeconds <= durationSeconds
 * - Object is frozen (immutable)
 */
export class TimePosition {
  /**
   * Private constructor enforces factory method usage
   */
  private constructor(
    readonly currentSeconds: number,
    readonly durationSeconds: number
  ) {
    Object.freeze(this)
  }

  /**
   * Create TimePosition with validation
   *
   * PRE: current >= 0, duration > 0, current <= duration
   * POST: Returns Success<TimePosition> if valid
   * ERRORS: InvalidTimeError if validation fails
   *
   * @param current - Current time in seconds
   * @param duration - Total duration in seconds
   * @returns Result with TimePosition or InvalidTimeError
   */
  static create(
    current: number,
    duration: number
  ): Result<TimePosition, InvalidTimeError> {
    if (current < 0) {
      return Result.fail(
        new InvalidTimeError(current, 'Current time cannot be negative')
      )
    }

    if (duration <= 0) {
      return Result.fail(
        new InvalidTimeError(duration, 'Duration must be positive')
      )
    }

    if (current > duration) {
      return Result.fail(
        new InvalidTimeError(
          current,
          `Current time cannot exceed duration (${duration})`
        )
      )
    }

    return Result.ok(new TimePosition(current, duration))
  }

  // ============================================================
  // Calculated Properties
  // ============================================================

  /**
   * Get progress as percentage (0-100)
   *
   * @returns Progress percentage with 2 decimal places
   */
  get progressPercent(): number {
    return Math.round((this.currentSeconds / this.durationSeconds) * 10000) / 100
  }

  /**
   * Get remaining seconds
   *
   * @returns Seconds until end of video
   */
  get remainingSeconds(): number {
    return this.durationSeconds - this.currentSeconds
  }

  /**
   * Check if at start of video
   *
   * @returns true if currentSeconds is 0
   */
  get isAtStart(): boolean {
    return this.currentSeconds === 0
  }

  /**
   * Check if at end of video
   *
   * @returns true if currentSeconds equals durationSeconds
   */
  get isAtEnd(): boolean {
    return this.currentSeconds === this.durationSeconds
  }

  // ============================================================
  // Formatting
  // ============================================================

  /**
   * Format seconds as MM:SS
   *
   * @param seconds - Seconds to format
   * @returns Formatted time string
   */
  private formatTime(seconds: number): string {
    const totalSeconds = Math.floor(seconds)
    const minutes = Math.floor(totalSeconds / 60)
    const secs = totalSeconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  /**
   * Get current time formatted as MM:SS
   */
  get formattedCurrent(): string {
    return this.formatTime(this.currentSeconds)
  }

  /**
   * Get duration formatted as MM:SS
   */
  get formattedDuration(): string {
    return this.formatTime(this.durationSeconds)
  }

  /**
   * Get remaining time formatted as MM:SS
   */
  get formattedRemaining(): string {
    return this.formatTime(this.remainingSeconds)
  }

  // ============================================================
  // Comparison
  // ============================================================

  /**
   * Compare two TimePosition instances by value
   *
   * @param other - TimePosition to compare with
   * @returns true if values are equal
   */
  equals(other: TimePosition): boolean {
    return (
      this.currentSeconds === other.currentSeconds &&
      this.durationSeconds === other.durationSeconds
    )
  }
}
