/**
 * Lesson Domain Layer Exports
 *
 * This is the public API of the lesson domain.
 * Only export what is needed by other layers.
 */

// Entities
export { Lesson } from './entities/lesson'
export type { LessonProps } from './entities/lesson'
export { Exercise } from './entities/exercise'
export type { ExerciseProps } from './entities/exercise'
export { VocabularyItem } from './entities/vocabulary-item'
export type { VocabularyItemProps, PartOfSpeech } from './entities/vocabulary-item'

// Value Objects
export { Difficulty } from './value-objects/difficulty'
export type { DifficultyLevel } from './value-objects/difficulty'
export { ExerciseType } from './value-objects/exercise-type'
export type { ExerciseTypeValue } from './value-objects/exercise-type'

// Interfaces (Ports)
export type { LessonRepository } from './interfaces/lesson-repository'
export type {
  LessonGenerator,
  GeneratedLessonData,
  GeneratedExerciseData,
  GeneratedVocabularyData,
} from './interfaces/lesson-generator'

// Errors
export {
  InvalidDifficultyError,
  InvalidExerciseTypeError,
  InvalidPartOfSpeechError,
  VocabularyValidationError,
  ExerciseValidationError,
  LessonValidationError,
  LessonNotFoundError,
  LessonGenerationError,
} from './errors/lesson-errors'
export type { LessonError } from './errors/lesson-errors'
