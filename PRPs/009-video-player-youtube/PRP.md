# PRP: VideoPlayer + YouTube IFrame API

---

## Input Summary

**Modo:** AUTO
**Tarefa:** T-009 - Presentation - VideoPlayer + YouTube IFrame API
**Origem:** context/TASKS/T-009.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/PRD/features/player.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/dominios/player.md
- context/ARQUITETURA/stack.md

**Objetivo:** Componente VideoPlayer funcional com integracao YouTube IFrame API e implementacao de PlayerAdapter.

**Escopo:**
- Componente VideoPlayer (React Client Component)
- YouTubePlayerAdapter (implementa PlayerAdapter interface)
- Integracao com YouTube IFrame API
- Controles de playback (play/pause, seek, rate)
- Zustand store para estado do player
- Testes E2E com Playwright

**Criterios de Aceite:**
- VideoPlayer carrega YouTube IFrame API dinamicamente
- YouTubePlayerAdapter implementa PlayerAdapter interface do dominio
- Controles play/pause funcionam
- Seek funciona corretamente
- Playback rate pode ser alterado
- Eventos de state change e time update disparam callbacks
- Cleanup correto ao desmontar componente
- Testes E2E passam

---

## Goal

Implementar o componente `VideoPlayer` React que integra com a YouTube IFrame API, junto com o `YouTubePlayerAdapter` que implementa a interface `PlayerAdapter` definida no dominio (T-008). O componente deve gerenciar o ciclo de vida do player, expor controles de playback, e sincronizar estado via Zustand store.

---

## Why

- **Player de video e core da experiencia:** YouFluent e construido em torno de videos do YouTube. Sem um player funcional, nao ha produto.
- **Base para navegacao por chunks (T-010):** O VideoPlayer e pre-requisito para a navegacao por segmentos.
- **Integracao com transcricao sincronizada:** O player precisa emitir eventos de tempo para sincronizar com a transcricao.
- **Experiencia do usuario:** Controles de velocidade (0.5x-1.5x) sao essenciais para aprendizado de idiomas.

---

## What

### Comportamento do Usuario

1. Usuario acessa pagina de licao com videoId
2. Player carrega video do YouTube
3. Usuario pode:
   - Play/Pause video
   - Seek para posicao especifica
   - Ajustar velocidade (0.5x, 0.75x, 1x, 1.25x, 1.5x)
4. Transcricao sincroniza com tempo atual (implementado em T-010)

### Requisitos Tecnicos

- **YouTubePlayerAdapter:** Implementa `PlayerAdapter` interface
- **VideoPlayer:** React Client Component ('use client')
- **Zustand Store:** Gerencia estado do player (isPlaying, currentTime, playbackRate)
- **YouTube IFrame API:** Carregamento dinamico via script injection
- **Cleanup:** Destruir player e intervalos ao desmontar

### Success Criteria

- [ ] YouTubePlayerAdapter implementa todos os metodos de PlayerAdapter
- [ ] VideoPlayer renderiza player do YouTube
- [ ] Estado sincronizado via Zustand store
- [ ] Eventos onStateChange e onTimeUpdate funcionam
- [ ] Testes E2E passam

---

## All Needed Context

### Documentation & References

```yaml
- url: https://developers.google.com/youtube/iframe_api_reference
  why: API oficial do YouTube IFrame Player - metodos, eventos, estados

- file: src/features/player/domain/interfaces/player-adapter.ts
  why: Interface que o YouTubePlayerAdapter deve implementar

- file: src/features/player/domain/value-objects/playback-state.ts
  why: Value Object para estados do player (playing, paused, buffering, ended)

- file: src/features/player/domain/value-objects/time-position.ts
  why: Value Object para posicao no video (current, duration, progress)

- file: src/features/player/domain/value-objects/playback-rate.ts
  why: Tipo PlaybackRate e constantes (0.5, 0.75, 1, 1.25, 1.5)
```

### Current Codebase Tree

```
src/features/player/
└── domain/
    ├── entities/
    │   └── player-controls.ts
    ├── errors/
    │   └── player-errors.ts
    ├── interfaces/
    │   └── player-adapter.ts      # Interface a implementar
    ├── value-objects/
    │   ├── playback-rate.ts       # PlaybackRate type
    │   ├── playback-state.ts      # PlaybackState VO
    │   └── time-position.ts       # TimePosition VO
    └── index.ts
```

