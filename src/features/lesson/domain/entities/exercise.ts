import { Result } from '@/shared/core/result'
import { ExerciseValidationError } from '../errors/lesson-errors'
import { ExerciseType } from '../value-objects/exercise-type'

/**
 * Exercise creation properties
 */
export interface ExerciseProps {
  readonly id: string
  readonly type: ExerciseType
  readonly question: string
  readonly answer: string
  readonly options: string[] | null
  readonly explanation: string
  readonly chunkIndex: number
}

/**
 * Exercise Entity
 *
 * Represents an interactive exercise in a lesson.
 * Entities have identity and are compared by ID.
 *
 * INVARIANTS:
 * - id is non-empty
 * - question is non-empty (after trimming)
 * - answer is non-empty (after trimming)
 * - if type.requiresOptions, options must be non-empty array
 * - if options provided, answer must be in options
 * - chunkIndex is non-negative
 */
export class Exercise {
  /**
   * Private constructor enforces factory method usage
   */
  private constructor(
    readonly id: string,
    readonly type: ExerciseType,
    readonly question: string,
    readonly answer: string,
    readonly options: readonly string[] | null,
    readonly explanation: string,
    readonly chunkIndex: number
  ) {
    Object.freeze(this)
  }

  /**
   * Create a new Exercise
   *
   * PRE: props contains valid id, type, question, answer, options, explanation, chunkIndex
   * POST: Returns Success<Exercise> if all validations pass
   * ERRORS: ExerciseValidationError with field and message
   *
   * @param props - Exercise creation properties
   * @returns Result with Exercise or ExerciseValidationError
   */
  static create(props: ExerciseProps): Result<Exercise, ExerciseValidationError> {
    // Validate id
    if (!props.id || typeof props.id !== 'string' || props.id.trim() === '') {
      return Result.fail(new ExerciseValidationError('id', 'ID cannot be empty'))
    }

    // Validate question
    if (!props.question || typeof props.question !== 'string' || props.question.trim() === '') {
      return Result.fail(new ExerciseValidationError('question', 'Question cannot be empty'))
    }

    // Validate answer
    if (!props.answer || typeof props.answer !== 'string' || props.answer.trim() === '') {
      return Result.fail(new ExerciseValidationError('answer', 'Answer cannot be empty'))
    }

    // Validate options for multiple-choice
    if (props.type.requiresOptions) {
      if (!props.options || !Array.isArray(props.options) || props.options.length === 0) {
        return Result.fail(
          new ExerciseValidationError('options', 'Multiple-choice exercise requires options')
        )
      }
    }

    // Validate answer is in options (if options provided)
    if (props.options && props.options.length > 0) {
      const answerTrimmed = props.answer.trim()
      if (!props.options.includes(answerTrimmed)) {
        return Result.fail(
          new ExerciseValidationError('answer', 'Answer must be in options for multiple-choice')
        )
      }
    }

    // Validate chunkIndex
    if (props.chunkIndex < 0) {
      return Result.fail(new ExerciseValidationError('chunkIndex', 'Chunk index cannot be negative'))
    }

    // Freeze options array if provided
    const frozenOptions = props.options ? Object.freeze([...props.options]) : null

    return Result.ok(
      new Exercise(
        props.id.trim(),
        props.type,
        props.question.trim(),
        props.answer.trim(),
        frozenOptions,
        props.explanation?.trim() ?? '',
        props.chunkIndex
      )
    )
  }

  /**
   * Check if user's answer is correct
   *
   * @param userAnswer - User's provided answer
   * @returns true if answer is correct (case-insensitive, trimmed)
   */
  checkAnswer(userAnswer: string): boolean {
    if (!userAnswer || typeof userAnswer !== 'string') {
      return false
    }
    return userAnswer.trim().toLowerCase() === this.answer.toLowerCase()
  }

  /**
   * Compare two Exercise instances by id
   *
   * @param other - Exercise to compare with
   * @returns true if ids are equal
   */
  equals(other: Exercise): boolean {
    return this.id === other.id
  }
}
