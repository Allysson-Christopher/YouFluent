# PRP: T-014 - GenerateLessonUseCase

---

## Input Summary

**Modo:** AUTO
**Tarefa:** T-014 - Application - GenerateLessonUseCase
**Origem:** context/TASKS/T-014.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/PRD/features/lesson.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/dominios/lesson.md
- context/ARQUITETURA/padroes.md

**Objetivo:** Criar use case que orquestra geracao de lesson: busca transcricao (usa FetchTranscriptUseCase), gera exercicios/vocabulario via IA, salva no banco.

**Escopo:**
- Implementar GenerateLessonUseCase
- Orquestrar: transcript -> IA -> lesson -> persistencia
- Verificar se lesson ja existe (cache-first)
- Testes TDD com mocks

**Criterios de Aceite:**
- [ ] Use case verifica cache de lesson primeiro
- [ ] Retorna lesson cacheada se existir
- [ ] Busca transcricao via FetchTranscriptUseCase
- [ ] Gera exercicios e vocabulario via LessonGenerator
- [ ] Cria entidades de dominio com validacao
- [ ] Persiste lesson no repositorio
- [ ] Trata erros de cada etapa corretamente
- [ ] Cobertura de testes: 80%+
- [ ] Todos os testes passam

---

## Goal

Implementar o `GenerateLessonUseCase` - o caso de uso central que orquestra a geracao completa de uma licao de ingles a partir de uma URL do YouTube.

O use case deve:
1. Receber uma URL do YouTube e nivel de dificuldade
2. Verificar cache de lesson (retorna imediatamente se existir)
3. Buscar transcricao via `FetchTranscriptUseCase` (que tem seu proprio cache)
4. Gerar conteudo pedagogico via `LessonGenerator` (OpenAI)
5. Criar entidades de dominio validadas (Lesson, Exercise, VocabularyItem)
6. Persistir no banco via `LessonRepository`
7. Retornar a lesson completa ou erro tipado

---

## Why

### Valor de Negocio
- **Core da proposta de valor**: Transforma qualquer video do YouTube em licao personalizada
- **North Star Metric**: Licoes completadas por semana (este use case habilita toda a feature)
- **Experiencia do usuario**: Um clique para gerar licao completa

### Integracao com Features Existentes
- Depende de `FetchTranscriptUseCase` (T-007) para obter transcricao
- Depende de `OpenAILessonGenerator` (T-012) para gerar conteudo
- Depende de `PrismaLessonRepository` (T-013) para persistencia
- Sera consumido pela Presentation Layer (T-015) para exibir licoes

### Problemas que Resolve
- Orquestra fluxo complexo em um unico ponto de entrada
- Implementa cache-first para evitar custos desnecessarios com OpenAI
- Centraliza tratamento de erros de multiplos servicos
- Garante consistencia das entidades de dominio

---

## What

### Comportamento Esperado

```
Usuario fornece: YouTube URL + Difficulty
                    |
                    v
        +------------------------+
        | GenerateLessonUseCase  |
        +------------------------+
                    |
        1. Extract VideoId from URL
                    |
        2. Check Lesson Cache (PostgreSQL)
           |                    |
        CACHE HIT          CACHE MISS
           |                    |
     Return Lesson         Continue...
                                |
        3. Fetch Transcript (via FetchTranscriptUseCase)
                    |
        4. Generate Content (via LessonGenerator/OpenAI)
                    |
        5. Create Domain Entities (Lesson, Exercise, Vocabulary)
                    |
        6. Persist Lesson (via LessonRepository)
                    |
        7. Return Lesson
```

### Requisitos Tecnicos

| Requisito | Especificacao |
|-----------|---------------|
| Input | `{ videoUrl: string, difficulty: Difficulty }` |
| Output | `Result<Lesson, GenerateLessonError>` |
| Cache Strategy | Cache-first (lesson + transcript) |
| Error Handling | Typed errors (discriminated unions) |
| TDD | Recomendado - 80% cobertura |

