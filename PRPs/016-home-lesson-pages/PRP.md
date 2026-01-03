# PRP: T-016 - Pages - Home + Lesson Page + Routing

> **IMPORTANTE: USAR SKILL FRONTEND DESIGN DO CLAUDE CODE**

---

## Input Summary

**Modo:** AUTO
**Tarefa:** T-016 - Pages - Home + Lesson Page + Routing
**Origem:** context/TASKS/T-016.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/PRD/visao.md
- context/PRD/features/player.md
- context/PRD/features/lesson.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/visao-geral.md
- context/ARQUITETURA/stack.md

**Objetivo:** Aplicacao funcional end-to-end: usuario cola URL, gera lesson, interage com exercicios.

**Escopo:**
- Pagina Home (input de URL YouTube)
- Pagina Lesson (player + chunks + exercises + vocabulary)
- Layout responsivo
- Loading e error states
- Server Actions para geracao de lesson
- Testes E2E completos

**Criterios de Aceite:**
- [ ] Home page com input de URL e selector de dificuldade
- [ ] Validacao de URL YouTube no cliente
- [ ] Navegacao para /lesson/[videoId]
- [ ] Lesson page carrega video player
- [ ] Lesson page mostra exercicios interativos
- [ ] Lesson page mostra vocabulario
- [ ] ChunkNavigator integrado com player
- [ ] Server action gera lesson via use case
- [ ] Loading e error states implementados
- [ ] Layout responsivo (mobile + desktop)
- [ ] Testes E2E passam

---

## Goal

Implementar as paginas principais da aplicacao YouFluent:
1. **Home Page** - Formulario de entrada de URL YouTube com selector de dificuldade
2. **Lesson Page** - Pagina dinamica `/lesson/[videoId]` integrando todos os componentes
3. **Server Actions** - Geracao de lesson usando os use cases existentes
4. **Testes E2E** - Cobertura completa do fluxo principal com Playwright

Esta tarefa e a **integracao final do MVP** - conectando todos os dominios (transcript, player, lesson) em uma experiencia de usuario completa.

---

## Why

- **Valor de Negocio:** Completa o MVP funcional do YouFluent
- **Experiencia do Usuario:** Usuario pode colar qualquer URL do YouTube e receber uma licao interativa
- **Integracao:** Conecta todos os dominios implementados em um fluxo end-to-end
- **Validacao:** Testes E2E garantem que a aplicacao funciona como esperado

---

## What

### Comportamento Esperado

1. **Home Page (`/`)**
   - Usuario acessa a pagina inicial
   - Visualiza titulo, descricao e formulario
   - Cola URL do YouTube no input
   - Seleciona dificuldade (Easy/Medium/Hard)
   - Clica em "Start Learning"
   - Validacao client-side da URL
   - Redireciona para `/lesson/[videoId]?difficulty=X`

2. **Lesson Page (`/lesson/[videoId]`)**
   - Server Action busca/gera lesson
   - Exibe loading skeleton durante geracao
   - Mostra error page se falhar
   - Renderiza layout responsivo:
     - Desktop: 2 colunas (Player+Exercises | Chunks+Vocabulary)
     - Mobile: Stack vertical
   - VideoPlayer toca video do YouTube
   - ChunkNavigator sincronizado com player
   - ExercisePanel para interacao
   - VocabularyList com palavras-chave
   - LessonCard com progresso

### Requisitos Tecnicos

| Requisito | Implementacao |
|-----------|---------------|
| Server Components | Lesson page busca dados no servidor |
| Client Components | Form, VideoPlayer, stores Zustand |
| Server Actions | `generateLesson()` com use cases |
| Layout | Tailwind CSS responsive grid |
| Loading | Suspense boundaries + skeleton |
| Error | error.tsx com retry |
| Roteamento | Next.js App Router dynamic routes |

### Success Criteria

- [ ] Pagina Home renderiza corretamente
- [ ] Validacao de URL funciona (aceita youtube.com, youtu.be)
- [ ] Navegacao para lesson page funciona
- [ ] Lesson page carrega video no player
- [ ] Exercicios sao interativos e mostram feedback
- [ ] Vocabulario e exibido
- [ ] Layout responsivo em diferentes breakpoints
- [ ] Loading states exibidos durante geracao
- [ ] Erros tratados graciosamente
- [ ] Testes E2E cobrem fluxo principal

---

## All Needed Context

### Documentation & References

