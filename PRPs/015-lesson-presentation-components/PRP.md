# PRP: T-015 - Presentation - LessonCard + ExercisePanel + VocabularyList

---

## Input Summary

**Modo:** AUTO
**Tarefa:** T-015 - Presentation - LessonCard + ExercisePanel + VocabularyList
**Origem:** context/TASKS/T-015.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/PRD/features/lesson.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/dominios/lesson.md
- context/ARQUITETURA/stack.md
- context/ARQUITETURA/decisoes/adr-003-zustand.md

**Objetivo:** Criar componentes de apresentacao para exibir lesson, exercicios interativos e lista de vocabulario.

**Escopo:**
- Componente LessonCard (resumo da lesson)
- Componente ExercisePanel (exercicios interativos)
- Componente VocabularyList (lista de vocabulario)
- Zustand store para estado da lesson
- Testes de componente e E2E

**Criterios de Aceite:**
- LessonCard exibe titulo, dificuldade, progresso
- ExercisePanel suporta fill-blank e multiple-choice
- ExercisePanel mostra feedback correto/incorreto
- VocabularyList exibe word, definition, example
- Click em vocabulario faz seek no video
- Zustand store gerencia estado da lesson
- Navegacao entre exercicios funciona
- Testes de componente passam
- Testes E2E passam

---

## Goal

Implementar a camada de apresentacao do dominio Lesson com tres componentes React interativos (LessonCard, ExercisePanel, VocabularyList), um Zustand store para gerenciamento de estado, e testes de componente + E2E para validar comportamento.

## Why

- **Valor de negocio**: Permite que usuarios interajam com licoes geradas pela IA, completando exercicios e aprendendo vocabulario
- **Integracao**: Conecta o dominio Lesson (ja implementado) com a UI do usuario
- **Completude do MVP**: Feature F03 (Licoes IA) requer componentes de visualizacao e interacao

## What

### Comportamento Esperado

1. **LessonCard**: Exibe resumo da licao com titulo, dificuldade (badge colorido), contagem de exercicios/vocabulario, barra de progresso, e mensagem de conclusao
2. **ExercisePanel**: Renderiza exercicio atual, suporta tipos fill-blank e multiple-choice, mostra feedback imediato, permite navegacao entre exercicios
3. **VocabularyList**: Lista todos os itens de vocabulario com word, definition, example, e permite seek no video ao clicar

### Requisitos Tecnicos

- Client Components ('use client') - todos requerem interatividade
- Zustand store para estado (answers, score, currentExerciseIndex)
- shadcn/ui para componentes base (Card, Button, Input, Badge)
- Integracao com player-store para seekToChunk
- TDD para store e componentes

### Success Criteria

- [ ] LessonCard exibe titulo, dificuldade com badge colorido, progresso
- [ ] ExercisePanel renderiza fill-blank com Input e submit
- [ ] ExercisePanel renderiza multiple-choice com botoes
- [ ] Feedback verde/vermelho apos resposta
- [ ] Navegacao prev/next funciona corretamente
- [ ] VocabularyList mostra word, definition, example
- [ ] Click em vocab chama seekToChunk do player-store
- [ ] Todos os testes unitarios passam
- [ ] Testes E2E passam

---

## All Needed Context

### Documentation & References

```yaml
- file: src/features/lesson/domain/entities/lesson.ts
  why: Entidade Lesson - estrutura de dados que os componentes consomem

- file: src/features/lesson/domain/entities/exercise.ts
  why: Entidade Exercise - tipos, options, answer, checkAnswer method

- file: src/features/lesson/domain/entities/vocabulary-item.ts
  why: Entidade VocabularyItem - word, definition, example, partOfSpeech

- file: src/features/player/presentation/stores/player-store.ts
  why: Padrao de store Zustand, seekToChunk action

- file: src/features/player/presentation/components/chunk-navigator.tsx
  why: Padrao de componente Client - uso de cn(), testids, estrutura

- file: tests/unit/features/player/presentation/chunk-navigator.test.tsx
  why: Padrao de testes de componente - mock de store, vitest-environment jsdom

- file: src/shared/components/ui/card.tsx
  why: Componente Card do shadcn/ui - estrutura existente

- file: src/shared/components/ui/button.tsx
  why: Componente Button do shadcn/ui - variantes existentes
```

