import { describe, it, expect } from 'vitest'
import { ExerciseType } from '@/features/lesson/domain/value-objects/exercise-type'

describe('ExerciseType', () => {
  describe('factory methods', () => {
    it('should create fill-blank type', () => {
      const type = ExerciseType.fillBlank()
      expect(type.value).toBe('fill-blank')
    })

    it('should create multiple-choice type', () => {
      const type = ExerciseType.multipleChoice()
      expect(type.value).toBe('multiple-choice')
    })

    it('should create translation type', () => {
      const type = ExerciseType.translation()
      expect(type.value).toBe('translation')
    })

    it('should create listening type', () => {
      const type = ExerciseType.listening()
      expect(type.value).toBe('listening')
    })

    it('should be immutable', () => {
      const type = ExerciseType.fillBlank()
      expect(Object.isFrozen(type)).toBe(true)
    })
  })

  describe('fromString', () => {
    it('should parse "fill-blank" type', () => {
      const result = ExerciseType.fromString('fill-blank')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('fill-blank')
      }
    })

    it('should parse "multiple-choice" type', () => {
      const result = ExerciseType.fromString('multiple-choice')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('multiple-choice')
      }
    })

    it('should parse "translation" type', () => {
      const result = ExerciseType.fromString('translation')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('translation')
      }
    })

    it('should parse "listening" type', () => {
      const result = ExerciseType.fromString('listening')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('listening')
      }
    })

    it('should fail for invalid type string', () => {
      const result = ExerciseType.fromString('quiz')
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('InvalidExerciseTypeError')
        expect(result.error.value).toBe('quiz')
      }
    })

    it('should fail for empty string', () => {
      const result = ExerciseType.fromString('')
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('InvalidExerciseTypeError')
      }
    })
  })

  describe('requiresTextInput', () => {
    it('should return true for fill-blank type', () => {
      expect(ExerciseType.fillBlank().requiresTextInput).toBe(true)
    })

    it('should return true for translation type', () => {
      expect(ExerciseType.translation().requiresTextInput).toBe(true)
    })

    it('should return false for multiple-choice type', () => {
      expect(ExerciseType.multipleChoice().requiresTextInput).toBe(false)
    })

    it('should return false for listening type', () => {
      expect(ExerciseType.listening().requiresTextInput).toBe(false)
    })
  })

  describe('requiresOptions', () => {
    it('should return true for multiple-choice type', () => {
      expect(ExerciseType.multipleChoice().requiresOptions).toBe(true)
    })

    it('should return false for fill-blank type', () => {
      expect(ExerciseType.fillBlank().requiresOptions).toBe(false)
    })

    it('should return false for translation type', () => {
      expect(ExerciseType.translation().requiresOptions).toBe(false)
    })

    it('should return false for listening type', () => {
      expect(ExerciseType.listening().requiresOptions).toBe(false)
    })
  })

  describe('equals', () => {
    it('should return true for same type value', () => {
      const t1 = ExerciseType.fillBlank()
      const t2 = ExerciseType.fillBlank()
      expect(t1.equals(t2)).toBe(true)
    })

    it('should return false for different type values', () => {
      const t1 = ExerciseType.fillBlank()
      const t2 = ExerciseType.multipleChoice()
      expect(t1.equals(t2)).toBe(false)
    })
  })

  describe('toString', () => {
    it('should return the type string', () => {
      expect(ExerciseType.fillBlank().toString()).toBe('fill-blank')
      expect(ExerciseType.multipleChoice().toString()).toBe('multiple-choice')
      expect(ExerciseType.translation().toString()).toBe('translation')
      expect(ExerciseType.listening().toString()).toBe('listening')
    })
  })
})
