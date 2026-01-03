/**
 * PlaybackState Value Object
 *
 * Represents the playback state of a video player.
 * Value Objects are immutable and compared by value.
 *
 * INVARIANTS:
 * - state is always one of: playing, paused, buffering, ended
 * - Object is frozen (immutable)
 * - All transitions return new instances
 */

/**
 * Valid playback states
 */
export type PlaybackStateValue = 'playing' | 'paused' | 'buffering' | 'ended'

/**
 * PlaybackState Value Object
 *
 * Represents the current state of video playback.
 * Immutable - transitions return new instances.
 */
export class PlaybackState {
  /**
   * Private constructor enforces factory method usage
   */
  private constructor(readonly state: PlaybackStateValue) {
    Object.freeze(this)
  }

  // ============================================================
  // Factory Methods
  // ============================================================

  /**
   * Create playing state
   *
   * POST: Returns PlaybackState with state='playing'
   */
  static playing(): PlaybackState {
    return new PlaybackState('playing')
  }

  /**
   * Create paused state
   *
   * POST: Returns PlaybackState with state='paused'
   */
  static paused(): PlaybackState {
    return new PlaybackState('paused')
  }

  /**
   * Create buffering state
   *
   * POST: Returns PlaybackState with state='buffering'
   */
  static buffering(): PlaybackState {
    return new PlaybackState('buffering')
  }

  /**
   * Create ended state
   *
   * POST: Returns PlaybackState with state='ended'
   */
  static ended(): PlaybackState {
    return new PlaybackState('ended')
  }

  // ============================================================
  // State Checks
  // ============================================================

  /**
   * Check if currently playing
   */
  get isPlaying(): boolean {
    return this.state === 'playing'
  }

  /**
   * Check if currently paused
   */
  get isPaused(): boolean {
    return this.state === 'paused'
  }

  /**
   * Check if currently buffering
   */
  get isBuffering(): boolean {
    return this.state === 'buffering'
  }

  /**
   * Check if video has ended
   */
  get isEnded(): boolean {
    return this.state === 'ended'
  }

  // ============================================================
  // Transitions
  // ============================================================

  /**
   * Transition to playing state
   *
   * POST: Returns new PlaybackState with state='playing'
   */
  play(): PlaybackState {
    return PlaybackState.playing()
  }

  /**
   * Transition to paused state
   *
   * POST: Returns new PlaybackState with state='paused'
   */
  pause(): PlaybackState {
    return PlaybackState.paused()
  }

  /**
   * Transition to buffering state
   *
   * POST: Returns new PlaybackState with state='buffering'
   */
  buffer(): PlaybackState {
    return PlaybackState.buffering()
  }

  /**
   * Transition to ended state
   *
   * POST: Returns new PlaybackState with state='ended'
   */
  end(): PlaybackState {
    return PlaybackState.ended()
  }

  // ============================================================
  // Comparison
  // ============================================================

  /**
   * Compare two PlaybackState instances by value
   *
   * @param other - PlaybackState to compare with
   * @returns true if states are equal
   */
  equals(other: PlaybackState): boolean {
    return this.state === other.state
  }

  /**
   * Get string representation
   *
   * @returns The state string
   */
  toString(): string {
    return this.state
  }
}
