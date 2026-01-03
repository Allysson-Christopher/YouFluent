import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import {
  LengthFinishReasonError,
  ContentFilterFinishReasonError,
} from 'openai/core/error'
import { z } from 'zod/v3'

import { Result } from '@/shared/core/result'
import {
  LessonGenerator,
  GeneratedLessonData,
  GeneratedExerciseData,
  GeneratedVocabularyData,
} from '@/features/lesson/domain/interfaces/lesson-generator'
import { LessonGenerationError } from '@/features/lesson/domain/errors/lesson-errors'
import { Transcript } from '@/features/transcript/domain/entities/transcript'
import { Difficulty } from '@/features/lesson/domain/value-objects/difficulty'
import { lessonOutputSchema, LessonOutput, GeneratedExercise, GeneratedVocabulary } from './prompts/schemas'
import { buildExercisePrompt } from './prompts/exercise-prompt'
import { buildVocabularyPrompt } from './prompts/vocabulary-prompt'

/**
 * Configuration options for OpenAILessonGenerator
 */
export interface OpenAILessonGeneratorOptions {
  /**
   * OpenAI API key (defaults to OPENAI_API_KEY env var)
   */
  apiKey?: string
  /**
   * Maximum number of retries for failed requests (defaults to 2)
   * Set to 0 to disable retries (useful for testing)
   */
  maxRetries?: number
}

/**
 * OpenAI-based Lesson Generator
 *
 * Implements the LessonGenerator interface using OpenAI's API with structured outputs.
 * Uses gpt-4o-mini for cost-effective lesson generation.
 *
 * DESIGN DECISIONS:
 * - Uses zodResponseFormat for automatic JSON schema generation and parsing
 * - Combines exercise and vocabulary generation in single API call
 * - Maps OpenAI SDK errors to domain LessonGenerationError
 */
export class OpenAILessonGenerator implements LessonGenerator {
  private client: OpenAI

  /**
   * Create OpenAI Lesson Generator
   *
   * @param options - Configuration options including API key and retry settings
   */
  constructor(options?: OpenAILessonGeneratorOptions | string) {
    // Support both old string-only signature and new options object
    const opts = typeof options === 'string' ? { apiKey: options } : options ?? {}

    this.client = new OpenAI({
      apiKey: opts.apiKey ?? process.env.OPENAI_API_KEY,
      maxRetries: opts.maxRetries,
    })
  }

  /**
   * Generate lesson content from transcript
   *
   * PRE: transcript is valid, difficulty is valid
   * POST: Returns GeneratedLessonData with exercises and vocabulary
   * ERRORS: LessonGenerationError on API failure, rate limit, or invalid response
   *
   * @param transcript - Source transcript for lesson generation
   * @param difficulty - Target difficulty level
   * @returns Result with GeneratedLessonData or LessonGenerationError
   */
  async generate(
    transcript: Transcript,
    difficulty: Difficulty
  ): Promise<Result<GeneratedLessonData, LessonGenerationError>> {
    try {
      // Build prompts from transcript chunks
      const exercisePrompt = buildExercisePrompt(transcript.chunks, difficulty)
      const vocabularyPrompt = buildVocabularyPrompt(transcript.chunks, difficulty)

      // Use chat.completions.parse() for automatic structured output parsing
      const completion = await this.client.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: this.buildSystemPrompt(),
          },
          {
            role: 'user',
            content: this.buildUserPrompt(transcript.title, exercisePrompt, vocabularyPrompt),
          },
        ],
        response_format: zodResponseFormat(lessonOutputSchema, 'lesson_output'),
        temperature: 0.7,
        max_tokens: 4000,
      })

      // Get parsed message
      const message = completion.choices[0]?.message

      // Check for model refusal
      if (message?.refusal) {
        return Result.fail(new LessonGenerationError(`Model refused: ${message.refusal}`))
      }

      // Check for empty or missing parsed content
      if (!message?.parsed) {
        return Result.fail(new LessonGenerationError('Empty response from OpenAI'))
      }

      // Map parsed response to domain types
      const lessonData = this.mapToDomainTypes(message.parsed)

      return Result.ok(lessonData)
    } catch (error) {
      return this.handleError(error)
    }
  }

  /**
   * Build system prompt for the AI
   */
  private buildSystemPrompt(): string {
    return `You are an expert English teacher creating interactive lessons from video content.

Your task is to generate educational content that helps learners improve their English skills.

IMPORTANT GUIDELINES:
- All exercises and vocabulary MUST be based on the provided transcript
- Questions should test comprehension, not just recall
- Vocabulary definitions should be learner-friendly
- Example sentences for vocabulary should be NEW (not from transcript)
- Spread exercises and vocabulary across different parts of the transcript`
  }

  /**
   * Build user prompt combining title, exercise, and vocabulary instructions
   */
  private buildUserPrompt(
    title: string,
    exercisePrompt: string,
    vocabularyPrompt: string
  ): string {
    return `Create a complete English lesson from this video.

VIDEO TITLE: ${title}

Generate a lesson with:
1. A descriptive title for the lesson (based on the video content)
2. 5-8 varied exercises
3. 8-12 vocabulary items

${exercisePrompt}

${vocabularyPrompt}

Remember: All content must be derived from the actual transcript content.`
  }

  /**
   * Map OpenAI parsed response to domain types
   */
  private mapToDomainTypes(parsed: LessonOutput): GeneratedLessonData {
    const exercises: GeneratedExerciseData[] = parsed.exercises.map((ex: GeneratedExercise) => ({
      type: ex.type,
      question: ex.question,
      answer: ex.answer,
      options: ex.options,
      explanation: ex.explanation,
      chunkIndex: ex.chunkIndex,
    }))

    const vocabulary: GeneratedVocabularyData[] = parsed.vocabulary.map((vocab: GeneratedVocabulary) => ({
      word: vocab.word,
      definition: vocab.definition,
      example: vocab.example,
      partOfSpeech: vocab.partOfSpeech,
      chunkIndex: vocab.chunkIndex,
    }))

    return {
      title: parsed.title,
      exercises,
      vocabulary,
    }
  }

  /**
   * Handle and map errors to domain LessonGenerationError
   */
  private handleError(error: unknown): Result<GeneratedLessonData, LessonGenerationError> {
    // Handle OpenAI SDK specific errors
    if (error instanceof OpenAI.RateLimitError) {
      return Result.fail(new LessonGenerationError('Rate limit exceeded. Please try again later.'))
    }

    if (error instanceof OpenAI.APIError) {
      return Result.fail(new LessonGenerationError(`API error: ${error.message}`))
    }

    // Handle length finish reason error (response truncated)
    if (error instanceof LengthFinishReasonError) {
      return Result.fail(new LessonGenerationError('Response was truncated due to length limits'))
    }

    // Handle content filter error
    if (error instanceof ContentFilterFinishReasonError) {
      return Result.fail(new LessonGenerationError('Response was blocked by content filter'))
    }

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((e: z.ZodIssue) => e.message).join(', ')
      return Result.fail(new LessonGenerationError(`Invalid response format: ${messages}`))
    }

    // Generic error handling
    if (error instanceof Error) {
      return Result.fail(new LessonGenerationError(error.message))
    }

    return Result.fail(new LessonGenerationError(String(error)))
  }
}
