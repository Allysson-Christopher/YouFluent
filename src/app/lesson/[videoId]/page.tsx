import { notFound } from 'next/navigation'
import { VideoPlayer } from '@/features/player/presentation/components/video-player'
import { ChunkLessonPanel } from '@/features/lesson/presentation/components/chunk-lesson-panel'
import { fetchTranscriptAction } from './actions'
import { LessonProvider } from './lesson-provider'

interface LessonPageProps {
  params: Promise<{ videoId: string }>
}

/**
 * Lesson Page
 *
 * Simplified layout matching original Python version:
 * - Video player on top
 * - Chunk lesson content below (translation, explanation, vocabulary, exercise)
 * - Auto-pause at chunk end
 * - Navigation buttons (previous/replay/next)
 *
 * Route: /lesson/[videoId]
 */
export default async function LessonPage({ params }: LessonPageProps) {
  const { videoId } = await params

  // Validate videoId format (11 chars)
  if (!videoId || videoId.length !== 11) {
    notFound()
  }

  // Fetch transcript via server action
  const result = await fetchTranscriptAction(videoId)

  if (!result.success || !result.data) {
    // Let error.tsx handle this
    throw new Error(result.error?.message || 'Failed to load transcript')
  }

  const { transcript } = result.data

  return (
    <LessonProvider data={result.data}>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Video Title */}
        <h1 className="text-2xl font-bold mb-4">{transcript.title}</h1>

        {/* Video Player */}
        <div className="rounded-lg overflow-hidden border bg-card mb-6">
          <VideoPlayer videoId={videoId} />
        </div>

        {/* Chunk Lesson Content */}
        <ChunkLessonPanel transcriptId={transcript.id} />
      </div>
    </LessonProvider>
  )
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: LessonPageProps) {
  const { videoId } = await params

  return {
    title: `Lesson - ${videoId} | YouFluent`,
    description: 'Learn English with YouTube videos - interactive lessons with translation and exercises',
  }
}
