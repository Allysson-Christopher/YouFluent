import { PlaybackState } from '../value-objects/playback-state'
import { PlaybackRate } from '../value-objects/playback-rate'
import { TimePosition } from '../value-objects/time-position'

/**
 * PlayerAdapter Interface
 *
 * Defines the contract for video player implementations.
 * Abstracts the underlying player technology (YouTube, Vimeo, etc.)
 *
 * Implementations:
 * - YouTubePlayerAdapter (T-009): Wraps YouTube IFrame API
 *
 * PATTERN: Adapter Pattern (GoF)
 * Converts the interface of a class into another interface clients expect.
 */
export interface PlayerAdapter {
  // ============================================================
  // Controls
  // ============================================================

  /**
   * Start or resume video playback
   *
   * PRE: Video is loaded
   * POST: Video is playing, state changes to 'playing'
   */
  play(): void

  /**
   * Pause video playback
   *
   * PRE: Video is playing or buffering
   * POST: Video is paused, state changes to 'paused'
   */
  pause(): void

  /**
   * Seek to a specific time position
   *
   * PRE: seconds >= 0 && seconds <= duration
   * POST: Video seeks to specified time
   *
   * @param seconds - Target time in seconds
   */
  seekTo(seconds: number): void

  /**
   * Set playback speed
   *
   * PRE: rate is one of: 0.5, 0.75, 1, 1.25, 1.5
   * POST: Video plays at specified rate
   *
   * @param rate - Playback rate
   */
  setPlaybackRate(rate: PlaybackRate): void

  // ============================================================
  // State
  // ============================================================

  /**
   * Get current playback time in seconds
   *
   * POST: Returns current time >= 0
   */
  getCurrentTime(): number

  /**
   * Get total video duration in seconds
   *
   * POST: Returns duration > 0, or 0 if not loaded
   */
  getDuration(): number

  /**
   * Get current playback state
   *
   * POST: Returns one of: playing, paused, buffering, ended
   */
  getState(): PlaybackState

  /**
   * Get current playback rate
   *
   * POST: Returns current playback rate
   */
  getPlaybackRate(): PlaybackRate

  /**
   * Get current time position
   *
   * POST: Returns TimePosition or null if not loaded
   */
  getTimePosition(): TimePosition | null

  // ============================================================
  // Events
  // ============================================================

  /**
   * Register callback for state changes
   *
   * Called when playback state changes (play, pause, buffer, end).
   *
   * @param callback - Function to call on state change
   */
  onStateChange(callback: (state: PlaybackState) => void): void

  /**
   * Register callback for time updates
   *
   * Called periodically while video is playing (typically every 250ms).
   *
   * @param callback - Function to call with current position
   */
  onTimeUpdate(callback: (position: TimePosition) => void): void

  /**
   * Register callback for errors
   *
   * @param callback - Function to call on player error
   */
  onError(callback: (error: Error) => void): void

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Clean up resources and remove event listeners
   *
   * POST: All callbacks are removed, player resources are freed
   */
  destroy(): void
}
