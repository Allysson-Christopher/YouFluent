'use client'

import { useEffect } from 'react'
import { usePlayerStore } from '@/features/player/presentation/stores/player-store'
import { Chunk } from '@/features/transcript/domain/entities/chunk'
import type { TranscriptActionResult } from './actions'

interface LessonProviderProps {
  data: NonNullable<TranscriptActionResult['data']>
  children: React.ReactNode
}

/**
 * LessonProvider Component
 *
 * Hydrates player store with transcript chunks.
 * Simplified for chunk-by-chunk lesson approach (like original Python version).
 */
export function LessonProvider({ data, children }: LessonProviderProps) {
  const setChunks = usePlayerStore((s) => s.setChunks)

  useEffect(() => {
    // Reconstruct chunks for player
    const chunks = data.transcript.chunks.map(c => {
      const chunkResult = Chunk.create({
        id: c.id,
        index: c.index,
        startTime: c.startTime,
        endTime: c.endTime,
        text: c.text,
      })
      return chunkResult.isSuccess ? chunkResult.value : null
    }).filter((c): c is Chunk => c !== null)

    setChunks(chunks)
  }, [data, setChunks])

  return <>{children}</>
}
