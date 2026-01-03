/**
 * Unit Tests for TranscriptMapper
 *
 * TDD: RED Phase - Writing tests first before implementation
 *
 * These tests verify the mapping between Prisma models and Domain entities.
 */
import { describe, it, expect } from 'vitest'
import { TranscriptMapper } from '@/features/transcript/infrastructure/mappers/transcript-mapper'
import { Transcript } from '@/features/transcript/domain/entities/transcript'
import { Chunk } from '@/features/transcript/domain/entities/chunk'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'
import type { Transcript as PrismaTranscript, Chunk as PrismaChunk } from '@prisma/client'

// Type for Prisma Transcript with Chunks
type PrismaTranscriptWithChunks = PrismaTranscript & { chunks: PrismaChunk[] }

describe('TranscriptMapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma Transcript to Domain Transcript', () => {
      // Arrange
      const prismaTranscript: PrismaTranscriptWithChunks = {
        id: 'transcript-123',
        videoId: 'video123456',
        title: 'Test Video Title',
        language: 'en',
        fullText: 'Hello world. This is a test.',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        chunks: [
          {
            id: 'chunk-1',
            index: 0,
            startTime: 0,
            endTime: 15,
            text: 'Hello world.',
            transcriptId: 'transcript-123',
          },
          {
            id: 'chunk-2',
            index: 1,
            startTime: 15,
            endTime: 30,
            text: 'This is a test.',
            transcriptId: 'transcript-123',
          },
        ],
      }

      // Act
      const domainTranscript = TranscriptMapper.toDomain(prismaTranscript)

      // Assert
      expect(domainTranscript.id).toBe('transcript-123')
      expect(domainTranscript.videoId.value).toBe('video123456')
      expect(domainTranscript.title).toBe('Test Video Title')
      expect(domainTranscript.language).toBe('en')
      expect(domainTranscript.chunks.length).toBe(2)
    })

    it('should convert Prisma Chunks to Domain Chunks with correct order', () => {
      // Arrange - chunks out of order
      const prismaTranscript: PrismaTranscriptWithChunks = {
        id: 'transcript-456',
        videoId: 'order123456',
        title: 'Order Test',
        language: 'pt',
        fullText: 'Second chunk First chunk',
        createdAt: new Date(),
        chunks: [
          {
            id: 'chunk-b',
            index: 1,
            startTime: 30,
            endTime: 60,
            text: 'Second chunk',
            transcriptId: 'transcript-456',
          },
          {
            id: 'chunk-a',
            index: 0,
            startTime: 0,
            endTime: 30,
            text: 'First chunk',
            transcriptId: 'transcript-456',
          },
        ],
      }

      // Act
      const domainTranscript = TranscriptMapper.toDomain(prismaTranscript)

      // Assert - chunks should be sorted by index
      expect(domainTranscript.chunks[0].index).toBe(0)
      expect(domainTranscript.chunks[0].text).toBe('First chunk')
      expect(domainTranscript.chunks[1].index).toBe(1)
      expect(domainTranscript.chunks[1].text).toBe('Second chunk')
    })

    it('should preserve chunk timing data', () => {
      // Arrange
      const prismaTranscript: PrismaTranscriptWithChunks = {
        id: 'transcript-789',
        videoId: 'timing12345',
        title: 'Timing Test',
        language: 'en',
        fullText: 'Test content',
        createdAt: new Date(),
        chunks: [
          {
            id: 'chunk-timing',
            index: 0,
            startTime: 5.5,
            endTime: 10.25,
            text: 'Test content',
            transcriptId: 'transcript-789',
          },
        ],
      }

      // Act
      const domainTranscript = TranscriptMapper.toDomain(prismaTranscript)

      // Assert
      expect(domainTranscript.chunks[0].startTime).toBe(5.5)
      expect(domainTranscript.chunks[0].endTime).toBe(10.25)
      expect(domainTranscript.chunks[0].duration).toBeCloseTo(4.75)
    })
  })

  describe('toPrisma', () => {
    it('should convert Domain Transcript to Prisma data', () => {
      // Arrange
      const videoIdResult = VideoId.fromId('domain12345')
      if (videoIdResult.isFailure) throw new Error('Invalid video ID')

      const chunk1Result = Chunk.create({
        id: 'chunk-d1',
        index: 0,
        startTime: 0,
        endTime: 15,
        text: 'Domain chunk one',
      })
      if (chunk1Result.isFailure) throw new Error('Invalid chunk')

      const chunk2Result = Chunk.create({
        id: 'chunk-d2',
        index: 1,
        startTime: 15,
        endTime: 30,
        text: 'Domain chunk two',
      })
      if (chunk2Result.isFailure) throw new Error('Invalid chunk')

      const transcriptResult = Transcript.create({
        id: 'domain-transcript-1',
        videoId: videoIdResult.value,
        title: 'Domain Test Video',
        language: 'es',
        chunks: [chunk1Result.value, chunk2Result.value],
      })
      if (transcriptResult.isFailure) throw new Error('Invalid transcript')

      // Act
      const prismaData = TranscriptMapper.toPrisma(transcriptResult.value)

      // Assert
      expect(prismaData.id).toBe('domain-transcript-1')
      expect(prismaData.videoId).toBe('domain12345')
      expect(prismaData.title).toBe('Domain Test Video')
      expect(prismaData.language).toBe('es')
      expect(prismaData.fullText).toBe('Domain chunk one Domain chunk two')
      expect(prismaData.chunks.length).toBe(2)
    })

    it('should convert chunks correctly', () => {
      // Arrange
      const videoIdResult = VideoId.fromId('chunks12345')
      if (videoIdResult.isFailure) throw new Error('Invalid video ID')

      const chunkResult = Chunk.create({
        id: 'chunk-convert',
        index: 5,
        startTime: 100.5,
        endTime: 120.75,
        text: 'Converted chunk text',
      })
      if (chunkResult.isFailure) throw new Error('Invalid chunk')

      const transcriptResult = Transcript.create({
        id: 'convert-transcript',
        videoId: videoIdResult.value,
        title: 'Conversion Test',
        language: 'fr',
        chunks: [chunkResult.value],
      })
      if (transcriptResult.isFailure) throw new Error('Invalid transcript')

      // Act
      const prismaData = TranscriptMapper.toPrisma(transcriptResult.value)

      // Assert
      expect(prismaData.chunks[0].id).toBe('chunk-convert')
      expect(prismaData.chunks[0].index).toBe(5)
      expect(prismaData.chunks[0].startTime).toBe(100.5)
      expect(prismaData.chunks[0].endTime).toBe(120.75)
      expect(prismaData.chunks[0].text).toBe('Converted chunk text')
    })

    it('should include createdAt in prisma data', () => {
      // Arrange
      const videoIdResult = VideoId.fromId('created1234')
      if (videoIdResult.isFailure) throw new Error('Invalid video ID')

      const chunkResult = Chunk.create({
        id: 'chunk-date',
        index: 0,
        startTime: 0,
        endTime: 10,
        text: 'Date test',
      })
      if (chunkResult.isFailure) throw new Error('Invalid chunk')

      const transcriptResult = Transcript.create({
        id: 'date-transcript',
        videoId: videoIdResult.value,
        title: 'Date Test',
        language: 'en',
        chunks: [chunkResult.value],
      })
      if (transcriptResult.isFailure) throw new Error('Invalid transcript')

      // Act
      const prismaData = TranscriptMapper.toPrisma(transcriptResult.value)

      // Assert
      expect(prismaData.createdAt).toBeInstanceOf(Date)
    })
  })
})