### Current Codebase Tree

```
src/features/lesson/
├── domain/
│   ├── entities/
│   │   ├── lesson.ts          # Aggregate Root
│   │   ├── exercise.ts        # Entity
│   │   └── vocabulary-item.ts # Entity
│   ├── errors/
│   │   └── lesson-errors.ts
│   ├── interfaces/
│   │   ├── lesson-repository.ts
│   │   └── lesson-generator.ts
│   ├── value-objects/
│   │   ├── difficulty.ts
│   │   └── exercise-type.ts
│   └── index.ts
├── application/
│   ├── use-cases/
│   │   ├── generate-lesson.ts
│   │   └── index.ts
│   └── index.ts
├── infrastructure/
│   ├── repositories/
│   │   └── prisma-lesson-repository.ts
│   ├── services/
│   │   ├── openai-lesson-generator.ts
│   │   └── prompts/
│   ├── mappers/
│   │   └── lesson-mapper.ts
│   └── index.ts
└── [FALTA: presentation/]
```

### Desired Codebase Tree

```
src/features/lesson/
├── domain/                      # Existente
├── application/                 # Existente
├── infrastructure/              # Existente
└── presentation/                # NOVO
    ├── stores/
    │   └── lesson-store.ts      # Zustand store
    ├── components/
    │   ├── lesson-card.tsx      # Resumo da licao
    │   ├── exercise-panel.tsx   # Exercicios interativos
    │   ├── vocabulary-list.tsx  # Lista de vocabulario
    │   └── index.ts             # Barrel export
    └── index.ts                 # Barrel export

src/shared/components/ui/
├── button.tsx                   # Existente
├── card.tsx                     # Existente
├── input.tsx                    # NOVO (adicionar shadcn/ui)
├── badge.tsx                    # NOVO (adicionar shadcn/ui)
└── progress.tsx                 # NOVO (adicionar shadcn/ui)

tests/
├── unit/features/lesson/presentation/
│   ├── lesson-store.test.ts     # NOVO
│   ├── lesson-card.test.tsx     # NOVO
│   ├── exercise-panel.test.tsx  # NOVO
│   └── vocabulary-list.test.tsx # NOVO
└── e2e/lesson/
    └── lesson-interaction.spec.ts # NOVO
```

### Known Gotchas

```
# CRITICAL: Zustand stores DEVEM usar selectors para performance
# Errado: const { lesson, score } = useLessonStore()
# Certo: const lesson = useLessonStore(s => s.lesson)

# CRITICAL: Components 'use client' no topo do arquivo

# CRITICAL: Entidades de dominio sao IMUTAVEIS (Object.freeze)
# Nao tentar modificar lesson.exercises diretamente

# CRITICAL: Exercise.checkAnswer existe mas e case-insensitive
# Usar para validacao: exercise.checkAnswer(userAnswer)

# CRITICAL: VocabularyItem.chunkIndex para seekToChunk
# O player-store ja tem seekToChunk(index) implementado

# CRITICAL: Tailwind v4 - classes utilitarias sao as mesmas
# Usar cn() de @/shared/lib/utils para merge de classes

# CRITICAL: shadcn/ui - Input e Badge precisam ser adicionados
# Usar: npx shadcn@latest add input badge progress
```

---

## Implementation Blueprint

### Data Models and Structure

```typescript
// ========================================
// LESSON STORE (Zustand)
// ========================================

interface LessonStoreState {
  // State
  lesson: Lesson | null
  currentExerciseIndex: number
  answers: Map<string, string>  // exerciseId -> userAnswer
  score: number
  isComplete: boolean

  // Setters
  setLesson: (lesson: Lesson) => void
  reset: () => void

  // Actions
  submitAnswer: (exerciseId: string, answer: string) => void
  nextExercise: () => void
  previousExercise: () => void

  // Derived (computed as functions)
  getCurrentExercise: () => Exercise | null
  getProgress: () => number
  isAnswerCorrect: (exerciseId: string) => boolean | null
}

// ========================================
// COMPONENT PROPS (minimal, usa store)
// ========================================

// LessonCard - sem props, usa store
// ExercisePanel - sem props, usa store
// VocabularyList - sem props, usa store + player-store
```

