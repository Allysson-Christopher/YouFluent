import { Result } from '@/shared/core/result'
import { Transcript } from '@/features/transcript/domain/entities/transcript'
import { LessonGenerationError } from '../errors/lesson-errors'
import { Difficulty } from '../value-objects/difficulty'
import { ExerciseTypeValue } from '../value-objects/exercise-type'
import { PartOfSpeech } from '../entities/vocabulary-item'

/**
 * Raw exercise data returned by the generator
 */
export interface GeneratedExerciseData {
  readonly type: ExerciseTypeValue
  readonly question: string
  readonly answer: string
  readonly options: string[] | null
  readonly explanation: string
  readonly chunkIndex: number
}

/**
 * Raw vocabulary data returned by the generator
 */
export interface GeneratedVocabularyData {
  readonly word: string
  readonly definition: string
  readonly example: string
  readonly partOfSpeech: PartOfSpeech
  readonly chunkIndex: number
}

/**
 * Complete generated lesson data
 */
export interface GeneratedLessonData {
  readonly title: string
  readonly exercises: GeneratedExerciseData[]
  readonly vocabulary: GeneratedVocabularyData[]
}

/**
 * LessonGenerator Interface
 *
 * Port for lesson generation (Hexagonal Architecture).
 * Implementation lives in Infrastructure layer (e.g., OpenAI).
 *
 * This interface allows dependency inversion - Domain layer
 * defines what it needs, Infrastructure layer provides it.
 */
export interface LessonGenerator {
  /**
   * Generate lesson content from transcript
   *
   * PRE: transcript is valid, difficulty is valid
   * POST: Returns generated lesson data if successful
   * ERRORS: LessonGenerationError on failure
   *
   * @param transcript - Source transcript for lesson generation
   * @param difficulty - Target difficulty level
   * @returns Result with GeneratedLessonData or LessonGenerationError
   */
  generate(
    transcript: Transcript,
    difficulty: Difficulty
  ): Promise<Result<GeneratedLessonData, LessonGenerationError>>
}
