/**
 * Lesson Domain Errors
 *
 * All errors are typed values (not exceptions).
 * Each error contains contextual information for debugging.
 */

/**
 * Error when difficulty value is invalid
 */
export class InvalidDifficultyError {
  readonly _tag = 'InvalidDifficultyError' as const

  constructor(readonly value: string) {}

  get message(): string {
    return `Invalid difficulty: ${this.value}. Valid values: easy, medium, hard`
  }
}

/**
 * Error when exercise type value is invalid
 */
export class InvalidExerciseTypeError {
  readonly _tag = 'InvalidExerciseTypeError' as const

  constructor(readonly value: string) {}

  get message(): string {
    return `Invalid exercise type: ${this.value}. Valid values: fill-blank, multiple-choice, translation, listening`
  }
}

/**
 * Error when part of speech value is invalid
 */
export class InvalidPartOfSpeechError {
  readonly _tag = 'InvalidPartOfSpeechError' as const

  constructor(readonly value: string) {}

  get message(): string {
    return `Invalid part of speech: ${this.value}. Valid values: noun, verb, adjective, adverb, phrase`
  }
}

/**
 * Error when vocabulary item validation fails
 */
export class VocabularyValidationError {
  readonly _tag = 'VocabularyValidationError' as const

  constructor(
    readonly field: string,
    readonly errorMessage: string
  ) {}

  get message(): string {
    return `Vocabulary validation failed for "${this.field}": ${this.errorMessage}`
  }
}

/**
 * Error when exercise validation fails
 */
export class ExerciseValidationError {
  readonly _tag = 'ExerciseValidationError' as const

  constructor(
    readonly field: string,
    readonly errorMessage: string
  ) {}

  get message(): string {
    return `Exercise validation failed for "${this.field}": ${this.errorMessage}`
  }
}

/**
 * Error when lesson validation fails
 */
export class LessonValidationError {
  readonly _tag = 'LessonValidationError' as const

  constructor(
    readonly field: string,
    readonly errorMessage: string
  ) {}

  get message(): string {
    return `Lesson validation failed for "${this.field}": ${this.errorMessage}`
  }
}

/**
 * Error when lesson is not found
 */
export class LessonNotFoundError {
  readonly _tag = 'LessonNotFoundError' as const

  constructor(readonly lessonId: string) {}

  get message(): string {
    return `Lesson not found: ${this.lessonId}`
  }
}

/**
 * Error when lesson generation fails
 */
export class LessonGenerationError {
  readonly _tag = 'LessonGenerationError' as const

  constructor(readonly reason: string) {}

  get message(): string {
    return `Failed to generate lesson: ${this.reason}`
  }
}

/**
 * Union type of all lesson errors
 */
export type LessonError =
  | InvalidDifficultyError
  | InvalidExerciseTypeError
  | InvalidPartOfSpeechError
  | VocabularyValidationError
  | ExerciseValidationError
  | LessonValidationError
  | LessonNotFoundError
  | LessonGenerationError
