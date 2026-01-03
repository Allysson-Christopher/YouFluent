# PRP-011: Domain - Lesson entities (Lesson, Exercise, VocabularyItem)

---

## Input Summary

**Modo:** AUTO
**Tarefa:** T-011 - Domain - Lesson entities (Lesson, Exercise, VocabularyItem)
**Origem:** context/TASKS/T-011.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/PRD/features/lesson.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/dominios/lesson.md
- context/ARQUITETURA/padroes.md

**Objetivo:** Entidades de dominio Lesson completas com validacao, value objects e interfaces.

**Escopo:**
- Entity: Lesson (agregado principal)
- Entity: Exercise (exercicio interativo)
- Entity: VocabularyItem (item de vocabulario)
- Value Object: Difficulty (easy, medium, hard)
- Value Object: ExerciseType (fill-blank, multiple-choice, etc)
- Interface: LessonRepository
- Interface: LessonGenerator (contrato para IA)
- Testes TDD com 100% cobertura

**Criterios de Aceite:**
- [ ] Difficulty suporta easy, medium, hard
- [ ] ExerciseType suporta 4 tipos de exercicio
- [ ] Exercise valida tipo vs opcoes (multiple-choice precisa de opcoes)
- [ ] VocabularyItem tem word, definition, example
- [ ] Lesson e aggregate root com exercises e vocabulary
- [ ] Lesson requer pelo menos 1 exercicio
- [ ] Interfaces definidas para repository e generator
- [ ] Cobertura de testes: 100%

---

## Goal

Criar o modelo de dominio completo para Lesson seguindo DDD (Domain-Driven Design), implementando entidades, value objects, interfaces e erros tipados com 100% de cobertura de testes usando TDD.

## Why

- **Valor de Negocio:** Lesson e o agregado central do YouFluent - toda geracao de conteudo educacional depende deste dominio
- **Fundacao para Features Futuras:** T-012 (OpenAILessonGenerator), T-013 (PrismaLessonRepository), T-014 (GenerateLessonUseCase) dependem deste dominio
- **Qualidade:** Dominio bem definido com validacoes garante consistencia de dados e previne bugs nas camadas superiores
- **Testabilidade:** Dominio puro (sem dependencias externas) permite testes rapidos e confiaveis

## What

### Comportamento Esperado

1. **Difficulty Value Object**
   - Suporta tres niveis: easy, medium, hard
   - Factory methods: `Difficulty.easy()`, `Difficulty.medium()`, `Difficulty.hard()`
   - Parser: `Difficulty.fromString(value)` retorna Result
   - Imutavel e comparavel por valor

2. **ExerciseType Value Object**
   - Suporta 4 tipos: fill-blank, multiple-choice, translation, listening
   - Factory methods para cada tipo
   - Propriedade `requiresTextInput` (true para fill-blank e translation)
   - Propriedade `requiresOptions` (true para multiple-choice)

3. **VocabularyItem Entity**
   - Propriedades: word, definition, example, partOfSpeech, chunkIndex
   - Validacao: word e definition nao podem ser vazios
   - partOfSpeech: noun, verb, adjective, adverb, phrase

4. **Exercise Entity**
   - Propriedades: id, type, question, answer, options (nullable), explanation, chunkIndex
   - Regra: multiple-choice DEVE ter options
   - Regra: answer DEVE estar em options (se multiple-choice)
   - Metodo: `checkAnswer(userAnswer)` para validar resposta

5. **Lesson Aggregate Root**
   - Propriedades: id, videoId, title, difficulty, exercises, vocabulary, createdAt
   - Invariante: pelo menos 1 exercise
   - Invariante: pelo menos 1 vocabulary item
   - Metodos de consulta: `exerciseCount`, `vocabularyCount`, `getExerciseById`

6. **Interfaces**
   - `LessonRepository`: save, findByVideoId, findById, exists
   - `LessonGenerator`: generate(transcript, difficulty) -> Result<GeneratedLesson>

