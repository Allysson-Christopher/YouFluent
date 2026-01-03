/**
 * Integration Tests for PrismaLessonRepository
 *
 * These tests verify the repository implementation using a real
 * PostgreSQL database via Testcontainers.
 */
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { execSync } from 'child_process'
import { PrismaLessonRepository } from '@/features/lesson/infrastructure/repositories/prisma-lesson-repository'
import {
  Lesson,
  Exercise,
  VocabularyItem,
  Difficulty,
  ExerciseType,
} from '@/features/lesson/domain'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'

describe('PrismaLessonRepository', () => {
  let container: StartedPostgreSqlContainer
  let prisma: PrismaClient
  let repository: PrismaLessonRepository

  /**
   * Helper: Create a valid domain Lesson for testing
   */
  function createTestLesson(videoIdValue: string = 'dQw4w9WgXcQ'): Lesson {
    const videoIdResult = VideoId.fromId(videoIdValue)
    if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')

    const exercise1Result = Exercise.create({
      id: `exercise-1-${videoIdValue}`,
      type: ExerciseType.fillBlank(),
      question: 'Complete: I ___ to the store.',
      answer: 'went',
      options: null,
      explanation: 'Past tense of go',
      chunkIndex: 0,
    })
    if (!exercise1Result.isSuccess) throw new Error('Invalid exercise 1')

    const exercise2Result = Exercise.create({
      id: `exercise-2-${videoIdValue}`,
      type: ExerciseType.multipleChoice(),
      question: 'What is the correct word?',
      answer: 'happy',
      options: ['sad', 'happy', 'angry'],
      explanation: 'Happy is correct',
      chunkIndex: 2, // Out of order intentionally for sort test
    })
    if (!exercise2Result.isSuccess) throw new Error('Invalid exercise 2')

    const exercise3Result = Exercise.create({
      id: `exercise-3-${videoIdValue}`,
      type: ExerciseType.translation(),
      question: 'Translate: Hello',
      answer: 'Hola',
      options: null,
      explanation: 'Basic greeting',
      chunkIndex: 1, // Middle
    })
    if (!exercise3Result.isSuccess) throw new Error('Invalid exercise 3')

    const vocab1Result = VocabularyItem.create({
      id: `vocab-1-${videoIdValue}`,
      word: 'serendipity',
      definition: 'The occurrence of events by chance',
      example: 'Finding that book was serendipity.',
      partOfSpeech: 'noun',
      chunkIndex: 1, // Out of order
    })
    if (!vocab1Result.isSuccess) throw new Error('Invalid vocab 1')

    const vocab2Result = VocabularyItem.create({
      id: `vocab-2-${videoIdValue}`,
      word: 'ephemeral',
      definition: 'Lasting for a very short time',
      example: 'The ephemeral beauty of cherry blossoms.',
      partOfSpeech: 'adjective',
      chunkIndex: 0, // First
    })
    if (!vocab2Result.isSuccess) throw new Error('Invalid vocab 2')

    const lessonResult = Lesson.create({
      id: `lesson-${videoIdValue}`,
      videoId: videoIdResult.value,
      title: 'Test Lesson',
      difficulty: Difficulty.medium(),
      exercises: [exercise1Result.value, exercise2Result.value, exercise3Result.value],
      vocabulary: [vocab1Result.value, vocab2Result.value],
    })
    if (!lessonResult.isSuccess) throw new Error('Invalid lesson')

    return lessonResult.value
  }

  // SETUP: Start PostgreSQL container (60s timeout)
  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16').start()

    // Get connection string from container
    const connectionString = container.getConnectionUri()

    // Override DATABASE_URL for Prisma CLI
    process.env.DATABASE_URL = connectionString

    // Push schema to container database
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
    repository = new PrismaLessonRepository(prisma)
  }, 60000) // 60 second timeout for container startup

  // TEARDOWN: Stop container
  afterAll(async () => {
    if (prisma) await prisma.$disconnect()
    if (container) await container.stop()
  })

  // Cleanup between tests
  beforeEach(async () => {
    await prisma.vocabularyItem.deleteMany()
    await prisma.exercise.deleteMany()
    await prisma.lesson.deleteMany()
  })

  describe('save', () => {
    it('persists lesson with exercises and vocabulary', async () => {
      const lesson = createTestLesson()

      await repository.save(lesson)

      const found = await repository.findByVideoId(lesson.videoId)
      expect(found).not.toBeNull()
      expect(found?.id).toBe(lesson.id)
      expect(found?.videoId.value).toBe(lesson.videoId.value)
      expect(found?.title).toBe(lesson.title)
      expect(found?.difficulty.value).toBe(lesson.difficulty.value)
      expect(found?.exercises.length).toBe(3)
      expect(found?.vocabulary.length).toBe(2)
    })

    it('persists lesson with correct exercise data', async () => {
      const lesson = createTestLesson()

      await repository.save(lesson)

      const found = await repository.findByVideoId(lesson.videoId)
      const exercise = found?.exercises.find((e) => e.id.includes('exercise-2'))

      expect(exercise).toBeDefined()
      expect(exercise?.type.value).toBe('multiple-choice')
      expect(exercise?.question).toBe('What is the correct word?')
      expect(exercise?.answer).toBe('happy')
      expect(exercise?.options).toEqual(['sad', 'happy', 'angry'])
      expect(exercise?.explanation).toBe('Happy is correct')
    })

    it('persists lesson with correct vocabulary data', async () => {
      const lesson = createTestLesson()

      await repository.save(lesson)

      const found = await repository.findByVideoId(lesson.videoId)
      const vocab = found?.vocabulary.find((v) => v.id.includes('vocab-1'))

      expect(vocab).toBeDefined()
      expect(vocab?.word).toBe('serendipity')
      expect(vocab?.definition).toBe('The occurrence of events by chance')
      expect(vocab?.example).toBe('Finding that book was serendipity.')
      expect(vocab?.partOfSpeech).toBe('noun')
    })

    it('throws on duplicate videoId', async () => {
      const lesson1 = createTestLesson('dQw4w9WgXcQ')
      const lesson2 = createTestLesson('dQw4w9WgXcQ')
      // Override lesson2 ID to be different
      const lesson2Fixed = Lesson.create({
        id: 'lesson-2-different',
        videoId: lesson1.videoId,
        title: 'Different Lesson',
        difficulty: Difficulty.easy(),
        exercises: lesson2.exercises as Exercise[],
        vocabulary: lesson2.vocabulary as VocabularyItem[],
      })
      if (!lesson2Fixed.isSuccess) throw new Error('Invalid lesson2')

      await repository.save(lesson1)

      await expect(repository.save(lesson2Fixed.value)).rejects.toThrow()
    })
  })

  describe('findByVideoId', () => {
    it('returns null for non-existent video', async () => {
      const videoIdResult = VideoId.fromId('nonexistent')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')

      const result = await repository.findByVideoId(videoIdResult.value)

      expect(result).toBeNull()
    })

    it('returns lesson when exists', async () => {
      const lesson = createTestLesson()
      await repository.save(lesson)

      const found = await repository.findByVideoId(lesson.videoId)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(lesson.id)
    })

    it('returns exercises ordered by chunkIndex', async () => {
      const lesson = createTestLesson()
      await repository.save(lesson)

      const found = await repository.findByVideoId(lesson.videoId)

      expect(found?.exercises[0].chunkIndex).toBe(0)
      expect(found?.exercises[1].chunkIndex).toBe(1)
      expect(found?.exercises[2].chunkIndex).toBe(2)
    })

    it('returns vocabulary ordered by chunkIndex', async () => {
      const lesson = createTestLesson()
      await repository.save(lesson)

      const found = await repository.findByVideoId(lesson.videoId)

      expect(found?.vocabulary[0].chunkIndex).toBe(0)
      expect(found?.vocabulary[1].chunkIndex).toBe(1)
    })

    it('preserves createdAt timestamp', async () => {
      const lesson = createTestLesson()
      await repository.save(lesson)

      const found = await repository.findByVideoId(lesson.videoId)

      // createdAt should be very close (within 1 second)
      const diff = Math.abs(found!.createdAt.getTime() - lesson.createdAt.getTime())
      expect(diff).toBeLessThan(1000)
    })
  })

  describe('findById', () => {
    it('returns null for non-existent id', async () => {
      const result = await repository.findById('nonexistent')

      expect(result).toBeNull()
    })

    it('returns lesson when exists', async () => {
      const lesson = createTestLesson()
      await repository.save(lesson)

      const found = await repository.findById(lesson.id)

      expect(found).not.toBeNull()
      expect(found?.id).toBe(lesson.id)
      expect(found?.videoId.value).toBe(lesson.videoId.value)
    })

    it('returns exercises ordered by chunkIndex', async () => {
      const lesson = createTestLesson()
      await repository.save(lesson)

      const found = await repository.findById(lesson.id)

      expect(found?.exercises[0].chunkIndex).toBe(0)
      expect(found?.exercises[1].chunkIndex).toBe(1)
      expect(found?.exercises[2].chunkIndex).toBe(2)
    })
  })

  describe('exists', () => {
    it('returns true when lesson exists', async () => {
      const lesson = createTestLesson()
      await repository.save(lesson)

      const exists = await repository.exists(lesson.videoId)

      expect(exists).toBe(true)
    })

    it('returns false when lesson does not exist', async () => {
      const videoIdResult = VideoId.fromId('nonexistent')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')

      const exists = await repository.exists(videoIdResult.value)

      expect(exists).toBe(false)
    })
  })

  describe('deleteByVideoId', () => {
    it('deletes lesson', async () => {
      const lesson = createTestLesson()
      await repository.save(lesson)

      await repository.deleteByVideoId(lesson.videoId)

      const found = await repository.findByVideoId(lesson.videoId)
      expect(found).toBeNull()
    })

    it('cascades delete to exercises', async () => {
      const lesson = createTestLesson()
      await repository.save(lesson)

      await repository.deleteByVideoId(lesson.videoId)

      const exerciseCount = await prisma.exercise.count()
      expect(exerciseCount).toBe(0)
    })

    it('cascades delete to vocabulary', async () => {
      const lesson = createTestLesson()
      await repository.save(lesson)

      await repository.deleteByVideoId(lesson.videoId)

      const vocabCount = await prisma.vocabularyItem.count()
      expect(vocabCount).toBe(0)
    })

    it('does not throw for non-existent videoId', async () => {
      const videoIdResult = VideoId.fromId('nonexistent')
      if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')

      // Should not throw
      await expect(repository.deleteByVideoId(videoIdResult.value)).resolves.not.toThrow()
    })
  })
})
