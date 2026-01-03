import { describe, it, expect } from 'vitest'
import { ChunkTranscriptUseCase } from '@/features/transcript/application/use-cases/chunk-transcript'
import type { RawTranscriptSegment } from '@/features/transcript/domain'

describe('ChunkTranscriptUseCase', () => {
  describe('execute', () => {
    it('should create chunks of approximately 30 seconds', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 10, text: 'Hello' },
        { start: 10, duration: 10, text: 'World' },
        { start: 20, duration: 10, text: 'Test' },
        { start: 30, duration: 10, text: 'More' },
        { start: 40, duration: 10, text: 'Content' },
      ]

      const chunks = useCase.execute(segments)

      // First chunk: 0-30s (3 segments)
      expect(chunks[0].startTime).toBe(0)
      expect(chunks[0].endTime).toBeLessThanOrEqual(35) // ~30s with tolerance
    })

    it('should combine segment texts in each chunk', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 10, text: 'Hello' },
        { start: 10, duration: 10, text: 'World' },
      ]

      const chunks = useCase.execute(segments)

      expect(chunks[0].text).toBe('Hello World')
    })

    it('should generate unique IDs for each chunk', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 30, text: 'First' },
        { start: 30, duration: 30, text: 'Second' },
      ]

      const chunks = useCase.execute(segments)

      expect(chunks[0].id).toBeDefined()
      expect(chunks[1].id).toBeDefined()
      expect(chunks[0].id).not.toBe(chunks[1].id)
    })

    it('should assign sequential indexes', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 30, text: 'First' },
        { start: 30, duration: 30, text: 'Second' },
        { start: 60, duration: 30, text: 'Third' },
      ]

      const chunks = useCase.execute(segments)

      expect(chunks[0].index).toBe(0)
      expect(chunks[1].index).toBe(1)
      expect(chunks[2].index).toBe(2)
    })

    it('should handle empty segments array', () => {
      const useCase = new ChunkTranscriptUseCase()

      const chunks = useCase.execute([])

      expect(chunks).toEqual([])
    })

    it('should handle single segment', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 15, text: 'Single segment' },
      ]

      const chunks = useCase.execute(segments)

      expect(chunks).toHaveLength(1)
      expect(chunks[0].text).toBe('Single segment')
    })

    it('should respect custom target duration', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 10, text: 'A' },
        { start: 10, duration: 10, text: 'B' },
        { start: 20, duration: 10, text: 'C' },
        { start: 30, duration: 10, text: 'D' },
      ]

      // Target: 15 seconds
      const chunks = useCase.execute(segments, 15)

      // Should have more chunks with shorter duration
      expect(chunks.length).toBeGreaterThan(1)
    })

    it('should handle segments with fractional times', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0.5, duration: 10.2, text: 'First' },
        { start: 10.7, duration: 15.3, text: 'Second' },
      ]

      const chunks = useCase.execute(segments)

      expect(chunks).toHaveLength(1)
      expect(chunks[0].startTime).toBe(0.5)
      expect(chunks[0].endTime).toBeCloseTo(26, 0)
    })

    it('should create correct chunk boundaries', () => {
      const useCase = new ChunkTranscriptUseCase()
      // Design: 3 segments that fit naturally into 2 chunks
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 15, text: 'Segment 1' },
        { start: 15, duration: 10, text: 'Segment 2' },
        { start: 25, duration: 10, text: 'Segment 3' }, // Total: 35s, exceeds 30s target
        { start: 35, duration: 15, text: 'Segment 4' },
      ]

      const chunks = useCase.execute(segments)

      // First chunk: 0-25s (Segments 1+2, combined 25s)
      expect(chunks[0].startTime).toBe(0)
      expect(chunks[0].endTime).toBe(25)
      expect(chunks[0].text).toBe('Segment 1 Segment 2')

      // Second chunk: 25-50s (Segments 3+4)
      expect(chunks[1].startTime).toBe(25)
      expect(chunks[1].endTime).toBe(50)
      expect(chunks[1].text).toBe('Segment 3 Segment 4')
    })

    it('should not create chunks with empty text', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 30, text: 'Valid text' },
      ]

      const chunks = useCase.execute(segments)

      expect(chunks.every((c) => c.text.trim().length > 0)).toBe(true)
    })
  })
})
