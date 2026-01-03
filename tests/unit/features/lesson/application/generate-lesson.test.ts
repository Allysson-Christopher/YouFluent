import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Result } from '@/shared/core/result'
import {
  Lesson,
  Exercise,
  VocabularyItem,
  Difficulty,
  ExerciseType,
  LessonGenerationError,
  type LessonRepository,
  type LessonGenerator,
  type GeneratedLessonData,
  type GeneratedExerciseData,
  type GeneratedVocabularyData,
} from '@/features/lesson/domain'
import {
  Transcript,
  Chunk,
  VideoId,
  TranscriptFetchError,
} from '@/features/transcript/domain'
import { FetchTranscriptUseCase } from '@/features/transcript/application'
import {
  GenerateLessonUseCase,
  type GenerateLessonInput,
} from '@/features/lesson/application'

// ============================================================================
// Test Helpers & Mock Factories
// ============================================================================

function createMockVideoId(): VideoId {
  const result = VideoId.fromId('dQw4w9WgXcQ')
  if (result.isFailure) throw new Error('Failed to create mock VideoId')
  return result.value
}

function createMockChunk(): Chunk {
  const result = Chunk.create({
    id: crypto.randomUUID(),
    index: 0,
    startTime: 0,
    endTime: 30,
    text: 'Hello, this is a test transcript for lesson generation.',
  })
  if (result.isFailure) throw new Error('Failed to create mock Chunk')
  return result.value
}

function createMockTranscript(): Transcript {
  const result = Transcript.create({
    id: crypto.randomUUID(),
    videoId: createMockVideoId(),
    title: 'Test Video',
    language: 'en',
    chunks: [createMockChunk()],
  })
  if (result.isFailure) throw new Error('Failed to create mock Transcript')
  return result.value
}

function createMockExerciseData(): GeneratedExerciseData {
  return {
    type: 'fill-blank',
    question: 'Complete: Hello ___',
    answer: 'world',
    options: null,
    explanation: 'A common greeting phrase',
    chunkIndex: 0,
  }
}

function createMockVocabularyData(): GeneratedVocabularyData {
  return {
    word: 'hello',
    definition: 'A greeting used when meeting someone',
    example: 'Hello, how are you doing today?',
    partOfSpeech: 'phrase',
    chunkIndex: 0,
  }
}

function createMockGeneratedData(): GeneratedLessonData {
  return {
    title: 'Test Lesson: Greetings',
    exercises: [createMockExerciseData()],
    vocabulary: [createMockVocabularyData()],
  }
}

function createMockExercise(): Exercise {
  const typeResult = ExerciseType.fromString('fill-blank')
  if (typeResult.isFailure) throw new Error('Failed to create mock ExerciseType')

  const result = Exercise.create({
    id: crypto.randomUUID(),
    type: typeResult.value,
    question: 'Test question',
    answer: 'answer',
    options: null,
    explanation: 'Test explanation',
    chunkIndex: 0,
  })
  if (result.isFailure) throw new Error('Failed to create mock Exercise')
  return result.value
}

function createMockVocabularyItem(): VocabularyItem {
  const result = VocabularyItem.create({
    id: crypto.randomUUID(),
    word: 'test',
    definition: 'A test word',
    example: 'This is a test',
    partOfSpeech: 'noun',
    chunkIndex: 0,
  })
  if (result.isFailure) throw new Error('Failed to create mock VocabularyItem')
  return result.value
}

function createMockLesson(): Lesson {
  const result = Lesson.create({
    id: crypto.randomUUID(),
    videoId: createMockVideoId(),
    title: 'Cached Lesson',
    difficulty: Difficulty.medium(),
    exercises: [createMockExercise()],
    vocabulary: [createMockVocabularyItem()],
  })
  if (result.isFailure) throw new Error('Failed to create mock Lesson')
  return result.value
}

// ============================================================================
// Mock Implementations
// ============================================================================

const createMockLessonRepository = (): LessonRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  findByVideoId: vi.fn().mockResolvedValue(null),
  findById: vi.fn().mockResolvedValue(null),
  exists: vi.fn().mockResolvedValue(false),
  deleteByVideoId: vi.fn().mockResolvedValue(undefined),
})

const createMockFetchTranscript = (
  transcript: Transcript
): { execute: ReturnType<typeof vi.fn> } => ({
  execute: vi.fn().mockResolvedValue(Result.ok(transcript)),
})

const createMockLessonGenerator = (
  generatedData: GeneratedLessonData
): LessonGenerator => ({
  generate: vi.fn().mockResolvedValue(Result.ok(generatedData)),
})

// ============================================================================
// Tests
// ============================================================================