```yaml
- file: src/features/lesson/application/use-cases/generate-lesson.ts
  why: Use case principal que orquestra geracao de lesson

- file: src/features/transcript/application/use-cases/fetch-transcript.ts
  why: Use case que busca transcricao (chamado pelo GenerateLessonUseCase)

- file: src/features/transcript/domain/value-objects/video-id.ts
  why: VideoId.fromUrl() para validar e extrair ID do YouTube

- file: src/features/lesson/domain/value-objects/difficulty.ts
  why: Difficulty.fromString() para converter selector value

- file: src/features/player/presentation/components/video-player.tsx
  why: Componente do player YouTube ja implementado

- file: src/features/player/presentation/components/chunk-navigator.tsx
  why: Navegador de chunks ja implementado

- file: src/features/lesson/presentation/components/lesson-card.tsx
  why: Card de lesson ja implementado

- file: src/features/lesson/presentation/components/exercise-panel.tsx
  why: Painel de exercicios ja implementado

- file: src/features/lesson/presentation/components/vocabulary-list.tsx
  why: Lista de vocabulario ja implementada

- file: src/features/lesson/presentation/stores/lesson-store.ts
  why: Zustand store para estado da lesson

- file: src/features/player/presentation/stores/player-store.ts
  why: Zustand store para estado do player

- file: src/shared/core/result.ts
  why: Result pattern para error handling

- doc: Next.js 16 Server Actions
  url: https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions
  critical: Use 'use server' directive, return serializable data

- doc: Next.js 16 Dynamic Routes
  url: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
  critical: [videoId] folder structure, params in page props
```

### Current Codebase Tree

```
src/
├── app/
│   ├── layout.tsx            # Root layout (basico)
│   ├── page.tsx              # Home placeholder
│   ├── globals.css           # Tailwind imports
│   └── test/                 # Paginas de teste
│       ├── lesson/page.tsx
│       └── player/...
│
├── features/
│   ├── lesson/
│   │   ├── domain/
│   │   │   ├── entities/{lesson,exercise,vocabulary-item}.ts
│   │   │   ├── value-objects/{difficulty,exercise-type}.ts
│   │   │   ├── interfaces/{lesson-repository,lesson-generator}.ts
│   │   │   └── errors/lesson-errors.ts
│   │   ├── application/use-cases/generate-lesson.ts
│   │   ├── infrastructure/{repositories,services}/
│   │   └── presentation/
│   │       ├── components/{lesson-card,exercise-panel,vocabulary-list}.tsx
│   │       └── stores/lesson-store.ts
│   │
│   ├── player/
│   │   ├── domain/{entities,value-objects,interfaces,errors}/
│   │   ├── infrastructure/adapters/youtube-player-adapter.ts
│   │   └── presentation/
│   │       ├── components/{video-player,chunk-navigator}.tsx
│   │       ├── hooks/use-player.ts
│   │       └── stores/player-store.ts
│   │
│   └── transcript/
│       ├── domain/{entities,value-objects,interfaces,errors}/
│       ├── application/use-cases/{fetch-transcript,chunk-transcript}.ts
│       └── infrastructure/{repositories,services}/
│
└── shared/
    ├── components/ui/{button,card,input,badge,progress}.tsx
    ├── lib/{utils,prisma}.ts
    └── core/result.ts
```

### Desired Codebase Tree

```
src/
├── app/
│   ├── layout.tsx                    # MODIFICAR: Adicionar fonts, metadata
│   ├── page.tsx                      # MODIFICAR: Home page completa
│   ├── loading.tsx                   # CRIAR: Root loading state
│   ├── error.tsx                     # CRIAR: Root error boundary
│   ├── globals.css                   # MANTER
│   └── lesson/
│       └── [videoId]/
│           ├── page.tsx              # CRIAR: Lesson page (Server Component)
│           ├── loading.tsx           # CRIAR: Lesson loading skeleton
│           ├── error.tsx             # CRIAR: Lesson error boundary
│           ├── actions.ts            # CRIAR: Server Actions
│           └── lesson-provider.tsx   # CRIAR: Hydrate Zustand stores
│
├── shared/
│   └── components/
│       ├── ui/
│       │   └── select.tsx            # CRIAR: shadcn Select component
│       └── url-input-form.tsx        # CRIAR: Form de URL + difficulty
│
└── tests/
    └── e2e/
        ├── home.spec.ts              # CRIAR: Testes da home page
        └── lesson-flow.spec.ts       # CRIAR: Testes do fluxo completo
```

### Known Gotchas & Library Quirks

