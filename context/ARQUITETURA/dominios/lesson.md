# Dominio: Lesson

> **Modelo de dominio para licoes geradas por IA**

---

## Visao Geral

O dominio Lesson e responsavel por representar licoes de ingles geradas a partir de chunks de video. Cada licao contem vocabulario e exercicios.

## Entidades

### Lesson (Aggregate Root)

```typescript
class Lesson {
  readonly id: string
  readonly chunkId: string
  readonly vocabulary: VocabularyItem[]
  readonly exercises: Exercise[]
  readonly createdAt: Date

  static create(props: CreateLessonProps): Lesson

  // Invariantes
  // - Deve ter pelo menos 1 item de vocabulario
  // - Deve ter pelo menos 1 exercicio
}
```

### VocabularyItem (Value Object)

```typescript
class VocabularyItem {
  readonly term: string
  readonly definition: string
  readonly example: string
  readonly partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase'

  // Invariantes
  // - term nao pode ser vazio
  // - definition nao pode ser vazio
}
```

### Exercise (Entity)

```typescript
class Exercise {
  readonly id: string
  readonly type: ExerciseType
  readonly question: string
  readonly options: string[] | null  // Para multipla escolha
  readonly correctAnswer: string
  readonly explanation: string

  checkAnswer(userAnswer: string): boolean
}

type ExerciseType = 'multiple_choice' | 'fill_blank' | 'order_words'
```

## Interfaces

### LessonRepository

```typescript
interface LessonRepository {
  save(lesson: Lesson): Promise<void>
  findById(id: string): Promise<Lesson | null>
  findByChunkId(chunkId: string): Promise<Lesson | null>
}
```

### LessonGenerator

```typescript
interface LessonGenerator {
  generate(chunkText: string): Promise<Lesson>
}
```

## Erros

```typescript
class LessonNotFoundError extends Error {
  constructor(public readonly lessonId: string) {
    super(`Lesson not found: ${lessonId}`)
  }
}

class LessonGenerationError extends Error {
  constructor(public readonly reason: string) {
    super(`Failed to generate lesson: ${reason}`)
  }
}
```

## Use Cases

| Use Case | Descricao | Input | Output |
|----------|-----------|-------|--------|
| GenerateLessonUseCase | Gera licao a partir de chunk | chunkId, chunkText | Lesson |
| GetLessonUseCase | Busca licao existente | lessonId | Lesson |

## Regras de Negocio

1. Uma licao e gerada para UM chunk especifico
2. Vocabulario deve ter entre 5-10 itens
3. Exercicios devem ter entre 3-5 itens
4. Exercicios devem ser variados (nao todos do mesmo tipo)

---

## Tags de Contexto

```
PRD: features/lesson
```

---

*Dominio definido para o Context Engineering Framework*
