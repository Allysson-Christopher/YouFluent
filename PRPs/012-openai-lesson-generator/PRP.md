# PRP: T-012 - Infrastructure - OpenAILessonGenerator

---

## Input Summary

**Modo:** AUTO
**Tarefa:** T-012 - Infrastructure - OpenAILessonGenerator
**Origem:** context/TASKS/T-012.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/PRD/features/lesson.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/dominios/lesson.md
- context/ARQUITETURA/stack.md
- PRPs/templates/prp_base.md

**Objetivo:** Implementar servico de infraestrutura que usa OpenAI API para gerar exercicios e vocabulario a partir de transcricao, com structured outputs usando Zod schemas.

**Escopo:**
- Implementar OpenAILessonGenerator que implementa LessonGenerator
- Prompts para geracao de exercicios
- Prompts para extracao de vocabulario
- Structured outputs com Zod schema
- Tratamento de erros tipados (rate limit, timeout, etc)
- Testes com MSW

**Criterios de Aceite:**
- [ ] OpenAILessonGenerator implementa LessonGenerator interface
- [ ] Usa structured outputs com Zod schema
- [ ] Gera 5-8 exercicios por lesson
- [ ] Gera 8-12 vocabulary items
- [ ] Prompt adapta conteudo por dificuldade
- [ ] Erros tipados para rate limit, API errors
- [ ] Testes com MSW passam

---

## Goal

Implementar `OpenAILessonGenerator`, um servico de infraestrutura que implementa a interface `LessonGenerator` do dominio. O servico deve usar a API da OpenAI (gpt-4o-mini) com structured outputs para gerar exercicios e vocabulario a partir de uma transcricao de video.

O servico deve:
1. Receber um `Transcript` e `Difficulty`
2. Construir prompts otimizados para geracao de conteudo educacional
3. Usar zodResponseFormat do OpenAI SDK para structured outputs
4. Retornar `GeneratedLessonData` com exercises e vocabulary
5. Tratar erros tipados (rate limit, API errors, empty responses)

---

## Why

- **Valor de Negocio**: Core feature do YouFluent - transformar qualquer video do YouTube em licoes interativas
- **Integracao**: Este servico sera usado pelo `GenerateLessonUseCase` (T-014)
- **Qualidade**: Structured outputs garantem formato correto, eliminando parsing errors

---

## What

### User-visible Behavior

Nao ha comportamento visivel ao usuario nesta tarefa (infraestrutura interna).

### Technical Requirements

1. **OpenAI SDK Integration**
   - Usar OpenAI SDK 6.1.x (a ser instalado)
   - Usar `zodResponseFormat` para structured outputs
   - Modelo: `gpt-4o-mini` (custo-beneficio otimo)

2. **Zod Schemas**
   - Schema para output de exercicios
   - Schema para output de vocabulario
   - Schema combinado para lesson output

3. **Prompts**
   - Prompt para geracao de exercicios (adapta por dificuldade)
   - Prompt para extracao de vocabulario (adapta por dificuldade)
   - Instrucoes claras para mix de tipos de exercicio

4. **Error Handling**
   - RateLimitError (429)
   - APIError (outros erros da API)
   - EmptyResponseError (resposta vazia)
   - Mapeamento para LessonGenerationError do dominio

5. **Testes com MSW**
   - Mock da API de chat completions
   - Testes de happy path
   - Testes de erro (rate limit, empty response)

### Success Criteria

- [ ] OpenAI SDK instalado como dependencia
- [ ] OpenAILessonGenerator implementa LessonGenerator
- [ ] Structured outputs funcionando com Zod
- [ ] Prompts geram 5-8 exercicios e 8-12 vocabulary items
- [ ] Dificuldade afeta o conteudo gerado
- [ ] Erros tipados para cada tipo de falha
- [ ] Cobertura de testes >= 80%
- [ ] Todos os testes passam

---

## All Needed Context

### Documentation & References

