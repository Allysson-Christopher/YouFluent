import { describe, it, expect } from 'vitest'
import { VocabularyItem } from '@/features/lesson/domain/entities/vocabulary-item'

describe('VocabularyItem', () => {
  const validProps = {
    id: 'vocab-1',
    word: 'hello',
    definition: 'a greeting',
    example: 'Hello, how are you?',
    partOfSpeech: 'phrase' as const,
    chunkIndex: 0,
  }

  describe('create', () => {
    it('should create valid vocabulary item with all props', () => {
      const result = VocabularyItem.create(validProps)
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.id).toBe('vocab-1')
        expect(result.value.word).toBe('hello')
        expect(result.value.definition).toBe('a greeting')
        expect(result.value.example).toBe('Hello, how are you?')
        expect(result.value.partOfSpeech).toBe('phrase')
        expect(result.value.chunkIndex).toBe(0)
      }
    })

    it('should be immutable', () => {
      const result = VocabularyItem.create(validProps)
      if (result.isSuccess) {
        expect(Object.isFrozen(result.value)).toBe(true)
      }
    })

    it('should accept noun as partOfSpeech', () => {
      const result = VocabularyItem.create({ ...validProps, partOfSpeech: 'noun' })
      expect(result.isSuccess).toBe(true)
    })

    it('should accept verb as partOfSpeech', () => {
      const result = VocabularyItem.create({ ...validProps, partOfSpeech: 'verb' })
      expect(result.isSuccess).toBe(true)
    })

    it('should accept adjective as partOfSpeech', () => {
      const result = VocabularyItem.create({ ...validProps, partOfSpeech: 'adjective' })
      expect(result.isSuccess).toBe(true)
    })

    it('should accept adverb as partOfSpeech', () => {
      const result = VocabularyItem.create({ ...validProps, partOfSpeech: 'adverb' })
      expect(result.isSuccess).toBe(true)
    })

    it('should trim word and definition', () => {
      const result = VocabularyItem.create({
        ...validProps,
        word: '  hello  ',
        definition: '  a greeting  ',
      })
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.word).toBe('hello')
        expect(result.value.definition).toBe('a greeting')
      }
    })
  })

  describe('validation - id', () => {
    it('should reject empty id', () => {
      const result = VocabularyItem.create({ ...validProps, id: '' })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('VocabularyValidationError')
        expect(result.error.field).toBe('id')
      }
    })

    it('should reject whitespace-only id', () => {
      const result = VocabularyItem.create({ ...validProps, id: '   ' })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('id')
      }
    })
  })

  describe('validation - word', () => {
    it('should reject empty word', () => {
      const result = VocabularyItem.create({ ...validProps, word: '' })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('VocabularyValidationError')
        expect(result.error.field).toBe('word')
        expect(result.error.errorMessage).toContain('cannot be empty')
      }
    })

    it('should reject whitespace-only word', () => {
      const result = VocabularyItem.create({ ...validProps, word: '   ' })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('word')
      }
    })
  })

  describe('validation - definition', () => {
    it('should reject empty definition', () => {
      const result = VocabularyItem.create({ ...validProps, definition: '' })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('VocabularyValidationError')
        expect(result.error.field).toBe('definition')
        expect(result.error.errorMessage).toContain('cannot be empty')
      }
    })

    it('should reject whitespace-only definition', () => {
      const result = VocabularyItem.create({ ...validProps, definition: '   ' })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('definition')
      }
    })
  })

  describe('validation - partOfSpeech', () => {
    it('should reject invalid partOfSpeech', () => {
      const result = VocabularyItem.create({
        ...validProps,
        partOfSpeech: 'invalid' as 'noun',
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('VocabularyValidationError')
        expect(result.error.field).toBe('partOfSpeech')
      }
    })
  })

  describe('validation - chunkIndex', () => {
    it('should reject negative chunkIndex', () => {
      const result = VocabularyItem.create({ ...validProps, chunkIndex: -1 })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('VocabularyValidationError')
        expect(result.error.field).toBe('chunkIndex')
        expect(result.error.errorMessage).toContain('cannot be negative')
      }
    })

    it('should accept zero chunkIndex', () => {
      const result = VocabularyItem.create({ ...validProps, chunkIndex: 0 })
      expect(result.isSuccess).toBe(true)
    })

    it('should accept positive chunkIndex', () => {
      const result = VocabularyItem.create({ ...validProps, chunkIndex: 5 })
      expect(result.isSuccess).toBe(true)
    })
  })

  describe('equals', () => {
    it('should return true for same id', () => {
      const result1 = VocabularyItem.create(validProps)
      const result2 = VocabularyItem.create(validProps)
      if (result1.isSuccess && result2.isSuccess) {
        expect(result1.value.equals(result2.value)).toBe(true)
      }
    })

    it('should return false for different ids', () => {
      const result1 = VocabularyItem.create(validProps)
      const result2 = VocabularyItem.create({ ...validProps, id: 'vocab-2' })
      if (result1.isSuccess && result2.isSuccess) {
        expect(result1.value.equals(result2.value)).toBe(false)
      }
    })
  })
})
