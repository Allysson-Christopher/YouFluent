'use client'

import { usePlayerStore } from '../stores/player-store'
import { cn } from '@/shared/lib/utils'

/**
 * Format seconds to mm:ss display format
 *
 * @param seconds - Time in seconds
 * @returns Formatted time string (e.g., "1:30")
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * ChunkNavigator Component
 *
 * Displays a scrollable list of transcript chunks for video navigation.
 * Each chunk shows timestamp, index, and text preview.
 * The active chunk (based on current playback time) is highlighted.
 *
 * PATTERN: Client Component ('use client')
 * Uses Zustand store for state management.
 *
 * BEHAVIOR:
 * - Renders all chunks from the player store
 * - Highlights the active chunk with bg-primary
 * - Click on chunk seeks video to chunk start time
 * - Empty state when no chunks available
 *
 * Usage:
 * ```tsx
 * <ChunkNavigator />
 * ```
 */
export function ChunkNavigator() {
  // Use selectors to avoid unnecessary re-renders
  const chunks = usePlayerStore((state) => state.chunks)
  const activeChunkIndex = usePlayerStore((state) => state.activeChunkIndex)
  const seekToChunk = usePlayerStore((state) => state.seekToChunk)

  // Empty state
  if (chunks.length === 0) {
    return (
      <div
        className="text-muted-foreground text-sm p-4"
        data-testid="chunk-navigator-empty"
      >
        No chunks available
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2" data-testid="chunk-navigator">
      <h3 className="text-sm font-medium text-muted-foreground">
        Chunks ({chunks.length})
      </h3>

      <ul className="flex flex-col gap-1 max-h-96 overflow-y-auto">
        {chunks.map((chunk, index) => (
          <li key={chunk.id}>
            <button
              data-testid={`chunk-${index}`}
              onClick={() => seekToChunk(index)}
              className={cn(
                'w-full text-left p-3 rounded-md transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                index === activeChunkIndex && 'bg-primary text-primary-foreground'
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-xs">
                  {formatTime(chunk.startTime)} - {formatTime(chunk.endTime)}
                </span>
                <span className="text-xs opacity-70">
                  {index + 1}/{chunks.length}
                </span>
              </div>
              <p className="text-sm line-clamp-2">{chunk.text}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