### Task List

```yaml
Task 1: Add shadcn/ui components (Input, Badge, Progress)
  COMMAND: npx shadcn@latest add input badge progress
  VERIFY: ls src/shared/components/ui/ deve mostrar input.tsx, badge.tsx, progress.tsx

Task 2: Create LessonStore with TDD
  CREATE: tests/unit/features/lesson/presentation/lesson-store.test.ts
  CREATE: src/features/lesson/presentation/stores/lesson-store.ts
  TDD: RED -> GREEN -> REFACTOR

Task 3: Create LessonCard with TDD
  CREATE: tests/unit/features/lesson/presentation/lesson-card.test.tsx
  CREATE: src/features/lesson/presentation/components/lesson-card.tsx
  TDD: RED -> GREEN -> REFACTOR

Task 4: Create ExercisePanel with TDD
  CREATE: tests/unit/features/lesson/presentation/exercise-panel.test.tsx
  CREATE: src/features/lesson/presentation/components/exercise-panel.tsx
  TDD: RED -> GREEN -> REFACTOR

Task 5: Create VocabularyList with TDD
  CREATE: tests/unit/features/lesson/presentation/vocabulary-list.test.tsx
  CREATE: src/features/lesson/presentation/components/vocabulary-list.tsx
  TDD: RED -> GREEN -> REFACTOR

Task 6: Create barrel exports
  CREATE: src/features/lesson/presentation/components/index.ts
  CREATE: src/features/lesson/presentation/index.ts

Task 7: Create E2E test page
  CREATE: src/app/test/lesson/page.tsx (test page for E2E)

Task 8: Create E2E tests
  CREATE: tests/e2e/lesson/lesson-interaction.spec.ts
  RUN: pnpm test:e2e tests/e2e/lesson/
```

### Per-Task Pseudocode

#### Task 1: Add shadcn/ui Components

```bash
# Execute in project root
npx shadcn@latest add input badge progress

# Verify installation
ls src/shared/components/ui/
# Expected: button.tsx card.tsx input.tsx badge.tsx progress.tsx
```

#### Task 2: LessonStore

```typescript
// TEST FIRST: tests/unit/features/lesson/presentation/lesson-store.test.ts

describe('LessonStore', () => {
  describe('setLesson', () => {
    it('should set lesson and reset state')
  })

  describe('submitAnswer', () => {
    it('should record answer in map')
    it('should increment score if correct')
    it('should not increment score if incorrect')
  })

  describe('nextExercise', () => {
    it('should increment currentExerciseIndex')
    it('should set isComplete on last exercise')
  })

  describe('previousExercise', () => {
    it('should decrement currentExerciseIndex')
    it('should not go below 0')
  })

  describe('getCurrentExercise', () => {
    it('should return exercise at current index')
    it('should return null if no lesson')
  })

  describe('getProgress', () => {
    it('should return percentage of completion')
  })

  describe('isAnswerCorrect', () => {
    it('should return true if answer matches')
    it('should return false if answer wrong')
    it('should return null if not answered')
  })
})
```