### Desired Codebase Tree

```
src/features/player/
├── domain/                         # (existente, sem alteracoes)
│   └── ...
├── infrastructure/
│   └── adapters/
│       └── youtube-player-adapter.ts   # Implementa PlayerAdapter
└── presentation/
    ├── components/
    │   └── video-player.tsx            # React Client Component
    ├── stores/
    │   └── player-store.ts             # Zustand store
    └── hooks/
        └── use-player.ts               # Hook para acessar store

tests/e2e/
└── player/
    └── video-player.spec.ts            # Testes E2E Playwright

src/types/
└── youtube.d.ts                        # Type definitions para YT API
```

### Known Gotchas

```
# CRITICAL: YouTube IFrame API requer carregamento async via script
# O objeto YT so existe apos callback window.onYouTubeIframeAPIReady

# CRITICAL: YT.Player so pode ser criado DEPOIS que o script carrega
# Tentar criar antes resulta em "YT is not defined"

# GOTCHA: onStateChange recebe numeros, nao strings
# YT.PlayerState.PLAYING = 1, PAUSED = 2, BUFFERING = 3, ENDED = 0

# GOTCHA: getCurrentTime() pode retornar valores durante seek
# Usar getPlayerState() para verificar se esta PLAYING antes de emitir time

# GOTCHA: Player deve ser destruido no cleanup (memory leak)
# Usar player.destroy() no useEffect cleanup

# GOTCHA: Multiplos players na mesma pagina precisam IDs unicos
# Usar videoId no ID do container: `youtube-player-${videoId}`

# PATTERN: Time updates via setInterval (YouTube API nao tem evento nativo)
# Intervalo de 250ms e suficiente para UX sem overhead excessivo
```

---

## Implementation Blueprint

### Data Models and Structure

#### YouTube Type Definitions

```typescript
// src/types/youtube.d.ts
declare namespace YT {
  class Player {
    constructor(elementId: string, options: PlayerOptions)
    playVideo(): void
    pauseVideo(): void
    seekTo(seconds: number, allowSeekAhead: boolean): void
    setPlaybackRate(suggestedRate: number): void
    getCurrentTime(): number
    getDuration(): number
    getPlayerState(): number
    getPlaybackRate(): number
    destroy(): void
  }

  interface PlayerOptions {
    videoId?: string
    width?: number | string
    height?: number | string
    playerVars?: PlayerVars
    events?: PlayerEvents
  }

  interface PlayerVars {
    autoplay?: 0 | 1
    controls?: 0 | 1
    modestbranding?: 0 | 1
    rel?: 0 | 1
  }

  interface PlayerEvents {
    onReady?: (event: PlayerEvent) => void
    onStateChange?: (event: OnStateChangeEvent) => void
    onError?: (event: OnErrorEvent) => void
  }

  interface PlayerEvent {
    target: Player
  }

  interface OnStateChangeEvent extends PlayerEvent {
    data: number
  }

  interface OnErrorEvent extends PlayerEvent {
    data: number
  }

  const PlayerState: {
    UNSTARTED: -1
    ENDED: 0
    PLAYING: 1
    PAUSED: 2
    BUFFERING: 3
    CUED: 5
  }
}

interface Window {
  YT: typeof YT
  onYouTubeIframeAPIReady: () => void
}
```

#### Player Store State

```typescript
// Interface do Zustand store
interface PlayerStoreState {
  // State
  adapter: PlayerAdapter | null
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: PlaybackRate
  isReady: boolean
  error: Error | null

  // Actions
  setAdapter: (adapter: PlayerAdapter) => void
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setPlaybackRate: (rate: PlaybackRate) => void
  setReady: (ready: boolean) => void
  setError: (error: Error | null) => void
  reset: () => void

  // Derived actions (usam adapter)
  play: () => void
  pause: () => void
  seekTo: (seconds: number) => void
  changePlaybackRate: (rate: PlaybackRate) => void
}
```

---

### Task List

#### Task 1: Create YouTube Type Definitions

**Arquivo:** `src/types/youtube.d.ts`

```typescript
// Definir tipos para YT namespace
// - YT.Player class com todos os metodos
// - YT.PlayerOptions, PlayerVars, PlayerEvents
// - YT.PlayerState enum values
// - Window augmentation para YT e callback
```

