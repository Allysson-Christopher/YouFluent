'use client'

import { create } from 'zustand'
import type { Lesson } from '../../domain/entities/lesson'
import type { Exercise } from '../../domain/entities/exercise'

/**
 * Lesson Store State Interface
 *
 * Manages the state of the lesson session across the application.
 * Uses Zustand for lightweight, performant state management.
 *
 * INVARIANTS:
 * - currentExerciseIndex >= 0
 * - score >= 0
 * - answers Map keys are exercise IDs
 */
interface LessonStoreState {
  // ============================================================
  // State
  // ============================================================

  /** Reference to the current lesson */
  lesson: Lesson | null

  /** Index of current exercise */
  currentExerciseIndex: number

  /** Map of exercise ID to user's answer */
  answers: Map<string, string>

  /** Number of correct answers */
  score: number

  /** Whether lesson is complete */
  isComplete: boolean

  // ============================================================
  // Setters
  // ============================================================

  /** Set the lesson and reset state */
  setLesson: (lesson: Lesson) => void

  /** Reset store to initial state */
  reset: () => void

  // ============================================================
  // Actions
  // ============================================================

  /** Submit an answer for an exercise */
  submitAnswer: (exerciseId: string, answer: string) => void

  /** Move to next exercise */
  nextExercise: () => void

  /** Move to previous exercise */
  previousExercise: () => void

  // ============================================================
  // Computed (as functions)
  // ============================================================

  /** Get the current exercise */
  getCurrentExercise: () => Exercise | null

  /** Get progress as percentage */
  getProgress: () => number

  /** Check if an answer is correct */
  isAnswerCorrect: (exerciseId: string) => boolean | null
}

/**
 * Initial state values
 */
const initialState = {
  lesson: null as Lesson | null,
  currentExerciseIndex: 0,
  answers: new Map<string, string>(),
  score: 0,
  isComplete: false,
}

/**
 * Lesson Store
 *
 * Zustand store for managing lesson session state.
 * Tracks exercise progress, answers, and scoring.
 *
 * Usage:
 * ```tsx
 * const lesson = useLessonStore(s => s.lesson)
 * const submitAnswer = useLessonStore(s => s.submitAnswer)
 * ```
 */
export const useLessonStore = create<LessonStoreState>((set, get) => ({
  // Initial state
  ...initialState,

  // ============================================================
  // Setters
  // ============================================================

  setLesson: (lesson) =>
    set({
      lesson,
      currentExerciseIndex: 0,
      answers: new Map(),
      score: 0,
      isComplete: false,
    }),

  reset: () =>
    set({
      ...initialState,
      answers: new Map<string, string>(),
    }),

  // ============================================================
  // Actions
  // ============================================================

  submitAnswer: (exerciseId, answer) => {
    const { lesson, answers, score } = get()
    const exercise = lesson?.exercises.find((e) => e.id === exerciseId)

    if (!exercise) return

    const newAnswers = new Map(answers)
    newAnswers.set(exerciseId, answer)

    const isCorrect = exercise.checkAnswer(answer)

    set({
      answers: newAnswers,
      score: isCorrect ? score + 1 : score,
    })
  },

  nextExercise: () => {
    const { currentExerciseIndex, lesson } = get()
    const maxIndex = (lesson?.exercises.length ?? 1) - 1

    if (currentExerciseIndex < maxIndex) {
      set({ currentExerciseIndex: currentExerciseIndex + 1 })
    } else {
      set({ isComplete: true })
    }
  },

  previousExercise: () => {
    const { currentExerciseIndex } = get()

    if (currentExerciseIndex > 0) {
      set({ currentExerciseIndex: currentExerciseIndex - 1 })
    }
  },

  // ============================================================
  // Computed
  // ============================================================

  getCurrentExercise: () => {
    const { lesson, currentExerciseIndex } = get()
    return lesson?.exercises[currentExerciseIndex] ?? null
  },

  getProgress: () => {
    const { lesson, currentExerciseIndex } = get()

    if (!lesson || lesson.exercises.length === 0) return 0

    return ((currentExerciseIndex + 1) / lesson.exercises.length) * 100
  },

  isAnswerCorrect: (exerciseId) => {
    const { lesson, answers } = get()
    const exercise = lesson?.exercises.find((e) => e.id === exerciseId)
    const answer = answers.get(exerciseId)

    if (!exercise || answer === undefined) return null

    return exercise.checkAnswer(answer)
  },
}))
