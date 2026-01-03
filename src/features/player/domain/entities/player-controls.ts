import { Result } from '@/shared/core/result'
import { PlayerAdapter } from '../interfaces/player-adapter'
import { PlaybackState } from '../value-objects/playback-state'
import { PlaybackRate } from '../value-objects/playback-rate'
import { TimePosition } from '../value-objects/time-position'
import { SeekError } from '../errors/player-errors'

/**
 * PlayerControls Entity
 *
 * Orchestrates video player operations through a PlayerAdapter.
 * Acts as a facade for player control operations with validation.
 *
 * RESPONSIBILITIES:
 * - Delegate control operations to adapter
 * - Validate seek positions before execution
 * - Provide convenient helper methods (toggle, seekForward, seekBackward)
 *
 * PATTERN: Facade Pattern
 * Provides a unified interface to a set of operations.
 */
export class PlayerControls {
  /**
   * Default seek amount in seconds
   */
  private static readonly DEFAULT_SEEK_SECONDS = 10

  /**
   * Create PlayerControls with a PlayerAdapter
   *
   * @param adapter - PlayerAdapter implementation to delegate to
   */
  constructor(private readonly adapter: PlayerAdapter) {}

  // ============================================================
  // Playback Controls
  // ============================================================

  /**
   * Start or resume playback
   *
   * POST: Video is playing
   */
  play(): void {
    this.adapter.play()
  }

  /**
   * Pause playback
   *
   * POST: Video is paused
   */
  pause(): void {
    this.adapter.pause()
  }

  /**
   * Toggle between play and pause
   *
   * POST: Video is playing if was paused/ended, paused if was playing
   */
  toggle(): void {
    const state = this.adapter.getState()
    if (state.isPlaying) {
      this.adapter.pause()
    } else {
      this.adapter.play()
    }
  }

  // ============================================================
  // Seek Controls
  // ============================================================

  /**
   * Seek to a specific time position
   *
   * PRE: seconds >= 0 && seconds <= duration
   * POST: Video seeks to specified time
   * ERRORS: SeekError if position is invalid
   *
   * @param seconds - Target time in seconds
   * @returns Result indicating success or failure
   */
  seekTo(seconds: number): Result<void, SeekError> {
    if (seconds < 0) {
      return Result.fail(
        new SeekError(seconds, 'Position cannot be negative')
      )
    }

    const duration = this.adapter.getDuration()
    if (seconds > duration) {
      return Result.fail(
        new SeekError(seconds, `Position cannot exceed duration (${duration})`)
      )
    }

    this.adapter.seekTo(seconds)
    return Result.ok(undefined)
  }

  /**
   * Seek forward by specified seconds
   *
   * POST: Video seeks forward, capped at duration
   *
   * @param seconds - Seconds to seek forward (default: 10)
   */
  seekForward(seconds: number = PlayerControls.DEFAULT_SEEK_SECONDS): void {
    const currentTime = this.adapter.getCurrentTime()
    const duration = this.adapter.getDuration()
    const targetTime = Math.min(currentTime + seconds, duration)
    this.adapter.seekTo(targetTime)
  }

  /**
   * Seek backward by specified seconds
   *
   * POST: Video seeks backward, capped at 0
   *
   * @param seconds - Seconds to seek backward (default: 10)
   */
  seekBackward(seconds: number = PlayerControls.DEFAULT_SEEK_SECONDS): void {
    const currentTime = this.adapter.getCurrentTime()
    const targetTime = Math.max(currentTime - seconds, 0)
    this.adapter.seekTo(targetTime)
  }

  // ============================================================
  // Playback Rate
  // ============================================================

  /**
   * Set playback speed
   *
   * @param rate - PlaybackRate (0.5, 0.75, 1, 1.25, 1.5)
   */
  setPlaybackRate(rate: PlaybackRate): void {
    this.adapter.setPlaybackRate(rate)
  }

  /**
   * Get current playback rate
   *
   * @returns Current playback rate
   */
  getPlaybackRate(): PlaybackRate {
    return this.adapter.getPlaybackRate()
  }

  // ============================================================
  // State Access
  // ============================================================

  /**
   * Get current playback state
   *
   * @returns Current PlaybackState
   */
  getState(): PlaybackState {
    return this.adapter.getState()
  }

  /**
   * Get current time position
   *
   * @returns TimePosition or null if not loaded
   */
  getTimePosition(): TimePosition | null {
    return this.adapter.getTimePosition()
  }

  /**
   * Get current playback time in seconds
   *
   * @returns Current time in seconds
   */
  getCurrentTime(): number {
    return this.adapter.getCurrentTime()
  }

  /**
   * Get total video duration in seconds
   *
   * @returns Duration in seconds
   */
  getDuration(): number {
    return this.adapter.getDuration()
  }
}
