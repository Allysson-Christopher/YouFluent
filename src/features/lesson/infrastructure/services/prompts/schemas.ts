import { z } from 'zod/v3'

/**
 * Zod Schemas for OpenAI Structured Outputs
 *
 * These schemas define the expected response format from OpenAI.
 * They are used with zodResponseFormat for automatic parsing.
 *
 * IMPORTANT: Must be compatible with JSON Schema for structured outputs.
 * - Use z.nullable() instead of z.optional() in arrays
 * - Use z.enum() for string unions
 * - Uses zod/v3 for OpenAI SDK compatibility
 */

/**
 * Exercise type schema - maps to ExerciseTypeValue from domain
 */
export const exerciseTypeSchema = z.enum([
  'fill-blank',
  'multiple-choice',
  'translation',
  'listening',
])

/**
 * Part of speech schema - maps to PartOfSpeech from domain
 */
export const partOfSpeechSchema = z.enum(['noun', 'verb', 'adjective', 'adverb', 'phrase'])

/**
 * Schema for each generated exercise
 */
export const generatedExerciseSchema = z.object({
  type: exerciseTypeSchema,
  question: z.string().min(10).describe('The exercise question'),
  answer: z.string().min(1).describe('The correct answer'),
  options: z
    .array(z.string())
    .nullable()
    .describe('Options for multiple-choice (null for other types)'),
  explanation: z.string().describe('Explanation of the correct answer'),
  chunkIndex: z.number().int().min(0).describe('Index of the chunk this exercise relates to'),
})

/**
 * Schema for each generated vocabulary item
 */
export const generatedVocabularySchema = z.object({
  word: z.string().min(1).describe('The vocabulary word or phrase'),
  definition: z.string().min(10).describe('Clear definition of the word'),
  example: z.string().min(10).describe('Example sentence using the word'),
  partOfSpeech: partOfSpeechSchema.describe('Grammatical category'),
  chunkIndex: z.number().int().min(0).describe('Index of the chunk this word appears in'),
})

/**
 * Combined schema for complete lesson output
 */
export const lessonOutputSchema = z.object({
  title: z.string().min(5).describe('A descriptive title for the lesson'),
  exercises: z
    .array(generatedExerciseSchema)
    .min(5)
    .max(8)
    .describe('5-8 interactive exercises'),
  vocabulary: z
    .array(generatedVocabularySchema)
    .min(8)
    .max(12)
    .describe('8-12 vocabulary items'),
})

/**
 * Type inference from Zod schemas
 */
export type LessonOutput = z.infer<typeof lessonOutputSchema>
export type GeneratedExercise = z.infer<typeof generatedExerciseSchema>
export type GeneratedVocabulary = z.infer<typeof generatedVocabularySchema>
