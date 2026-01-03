import { describe, it, expect } from 'vitest'
import { Exercise } from '@/features/lesson/domain/entities/exercise'
import { ExerciseType } from '@/features/lesson/domain/value-objects/exercise-type'

describe('Exercise', () => {
  const fillBlankProps = {
    id: 'exercise-1',
    type: ExerciseType.fillBlank(),
    question: 'The cat ___ on the mat.',
    answer: 'sat',
    options: null,
    explanation: 'Past tense of "sit"',
    chunkIndex: 0,
  }

  const multipleChoiceProps = {
    id: 'exercise-2',
    type: ExerciseType.multipleChoice(),
    question: 'What does "hello" mean?',
    answer: 'a greeting',
    options: ['a greeting', 'goodbye', 'thank you', 'sorry'],
    explanation: 'A common greeting',
    chunkIndex: 1,
  }

  describe('create', () => {
    it('should create valid fill-blank exercise', () => {
      const result = Exercise.create(fillBlankProps)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.id).toBe('exercise-1')
        expect(result.value.type.value).toBe('fill-blank')
        expect(result.value.question).toBe('The cat ___ on the mat.')
        expect(result.value.answer).toBe('sat')
        expect(result.value.options).toBeNull()
        expect(result.value.explanation).toBe('Past tense of "sit"')
        expect(result.value.chunkIndex).toBe(0)
      }
    })

    it('should create valid multiple-choice exercise with options', () => {
      const result = Exercise.create(multipleChoiceProps)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.id).toBe('exercise-2')
        expect(result.value.type.value).toBe('multiple-choice')
        expect(result.value.options).toEqual(['a greeting', 'goodbye', 'thank you', 'sorry'])
      }
    })

    it('should create valid translation exercise', () => {
      const result = Exercise.create({
        ...fillBlankProps,
        id: 'exercise-3',
        type: ExerciseType.translation(),
        question: 'Translate: "How are you?"',
        answer: 'Como voce esta?',
      })
      expect(result.isSuccess).toBe(true)
    })

    it('should create valid listening exercise', () => {
      const result = Exercise.create({
        ...multipleChoiceProps,
        id: 'exercise-4',
        type: ExerciseType.listening(),
        question: 'What did you hear?',
      })
      expect(result.isSuccess).toBe(true)
    })

    it('should be immutable', () => {
      const result = Exercise.create(fillBlankProps)
      if (result.isSuccess) {
        expect(Object.isFrozen(result.value)).toBe(true)
      }
    })

    it('should trim question and answer', () => {
      const result = Exercise.create({
        ...fillBlankProps,
        question: '  What is this?  ',
        answer: '  test  ',
      })
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.question).toBe('What is this?')
        expect(result.value.answer).toBe('test')
      }
    })
  })

  describe('validation - id', () => {
    it('should reject empty id', () => {
      const result = Exercise.create({ ...fillBlankProps, id: '' })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('ExerciseValidationError')
        expect(result.error.field).toBe('id')
      }
    })

    it('should reject whitespace-only id', () => {
      const result = Exercise.create({ ...fillBlankProps, id: '   ' })
      expect(result.isFailure).toBe(true)
    })
  })

  describe('validation - question', () => {
    it('should reject empty question', () => {
      const result = Exercise.create({ ...fillBlankProps, question: '' })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('ExerciseValidationError')
        expect(result.error.field).toBe('question')
      }
    })

    it('should reject whitespace-only question', () => {
      const result = Exercise.create({ ...fillBlankProps, question: '   ' })
      expect(result.isFailure).toBe(true)
    })
  })

  describe('validation - answer', () => {
    it('should reject empty answer', () => {
      const result = Exercise.create({ ...fillBlankProps, answer: '' })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('ExerciseValidationError')
        expect(result.error.field).toBe('answer')
      }
    })

    it('should reject whitespace-only answer', () => {
      const result = Exercise.create({ ...fillBlankProps, answer: '   ' })
      expect(result.isFailure).toBe(true)
    })
  })

  describe('validation - multiple-choice requires options', () => {
    it('should reject multiple-choice without options', () => {
      const result = Exercise.create({
        ...multipleChoiceProps,
        options: null,
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('ExerciseValidationError')
        expect(result.error.field).toBe('options')
        expect(result.error.errorMessage).toContain('requires options')
      }
    })

    it('should reject multiple-choice with empty options array', () => {
      const result = Exercise.create({
        ...multipleChoiceProps,
        options: [],
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('options')
      }
    })
  })

  describe('validation - answer must be in options', () => {
    it('should reject when answer is not in options', () => {
      const result = Exercise.create({
        ...multipleChoiceProps,
        answer: 'not in options',
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('ExerciseValidationError')
        expect(result.error.field).toBe('answer')
        expect(result.error.errorMessage).toContain('must be in options')
      }
    })

    it('should accept when answer is in options', () => {
      const result = Exercise.create(multipleChoiceProps)
      expect(result.isSuccess).toBe(true)
    })
  })

  describe('validation - chunkIndex', () => {
    it('should reject negative chunkIndex', () => {
      const result = Exercise.create({ ...fillBlankProps, chunkIndex: -1 })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('ExerciseValidationError')
        expect(result.error.field).toBe('chunkIndex')
      }
    })

    it('should accept zero chunkIndex', () => {
      const result = Exercise.create({ ...fillBlankProps, chunkIndex: 0 })
      expect(result.isSuccess).toBe(true)
    })
  })

  describe('checkAnswer', () => {
    it('should return true for correct answer', () => {
      const result = Exercise.create(fillBlankProps)
      if (result.isSuccess) {
        expect(result.value.checkAnswer('sat')).toBe(true)
      }
    })

    it('should return true for correct answer with different case', () => {
      const result = Exercise.create(fillBlankProps)
      if (result.isSuccess) {
        expect(result.value.checkAnswer('SAT')).toBe(true)
        expect(result.value.checkAnswer('Sat')).toBe(true)
      }
    })

    it('should return true for correct answer with extra whitespace', () => {
      const result = Exercise.create(fillBlankProps)
      if (result.isSuccess) {
        expect(result.value.checkAnswer('  sat  ')).toBe(true)
      }
    })

    it('should return false for incorrect answer', () => {
      const result = Exercise.create(fillBlankProps)
      if (result.isSuccess) {
        expect(result.value.checkAnswer('stand')).toBe(false)
      }
    })

    it('should return false for empty answer', () => {
      const result = Exercise.create(fillBlankProps)
      if (result.isSuccess) {
        expect(result.value.checkAnswer('')).toBe(false)
      }
    })
  })

  describe('equals', () => {
    it('should return true for same id', () => {
      const result1 = Exercise.create(fillBlankProps)
      const result2 = Exercise.create(fillBlankProps)
      if (result1.isSuccess && result2.isSuccess) {
        expect(result1.value.equals(result2.value)).toBe(true)
      }
    })

    it('should return false for different ids', () => {
      const result1 = Exercise.create(fillBlankProps)
      const result2 = Exercise.create({ ...fillBlankProps, id: 'different-id' })
      if (result1.isSuccess && result2.isSuccess) {
        expect(result1.value.equals(result2.value)).toBe(false)
      }
    })
  })
})
