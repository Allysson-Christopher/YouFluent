'use client'

import { useEffect, useState } from 'react'
import { usePlayerStore } from '@/features/player/presentation/stores/player-store'
import {
  FileText,
  Lightbulb,
  BookOpen,
  PlayCircle,
  ArrowRight,
  AlertCircle
} from 'lucide-react'

interface ChunkLessonData {
  translation: string
  explanation: string
  vocabulary: Array<{ word: string; meaning: string }>
  exercise: {
    question: string
    options: string[]
    correct: number
  } | null
}

interface LessonContentProps {
  transcriptId: string
}

/**
 * LessonContent Component
 *
 * Displays Translation, Explanation, and Vocabulary for the current chunk.
 * Fetches lesson data from API when chunk changes.
 */
export function LessonContent({ transcriptId }: LessonContentProps) {
  const { activeChunkIndex } = usePlayerStore()
  const [lesson, setLesson] = useState<ChunkLessonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch lesson when chunk changes
  useEffect(() => {
    if (activeChunkIndex < 0 || !transcriptId) {
      setLesson(null)
      return
    }

    const fetchLesson = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/chunk-lesson?transcriptId=${transcriptId}&chunkIndex=${activeChunkIndex}`)
        const data = await res.json()

        if (data.success) {
          setLesson(data.lesson)
        } else {
          setError(data.message || 'Erro ao carregar lição')
        }
      } catch {
        setError('Erro de conexão')
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [activeChunkIndex, transcriptId])

  // Store lesson in window for ExerciseSection to access
  useEffect(() => {
    if (lesson) {
      (window as Window & { __currentLesson?: ChunkLessonData }).__currentLesson = lesson
    }
  }, [lesson])

  // Placeholder state
  if (activeChunkIndex < 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center p-8 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-dashed border-slate-300 dark:border-slate-600">
          <PlayCircle className="w-12 h-12 mx-auto mb-3 text-blue-500" />
          <p className="text-lg font-medium text-muted-foreground">
            Clique <span className="text-blue-600 font-semibold">Play</span> para começar
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            O vídeo pausará automaticamente a cada chunk
          </p>
        </div>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="space-y-4">
        <LoadingCard />
        <LoadingCard />
        <LoadingCard />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
        <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
      </div>
    )
  }

  if (!lesson) return null

  return (
    <div className="space-y-4">
      {/* Translation Card */}
      <div className="lesson-card p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30 border border-blue-200/50 dark:border-blue-800/50 shadow-sm animate-fade-in-up">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Tradução
          </span>
        </div>
        <p className="text-base leading-relaxed text-blue-900 dark:text-blue-100">
          {lesson.translation}
        </p>
      </div>

      {/* Explanation Card */}
      <div className="lesson-card p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100/50 dark:from-amber-950/50 dark:to-orange-900/30 border border-amber-200/50 dark:border-amber-800/50 shadow-sm animate-fade-in-up delay-100">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">
            Explicação
          </span>
        </div>
        <p className="text-base leading-relaxed text-amber-900 dark:text-amber-100">
          {lesson.explanation}
        </p>
      </div>

      {/* Vocabulary Card */}
      <div className="lesson-card p-5 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100/50 dark:from-emerald-950/50 dark:to-green-900/30 border border-emerald-200/50 dark:border-emerald-800/50 shadow-sm animate-fade-in-up delay-200">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
            Vocabulário
          </span>
        </div>
        <div className="grid gap-2">
          {lesson.vocabulary.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-emerald-900/20"
            >
              <span className="font-semibold text-emerald-800 dark:text-emerald-200">
                {item.word}
              </span>
              <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-emerald-700 dark:text-emerald-300">
                {item.meaning}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse">
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
      </div>
    </div>
  )
}
