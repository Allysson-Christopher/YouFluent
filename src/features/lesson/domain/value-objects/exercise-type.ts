import { Result } from '@/shared/core/result'
import { InvalidExerciseTypeError } from '../errors/lesson-errors'

/**
 * Valid exercise type values
 */
export type ExerciseTypeValue = 'fill-blank' | 'multiple-choice' | 'translation' | 'listening'

/**
 * Valid exercise types array for validation
 */
const VALID_TYPES: ExerciseTypeValue[] = ['fill-blank', 'multiple-choice', 'translation', 'listening']

/**
 * Types that require text input from user
 */
const TEXT_INPUT_TYPES: ExerciseTypeValue[] = ['fill-blank', 'translation']

/**
 * Types that require options to be provided
 */
const OPTIONS_REQUIRED_TYPES: ExerciseTypeValue[] = ['multiple-choice']

/**
 * ExerciseType Value Object
 *
 * Represents the type of an exercise.
 * Value Objects are immutable and compared by value.
 *
 * INVARIANTS:
 * - value is always one of: 'fill-blank', 'multiple-choice', 'translation', 'listening'
 */
export class ExerciseType {
  /**
   * Private constructor enforces factory method usage
   */
  private constructor(readonly value: ExerciseTypeValue) {
    Object.freeze(this)
  }

  /**
   * Create fill-blank exercise type
   *
   * @returns ExerciseType with value 'fill-blank'
   */
  static fillBlank(): ExerciseType {
    return new ExerciseType('fill-blank')
  }

  /**
   * Create multiple-choice exercise type
   *
   * @returns ExerciseType with value 'multiple-choice'
   */
  static multipleChoice(): ExerciseType {
    return new ExerciseType('multiple-choice')
  }

  /**
   * Create translation exercise type
   *
   * @returns ExerciseType with value 'translation'
   */
  static translation(): ExerciseType {
    return new ExerciseType('translation')
  }

  /**
   * Create listening exercise type
   *
   * @returns ExerciseType with value 'listening'
   */
  static listening(): ExerciseType {
    return new ExerciseType('listening')
  }

  /**
   * Create ExerciseType from string
   *
   * PRE: value is a string
   * POST: Returns Success<ExerciseType> if value is valid
   * ERRORS: InvalidExerciseTypeError if value is not a valid type
   *
   * @param value - String representation of exercise type
   * @returns Result with ExerciseType or InvalidExerciseTypeError
   */
  static fromString(value: string): Result<ExerciseType, InvalidExerciseTypeError> {
    if (!value || !VALID_TYPES.includes(value as ExerciseTypeValue)) {
      return Result.fail(new InvalidExerciseTypeError(value))
    }
    return Result.ok(new ExerciseType(value as ExerciseTypeValue))
  }

  /**
   * Whether this exercise type requires text input from user
   *
   * @returns true if fill-blank or translation
   */
  get requiresTextInput(): boolean {
    return TEXT_INPUT_TYPES.includes(this.value)
  }

  /**
   * Whether this exercise type requires options to be provided
   *
   * @returns true if multiple-choice
   */
  get requiresOptions(): boolean {
    return OPTIONS_REQUIRED_TYPES.includes(this.value)
  }

  /**
   * Compare two ExerciseType instances by value
   *
   * @param other - ExerciseType to compare with
   * @returns true if values are equal
   */
  equals(other: ExerciseType): boolean {
    return this.value === other.value
  }

  /**
   * Get string representation
   *
   * @returns The exercise type string
   */
  toString(): string {
    return this.value
  }
}
