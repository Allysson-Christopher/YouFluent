'use client'

import { create } from 'zustand'
import type { PlayerAdapter, PlaybackRate } from '../../domain'
import { DEFAULT_PLAYBACK_RATE } from '../../domain'
import type { Chunk } from '@/features/transcript/domain/entities/chunk'

/**
 * Player Store State Interface
 *
 * Manages the state of the video player across the application.
 * Uses Zustand for lightweight, performant state management.
 *
 * INVARIANTS:
 * - currentTime >= 0
 * - duration >= 0
 * - playbackRate is one of: 0.5, 0.75, 1, 1.25, 1.5
 */
interface PlayerStoreState {
  // ============================================================
  // State
  // ============================================================

  /** Reference to the player adapter (YouTubePlayerAdapter) */
  adapter: PlayerAdapter | null

  /** Whether video is currently playing */
  isPlaying: boolean

  /** Current playback time in seconds */
  currentTime: number

  /** Total video duration in seconds */
  duration: number

  /** Current playback rate */
  playbackRate: PlaybackRate

  /** Whether player is initialized and ready */
  isReady: boolean

  /** Current error, if any */
  error: Error | null

  /** Chunks for navigation (from transcript) */
  chunks: Chunk[]

  /** Index of the currently active chunk (-1 if none) */
  activeChunkIndex: number

  // ============================================================
  // Setters
  // ============================================================

  /** Set the player adapter */
  setAdapter: (adapter: PlayerAdapter) => void

  /** Set playing state */
  setPlaying: (playing: boolean) => void

  /** Set current time */
  setCurrentTime: (time: number) => void

  /** Set duration */
  setDuration: (duration: number) => void

  /** Set playback rate */
  setPlaybackRate: (rate: PlaybackRate) => void

  /** Set ready state */
  setReady: (ready: boolean) => void

  /** Set error */
  setError: (error: Error | null) => void

  /** Set chunks for navigation */
  setChunks: (chunks: Chunk[]) => void

  /** Reset store to initial state */
  reset: () => void

  // ============================================================
  // Actions (delegate to adapter)
  // ============================================================

  /** Start playback */
  play: () => void

  /** Pause playback */
  pause: () => void

  /** Seek to specific time */
  seekTo: (seconds: number) => void

  /** Change playback rate */
  changePlaybackRate: (rate: PlaybackRate) => void

  /** Seek to a specific chunk by index */
  seekToChunk: (index: number) => void
}

/**
 * Initial state values
 */
const initialState = {
  adapter: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: DEFAULT_PLAYBACK_RATE,
  isReady: false,
  error: null,
  chunks: [] as Chunk[],
  activeChunkIndex: -1,
}

/**
 * Player Store
 *
 * Zustand store for managing video player state.
 * Provides actions that delegate to the PlayerAdapter.
 *
 * Usage:
 * ```tsx
 * const { isPlaying, play, pause } = usePlayerStore()
 * ```
 */
export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  // Initial state
  ...initialState,

  // ============================================================
  // Setters
  // ============================================================

  setAdapter: (adapter) => set({ adapter }),

  setPlaying: (isPlaying) => set({ isPlaying }),

  setCurrentTime: (currentTime) => {
    const { chunks } = get()
    let activeChunkIndex = -1

    if (chunks.length > 0) {
      activeChunkIndex = chunks.findIndex(
        (chunk) => currentTime >= chunk.startTime && currentTime < chunk.endTime
      )
    }

    set({ currentTime, activeChunkIndex })
  },

  setDuration: (duration) => set({ duration }),

  setPlaybackRate: (playbackRate) => set({ playbackRate }),

  setReady: (isReady) => set({ isReady }),

  setError: (error) => set({ error }),

  setChunks: (chunks) => set({ chunks, activeChunkIndex: -1 }),

  reset: () => set(initialState),

  // ============================================================
  // Actions
  // ============================================================

  play: () => {
    const { adapter } = get()
    adapter?.play()
  },

  pause: () => {
    const { adapter } = get()
    adapter?.pause()
  },

  seekTo: (seconds) => {
    const { adapter } = get()
    adapter?.seekTo(seconds)
  },

  changePlaybackRate: (rate) => {
    const { adapter } = get()
    adapter?.setPlaybackRate(rate)
    set({ playbackRate: rate })
  },

  seekToChunk: (index) => {
    const { chunks, adapter } = get()
    const chunk = chunks[index]

    if (chunk && adapter) {
      adapter.seekTo(chunk.startTime)
      set({ activeChunkIndex: index })
    }
  },
}))
