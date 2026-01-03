# PRP: ChunkNavigator + Zustand Store

---

## Input Summary

**Modo:** AUTO
**Tarefa:** T-010 - Presentation - ChunkNavigator + Zustand Store
**Origem:** context/TASKS/T-010.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/PRD/features/player.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/dominios/player.md
- context/ARQUITETURA/stack.md
- context/ARQUITETURA/decisoes/adr-003-zustand.md

**Objetivo:** ChunkNavigator funcional com Zustand store para gerenciar estado do player e navegacao por chunks.

**Escopo:**
- Zustand store para player state (estender store existente)
- Componente ChunkNavigator (lista de chunks)
- Destaque do chunk ativo baseado no tempo
- Click em chunk = seek no video
- Testes de componente e E2E

**Criterios de Aceite:**
- [ ] Zustand store gerencia estado do player (chunks, activeChunkIndex)
- [ ] ChunkNavigator exibe todos os chunks
- [ ] Chunk ativo e destacado visualmente
- [ ] Click em chunk executa seek no video
- [ ] Chunk ativo atualiza automaticamente durante playback
- [ ] Store e reativo (updates automaticos)
- [ ] Testes de componente passam
- [ ] Testes E2E passam

---

## Goal

Criar o componente **ChunkNavigator** e **estender o Zustand player store** para gerenciar navegacao por chunks do video. O componente exibe uma lista de chunks clicaveis com destaque automatico do chunk atual baseado no tempo de reproducao.

## Why

- **Valor de negocio:** Permite que usuarios naveguem facilmente entre segmentos do video para focar em partes especificas
- **UX:** Sincronizacao visual entre video e transcricao melhora experiencia de aprendizado
- **Integracao:** Conecta o dominio Transcript com o Player, permitindo navegacao fluida
- **Arquitetura:** Estabelece padrao de stores Zustand para features futuras (Lesson)

## What

### Comportamento Esperado

1. **ChunkNavigator** exibe lista scrollavel de todos os chunks
2. Cada chunk mostra: timestamp (inicio-fim), numero, texto preview
3. Chunk ativo (baseado em currentTime) e destacado com `bg-primary`
4. Click em chunk chama `seekToChunk(index)` que posiciona video no inicio daquele chunk
5. Lista rola automaticamente para manter chunk ativo visivel (smooth scroll)

### Requisitos Tecnicos

- **Client Component** (`'use client'`) - interage com Zustand store
- **Zustand 5.x** - estender store existente
- **Tailwind v4** - classes de estilo
- **shadcn/ui patterns** - cn() helper, cores semanticas

### Success Criteria

- [ ] `usePlayerStore` inclui: `chunks`, `activeChunkIndex`, `setChunks`, `seekToChunk`
- [ ] `setCurrentTime` atualiza `activeChunkIndex` automaticamente
- [ ] `ChunkNavigator` renderiza lista de chunks
- [ ] Chunk ativo tem classe `bg-primary text-primary-foreground`
- [ ] Click em chunk executa seek e atualiza `activeChunkIndex`
- [ ] Testes de componente cobrem: render, highlight, click
- [ ] Lint e type-check passam

---

## All Needed Context

### Documentation & References

```yaml
- file: src/features/player/presentation/stores/player-store.ts
  why: Store existente a ser estendido com chunks e activeChunkIndex

- file: src/features/player/presentation/components/video-player.tsx
  why: Padrao de Client Component e integracao com store

- file: src/features/transcript/domain/entities/chunk.ts
  why: Entity Chunk com id, index, startTime, endTime, text

- file: src/features/player/domain/interfaces/player-adapter.ts
  why: Interface PlayerAdapter com seekTo(seconds)

- file: src/shared/lib/utils.ts
  why: Helper cn() para classes condicionais (shadcn pattern)

- doc: ADR-003 - Zustand
  why: Padrao de stores na camada presentation
```

### Current Codebase Tree

```
src/features/player/
├── domain/
│   ├── entities/
│   │   └── player-controls.ts
│   ├── errors/
│   │   └── player-errors.ts
│   ├── interfaces/
│   │   └── player-adapter.ts
│   ├── value-objects/
│   │   ├── playback-rate.ts
│   │   ├── playback-state.ts
│   │   └── time-position.ts
│   └── index.ts
├── infrastructure/
│   ├── adapters/
│   │   └── youtube-player-adapter.ts
│   └── index.ts
├── presentation/
│   ├── components/
│   │   └── video-player.tsx
│   ├── hooks/
│   │   └── use-player.ts
│   ├── stores/
│   │   └── player-store.ts       # ESTENDER
│   └── index.ts
└── application/
    └── .gitkeep
```