describe('GenerateLessonUseCase', () => {
  let lessonRepo: LessonRepository
  let fetchTranscript: { execute: ReturnType<typeof vi.fn> }
  let lessonGenerator: LessonGenerator
  let useCase: GenerateLessonUseCase

  const validVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  const mockTranscript = createMockTranscript()
  const mockGeneratedData = createMockGeneratedData()

  beforeEach(() => {
    vi.clearAllMocks()
    lessonRepo = createMockLessonRepository()
    fetchTranscript = createMockFetchTranscript(mockTranscript)
    lessonGenerator = createMockLessonGenerator(mockGeneratedData)
    useCase = new GenerateLessonUseCase(
      lessonRepo,
      fetchTranscript as unknown as FetchTranscriptUseCase,
      lessonGenerator
    )
  })

  describe('Cache Strategy', () => {
    it('should return cached lesson if exists (cache HIT)', async () => {
      // Arrange
      const cachedLesson = createMockLesson()
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(cachedLesson)

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: Difficulty.medium(),
      }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.id).toBe(cachedLesson.id)
        expect(result.value.title).toBe(cachedLesson.title)
      }

      // Should NOT call FetchTranscript or LessonGenerator (cache HIT)
      expect(fetchTranscript.execute).not.toHaveBeenCalled()
      expect(lessonGenerator.generate).not.toHaveBeenCalled()
      expect(lessonRepo.save).not.toHaveBeenCalled()
    })

    it('should generate new lesson if not cached (cache MISS)', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: Difficulty.medium(),
      }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(fetchTranscript.execute).toHaveBeenCalledWith(validVideoUrl)
      expect(lessonGenerator.generate).toHaveBeenCalled()
      expect(lessonRepo.save).toHaveBeenCalled()
    })
  })

  describe('Video URL Validation', () => {
    it('should return error for invalid video URL', async () => {
      // Arrange
      const input: GenerateLessonInput = {
        videoUrl: 'invalid-url',
        difficulty: Difficulty.medium(),
      }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('InvalidVideoUrlError')
      }
    })

    it('should handle youtube.com/watch URL format', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)
      const input: GenerateLessonInput = {
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        difficulty: Difficulty.easy(),
      }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.isSuccess).toBe(true)
    })

    it('should handle youtu.be URL format', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)
      const input: GenerateLessonInput = {
        videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
        difficulty: Difficulty.medium(),
      }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.isSuccess).toBe(true)
    })
  })

  describe('Error Propagation', () => {
    it('should propagate transcript fetch error', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)
      const transcriptError = new TranscriptFetchError('dQw4w9WgXcQ', 'Video unavailable')
      vi.mocked(fetchTranscript.execute).mockResolvedValue(Result.fail(transcriptError))

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: Difficulty.medium(),
      }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('TranscriptFetchError')
      }
    })

    it('should propagate lesson generation error', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)
      const generationError = new LessonGenerationError('OpenAI API rate limit exceeded')
      vi.mocked(lessonGenerator.generate).mockResolvedValue(Result.fail(generationError))

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: Difficulty.medium(),
      }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('LessonGenerationError')
      }
    })
  })

  describe('Difficulty Handling', () => {
    it('should pass difficulty to generator', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)
      const hardDifficulty = Difficulty.hard()

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: hardDifficulty,
      }

      // Act
      await useCase.execute(input)

      // Assert
      expect(lessonGenerator.generate).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ value: 'hard' })
      )
    })

    it('should set correct difficulty on generated lesson', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)
      const easyDifficulty = Difficulty.easy()

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: easyDifficulty,
      }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.difficulty.value).toBe('easy')
      }
    })
  })

  describe('Entity Creation', () => {
    it('should create lesson with exercises from generated data', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: Difficulty.medium(),
      }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.exercises.length).toBeGreaterThan(0)
        expect(result.value.exercises[0].question).toBe('Complete: Hello ___')
      }
    })

    it('should create lesson with vocabulary from generated data', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: Difficulty.medium(),
      }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.vocabulary.length).toBeGreaterThan(0)
        expect(result.value.vocabulary[0].word).toBe('hello')
      }
    })

    it('should use title from generated data', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: Difficulty.medium(),
      }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.title).toBe('Test Lesson: Greetings')
      }
    })

    it('should generate unique lesson ID', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: Difficulty.medium(),
      }

      // Act
      const result1 = await useCase.execute(input)

      // Reset and execute again
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)
      const result2 = await useCase.execute(input)

      // Assert
      if (result1.isSuccess && result2.isSuccess) {
        expect(result1.value.id).not.toBe(result2.value.id)
      }
    })
  })

  describe('Persistence', () => {
    it('should save lesson to repository', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: Difficulty.medium(),
      }

      // Act
      await useCase.execute(input)

      // Assert
      expect(lessonRepo.save).toHaveBeenCalledTimes(1)
      expect(lessonRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Lesson: Greetings',
        })
      )
    })

    it('should not save if lesson generation fails', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)
      vi.mocked(lessonGenerator.generate).mockResolvedValue(
        Result.fail(new LessonGenerationError('API error'))
      )

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: Difficulty.medium(),
      }

      // Act
      await useCase.execute(input)

      // Assert
      expect(lessonRepo.save).not.toHaveBeenCalled()
    })
  })

  describe('Integration Flow', () => {
    it('should call dependencies in correct order', async () => {
      // Arrange
      vi.mocked(lessonRepo.findByVideoId).mockResolvedValue(null)
      const callOrder: string[] = []

      vi.mocked(lessonRepo.findByVideoId).mockImplementation(async () => {
        callOrder.push('findByVideoId')
        return null
      })

      vi.mocked(fetchTranscript.execute).mockImplementation(async () => {
        callOrder.push('fetchTranscript')
        return Result.ok(mockTranscript)
      })

      vi.mocked(lessonGenerator.generate).mockImplementation(async () => {
        callOrder.push('generate')
        return Result.ok(mockGeneratedData)
      })

      vi.mocked(lessonRepo.save).mockImplementation(async () => {
        callOrder.push('save')
      })

      const input: GenerateLessonInput = {
        videoUrl: validVideoUrl,
        difficulty: Difficulty.medium(),
      }

      // Act
      await useCase.execute(input)

      // Assert
      expect(callOrder).toEqual([
        'findByVideoId',
        'fetchTranscript',
        'generate',
        'save',
      ])
    })
  })
})
