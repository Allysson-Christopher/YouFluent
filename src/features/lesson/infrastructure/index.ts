/**
 * Lesson Infrastructure Layer
 *
 * Exports all infrastructure implementations for the lesson feature.
 * These implement interfaces defined in the domain layer.
 */

// Repositories
export { PrismaLessonRepository } from './repositories/prisma-lesson-repository'

// Mappers
export { LessonMapper } from './mappers/lesson-mapper'
export type {
  PrismaLessonWithRelations,
  PrismaExerciseData,
  PrismaVocabularyData,
  PrismaLessonData,
} from './mappers/lesson-mapper'

// Services
export {
  OpenAILessonGenerator,
  type OpenAILessonGeneratorOptions,
} from './services/openai-lesson-generator'

// Schemas (for testing and advanced use cases)
export {
  lessonOutputSchema,
  generatedExerciseSchema,
  generatedVocabularySchema,
  exerciseTypeSchema,
  partOfSpeechSchema,
  type LessonOutput,
  type GeneratedExercise,
  type GeneratedVocabulary,
} from './services/prompts/schemas'

// Prompts (for testing and customization)
export { buildExercisePrompt } from './services/prompts/exercise-prompt'
export { buildVocabularyPrompt } from './services/prompts/vocabulary-prompt'