### Desired Codebase Tree

```
src/features/player/
├── presentation/
│   ├── components/
│   │   ├── video-player.tsx
│   │   ├── chunk-navigator.tsx           # CRIAR
│   │   ├── chunk-navigator.test.tsx      # CRIAR
│   │   └── index.ts                      # CRIAR (barrel)
│   ├── stores/
│   │   └── player-store.ts               # ESTENDER (chunks, activeChunkIndex)
│   └── index.ts                          # ATUALIZAR

tests/e2e/player/
└── chunk-navigator.spec.ts               # CRIAR
```

### Known Gotchas

```
# CRITICAL: Zustand 5.x nao suporta mais persist middleware por padrao
# Importar de 'zustand/middleware' se precisar

# PATTERN: Store calcula activeChunkIndex dentro de setCurrentTime
# Evita re-renders desnecessarios

# GOTCHA: Chunk do transcript tem interface diferente do VideoChunk do player
# Usar Chunk de @/features/transcript/domain/entities/chunk

# PATTERN: cn() helper para classes condicionais (shadcn/ui)
# import { cn } from '@/shared/lib/utils'

# GOTCHA: Testing Library precisa mockar usePlayerStore
# vi.mock('../stores/player-store')

# PATTERN: data-testid para testes E2E
# Usar formato: chunk-{index}
```

---

## Implementation Blueprint

### Data Models

```typescript
// Estender PlayerStoreState em player-store.ts
interface PlayerStoreState {
  // ... estado existente ...

  // ADICIONAR - Chunks
  chunks: Chunk[]
  activeChunkIndex: number

  // ADICIONAR - Setters
  setChunks: (chunks: Chunk[]) => void

  // ADICIONAR - Actions
  seekToChunk: (index: number) => void
}

// Import necessario
import type { Chunk } from '@/features/transcript/domain/entities/chunk'
```

### Task 1: Estender Player Store (player-store.ts)

**Objetivo:** Adicionar suporte a chunks e activeChunkIndex

```yaml
MODIFY src/features/player/presentation/stores/player-store.ts:
  - IMPORT Chunk de @/features/transcript/domain/entities/chunk
  - ADD chunks: Chunk[] ao state inicial
  - ADD activeChunkIndex: number ao state inicial
  - MODIFY setCurrentTime para calcular activeChunkIndex
  - ADD setChunks: (chunks) => set({ chunks })
  - ADD seekToChunk: (index) => seek + set activeChunkIndex
  - UPDATE reset para limpar chunks e activeChunkIndex
```

**Pseudocodigo:**

```typescript
// NO TOPO - Import
import type { Chunk } from '@/features/transcript/domain/entities/chunk'

// ADICIONAR ao interface PlayerStoreState
chunks: Chunk[]
activeChunkIndex: number
setChunks: (chunks: Chunk[]) => void
seekToChunk: (index: number) => void

// ADICIONAR ao initialState
chunks: [],
activeChunkIndex: -1,

// MODIFICAR setCurrentTime
setCurrentTime: (currentTime) => {
  const { chunks } = get()
  let activeChunkIndex = -1

  if (chunks.length > 0) {
    activeChunkIndex = chunks.findIndex(
      (chunk) => currentTime >= chunk.startTime && currentTime < chunk.endTime
    )
  }

  set({ currentTime, activeChunkIndex })
},

// ADICIONAR setChunks
setChunks: (chunks) => set({ chunks, activeChunkIndex: -1 }),

// ADICIONAR seekToChunk
seekToChunk: (index) => {
  const { chunks, adapter } = get()
  const chunk = chunks[index]

  if (chunk && adapter) {
    adapter.seekTo(chunk.startTime)
    set({ activeChunkIndex: index })
  }
},

// MODIFICAR reset
reset: () => set({ ...initialState, chunks: [], activeChunkIndex: -1 }),
```

### Task 2: Criar ChunkNavigator Component

**Objetivo:** Componente de navegacao por chunks

```yaml
CREATE src/features/player/presentation/components/chunk-navigator.tsx:
  - 'use client' directive
  - IMPORT usePlayerStore
  - IMPORT cn from @/shared/lib/utils
  - RENDER lista de chunks
  - HIGHLIGHT chunk ativo
  - onClick chama seekToChunk
```

**Pseudocodigo:**

