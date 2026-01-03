import { describe, it, expect, beforeEach } from 'vitest'
import { Lesson } from '@/features/lesson/domain/entities/lesson'
import { Exercise } from '@/features/lesson/domain/entities/exercise'
import { VocabularyItem } from '@/features/lesson/domain/entities/vocabulary-item'
import { Difficulty } from '@/features/lesson/domain/value-objects/difficulty'
import { ExerciseType } from '@/features/lesson/domain/value-objects/exercise-type'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'

describe('Lesson', () => {
  let exercise1: Exercise
  let exercise2: Exercise
  let vocab1: VocabularyItem
  let vocab2: VocabularyItem
  let videoId: VideoId

  beforeEach(() => {
    // Create valid test data
    const exerciseResult1 = Exercise.create({
      id: 'exercise-1',
      type: ExerciseType.fillBlank(),
      question: 'The cat ___ on the mat.',
      answer: 'sat',
      options: null,
      explanation: 'Past tense of sit',
      chunkIndex: 0,
    })
    const exerciseResult2 = Exercise.create({
      id: 'exercise-2',
      type: ExerciseType.multipleChoice(),
      question: 'What does hello mean?',
      answer: 'greeting',
      options: ['greeting', 'goodbye', 'thanks', 'sorry'],
      explanation: 'A common greeting',
      chunkIndex: 1,
    })
    const vocabResult1 = VocabularyItem.create({
      id: 'vocab-1',
      word: 'cat',
      definition: 'a small domesticated feline',
      example: 'The cat sat on the mat.',
      partOfSpeech: 'noun',
      chunkIndex: 0,
    })
    const vocabResult2 = VocabularyItem.create({
      id: 'vocab-2',
      word: 'sat',
      definition: 'past tense of sit',
      example: 'She sat down.',
      partOfSpeech: 'verb',
      chunkIndex: 0,
    })
    const videoIdResult = VideoId.fromId('dQw4w9WgXcQ')

    if (
      exerciseResult1.isSuccess &&
      exerciseResult2.isSuccess &&
      vocabResult1.isSuccess &&
      vocabResult2.isSuccess &&
      videoIdResult.isSuccess
    ) {
      exercise1 = exerciseResult1.value
      exercise2 = exerciseResult2.value
      vocab1 = vocabResult1.value
      vocab2 = vocabResult2.value
      videoId = videoIdResult.value
    }
  })

  const createValidLessonProps = () => ({
    id: 'lesson-1',
    videoId,
    title: 'Learn English with Cats',
    difficulty: Difficulty.medium(),
    exercises: [exercise1, exercise2],
    vocabulary: [vocab1, vocab2],
  })

  describe('create', () => {
    it('should create valid lesson with exercises and vocabulary', () => {
      const result = Lesson.create(createValidLessonProps())
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.id).toBe('lesson-1')
        expect(result.value.videoId.value).toBe('dQw4w9WgXcQ')
        expect(result.value.title).toBe('Learn English with Cats')
        expect(result.value.difficulty.value).toBe('medium')
        expect(result.value.exercises).toHaveLength(2)
        expect(result.value.vocabulary).toHaveLength(2)
        expect(result.value.createdAt).toBeInstanceOf(Date)
      }
    })

    it('should be immutable', () => {
      const result = Lesson.create(createValidLessonProps())
      if (result.isSuccess) {
        expect(Object.isFrozen(result.value)).toBe(true)
      }
    })

    it('should trim title', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        title: '  Learn English  ',
      })
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.title).toBe('Learn English')
      }
    })

    it('should accept single exercise', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        exercises: [exercise1],
      })
      expect(result.isSuccess).toBe(true)
    })

    it('should accept single vocabulary item', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        vocabulary: [vocab1],
      })
      expect(result.isSuccess).toBe(true)
    })
  })

  describe('validation - id', () => {
    it('should reject empty id', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        id: '',
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('LessonValidationError')
        expect(result.error.field).toBe('id')
      }
    })

    it('should reject whitespace-only id', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        id: '   ',
      })
      expect(result.isFailure).toBe(true)
    })
  })

  describe('validation - title', () => {
    it('should reject empty title', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        title: '',
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('LessonValidationError')
        expect(result.error.field).toBe('title')
      }
    })

    it('should reject whitespace-only title', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        title: '   ',
      })
      expect(result.isFailure).toBe(true)
    })
  })

  describe('validation - exercises', () => {
    it('should reject empty exercises array', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        exercises: [],
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('LessonValidationError')
        expect(result.error.field).toBe('exercises')
        expect(result.error.errorMessage).toContain('At least one')
      }
    })

    it('should reject null exercises', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        exercises: null as unknown as Exercise[],
      })
      expect(result.isFailure).toBe(true)
    })

    it('should reject undefined exercises', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        exercises: undefined as unknown as Exercise[],
      })
      expect(result.isFailure).toBe(true)
    })
  })

  describe('validation - vocabulary', () => {
    it('should reject empty vocabulary array', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        vocabulary: [],
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('LessonValidationError')
        expect(result.error.field).toBe('vocabulary')
        expect(result.error.errorMessage).toContain('At least one')
      }
    })

    it('should reject null vocabulary', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        vocabulary: null as unknown as VocabularyItem[],
      })
      expect(result.isFailure).toBe(true)
    })

    it('should reject undefined vocabulary', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        vocabulary: undefined as unknown as VocabularyItem[],
      })
      expect(result.isFailure).toBe(true)
    })
  })

  describe('exerciseCount', () => {
    it('should return correct exercise count', () => {
      const result = Lesson.create(createValidLessonProps())
      if (result.isSuccess) {
        expect(result.value.exerciseCount).toBe(2)
      }
    })

    it('should return 1 for single exercise', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        exercises: [exercise1],
      })
      if (result.isSuccess) {
        expect(result.value.exerciseCount).toBe(1)
      }
    })
  })

  describe('vocabularyCount', () => {
    it('should return correct vocabulary count', () => {
      const result = Lesson.create(createValidLessonProps())
      if (result.isSuccess) {
        expect(result.value.vocabularyCount).toBe(2)
      }
    })

    it('should return 1 for single vocabulary item', () => {
      const result = Lesson.create({
        ...createValidLessonProps(),
        vocabulary: [vocab1],
      })
      if (result.isSuccess) {
        expect(result.value.vocabularyCount).toBe(1)
      }
    })
  })

  describe('getExerciseById', () => {
    it('should find exercise by id', () => {
      const result = Lesson.create(createValidLessonProps())
      if (result.isSuccess) {
        const found = result.value.getExerciseById('exercise-1')
        expect(found).not.toBeNull()
        expect(found?.id).toBe('exercise-1')
      }
    })

    it('should return null for non-existent id', () => {
      const result = Lesson.create(createValidLessonProps())
      if (result.isSuccess) {
        const found = result.value.getExerciseById('non-existent')
        expect(found).toBeNull()
      }
    })
  })

  describe('getVocabularyById', () => {
    it('should find vocabulary by id', () => {
      const result = Lesson.create(createValidLessonProps())
      if (result.isSuccess) {
        const found = result.value.getVocabularyById('vocab-1')
        expect(found).not.toBeNull()
        expect(found?.id).toBe('vocab-1')
      }
    })

    it('should return null for non-existent id', () => {
      const result = Lesson.create(createValidLessonProps())
      if (result.isSuccess) {
        const found = result.value.getVocabularyById('non-existent')
        expect(found).toBeNull()
      }
    })
  })

  describe('equals', () => {
    it('should return true for same id', () => {
      const result1 = Lesson.create(createValidLessonProps())
      const result2 = Lesson.create(createValidLessonProps())
      if (result1.isSuccess && result2.isSuccess) {
        expect(result1.value.equals(result2.value)).toBe(true)
      }
    })

    it('should return false for different ids', () => {
      const result1 = Lesson.create(createValidLessonProps())
      const result2 = Lesson.create({
        ...createValidLessonProps(),
        id: 'different-id',
      })
      if (result1.isSuccess && result2.isSuccess) {
        expect(result1.value.equals(result2.value)).toBe(false)
      }
    })
  })
})
