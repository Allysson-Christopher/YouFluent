'use client'

import { useEffect, useState } from 'react'
import { usePlayerStore } from '@/features/player/presentation/stores/player-store'

/**
 * Chunk lesson data from API
 */
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

/**
 * ChunkLessonPanel Component
 *
 * Displays lesson content for the current chunk:
 * - Portuguese translation
 * - Grammar/expression explanation
 * - Vocabulary (2-4 words)
 * - Exercise (1 multiple choice)
 *
 * Matches original Python version behavior.
 */
export function ChunkLessonPanel({ transcriptId }: { transcriptId: string }) {
  const { chunks, activeChunkIndex, isPlaying, playCurrentChunk, nextChunk, previousChunk } = usePlayerStore()

  const [lesson, setLesson] = useState<ChunkLessonData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  const currentChunk = chunks[activeChunkIndex]

  // Fetch lesson when chunk changes
  useEffect(() => {
    if (activeChunkIndex < 0 || !transcriptId) {
      setLesson(null)
      return
    }

    // Reset state for new chunk
    setSelectedAnswer(null)
    setShowResult(false)
    setError(null)

    const fetchLesson = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/chunk-lesson?transcriptId=${transcriptId}&chunkIndex=${activeChunkIndex}`)
        const data = await res.json()

        if (data.success) {
          setLesson(data.lesson)
        } else {
          setError(data.message || 'Failed to load lesson')
        }
      } catch (err) {
        setError('Failed to fetch lesson')
      } finally {
        setLoading(false)
      }
    }

    fetchLesson()
  }, [activeChunkIndex, transcriptId])

  const handleAnswerSelect = (index: number) => {
    if (showResult) return
    setSelectedAnswer(index)
  }

  const handleCheckAnswer = () => {
    if (selectedAnswer === null) return
    setShowResult(true)
  }

  const isCorrect = lesson?.exercise && selectedAnswer === lesson.exercise.correct

  // Show placeholder when no chunk selected
  if (activeChunkIndex < 0) {
    return (
      <div className="p-6 border rounded-lg bg-card">
        <p className="text-muted-foreground text-center">
          Clique em um chunk ou pressione Play para começar
        </p>
      </div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <div className="p-6 border rounded-lg bg-card">
        <div className="flex items-center justify-center gap-2">
          <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
          <span className="text-muted-foreground">Gerando lição...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 border rounded-lg bg-card">
        <p className="text-destructive text-center">{error}</p>
      </div>
    )
  }

  // No lesson yet
  if (!lesson) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Chunk Text (English) */}
      {currentChunk && (
        <div className="p-4 border rounded-lg bg-card">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            Chunk {activeChunkIndex + 1} de {chunks.length}
          </h3>
          <p className="text-lg font-medium">{currentChunk.text}</p>
        </div>
      )}

      {/* Translation (Portuguese) */}
      <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-950">
        <h3 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
          📝 Tradução
        </h3>
        <p className="text-blue-900 dark:text-blue-100">{lesson.translation}</p>
      </div>

      {/* Explanation */}
      <div className="p-4 border rounded-lg bg-yellow-50 dark:bg-yellow-950">
        <h3 className="text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
          💡 Explicação
        </h3>
        <p className="text-yellow-900 dark:text-yellow-100">{lesson.explanation}</p>
      </div>

      {/* Vocabulary */}
      <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
        <h3 className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
          📚 Vocabulário
        </h3>
        <ul className="space-y-1">
          {lesson.vocabulary.map((item, idx) => (
            <li key={idx} className="text-green-900 dark:text-green-100">
              <span className="font-medium">{item.word}</span>
              <span className="text-green-600 dark:text-green-400"> — {item.meaning}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Exercise */}
      {lesson.exercise && (
        <div className="p-4 border rounded-lg bg-purple-50 dark:bg-purple-950">
          <h3 className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
            ❓ Exercício
          </h3>
          <p className="text-purple-900 dark:text-purple-100 mb-3">{lesson.exercise.question}</p>

          <div className="space-y-2">
            {lesson.exercise.options.map((option, idx) => {
              let bgClass = 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'

              if (showResult) {
                if (idx === lesson.exercise!.correct) {
                  bgClass = 'bg-green-200 dark:bg-green-800'
                } else if (idx === selectedAnswer) {
                  bgClass = 'bg-red-200 dark:bg-red-800'
                }
              } else if (idx === selectedAnswer) {
                bgClass = 'bg-purple-200 dark:bg-purple-800'
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(idx)}
                  disabled={showResult}
                  className={`w-full text-left p-3 rounded border ${bgClass} transition-colors`}
                >
                  <span className="font-medium mr-2">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                </button>
              )
            })}
          </div>

          {!showResult && selectedAnswer !== null && (
            <button
              onClick={handleCheckAnswer}
              className="mt-3 w-full py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Verificar Resposta
            </button>
          )}

          {showResult && (
            <div className={`mt-3 p-3 rounded ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isCorrect ? '✅ Correto! Muito bem!' : '❌ Incorreto. Tente novamente no próximo chunk.'}
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-2">
        <button
          onClick={previousChunk}
          disabled={activeChunkIndex <= 0}
          className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ⬅️ Anterior
        </button>
        <button
          onClick={playCurrentChunk}
          className="flex-1 py-3 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isPlaying ? '⏸️ Pausar' : '▶️ Replay'}
        </button>
        <button
          onClick={nextChunk}
          disabled={activeChunkIndex >= chunks.length - 1}
          className="flex-1 py-3 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Próximo ➡️
        </button>
      </div>
    </div>
  )
}