```typescript
// chunk-navigator.tsx
'use client'

import { usePlayerStore } from '../stores/player-store'
import { cn } from '@/shared/lib/utils'

export function ChunkNavigator() {
  // Selectors para evitar re-renders
  const chunks = usePlayerStore((state) => state.chunks)
  const activeChunkIndex = usePlayerStore((state) => state.activeChunkIndex)
  const seekToChunk = usePlayerStore((state) => state.seekToChunk)

  // Helper: formatar segundos em mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Empty state
  if (chunks.length === 0) {
    return (
      <div className="text-muted-foreground text-sm p-4">
        No chunks available
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-medium text-muted-foreground">
        Chunks ({chunks.length})
      </h3>

      <ul className="flex flex-col gap-1 max-h-96 overflow-y-auto">
        {chunks.map((chunk, index) => (
          <li key={chunk.id}>
            <button
              data-testid={`chunk-${index}`}
              onClick={() => seekToChunk(index)}
              className={cn(
                'w-full text-left p-3 rounded-md transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-ring',
                index === activeChunkIndex && 'bg-primary text-primary-foreground'
              )}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-mono text-xs">
                  {formatTime(chunk.startTime)} - {formatTime(chunk.endTime)}
                </span>
                <span className="text-xs opacity-70">
                  {index + 1}/{chunks.length}
                </span>
              </div>
              <p className="text-sm line-clamp-2">{chunk.text}</p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### Task 3: Criar Testes de Componente

**Objetivo:** Testes unitarios para ChunkNavigator

```yaml
CREATE src/features/player/presentation/components/chunk-navigator.test.tsx:
  - MOCK usePlayerStore com vi.mock
  - TEST renderiza todos os chunks
  - TEST destaca chunk ativo
  - TEST click chama seekToChunk
  - TEST empty state quando nao ha chunks
```

**Pseudocodigo:**

```typescript
// chunk-navigator.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChunkNavigator } from './chunk-navigator'
import { usePlayerStore } from '../stores/player-store'

// Mock the store
vi.mock('../stores/player-store')

const mockChunks = [
  { id: '1', index: 0, startTime: 0, endTime: 30, text: 'First chunk text' },
  { id: '2', index: 1, startTime: 30, endTime: 60, text: 'Second chunk text' },
  { id: '3', index: 2, startTime: 60, endTime: 90, text: 'Third chunk text' },
]

describe('ChunkNavigator', () => {
  const mockSeekToChunk = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all chunks', () => {
    vi.mocked(usePlayerStore).mockImplementation((selector) => {
      const state = { chunks: mockChunks, activeChunkIndex: -1, seekToChunk: mockSeekToChunk }
      return selector(state)
    })

    render(<ChunkNavigator />)

    expect(screen.getByText('First chunk text')).toBeInTheDocument()
    expect(screen.getByText('Second chunk text')).toBeInTheDocument()
    expect(screen.getByText('Third chunk text')).toBeInTheDocument()
  })

  it('highlights active chunk', () => {
    vi.mocked(usePlayerStore).mockImplementation((selector) => {
      const state = { chunks: mockChunks, activeChunkIndex: 1, seekToChunk: mockSeekToChunk }
      return selector(state)
    })

    render(<ChunkNavigator />)

    const secondChunk = screen.getByTestId('chunk-1')
    expect(secondChunk).toHaveClass('bg-primary')
  })

  it('calls seekToChunk on click', () => {
    vi.mocked(usePlayerStore).mockImplementation((selector) => {
      const state = { chunks: mockChunks, activeChunkIndex: 0, seekToChunk: mockSeekToChunk }
      return selector(state)
    })

    render(<ChunkNavigator />)

    fireEvent.click(screen.getByTestId('chunk-2'))
    expect(mockSeekToChunk).toHaveBeenCalledWith(2)
  })

  it('shows empty state when no chunks', () => {
    vi.mocked(usePlayerStore).mockImplementation((selector) => {
      const state = { chunks: [], activeChunkIndex: -1, seekToChunk: mockSeekToChunk }
      return selector(state)
    })

    render(<ChunkNavigator />)

    expect(screen.getByText('No chunks available')).toBeInTheDocument()
  })
})
```

### Task 4: Criar Barrel Export (index.ts)

```yaml
CREATE src/features/player/presentation/components/index.ts:
  - EXPORT VideoPlayer
  - EXPORT ChunkNavigator
```

```typescript
// index.ts
export { VideoPlayer } from './video-player'
export { ChunkNavigator } from './chunk-navigator'
```

### Task 5: Atualizar Presentation Index

```yaml
MODIFY src/features/player/presentation/index.ts:
  - RE-EXPORT components
```

```typescript
// presentation/index.ts
export * from './components'
export * from './stores/player-store'
export * from './hooks/use-player'
```

### Task 6: Criar Teste E2E

**Objetivo:** Teste end-to-end da navegacao por chunks

```yaml
CREATE tests/e2e/player/chunk-navigator.spec.ts:
  - NAVIGATE para pagina com player
  - WAIT chunks carregarem
  - CLICK em chunk
  - VERIFY highlight atualiza