### Success Criteria

- [ ] Todos os value objects sao imutaveis (Object.freeze)
- [ ] Todas as entidades usam Result pattern para erros
- [ ] Todas as invariantes sao validadas em `create()`
- [ ] Erros sao tipados com `_tag` discriminator
- [ ] Testes cobrem todos os caminhos (happy path + edge cases)
- [ ] 100% cobertura no domain layer

---

## All Needed Context

### Documentation & References

```yaml
# MUST READ - Padroes do projeto
- file: src/features/transcript/domain/entities/transcript.ts
  why: Padrao de aggregate root - constructor privado, static create(), Object.freeze

- file: src/features/transcript/domain/value-objects/video-id.ts
  why: Padrao de value object - factory methods, Result pattern, equals()

- file: src/features/transcript/domain/errors/transcript-errors.ts
  why: Padrao de erros tipados - _tag discriminator, message getter

- file: src/features/transcript/domain/interfaces/transcript-repository.ts
  why: Padrao de interface repository - PRE/POST conditions

- file: src/shared/core/result.ts
  why: Result pattern - Result.ok(), Result.fail(), isSuccess/isFailure

- file: tests/unit/features/transcript/domain/video-id.test.ts
  why: Padrao de testes - describe/it, expect, tipagem correta de Result

- file: context/ARQUITETURA/padroes.md
  why: DDD, Clean Architecture, TDD - regras obrigatorias
```

### Current Codebase Tree

```
src/
├── app/                              # Next.js App Router
├── features/
│   ├── player/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value-objects/
│   │   │   ├── interfaces/
│   │   │   └── errors/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── transcript/
│   │   ├── domain/
│   │   │   ├── entities/          # Chunk, Transcript
│   │   │   ├── value-objects/     # VideoId
│   │   │   ├── interfaces/        # TranscriptRepository, TranscriptFetcher
│   │   │   └── errors/            # TranscriptError types
│   │   ├── infrastructure/
│   │   └── application/
│   └── lesson/                       # [NAO EXISTE AINDA]
├── shared/
│   ├── core/
│   │   └── result.ts                 # Result pattern
│   └── lib/
└── prisma/
```

### Desired Codebase Tree

```
src/features/lesson/
├── domain/
│   ├── entities/
│   │   ├── lesson.ts              # Lesson aggregate root
│   │   ├── exercise.ts            # Exercise entity
│   │   └── vocabulary-item.ts     # VocabularyItem entity
│   ├── value-objects/
│   │   ├── difficulty.ts          # Difficulty VO (easy/medium/hard)
│   │   └── exercise-type.ts       # ExerciseType VO (fill-blank, etc)
│   ├── interfaces/
│   │   ├── lesson-repository.ts   # Repository interface
│   │   └── lesson-generator.ts    # Generator interface (for AI)
│   ├── errors/
│   │   └── lesson-errors.ts       # Typed errors
│   └── index.ts                   # Public exports

tests/unit/features/lesson/domain/
├── difficulty.test.ts
├── exercise-type.test.ts
├── vocabulary-item.test.ts
├── exercise.test.ts
└── lesson.test.ts
```

### Known Gotchas & Library Quirks

```
# CRITICAL: Domain layer ZERO external dependencies
- No React, Prisma, Zod imports
- Only import from @/shared/core/result

# CRITICAL: Use existing Result pattern
- Import from '@/shared/core/result'
- Result.ok(value) for success
- Result.fail(error) for failure
- Type: Result<T, E>

# CRITICAL: All entities/VOs are immutable
- Use Object.freeze(this) in constructor
- All properties are readonly

# CRITICAL: Error types need _tag discriminator
- readonly _tag = 'ErrorName' as const
- This enables exhaustive type checking

# CRITICAL: Factory pattern
- Private constructor
- Static create() or factory methods
- Returns Result<Entity, Error>

# TDD: Test file FIRST, then implementation
- RED: Write failing test
- GREEN: Minimal code to pass
- REFACTOR: Improve keeping tests green
```