**Validacao:**
```bash
pnpm type-check  # Sem erros de tipo
```

---

#### Task 2: Create Player Zustand Store

**Arquivo:** `src/features/player/presentation/stores/player-store.ts`

```typescript
import { create } from 'zustand'
import type { PlayerAdapter, PlaybackRate } from '../../domain'

interface PlayerStoreState {
  // State
  adapter: PlayerAdapter | null
  isPlaying: boolean
  currentTime: number
  duration: number
  playbackRate: PlaybackRate
  isReady: boolean
  error: Error | null

  // Setters
  setAdapter: (adapter: PlayerAdapter) => void
  setPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setPlaybackRate: (rate: PlaybackRate) => void
  setReady: (ready: boolean) => void
  setError: (error: Error | null) => void
  reset: () => void

  // Actions (delegam para adapter)
  play: () => void
  pause: () => void
  seekTo: (seconds: number) => void
  changePlaybackRate: (rate: PlaybackRate) => void
}

export const usePlayerStore = create<PlayerStoreState>((set, get) => ({
  // Initial state
  adapter: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1,
  isReady: false,
  error: null,

  // Setters
  setAdapter: (adapter) => set({ adapter }),
  setPlaying: (isPlaying) => set({ isPlaying }),
  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setPlaybackRate: (playbackRate) => set({ playbackRate }),
  setReady: (isReady) => set({ isReady }),
  setError: (error) => set({ error }),
  reset: () => set({
    adapter: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    playbackRate: 1,
    isReady: false,
    error: null,
  }),

  // Actions
  play: () => get().adapter?.play(),
  pause: () => get().adapter?.pause(),
  seekTo: (seconds) => get().adapter?.seekTo(seconds),
  changePlaybackRate: (rate) => {
    get().adapter?.setPlaybackRate(rate)
    set({ playbackRate: rate })
  },
}))
```

**Validacao:**
```bash
pnpm type-check
```

---

#### Task 3: Create YouTubePlayerAdapter

**Arquivo:** `src/features/player/infrastructure/adapters/youtube-player-adapter.ts`

