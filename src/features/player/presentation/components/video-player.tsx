'use client'

import { useEffect, useRef } from 'react'
import { YouTubePlayerAdapter } from '../../infrastructure/adapters/youtube-player-adapter'
import { usePlayerStore } from '../stores/player-store'

/**
 * VideoPlayer Props
 */
interface VideoPlayerProps {
  /** YouTube video ID */
  videoId: string

  /** Called when player is ready */
  onReady?: () => void

  /** Called on time updates (every 250ms) */
  onTimeUpdate?: (seconds: number) => void

  /** Called when an error occurs */
  onError?: (error: Error) => void

  /** Additional CSS classes */
  className?: string
}

// ============================================================
// YouTube API Script Loading (Singleton)
// ============================================================

/** Whether the script is currently loading */
let isScriptLoading = false

/** Whether the script has finished loading */
let isScriptLoaded = false

/** Queue of callbacks waiting for script to load */
const pendingCallbacks: (() => void)[] = []

/**
 * Load the YouTube IFrame API script
 *
 * Uses singleton pattern to ensure script is only loaded once.
 * Multiple calls will queue callbacks to be resolved when ready.
 *
 * @returns Promise that resolves when API is ready
 */
function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    // Already loaded - resolve immediately
    if (isScriptLoaded && typeof window !== 'undefined' && window.YT) {
      resolve()
      return
    }

    // Add to pending callbacks
    pendingCallbacks.push(resolve)

    // Script is loading - wait for callback
    if (isScriptLoading) {
      return
    }

    isScriptLoading = true

    // Set up global callback (called by YouTube when ready)
    if (typeof window !== 'undefined') {
      window.onYouTubeIframeAPIReady = () => {
        isScriptLoaded = true
        isScriptLoading = false

        // Resolve all pending callbacks
        pendingCallbacks.forEach((cb) => cb())
        pendingCallbacks.length = 0
      }

      // Create and append script
      const script = document.createElement('script')
      script.src = 'https://www.youtube.com/iframe_api'
      script.async = true
      document.body.appendChild(script)
    }
  })
}

/**
 * VideoPlayer Component
 *
 * React component that wraps the YouTube IFrame API player.
 * Manages player lifecycle and syncs state with Zustand store.
 *
 * PATTERN: Client Component ('use client')
 * Must run on client to access window.YT and DOM.
 *
 * LIFECYCLE:
 * 1. Component mounts
 * 2. YouTube API script loads (singleton)
 * 3. YouTubePlayerAdapter initializes with videoId
 * 4. Callbacks sync state to Zustand store
 * 5. Component unmounts - adapter.destroy() called
 *
 * Usage:
 * ```tsx
 * <VideoPlayer
 *   videoId="dQw4w9WgXcQ"
 *   onReady={() => console.log('Ready!')}
 *   onTimeUpdate={(time) => console.log('Time:', time)}
 * />
 * ```
 */
export function VideoPlayer({
  videoId,
  onReady,
  onTimeUpdate,
  onError,
  className,
}: VideoPlayerProps) {
  const adapterRef = useRef<YouTubePlayerAdapter | null>(null)

  // Get store setters
  const {
    setAdapter,
    setPlaying,
    setCurrentTime,
    setDuration,
    setReady,
    setError,
    reset,
  } = usePlayerStore()

  // Unique element ID for this player instance
  const elementId = `youtube-player-${videoId}`

  // ============================================================
  // Player Initialization
  // ============================================================

  useEffect(() => {
    let isMounted = true

    const initPlayer = async () => {
      try {
        // Load YouTube API (singleton)
        await loadYouTubeAPI()

        // Check if still mounted
        if (!isMounted) return

        // Create adapter
        const adapter = new YouTubePlayerAdapter(elementId)

        // Set up callbacks BEFORE initialization
        adapter.onStateChange((state) => {
          if (isMounted) {
            setPlaying(state.isPlaying)
          }
        })

        adapter.onTimeUpdate((position) => {
          if (isMounted) {
            setCurrentTime(position.currentSeconds)
            setDuration(position.durationSeconds)
            onTimeUpdate?.(position.currentSeconds)
          }
        })

        adapter.onError((error) => {
          if (isMounted) {
            setError(error)
            onError?.(error)
          }
        })

        // Initialize player with video
        await adapter.initialize(videoId)

        // Check if still mounted after async init
        if (!isMounted) {
          adapter.destroy()
          return
        }

        // Store adapter reference
        adapterRef.current = adapter
        setAdapter(adapter)
        setReady(true)
        onReady?.()
      } catch (error) {
        if (isMounted) {
          const err = error instanceof Error ? error : new Error(String(error))
          setError(err)
          onError?.(err)
        }
      }
    }

    initPlayer()

    // Cleanup on unmount
    return () => {
      isMounted = false

      if (adapterRef.current) {
        adapterRef.current.destroy()
        adapterRef.current = null
      }

      reset()
    }
  }, [videoId, elementId, setAdapter, setPlaying, setCurrentTime, setDuration, setReady, setError, reset, onReady, onTimeUpdate, onError])

  // ============================================================
  // Render
  // ============================================================

  return (
    <div className={className} data-testid="video-player-container">
      <div
        id={elementId}
        className="aspect-video w-full"
        data-testid="youtube-player"
      />
    </div>
  )
}
