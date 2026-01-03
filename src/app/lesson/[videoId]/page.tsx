import { notFound } from 'next/navigation'
import { VideoPlayer } from '@/features/player/presentation/components/video-player'
import { ChunkNavigator } from '@/features/player/presentation/components/chunk-navigator'
import { LessonCard } from '@/features/lesson/presentation/components/lesson-card'
import { ExercisePanel } from '@/features/lesson/presentation/components/exercise-panel'
import { VocabularyList } from '@/features/lesson/presentation/components/vocabulary-list'
import { generateLesson } from './actions'
import { LessonProvider } from './lesson-provider'

interface LessonPageProps {
  params: Promise<{ videoId: string }>
  searchParams: Promise<{ difficulty?: string }>
}

/**
 * Lesson Page
 *
 * Server Component that fetches/generates lesson data.
 * Renders integrated layout with all lesson components.
 *
 * Route: /lesson/[videoId]?difficulty=easy|medium|hard
 */
export default async function LessonPage({
  params,
  searchParams,
}: LessonPageProps) {
  const { videoId } = await params
  const { difficulty = 'medium' } = await searchParams

  // Validate videoId format (11 chars)
  if (!videoId || videoId.length !== 11) {
    notFound()
  }

  // Generate or fetch lesson via server action
  const result = await generateLesson(videoId, difficulty)

  if (!result.success || !result.data) {
    // Let error.tsx handle this
    throw new Error(result.error?.message || 'Failed to load lesson')
  }

  return (
    <LessonProvider data={result.data}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content - Player + Exercises (2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="rounded-lg overflow-hidden border bg-card">
              <VideoPlayer videoId={videoId} />
            </div>

            {/* Lesson Summary */}
            <LessonCard />

            {/* Exercise Panel */}
            <ExercisePanel />
          </div>

          {/* Sidebar - Chunks + Vocabulary (1 column on desktop) */}
          <div className="space-y-6">
            {/* Chunk Navigator */}
            <div className="p-4 border rounded-lg bg-card">
              <ChunkNavigator />
            </div>

            {/* Vocabulary List */}
            <VocabularyList />
          </div>
        </div>
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
    description: 'Interactive English lesson with exercises and vocabulary',
  }
}
