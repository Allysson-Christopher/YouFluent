import type { PlayerAdapter } from '../../domain/interfaces/player-adapter'
import { PlaybackState } from '../../domain/value-objects/playback-state'
import { TimePosition } from '../../domain/value-objects/time-position'
import type { PlaybackRate } from '../../domain/value-objects/playback-rate'
import { DEFAULT_PLAYBACK_RATE } from '../../domain/value-objects/playback-rate'

/**
 * YouTubePlayerAdapter
 *
 * Implements the PlayerAdapter interface for YouTube IFrame API.
 * Wraps the YouTube player with our domain interface.
 *
 * PATTERN: Adapter Pattern (GoF)
 * Converts the YouTube IFrame API interface to our PlayerAdapter interface.
 *
 * INVARIANTS:
 * - player is created on initialize()
 * - destroy() must be called to clean up resources
 * - Time update interval is 250ms
 *
 * GOTCHAS:
 * - YouTube API must be loaded before creating player
 * - onStateChange receives numbers, not strings
 * - No native timeupdate event, uses setInterval
 */
export class YouTubePlayerAdapter implements PlayerAdapter {
  private player: YT.Player | null = null
  private stateCallback: ((state: PlaybackState) => void) | null = null
  private timeCallback: ((position: TimePosition) => void) | null = null
  private errorCallback: ((error: Error) => void) | null = null
  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null
  private currentPlaybackRate: PlaybackRate = DEFAULT_PLAYBACK_RATE

  /**
   * Create a new YouTubePlayerAdapter
   *
   * @param elementId - DOM element ID where player will be created
   */
  constructor(private readonly elementId: string) {}

  // ============================================================
  // Initialization
  // ============================================================

  /**
   * Initialize the YouTube player with a video
   *
   * PRE: YouTube API is loaded (window.YT exists)
   * POST: Player is created and ready to use
   *
   * @param videoId - YouTube video ID
   * @returns Promise that resolves when player is ready
   */
  async initialize(videoId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.player = new YT.Player(this.elementId, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
          },
          events: {
            onReady: () => {
              this.startTimeUpdates()
              resolve()
            },
            onStateChange: (event) => this.handleStateChange(event),
            onError: (event) => this.handleError(event),
          },
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  // ============================================================
  // State Mapping
  // ============================================================

  /**
   * Handle state change events from YouTube
   */
  private handleStateChange(event: YT.OnStateChangeEvent): void {
    const state = this.mapYTState(event.data)
    this.stateCallback?.(state)
  }

  /**
   * Handle error events from YouTube
   */
  private handleError(event: YT.OnErrorEvent): void {
    const errorMessages: Record<number, string> = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found',
      101: 'Video not embeddable',
      150: 'Video not embeddable',
    }
    const message = errorMessages[event.data] || `YouTube error: ${event.data}`
    this.errorCallback?.(new Error(message))
  }

  /**
   * Map YouTube player state to PlaybackState
   *
   * YT.PlayerState values:
   * -1: UNSTARTED
   *  0: ENDED
   *  1: PLAYING
   *  2: PAUSED
   *  3: BUFFERING
   *  5: CUED
   */
  private mapYTState(ytState: number): PlaybackState {
    switch (ytState) {
      case YT.PlayerState.PLAYING:
        return PlaybackState.playing()
      case YT.PlayerState.PAUSED:
        return PlaybackState.paused()
      case YT.PlayerState.BUFFERING:
        return PlaybackState.buffering()
      case YT.PlayerState.ENDED:
        return PlaybackState.ended()
      default:
        // UNSTARTED (-1) and CUED (5) treated as paused
        return PlaybackState.paused()
    }
  }

  // ============================================================
  // Controls
  // ============================================================

  /**
   * Start video playback
   *
   * PRE: Player is initialized
   * POST: Video is playing
   */
  play(): void {
    this.player?.playVideo()
  }

  /**
   * Pause video playback
   *
   * PRE: Player is initialized
   * POST: Video is paused
   */
  pause(): void {
    this.player?.pauseVideo()
  }

  /**
   * Seek to specific time
   *
   * PRE: Player is initialized, seconds >= 0
   * POST: Video seeks to specified time
   *
   * @param seconds - Target time in seconds
   */
  seekTo(seconds: number): void {
    this.player?.seekTo(seconds, true)
  }

  /**
   * Set playback rate
   *
   * PRE: Player is initialized
   * POST: Playback rate is updated
   *
   * @param rate - Playback rate (0.5, 0.75, 1, 1.25, 1.5)
   */
  setPlaybackRate(rate: PlaybackRate): void {
    this.player?.setPlaybackRate(rate)
    this.currentPlaybackRate = rate
  }

  // ============================================================
  // State
  // ============================================================

  /**
   * Get current playback time in seconds
   *
   * @returns Current time in seconds, or 0 if not initialized
   */
  getCurrentTime(): number {
    return this.player?.getCurrentTime() ?? 0
  }

  /**
   * Get total video duration in seconds
   *
   * @returns Duration in seconds, or 0 if not initialized
   */
  getDuration(): number {
    return this.player?.getDuration() ?? 0
  }

  /**
   * Get current playback state
   *
   * @returns Current PlaybackState
   */
  getState(): PlaybackState {
    const ytState = this.player?.getPlayerState() ?? -1
    return this.mapYTState(ytState)
  }

  /**
   * Get current playback rate
   *
   * @returns Current PlaybackRate
   */
  getPlaybackRate(): PlaybackRate {
    return this.currentPlaybackRate
  }

  /**
   * Get current time position
   *
   * @returns TimePosition or null if not ready
   */
  getTimePosition(): TimePosition | null {
    const current = this.getCurrentTime()
    const duration = this.getDuration()

    if (duration <= 0) return null

    const result = TimePosition.create(current, duration)
    return result.isSuccess ? result.value : null
  }

  // ============================================================
  // Events
  // ============================================================

  /**
   * Register callback for state changes
   *
   * @param callback - Function to call when state changes
   */
  onStateChange(callback: (state: PlaybackState) => void): void {
    this.stateCallback = callback
  }

  /**
   * Register callback for time updates
   *
   * Called every 250ms while player is active.
   *
   * @param callback - Function to call with current position
   */
  onTimeUpdate(callback: (position: TimePosition) => void): void {
    this.timeCallback = callback
  }

  /**
   * Register callback for errors
   *
   * @param callback - Function to call when error occurs
   */
  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback
  }

  /**
   * Start the time update interval
   *
   * Emits time updates every 250ms for smooth UI updates.
   */
  private startTimeUpdates(): void {
    // Clear existing interval if any
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
    }

    this.timeUpdateInterval = setInterval(() => {
      if (this.player && this.timeCallback) {
        const position = this.getTimePosition()
        if (position) {
          this.timeCallback(position)
        }
      }
    }, 250) // 250ms interval for smooth updates
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  /**
   * Clean up player resources
   *
   * POST: Player is destroyed, intervals cleared, callbacks removed
   */
  destroy(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
      this.timeUpdateInterval = null
    }

    this.player?.destroy()
    this.player = null
    this.stateCallback = null
    this.timeCallback = null
    this.errorCallback = null
  }
}