### Success Criteria
- [ ] Use case instanciado via injecao de dependencias
- [ ] Retorna lesson cacheada sem chamar IA
- [ ] Gera nova lesson quando cache miss
- [ ] Erros propagados corretamente de cada etapa
- [ ] Entidades de dominio validadas antes de persistir
- [ ] Testes unitarios com mocks para todas as dependencias

---

## All Needed Context

### Documentation & References

```yaml
- file: src/features/transcript/application/use-cases/fetch-transcript.ts
  why: Padrao de use case a seguir - Result pattern, error types, cache-first

- file: src/features/lesson/domain/entities/lesson.ts
  why: Aggregate root, factory method create(), validacoes

- file: src/features/lesson/domain/entities/exercise.ts
  why: Entity factory, validacoes, ExerciseType

- file: src/features/lesson/domain/entities/vocabulary-item.ts
  why: Entity factory, validacoes, PartOfSpeech

- file: src/features/lesson/domain/interfaces/lesson-repository.ts
  why: Interface de persistencia - findByVideoId, save

- file: src/features/lesson/domain/interfaces/lesson-generator.ts
  why: Interface de geracao - generate(), GeneratedLessonData

- file: src/features/lesson/domain/value-objects/difficulty.ts
  why: Value object para nivel de dificuldade

- file: src/features/lesson/domain/errors/lesson-errors.ts
  why: Tipos de erro do dominio - todos os erros tipados

- file: src/shared/core/result.ts
  why: Result pattern - ok(), fail(), isSuccess, isFailure
```

### Current Codebase Structure

```
src/features/lesson/
├── domain/
│   ├── entities/
│   │   ├── exercise.ts         # Exercise entity
│   │   ├── lesson.ts           # Lesson aggregate
│   │   └── vocabulary-item.ts  # VocabularyItem entity
│   ├── errors/
│   │   └── lesson-errors.ts    # All typed errors
│   ├── interfaces/
│   │   ├── lesson-generator.ts # LessonGenerator interface
│   │   └── lesson-repository.ts # LessonRepository interface
│   ├── value-objects/
│   │   ├── difficulty.ts       # Difficulty VO
│   │   └── exercise-type.ts    # ExerciseType VO
│   └── index.ts                # Domain exports
├── infrastructure/
│   ├── mappers/
│   │   └── lesson-mapper.ts    # Prisma <-> Domain mapper
│   ├── repositories/
│   │   └── prisma-lesson-repository.ts # Prisma implementation
│   ├── services/
│   │   ├── openai-lesson-generator.ts  # OpenAI implementation
│   │   └── prompts/
│   │       ├── exercise-prompt.ts
│   │       ├── schemas.ts
│   │       └── vocabulary-prompt.ts
│   └── index.ts                # Infrastructure exports
└── application/                # <- A SER CRIADO
    └── use-cases/
        └── generate-lesson.ts  # <- A SER CRIADO

tests/unit/features/lesson/
├── domain/                     # <- JA EXISTE
│   ├── difficulty.test.ts
│   ├── exercise-type.test.ts
│   ├── exercise.test.ts
│   ├── lesson.test.ts
│   └── vocabulary-item.test.ts
└── application/                # <- A SER CRIADO
    └── generate-lesson.test.ts # <- A SER CRIADO
```

### Desired Codebase Structure

```
src/features/lesson/
├── domain/                     # SEM ALTERACOES
├── infrastructure/             # SEM ALTERACOES
└── application/                # NOVO
    ├── use-cases/
    │   ├── generate-lesson.ts  # GenerateLessonUseCase
    │   └── index.ts            # Exports
    └── index.ts                # Application exports

tests/unit/features/lesson/
├── domain/                     # SEM ALTERACOES
└── application/                # NOVO
    └── generate-lesson.test.ts # Tests para use case
```

### Known Gotchas & Library Quirks

