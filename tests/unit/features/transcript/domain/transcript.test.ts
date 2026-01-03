import { describe, it, expect, beforeEach } from 'vitest'
import { Transcript } from '@/features/transcript/domain/entities/transcript'
import { Chunk } from '@/features/transcript/domain/entities/chunk'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'

describe('Transcript', () => {
  let validVideoId: ReturnType<typeof VideoId.fromId>
  let validChunks: Chunk[]

  beforeEach(() => {
    validVideoId = VideoId.fromId('dQw4w9WgXcQ')

    const chunk1Result = Chunk.create({
      id: 'chunk-1',
      index: 0,
      startTime: 0,
      endTime: 30,
      text: 'First chunk',
    })
    const chunk2Result = Chunk.create({
      id: 'chunk-2',
      index: 1,
      startTime: 30,
      endTime: 60,
      text: 'Second chunk',
    })

    validChunks = []
    if (chunk1Result.isSuccess) validChunks.push(chunk1Result.value)
    if (chunk2Result.isSuccess) validChunks.push(chunk2Result.value)
  })

  describe('create', () => {
    it('should create valid transcript with all required properties', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test Video',
        language: 'en',
        chunks: validChunks,
      })

      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.id).toBe('transcript-1')
        expect(result.value.title).toBe('Test Video')
        expect(result.value.language).toBe('en')
        expect(result.value.chunks).toHaveLength(2)
        expect(result.value.videoId.equals(validVideoId.value)).toBe(true)
      }
    })

    it('should set createdAt to current date', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const before = new Date()
      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test Video',
        language: 'en',
        chunks: validChunks,
      })
      const after = new Date()

      if (result.isSuccess) {
        expect(result.value.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
        expect(result.value.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
      }
    })

    it('should fail for empty chunks array', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test Video',
        language: 'en',
        chunks: [],
      })

      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('TranscriptValidationError')
        expect(result.error.field).toBe('chunks')
      }
    })

    it('should fail for empty title', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: '',
        language: 'en',
        chunks: validChunks,
      })

      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('title')
      }
    })

    it('should fail for whitespace-only title', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: '   ',
        language: 'en',
        chunks: validChunks,
      })

      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('title')
      }
    })

    it('should fail for empty id', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: '',
        videoId: validVideoId.value,
        title: 'Test Video',
        language: 'en',
        chunks: validChunks,
      })

      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('id')
      }
    })

    it('should fail for empty language', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test Video',
        language: '',
        chunks: validChunks,
      })

      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error.field).toBe('language')
      }
    })

    it('should sort chunks by index', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const chunk3Result = Chunk.create({
        id: 'chunk-3',
        index: 2,
        startTime: 60,
        endTime: 90,
        text: 'Third chunk',
      })

      // Create chunks in wrong order
      const unorderedChunks = [validChunks[1], validChunks[0]]
      if (chunk3Result.isSuccess) {
        unorderedChunks.unshift(chunk3Result.value)
      }

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test Video',
        language: 'en',
        chunks: unorderedChunks,
      })

      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.chunks[0].index).toBe(0)
        expect(result.value.chunks[1].index).toBe(1)
        expect(result.value.chunks[2].index).toBe(2)
      }
    })
  })

  describe('fullText', () => {
    it('should concatenate all chunk texts with space', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.fullText).toBe('First chunk Second chunk')
      }
    })

    it('should handle single chunk', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: [validChunks[0]],
      })

      if (result.isSuccess) {
        expect(result.value.fullText).toBe('First chunk')
      }
    })
  })

  describe('getChunkByIndex', () => {
    it('should return chunk at given index', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        const chunk = result.value.getChunkByIndex(1)
        expect(chunk).not.toBeNull()
        expect(chunk?.text).toBe('Second chunk')
      }
    })

    it('should return first chunk at index 0', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        const chunk = result.value.getChunkByIndex(0)
        expect(chunk?.text).toBe('First chunk')
      }
    })

    it('should return null for invalid index (too high)', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        expect(result.value.getChunkByIndex(99)).toBeNull()
      }
    })

    it('should return null for negative index', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        expect(result.value.getChunkByIndex(-1)).toBeNull()
      }
    })
  })

  describe('getChunkAtTime', () => {
    it('should return chunk containing given time', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        const chunk = result.value.getChunkAtTime(35)
        expect(chunk).not.toBeNull()
        expect(chunk?.index).toBe(1)
        expect(chunk?.text).toBe('Second chunk')
      }
    })

    it('should return first chunk for time 0', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        const chunk = result.value.getChunkAtTime(0)
        expect(chunk?.index).toBe(0)
      }
    })

    it('should return null for time before first chunk', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      // Create transcript with chunk starting at 10
      const laterChunkResult = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 10,
        endTime: 40,
        text: 'Later chunk',
      })

      if (laterChunkResult.isSuccess) {
        const result = Transcript.create({
          id: 'transcript-1',
          videoId: validVideoId.value,
          title: 'Test',
          language: 'en',
          chunks: [laterChunkResult.value],
        })

        if (result.isSuccess) {
          expect(result.value.getChunkAtTime(5)).toBeNull()
        }
      }
    })

    it('should return null for time after last chunk', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        expect(result.value.getChunkAtTime(100)).toBeNull()
      }
    })

    it('should handle boundary between chunks correctly', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        // Time 30 is the boundary - should return second chunk (startTime = 30)
        const chunk = result.value.getChunkAtTime(30)
        expect(chunk?.index).toBe(1)
      }
    })
  })

  describe('chunkCount', () => {
    it('should return number of chunks', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        expect(result.value.chunkCount).toBe(2)
      }
    })
  })

  describe('totalDuration', () => {
    it('should return total duration from first to last chunk', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        // First chunk: 0-30, Second chunk: 30-60
        expect(result.value.totalDuration).toBe(60)
      }
    })
  })

  describe('immutability', () => {
    it('should be frozen (immutable)', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        expect(Object.isFrozen(result.value)).toBe(true)
      }
    })

    it('should have frozen chunks array', () => {
      if (!validVideoId.isSuccess) throw new Error('Setup failed')

      const result = Transcript.create({
        id: 'transcript-1',
        videoId: validVideoId.value,
        title: 'Test',
        language: 'en',
        chunks: validChunks,
      })

      if (result.isSuccess) {
        expect(Object.isFrozen(result.value.chunks)).toBe(true)
      }
    })
  })
})