```yaml
- url: https://platform.openai.com/docs/guides/structured-outputs
  why: Como usar structured outputs com Zod (zodResponseFormat)
  critical: |
    - Usar zodResponseFormat(schema, 'name')
    - Requer openai SDK >= 6.1
    - Schema deve ser compativel com JSON Schema

- url: https://platform.openai.com/docs/guides/error-codes
  why: Error handling para rate limits e API errors
  critical: |
    - 429 = Rate limit
    - 500/502/503 = Server errors
    - Use OpenAI.RateLimitError e OpenAI.APIError

- file: src/features/lesson/domain/interfaces/lesson-generator.ts
  why: Interface que devemos implementar
  critical: |
    - generate(transcript, difficulty) -> Result<GeneratedLessonData, LessonGenerationError>
    - GeneratedLessonData contém exercises e vocabulary
    - Usar tipos ExerciseTypeValue e PartOfSpeech do domain

- file: src/features/lesson/domain/entities/exercise.ts
  why: Estrutura de Exercise para entender campos necessarios
  critical: |
    - type: ExerciseType
    - question, answer, options, explanation, chunkIndex

- file: src/features/lesson/domain/entities/vocabulary-item.ts
  why: Estrutura de VocabularyItem para entender campos necessarios
  critical: |
    - word, definition, example, partOfSpeech, chunkIndex

- file: tests/mocks/openai.ts
  why: Padrao existente de mock da OpenAI com MSW
  critical: |
    - Atualizar para structured outputs
    - Usar formato de resposta correto
```

### Current Codebase Tree

```
src/features/lesson/
├── domain/
│   ├── entities/
│   │   ├── exercise.ts            # Entity com create() factory
│   │   ├── lesson.ts              # Aggregate Root
│   │   └── vocabulary-item.ts     # Entity com create() factory
│   ├── errors/
│   │   └── lesson-errors.ts       # Typed errors (LessonGenerationError)
│   ├── interfaces/
│   │   ├── lesson-generator.ts    # Interface a implementar
│   │   └── lesson-repository.ts   # Para T-013
│   ├── value-objects/
│   │   ├── difficulty.ts          # easy | medium | hard
│   │   └── exercise-type.ts       # fill-blank | multiple-choice | translation | listening
│   └── index.ts
├── application/
│   └── (vazio - T-014)
├── infrastructure/
│   └── .gitkeep                   # VAZIO - arquivos a criar aqui
└── presentation/
    └── (vazio - T-015)

tests/
├── mocks/
│   ├── openai.ts                  # MSW handlers existentes (atualizar)
│   └── youtube.ts
├── unit/features/lesson/domain/   # Testes de domain existentes
└── integration/features/lesson/   # (a criar)
```

### Desired Codebase Tree

```
src/features/lesson/
└── infrastructure/
    ├── services/
    │   ├── openai-lesson-generator.ts     # [CRIAR] Implementacao do LessonGenerator
    │   └── prompts/
    │       ├── exercise-prompt.ts          # [CRIAR] Builder de prompt para exercicios
    │       ├── vocabulary-prompt.ts        # [CRIAR] Builder de prompt para vocabulario
    │       └── schemas.ts                  # [CRIAR] Zod schemas para structured output
    └── index.ts                            # [CRIAR] Barrel export

tests/
├── mocks/
│   └── openai.ts                          # [ATUALIZAR] Para structured outputs
└── integration/features/lesson/
    └── openai-lesson-generator.test.ts    # [CRIAR] Testes de integracao
```

### Known Gotchas

```
# CRITICAL: OpenAI SDK precisa ser instalado
pnpm add openai@^6.1.0

# CRITICAL: Zod ja esta instalado (verificado no package.json)

# GOTCHA: zodResponseFormat requer schema Zod compativel com JSON Schema
# - Usar z.enum() em vez de union de strings
# - Usar z.nullable() em vez de z.optional() para campos opcionais em arrays

# GOTCHA: OpenAI SDK types
# - OpenAI.RateLimitError para 429
# - OpenAI.APIError para outros erros da API
# - Verificar instanceof para type narrowing

# GOTCHA: Structured outputs retornam string JSON
# - Precisa JSON.parse() no content
# - Depois validar com Zod schema

# ENVIRONMENT: API key em .env.local
# OPENAI_API_KEY=sk-...
```

