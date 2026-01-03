/**
 * Integration Tests for PrismaTranscriptRepository
 *
 * TDD: RED Phase - Writing tests first before implementation
 *
 * These tests verify the repository implementation using a real
 * PostgreSQL database via Testcontainers.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { execSync } from 'child_process'
import { PrismaTranscriptRepository } from '@/features/transcript/infrastructure/repositories/prisma-transcript-repository'
import { Transcript } from '@/features/transcript/domain/entities/transcript'
import { Chunk } from '@/features/transcript/domain/entities/chunk'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'

describe('PrismaTranscriptRepository', () => {
  let container: StartedPostgreSqlContainer
  let prisma: PrismaClient
  let repository: PrismaTranscriptRepository

  /**
   * Helper: Create a valid domain Transcript for testing
   */
  function createTestTranscript(videoIdStr: string = 'test1234567'): Transcript {
    const videoIdResult = VideoId.fromId(videoIdStr)
    if (videoIdResult.isFailure) throw new Error(`Invalid video ID: ${videoIdStr}`)

    const chunk1Result = Chunk.create({
      id: `chunk-1-${videoIdStr}`,
      index: 0,
      startTime: 0,
      endTime: 30,
      text: 'Hello world, this is the first chunk.',
    })
    if (chunk1Result.isFailure) throw new Error('Invalid chunk 1')

    const chunk2Result = Chunk.create({
      id: `chunk-2-${videoIdStr}`,
      index: 1,
      startTime: 30,
      endTime: 60,
      text: 'This is the second chunk of the transcript.',
    })
    if (chunk2Result.isFailure) throw new Error('Invalid chunk 2')

    const transcriptResult = Transcript.create({
      id: `transcript-${videoIdStr}`,
      videoId: videoIdResult.value,
      title: `Test Video for ${videoIdStr}`,
      language: 'en',
      chunks: [chunk1Result.value, chunk2Result.value],
    })
    if (transcriptResult.isFailure) throw new Error('Invalid transcript')

    return transcriptResult.value
  }

  // SETUP: Start PostgreSQL container (60s timeout)
  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16').start()

    // Get connection string from container
    const connectionString = container.getConnectionUri()

    // Override DATABASE_URL for Prisma CLI
    process.env.DATABASE_URL = connectionString

    // Push schema to container database
    // Note: This is a Testcontainer (ephemeral, for testing only)
    // The consent env var is required for Prisma's AI safety feature
    execSync('pnpm prisma db push --force-reset', {
      env: {
        ...process.env,
        PRISMA_USER_CONSENT_FOR_DANGEROUS_AI_ACTION: 'yes',
      },
      stdio: 'pipe',
    })

    // Create PrismaClient with Driver Adapter (Prisma 7.x)
    const adapter = new PrismaPg({ connectionString })
    prisma = new PrismaClient({ adapter })
    repository = new PrismaTranscriptRepository(prisma)
  }, 60000)

  // TEARDOWN: Stop container
  afterAll(async () => {
    if (prisma) await prisma.$disconnect()
    if (container) await container.stop()
  })

  // Cleanup between tests
  beforeEach(async () => {
    await prisma.chunk.deleteMany()
    await prisma.transcript.deleteMany()
  })

  describe('save', () => {
    it('should save transcript with chunks to database', async () => {
      // Arrange
      const transcript = createTestTranscript('save1234567')

      // Act
      await repository.save(transcript)

      // Assert - verify in database
      const saved = await prisma.transcript.findUnique({
        where: { videoId: 'save1234567' },
        include: { chunks: true },
      })

      expect(saved).not.toBeNull()
      expect(saved?.title).toBe('Test Video for save1234567')
      expect(saved?.language).toBe('en')
      expect(saved?.chunks).toHaveLength(2)
    })

    it('should persist fullText correctly', async () => {
      // Arrange
      const transcript = createTestTranscript('fulltext123')

      // Act
      await repository.save(transcript)

      // Assert
      const saved = await prisma.transcript.findUnique({
        where: { videoId: 'fulltext123' },
      })

      expect(saved?.fullText).toBe(
        'Hello world, this is the first chunk. This is the second chunk of the transcript.'
      )
    })

    it('should persist chunks with correct order', async () => {
      // Arrange
      const transcript = createTestTranscript('order123456')

      // Act
      await repository.save(transcript)

      // Assert
      const saved = await prisma.transcript.findUnique({
        where: { videoId: 'order123456' },
        include: { chunks: { orderBy: { index: 'asc' } } },
      })

      expect(saved?.chunks[0].index).toBe(0)
      expect(saved?.chunks[0].text).toBe('Hello world, this is the first chunk.')
      expect(saved?.chunks[1].index).toBe(1)
      expect(saved?.chunks[1].text).toBe('This is the second chunk of the transcript.')
    })
  })

  describe('findByVideoId', () => {
    it('should return transcript if exists', async () => {
      // Arrange
      const transcript = createTestTranscript('find1234567')
      await repository.save(transcript)

      const videoIdResult = VideoId.fromId('find1234567')
      if (videoIdResult.isFailure) throw new Error('Invalid video ID')

      // Act
      const found = await repository.findByVideoId(videoIdResult.value)

      // Assert
      expect(found).not.toBeNull()
      expect(found?.videoId.value).toBe('find1234567')
      expect(found?.title).toBe('Test Video for find1234567')
      expect(found?.chunks).toHaveLength(2)
    })

    it('should return null if transcript does not exist', async () => {
      // Arrange
      const videoIdResult = VideoId.fromId('notexist123')
      if (videoIdResult.isFailure) throw new Error('Invalid video ID')

      // Act
      const found = await repository.findByVideoId(videoIdResult.value)

      // Assert
      expect(found).toBeNull()
    })

    it('should return chunks ordered by index', async () => {
      // Arrange
      const transcript = createTestTranscript('ordered1234')
      await repository.save(transcript)

      const videoIdResult = VideoId.fromId('ordered1234')
      if (videoIdResult.isFailure) throw new Error('Invalid video ID')

      // Act
      const found = await repository.findByVideoId(videoIdResult.value)

      // Assert
      expect(found?.chunks[0].index).toBe(0)
      expect(found?.chunks[1].index).toBe(1)
    })

    it('should preserve chunk timing data', async () => {
      // Arrange
      const transcript = createTestTranscript('timing12345')
      await repository.save(transcript)

      const videoIdResult = VideoId.fromId('timing12345')
      if (videoIdResult.isFailure) throw new Error('Invalid video ID')

      // Act
      const found = await repository.findByVideoId(videoIdResult.value)

      // Assert
      expect(found?.chunks[0].startTime).toBe(0)
      expect(found?.chunks[0].endTime).toBe(30)
      expect(found?.chunks[1].startTime).toBe(30)
      expect(found?.chunks[1].endTime).toBe(60)
    })
  })

  describe('exists', () => {
    it('should return true if transcript exists', async () => {
      // Arrange
      const transcript = createTestTranscript('exists12345')
      await repository.save(transcript)

      const videoIdResult = VideoId.fromId('exists12345')
      if (videoIdResult.isFailure) throw new Error('Invalid video ID')

      // Act
      const exists = await repository.exists(videoIdResult.value)

      // Assert
      expect(exists).toBe(true)
    })

    it('should return false if transcript does not exist', async () => {
      // Arrange
      const videoIdResult = VideoId.fromId('noexist1234')
      if (videoIdResult.isFailure) throw new Error('Invalid video ID')

      // Act
      const exists = await repository.exists(videoIdResult.value)

      // Assert
      expect(exists).toBe(false)
    })
  })

  describe('deleteByVideoId', () => {
    it('should delete transcript and all its chunks', async () => {
      // Arrange
      const transcript = createTestTranscript('delete12345')
      await repository.save(transcript)

      const videoIdResult = VideoId.fromId('delete12345')
      if (videoIdResult.isFailure) throw new Error('Invalid video ID')

      // Act
      await repository.deleteByVideoId(videoIdResult.value)

      // Assert - transcript should be deleted
      const found = await repository.findByVideoId(videoIdResult.value)
      expect(found).toBeNull()

      // Assert - chunks should be deleted (cascade)
      const chunks = await prisma.chunk.findMany({
        where: { transcriptId: `transcript-delete12345` },
      })
      expect(chunks).toHaveLength(0)
    })

    it('should not throw if transcript does not exist', async () => {
      // Arrange
      const videoIdResult = VideoId.fromId('nothere1234')
      if (videoIdResult.isFailure) throw new Error('Invalid video ID')

      // Act & Assert - should not throw
      await expect(repository.deleteByVideoId(videoIdResult.value)).resolves.not.toThrow()
    })
  })
})