```

**Pseudocodigo:**

```typescript
// chunk-navigator.spec.ts
import { test, expect } from '@playwright/test'

test.describe('ChunkNavigator E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/test/player')
  })

  test('displays chunks when transcript is loaded', async ({ page }) => {
    // Wait for chunks to appear
    await expect(page.getByTestId('chunk-0')).toBeVisible({ timeout: 10000 })

    // Verify multiple chunks exist
    await expect(page.getByTestId('chunk-1')).toBeVisible()
    await expect(page.getByTestId('chunk-2')).toBeVisible()
  })

  test('navigates to chunk on click', async ({ page }) => {
    // Wait for chunks
    await expect(page.getByTestId('chunk-0')).toBeVisible({ timeout: 10000 })

    // Click on third chunk
    await page.getByTestId('chunk-2').click()

    // Verify it gets highlighted
    await expect(page.getByTestId('chunk-2')).toHaveClass(/bg-primary/)
  })

  test('highlights active chunk during playback', async ({ page }) => {
    // Wait for player ready
    await expect(page.getByTestId('chunk-0')).toBeVisible({ timeout: 10000 })

    // First chunk should be highlighted at start
    await expect(page.getByTestId('chunk-0')).toHaveClass(/bg-primary/)
  })
})
```

### Task 7: Integrar com Pagina de Teste

```yaml
MODIFY src/app/test/player/page.tsx:
  - IMPORT ChunkNavigator
  - ADD ChunkNavigator ao lado do VideoPlayer
  - ADD mock chunks para teste
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run FIRST - fix any errors before proceeding
pnpm lint
pnpm format:check

# Expected: No errors
# If errors: Read error message, fix, re-run
```

### Level 2: Type Check

```bash
pnpm type-check

# Expected: No type errors
# Common fixes: Import types correctly, check store interface
```

### Level 3: Unit Tests

```bash
# Run component tests
pnpm test src/features/player/presentation/components/chunk-navigator.test.tsx

# Run all player tests
pnpm test src/features/player/

# Expected: All tests pass
# If failing: Check mock setup, verify store interface matches
```

### Level 4: Integration Test

```bash
# Start dev server
pnpm dev

# Navigate to test page
# http://localhost:3000/test/player

# Manual checks:
# - ChunkNavigator renders with chunks
# - Click on chunk seeks video
# - Active chunk is highlighted
```

### Level 5: E2E Tests

```bash
# Run E2E tests
pnpm test:e2e tests/e2e/player/chunk-navigator.spec.ts

# Expected: All tests pass
# If failing: Check selectors, increase timeouts if needed
```

### Level 6: Build

```bash
pnpm build

# Expected: Build succeeds
# Common issues: Import paths, missing exports
```

---

## Final Validation Checklist

- [ ] `pnpm lint` - No lint errors
- [ ] `pnpm type-check` - No type errors
- [ ] `pnpm test src/features/player/` - All tests pass
- [ ] `pnpm test:e2e tests/e2e/player/` - E2E tests pass
- [ ] `pnpm build` - Build succeeds
- [ ] Manual test: ChunkNavigator renders correctly
- [ ] Manual test: Click on chunk seeks video
- [ ] Manual test: Active chunk highlights during playback

---

## Anti-Patterns to Avoid

- **DO NOT** criar nova store para chunks - estender player-store existente
- **DO NOT** usar estado local (useState) para activeChunkIndex - usar Zustand
- **DO NOT** recalcular activeChunkIndex no componente - calcular no setCurrentTime
- **DO NOT** usar `any` type - usar Chunk type do transcript domain
- **DO NOT** esquecer `'use client'` directive - componente usa hooks
- **DO NOT** mockar store incorretamente - usar vi.mock com implementacao correta
- **DO NOT** usar inline styles - usar Tailwind classes
- **DO NOT** importar Chunk diretamente - usar path alias `@/features/transcript/domain/entities/chunk`

---

## Notes

- Zustand 5.x permite selectors para evitar re-renders desnecessarios
- activeChunkIndex = -1 significa nenhum chunk ativo
- Chunk.containsTime() ja existe na entity - usar se preferir
- cn() helper e o padrao shadcn/ui para classes condicionais
- data-testid segue padrao: `chunk-{index}` para facilitar E2E

---

*PRP gerado automaticamente pelo Context Engineering Framework v2.0*
*Tarefa: T-010 | Modo: AUTO | Data: 2026-01-03*