---

## Implementation Blueprint

### Data Models (Zod Schemas)

```typescript
// src/features/lesson/infrastructure/services/prompts/schemas.ts

import { z } from 'zod'

// Tipo de exercicio - deve mapear para ExerciseTypeValue do domain
export const exerciseTypeSchema = z.enum(['fill-blank', 'multiple-choice', 'translation', 'listening'])

// Tipo de part of speech - deve mapear para PartOfSpeech do domain
export const partOfSpeechSchema = z.enum(['noun', 'verb', 'adjective', 'adverb', 'phrase'])

// Schema para cada exercicio gerado
export const generatedExerciseSchema = z.object({
  type: exerciseTypeSchema,
  question: z.string().min(10),
  answer: z.string().min(1),
  options: z.array(z.string()).nullable(), // null para fill-blank
  explanation: z.string(),
  chunkIndex: z.number().int().min(0)
})

// Schema para cada vocabulario gerado
export const generatedVocabularySchema = z.object({
  word: z.string().min(1),
  definition: z.string().min(10),
  example: z.string().min(10),
  partOfSpeech: partOfSpeechSchema,
  chunkIndex: z.number().int().min(0)
})

// Schema combinado para lesson output
export const lessonOutputSchema = z.object({
  title: z.string().min(5),
  exercises: z.array(generatedExerciseSchema).min(5).max(8),
  vocabulary: z.array(generatedVocabularySchema).min(8).max(12)
})

export type LessonOutput = z.infer<typeof lessonOutputSchema>
```

### List of Tasks

```yaml
Task 1: Install OpenAI SDK
  - pnpm add openai@^6.1.0
  - Verify installation

Task 2: Create Zod schemas
  CREATE src/features/lesson/infrastructure/services/prompts/schemas.ts
  - exerciseTypeSchema
  - partOfSpeechSchema
  - generatedExerciseSchema
  - generatedVocabularySchema
  - lessonOutputSchema

Task 3: Create exercise prompt builder
  CREATE src/features/lesson/infrastructure/services/prompts/exercise-prompt.ts
  - buildExercisePrompt(chunks: Chunk[], difficulty: Difficulty): string
  - Include difficulty-specific instructions
  - Request mix of exercise types

Task 4: Create vocabulary prompt builder
  CREATE src/features/lesson/infrastructure/services/prompts/vocabulary-prompt.ts
  - buildVocabularyPrompt(chunks: Chunk[], difficulty: Difficulty): string
  - Include difficulty-specific instructions
  - Request 8-12 vocabulary items

Task 5: Create OpenAILessonGenerator
  CREATE src/features/lesson/infrastructure/services/openai-lesson-generator.ts
  - Implement LessonGenerator interface
  - Use zodResponseFormat for structured outputs
  - Handle rate limit and API errors
  - Map response to GeneratedLessonData

Task 6: Create barrel export
  CREATE src/features/lesson/infrastructure/index.ts
  - Export OpenAILessonGenerator
  - Export schemas

Task 7: Update MSW handlers
  MODIFY tests/mocks/openai.ts
  - Add handler for structured outputs format
  - Return mock lesson data matching schema

Task 8: Create integration tests
  CREATE tests/integration/features/lesson/openai-lesson-generator.test.ts
  - Test happy path with MSW
  - Test rate limit handling
  - Test empty response handling
  - Test API error handling
```

### Task Pseudocode