```
# CRITICAL: Next.js 16 - Server Components sao default
# Adicionar 'use client' apenas em componentes que usam:
# - useState, useEffect, useContext
# - event handlers
# - Zustand stores
# - Browser APIs

# CRITICAL: Server Actions retornam dados serializaveis
# Entidades de dominio devem ser convertidas para POJOs
# Usar JSON.parse(JSON.stringify(entity)) ou mappers

# CRITICAL: Prisma Client nao pode ser importado em Client Components
# Usar Server Actions ou API Routes para acesso ao banco

# CRITICAL: Zustand stores precisam de hydration em SSR
# Usar provider para setar estado inicial no cliente

# CRITICAL: VideoId e Difficulty sao Value Objects (classes)
# Converter para strings antes de passar para client components

# GOTCHA: YouTube IFrame API requer window (client-side only)
# VideoPlayer ja esta como 'use client'

# GOTCHA: params em Next.js 16 sao Promise (async)
# Usar await ou React.use() para acessar

# GOTCHA: searchParams tambem sao Promise em Next.js 16
# Acessar difficulty como await searchParams

# PATTERN: shadcn Select precisa ser instalado
# pnpm dlx shadcn@latest add select
```

---

## Implementation Blueprint

### Data Models and Structures

```typescript
// DTO para Server Action (serializable)
interface LessonActionResult {
  success: boolean
  error?: {
    type: string
    message: string
  }
  data?: {
    lesson: SerializedLesson
    transcript: SerializedTranscript | null
  }
}

// Lesson serializada para client
interface SerializedLesson {
  id: string
  videoId: string
  title: string
  difficulty: 'easy' | 'medium' | 'hard'
  exercises: SerializedExercise[]
  vocabulary: SerializedVocabulary[]
}

// Exercise serializado
interface SerializedExercise {
  id: string
  type: 'multiple_choice' | 'fill_blank' | 'order_words'
  question: string
  options?: string[]
  answer: string
  explanation: string
  chunkIndex: number
}

// Vocabulary serializado
interface SerializedVocabulary {
  id: string
  word: string
  definition: string
  example: string
  partOfSpeech: string
  chunkIndex: number
}

// Transcript serializada
interface SerializedTranscript {
  id: string
  videoId: string
  title: string
  language: string
  chunks: SerializedChunk[]
}

// Chunk serializado
interface SerializedChunk {
  id: string
  index: number
  startTime: number
  endTime: number
  text: string
}
```

### List of Tasks

```yaml
Task 1: Instalar shadcn Select component
  - Rodar: pnpm dlx shadcn@latest add select
  - Verificar: src/shared/components/ui/select.tsx existe
  - Commit: nao (parte da tarefa)

Task 2: Criar UrlInputForm component (CORE)
  - CRIAR: src/shared/components/url-input-form.tsx
  - DEPS: Input, Button, Select (shadcn)
  - PATTERN: 'use client', form controlled
  - VALIDAR: VideoId.fromUrl() no submit
  - NAVEGAR: router.push(`/lesson/${videoId}?difficulty=${difficulty}`)

Task 3: Atualizar Root Layout
  - MODIFICAR: src/app/layout.tsx
  - ADICIONAR: Inter font do next/font/google
  - ADICIONAR: metadata title e description
  - ADICIONAR: container max-width no body

Task 4: Implementar Home Page
  - MODIFICAR: src/app/page.tsx
  - LAYOUT: Hero section + features grid
  - COMPONENTE: UrlInputForm
  - ESTILO: Tailwind responsive

Task 5: Criar Server Actions para Lesson
  - CRIAR: src/app/lesson/[videoId]/actions.ts
  - USAR: 'use server' directive
  - INSTANCIAR: Use cases com repositories
  - SERIALIZAR: Converter entities para POJOs
  - RETORNAR: LessonActionResult

Task 6: Criar LessonProvider (hydration)
  - CRIAR: src/app/lesson/[videoId]/lesson-provider.tsx
  - USAR: 'use client'
  - HIDRATAR: useLessonStore.setLesson()
  - HIDRATAR: usePlayerStore.setChunks()
  - ACEITAR: serialized data, reconstruct entities

Task 7: Criar Lesson Page
  - CRIAR: src/app/lesson/[videoId]/page.tsx
  - SERVER COMPONENT: async function
  - CHAMAR: generateLesson server action
  - TRATAR: success/failure results
  - RENDERIZAR: LessonProvider + layout grid

Task 8: Criar Loading States
  - CRIAR: src/app/loading.tsx (root)
  - CRIAR: src/app/lesson/[videoId]/loading.tsx
  - USAR: Skeleton patterns com Tailwind
  - SIMULAR: Layout da pagina final

Task 9: Criar Error Boundaries
  - CRIAR: src/app/error.tsx (root)
  - CRIAR: src/app/lesson/[videoId]/error.tsx
  - USAR: 'use client' (obrigatorio)
  - IMPLEMENTAR: Reset + retry button

Task 10: Criar Testes E2E
  - CRIAR: tests/e2e/home.spec.ts
  - CRIAR: tests/e2e/lesson-flow.spec.ts
  - TESTAR: Fluxo completo (URL -> Lesson -> Exercises)
  - TESTAR: Error cases (URL invalida)
  - USAR: data-testid para selectors
```

