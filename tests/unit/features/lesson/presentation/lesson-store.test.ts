import { describe, it, expect, beforeEach } from 'vitest'
import { useLessonStore } from '@/features/lesson/presentation/stores/lesson-store'
import { Lesson } from '@/features/lesson/domain/entities/lesson'
import { Exercise } from '@/features/lesson/domain/entities/exercise'
import { VocabularyItem } from '@/features/lesson/domain/entities/vocabulary-item'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'
import { Difficulty } from '@/features/lesson/domain/value-objects/difficulty'
import { ExerciseType } from '@/features/lesson/domain/value-objects/exercise-type'

/**
 * Helper to create mock lesson data
 */
function createMockLesson(): Lesson {
  const videoIdResult = VideoId.fromId('dQw4w9WgXcQ')
  if (!videoIdResult.isSuccess) throw new Error('Failed to create VideoId')
  const videoId = videoIdResult.value

  const difficulty = Difficulty.medium()

  const exercise1Result = Exercise.create({
    id: 'ex-1',
    type: ExerciseType.fillBlank(),
    question: 'What is the capital of France?',
    answer: 'Paris',
    options: null,
    explanation: 'Paris is the capital of France',
    chunkIndex: 0,
  })
  if (!exercise1Result.isSuccess) throw new Error('Failed to create Exercise 1')
  const exercise1 = exercise1Result.value

  const exercise2Result = Exercise.create({
    id: 'ex-2',
    type: ExerciseType.multipleChoice(),
    question: 'Select the correct answer',
    answer: 'Option B',
    options: ['Option A', 'Option B', 'Option C'],
    explanation: 'Option B is correct',
    chunkIndex: 1,
  })
  if (!exercise2Result.isSuccess) throw new Error('Failed to create Exercise 2')
  const exercise2 = exercise2Result.value

  const vocab1Result = VocabularyItem.create({
    id: 'vocab-1',
    word: 'hello',
    definition: 'A greeting',
    example: 'Hello, how are you?',
    partOfSpeech: 'noun',
    chunkIndex: 0,
  })
  if (!vocab1Result.isSuccess) throw new Error('Failed to create VocabularyItem')
  const vocab1 = vocab1Result.value

  const lessonResult = Lesson.create({
    id: 'lesson-1',
    videoId,
    title: 'Test Lesson',
    difficulty,
    exercises: [exercise1, exercise2],
    vocabulary: [vocab1],
  })
  if (!lessonResult.isSuccess) throw new Error('Failed to create Lesson')
  return lessonResult.value
}