```typescript
// Task 3: exercise-prompt.ts

export function buildExercisePrompt(chunks: Chunk[], difficulty: Difficulty): string {
  // PATTERN: Difficulty-specific instructions
  const difficultyGuides = {
    easy: 'Focus on basic vocabulary and simple sentences.',
    medium: 'Include some challenging vocabulary and grammar.',
    hard: 'Use advanced vocabulary, idioms, and complex structures.'
  }

  // PATTERN: Build structured prompt
  return `
    You are an English teacher creating exercises from video transcript.

    DIFFICULTY: ${difficulty.value}
    ${difficultyGuides[difficulty.value]}

    TRANSCRIPT CHUNKS:
    ${chunks.map((c, i) => `[${i}] ${c.text}`).join('\n')}

    REQUIREMENTS:
    - Create 5-8 exercises
    - Mix of types: fill-blank, multiple-choice, translation
    - Each exercise references a chunkIndex
    - multiple-choice must have 4 options including correct answer
    - Include brief explanation for each answer
  `
}
```

```typescript
// Task 5: openai-lesson-generator.ts

import OpenAI from 'openai'
import { zodResponseFormat } from 'openai/helpers/zod'
import { Result } from '@/shared/core/result'
import { LessonGenerator, GeneratedLessonData } from '../../domain/interfaces/lesson-generator'
import { LessonGenerationError } from '../../domain/errors/lesson-errors'
import { Transcript } from '@/features/transcript/domain/entities/transcript'
import { Difficulty } from '../../domain/value-objects/difficulty'
import { lessonOutputSchema } from './prompts/schemas'
import { buildExercisePrompt } from './prompts/exercise-prompt'
import { buildVocabularyPrompt } from './prompts/vocabulary-prompt'

export class OpenAILessonGenerator implements LessonGenerator {
  private client: OpenAI

  constructor(apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey ?? process.env.OPENAI_API_KEY
    })
  }

  async generate(
    transcript: Transcript,
    difficulty: Difficulty
  ): Promise<Result<GeneratedLessonData, LessonGenerationError>> {
    try {
      // PATTERN: Build prompts
      const exercisePrompt = buildExercisePrompt(transcript.chunks, difficulty)
      const vocabularyPrompt = buildVocabularyPrompt(transcript.chunks, difficulty)

      // CRITICAL: Use zodResponseFormat for structured outputs
      const response = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert English teacher creating interactive lessons.'
          },
          {
            role: 'user',
            content: `Generate a complete lesson.\n\n${exercisePrompt}\n\n${vocabularyPrompt}`
          }
        ],
        response_format: zodResponseFormat(lessonOutputSchema, 'lesson')
      })

      // PATTERN: Parse response
      const content = response.choices[0]?.message?.content
      if (!content) {
        return Result.fail(new LessonGenerationError('Empty response from OpenAI'))
      }

      // PATTERN: Validate with Zod
      const parsed = lessonOutputSchema.parse(JSON.parse(content))

      // PATTERN: Map to domain types
      return Result.ok({
        title: parsed.title,
        exercises: parsed.exercises,
        vocabulary: parsed.vocabulary
      })

    } catch (error) {
      // PATTERN: Handle specific OpenAI errors
      if (error instanceof OpenAI.RateLimitError) {
        return Result.fail(new LessonGenerationError('Rate limit exceeded. Please try again later.'))
      }
      if (error instanceof OpenAI.APIError) {
        return Result.fail(new LessonGenerationError(`API error: ${error.message}`))
      }
      // PATTERN: Handle Zod validation errors
      if (error instanceof z.ZodError) {
        return Result.fail(new LessonGenerationError(`Invalid response format: ${error.message}`))
      }
      // Generic error
      return Result.fail(new LessonGenerationError(String(error)))
    }
  }
}
```

### Integration Points

