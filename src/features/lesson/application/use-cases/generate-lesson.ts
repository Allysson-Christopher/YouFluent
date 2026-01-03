import { Result } from '@/shared/core/result'
import { VideoId, InvalidVideoUrlError } from '@/features/transcript/domain'
import { FetchTranscriptUseCase, type FetchTranscriptError } from '@/features/transcript/application'
import {
  Lesson,
  Exercise,
  VocabularyItem,
  Difficulty,
  ExerciseType,
  LessonGenerationError,
  ExerciseValidationError,
  VocabularyValidationError,
  LessonValidationError,
  InvalidExerciseTypeError,
  type LessonRepository,
  type LessonGenerator,
  type GeneratedExerciseData,
  type GeneratedVocabularyData,
} from '../../domain'

/**
 * Union type of all possible GenerateLessonUseCase errors
 */
export type GenerateLessonError =
  | InvalidVideoUrlError
  | FetchTranscriptError
  | LessonGenerationError
  | ExerciseValidationError
  | VocabularyValidationError
  | LessonValidationError
  | InvalidExerciseTypeError

/**
 * Input DTO for GenerateLessonUseCase
 */
export interface GenerateLessonInput {
  readonly videoUrl: string
  readonly difficulty: Difficulty
}

/**
 * GenerateLessonUseCase
 *
 * Orchestrates the complete lesson generation flow:
 * 1. Extract VideoId from URL
 * 2. Check lesson cache (PostgreSQL)
 * 3. If miss, fetch transcript via FetchTranscriptUseCase
 * 4. Generate content via LessonGenerator (OpenAI)
 * 5. Create domain entities (Lesson, Exercise, VocabularyItem)
 * 6. Persist lesson to repository
 * 7. Return lesson
 *
 * PRE: videoUrl is a string, difficulty is a valid Difficulty
 * POST: Returns Lesson or specific error
 * ERRORS: InvalidVideoUrlError, FetchTranscriptError, LessonGenerationError,
 *         ExerciseValidationError, VocabularyValidationError, LessonValidationError
 */
export class GenerateLessonUseCase {
  constructor(
    private readonly lessonRepo: LessonRepository,
    private readonly fetchTranscript: FetchTranscriptUseCase,
    private readonly lessonGenerator: LessonGenerator
  ) {}

  /**
   * Execute the use case
   *
   * @param input - Input containing videoUrl and difficulty
   * @returns Result with Lesson or error
   */
  async execute(input: GenerateLessonInput): Promise<Result<Lesson, GenerateLessonError>> {
    // 1. Extract VideoId from URL
    const videoIdResult = VideoId.fromUrl(input.videoUrl)
    if (videoIdResult.isFailure) {
      return Result.fail(videoIdResult.error)
    }
    const videoId = videoIdResult.value

    // 2. Check lesson cache (PostgreSQL)
    const cachedLesson = await this.lessonRepo.findByVideoId(videoId)
    if (cachedLesson) {
      return Result.ok(cachedLesson) // Cache HIT
    }

    // 3. Fetch transcript via FetchTranscriptUseCase (cache MISS)
    const transcriptResult = await this.fetchTranscript.execute(input.videoUrl)
    if (transcriptResult.isFailure) {
      return Result.fail(transcriptResult.error)
    }
    const transcript = transcriptResult.value

    // 4. Generate content via LessonGenerator (OpenAI)
    const generationResult = await this.lessonGenerator.generate(
      transcript,
      input.difficulty
    )
    if (generationResult.isFailure) {
      return Result.fail(generationResult.error)
    }
    const generatedData = generationResult.value

    // 5. Create Exercise entities from generated data
    const exercisesResult = this.createExercises(generatedData.exercises)
    if (exercisesResult.isFailure) {
      return Result.fail(exercisesResult.error)
    }

    // 6. Create VocabularyItem entities from generated data
    const vocabularyResult = this.createVocabulary(generatedData.vocabulary)
    if (vocabularyResult.isFailure) {
      return Result.fail(vocabularyResult.error)
    }

    // 7. Create Lesson aggregate
    const lessonResult = Lesson.create({
      id: crypto.randomUUID(),
      videoId,
      title: generatedData.title,
      difficulty: input.difficulty,
      exercises: exercisesResult.value,
      vocabulary: vocabularyResult.value,
    })
    if (lessonResult.isFailure) {
      return Result.fail(lessonResult.error)
    }

    // 8. Persist lesson to repository
    await this.lessonRepo.save(lessonResult.value)

    return Result.ok(lessonResult.value)
  }

  /**
   * Create Exercise entities from raw generated data
   *
   * @param data - Array of generated exercise data
   * @returns Result with Exercise array or error
   */
  private createExercises(
    data: GeneratedExerciseData[]
  ): Result<Exercise[], ExerciseValidationError | InvalidExerciseTypeError> {
    const exercises: Exercise[] = []

    for (const item of data) {
      // Convert string type to ExerciseType value object
      const typeResult = ExerciseType.fromString(item.type)
      if (typeResult.isFailure) {
        return Result.fail(typeResult.error)
      }

      const exerciseResult = Exercise.create({
        id: crypto.randomUUID(),
        type: typeResult.value,
        question: item.question,
        answer: item.answer,
        options: item.options,
        explanation: item.explanation,
        chunkIndex: item.chunkIndex,
      })

      if (exerciseResult.isFailure) {
        return Result.fail(exerciseResult.error)
      }

      exercises.push(exerciseResult.value)
    }

    return Result.ok(exercises)
  }

  /**
   * Create VocabularyItem entities from raw generated data
   *
   * @param data - Array of generated vocabulary data
   * @returns Result with VocabularyItem array or error
   */
  private createVocabulary(
    data: GeneratedVocabularyData[]
  ): Result<VocabularyItem[], VocabularyValidationError> {
    const vocabulary: VocabularyItem[] = []

    for (const item of data) {
      const vocabResult = VocabularyItem.create({
        id: crypto.randomUUID(),
        word: item.word,
        definition: item.definition,
        example: item.example,
        partOfSpeech: item.partOfSpeech,
        chunkIndex: item.chunkIndex,
      })

      if (vocabResult.isFailure) {
        return Result.fail(vocabResult.error)
      }

      vocabulary.push(vocabResult.value)
    }

    return Result.ok(vocabulary)
  }
}
