import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FetchTranscriptUseCase } from '@/features/transcript/application/use-cases/fetch-transcript'
import { ChunkTranscriptUseCase } from '@/features/transcript/application/use-cases/chunk-transcript'
import { Result } from '@/shared/core/result'
import {
  Transcript,
  Chunk,
  VideoId,
  TranscriptFetchError,
  type TranscriptRepository,
  type TranscriptFetcher,
  type RawTranscript,
  type RawTranscriptSegment,
} from '@/features/transcript/domain'

// Mock implementations
const createMockRepository = (): TranscriptRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  findByVideoId: vi.fn().mockResolvedValue(null),
  exists: vi.fn().mockResolvedValue(false),
  deleteByVideoId: vi.fn().mockResolvedValue(undefined),
})

const createMockFetcher = (rawTranscript: RawTranscript): TranscriptFetcher => ({
  fetch: vi.fn().mockResolvedValue(Result.ok(rawTranscript)),
})

const createMockChunker = (): ChunkTranscriptUseCase => {
  const mockChunker = {
    execute: vi.fn().mockImplementation((segments: RawTranscriptSegment[]) => {
      // Create real chunks for tests
      return segments.map((seg, i) => {
        const result = Chunk.create({
          id: `chunk-${i}`,
          index: i,
          startTime: seg.start,
          endTime: seg.start + seg.duration,
          text: seg.text,
        })
        if (result.isFailure) {
          throw new Error(`Mock chunk creation failed: ${result.error.message}`)
        }
        return result.value
      })
    }),
  }
  return mockChunker as unknown as ChunkTranscriptUseCase
}

const validRawTranscript: RawTranscript = {
  videoId: 'dQw4w9WgXcQ',
  title: 'Test Video',
  language: 'en',
  segments: [
    { start: 0, duration: 30, text: 'Hello world' },
    { start: 30, duration: 30, text: 'Testing transcript' },
  ],
}