### Task 1: Instalar shadcn Select

```bash
pnpm dlx shadcn@latest add select
```

### Task 2: UrlInputForm Component

```typescript
// src/shared/components/url-input-form.tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'

/**
 * UrlInputForm Component
 *
 * Form for entering YouTube URL and selecting difficulty.
 * Validates URL on submit and navigates to lesson page.
 *
 * PATTERN: Controlled form with client-side validation
 */
export function UrlInputForm() {
  // Form state
  const [url, setUrl] = useState('')
  const [difficulty, setDifficulty] = useState<string>('medium')
  const [error, setError] = useState<string>('')

  // Navigation
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  /**
   * Handle form submission
   *
   * PRE: url is string, difficulty is 'easy'|'medium'|'hard'
   * POST: Navigates to /lesson/[videoId] or shows error
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate URL using VideoId value object
    const videoIdResult = VideoId.fromUrl(url)

    if (videoIdResult.isFailure) {
      setError('Please enter a valid YouTube URL')
      return
    }

    // Navigate to lesson page
    startTransition(() => {
      router.push(`/lesson/${videoIdResult.value.value}?difficulty=${difficulty}`)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Input
          type="url"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
          aria-label="YouTube URL"
          data-testid="url-input"
        />
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full sm:w-32" data-testid="difficulty-select">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <p
          className="text-sm text-destructive"
          role="alert"
          data-testid="error-message"
        >
          {error}
        </p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isPending || !url.trim()}
        data-testid="submit-button"
      >
        {isPending ? 'Loading...' : 'Start Learning'}
      </Button>
    </form>
  )
}
```

### Task 3: Root Layout

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'YouFluent - Learn English with YouTube',
  description: 'Transform any YouTube video into an interactive English lesson with AI-powered exercises and vocabulary.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <main className="min-h-screen bg-background">
          {children}
        </main>
      </body>
    </html>
  )
}
```

### Task 4: Home Page

```typescript
// src/app/page.tsx
import { UrlInputForm } from '@/shared/components/url-input-form'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        {/* Hero Section */}
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Learn English with YouTube
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Paste any YouTube video URL and get an interactive English lesson
          with exercises and vocabulary.
        </p>

        {/* URL Input Form */}
        <UrlInputForm />

        {/* Features Grid */}
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">Any Video</h3>
            <p className="text-sm text-muted-foreground">
              Works with any YouTube video that has subtitles
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-muted-foreground">
              Exercises and vocabulary generated by AI
            </p>
          </div>
          <div className="p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">3 Difficulty Levels</h3>
            <p className="text-sm text-muted-foreground">
              Easy, Medium, and Hard to match your level
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Task 5: Server Actions

