import { Suspense } from 'react'
import { VideoPlayer } from '@/features/player/presentation'

/**
 * Test Player Page Props
 */
interface PageProps {
  searchParams: Promise<{ videoId?: string }>
}

/**
 * Test Player Page
 *
 * Development-only page for testing the VideoPlayer component.
 * Access at: /test/player?videoId=<youtube-video-id>
 *
 * Example: /test/player?videoId=dQw4w9WgXcQ
 */
export default async function TestPlayerPage({ searchParams }: PageProps) {
  const { videoId } = await searchParams

  if (!videoId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">
          Missing videoId parameter
        </h1>
        <p className="mt-2 text-gray-600">
          Usage: /test/player?videoId=dQw4w9WgXcQ
        </p>
        <p className="mt-4 text-sm text-gray-500">
          Provide a YouTube video ID as a query parameter to test the player.
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Video Player Test</h1>
      <p className="text-gray-600 mb-4">
        Testing video ID: <code className="bg-gray-100 px-2 py-1 rounded">{videoId}</code>
      </p>
      <div className="max-w-3xl">
        <Suspense fallback={<div className="aspect-video w-full bg-gray-200 animate-pulse rounded" />}>
          <VideoPlayer videoId={videoId} />
        </Suspense>
      </div>
      <div className="mt-4 text-sm text-gray-500">
        <p>Controls are provided by YouTube player.</p>
        <p>Player state is managed by Zustand store.</p>
      </div>
    </div>
  )
}