---

## Implementation Blueprint

### Data Models and Structure

#### Value Objects

```typescript
// Difficulty - 3 levels
type DifficultyLevel = 'easy' | 'medium' | 'hard'

// ExerciseType - 4 types
type ExerciseTypeValue = 'fill-blank' | 'multiple-choice' | 'translation' | 'listening'

// PartOfSpeech - for vocabulary
type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase'
```

#### Entities

```typescript
// VocabularyItem
interface VocabularyItemProps {
  id: string
  word: string
  definition: string
  example: string
  partOfSpeech: PartOfSpeech
  chunkIndex: number
}

// Exercise
interface ExerciseProps {
  id: string
  type: ExerciseType
  question: string
  answer: string
  options: string[] | null
  explanation: string
  chunkIndex: number
}

// Lesson (Aggregate Root)
interface LessonProps {
  id: string
  videoId: VideoId  // from transcript domain
  title: string
  difficulty: Difficulty
  exercises: Exercise[]
  vocabulary: VocabularyItem[]
}
```

---

### Task List (TDD Order)

```yaml
Task 1: Create lesson errors file
  CREATE src/features/lesson/domain/errors/lesson-errors.ts
  - Define InvalidDifficultyError
  - Define InvalidExerciseTypeError
  - Define VocabularyValidationError
  - Define ExerciseValidationError
  - Define LessonValidationError
  - Define LessonNotFoundError
  - Define LessonGenerationError
  - Export union type LessonError

Task 2: Difficulty Value Object (TDD)
  CREATE tests/unit/features/lesson/domain/difficulty.test.ts
  - Test factory methods: easy(), medium(), hard()
  - Test fromString() with valid values
  - Test fromString() with invalid value
  - Test equals() comparison
  CREATE src/features/lesson/domain/value-objects/difficulty.ts
  - Implement to pass tests

Task 3: ExerciseType Value Object (TDD)
  CREATE tests/unit/features/lesson/domain/exercise-type.test.ts
  - Test factory methods: fillBlank(), multipleChoice(), translation(), listening()
  - Test fromString() with valid/invalid values
  - Test requiresTextInput property
  - Test requiresOptions property
  CREATE src/features/lesson/domain/value-objects/exercise-type.ts
  - Implement to pass tests

Task 4: VocabularyItem Entity (TDD)
  CREATE tests/unit/features/lesson/domain/vocabulary-item.test.ts
  - Test create() with valid props
  - Test validation: empty word fails
  - Test validation: empty definition fails
  - Test partOfSpeech validation
  CREATE src/features/lesson/domain/entities/vocabulary-item.ts
  - Implement to pass tests

Task 5: Exercise Entity (TDD)
  CREATE tests/unit/features/lesson/domain/exercise.test.ts
  - Test create() with fill-blank type
  - Test create() with multiple-choice type (requires options)
  - Test validation: multiple-choice without options fails
  - Test validation: answer not in options fails
  - Test checkAnswer() method
  CREATE src/features/lesson/domain/entities/exercise.ts
  - Implement to pass tests

Task 6: Lesson Aggregate Root (TDD)
  CREATE tests/unit/features/lesson/domain/lesson.test.ts
  - Test create() with valid exercises and vocabulary
  - Test validation: empty exercises fails
  - Test validation: empty vocabulary fails
  - Test exerciseCount getter
  - Test vocabularyCount getter
  - Test getExerciseById() method
  CREATE src/features/lesson/domain/entities/lesson.ts
  - Implement to pass tests

Task 7: Repository and Generator Interfaces
  CREATE src/features/lesson/domain/interfaces/lesson-repository.ts
  - Define save(), findByVideoId(), findById(), exists(), delete()
  CREATE src/features/lesson/domain/interfaces/lesson-generator.ts
  - Define GeneratedLesson type
  - Define generate(transcript, difficulty) method

Task 8: Domain index exports
  CREATE src/features/lesson/domain/index.ts
  - Export all entities, value objects, interfaces, errors

Task 9: Run full test suite and verify coverage
  RUN pnpm test tests/unit/features/lesson/domain/
  RUN pnpm test:coverage -- --coverage.include="src/features/lesson/domain/**"
  - Verify 100% coverage
```

