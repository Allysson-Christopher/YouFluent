/**
 * YouTube IFrame API Type Definitions
 *
 * Type declarations for the YouTube IFrame Player API.
 * Reference: https://developers.google.com/youtube/iframe_api_reference
 */

declare namespace YT {
  /**
   * YouTube Player class
   *
   * Main entry point for controlling embedded YouTube videos.
   */
  class Player {
    /**
     * Creates a new YouTube player
     *
     * @param elementId - ID of the DOM element to replace with player
     * @param options - Player configuration options
     */
    constructor(elementId: string, options: PlayerOptions)

    // ============================================================
    // Playback Controls
    // ============================================================

    /** Start video playback */
    playVideo(): void

    /** Pause video playback */
    pauseVideo(): void

    /** Stop video playback and reset to beginning */
    stopVideo(): void

    /**
     * Seek to a specific time
     *
     * @param seconds - Target time in seconds
     * @param allowSeekAhead - Whether to make new request if seeking beyond buffered data
     */
    seekTo(seconds: number, allowSeekAhead: boolean): void

    /**
     * Set playback speed
     *
     * @param suggestedRate - Playback rate (0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2)
     */
    setPlaybackRate(suggestedRate: number): void

    // ============================================================
    // State Getters
    // ============================================================

    /** Get current playback time in seconds */
    getCurrentTime(): number

    /** Get total video duration in seconds */
    getDuration(): number

    /** Get current player state (-1, 0, 1, 2, 3, 5) */
    getPlayerState(): number

    /** Get current playback rate */
    getPlaybackRate(): number

    /** Get available playback rates for current video */
    getAvailablePlaybackRates(): number[]

    // ============================================================
    // Volume Controls
    // ============================================================

    /** Mute the player */
    mute(): void

    /** Unmute the player */
    unMute(): void

    /** Check if player is muted */
    isMuted(): boolean

    /**
     * Set volume
     *
     * @param volume - Volume level (0-100)
     */
    setVolume(volume: number): void

    /** Get current volume (0-100) */
    getVolume(): number

    // ============================================================
    // Video Information
    // ============================================================

    /** Get current video URL */
    getVideoUrl(): string

    /** Get video embed code */
    getVideoEmbedCode(): string

    // ============================================================
    // Lifecycle
    // ============================================================

    /** Destroy the player instance and clean up */
    destroy(): void
  }

  /**
   * Player constructor options
   */
  interface PlayerOptions {
    /** YouTube video ID to load */
    videoId?: string

    /** Player width in pixels or percentage */
    width?: number | string

    /** Player height in pixels or percentage */
    height?: number | string

    /** Player behavior parameters */
    playerVars?: PlayerVars

    /** Event handlers */
    events?: PlayerEvents
  }

  /**
   * Player behavior parameters
   *
   * Reference: https://developers.google.com/youtube/player_parameters
   */
  interface PlayerVars {
    /** Autoplay on load (0 or 1) */
    autoplay?: 0 | 1

    /** Show player controls (0 or 1) */
    controls?: 0 | 1

    /** Hide YouTube logo (0 or 1) */
    modestbranding?: 0 | 1

    /** Show related videos from same channel only (0 or 1) */
    rel?: 0 | 1

    /** Start time in seconds */
    start?: number

    /** End time in seconds */
    end?: number

    /** Enable fullscreen button (0 or 1) */
    fs?: 0 | 1

    /** Interface language (ISO 639-1 code) */
    hl?: string

    /** Keyboard controls (0 or 1) */
    disablekb?: 0 | 1

    /** Play inline on iOS (0 or 1) */
    playsinline?: 0 | 1

    /** Enable JavaScript API (0 or 1) */
    enablejsapi?: 0 | 1

    /** Origin domain for API security */
    origin?: string
  }

  /**
   * Player event handlers
   */
  interface PlayerEvents {
    /** Called when player finishes loading and is ready */
    onReady?: (event: PlayerEvent) => void

    /** Called when player state changes */
    onStateChange?: (event: OnStateChangeEvent) => void

    /** Called when playback quality changes */
    onPlaybackQualityChange?: (event: PlayerEvent) => void

    /** Called when playback rate changes */
    onPlaybackRateChange?: (event: PlayerEvent) => void

    /** Called when an error occurs */
    onError?: (event: OnErrorEvent) => void

    /** Called when API is ready to receive calls */
    onApiChange?: (event: PlayerEvent) => void
  }

  /**
   * Base player event
   */
  interface PlayerEvent {
    /** The player that fired the event */
    target: Player
  }

  /**
   * State change event
   */
  interface OnStateChangeEvent extends PlayerEvent {
    /** New player state value */
    data: number
  }

  /**
   * Error event
   */
  interface OnErrorEvent extends PlayerEvent {
    /**
     * Error code:
     * 2 - Invalid video ID
     * 5 - HTML5 player error
     * 100 - Video not found
     * 101 - Video not embeddable
     * 150 - Video not embeddable (same as 101)
     */
    data: number
  }

  /**
   * Player state enum values
   */
  const PlayerState: {
    /** Player has not started (-1) */
    readonly UNSTARTED: -1
    /** Video has ended (0) */
    readonly ENDED: 0
    /** Video is playing (1) */
    readonly PLAYING: 1
    /** Video is paused (2) */
    readonly PAUSED: 2
    /** Video is buffering (3) */
    readonly BUFFERING: 3
    /** Video is cued (5) */
    readonly CUED: 5
  }
}

/**
 * Window augmentation for YouTube API
 */
interface Window {
  /** YouTube API namespace (available after script loads) */
  YT: typeof YT

  /**
   * Callback called by YouTube when IFrame API is ready
   *
   * Set this before loading the YouTube IFrame API script.
   * Will be called once the API is fully loaded and ready to use.
   */
  onYouTubeIframeAPIReady: () => void
}
