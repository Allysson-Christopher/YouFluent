import { Result } from '@/shared/core/result'
import { InvalidDifficultyError } from '../errors/lesson-errors'

/**
 * Valid difficulty levels
 */
export type DifficultyLevel = 'easy' | 'medium' | 'hard'

/**
 * Valid difficulty levels array for validation
 */
const VALID_DIFFICULTIES: DifficultyLevel[] = ['easy', 'medium', 'hard']

/**
 * Difficulty Value Object
 *
 * Represents the difficulty level of a lesson.
 * Value Objects are immutable and compared by value.
 *
 * INVARIANTS:
 * - value is always one of: 'easy', 'medium', 'hard'
 */
export class Difficulty {
  /**
   * Private constructor enforces factory method usage
   */
  private constructor(readonly value: DifficultyLevel) {
    Object.freeze(this)
  }

  /**
   * Create easy difficulty
   *
   * @returns Difficulty with value 'easy'
   */
  static easy(): Difficulty {
    return new Difficulty('easy')
  }

  /**
   * Create medium difficulty
   *
   * @returns Difficulty with value 'medium'
   */
  static medium(): Difficulty {
    return new Difficulty('medium')
  }

  /**
   * Create hard difficulty
   *
   * @returns Difficulty with value 'hard'
   */
  static hard(): Difficulty {
    return new Difficulty('hard')
  }

  /**
   * Create Difficulty from string
   *
   * PRE: value is a string
   * POST: Returns Success<Difficulty> if value is valid
   * ERRORS: InvalidDifficultyError if value is not easy/medium/hard
   *
   * @param value - String representation of difficulty
   * @returns Result with Difficulty or InvalidDifficultyError
   */
  static fromString(value: string): Result<Difficulty, InvalidDifficultyError> {
    if (!value || !VALID_DIFFICULTIES.includes(value as DifficultyLevel)) {
      return Result.fail(new InvalidDifficultyError(value))
    }
    return Result.ok(new Difficulty(value as DifficultyLevel))
  }

  /**
   * Compare two Difficulty instances by value
   *
   * @param other - Difficulty to compare with
   * @returns true if values are equal
   */
  equals(other: Difficulty): boolean {
    return this.value === other.value
  }

  /**
   * Get string representation
   *
   * @returns The difficulty level string
   */
  toString(): string {
    return this.value
  }
}