```
# CRITICAL: FetchTranscriptUseCase retorna Result
- FetchTranscriptUseCase.execute() retorna Promise<Result<Transcript, FetchTranscriptError>>
- DEVE verificar isFailure antes de acessar value
- Erros do transcript DEVEM ser propagados

# CRITICAL: LessonGenerator retorna Result com dados brutos
- LessonGenerator.generate() retorna Promise<Result<GeneratedLessonData, LessonGenerationError>>
- GeneratedLessonData contem arrays de dados brutos (NAO entidades)
- DEVE criar entidades Exercise e VocabularyItem a partir dos dados
- Cada criacao de entidade pode falhar (Result pattern)

# CRITICAL: Lesson.create() requer arrays de entidades
- Lesson.create({ exercises: Exercise[], vocabulary: VocabularyItem[], ... })
- NAO aceita dados brutos - DEVE converter antes
- Requer pelo menos 1 exercise e 1 vocabulary item

# CRITICAL: Todas as entidades retornam Result
- Exercise.create() -> Result<Exercise, ExerciseValidationError>
- VocabularyItem.create() -> Result<VocabularyItem, VocabularyValidationError>
- Lesson.create() -> Result<Lesson, LessonValidationError>
- DEVE verificar isFailure de CADA criacao

# CRITICAL: VideoId pode ser extraido de URL ou reusado
- FetchTranscriptUseCase.execute(videoUrl) extrai VideoId internamente
- Para verificar cache de lesson, DEVE extrair VideoId primeiro
- Usar VideoId.fromUrl(videoUrl)

# GOTCHA: IDs devem ser gerados com crypto.randomUUID()
- Exercise e VocabularyItem requerem id no momento da criacao
- Usar crypto.randomUUID() para gerar UUIDs

# GOTCHA: ExerciseType deve ser criado a partir de string
- ExerciseType.fromString(type) -> Result<ExerciseType, InvalidExerciseTypeError>
- Tipos validos: 'fill-blank', 'multiple-choice', 'translation', 'listening'
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// Input DTO
export interface GenerateLessonInput {
  videoUrl: string
  difficulty: Difficulty
}

// Error Union Type
export type GenerateLessonError =
  | InvalidVideoUrlError
  | TranscriptFetchError
  | TranscriptNotFoundError
  | LessonGenerationError
  | ExerciseValidationError
  | VocabularyValidationError
  | LessonValidationError

// Dependencies (injected via constructor)
interface Dependencies {
  lessonRepo: LessonRepository
  fetchTranscript: FetchTranscriptUseCase
  lessonGenerator: LessonGenerator
}
```

### Tasks

#### Task 1: Create Test File (TDD - RED)

**File:** `tests/unit/features/lesson/application/generate-lesson.test.ts`

