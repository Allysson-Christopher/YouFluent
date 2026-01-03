import { describe, it, expect } from 'vitest'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'

describe('VideoId', () => {
  describe('fromUrl', () => {
    it('should extract ID from youtube.com/watch?v=XXX', () => {
      const result = VideoId.fromUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('dQw4w9WgXcQ')
      }
    })

    it('should extract ID from youtu.be/XXX', () => {
      const result = VideoId.fromUrl('https://youtu.be/dQw4w9WgXcQ')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('dQw4w9WgXcQ')
      }
    })

    it('should extract ID from youtube.com/embed/XXX', () => {
      const result = VideoId.fromUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('dQw4w9WgXcQ')
      }
    })

    it('should handle URL with extra parameters', () => {
      const result = VideoId.fromUrl('https://www.youtube.com/watch?v=abc123_-XYZ&t=120')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('abc123_-XYZ')
      }
    })

    it('should handle URL without www', () => {
      const result = VideoId.fromUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('dQw4w9WgXcQ')
      }
    })

    it('should handle URL with http (non-https)', () => {
      const result = VideoId.fromUrl('http://www.youtube.com/watch?v=dQw4w9WgXcQ')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('dQw4w9WgXcQ')
      }
    })

    it('should fail for invalid URL', () => {
      const result = VideoId.fromUrl('not-a-url')
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('InvalidVideoUrlError')
      }
    })

    it('should fail for non-YouTube URL', () => {
      const result = VideoId.fromUrl('https://vimeo.com/123456')
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('InvalidVideoUrlError')
      }
    })

    it('should fail for YouTube URL without video ID', () => {
      const result = VideoId.fromUrl('https://www.youtube.com/')
      expect(result.isFailure).toBe(true)
    })

    it('should fail for empty string', () => {
      const result = VideoId.fromUrl('')
      expect(result.isFailure).toBe(true)
    })
  })

  describe('fromId', () => {
    it('should accept valid 11-character ID', () => {
      const result = VideoId.fromId('dQw4w9WgXcQ')
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.value).toBe('dQw4w9WgXcQ')
      }
    })

    it('should accept ID with underscores', () => {
      const result = VideoId.fromId('abc_123_XYZ')
      expect(result.isSuccess).toBe(true)
    })

    it('should accept ID with hyphens', () => {
      const result = VideoId.fromId('abc-123-XYZ')
      expect(result.isSuccess).toBe(true)
    })

    it('should fail for ID with wrong length (too short)', () => {
      const result = VideoId.fromId('short')
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('InvalidVideoIdError')
        expect(result.error.reason).toContain('11 characters')
      }
    })

    it('should fail for ID with wrong length (too long)', () => {
      const result = VideoId.fromId('thisIsTooLong12')
      expect(result.isFailure).toBe(true)
    })

    it('should fail for ID with invalid characters', () => {
      const result = VideoId.fromId('abc123!@#$%')
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('InvalidVideoIdError')
        expect(result.error.reason).toContain('Invalid characters')
      }
    })

    it('should fail for empty string', () => {
      const result = VideoId.fromId('')
      expect(result.isFailure).toBe(true)
    })
  })

  describe('equals', () => {
    it('should return true for same value', () => {
      const id1 = VideoId.fromId('dQw4w9WgXcQ')
      const id2 = VideoId.fromId('dQw4w9WgXcQ')
      if (id1.isSuccess && id2.isSuccess) {
        expect(id1.value.equals(id2.value)).toBe(true)
      }
    })

    it('should return false for different values', () => {
      const id1 = VideoId.fromId('dQw4w9WgXcQ')
      const id2 = VideoId.fromId('abc123_-XYZ')
      if (id1.isSuccess && id2.isSuccess) {
        expect(id1.value.equals(id2.value)).toBe(false)
      }
    })
  })

  describe('toString', () => {
    it('should return the video ID string', () => {
      const result = VideoId.fromId('dQw4w9WgXcQ')
      if (result.isSuccess) {
        expect(result.value.toString()).toBe('dQw4w9WgXcQ')
      }
    })
  })
})
