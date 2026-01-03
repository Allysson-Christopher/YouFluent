import { describe, it, expect } from 'vitest'
import { Difficulty } from '@/features/lesson/domain/value-objects/difficulty'

describe('Difficulty', () => {
  describe('factory methods', () => {
    it('should create easy difficulty', () => {
      const difficulty = Difficulty.easy()
      expect(difficulty.value).toBe('easy')
    })

    it('should create medium difficulty', () => {
      const difficulty = Difficulty.medium()
      expect(difficulty.value).toBe('medium')
    })

    it('should create hard difficulty', () => {
      const difficulty = Difficulty.hard()
      expect(difficulty.value).toBe('hard')
    })

    it('should be immutable', () => {
      const difficulty = Difficulty.easy()
      expect(Object.isFrozen(difficulty)).toBe(true)
    })
  })

  describe('fromString', () => {
    it('should parse "easy" difficulty', () => {
      const result = Difficulty.fromString('easy')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('easy')
      }
    })

    it('should parse "medium" difficulty', () => {
      const result = Difficulty.fromString('medium')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('medium')
      }
    })

    it('should parse "hard" difficulty', () => {
      const result = Difficulty.fromString('hard')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('hard')
      }
    })

    it('should fail for invalid difficulty string', () => {
      const result = Difficulty.fromString('extreme')
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('InvalidDifficultyError')
        expect(result.error.value).toBe('extreme')
      }
    })

    it('should fail for empty string', () => {
      const result = Difficulty.fromString('')
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('InvalidDifficultyError')
      }
    })

    it('should be case sensitive', () => {
      const result = Difficulty.fromString('EASY')
      expect(result.isFailure).toBe(true)
    })
  })

  describe('equals', () => {
    it('should return true for same difficulty value', () => {
      const d1 = Difficulty.easy()
      const d2 = Difficulty.easy()
      expect(d1.equals(d2)).toBe(true)
    })

    it('should return false for different difficulty values', () => {
      const d1 = Difficulty.easy()
      const d2 = Difficulty.hard()
      expect(d1.equals(d2)).toBe(false)
    })

    it('should return true for fromString and factory with same value', () => {
      const d1 = Difficulty.medium()
      const result = Difficulty.fromString('medium')
      if (result.isSuccess) {
        expect(d1.equals(result.value)).toBe(true)
      }
    })
  })

  describe('toString', () => {
    it('should return the difficulty string', () => {
      expect(Difficulty.easy().toString()).toBe('easy')
      expect(Difficulty.medium().toString()).toBe('medium')
      expect(Difficulty.hard().toString()).toBe('hard')
    })
  })
})
