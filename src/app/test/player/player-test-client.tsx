'use client'

import { useEffect, useMemo } from 'react'
import { VideoPlayer, ChunkNavigator, usePlayerStore } from '@/features/player/presentation'
import { Chunk } from '@/features/transcript/domain/entities/chunk'

/**
 * Mock chunk data for testing ChunkNavigator
 */
const MOCK_CHUNK_DATA = [
  { id: '1', index: 0, startTime: 0, endTime: 30, text: 'Introduction to the topic and overview of what will be covered in this video.' },
  { id: '2', index: 1, startTime: 30, endTime: 60, text: 'First main point with detailed explanation and examples.' },
  { id: '3', index: 2, startTime: 60, endTime: 90, text: 'Second main point building on the previous concepts.' },
  { id: '4', index: 3, startTime: 90, endTime: 120, text: 'Third main point with practical applications.' },
  { id: '5', index: 4, startTime: 120, endTime: 150, text: 'Summary and conclusion of all the key takeaways.' },
]

interface PlayerTestClientProps {
  videoId: string
}

/**
 * PlayerTestClient Component
 *
 * Client-side wrapper for testing VideoPlayer and ChunkNavigator together.
 * Initializes mock chunks on mount.
 *
 * @param videoId - YouTube video ID
 */
export function PlayerTestClient({ videoId }: PlayerTestClientProps) {
  const setChunks = usePlayerStore((state) => state.setChunks)

  // Create Chunk instances from mock data
  const mockChunks = useMemo(() => {
    return MOCK_CHUNK_DATA.map((data) => {
      const result = Chunk.create(data)
      if (!result.isSuccess) {
        throw new Error(`Failed to create chunk: ${result.error}`)
      }
      return result.value
    })
  }, [])

  // Initialize mock chunks on mount
  useEffect(() => {
    setChunks(mockChunks)
  }, [setChunks, mockChunks])

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Player - Takes 2 columns on large screens */}
      <div className="lg:col-span-2">
        <VideoPlayer videoId={videoId} />
      </div>

      {/* Chunk Navigator - Takes 1 column on large screens */}
      <div className="lg:col-span-1">
        <div className="bg-card rounded-lg border p-4">
          <ChunkNavigator />
        </div>
      </div>
    </div>
  )
}