```yaml
DEPENDENCIES:
  - install: pnpm add openai@^6.1.0
  - verify: pnpm list openai

DOMAIN:
  - interface: src/features/lesson/domain/interfaces/lesson-generator.ts
  - types: GeneratedLessonData, GeneratedExerciseData, GeneratedVocabularyData
  - error: LessonGenerationError

TRANSCRIPT:
  - import: Transcript, Chunk from @/features/transcript/domain
  - usage: chunks array with text and index

ENVIRONMENT:
  - variable: OPENAI_API_KEY
  - location: .env.local (already configured per T-012.md notes)
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run FIRST - fix any errors before proceeding
pnpm lint && pnpm format:check

# Expected: No errors
# If errors: pnpm lint:fix && pnpm format
```

### Level 2: Type Check

```bash
pnpm type-check

# Expected: No type errors
# Common issues:
# - Import paths wrong (@/features/...)
# - Zod schema type inference
# - OpenAI SDK types
```

### Level 3: Unit Tests

```bash
# Run unit tests for schemas and prompts
pnpm test:unit tests/unit/features/lesson/infrastructure

# Expected: All pass
# Coverage target: 80%
```

### Level 4: Integration Tests

```bash
# Run integration tests with MSW
pnpm test:integration tests/integration/features/lesson

# Expected: All pass
# Tests should:
# - Mock OpenAI API with MSW
# - Verify structured output parsing
# - Test error handling
```

### Level 5: Build

```bash
pnpm build

# Expected: Build succeeds
# Common issues:
# - Dynamic imports
# - Server-side OpenAI client
```

---

## Final Validation Checklist

- [ ] OpenAI SDK installed: `pnpm list openai`
- [ ] All lint errors fixed: `pnpm lint`
- [ ] No type errors: `pnpm type-check`
- [ ] Unit tests pass: `pnpm test:unit tests/unit/features/lesson/infrastructure`
- [ ] Integration tests pass: `pnpm test:integration tests/integration/features/lesson`
- [ ] Build succeeds: `pnpm build`
- [ ] OpenAILessonGenerator implements LessonGenerator interface
- [ ] Structured outputs working with zodResponseFormat
- [ ] Error handling for rate limit, API errors, empty response
- [ ] Prompts adapt content by difficulty level

---

## Anti-Patterns to Avoid

- **DO NOT** hardcode API key - use environment variable
- **DO NOT** skip Zod validation - always validate API response
- **DO NOT** catch generic Exception - use typed OpenAI errors
- **DO NOT** mock to make tests pass - fix the actual code
- **DO NOT** use gpt-4 - use gpt-4o-mini for cost efficiency
- **DO NOT** skip structured outputs - use zodResponseFormat
- **DO NOT** create new error types - use LessonGenerationError from domain
- **DO NOT** put OpenAI client in domain layer - this is infrastructure

---

## Test Cases

### Happy Path

```typescript
it('should generate lesson with exercises and vocabulary', async () => {
  // Arrange
  const transcript = createMockTranscript() // From test helpers
  const difficulty = Difficulty.medium()

  // Act
  const result = await generator.generate(transcript, difficulty)

  // Assert
  expect(result.isSuccess).toBe(true)
  expect(result.value.exercises.length).toBeGreaterThanOrEqual(5)
  expect(result.value.vocabulary.length).toBeGreaterThanOrEqual(8)
})
```

### Rate Limit Error

```typescript
it('should handle rate limit error', async () => {
  // Arrange
  server.use(
    http.post('https://api.openai.com/v1/chat/completions', () => {
      return HttpResponse.json(
        { error: { message: 'Rate limit exceeded' } },
        { status: 429 }
      )
    })
  )

  // Act
  const result = await generator.generate(transcript, difficulty)

  // Assert
  expect(result.isFailure).toBe(true)
  expect(result.error.reason).toContain('Rate limit')
})
```

### Empty Response

```typescript
it('should handle empty response', async () => {
  // Arrange
  server.use(
    http.post('https://api.openai.com/v1/chat/completions', () => {
      return HttpResponse.json({
        choices: [{ message: { content: null } }]
      })
    })
  )

  // Act
  const result = await generator.generate(transcript, difficulty)

  // Assert
  expect(result.isFailure).toBe(true)
  expect(result.error.reason).toContain('Empty response')
})
```