```typescript
// IMPLEMENTATION: src/features/lesson/presentation/stores/lesson-store.ts
'use client'

import { create } from 'zustand'
import type { Lesson } from '../../domain/entities/lesson'
import type { Exercise } from '../../domain/entities/exercise'

interface LessonStoreState {
  // State
  lesson: Lesson | null
  currentExerciseIndex: number
  answers: Map<string, string>
  score: number
  isComplete: boolean

  // Actions
  setLesson: (lesson: Lesson) => void
  submitAnswer: (exerciseId: string, answer: string) => void
  nextExercise: () => void
  previousExercise: () => void
  reset: () => void

  // Computed (as functions to avoid Zustand subscription issues)
  getCurrentExercise: () => Exercise | null
  getProgress: () => number
  isAnswerCorrect: (exerciseId: string) => boolean | null
}

const initialState = {
  lesson: null,
  currentExerciseIndex: 0,
  answers: new Map<string, string>(),
  score: 0,
  isComplete: false,
}

export const useLessonStore = create<LessonStoreState>((set, get) => ({
  ...initialState,

  setLesson: (lesson) => set({
    lesson,
    currentExerciseIndex: 0,
    answers: new Map(),
    score: 0,
    isComplete: false,
  }),

  submitAnswer: (exerciseId, answer) => {
    const { lesson, answers, score } = get()
    const exercise = lesson?.exercises.find(e => e.id === exerciseId)
    if (!exercise) return

    const newAnswers = new Map(answers)
    newAnswers.set(exerciseId, answer)

    const isCorrect = exercise.checkAnswer(answer)
    set({
      answers: newAnswers,
      score: isCorrect ? score + 1 : score,
    })
  },

  nextExercise: () => {
    const { currentExerciseIndex, lesson } = get()
    const maxIndex = (lesson?.exercises.length ?? 1) - 1

    if (currentExerciseIndex < maxIndex) {
      set({ currentExerciseIndex: currentExerciseIndex + 1 })
    } else {
      set({ isComplete: true })
    }
  },

  previousExercise: () => {
    const { currentExerciseIndex } = get()
    if (currentExerciseIndex > 0) {
      set({ currentExerciseIndex: currentExerciseIndex - 1 })
    }
  },

  reset: () => set(initialState),

  getCurrentExercise: () => {
    const { lesson, currentExerciseIndex } = get()
    return lesson?.exercises[currentExerciseIndex] ?? null
  },

  getProgress: () => {
    const { lesson, currentExerciseIndex } = get()
    if (!lesson || lesson.exercises.length === 0) return 0
    return ((currentExerciseIndex + 1) / lesson.exercises.length) * 100
  },

  isAnswerCorrect: (exerciseId) => {
    const { lesson, answers } = get()
    const exercise = lesson?.exercises.find(e => e.id === exerciseId)
    const answer = answers.get(exerciseId)

    if (!exercise || !answer) return null
    return exercise.checkAnswer(answer)
  },
}))
```

#### Task 3: LessonCard

```typescript
// TEST FIRST: tests/unit/features/lesson/presentation/lesson-card.test.tsx

/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LessonCard } from '@/features/lesson/presentation/components/lesson-card'
import { useLessonStore } from '@/features/lesson/presentation/stores/lesson-store'

vi.mock('@/features/lesson/presentation/stores/lesson-store')

describe('LessonCard', () => {
  it('shows loading when no lesson')
  it('displays lesson title')
  it('displays difficulty badge with correct color')
  it('displays exercise and vocabulary counts')
  it('displays progress bar')
  it('shows completion message when isComplete')
})
```

```tsx
// IMPLEMENTATION: src/features/lesson/presentation/components/lesson-card.tsx
'use client'

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/shared/components/ui/card'
import { Badge } from '@/shared/components/ui/badge'
import { Progress } from '@/shared/components/ui/progress'
import { useLessonStore } from '../stores/lesson-store'

const difficultyColors = {
  easy: 'bg-green-500 hover:bg-green-500',
  medium: 'bg-yellow-500 hover:bg-yellow-500',
  hard: 'bg-red-500 hover:bg-red-500',
} as const

export function LessonCard() {
  const lesson = useLessonStore((s) => s.lesson)
  const score = useLessonStore((s) => s.score)
  const isComplete = useLessonStore((s) => s.isComplete)
  const getProgress = useLessonStore((s) => s.getProgress)

  if (!lesson) {
    return (
      <div className="text-muted-foreground" data-testid="lesson-card-loading">
        Loading lesson...
      </div>
    )
  }

  const progress = getProgress()

  return (
    <Card data-testid="lesson-card">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle data-testid="lesson-title">{lesson.title}</CardTitle>
          <Badge
            className={difficultyColors[lesson.difficulty.value]}
            data-testid="lesson-difficulty"
          >
            {lesson.difficulty.value}
          </Badge>
        </div>
        <CardDescription data-testid="lesson-stats">
          {lesson.exerciseCount} exercises - {lesson.vocabularyCount} vocabulary words
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span data-testid="lesson-progress-text">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} data-testid="lesson-progress-bar" />
          {isComplete && (
            <div
              className="text-center p-4 bg-muted rounded-lg mt-4"
              data-testid="lesson-complete"
            >
              <p className="text-lg font-semibold">Lesson Complete!</p>
              <p data-testid="lesson-score">
                Score: {score}/{lesson.exerciseCount}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

#### Task 4: ExercisePanel

```typescript
// TEST FIRST: tests/unit/features/lesson/presentation/exercise-panel.test.tsx

