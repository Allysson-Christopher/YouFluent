import { notFound } from 'next/navigation'
import { fetchTranscriptAction } from './actions'
import { LessonProvider } from './lesson-provider'
import { LessonView } from './lesson-view'

interface LessonPageProps {
  params: Promise<{ videoId: string }>
}

/**
 * Lesson Page
 *
 * Redesigned with split-screen layout:
 * - No scrolling needed (100vh)
 * - Video on left, lesson content on right
 * - Exercise at bottom (full width)
 * - Progress bar at top
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
    throw new Error(result.error?.message || 'Failed to load transcript')
  }

  const { transcript } = result.data

  return (
    <LessonProvider data={result.data}>
      <LessonView
        videoId={videoId}
        transcriptId={transcript.id}
        title={transcript.title}
        totalChunks={transcript.chunks.length}
      />
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