---

### Per-Task Pseudocode

#### Task 1: Lesson Errors

```typescript
// src/features/lesson/domain/errors/lesson-errors.ts

export class InvalidDifficultyError {
  readonly _tag = 'InvalidDifficultyError' as const
  constructor(readonly value: string) {}
  get message(): string { return `Invalid difficulty: ${this.value}` }
}

export class InvalidExerciseTypeError {
  readonly _tag = 'InvalidExerciseTypeError' as const
  constructor(readonly value: string) {}
  get message(): string { return `Invalid exercise type: ${this.value}` }
}

export class VocabularyValidationError {
  readonly _tag = 'VocabularyValidationError' as const
  constructor(readonly field: string, readonly errorMessage: string) {}
  get message(): string { return `Vocabulary validation failed for "${this.field}": ${this.errorMessage}` }
}

export class ExerciseValidationError {
  readonly _tag = 'ExerciseValidationError' as const
  constructor(readonly field: string, readonly errorMessage: string) {}
  get message(): string { return `Exercise validation failed for "${this.field}": ${this.errorMessage}` }
}

export class LessonValidationError {
  readonly _tag = 'LessonValidationError' as const
  constructor(readonly field: string, readonly errorMessage: string) {}
  get message(): string { return `Lesson validation failed for "${this.field}": ${this.errorMessage}` }
}

export class LessonNotFoundError {
  readonly _tag = 'LessonNotFoundError' as const
  constructor(readonly lessonId: string) {}
  get message(): string { return `Lesson not found: ${this.lessonId}` }
}

export class LessonGenerationError {
  readonly _tag = 'LessonGenerationError' as const
  constructor(readonly reason: string) {}
  get message(): string { return `Failed to generate lesson: ${this.reason}` }
}

export type LessonError =
  | InvalidDifficultyError
  | InvalidExerciseTypeError
  | VocabularyValidationError
  | ExerciseValidationError
  | LessonValidationError
  | LessonNotFoundError
  | LessonGenerationError
```

#### Task 2: Difficulty Value Object

```typescript
// TEST FIRST: tests/unit/features/lesson/domain/difficulty.test.ts
describe('Difficulty', () => {
  describe('factory methods', () => {
    it('should create easy difficulty')
    it('should create medium difficulty')
    it('should create hard difficulty')
  })

  describe('fromString', () => {
    it('should parse valid difficulty strings')
    it('should fail for invalid difficulty')
  })

  describe('equals', () => {
    it('should return true for same value')
    it('should return false for different values')
  })
})

// THEN IMPLEMENT: src/features/lesson/domain/value-objects/difficulty.ts
export class Difficulty {
  private constructor(readonly value: 'easy' | 'medium' | 'hard') {
    Object.freeze(this)
  }

  static easy(): Difficulty { return new Difficulty('easy') }
  static medium(): Difficulty { return new Difficulty('medium') }
  static hard(): Difficulty { return new Difficulty('hard') }

  static fromString(value: string): Result<Difficulty, InvalidDifficultyError> {
    if (!['easy', 'medium', 'hard'].includes(value)) {
      return Result.fail(new InvalidDifficultyError(value))
    }
    return Result.ok(new Difficulty(value as 'easy' | 'medium' | 'hard'))
  }

  equals(other: Difficulty): boolean {
    return this.value === other.value
  }
}
```

#### Task 3: ExerciseType Value Object