```typescript
import type { PlayerAdapter } from '../../domain/interfaces/player-adapter'
import { PlaybackState } from '../../domain/value-objects/playback-state'
import { TimePosition } from '../../domain/value-objects/time-position'
import type { PlaybackRate } from '../../domain/value-objects/playback-rate'
import { DEFAULT_PLAYBACK_RATE } from '../../domain/value-objects/playback-rate'

export class YouTubePlayerAdapter implements PlayerAdapter {
  private player: YT.Player | null = null
  private stateCallback: ((state: PlaybackState) => void) | null = null
  private timeCallback: ((position: TimePosition) => void) | null = null
  private errorCallback: ((error: Error) => void) | null = null
  private timeUpdateInterval: ReturnType<typeof setInterval> | null = null
  private currentPlaybackRate: PlaybackRate = DEFAULT_PLAYBACK_RATE

  constructor(private readonly elementId: string) {}

  // ============================================================
  // Initialization
  // ============================================================

  async initialize(videoId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.player = new YT.Player(this.elementId, {
          videoId,
          playerVars: {
            autoplay: 0,
            controls: 1,
            modestbranding: 1,
            rel: 0,
          },
          events: {
            onReady: () => {
              this.startTimeUpdates()
              resolve()
            },
            onStateChange: (event) => this.handleStateChange(event),
            onError: (event) => this.handleError(event),
          },
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  // ============================================================
  // State Mapping
  // ============================================================

  private handleStateChange(event: YT.OnStateChangeEvent): void {
    const state = this.mapYTState(event.data)
    this.stateCallback?.(state)
  }

  private handleError(event: YT.OnErrorEvent): void {
    const errorMessages: Record<number, string> = {
      2: 'Invalid video ID',
      5: 'HTML5 player error',
      100: 'Video not found',
      101: 'Video not embeddable',
      150: 'Video not embeddable',
    }
    const message = errorMessages[event.data] || `YouTube error: ${event.data}`
    this.errorCallback?.(new Error(message))
  }

  private mapYTState(ytState: number): PlaybackState {
    switch (ytState) {
      case YT.PlayerState.PLAYING:
        return PlaybackState.playing()
      case YT.PlayerState.PAUSED:
        return PlaybackState.paused()
      case YT.PlayerState.BUFFERING:
        return PlaybackState.buffering()
      case YT.PlayerState.ENDED:
        return PlaybackState.ended()
      default:
        return PlaybackState.paused()
    }
  }

  // ============================================================
  // Controls
  // ============================================================

  play(): void {
    this.player?.playVideo()
  }

  pause(): void {
    this.player?.pauseVideo()
  }

  seekTo(seconds: number): void {
    this.player?.seekTo(seconds, true)
  }

  setPlaybackRate(rate: PlaybackRate): void {
    this.player?.setPlaybackRate(rate)
    this.currentPlaybackRate = rate
  }

  // ============================================================
  // State
  // ============================================================

  getCurrentTime(): number {
    return this.player?.getCurrentTime() ?? 0
  }

  getDuration(): number {
    return this.player?.getDuration() ?? 0
  }

  getState(): PlaybackState {
    const ytState = this.player?.getPlayerState() ?? -1
    return this.mapYTState(ytState)
  }

  getPlaybackRate(): PlaybackRate {
    return this.currentPlaybackRate
  }

  getTimePosition(): TimePosition | null {
    const current = this.getCurrentTime()
    const duration = this.getDuration()
    if (duration <= 0) return null

    const result = TimePosition.create(current, duration)
    return result.isOk() ? result.value : null
  }

  // ============================================================
  // Events
  // ============================================================

  onStateChange(callback: (state: PlaybackState) => void): void {
    this.stateCallback = callback
  }

  onTimeUpdate(callback: (position: TimePosition) => void): void {
    this.timeCallback = callback
  }

  onError(callback: (error: Error) => void): void {
    this.errorCallback = callback
  }

  private startTimeUpdates(): void {
    // Clear existing interval if any
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
    }

    this.timeUpdateInterval = setInterval(() => {
      if (this.player && this.timeCallback) {
        const position = this.getTimePosition()
        if (position) {
          this.timeCallback(position)
        }
      }
    }, 250) // 250ms interval for smooth updates
  }

  // ============================================================
  // Lifecycle
  // ============================================================

  destroy(): void {
    if (this.timeUpdateInterval) {
      clearInterval(this.timeUpdateInterval)
      this.timeUpdateInterval = null
    }
    this.player?.destroy()
    this.player = null
    this.stateCallback = null
    this.timeCallback = null
    this.errorCallback = null
  }
}
```

**Validacao:**
```bash
pnpm type-check
```

---

#### Task 4: Create usePlayer Hook

**Arquivo:** `src/features/player/presentation/hooks/use-player.ts`

```typescript
import { usePlayerStore } from '../stores/player-store'

/**
 * Custom hook for accessing player state and actions
 *
 * Provides a simplified interface to the player store
 */
export function usePlayer() {
  const store = usePlayerStore()

  return {
    // State
    isPlaying: store.isPlaying,
    currentTime: store.currentTime,
    duration: store.duration,
    playbackRate: store.playbackRate,
    isReady: store.isReady,
    error: store.error,

    // Computed
    progress: store.duration > 0
      ? (store.currentTime / store.duration) * 100
      : 0,

    // Actions
    play: store.play,
    pause: store.pause,
    toggle: () => store.isPlaying ? store.pause() : store.play(),
    seekTo: store.seekTo,
    setPlaybackRate: store.changePlaybackRate,
  }
}
```

**Validacao:**
```bash
pnpm type-check
```

---

#### Task 5: Create VideoPlayer Component

**Arquivo:** `src/features/player/presentation/components/video-player.tsx`

