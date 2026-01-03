/**
 * Integration Tests for YouTubeTranscriptService
 *
 * TDD: RED Phase - Writing tests first before implementation
 *
 * These tests verify the infrastructure service that fetches
 * transcripts from YouTube using the youtube-transcript package.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { YouTubeTranscriptService } from '@/features/transcript/infrastructure/services/youtube-transcript-service'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'
import {
  YoutubeTranscript,
  YoutubeTranscriptDisabledError,
  YoutubeTranscriptVideoUnavailableError,
  YoutubeTranscriptNotAvailableError,
} from 'youtube-transcript'

// Mock the youtube-transcript module
vi.mock('youtube-transcript', () => ({
  YoutubeTranscript: {
    fetchTranscript: vi.fn(),
  },
  YoutubeTranscriptDisabledError: class extends Error {
    constructor(videoId: string) {
      super(`Transcript is disabled for video: ${videoId}`)
    }
  },
  YoutubeTranscriptVideoUnavailableError: class extends Error {
    constructor(videoId: string) {
      super(`Video is unavailable: ${videoId}`)
    }
  },
  YoutubeTranscriptNotAvailableError: class extends Error {
    constructor(videoId: string) {
      super(`Transcript is not available for video: ${videoId}`)
    }
  },
}))

describe('YouTubeTranscriptService', () => {
  let service: YouTubeTranscriptService

  beforeEach(() => {
    service = new YouTubeTranscriptService()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('fetch', () => {
    it('should fetch transcript for valid video', async () => {
      // Arrange
      const mockTranscriptResponse = [
        { text: 'Hello world', offset: 0, duration: 5000 },
        { text: 'This is a test', offset: 5000, duration: 4000 },
        { text: 'Learning English', offset: 9000, duration: 3000 },
      ]

      vi.mocked(YoutubeTranscript.fetchTranscript).mockResolvedValue(mockTranscriptResponse)

      const videoIdResult = VideoId.fromId('valid123abc')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')
      const videoId = videoIdResult.value

      // Act
      const result = await service.fetch(videoId)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.videoId).toBe('valid123abc')
        expect(result.value.language).toBe('en')
        expect(result.value.segments.length).toBe(3)
        expect(result.value.segments[0]).toHaveProperty('start')
        expect(result.value.segments[0]).toHaveProperty('duration')
        expect(result.value.segments[0]).toHaveProperty('text')
        expect(result.value.segments[0].text).toBe('Hello world')
      }
    })

    it('should convert milliseconds to seconds', async () => {
      // Arrange
      const mockTranscriptResponse = [
        { text: 'Hello world', offset: 5000, duration: 3000 },
      ]

      vi.mocked(YoutubeTranscript.fetchTranscript).mockResolvedValue(mockTranscriptResponse)

      const videoIdResult = VideoId.fromId('convert1234')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')
      const videoId = videoIdResult.value

      // Act
      const result = await service.fetch(videoId)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        const segment = result.value.segments[0]
        // offset 5000ms = 5 seconds
        expect(segment.start).toBe(5)
        // duration 3000ms = 3 seconds
        expect(segment.duration).toBe(3)
      }
    })

    it('should clean HTML entities from text', async () => {
      // Arrange
      const mockTranscriptResponse = [
        { text: 'Hello &amp; world &lt;test&gt;', offset: 0, duration: 5000 },
        { text: "It&#39;s &quot;great&quot;", offset: 5000, duration: 3000 },
      ]

      vi.mocked(YoutubeTranscript.fetchTranscript).mockResolvedValue(mockTranscriptResponse)

      const videoIdResult = VideoId.fromId('htmlEntity1')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')
      const videoId = videoIdResult.value

      // Act
      const result = await service.fetch(videoId)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.segments[0].text).toBe('Hello & world <test>')
        expect(result.value.segments[1].text).toBe('It\'s "great"')
      }
    })

    it('should return error for video without captions (disabled)', async () => {
      // Arrange
      vi.mocked(YoutubeTranscript.fetchTranscript).mockRejectedValue(
        new YoutubeTranscriptDisabledError('no-caption1')
      )

      const videoIdResult = VideoId.fromId('no-caption1')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')
      const videoId = videoIdResult.value

      // Act
      const result = await service.fetch(videoId)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('TranscriptFetchError')
        expect(result.error.reason).toContain('disabled')
      }
    })

    it('should return error for private/unavailable video', async () => {
      // Arrange
      vi.mocked(YoutubeTranscript.fetchTranscript).mockRejectedValue(
        new YoutubeTranscriptVideoUnavailableError('private1234')
      )

      const videoIdResult = VideoId.fromId('private1234')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')
      const videoId = videoIdResult.value

      // Act
      const result = await service.fetch(videoId)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('TranscriptFetchError')
        expect(result.error.reason).toContain('unavailable')
      }
    })

    it('should return error when transcript not available', async () => {
      // Arrange
      vi.mocked(YoutubeTranscript.fetchTranscript).mockRejectedValue(
        new YoutubeTranscriptNotAvailableError('notavail123')
      )

      const videoIdResult = VideoId.fromId('notavail123')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')
      const videoId = videoIdResult.value

      // Act
      const result = await service.fetch(videoId)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('TranscriptFetchError')
        expect(result.error.reason).toContain('not available')
      }
    })

    it('should handle network errors', async () => {
      // Arrange
      vi.mocked(YoutubeTranscript.fetchTranscript).mockRejectedValue(
        new Error('Failed to fetch')
      )

      const videoIdResult = VideoId.fromId('network1234')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')
      const videoId = videoIdResult.value

      // Act
      const result = await service.fetch(videoId)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('TranscriptFetchError')
        expect(result.error.videoId).toBe('network1234')
      }
    })

    it('should handle unknown errors', async () => {
      // Arrange
      vi.mocked(YoutubeTranscript.fetchTranscript).mockRejectedValue('Unknown error string')

      const videoIdResult = VideoId.fromId('unknown1234')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')
      const videoId = videoIdResult.value

      // Act
      const result = await service.fetch(videoId)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('TranscriptFetchError')
        expect(result.error.reason).toContain('Unknown error')
      }
    })

    it('should trim whitespace from text', async () => {
      // Arrange
      const mockTranscriptResponse = [
        { text: '   Hello world   ', offset: 0, duration: 5000 },
        { text: '  Multiple   spaces   ', offset: 5000, duration: 3000 },
      ]

      vi.mocked(YoutubeTranscript.fetchTranscript).mockResolvedValue(mockTranscriptResponse)

      const videoIdResult = VideoId.fromId('whitespace1')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')
      const videoId = videoIdResult.value

      // Act
      const result = await service.fetch(videoId)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.segments[0].text).toBe('Hello world')
        expect(result.value.segments[1].text).toBe('Multiple spaces')
      }
    })

    it('should return empty title (youtube-transcript does not provide it)', async () => {
      // Arrange
      const mockTranscriptResponse = [
        { text: 'Hello world', offset: 0, duration: 5000 },
      ]

      vi.mocked(YoutubeTranscript.fetchTranscript).mockResolvedValue(mockTranscriptResponse)

      const videoIdResult = VideoId.fromId('notitle1234')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')
      const videoId = videoIdResult.value

      // Act
      const result = await service.fetch(videoId)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.title).toBe('')
      }
    })
  })
})