```typescript
// TEST FIRST
describe('ExerciseType', () => {
  describe('factory methods', () => {
    it('should create fill-blank type with requiresTextInput=true')
    it('should create multiple-choice type with requiresOptions=true')
    it('should create translation type')
    it('should create listening type')
  })

  describe('fromString', () => {
    it('should parse valid type strings')
    it('should fail for invalid type')
  })
})

// THEN IMPLEMENT
export class ExerciseType {
  private constructor(
    readonly value: 'fill-blank' | 'multiple-choice' | 'translation' | 'listening'
  ) {
    Object.freeze(this)
  }

  static fillBlank() { return new ExerciseType('fill-blank') }
  static multipleChoice() { return new ExerciseType('multiple-choice') }
  static translation() { return new ExerciseType('translation') }
  static listening() { return new ExerciseType('listening') }

  get requiresTextInput(): boolean {
    return ['fill-blank', 'translation'].includes(this.value)
  }

  get requiresOptions(): boolean {
    return this.value === 'multiple-choice'
  }
}
```

#### Task 4: VocabularyItem Entity

```typescript
// TEST FIRST
describe('VocabularyItem', () => {
  it('should create valid vocabulary item')
  it('should reject empty word')
  it('should reject empty definition')
  it('should validate partOfSpeech')
})

// THEN IMPLEMENT
export class VocabularyItem {
  private constructor(
    readonly id: string,
    readonly word: string,
    readonly definition: string,
    readonly example: string,
    readonly partOfSpeech: PartOfSpeech,
    readonly chunkIndex: number
  ) {
    Object.freeze(this)
  }

  static create(props: VocabularyItemProps): Result<VocabularyItem, VocabularyValidationError> {
    // Validate word
    if (!props.word || props.word.trim() === '') {
      return Result.fail(new VocabularyValidationError('word', 'Word cannot be empty'))
    }
    // Validate definition
    if (!props.definition || props.definition.trim() === '') {
      return Result.fail(new VocabularyValidationError('definition', 'Definition cannot be empty'))
    }
    // ... more validations
    return Result.ok(new VocabularyItem(...))
  }
}
```

#### Task 5: Exercise Entity

```typescript
// TEST FIRST
describe('Exercise', () => {
  it('should create valid fill-blank exercise')
  it('should create valid multiple-choice exercise with options')
  it('should reject multiple-choice without options')
  it('should reject when answer not in options')
  it('should check answer correctly')
})

// THEN IMPLEMENT
export class Exercise {
  static create(props: ExerciseProps): Result<Exercise, ExerciseValidationError> {
    // CRITICAL: If multiple-choice, options MUST be provided
    if (props.type.requiresOptions && (!props.options || props.options.length === 0)) {
      return Result.fail(new ExerciseValidationError('options', 'Multiple-choice requires options'))
    }

    // CRITICAL: If options provided, answer MUST be in options
    if (props.options && !props.options.includes(props.answer)) {
      return Result.fail(new ExerciseValidationError('answer', 'Answer must be in options'))
    }

    return Result.ok(new Exercise(...))
  }

  checkAnswer(userAnswer: string): boolean {
    return userAnswer.trim().toLowerCase() === this.answer.trim().toLowerCase()
  }
}
```

#### Task 6: Lesson Aggregate Root

