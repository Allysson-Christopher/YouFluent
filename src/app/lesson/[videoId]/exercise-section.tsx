'use client'

import { useEffect, useState } from 'react'
import { usePlayerStore } from '@/features/player/presentation/stores/player-store'
import {
  Target,
  Check,
  X,
  ChevronRight,
  Trophy,
  PartyPopper,
  CircleX
} from 'lucide-react'

interface ExerciseData {
  question: string
  options: string[]
  correct: number
}

interface ExerciseSectionProps {
  transcriptId: string
}

/**
 * ExerciseSection Component
 *
 * Displays interactive multiple-choice exercise for the current chunk.
 * Reads exercise data from window.__currentLesson set by LessonContent.
 */
export function ExerciseSection({ transcriptId }: ExerciseSectionProps) {
  const { activeChunkIndex, nextChunk, chunks } = usePlayerStore()
  const [exercise, setExercise] = useState<ExerciseData | null>(null)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  // Get exercise from window.__currentLesson
  useEffect(() => {
    const checkLesson = () => {
      const lesson = (window as Window & { __currentLesson?: { exercise: ExerciseData | null } }).__currentLesson
      if (lesson?.exercise) {
        setExercise(lesson.exercise)
        setSelectedOption(null)
        setShowResult(false)
      } else {
        setExercise(null)
      }
    }

    // Check immediately and on interval (for when lesson loads after)
    checkLesson()
    const interval = setInterval(checkLesson, 500)

    return () => clearInterval(interval)
  }, [activeChunkIndex])

  // Reset state when chunk changes
  useEffect(() => {
    setSelectedOption(null)
    setShowResult(false)
  }, [activeChunkIndex])

  const handleOptionClick = (index: number) => {
    if (showResult) return
    setSelectedOption(index)
  }

  const handleCheckAnswer = () => {
    if (selectedOption === null) return
    setShowResult(true)
  }

  const handleNextChunk = () => {
    nextChunk()
  }

  const isCorrect = selectedOption === exercise?.correct
  const isLastChunk = activeChunkIndex >= chunks.length - 1

  // No exercise placeholder
  if (activeChunkIndex < 0) {
    return null
  }

  if (!exercise) {
    return (
      <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse">
        <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
          <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="lesson-card p-5 rounded-2xl bg-gradient-to-br from-purple-50 to-violet-100/50 dark:from-purple-950/50 dark:to-violet-900/30 border border-purple-200/50 dark:border-purple-800/50 shadow-sm animate-fade-in-up delay-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
          Exercício
        </span>
      </div>

      {/* Question */}
      <p className="text-base font-medium text-purple-900 dark:text-purple-100 mb-4">
        {exercise.question}
      </p>

      {/* Options */}
      <div className="grid gap-2 mb-4">
        {exercise.options.map((option, idx) => {
          let optionClasses = 'p-3 rounded-xl border-2 transition-all cursor-pointer text-left '

          if (showResult) {
            if (idx === exercise.correct) {
              // Correct answer
              optionClasses += 'border-emerald-500 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-200'
            } else if (idx === selectedOption && !isCorrect) {
              // Wrong selection
              optionClasses += 'border-red-500 bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200'
            } else {
              // Other options
              optionClasses += 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 opacity-50'
            }
          } else {
            if (idx === selectedOption) {
              // Selected
              optionClasses += 'border-purple-500 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-200 shadow-md'
            } else {
              // Unselected
              optionClasses += 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:border-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-slate-700 dark:text-slate-300'
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleOptionClick(idx)}
              disabled={showResult}
              className={optionClasses}
            >
              <span className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-200 dark:bg-purple-800 flex items-center justify-center text-xs font-bold text-purple-700 dark:text-purple-300">
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="flex-1">{option}</span>
                {showResult && idx === exercise.correct && (
                  <Check className="w-5 h-5 text-emerald-600" />
                )}
                {showResult && idx === selectedOption && !isCorrect && (
                  <X className="w-5 h-5 text-red-600" />
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        {!showResult ? (
          <button
            onClick={handleCheckAnswer}
            disabled={selectedOption === null}
            className="flex-1 py-3 px-4 rounded-xl font-semibold transition-all
              bg-gradient-to-r from-purple-500 to-purple-600 text-white
              hover:from-purple-600 hover:to-purple-700 hover:shadow-lg hover:shadow-purple-500/25
              disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            Verificar Resposta
          </button>
        ) : (
          <>
            {/* Result Message */}
            <div className={`flex-1 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
              isCorrect
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300'
                : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
            }`}>
              {isCorrect ? (
                <>
                  <PartyPopper className="w-5 h-5" />
                  <span>Correto!</span>
                </>
              ) : (
                <>
                  <CircleX className="w-5 h-5" />
                  <span>Tente novamente no próximo!</span>
                </>
              )}
            </div>

            {/* Next Button */}
            {!isLastChunk && (
              <button
                onClick={handleNextChunk}
                className="py-3 px-6 rounded-xl font-semibold transition-all
                  bg-gradient-to-r from-blue-500 to-blue-600 text-white
                  hover:from-blue-600 hover:to-blue-700 hover:shadow-lg hover:shadow-blue-500/25
                  flex items-center gap-2"
              >
                <span>Próximo</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Completion Message */}
            {isLastChunk && isCorrect && (
              <div className="py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40 text-amber-700 dark:text-amber-300">
                <Trophy className="w-5 h-5" />
                <span>Parabéns! Lição concluída!</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