```typescript
// src/app/lesson/[videoId]/actions.ts
'use server'

import { Result } from '@/shared/core/result'
import { prisma } from '@/shared/lib/prisma'
import { Difficulty } from '@/features/lesson/domain/value-objects/difficulty'
import { GenerateLessonUseCase } from '@/features/lesson/application/use-cases/generate-lesson'
import { FetchTranscriptUseCase } from '@/features/transcript/application/use-cases/fetch-transcript'
import { ChunkTranscriptUseCase } from '@/features/transcript/application/use-cases/chunk-transcript'
import { PrismaLessonRepository } from '@/features/lesson/infrastructure/repositories/prisma-lesson-repository'
import { PrismaTranscriptRepository } from '@/features/transcript/infrastructure/repositories/prisma-transcript-repository'
import { YouTubeTranscriptService } from '@/features/transcript/infrastructure/services/youtube-transcript-service'
import { OpenAILessonGenerator } from '@/features/lesson/infrastructure/services/openai-lesson-generator'

/**
 * DTO for lesson action result (serializable)
 */
export interface LessonActionResult {
  success: boolean
  error?: {
    type: string
    message: string
  }
  data?: {
    lesson: {
      id: string
      videoId: string
      title: string
      difficulty: 'easy' | 'medium' | 'hard'
      exercises: Array<{
        id: string
        type: 'multiple_choice' | 'fill_blank' | 'order_words'
        question: string
        options?: string[]
        answer: string
        explanation: string
        chunkIndex: number
      }>
      vocabulary: Array<{
        id: string
        word: string
        definition: string
        example: string
        partOfSpeech: string
        chunkIndex: number
      }>
    }
    transcript: {
      id: string
      videoId: string
      title: string
      language: string
      chunks: Array<{
        id: string
        index: number
        startTime: number
        endTime: number
        text: string
      }>
    } | null
  }
}

/**
 * Generate Lesson Server Action
 *
 * Orchestrates lesson generation using domain use cases.
 * Serializes entities for client consumption.
 *
 * PRE: videoId is 11-char string, difficultyStr is easy|medium|hard
 * POST: Returns LessonActionResult
 */
export async function generateLesson(
  videoId: string,
  difficultyStr: string
): Promise<LessonActionResult> {
  try {
    // Parse difficulty
    const difficultyResult = Difficulty.fromString(difficultyStr)
    if (difficultyResult.isFailure) {
      return {
        success: false,
        error: { type: 'INVALID_DIFFICULTY', message: 'Invalid difficulty level' }
      }
    }

    // Build dependencies (Composition Root)
    const transcriptRepo = new PrismaTranscriptRepository(prisma)
    const transcriptFetcher = new YouTubeTranscriptService()
    const chunker = new ChunkTranscriptUseCase()

    const fetchTranscript = new FetchTranscriptUseCase(
      transcriptRepo,
      transcriptFetcher,
      chunker
    )

    const lessonRepo = new PrismaLessonRepository(prisma)
    const lessonGenerator = new OpenAILessonGenerator()

    const generateLessonUseCase = new GenerateLessonUseCase(
      lessonRepo,
      fetchTranscript,
      lessonGenerator
    )

    // Execute use case
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`
    const lessonResult = await generateLessonUseCase.execute({
      videoUrl,
      difficulty: difficultyResult.value
    })

    if (lessonResult.isFailure) {
      return {
        success: false,
        error: {
          type: lessonResult.error.constructor.name,
          message: lessonResult.error.message || 'Failed to generate lesson'
        }
      }
    }

    const lesson = lessonResult.value

    // Also fetch transcript for chunks (may be cached)
    const transcriptResult = await fetchTranscript.execute(videoUrl)

    // Serialize lesson for client
    const serializedLesson = {
      id: lesson.id,
      videoId: lesson.videoId.value,
      title: lesson.title,
      difficulty: lesson.difficulty.value,
      exercises: lesson.exercises.map(e => ({
        id: e.id,
        type: e.type.value,
        question: e.question,
        options: e.options,
        answer: e.answer,
        explanation: e.explanation,
        chunkIndex: e.chunkIndex,
      })),
      vocabulary: lesson.vocabulary.map(v => ({
        id: v.id,
        word: v.word,
        definition: v.definition,
        example: v.example,
        partOfSpeech: v.partOfSpeech,
        chunkIndex: v.chunkIndex,
      })),
    }

    // Serialize transcript if available
    let serializedTranscript = null
    if (transcriptResult.isSuccess) {
      const transcript = transcriptResult.value
      serializedTranscript = {
        id: transcript.id,
        videoId: transcript.videoId.value,
        title: transcript.title,
        language: transcript.language,
        chunks: transcript.chunks.map(c => ({
          id: c.id,
          index: c.index,
          startTime: c.startTime,
          endTime: c.endTime,
          text: c.text,
        })),
      }
    }

    return {
      success: true,
      data: {
        lesson: serializedLesson,
        transcript: serializedTranscript,
      }
    }

  } catch (error) {
    console.error('generateLesson error:', error)
    return {
      success: false,
      error: {
        type: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      }
    }
  }
}
```

### Task 6: LessonProvider

```typescript
// src/app/lesson/[videoId]/lesson-provider.tsx
'use client'

import { useEffect } from 'react'
import { useLessonStore } from '@/features/lesson/presentation/stores/lesson-store'
import { usePlayerStore } from '@/features/player/presentation/stores/player-store'
import { Lesson } from '@/features/lesson/domain/entities/lesson'
import { Exercise } from '@/features/lesson/domain/entities/exercise'
import { VocabularyItem } from '@/features/lesson/domain/entities/vocabulary-item'
import { Difficulty } from '@/features/lesson/domain/value-objects/difficulty'
import { ExerciseType } from '@/features/lesson/domain/value-objects/exercise-type'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'
import { Chunk } from '@/features/transcript/domain/entities/chunk'
import type { LessonActionResult } from './actions'

interface LessonProviderProps {
  data: NonNullable<LessonActionResult['data']>
  children: React.ReactNode
}

/**
 * LessonProvider Component
 *
 * Hydrates Zustand stores with server data.
 * Reconstructs domain entities from serialized data.
 *
 * PATTERN: Client component that wraps lesson page content
 */