```typescript
// Pseudocode - estrutura dos testes

describe('GenerateLessonUseCase', () => {
  // Setup mocks
  const mockLessonRepo = {
    findByVideoId: vi.fn(),
    save: vi.fn(),
  }
  const mockFetchTranscript = {
    execute: vi.fn(),
  }
  const mockLessonGenerator = {
    generate: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // Test 1: Cache hit - retorna lesson cacheada
  it('should return cached lesson if exists', async () => {
    // Arrange: mockLessonRepo.findByVideoId retorna lesson
    // Act: useCase.execute({ videoUrl, difficulty })
    // Assert:
    //   - resultado isSuccess
    //   - retorna lesson cacheada
    //   - NAO chama fetchTranscript
    //   - NAO chama lessonGenerator
  })

  // Test 2: Cache miss - gera nova lesson
  it('should generate new lesson if not cached', async () => {
    // Arrange:
    //   - mockLessonRepo.findByVideoId retorna null
    //   - mockFetchTranscript.execute retorna Result.ok(transcript)
    //   - mockLessonGenerator.generate retorna Result.ok(generatedData)
    // Act: useCase.execute({ videoUrl, difficulty })
    // Assert:
    //   - resultado isSuccess
    //   - chama fetchTranscript
    //   - chama lessonGenerator
    //   - chama lessonRepo.save
  })

  // Test 3: URL invalida
  it('should return error for invalid video URL', async () => {
    // Arrange: URL invalida
    // Act: useCase.execute({ videoUrl: 'invalid', difficulty })
    // Assert: resultado isFailure com InvalidVideoUrlError
  })

  // Test 4: Erro ao buscar transcript
  it('should propagate transcript fetch error', async () => {
    // Arrange:
    //   - mockLessonRepo.findByVideoId retorna null
    //   - mockFetchTranscript.execute retorna Result.fail(error)
    // Act: useCase.execute({ videoUrl, difficulty })
    // Assert: resultado isFailure com erro do transcript
  })

  // Test 5: Erro na geracao IA
  it('should propagate lesson generation error', async () => {
    // Arrange:
    //   - mockLessonRepo.findByVideoId retorna null
    //   - mockFetchTranscript.execute retorna Result.ok(transcript)
    //   - mockLessonGenerator.generate retorna Result.fail(error)
    // Act: useCase.execute({ videoUrl, difficulty })
    // Assert: resultado isFailure com LessonGenerationError
  })

  // Test 6: Dificuldade e passada para o generator
  it('should pass difficulty to generator', async () => {
    // Arrange: setup mocks para sucesso
    // Act: useCase.execute({ videoUrl, difficulty: Difficulty.hard() })
    // Assert: lessonGenerator.generate chamado com difficulty correta
  })
})
```

#### Task 2: Implement GenerateLessonUseCase (TDD - GREEN)

**File:** `src/features/lesson/application/use-cases/generate-lesson.ts`

