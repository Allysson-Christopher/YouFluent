/**
 * Integration Tests for OpenAILessonGenerator
 *
 * These tests verify the infrastructure service that generates
 * lessons using the OpenAI API with structured outputs.
 *
 * Uses MSW to mock the OpenAI API responses.
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { server } from '../../../setup/msw-server'
import {
  mockLessonOutput,
  rateLimitHandler,
  emptyResponseHandler,
  apiErrorHandler,
  refusalHandler,
} from '../../../mocks/openai'
import { OpenAILessonGenerator } from '@/features/lesson/infrastructure/services/openai-lesson-generator'
import { Transcript } from '@/features/transcript/domain/entities/transcript'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'
import { Chunk } from '@/features/transcript/domain/entities/chunk'
import { Difficulty } from '@/features/lesson/domain/value-objects/difficulty'

/**
 * Create a mock transcript for testing
 */
function createMockTranscript(): Transcript {
  const videoIdResult = VideoId.fromId('test12345ab')
  if (!videoIdResult.isSuccess) throw new Error('Invalid video ID')

  const chunk0Result = Chunk.create({
    id: 'chunk-0',
    index: 0,
    startTime: 0,
    endTime: 30,
    text: 'Welcome to this video about learning English. Today we will discuss effective techniques for improving your language skills.',
  })
  if (!chunk0Result.isSuccess) throw new Error('Invalid chunk 0')

  const chunk1Result = Chunk.create({
    id: 'chunk-1',
    index: 1,
    startTime: 30,
    endTime: 60,
    text: 'Practice makes perfect. Reading for 15 minutes every day can significantly improve your comprehension.',
  })
  if (!chunk1Result.isSuccess) throw new Error('Invalid chunk 1')

  const chunk2Result = Chunk.create({
    id: 'chunk-2',
    index: 2,
    startTime: 60,
    endTime: 90,
    text: 'Learning a language requires patience and dedication. Gradually, you will become more fluent in your conversations.',
  })
  if (!chunk2Result.isSuccess) throw new Error('Invalid chunk 2')

  const chunks: Chunk[] = [chunk0Result.value, chunk1Result.value, chunk2Result.value]

  const transcriptResult = Transcript.create({
    id: 'transcript-1',
    videoId: videoIdResult.value,
    title: 'English Learning Tips',
    language: 'en',
    chunks,
  })

  if (!transcriptResult.isSuccess) throw new Error('Invalid transcript')
  return transcriptResult.value
}

describe('OpenAILessonGenerator', () => {
  let generator: OpenAILessonGenerator
  let transcript: Transcript
  let difficulty: Difficulty

  beforeEach(() => {
    // Disable retries for testing to avoid timeouts on error cases
    generator = new OpenAILessonGenerator({ apiKey: 'test-api-key', maxRetries: 0 })
    transcript = createMockTranscript()
    difficulty = Difficulty.medium()
  })

  describe('generate', () => {
    it('should generate lesson with exercises and vocabulary', async () => {
      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.title).toBe(mockLessonOutput.title)
        expect(result.value.exercises.length).toBeGreaterThanOrEqual(5)
        expect(result.value.vocabulary.length).toBeGreaterThanOrEqual(8)
      }
    })

    it('should generate exercises with correct structure', async () => {
      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        const exercise = result.value.exercises[0]
        expect(exercise).toHaveProperty('type')
        expect(exercise).toHaveProperty('question')
        expect(exercise).toHaveProperty('answer')
        expect(exercise).toHaveProperty('options')
        expect(exercise).toHaveProperty('explanation')
        expect(exercise).toHaveProperty('chunkIndex')
      }
    })

    it('should generate vocabulary with correct structure', async () => {
      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        const vocab = result.value.vocabulary[0]
        expect(vocab).toHaveProperty('word')
        expect(vocab).toHaveProperty('definition')
        expect(vocab).toHaveProperty('example')
        expect(vocab).toHaveProperty('partOfSpeech')
        expect(vocab).toHaveProperty('chunkIndex')
      }
    })

    it('should generate mix of exercise types', async () => {
      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        const types = new Set(result.value.exercises.map((e) => e.type))
        expect(types.size).toBeGreaterThan(1)
      }
    })

    it('should generate multiple-choice exercises with options', async () => {
      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        const mcExercise = result.value.exercises.find((e) => e.type === 'multiple-choice')
        expect(mcExercise).toBeDefined()
        expect(mcExercise?.options).not.toBeNull()
        expect(mcExercise?.options?.length).toBe(4)
      }
    })

    it('should work with easy difficulty', async () => {
      // Arrange
      const easyDifficulty = Difficulty.easy()

      // Act
      const result = await generator.generate(transcript, easyDifficulty)

      // Assert
      expect(result.isSuccess).toBe(true)
    })

    it('should work with hard difficulty', async () => {
      // Arrange
      const hardDifficulty = Difficulty.hard()

      // Act
      const result = await generator.generate(transcript, hardDifficulty)

      // Assert
      expect(result.isSuccess).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should handle rate limit error', async () => {
      // Arrange
      server.use(rateLimitHandler)

      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('LessonGenerationError')
        expect(result.error.reason).toContain('Rate limit')
      }
    })

    it('should handle empty response', async () => {
      // Arrange
      server.use(emptyResponseHandler)

      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('LessonGenerationError')
        expect(result.error.reason).toContain('Empty response')
      }
    })

    it('should handle API error', async () => {
      // Arrange
      server.use(apiErrorHandler)

      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('LessonGenerationError')
        expect(result.error.reason).toContain('API error')
      }
    })

    it('should handle model refusal', async () => {
      // Arrange
      server.use(refusalHandler)

      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('LessonGenerationError')
        expect(result.error.reason).toContain('Model refused')
      }
    })
  })

  describe('vocabulary validation', () => {
    it('should generate vocabulary with valid parts of speech', async () => {
      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        const validPartsOfSpeech = ['noun', 'verb', 'adjective', 'adverb', 'phrase']
        result.value.vocabulary.forEach((vocab) => {
          expect(validPartsOfSpeech).toContain(vocab.partOfSpeech)
        })
      }
    })

    it('should include mix of parts of speech', async () => {
      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        const partsOfSpeech = new Set(result.value.vocabulary.map((v) => v.partOfSpeech))
        expect(partsOfSpeech.size).toBeGreaterThan(2)
      }
    })
  })

  describe('exercise validation', () => {
    it('should generate exercises with valid types', async () => {
      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        const validTypes = ['fill-blank', 'multiple-choice', 'translation', 'listening']
        result.value.exercises.forEach((exercise) => {
          expect(validTypes).toContain(exercise.type)
        })
      }
    })

    it('should have valid chunk indices', async () => {
      // Act
      const result = await generator.generate(transcript, difficulty)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        const maxChunkIndex = transcript.chunks.length - 1
        result.value.exercises.forEach((exercise) => {
          expect(exercise.chunkIndex).toBeGreaterThanOrEqual(0)
          expect(exercise.chunkIndex).toBeLessThanOrEqual(maxChunkIndex)
        })
      }
    })
  })
})