---

## Confidence Note

**Nota de Confianca: 8/10**

**Pontos Fortes:**
- Interface LessonGenerator ja definida no domain
- Padroes de Result e typed errors ja estabelecidos
- MSW ja instalado e configurado
- Exemplos de infraestrutura existentes (YouTubeTranscriptService)

**Pontos de Atencao:**
- OpenAI SDK precisa ser instalado
- zodResponseFormat pode ter quirks nao documentados
- Precisara atualizar mock existente em tests/mocks/openai.ts

---

*PRP gerado pelo Context Engineering Framework v2.0*
*Tarefa: T-012 | Modo: AUTO | Data: 2026-01-03*

---

## Pos-Implementacao

**Data:** 2026-01-03
**Status:** Implementado

### Arquivos Criados/Modificados

**Criados:**
- `src/features/lesson/infrastructure/services/prompts/schemas.ts` - Zod schemas for structured outputs
- `src/features/lesson/infrastructure/services/prompts/exercise-prompt.ts` - Exercise prompt builder
- `src/features/lesson/infrastructure/services/prompts/vocabulary-prompt.ts` - Vocabulary prompt builder
- `src/features/lesson/infrastructure/services/openai-lesson-generator.ts` - Main LessonGenerator implementation
- `src/features/lesson/infrastructure/index.ts` - Barrel export
- `tests/integration/features/lesson/openai-lesson-generator.test.ts` - Integration tests

**Modificados:**
- `tests/mocks/openai.ts` - Updated MSW handlers for structured outputs
- `package.json` - Added openai and zod dependencies

### Testes
- 15 testes de integracao criados
- Cobertura Domain: N/A (servico de infraestrutura)
- Cobertura Application: N/A
- Cobertura Infrastructure: 100% para OpenAILessonGenerator

### Validation Gates
- [x] Lint: passou
- [x] Type-check: passou
- [x] Unit tests: passou (336 testes)
- [x] Integration tests: passou (15 testes OpenAILessonGenerator)
- [x] Build: passou

### Erros Encontrados

1. **Zod v4 vs v3 incompatibilidade**
   - Causa: Zod 4.x requer import `zod/v3` para compatibilidade com OpenAI SDK
   - Solucao: Alterado imports para `import { z } from 'zod/v3'`
   - Resolvido via Context7 MCP

2. **OpenAI SDK error types not exported from main module**
   - Causa: `LengthFinishReasonError` e `ContentFilterFinishReasonError` nao estao no export principal
   - Solucao: Importar de `openai/core/error`

3. **Tests timing out on rate limit/API error tests**
   - Causa: OpenAI SDK retries automaticamente em erros 429 e 5xx
   - Solucao: Adicionado opcao `maxRetries` ao construtor e usar `maxRetries: 0` nos testes

4. **Result type narrowing em testes**
   - Causa: TypeScript nao consegue inferir `.value` apos Result.create()
   - Solucao: Verificar isSuccess antes de acessar value

### Decisoes Tomadas

1. **Usar `zod/v3` para compatibilidade com OpenAI SDK**
   - OpenAI SDK zodResponseFormat requer Zod v3 API
   - Zod 4.x inclui compatibilidade via `zod/v3` import

2. **Combinar exercicios e vocabulario em unica chamada API**
   - Reduz latencia e custo
   - Schema unificado lessonOutputSchema

3. **Adicionar opcao maxRetries ao construtor**
   - Permite desabilitar retries para testes
   - Mantém retrocompatibilidade com signature antiga (string)

4. **Usar MSW para testes de integracao**
   - Testes determinísticos e rápidos
   - Suporte a cenários de erro (rate limit, API error, refusal)

### Context7 Consultado

- `/openai/openai-node` - zodResponseFormat usage, structured outputs parsing, error types, retry configuration