export function LessonProvider({ data, children }: LessonProviderProps) {
  const setLesson = useLessonStore((s) => s.setLesson)
  const setChunks = usePlayerStore((s) => s.setChunks)

  useEffect(() => {
    // Reconstruct Lesson entity from serialized data
    const lessonData = data.lesson

    // Reconstruct exercises
    const exercises = lessonData.exercises.map(e => {
      const typeResult = ExerciseType.fromString(e.type)
      const exerciseResult = Exercise.create({
        id: e.id,
        type: typeResult.isSuccess ? typeResult.value : ExerciseType.multipleChoice(),
        question: e.question,
        answer: e.answer,
        options: e.options,
        explanation: e.explanation,
        chunkIndex: e.chunkIndex,
      })
      return exerciseResult.isSuccess ? exerciseResult.value : null
    }).filter((e): e is Exercise => e !== null)

    // Reconstruct vocabulary
    const vocabulary = lessonData.vocabulary.map(v => {
      const vocabResult = VocabularyItem.create({
        id: v.id,
        word: v.word,
        definition: v.definition,
        example: v.example,
        partOfSpeech: v.partOfSpeech,
        chunkIndex: v.chunkIndex,
      })
      return vocabResult.isSuccess ? vocabResult.value : null
    }).filter((v): v is VocabularyItem => v !== null)

    // Reconstruct lesson
    const videoIdResult = VideoId.fromId(lessonData.videoId)
    const difficultyResult = Difficulty.fromString(lessonData.difficulty)

    if (videoIdResult.isSuccess && difficultyResult.isSuccess) {
      const lessonResult = Lesson.create({
        id: lessonData.id,
        videoId: videoIdResult.value,
        title: lessonData.title,
        difficulty: difficultyResult.value,
        exercises,
        vocabulary,
      })

      if (lessonResult.isSuccess) {
        setLesson(lessonResult.value)
      }
    }

    // Reconstruct chunks for player
    if (data.transcript) {
      const chunks = data.transcript.chunks.map(c => {
        const chunkResult = Chunk.create({
          id: c.id,
          index: c.index,
          startTime: c.startTime,
          endTime: c.endTime,
          text: c.text,
        })
        return chunkResult.isSuccess ? chunkResult.value : null
      }).filter((c): c is Chunk => c !== null)

      setChunks(chunks)
    }
  }, [data, setLesson, setChunks])

  return <>{children}</>
}
```

### Task 7: Lesson Page

```typescript
// src/app/lesson/[videoId]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { VideoPlayer } from '@/features/player/presentation/components/video-player'
import { ChunkNavigator } from '@/features/player/presentation/components/chunk-navigator'
import { LessonCard } from '@/features/lesson/presentation/components/lesson-card'
import { ExercisePanel } from '@/features/lesson/presentation/components/exercise-panel'
import { VocabularyList } from '@/features/lesson/presentation/components/vocabulary-list'
import { generateLesson } from './actions'
import { LessonProvider } from './lesson-provider'

interface LessonPageProps {
  params: Promise<{ videoId: string }>
  searchParams: Promise<{ difficulty?: string }>
}

/**
 * Lesson Page
 *
 * Server Component that fetches/generates lesson data.
 * Renders integrated layout with all lesson components.
 *
 * Route: /lesson/[videoId]?difficulty=easy|medium|hard
 */
