'use client'

import { usePlayerStore } from '../stores/player-store'

/**
 * usePlayer Hook
 *
 * Provides a simplified interface to the player store.
 * Use this hook in components that need player state and controls.
 *
 * PATTERN: Facade Pattern
 * Provides a simplified interface to the player store.
 *
 * Usage:
 * ```tsx
 * function PlayerControls() {
 *   const { isPlaying, toggle, setPlaybackRate } = usePlayer()
 *
 *   return (
 *     <button onClick={toggle}>
 *       {isPlaying ? 'Pause' : 'Play'}
 *     </button>
 *   )
 * }
 * ```
 */
export function usePlayer() {
  const store = usePlayerStore()

  return {
    // ============================================================
    // State
    // ============================================================

    /** Whether video is currently playing */
    isPlaying: store.isPlaying,

    /** Current playback time in seconds */
    currentTime: store.currentTime,

    /** Total video duration in seconds */
    duration: store.duration,

    /** Current playback rate */
    playbackRate: store.playbackRate,

    /** Whether player is ready */
    isReady: store.isReady,

    /** Current error, if any */
    error: store.error,

    // ============================================================
    // Computed
    // ============================================================

    /**
     * Progress as percentage (0-100)
     */
    progress: store.duration > 0
      ? (store.currentTime / store.duration) * 100
      : 0,

    /**
     * Formatted current time (MM:SS)
     */
    formattedCurrentTime: formatTime(store.currentTime),

    /**
     * Formatted duration (MM:SS)
     */
    formattedDuration: formatTime(store.duration),

    /**
     * Formatted remaining time (MM:SS)
     */
    formattedRemaining: formatTime(store.duration - store.currentTime),

    // ============================================================
    // Actions
    // ============================================================

    /** Start playback */
    play: store.play,

    /** Pause playback */
    pause: store.pause,

    /**
     * Toggle play/pause
     */
    toggle: () => {
      if (store.isPlaying) {
        store.pause()
      } else {
        store.play()
      }
    },

    /** Seek to specific time */
    seekTo: store.seekTo,

    /** Change playback rate */
    setPlaybackRate: store.changePlaybackRate,
  }
}

/**
 * Format seconds as MM:SS
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string
 */
function formatTime(seconds: number): string {
  const totalSeconds = Math.floor(Math.max(0, seconds))
  const minutes = Math.floor(totalSeconds / 60)
  const secs = totalSeconds % 60
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
