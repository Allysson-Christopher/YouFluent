import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { z } from 'zod/v3'
import { Result } from '@/shared/core/result'

/**
 * Schema for chunk lesson output (matches original Python version)
 */
const chunkLessonSchema = z.object({
  translation: z.string().describe('Tradução natural para português brasileiro'),
  explanation: z.string().describe('Explicação breve sobre gramática, expressões ou pronúncia importante (max 2 frases)'),
  vocabulary: z.array(
    z.object({
      word: z.string().describe('Palavra ou expressão em inglês'),
      meaning: z.string().describe('Significado em português'),
    })
  ).min(2).max(4).describe('2-4 palavras/expressões mais úteis do trecho'),
  exercise: z.object({
    question: z.string().describe('Pergunta sobre o trecho em português'),
    options: z.array(z.string()).length(4).describe('4 opções de resposta'),
    correct: z.number().min(0).max(3).describe('Índice 0-3 da resposta correta'),
  }).describe('Exercício que testa compreensão'),
})

export type ChunkLessonOutput = z.infer<typeof chunkLessonSchema>

/**
 * Error for chunk lesson generation failures
 */
export class ChunkLessonGenerationError {
  readonly _tag = 'ChunkLessonGenerationError' as const

  constructor(readonly reason: string) {}

  get message(): string {
    return `Failed to generate chunk lesson: ${this.reason}`
  }
}

/**
 * ChunkLessonGenerator
 *
 * Generates lesson content for a single chunk, matching the original Python version.
 * Returns: translation, explanation, vocabulary (2-4), exercise (1)
 *
 * @see old-you-fluent/server.py generate_lesson()
 */
export class ChunkLessonGenerator {
  private client: OpenAI

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey ?? process.env.OPENAI_API_KEY,
    })
  }

  /**
   * Generate lesson content for a single chunk
   *
   * PRE: text is non-empty English text from video chunk
   * POST: Returns ChunkLessonOutput with translation, explanation, vocabulary, exercise
   * ERRORS: ChunkLessonGenerationError on API failure
   *
   * @param text - The chunk text in English
   * @returns Result with ChunkLessonOutput or ChunkLessonGenerationError
   */
  async generate(text: string): Promise<Result<ChunkLessonOutput, ChunkLessonGenerationError>> {
    if (!text || text.trim() === '') {
      return Result.fail(new ChunkLessonGenerationError('Empty text provided'))
    }

    try {
      const completion = await this.client.chat.completions.parse({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Você é um professor de inglês para brasileiros. Responda apenas com JSON válido.',
          },
          {
            role: 'user',
            content: this.buildPrompt(text),
          },
        ],
        response_format: zodResponseFormat(chunkLessonSchema, 'chunk_lesson'),
        temperature: 0.7,
        max_tokens: 1500,
      })

      const message = completion.choices[0]?.message

      if (message?.refusal) {
        return Result.fail(new ChunkLessonGenerationError(`Model refused: ${message.refusal}`))
      }

      if (!message?.parsed) {
        return Result.fail(new ChunkLessonGenerationError('Empty response from OpenAI'))
      }

      return Result.ok(message.parsed)
    } catch (error) {
      if (error instanceof OpenAI.RateLimitError) {
        return Result.fail(new ChunkLessonGenerationError('Rate limit exceeded. Please try again later.'))
      }

      if (error instanceof OpenAI.APIError) {
        return Result.fail(new ChunkLessonGenerationError(`API error: ${error.message}`))
      }

      if (error instanceof Error) {
        return Result.fail(new ChunkLessonGenerationError(error.message))
      }

      return Result.fail(new ChunkLessonGenerationError(String(error)))
    }
  }

  /**
   * Build prompt matching original Python version
   */
  private buildPrompt(text: string): string {
    return `Você é um professor de inglês para brasileiros. Analise o seguinte trecho de vídeo em inglês e crie uma aula completa.

Trecho: "${text}"

Crie uma aula com:
1. translation: tradução natural para português brasileiro
2. explanation: explicação breve sobre gramática, expressões ou pronúncia importante do trecho (max 2 frases)
3. vocabulary: escolha 2-4 palavras/expressões mais úteis do trecho, com significado em português
4. exercise: crie uma pergunta que teste compreensão do trecho (em português), com 4 opções de resposta

Regras:
- Seja conciso e prático
- Vocabulário deve ser útil para o dia-a-dia
- Exercício deve testar se o aluno entendeu o trecho, não apenas vocabulário`
  }
}