```typescript
'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { YouTubePlayerAdapter } from '../../infrastructure/adapters/youtube-player-adapter'
import { usePlayerStore } from '../stores/player-store'

interface VideoPlayerProps {
  videoId: string
  onReady?: () => void
  onTimeUpdate?: (seconds: number) => void
  onError?: (error: Error) => void
  className?: string
}

// Script loading state (singleton)
let isScriptLoading = false
let isScriptLoaded = false
const pendingCallbacks: (() => void)[] = []

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    // Already loaded
    if (isScriptLoaded && window.YT) {
      resolve()
      return
    }

    // Add to pending callbacks
    pendingCallbacks.push(resolve)

    // Script is loading, wait for callback
    if (isScriptLoading) {
      return
    }

    isScriptLoading = true

    // Set up global callback
    window.onYouTubeIframeAPIReady = () => {
      isScriptLoaded = true
      isScriptLoading = false
      // Resolve all pending callbacks
      pendingCallbacks.forEach((cb) => cb())
      pendingCallbacks.length = 0
    }

    // Create and append script
    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.body.appendChild(script)
  })
}

export function VideoPlayer({
  videoId,
  onReady,
  onTimeUpdate,
  onError,
  className,
}: VideoPlayerProps) {
  const adapterRef = useRef<YouTubePlayerAdapter | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  const {
    setAdapter,
    setPlaying,
    setCurrentTime,
    setDuration,
    setReady,
    setError,
    reset,
  } = usePlayerStore()

  const elementId = `youtube-player-${videoId}`

  // Initialize player
  useEffect(() => {
    let isMounted = true

    const initPlayer = async () => {
      try {
        // Load YouTube API
        await loadYouTubeAPI()

        if (!isMounted) return

        // Create adapter
        const adapter = new YouTubePlayerAdapter(elementId)

        // Set up callbacks before initialization
        adapter.onStateChange((state) => {
          if (isMounted) {
            setPlaying(state.isPlaying)
          }
        })

        adapter.onTimeUpdate((position) => {
          if (isMounted) {
            setCurrentTime(position.currentSeconds)
            setDuration(position.durationSeconds)
            onTimeUpdate?.(position.currentSeconds)
          }
        })

        adapter.onError((error) => {
          if (isMounted) {
            setError(error)
            onError?.(error)
          }
        })

        // Initialize with video
        await adapter.initialize(videoId)

        if (!isMounted) {
          adapter.destroy()
          return
        }

        // Store adapter
        adapterRef.current = adapter
        setAdapter(adapter)
        setReady(true)
        setIsInitialized(true)
        onReady?.()
      } catch (error) {
        if (isMounted) {
          const err = error instanceof Error ? error : new Error(String(error))
          setError(err)
          onError?.(err)
        }
      }
    }

    initPlayer()

    // Cleanup
    return () => {
      isMounted = false
      if (adapterRef.current) {
        adapterRef.current.destroy()
        adapterRef.current = null
      }
      reset()
    }
  }, [videoId]) // Only re-init if videoId changes

  return (
    <div className={className} data-testid="video-player-container">
      <div
        id={elementId}
        className="aspect-video w-full"
        data-testid="youtube-player"
      />
    </div>
  )
}
```

**Validacao:**
```bash
pnpm type-check
pnpm lint
```

---

#### Task 6: Create Index Exports

**Arquivo:** `src/features/player/infrastructure/index.ts`

```typescript
export { YouTubePlayerAdapter } from './adapters/youtube-player-adapter'
```

**Arquivo:** `src/features/player/presentation/index.ts`

```typescript
// Components
export { VideoPlayer } from './components/video-player'

// Stores
export { usePlayerStore } from './stores/player-store'

// Hooks
export { usePlayer } from './hooks/use-player'
```

---

#### Task 7: Create E2E Tests

**Arquivo:** `tests/e2e/player/video-player.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('VideoPlayer', () => {
  // Use a short, known video for testing
  const TEST_VIDEO_ID = 'dQw4w9WgXcQ'

  test.beforeEach(async ({ page }) => {
    // Navigate to a test page with the video player
    await page.goto(`/test/player?videoId=${TEST_VIDEO_ID}`)
  })

  test('should render video player container', async ({ page }) => {
    const container = page.locator('[data-testid="video-player-container"]')
    await expect(container).toBeVisible()
  })

  test('should load YouTube iframe', async ({ page }) => {
    // Wait for YouTube iframe to be injected
    const iframe = page.locator(`#youtube-player-${TEST_VIDEO_ID} iframe`)
    await expect(iframe).toBeVisible({ timeout: 10000 })
  })

  test('should have accessible player controls', async ({ page }) => {
    // Wait for player to be ready
    await page.waitForSelector(`#youtube-player-${TEST_VIDEO_ID} iframe`, {
      timeout: 10000,
    })

    // YouTube embeds have built-in controls
    // We just verify the iframe exists and is interactive
    const iframe = page.locator(`#youtube-player-${TEST_VIDEO_ID} iframe`)
    await expect(iframe).toHaveAttribute('allowfullscreen', '')
  })
})
```

**Arquivo:** `tests/e2e/fixtures/test-player-page.tsx` (para testes)

```typescript
// src/app/test/player/page.tsx (apenas para desenvolvimento/teste)
// Este arquivo so deve existir em ambiente de desenvolvimento
```

---

#### Task 8: Create Test Page (Development Only)

**Arquivo:** `src/app/test/player/page.tsx`

```typescript
import { Suspense } from 'react'
import { VideoPlayer } from '@/features/player/presentation'

