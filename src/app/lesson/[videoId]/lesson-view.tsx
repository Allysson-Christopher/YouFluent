'use client'

import { VideoPlayer } from '@/features/player/presentation/components/video-player'
import { usePlayerStore } from '@/features/player/presentation/stores/player-store'
import { LessonContent } from './lesson-content'
import { ExerciseSection } from './exercise-section'
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  X,
  Languages,
  Clock
} from 'lucide-react'

interface LessonViewProps {
  videoId: string
  transcriptId: string
  title: string
  totalChunks: number
}

/**
 * LessonView Component
 *
 * Main client component for the lesson page.
 * Split-screen layout with no scrolling:
 * - Top: Progress bar
 * - Left: Video + original text + navigation
 * - Right: Translation + Explanation + Vocabulary
 * - Bottom: Exercise (full width)
 */
export function LessonView({ videoId, transcriptId, title, totalChunks }: LessonViewProps) {
  const { chunks, activeChunkIndex, isPlaying, playCurrentChunk, nextChunk, previousChunk } = usePlayerStore()
  const currentChunk = chunks[activeChunkIndex]
  const progress = totalChunks > 0 ? ((activeChunkIndex + 1) / totalChunks) * 100 : 0

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-950 dark:to-blue-950/30">
      {/* Header with Progress */}
      <header className="flex-shrink-0 px-4 py-3 border-b bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">YF</span>
            </div>
            <span className="font-semibold text-lg hidden sm:block">YouFluent</span>
          </div>

          {/* Progress */}
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className="h-full progress-gradient rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${Math.max(progress, 2)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                {activeChunkIndex >= 0 ? activeChunkIndex + 1 : 0} / {totalChunks}
              </span>
            </div>
          </div>

          {/* Exit Button */}
          <a
            href="/"
            className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            <span>Sair</span>
          </a>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Side: Video + Navigation */}
        <div className="lg:w-1/2 flex flex-col p-4 gap-4">
          {/* Video Player */}
          <div className="relative rounded-2xl overflow-hidden shadow-xl bg-black">
            <VideoPlayer videoId={videoId} />
          </div>

          {/* Original Text (English) */}
          {currentChunk && (
            <div className="flex-shrink-0 p-4 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200 dark:border-slate-700 animate-fade-in-up">
              <div className="flex items-center gap-2 mb-2">
                <Languages className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Original
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(currentChunk.startTime)} - {formatTime(currentChunk.endTime)}</span>
                </div>
              </div>
              <p className="text-lg leading-relaxed font-medium">
                {currentChunk.text}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex-shrink-0 flex gap-2">
            <button
              onClick={previousChunk}
              disabled={activeChunkIndex <= 0}
              className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all
                bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
                flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <button
              onClick={playCurrentChunk}
              className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all
                bg-gradient-to-r from-blue-500 to-blue-600 text-white
                hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/25
                flex items-center justify-center gap-2"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              <span>{isPlaying ? 'Pausar' : 'Replay'}</span>
            </button>

            <button
              onClick={nextChunk}
              disabled={activeChunkIndex >= chunks.length - 1}
              className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all
                bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
                hover:bg-slate-50 dark:hover:bg-slate-700 hover:shadow-md
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
                flex items-center justify-center gap-2"
            >
              <span className="hidden sm:inline">Próximo</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Side: Lesson Content + Exercise */}
        <div className="lg:w-1/2 flex flex-col p-4 gap-4 overflow-y-auto no-scrollbar">
          <LessonContent transcriptId={transcriptId} />
          <ExerciseSection transcriptId={transcriptId} />
        </div>
      </div>
    </div>
  )
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
