import { describe, it, expect } from 'vitest'
import { Chunk } from '@/features/transcript/domain/entities/chunk'

describe('Chunk', () => {
  describe('create', () => {
    it('should create valid chunk with all required properties', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 0,
        endTime: 30,
        text: 'Hello world',
      })
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.id).toBe('chunk-1')
        expect(result.value.index).toBe(0)
        expect(result.value.startTime).toBe(0)
        expect(result.value.endTime).toBe(30)
        expect(result.value.text).toBe('Hello world')
      }
    })

    it('should create chunk with floating point times', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 10.5,
        endTime: 45.25,
        text: 'Hello',
      })
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.startTime).toBe(10.5)
        expect(result.value.endTime).toBe(45.25)
      }
    })

    it('should fail for negative startTime', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: -1,
        endTime: 30,
        text: 'Hello',
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('ChunkValidationError')
        expect(result.error.field).toBe('startTime')
      }
    })

    it('should fail when endTime equals startTime', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 30,
        endTime: 30,
        text: 'Hello',
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('ChunkValidationError')
        expect(result.error.field).toBe('endTime')
      }
    })

    it('should fail when endTime is less than startTime', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 30,
        endTime: 20,
        text: 'Hello',
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('endTime')
        expect(result.error.errorMessage).toContain('greater than')
      }
    })

    it('should fail for empty text', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 0,
        endTime: 30,
        text: '',
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('text')
      }
    })

    it('should fail for whitespace-only text', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 0,
        endTime: 30,
        text: '   ',
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('text')
      }
    })

    it('should fail for negative index', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: -1,
        startTime: 0,
        endTime: 30,
        text: 'Hello',
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('index')
      }
    })

    it('should fail for empty id', () => {
      const result = Chunk.create({
        id: '',
        index: 0,
        startTime: 0,
        endTime: 30,
        text: 'Hello',
      })
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('id')
      }
    })
  })

  describe('duration', () => {
    it('should calculate duration correctly', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 10.5,
        endTime: 45.2,
        text: 'Hello',
      })
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.duration).toBeCloseTo(34.7, 1)
      }
    })

    it('should calculate zero-start duration correctly', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 0,
        endTime: 30,
        text: 'Hello',
      })
      if (result.isSuccess) {
        expect(result.value.duration).toBe(30)
      }
    })
  })

  describe('immutability', () => {
    it('should be frozen (immutable)', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 0,
        endTime: 30,
        text: 'Hello',
      })
      if (result.isSuccess) {
        expect(Object.isFrozen(result.value)).toBe(true)
      }
    })
  })

  describe('containsTime', () => {
    it('should return true for time within chunk', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 10,
        endTime: 40,
        text: 'Hello',
      })
      if (result.isSuccess) {
        expect(result.value.containsTime(25)).toBe(true)
      }
    })

    it('should return true for time at start boundary', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 10,
        endTime: 40,
        text: 'Hello',
      })
      if (result.isSuccess) {
        expect(result.value.containsTime(10)).toBe(true)
      }
    })

    it('should return false for time at end boundary', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 10,
        endTime: 40,
        text: 'Hello',
      })
      if (result.isSuccess) {
        expect(result.value.containsTime(40)).toBe(false)
      }
    })

    it('should return false for time before chunk', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 10,
        endTime: 40,
        text: 'Hello',
      })
      if (result.isSuccess) {
        expect(result.value.containsTime(5)).toBe(false)
      }
    })

    it('should return false for time after chunk', () => {
      const result = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 10,
        endTime: 40,
        text: 'Hello',
      })
      if (result.isSuccess) {
        expect(result.value.containsTime(50)).toBe(false)
      }
    })
  })
})