describe('LessonStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useLessonStore.getState().reset()
  })

  describe('initial state', () => {
    it('should have null lesson', () => {
      const lesson = useLessonStore.getState().lesson
      expect(lesson).toBeNull()
    })

    it('should have currentExerciseIndex at 0', () => {
      const index = useLessonStore.getState().currentExerciseIndex
      expect(index).toBe(0)
    })

    it('should have empty answers map', () => {
      const answers = useLessonStore.getState().answers
      expect(answers.size).toBe(0)
    })

    it('should have score at 0', () => {
      const score = useLessonStore.getState().score
      expect(score).toBe(0)
    })

    it('should have isComplete false', () => {
      const isComplete = useLessonStore.getState().isComplete
      expect(isComplete).toBe(false)
    })
  })

  describe('setLesson', () => {
    it('should set lesson and reset state', () => {
      const mockLesson = createMockLesson()

      // Set some state first
      useLessonStore.getState().submitAnswer('some-id', 'answer')

      // Then set a new lesson
      useLessonStore.getState().setLesson(mockLesson)

      const state = useLessonStore.getState()
      expect(state.lesson).toBe(mockLesson)
      expect(state.currentExerciseIndex).toBe(0)
      expect(state.answers.size).toBe(0)
      expect(state.score).toBe(0)
      expect(state.isComplete).toBe(false)
    })
  })

  describe('submitAnswer', () => {
    it('should record answer in map', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)

      useLessonStore.getState().submitAnswer('ex-1', 'Paris')

      const answers = useLessonStore.getState().answers
      expect(answers.get('ex-1')).toBe('Paris')
    })

    it('should increment score if correct', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)

      useLessonStore.getState().submitAnswer('ex-1', 'Paris')

      const score = useLessonStore.getState().score
      expect(score).toBe(1)
    })

    it('should not increment score if incorrect', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)

      useLessonStore.getState().submitAnswer('ex-1', 'London')

      const score = useLessonStore.getState().score
      expect(score).toBe(0)
    })

    it('should do nothing if no lesson', () => {
      useLessonStore.getState().submitAnswer('ex-1', 'Paris')

      const answers = useLessonStore.getState().answers
      expect(answers.size).toBe(0)
    })

    it('should do nothing if exercise not found', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)

      useLessonStore.getState().submitAnswer('non-existent', 'answer')

      const answers = useLessonStore.getState().answers
      expect(answers.size).toBe(0)
    })
  })

  describe('nextExercise', () => {
    it('should increment currentExerciseIndex', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)

      useLessonStore.getState().nextExercise()

      const index = useLessonStore.getState().currentExerciseIndex
      expect(index).toBe(1)
    })

    it('should set isComplete on last exercise', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)

      // Move to last exercise (index 1)
      useLessonStore.getState().nextExercise()
      // Try to go past last
      useLessonStore.getState().nextExercise()

      const state = useLessonStore.getState()
      expect(state.isComplete).toBe(true)
      expect(state.currentExerciseIndex).toBe(1) // Should stay at last
    })
  })

  describe('previousExercise', () => {
    it('should decrement currentExerciseIndex', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)
      useLessonStore.getState().nextExercise() // Move to 1

      useLessonStore.getState().previousExercise()

      const index = useLessonStore.getState().currentExerciseIndex
      expect(index).toBe(0)
    })

    it('should not go below 0', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)

      useLessonStore.getState().previousExercise()

      const index = useLessonStore.getState().currentExerciseIndex
      expect(index).toBe(0)
    })
  })

  describe('getCurrentExercise', () => {
    it('should return exercise at current index', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)

      const exercise = useLessonStore.getState().getCurrentExercise()

      expect(exercise).not.toBeNull()
      expect(exercise?.id).toBe('ex-1')
    })

    it('should return null if no lesson', () => {
      const exercise = useLessonStore.getState().getCurrentExercise()

      expect(exercise).toBeNull()
    })

    it('should return correct exercise after navigation', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)
      useLessonStore.getState().nextExercise()

      const exercise = useLessonStore.getState().getCurrentExercise()

      expect(exercise?.id).toBe('ex-2')
    })
  })

  describe('getProgress', () => {
    it('should return 0 if no lesson', () => {
      const progress = useLessonStore.getState().getProgress()

      expect(progress).toBe(0)
    })

    it('should return percentage of completion', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)

      // First exercise: 1/2 = 50%
      const progress1 = useLessonStore.getState().getProgress()
      expect(progress1).toBe(50)

      // Move to second: 2/2 = 100%
      useLessonStore.getState().nextExercise()
      const progress2 = useLessonStore.getState().getProgress()
      expect(progress2).toBe(100)
    })
  })

  describe('isAnswerCorrect', () => {
    it('should return true if answer matches', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)
      useLessonStore.getState().submitAnswer('ex-1', 'Paris')

      const isCorrect = useLessonStore.getState().isAnswerCorrect('ex-1')

      expect(isCorrect).toBe(true)
    })

    it('should return false if answer wrong', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)
      useLessonStore.getState().submitAnswer('ex-1', 'London')

      const isCorrect = useLessonStore.getState().isAnswerCorrect('ex-1')

      expect(isCorrect).toBe(false)
    })

    it('should return null if not answered', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)

      const isCorrect = useLessonStore.getState().isAnswerCorrect('ex-1')

      expect(isCorrect).toBeNull()
    })

    it('should return null if exercise not found', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)

      const isCorrect = useLessonStore.getState().isAnswerCorrect('non-existent')

      expect(isCorrect).toBeNull()
    })
  })

  describe('reset', () => {
    it('should reset all state', () => {
      const mockLesson = createMockLesson()
      useLessonStore.getState().setLesson(mockLesson)
      useLessonStore.getState().submitAnswer('ex-1', 'Paris')
      useLessonStore.getState().nextExercise()

      useLessonStore.getState().reset()

      const state = useLessonStore.getState()
      expect(state.lesson).toBeNull()
      expect(state.currentExerciseIndex).toBe(0)
      expect(state.answers.size).toBe(0)
      expect(state.score).toBe(0)
      expect(state.isComplete).toBe(false)
    })
  })
})