export default async function LessonPage({
  params,
  searchParams,
}: LessonPageProps) {
  const { videoId } = await params
  const { difficulty = 'medium' } = await searchParams

  // Validate videoId format (11 chars)
  if (!videoId || videoId.length !== 11) {
    notFound()
  }

  // Generate or fetch lesson via server action
  const result = await generateLesson(videoId, difficulty)

  if (!result.success || !result.data) {
    // Let error.tsx handle this
    throw new Error(result.error?.message || 'Failed to load lesson')
  }

  const { lesson, transcript } = result.data

  return (
    <LessonProvider data={result.data}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content - Player + Exercises (2 columns on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="rounded-lg overflow-hidden border bg-card">
              <VideoPlayer videoId={videoId} />
            </div>

            {/* Lesson Summary */}
            <LessonCard />

            {/* Exercise Panel */}
            <ExercisePanel />
          </div>

          {/* Sidebar - Chunks + Vocabulary (1 column on desktop) */}
          <div className="space-y-6">
            {/* Chunk Navigator */}
            <ChunkNavigator />

            {/* Vocabulary List */}
            <VocabularyList />
          </div>
        </div>
      </div>
    </LessonProvider>
  )
}

/**
 * Generate metadata for SEO
 */
export async function generateMetadata({ params }: LessonPageProps) {
  const { videoId } = await params

  return {
    title: `Lesson - ${videoId} | YouFluent`,
    description: 'Interactive English lesson with exercises and vocabulary',
  }
}
```

### Task 8: Loading States

```typescript
// src/app/loading.tsx
export default function RootLoading() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="h-10 bg-muted rounded w-3/4 mx-auto mb-4" />
        <div className="h-6 bg-muted rounded w-1/2 mx-auto mb-8" />
        <div className="h-12 bg-muted rounded mb-4" />
        <div className="h-12 bg-muted rounded" />
      </div>
    </div>
  )
}
```

```typescript
// src/app/lesson/[videoId]/loading.tsx
export default function LessonLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Video player skeleton */}
          <div className="aspect-video bg-muted animate-pulse rounded-lg" />

          {/* Lesson card skeleton */}
          <div className="p-6 border rounded-lg">
            <div className="h-6 bg-muted rounded w-1/2 mb-4" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>

          {/* Exercise panel skeleton */}
          <div className="p-6 border rounded-lg">
            <div className="h-6 bg-muted rounded w-1/3 mb-4" />
            <div className="space-y-3">
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        </div>

        {/* Sidebar skeleton */}
        <div className="space-y-6">
          {/* Chunks skeleton */}
          <div className="p-4 border rounded-lg">
            <div className="h-5 bg-muted rounded w-1/2 mb-4" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded" />
              ))}
            </div>
          </div>

          {/* Vocabulary skeleton */}
          <div className="p-4 border rounded-lg">
            <div className="h-5 bg-muted rounded w-1/2 mb-4" />
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Task 9: Error Boundaries

```typescript
// src/app/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/shared/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Root error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || 'An unexpected error occurred.'}
        </p>
        <Button onClick={reset}>Try again</Button>
      </div>
    </div>
  )
}
```

```typescript
// src/app/lesson/[videoId]/error.tsx
'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/shared/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function LessonError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Lesson error:', error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Failed to load lesson</h2>
        <p className="text-muted-foreground mb-6">
          {error.message || 'Could not generate the lesson. Please try again.'}
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### Task 10: E2E Tests

```typescript
// tests/e2e/home.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should render home page with form', async ({ page }) => {
    await page.goto('/')

    // Check title
    await expect(page.locator('h1')).toContainText('Learn English with YouTube')

    // Check form elements
    await expect(page.locator('[data-testid="url-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="difficulty-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="submit-button"]')).toBeVisible()
  })

  test('should have difficulty selector with options', async ({ page }) => {
    await page.goto('/')

    // Open select
    await page.click('[data-testid="difficulty-select"]')

    // Check options
    await expect(page.locator('text=Easy')).toBeVisible()
    await expect(page.locator('text=Medium')).toBeVisible()
    await expect(page.locator('text=Hard')).toBeVisible()
  })

  test('should show error for invalid URL', async ({ page }) => {
    await page.goto('/')

    // Enter invalid URL
    await page.fill('[data-testid="url-input"]', 'not-a-youtube-url')
    await page.click('[data-testid="submit-button"]')

    // Check error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('valid YouTube URL')
  })

  test('should accept valid YouTube URLs', async ({ page }) => {
    await page.goto('/')

    // Enter valid URL
    await page.fill('[data-testid="url-input"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    // Button should be enabled
    await expect(page.locator('[data-testid="submit-button"]')).toBeEnabled()
  })

  test('should navigate to lesson page on valid URL submit', async ({ page }) => {
    await page.goto('/')

    // Enter valid URL
    await page.fill('[data-testid="url-input"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    // Select difficulty
    await page.click('[data-testid="difficulty-select"]')
    await page.click('text=Easy')

    // Submit
    await page.click('[data-testid="submit-button"]')

    // Should navigate to lesson page
    await expect(page).toHaveURL(/\/lesson\/dQw4w9WgXcQ\?difficulty=easy/)
  })
})
```

```typescript
// tests/e2e/lesson-flow.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Lesson Flow', () => {
  // Note: These tests require mocking external APIs (YouTube, OpenAI)
  // In real implementation, use MSW or test doubles

  test.skip('should generate lesson from YouTube URL', async ({ page }) => {
    await page.goto('/')

    // Enter URL
    await page.fill('[data-testid="url-input"]', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')

    // Select difficulty
    await page.click('[data-testid="difficulty-select"]')
    await page.click('text=Medium')

    // Submit
    await page.click('[data-testid="submit-button"]')

    // Should navigate to lesson page
    await expect(page).toHaveURL(/\/lesson\/dQw4w9WgXcQ/)

    // Should show loading or video player
    // Note: Actual rendering depends on API response time
    await expect(
      page.locator('[data-testid="video-player-container"]').or(page.locator('.animate-pulse'))
    ).toBeVisible({ timeout: 30000 })
  })

  test.skip('should display lesson components when loaded', async ({ page }) => {
    // Navigate directly to lesson page (with mocked data)
    await page.goto('/lesson/dQw4w9WgXcQ?difficulty=easy')

    // Wait for lesson to load
    await expect(page.locator('[data-testid="lesson-card"]')).toBeVisible({ timeout: 30000 })

    // Should show exercises
    await expect(page.locator('[data-testid="exercise-panel"]').or(page.locator('[data-testid="question"]'))).toBeVisible()

    // Should show vocabulary
    await expect(page.locator('[data-testid="vocabulary-list"]').or(page.locator('[data-testid="vocab-0"]'))).toBeVisible()
  })

  test('should show error page for invalid video ID', async ({ page }) => {
    // Navigate to lesson with invalid video ID
    await page.goto('/lesson/invalid123')

    // Should show 404 or error
    await expect(
      page.locator('text=not found').or(page.locator('text=Failed'))
    ).toBeVisible({ timeout: 10000 })
  })
})
```

### Integration Points

```yaml
DATABASE:
  - Nenhuma migracao nova necessaria
  - Usar repositories existentes (PrismaLessonRepository, PrismaTranscriptRepository)