```typescript
// Pseudocode - implementacao

import { Result } from '@/shared/core/result'
import { VideoId, InvalidVideoUrlError } from '@/features/transcript/domain'
import {
  Lesson, Exercise, VocabularyItem,
  LessonRepository, LessonGenerator,
  Difficulty, ExerciseType,
  LessonValidationError, ExerciseValidationError,
  VocabularyValidationError, LessonGenerationError
} from '../../domain'
import { FetchTranscriptUseCase, FetchTranscriptError } from '@/features/transcript/application'

// Type for all possible errors
export type GenerateLessonError =
  | InvalidVideoUrlError
  | FetchTranscriptError
  | LessonGenerationError
  | ExerciseValidationError
  | VocabularyValidationError
  | LessonValidationError

// Input DTO
export interface GenerateLessonInput {
  videoUrl: string
  difficulty: Difficulty
}

export class GenerateLessonUseCase {
  constructor(
    private readonly lessonRepo: LessonRepository,
    private readonly fetchTranscript: FetchTranscriptUseCase,
    private readonly lessonGenerator: LessonGenerator
  ) {}

  async execute(input: GenerateLessonInput): Promise<Result<Lesson, GenerateLessonError>> {
    // 1. Extract VideoId from URL
    const videoIdResult = VideoId.fromUrl(input.videoUrl)
    if (videoIdResult.isFailure) {
      return Result.fail(videoIdResult.error)
    }
    const videoId = videoIdResult.value

    // 2. Check lesson cache
    const cachedLesson = await this.lessonRepo.findByVideoId(videoId)
    if (cachedLesson) {
      return Result.ok(cachedLesson)
    }

    // 3. Fetch transcript (has its own cache)
    const transcriptResult = await this.fetchTranscript.execute(input.videoUrl)
    if (transcriptResult.isFailure) {
      return Result.fail(transcriptResult.error)
    }
    const transcript = transcriptResult.value

    // 4. Generate content via AI
    const generationResult = await this.lessonGenerator.generate(
      transcript,
      input.difficulty
    )
    if (generationResult.isFailure) {
      return Result.fail(generationResult.error)
    }
    const generatedData = generationResult.value

    // 5. Create Exercise entities
    const exercisesResult = this.createExercises(generatedData.exercises)
    if (exercisesResult.isFailure) {
      return Result.fail(exercisesResult.error)
    }

    // 6. Create VocabularyItem entities
    const vocabularyResult = this.createVocabulary(generatedData.vocabulary)
    if (vocabularyResult.isFailure) {
      return Result.fail(vocabularyResult.error)
    }

    // 7. Create Lesson aggregate
    const lessonResult = Lesson.create({
      id: crypto.randomUUID(),
      videoId,
      title: generatedData.title,
      difficulty: input.difficulty,
      exercises: exercisesResult.value,
      vocabulary: vocabularyResult.value,
    })
    if (lessonResult.isFailure) {
      return Result.fail(lessonResult.error)
    }

    // 8. Persist lesson
    await this.lessonRepo.save(lessonResult.value)

    return Result.ok(lessonResult.value)
  }

  private createExercises(
    data: GeneratedExerciseData[]
  ): Result<Exercise[], ExerciseValidationError> {
    const exercises: Exercise[] = []

    for (const item of data) {
      // Convert string type to ExerciseType value object
      const typeResult = ExerciseType.fromString(item.type)
      if (typeResult.isFailure) {
        return Result.fail(
          new ExerciseValidationError('type', typeResult.error.message)
        )
      }

      const exerciseResult = Exercise.create({
        id: crypto.randomUUID(),
        type: typeResult.value,
        question: item.question,
        answer: item.answer,
        options: item.options,
        explanation: item.explanation,
        chunkIndex: item.chunkIndex,
      })

      if (exerciseResult.isFailure) {
        return Result.fail(exerciseResult.error)
      }

      exercises.push(exerciseResult.value)
    }

    return Result.ok(exercises)
  }

  private createVocabulary(
    data: GeneratedVocabularyData[]
  ): Result<VocabularyItem[], VocabularyValidationError> {
    const vocabulary: VocabularyItem[] = []

    for (const item of data) {
      const vocabResult = VocabularyItem.create({
        id: crypto.randomUUID(),
        word: item.word,
        definition: item.definition,
        example: item.example,
        partOfSpeech: item.partOfSpeech,
        chunkIndex: item.chunkIndex,
      })

      if (vocabResult.isFailure) {
        return Result.fail(vocabResult.error)
      }

      vocabulary.push(vocabResult.value)
    }

    return Result.ok(vocabulary)
  }
}
```

#### Task 3: Create Index Files (exports)

**File:** `src/features/lesson/application/use-cases/index.ts`
```typescript
export { GenerateLessonUseCase, type GenerateLessonInput, type GenerateLessonError } from './generate-lesson'
```

**File:** `src/features/lesson/application/index.ts`
```typescript
export * from './use-cases'
```

#### Task 4: Run Tests and Refactor (TDD - REFACTOR)

```bash
# Run tests
pnpm test tests/unit/features/lesson/application/

# Check coverage
pnpm test:coverage -- --coverage.include="src/features/lesson/application/**"

# Ensure 80%+ coverage
```

### Integration Points

```yaml
IMPORTS:
  from_transcript:
    - FetchTranscriptUseCase (application)
    - VideoId, InvalidVideoUrlError (domain)
    - FetchTranscriptError (application)

  from_lesson_domain:
    - Lesson, Exercise, VocabularyItem (entities)
    - LessonRepository, LessonGenerator (interfaces)
    - Difficulty, ExerciseType (value-objects)
    - All error types (errors)

  from_shared:
    - Result (core/result)

EXPORTS:
  to_presentation:
    - GenerateLessonUseCase
    - GenerateLessonInput
    - GenerateLessonError
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run linting
pnpm lint

# Fix auto-fixable issues
pnpm lint --fix

# Expected: No errors
```

### Level 2: Type Check

```bash
# Run type checking
pnpm type-check

# Expected: No type errors
```

### Level 3: Unit Tests (TDD)

