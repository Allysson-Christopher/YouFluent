import { Result } from '@/shared/core/result'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'
import { LessonValidationError } from '../errors/lesson-errors'
import { Difficulty } from '../value-objects/difficulty'
import { Exercise } from './exercise'
import { VocabularyItem } from './vocabulary-item'

/**
 * Lesson creation properties
 */
export interface LessonProps {
  readonly id: string
  readonly videoId: VideoId
  readonly title: string
  readonly difficulty: Difficulty
  readonly exercises: Exercise[]
  readonly vocabulary: VocabularyItem[]
}

/**
 * Lesson reconstitution properties (from database)
 */
export interface LessonReconstitutionProps extends LessonProps {
  readonly createdAt: Date
}

/**
 * Lesson Aggregate Root
 *
 * Represents a complete lesson generated from a video transcript.
 * Aggregate Root is the entry point for the lesson bounded context.
 *
 * INVARIANTS:
 * - id is non-empty
 * - title is non-empty (after trimming)
 * - exercises is non-empty (at least 1)
 * - vocabulary is non-empty (at least 1)
 */
export class Lesson {
  /**
   * Private constructor enforces factory method usage
   */
  private constructor(
    readonly id: string,
    readonly videoId: VideoId,
    readonly title: string,
    readonly difficulty: Difficulty,
    readonly exercises: readonly Exercise[],
    readonly vocabulary: readonly VocabularyItem[],
    readonly createdAt: Date
  ) {
    Object.freeze(this)
  }

  /**
   * Create a new Lesson
   *
   * PRE: props contains valid id, videoId, title, difficulty, exercises, vocabulary
   * POST: Returns Success<Lesson> if all validations pass
   * ERRORS: LessonValidationError with field and message
   *
   * @param props - Lesson creation properties
   * @returns Result with Lesson or LessonValidationError
   */
  static create(props: LessonProps): Result<Lesson, LessonValidationError> {
    // Validate id
    if (!props.id || typeof props.id !== 'string' || props.id.trim() === '') {
      return Result.fail(new LessonValidationError('id', 'ID cannot be empty'))
    }

    // Validate title
    if (!props.title || typeof props.title !== 'string' || props.title.trim() === '') {
      return Result.fail(new LessonValidationError('title', 'Title cannot be empty'))
    }

    // Validate exercises (at least 1)
    if (!props.exercises || !Array.isArray(props.exercises) || props.exercises.length === 0) {
      return Result.fail(
        new LessonValidationError('exercises', 'At least one exercise is required')
      )
    }

    // Validate vocabulary (at least 1)
    if (!props.vocabulary || !Array.isArray(props.vocabulary) || props.vocabulary.length === 0) {
      return Result.fail(
        new LessonValidationError('vocabulary', 'At least one vocabulary item is required')
      )
    }

    // Freeze arrays
    const frozenExercises = Object.freeze([...props.exercises])
    const frozenVocabulary = Object.freeze([...props.vocabulary])

    return Result.ok(
      new Lesson(
        props.id.trim(),
        props.videoId,
        props.title.trim(),
        props.difficulty,
        frozenExercises,
        frozenVocabulary,
        new Date()
      )
    )
  }

  /**
   * Reconstitute a Lesson from persistence
   *
   * Used by mappers to reconstruct domain entities from database records.
   * Skips validation as data comes from trusted source (database).
   *
   * PRE: props contains all valid data from database
   * POST: Returns Lesson instance with original createdAt
   *
   * @param props - Lesson reconstitution properties including createdAt
   * @returns Lesson instance
   */
  static reconstitute(props: LessonReconstitutionProps): Lesson {
    const frozenExercises = Object.freeze([...props.exercises])
    const frozenVocabulary = Object.freeze([...props.vocabulary])

    return new Lesson(
      props.id,
      props.videoId,
      props.title,
      props.difficulty,
      frozenExercises,
      frozenVocabulary,
      props.createdAt
    )
  }

  /**
   * Get number of exercises
   *
   * @returns Number of exercises
   */
  get exerciseCount(): number {
    return this.exercises.length
  }

  /**
   * Get number of vocabulary items
   *
   * @returns Number of vocabulary items
   */
  get vocabularyCount(): number {
    return this.vocabulary.length
  }

  /**
   * Find exercise by id
   *
   * @param id - Exercise id to find
   * @returns Exercise if found, null otherwise
   */
  getExerciseById(id: string): Exercise | null {
    return this.exercises.find((exercise) => exercise.id === id) ?? null
  }

  /**
   * Find vocabulary item by id
   *
   * @param id - Vocabulary item id to find
   * @returns VocabularyItem if found, null otherwise
   */
  getVocabularyById(id: string): VocabularyItem | null {
    return this.vocabulary.find((vocab) => vocab.id === id) ?? null
  }

  /**
   * Compare two Lesson instances by id
   *
   * @param other - Lesson to compare with
   * @returns true if ids are equal
   */
  equals(other: Lesson): boolean {
    return this.id === other.id
  }
}