describe('FetchTranscriptUseCase', () => {
  let repository: TranscriptRepository
  let fetcher: TranscriptFetcher
  let chunker: ChunkTranscriptUseCase
  let useCase: FetchTranscriptUseCase

  beforeEach(() => {
    repository = createMockRepository()
    fetcher = createMockFetcher(validRawTranscript)
    chunker = createMockChunker()
    useCase = new FetchTranscriptUseCase(repository, fetcher, chunker)
  })

  describe('execute', () => {
    it('should return cached transcript if exists (cache HIT)', async () => {
      // Arrange: Create cached transcript
      const videoIdResult = VideoId.fromId('dQw4w9WgXcQ')
      if (!videoIdResult.isSuccess) throw new Error('Failed to create VideoId')
      const videoId = videoIdResult.value

      const chunkResult = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 0,
        endTime: 30,
        text: 'Cached content',
      })
      if (!chunkResult.isSuccess) throw new Error('Failed to create Chunk')
      const chunk = chunkResult.value

      const cachedTranscriptResult = Transcript.create({
        id: 'transcript-1',
        videoId,
        title: 'Cached Video',
        language: 'en',
        chunks: [chunk],
      })
      if (!cachedTranscriptResult.isSuccess) throw new Error('Failed to create Transcript')
      const cachedTranscript = cachedTranscriptResult.value

      // Mock repository to return cached transcript
      vi.mocked(repository.findByVideoId).mockResolvedValue(cachedTranscript)

      // Act
      const result = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.id).toBe('transcript-1')
        expect(result.value.title).toBe('Cached Video')
      }

      // Fetcher should NOT be called (cache HIT)
      expect(fetcher.fetch).not.toHaveBeenCalled()
      expect(repository.save).not.toHaveBeenCalled()
    })

    it('should fetch from YouTube and cache if not cached (cache MISS)', async () => {
      // Arrange: Repository returns null (cache miss)
      vi.mocked(repository.findByVideoId).mockResolvedValue(null)

      // Act
      const result = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(fetcher.fetch).toHaveBeenCalled()
      expect(repository.save).toHaveBeenCalled()
    })

    it('should fail for invalid URL', async () => {
      const result = await useCase.execute('invalid-url')

      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('InvalidVideoUrlError')
      }
    })

    it('should propagate error from YouTube fetcher', async () => {
      vi.mocked(repository.findByVideoId).mockResolvedValue(null)
      vi.mocked(fetcher.fetch).mockResolvedValue(
        Result.fail(new TranscriptFetchError('dQw4w9WgXcQ', 'Video unavailable'))
      )

      const result = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('TranscriptFetchError')
      }
    })

    it('should use chunker to divide segments', async () => {
      vi.mocked(repository.findByVideoId).mockResolvedValue(null)

      await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      expect(chunker.execute).toHaveBeenCalledWith(validRawTranscript.segments)
    })

    it('should generate unique transcript ID', async () => {
      vi.mocked(repository.findByVideoId).mockResolvedValue(null)

      const result1 = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      // Reset mocks and execute again
      vi.clearAllMocks()
      vi.mocked(repository.findByVideoId).mockResolvedValue(null)
      fetcher = createMockFetcher(validRawTranscript)
      chunker = createMockChunker()
      useCase = new FetchTranscriptUseCase(repository, fetcher, chunker)

      const result2 = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      if (result1.isSuccess && result2.isSuccess) {
        expect(result1.value.id).not.toBe(result2.value.id)
      }
    })

    it('should handle youtube.com URL format', async () => {
      vi.mocked(repository.findByVideoId).mockResolvedValue(null)

      const result = await useCase.execute(
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      )

      expect(result.isSuccess).toBe(true)
      expect(fetcher.fetch).toHaveBeenCalled()
    })

    it('should handle youtube embed URL format', async () => {
      vi.mocked(repository.findByVideoId).mockResolvedValue(null)

      const result = await useCase.execute(
        'https://www.youtube.com/embed/dQw4w9WgXcQ'
      )

      expect(result.isSuccess).toBe(true)
      expect(fetcher.fetch).toHaveBeenCalled()
    })

    it('should fail when YouTube returns empty segments', async () => {
      vi.mocked(repository.findByVideoId).mockResolvedValue(null)
      const emptyTranscript: RawTranscript = {
        ...validRawTranscript,
        segments: [],
      }
      vi.mocked(fetcher.fetch).mockResolvedValue(Result.ok(emptyTranscript))

      // Mock chunker to return empty array for empty segments
      vi.mocked(chunker.execute).mockReturnValue([])

      const result = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('TranscriptValidationError')
      }
    })

    it('should use title from raw transcript', async () => {
      vi.mocked(repository.findByVideoId).mockResolvedValue(null)
      const transcriptWithTitle: RawTranscript = {
        ...validRawTranscript,
        title: 'Custom Title',
      }
      vi.mocked(fetcher.fetch).mockResolvedValue(Result.ok(transcriptWithTitle))

      const result = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.title).toBe('Custom Title')
      }
    })

    it('should use fallback title when raw transcript has empty title', async () => {
      vi.mocked(repository.findByVideoId).mockResolvedValue(null)
      const transcriptNoTitle: RawTranscript = {
        ...validRawTranscript,
        title: '',
      }
      vi.mocked(fetcher.fetch).mockResolvedValue(Result.ok(transcriptNoTitle))

      const result = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.title).toContain('dQw4w9WgXcQ')
      }
    })

    it('should preserve language from raw transcript', async () => {
      vi.mocked(repository.findByVideoId).mockResolvedValue(null)
      const transcriptPt: RawTranscript = {
        ...validRawTranscript,
        language: 'pt-BR',
      }
      vi.mocked(fetcher.fetch).mockResolvedValue(Result.ok(transcriptPt))

      const result = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.language).toBe('pt-BR')
      }
    })
  })
})