describe('ExercisePanel', () => {
  it('shows empty state when no exercise')
  it('displays question')
  it('renders input for fill-blank type')
  it('renders options for multiple-choice type')
  it('calls submitAnswer on submit button click')
  it('calls submitAnswer on option click')
  it('shows correct feedback after answer')
  it('shows incorrect feedback after wrong answer')
  it('disables input/options after answering')
  it('enables next button after answering')
  it('calls nextExercise on next click')
  it('calls previousExercise on prev click')
  it('disables prev on first exercise')
  it('shows Finish on last exercise')
})
```

```tsx
// IMPLEMENTATION: src/features/lesson/presentation/components/exercise-panel.tsx
'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { useLessonStore } from '../stores/lesson-store'
import { cn } from '@/shared/lib/utils'

export function ExercisePanel() {
  const [userAnswer, setUserAnswer] = useState('')
  const lesson = useLessonStore((s) => s.lesson)
  const currentExerciseIndex = useLessonStore((s) => s.currentExerciseIndex)
  const getCurrentExercise = useLessonStore((s) => s.getCurrentExercise)
  const submitAnswer = useLessonStore((s) => s.submitAnswer)
  const nextExercise = useLessonStore((s) => s.nextExercise)
  const previousExercise = useLessonStore((s) => s.previousExercise)
  const isAnswerCorrect = useLessonStore((s) => s.isAnswerCorrect)
  const answers = useLessonStore((s) => s.answers)

  const exercise = getCurrentExercise()

  if (!exercise) {
    return (
      <div className="text-muted-foreground" data-testid="exercise-panel-empty">
        No exercise available
      </div>
    )
  }

  const answered = answers.has(exercise.id)
  const correct = isAnswerCorrect(exercise.id)
  const userSubmittedAnswer = answers.get(exercise.id)

  const handleSubmit = () => {
    if (!userAnswer.trim()) return
    submitAnswer(exercise.id, userAnswer)
    setUserAnswer('')
  }

  const handleOptionClick = (option: string) => {
    submitAnswer(exercise.id, option)
  }

  const handleNext = () => {
    nextExercise()
    setUserAnswer('')
  }

  const isLastExercise = currentExerciseIndex === (lesson?.exerciseCount ?? 1) - 1

  return (
    <Card data-testid="exercise-panel">
      <CardHeader>
        <CardTitle className="text-base" data-testid="exercise-header">
          Exercise {currentExerciseIndex + 1} of {lesson?.exerciseCount}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-lg" data-testid="exercise-question">
          {exercise.question}
        </p>

        {exercise.type.value === 'multiple-choice' && exercise.options ? (
          <div className="grid gap-2" data-testid="exercise-options">
            {exercise.options.map((option, i) => (
              <Button
                key={i}
                variant={
                  answered && option === exercise.answer ? 'default' : 'outline'
                }
                className={cn(
                  'justify-start',
                  answered && option === exercise.answer && 'bg-green-500 hover:bg-green-500',
                  answered && option !== exercise.answer && userSubmittedAnswer === option && 'bg-red-500 hover:bg-red-500'
                )}
                onClick={() => handleOptionClick(option)}
                disabled={answered}
                data-testid={`option-${i}`}
              >
                {option}
              </Button>
            ))}
          </div>
        ) : (
          <div className="flex gap-2" data-testid="exercise-input-area">
            <Input
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type your answer..."
              disabled={answered}
              data-testid="answer-input"
              onKeyDown={(e) => e.key === 'Enter' && !answered && handleSubmit()}
            />
            <Button
              onClick={handleSubmit}
              disabled={answered || !userAnswer.trim()}
              data-testid="submit-button"
            >
              Submit
            </Button>
          </div>
        )}

        {answered && (
          <div
            className={cn(
              'p-3 rounded-lg',
              correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            )}
            data-testid="exercise-feedback"
          >
            {correct ? 'Correct!' : `Incorrect. The answer is: ${exercise.answer}`}
            {exercise.explanation && (
              <p className="mt-2 text-sm opacity-80" data-testid="exercise-explanation">
                {exercise.explanation}
              </p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button
          variant="outline"
          onClick={previousExercise}
          disabled={currentExerciseIndex === 0}
          data-testid="prev-button"
        >
          Previous
        </Button>
        <Button
          onClick={handleNext}
          disabled={!answered}
          data-testid="next-button"
        >
          {isLastExercise ? 'Finish' : 'Next'}
        </Button>
      </CardFooter>
    </Card>
  )
}
```

#### Task 5: VocabularyList

```typescript
// TEST FIRST: tests/unit/features/lesson/presentation/vocabulary-list.test.tsx

describe('VocabularyList', () => {
  it('returns null when no lesson')
  it('returns null when vocabulary is empty')
  it('displays vocabulary count in header')
  it('displays word for each item')
  it('displays definition for each item')
  it('displays example for each item')
  it('displays partOfSpeech for each item')
  it('calls seekToChunk on item click')
})
```

```tsx
// IMPLEMENTATION: src/features/lesson/presentation/components/vocabulary-list.tsx
'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/shared/components/ui/card'
import { useLessonStore } from '../stores/lesson-store'
import { usePlayerStore } from '@/features/player/presentation/stores/player-store'

export function VocabularyList() {
  const lesson = useLessonStore((s) => s.lesson)
  const seekToChunk = usePlayerStore((s) => s.seekToChunk)

  if (!lesson || lesson.vocabularyCount === 0) {
    return null
  }

  return (
    <Card data-testid="vocabulary-list">
      <CardHeader>
        <CardTitle className="text-base" data-testid="vocabulary-header">
          Vocabulary ({lesson.vocabularyCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {lesson.vocabulary.map((item, index) => (
            <li
              key={item.id}
              className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-accent transition-colors"
              onClick={() => seekToChunk(item.chunkIndex)}
              data-testid={`vocab-${index}`}
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold" data-testid={`vocab-${index}-word`}>
                  {item.word}
                </span>
                <span
                  className="text-xs text-muted-foreground italic"
                  data-testid={`vocab-${index}-pos`}
                >
                  {item.partOfSpeech}
                </span>
              </div>
              <p
                className="text-sm text-muted-foreground mt-1"
                data-testid={`vocab-${index}-definition`}
              >
                {item.definition}
              </p>
              <p className="text-sm italic mt-1" data-testid={`vocab-${index}-example`}>
                "{item.example}"
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
```

#### Task 6: Barrel Exports

```typescript
// src/features/lesson/presentation/components/index.ts
export { LessonCard } from './lesson-card'
export { ExercisePanel } from './exercise-panel'
export { VocabularyList } from './vocabulary-list'

// src/features/lesson/presentation/index.ts
export { useLessonStore } from './stores/lesson-store'
export { LessonCard, ExercisePanel, VocabularyList } from './components'
```

#### Task 7: E2E Test Page

```tsx
// src/app/test/lesson/page.tsx
import { LessonCard, ExercisePanel, VocabularyList } from '@/features/lesson/presentation'

// Mock lesson data for testing
// This page is only for E2E tests - not production
export default function TestLessonPage() {
  return (
    <div className="container mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Lesson Test Page</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <LessonCard />
          <ExercisePanel />
        </div>
        <div>
          <VocabularyList />
        </div>
      </div>
    </div>
  )
}
```

#### Task 8: E2E Tests

```typescript
// tests/e2e/lesson/lesson-interaction.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Lesson Interaction', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/lesson')
    // Wait for lesson to load
    await expect(page.getByTestId('lesson-card')).toBeVisible({ timeout: 10000 })
  })

  test('displays lesson card with title and difficulty', async ({ page }) => {
    await expect(page.getByTestId('lesson-title')).toBeVisible()
    await expect(page.getByTestId('lesson-difficulty')).toBeVisible()
    await expect(page.getByTestId('lesson-stats')).toBeVisible()
  })

  test('displays exercise panel with question', async ({ page }) => {
    await expect(page.getByTestId('exercise-panel')).toBeVisible()
    await expect(page.getByTestId('exercise-question')).toBeVisible()
  })

  test('can submit fill-blank answer', async ({ page }) => {
    // Check if it's a fill-blank exercise
    const input = page.getByTestId('answer-input')
    if (await input.isVisible()) {
      await input.fill('test answer')
      await page.getByTestId('submit-button').click()
      await expect(page.getByTestId('exercise-feedback')).toBeVisible()
    }
  })

  test('can click multiple-choice option', async ({ page }) => {
    // Check if it's multiple-choice
    const option = page.getByTestId('option-0')
    if (await option.isVisible()) {
      await option.click()
      await expect(page.getByTestId('exercise-feedback')).toBeVisible()
    }
  })

  test('can navigate between exercises', async ({ page }) => {
    // Answer first exercise
    const input = page.getByTestId('answer-input')
    const option = page.getByTestId('option-0')

    if (await input.isVisible()) {
      await input.fill('test')
      await page.getByTestId('submit-button').click()
    } else if (await option.isVisible()) {
      await option.click()
    }

    // Next should be enabled
    const nextBtn = page.getByTestId('next-button')
    await expect(nextBtn).toBeEnabled()
    await nextBtn.click()

    // Header should update
    await expect(page.getByTestId('exercise-header')).toContainText('Exercise 2')
  })

  test('displays vocabulary list', async ({ page }) => {
    await expect(page.getByTestId('vocabulary-list')).toBeVisible()
    await expect(page.getByTestId('vocab-0')).toBeVisible()
    await expect(page.getByTestId('vocab-0-word')).toBeVisible()
    await expect(page.getByTestId('vocab-0-definition')).toBeVisible()
  })
})
```

### Integration Points

```yaml
ZUSTAND:
  - Store location: src/features/lesson/presentation/stores/lesson-store.ts
  - Pattern: Same as player-store.ts
  - Import: import { useLessonStore } from '@/features/lesson/presentation'

SHADCN/UI:
  - Add: npx shadcn@latest add input badge progress
  - Location: src/shared/components/ui/

PLAYER_INTEGRATION:
  - Import: usePlayerStore from @/features/player/presentation/stores/player-store
  - Action: seekToChunk(chunkIndex) - already implemented
  - VocabularyItem.chunkIndex -> seekToChunk(item.chunkIndex)

TEST_PAGE:
  - Route: /test/lesson
  - Purpose: E2E testing only
  - Needs: Mock lesson data initialization
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run first - fix any errors before proceeding
pnpm lint
pnpm format:check

# Expected: No errors
# If errors: pnpm lint:fix && pnpm format
```

### Level 2: Type Check

```bash
pnpm type-check

# Expected: No errors
# If errors: Read error, fix types, re-run
```

### Level 3: Unit Tests

```bash
# Run store tests first (no DOM)
pnpm test:unit tests/unit/features/lesson/presentation/lesson-store.test.ts

# Run component tests
pnpm test:unit tests/unit/features/lesson/presentation/

# Run with coverage
pnpm test:coverage

# Expected: All pass, coverage > 80% for presentation layer
```

### Level 4: E2E Tests

```bash
# Start dev server first
pnpm dev &

# Run E2E tests
pnpm test:e2e tests/e2e/lesson/

# Expected: All pass
```

### Level 5: Build

```bash
pnpm build

# Expected: Build successful
# If errors: Fix imports, check barrel exports
```

---

## Final Validation Checklist

- [ ] All shadcn/ui components added (input, badge, progress)
- [ ] LessonStore passes all unit tests
- [ ] LessonCard passes all unit tests
- [ ] ExercisePanel passes all unit tests
- [ ] VocabularyList passes all unit tests
- [ ] Barrel exports created and working
- [ ] E2E tests pass
- [ ] No lint errors: `pnpm lint`
- [ ] No type errors: `pnpm type-check`
- [ ] Build succeeds: `pnpm build`
- [ ] Manual test: Components render correctly in /test/lesson

---

## Anti-Patterns to Avoid

- Do not use `useEffect` for derived state - use computed functions in store
- Do not mutate Lesson/Exercise/VocabularyItem entities - they are immutable
- Do not create new patterns - follow ChunkNavigator example
- Do not skip TDD - write test first for each component
- Do not use useState for shared state - use Zustand store
- Do not mix server/client - all presentation components are 'use client'
- Do not hardcode colors - use Tailwind classes and cn()
- Do not forget data-testid - required for E2E tests
- Do not import domain entities directly in components - access via store
- Do not use destructuring for store - use selectors: `useLessonStore(s => s.lesson)`