```typescript
// TEST FIRST
describe('Lesson', () => {
  it('should create lesson with exercises and vocabulary')
  it('should reject empty exercises')
  it('should reject empty vocabulary')
  it('should return correct exerciseCount')
  it('should return correct vocabularyCount')
  it('should find exercise by id')
})

// THEN IMPLEMENT
export class Lesson {
  private constructor(
    readonly id: string,
    readonly videoId: VideoId,
    readonly title: string,
    readonly difficulty: Difficulty,
    readonly exercises: readonly Exercise[],
    readonly vocabulary: readonly VocabularyItem[],
    readonly createdAt: Date
  ) {
    Object.freeze(this)
  }

  static create(props: LessonProps): Result<Lesson, LessonValidationError> {
    // INVARIANT: At least 1 exercise
    if (!props.exercises || props.exercises.length === 0) {
      return Result.fail(new LessonValidationError('exercises', 'At least one exercise required'))
    }
    // INVARIANT: At least 1 vocabulary item
    if (!props.vocabulary || props.vocabulary.length === 0) {
      return Result.fail(new LessonValidationError('vocabulary', 'At least one vocabulary item required'))
    }
    return Result.ok(new Lesson(...))
  }

  get exerciseCount(): number { return this.exercises.length }
  get vocabularyCount(): number { return this.vocabulary.length }

  getExerciseById(id: string): Exercise | null {
    return this.exercises.find(e => e.id === id) ?? null
  }
}
```

#### Task 7: Interfaces

```typescript
// lesson-repository.ts
export interface LessonRepository {
  save(lesson: Lesson): Promise<void>
  findByVideoId(videoId: VideoId): Promise<Lesson | null>
  findById(id: string): Promise<Lesson | null>
  exists(videoId: VideoId): Promise<boolean>
  deleteByVideoId(videoId: VideoId): Promise<void>
}

// lesson-generator.ts
export interface GeneratedLessonData {
  exercises: ExerciseData[]
  vocabulary: VocabularyData[]
}

export interface LessonGenerator {
  generate(
    transcript: Transcript,
    difficulty: Difficulty
  ): Promise<Result<GeneratedLessonData, LessonGenerationError>>
}
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm lint
pnpm format:check

# Expected: No errors
# If errors: READ the error message and fix
```

### Level 2: Type Check

```bash
pnpm type-check

# Expected: No type errors
# If errors: Check imports and type annotations
```

### Level 3: Unit Tests

```bash
# Run domain tests only
pnpm test tests/unit/features/lesson/domain/

# With coverage
pnpm test:coverage -- --coverage.include="src/features/lesson/domain/**"

# Expected: All tests pass, 100% coverage
# If failing: Read error, understand root cause, fix code, re-run
```

### Level 4: Full Test Suite

```bash
# Ensure no regressions in other domains
pnpm test

# Expected: All tests pass
```

### Level 5: Build

```bash
pnpm build

# Expected: Build succeeds
# If failing: Check for missing exports, type errors
```

---

## Final Validation Checklist

- [ ] All tests pass: `pnpm test tests/unit/features/lesson/domain/`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm type-check`
- [ ] 100% coverage: `pnpm test:coverage -- --coverage.include="src/features/lesson/domain/**"`
- [ ] Build succeeds: `pnpm build`
- [ ] All value objects are immutable (Object.freeze)
- [ ] All entities use Result pattern
- [ ] All errors have `_tag` discriminator
- [ ] Interfaces are well documented with PRE/POST conditions
- [ ] Index exports all public API

---

## Anti-Patterns to Avoid

- **DO NOT** import React, Prisma, Zod, or any external library in domain
- **DO NOT** use exceptions (throw) - use Result pattern
- **DO NOT** create mutable objects - use Object.freeze
- **DO NOT** skip TDD - write test FIRST, then implementation
- **DO NOT** expose private constructor - use static factory methods
- **DO NOT** mix entity creation and persistence concerns
- **DO NOT** use `any` type - always explicit types
- **DO NOT** forget `_tag` discriminator in error types
- **DO NOT** hardcode values that should be configurable
- **DO NOT** assume input is valid - always validate in `create()`

---

## Notes

- **Dependency:** This domain will be used by T-012 (OpenAILessonGenerator) and T-013 (PrismaLessonRepository)
- **VideoId Import:** Use `import { VideoId } from '@/features/transcript/domain'`
- **TDD is MANDATORY:** Each test file should be created BEFORE implementation
- **100% Coverage:** Domain layer requires full test coverage

---

*PRP gerado pelo Context Engineering Framework v2.0*
*Data: 2026-01-03*