interface PageProps {
  searchParams: Promise<{ videoId?: string }>
}

export default async function TestPlayerPage({ searchParams }: PageProps) {
  const { videoId } = await searchParams

  if (!videoId) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold text-red-600">
          Missing videoId parameter
        </h1>
        <p className="mt-2">
          Usage: /test/player?videoId=dQw4w9WgXcQ
        </p>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Video Player Test</h1>
      <div className="max-w-3xl">
        <Suspense fallback={<div>Loading player...</div>}>
          <VideoPlayer videoId={videoId} />
        </Suspense>
      </div>
    </div>
  )
}
```

---

### Integration Points

```yaml
TYPES:
  - file: src/types/youtube.d.ts
  - include in: tsconfig.json (should auto-include from src/types/)

EXPORTS:
  - file: src/features/player/infrastructure/index.ts
  - file: src/features/player/presentation/index.ts

TESTS:
  - directory: tests/e2e/player/
  - config: playwright.config.ts (should already exist from T-003)
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run linter
pnpm lint

# Check formatting
pnpm format:check

# Expected: No errors
```

### Level 2: Type Check

```bash
# TypeScript validation
pnpm type-check

# Expected: No type errors
# Common issues:
# - YT namespace not found: Check youtube.d.ts is in src/types/
# - PlayerAdapter implementation incomplete: Check all methods implemented
```

### Level 3: Unit Tests (N/A for presentation layer)

Esta tarefa e predominantemente presentation layer.
Nao ha testes unitarios obrigatorios.

### Level 4: E2E Tests

```bash
# Start dev server first
pnpm dev &

# Run E2E tests
pnpm test:e2e tests/e2e/player/

# Expected: All tests pass
# If failing: Check if YouTube API loads correctly
```

### Level 5: Build

```bash
# Production build
pnpm build

# Expected: No errors
# Common issues:
# - 'use client' missing: Add directive to VideoPlayer
# - Window undefined: Ensure YT access is client-side only
```

---

## Final Validation Checklist

- [ ] `pnpm lint` - Sem erros
- [ ] `pnpm format:check` - Formatacao OK
- [ ] `pnpm type-check` - Sem erros de tipo
- [ ] `pnpm build` - Build completo
- [ ] `pnpm test:e2e tests/e2e/player/` - E2E passam
- [ ] Manual: Acessar /test/player?videoId=dQw4w9WgXcQ e verificar video carrega
- [ ] Manual: Play/Pause funciona
- [ ] Manual: Seek funciona (clicar na timeline do YouTube)
- [ ] Cleanup: Navegar para outra pagina e voltar nao causa memory leak

---

## Anti-Patterns to Avoid

- **NAO use Server Components para VideoPlayer** - Requer 'use client' para acessar window.YT
- **NAO carregue script do YouTube no <head>** - Use dynamic loading para evitar blocking
- **NAO crie multiplos scripts do YouTube** - Use singleton pattern para loading state
- **NAO ignore cleanup no useEffect** - Sempre destruir player e limpar intervalos
- **NAO acesse window.YT sem verificar** - Use optional chaining ou guards
- **NAO use estado local para playback** - Use Zustand store para sincronizacao
- **NAO hardcode playback rates** - Use PlaybackRate type do dominio
- **NAO ignore errors do YouTube** - Implemente onError callback

---

## Notes

- YouTube IFrame API deve ser carregada dinamicamente via script injection
- Usar `window.onYouTubeIframeAPIReady` para callback quando API esta pronta
- Componente deve ser client-side only ('use client')
- Cleanup importante para evitar memory leaks
- Time updates via setInterval (YouTube API nao tem evento nativo de timeupdate)
- Intervalo de 250ms e suficiente para UX sem overhead excessivo