CONFIG:
  - Prisma client em src/shared/lib/prisma.ts (ja existe)
  - Variaveis de ambiente: DATABASE_URL, OPENAI_API_KEY (ja configuradas)

ROUTES:
  - /: Home page
  - /lesson/[videoId]: Lesson page (dynamic)

COMPONENTS:
  - shadcn Select: pnpm dlx shadcn@latest add select
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Rodar lint e verificar erros
pnpm lint

# Verificar formatacao
pnpm format:check

# Esperado: Nenhum erro
```

### Level 2: Type Check

```bash
# Verificar tipos TypeScript
pnpm type-check

# Esperado: Nenhum erro de tipo
```

### Level 3: Unit Tests

```bash
# Rodar testes unitarios
pnpm test:unit

# Esperado: Testes passam
# Nota: Esta tarefa e majoritariamente integration/E2E
```

### Level 4: Integration/E2E Tests

```bash
# Iniciar servidor de desenvolvimento
pnpm dev &

# Rodar testes E2E
pnpm test:e2e tests/e2e/

# Esperado: Testes E2E passam
```

### Level 5: Build

```bash
# Build de producao
pnpm build

# Esperado: Build completa sem erros
```

---

## Final Validation Checklist

- [ ] shadcn Select instalado: `src/shared/components/ui/select.tsx` existe
- [ ] UrlInputForm criado e funcional
- [ ] Home page renderiza corretamente
- [ ] Server Actions funcionam: `generateLesson()` retorna dados
- [ ] LessonProvider hydrata stores corretamente
- [ ] Lesson page renderiza todos os componentes
- [ ] Loading states exibidos durante navegacao
- [ ] Error boundaries tratam erros graciosamente
- [ ] Layout responsivo em mobile e desktop
- [ ] `pnpm lint` sem erros
- [ ] `pnpm type-check` sem erros
- [ ] `pnpm build` completa com sucesso
- [ ] Testes E2E passam: `pnpm test:e2e`

---

## Anti-Patterns to Avoid

- **NAO** importar Prisma em Client Components
- **NAO** passar classes/objetos nao-serializaveis para Client Components
- **NAO** usar useState para dados que vem do servidor (usar Server Components)
- **NAO** esquecer 'use client' em componentes que usam hooks
- **NAO** esquecer 'use server' em server actions
- **NAO** hardcodar URLs (usar variaveis de ambiente)
- **NAO** ignorar erros - sempre tratar com Result pattern
- **NAO** criar componentes sem data-testid para E2E
- **NAO** usar sync imports em Server Actions (bundle size)

---

## Confidence Score

**Nota: 8/10**

**Justificativa:**
- Componentes base ja implementados (player, lesson-card, exercise-panel, vocabulary-list)
- Use cases ja funcionando (GenerateLessonUseCase, FetchTranscriptUseCase)
- Stores Zustand ja configuradas
- Apenas integracao e composicao de paginas

**Riscos:**
- Next.js 16 async params podem requerer ajustes
- Serializacao de entities pode ter edge cases
- Testes E2E dependem de mocking de APIs externas
- YouTube API pode ter rate limits em testes

---

*PRP gerado pelo Context Engineering Framework v2.0*
*Tarefa: T-016 - Pages - Home + Lesson Page + Routing*