```bash
# Run unit tests for this feature
pnpm test tests/unit/features/lesson/application/

# Run with coverage
pnpm test:coverage -- --coverage.include="src/features/lesson/application/**"

# Expected: All tests pass, 80%+ coverage
```

### Level 4: Integration Tests

```bash
# Run integration tests (if applicable)
pnpm test:integration

# Expected: All tests pass
```

### Level 5: Build

```bash
# Build project
pnpm build

# Expected: No build errors
```

---

## Final Validation Checklist

- [ ] All tests pass: `pnpm test tests/unit/features/lesson/application/`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm type-check`
- [ ] Coverage >= 80%: `pnpm test:coverage`
- [ ] Build succeeds: `pnpm build`

### Acceptance Criteria Verification

- [ ] Use case verifica cache de lesson primeiro (`findByVideoId` antes de qualquer outra chamada)
- [ ] Retorna lesson cacheada se existir (teste: "should return cached lesson if exists")
- [ ] Busca transcricao via FetchTranscriptUseCase (teste: "should generate new lesson if not cached")
- [ ] Gera exercicios e vocabulario via LessonGenerator (teste: verificar chamada a `generate`)
- [ ] Cria entidades de dominio com validacao (metodos `createExercises` e `createVocabulary`)
- [ ] Persiste lesson no repositorio (teste: verificar chamada a `save`)
- [ ] Trata erros de cada etapa corretamente (testes de propagacao de erro)
- [ ] Cobertura de testes: 80%+ (command: `pnpm test:coverage`)

---

## Anti-Patterns to Avoid

- **NAO criar novas entidades diretamente** - Usar factory methods (Lesson.create, Exercise.create, etc.)
- **NAO ignorar erros de Result** - Sempre verificar isFailure antes de acessar value
- **NAO usar exceptions** - Usar Result pattern com erros tipados
- **NAO chamar IA se lesson esta cacheada** - Verificar cache primeiro (custo $$$)
- **NAO acessar banco diretamente** - Usar interfaces (LessonRepository)
- **NAO importar Prisma no use case** - Apenas interfaces do domain
- **NAO criar IDs hardcoded** - Usar crypto.randomUUID()
- **NAO esquecer de persistir** - Chamar lessonRepo.save() apos criar lesson
- **NAO propagar erros genericos** - Manter tipos de erro especificos

---

## Test Helpers (Mock Factories)

```typescript
// tests/unit/features/lesson/application/test-helpers.ts

import { Difficulty } from '@/features/lesson/domain/value-objects/difficulty'
import { ExerciseType } from '@/features/lesson/domain/value-objects/exercise-type'
import { Exercise } from '@/features/lesson/domain/entities/exercise'
import { VocabularyItem } from '@/features/lesson/domain/entities/vocabulary-item'
import { Lesson } from '@/features/lesson/domain/entities/lesson'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'
import { Transcript, Chunk } from '@/features/transcript/domain'
import type { GeneratedLessonData, GeneratedExerciseData, GeneratedVocabularyData } from '@/features/lesson/domain/interfaces/lesson-generator'

export function createMockVideoId(): VideoId {
  return VideoId.fromId('abc12345678').value
}

export function createMockTranscript(): Transcript {
  const chunk = Chunk.create({
    index: 0,
    text: 'Hello, this is a test transcript',
    startTime: 0,
    endTime: 30,
  }).value

  return Transcript.create({
    id: crypto.randomUUID(),
    videoId: createMockVideoId(),
    title: 'Test Video',
    language: 'en',
    chunks: [chunk],
  }).value
}

export function createMockExerciseData(): GeneratedExerciseData {
  return {
    type: 'fill-blank',
    question: 'Complete: Hello ___',
    answer: 'world',
    options: null,
    explanation: 'Common greeting',
    chunkIndex: 0,
  }
}

export function createMockVocabularyData(): GeneratedVocabularyData {
  return {
    word: 'hello',
    definition: 'A greeting',
    example: 'Hello, how are you?',
    partOfSpeech: 'phrase',
    chunkIndex: 0,
  }
}

export function createMockGeneratedData(): GeneratedLessonData {
  return {
    title: 'Test Lesson',
    exercises: [createMockExerciseData()],
    vocabulary: [createMockVocabularyData()],
  }
}

export function createMockLesson(): Lesson {
  const exercise = Exercise.create({
    id: crypto.randomUUID(),
    type: ExerciseType.fromString('fill-blank').value,
    question: 'Test question',
    answer: 'answer',
    options: null,
    explanation: 'Test explanation',
    chunkIndex: 0,
  }).value

  const vocab = VocabularyItem.create({
    id: crypto.randomUUID(),
    word: 'test',
    definition: 'A test word',
    example: 'This is a test',
    partOfSpeech: 'noun',
    chunkIndex: 0,
  }).value

  return Lesson.create({
    id: crypto.randomUUID(),
    videoId: createMockVideoId(),
    title: 'Test Lesson',
    difficulty: Difficulty.medium(),
    exercises: [exercise],
    vocabulary: [vocab],
  }).value
}
```

---

## Confidence Note

**Nota de Confianca: 9/10**

**Justificativa:**
- Contexto completo disponivel (todas as dependencias ja implementadas)
- Padroes claros no codebase (FetchTranscriptUseCase como exemplo)
- Entidades e interfaces bem definidas
- Testes existentes para referencia
- Unica incerteza: tratamento de erros de persistencia (pode precisar de try-catch)

**Riscos Baixos:**
- Result pattern ja consolidado no projeto
- Interfaces bem definidas com contratos claros
- Dependencias (T-007, T-011, T-012, T-013) ja implementadas

---

*PRP gerado pelo Context Engineering Framework v2.0*
*Data: 2026-01-03*

---

## Pos-Implementacao

**Data:** 2026-01-03
**Status:** Implementado

### Arquivos Criados/Modificados

**Criados:**
- `src/features/lesson/application/use-cases/generate-lesson.ts` - GenerateLessonUseCase implementation
- `src/features/lesson/application/use-cases/index.ts` - Use cases exports
- `src/features/lesson/application/index.ts` - Application layer exports
- `tests/unit/features/lesson/application/generate-lesson.test.ts` - Unit tests (16 tests)

### Testes
- 16 testes unitarios criados
- Cobertura Application: 88%
- Cobertura Domain: 100% (entidades ja testadas)

### Validation Gates
- [x] Lint: passou
- [x] Type-check: passou
- [x] Unit tests: passou (340 testes totais, 16 novos)
- [x] Build: passou

### Erros Encontrados
1. **Lint error: unused imports** - `InvalidVideoUrlError` e `FetchTranscriptError` importados mas nao usados diretamente no arquivo de testes
   - Solucao: Removidos os imports nao utilizados, usando apenas `_tag` para verificacao de tipo de erro

### Decisoes Tomadas
1. **Mock pattern para FetchTranscriptUseCase:** Criado mock simples com `execute` function ao inves de instanciar o use case real, permitindo controle total nos testes
2. **Helpers de teste reutilizaveis:** Criados factory functions para criar mocks de entidades (createMockVideoId, createMockTranscript, etc.)
3. **Ordem de verificacao:** Cache check antes de fetch transcript (custo-efetivo, evita chamadas desnecessarias a API)
4. **Error propagation:** Erros de cada etapa propagados sem transformacao, mantendo tipos especificos

### Context7 Consultado
- Nenhuma consulta necessaria - patterns ja estabelecidos no codebase

### Criterios de Aceite Verificados
- [x] Use case verifica cache de lesson primeiro
- [x] Retorna lesson cacheada se existir
- [x] Busca transcricao via FetchTranscriptUseCase
- [x] Gera exercicios e vocabulario via LessonGenerator
- [x] Cria entidades de dominio com validacao
- [x] Persiste lesson no repositorio
- [x] Trata erros de cada etapa corretamente
- [x] Cobertura de testes: 88% (acima de 80%)
