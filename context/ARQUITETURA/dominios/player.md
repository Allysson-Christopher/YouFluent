# Dominio: Player

> **Modelo de dominio para o player de video YouTube**

---

## Visao Geral

O dominio Player e responsavel por representar o estado do player de video e a navegacao por chunks. E predominantemente client-side.

## Entidades

### VideoChunk (Entity)

```typescript
class VideoChunk {
  readonly id: string
  readonly index: number
  readonly startTime: number  // segundos
  readonly endTime: number    // segundos
  readonly text: string

  get duration(): number {
    return this.endTime - this.startTime
  }

  containsTime(time: number): boolean {
    return time >= this.startTime && time < this.endTime
  }
}
```

### PlayerState (Value Object)

```typescript
class PlayerState {
  readonly isPlaying: boolean
  readonly currentTime: number
  readonly playbackRate: PlaybackRate
  readonly currentChunkId: string | null

  static initial(): PlayerState

  play(): PlayerState
  pause(): PlayerState
  seek(time: number): PlayerState
  setPlaybackRate(rate: PlaybackRate): PlayerState
}

type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5
```

## Interfaces

### PlayerController

```typescript
interface PlayerController {
  play(): void
  pause(): void
  seekTo(time: number): void
  setPlaybackRate(rate: PlaybackRate): void
  getCurrentTime(): number
}
```

## Servicos de Dominio

### ChunkNavigator

```typescript
class ChunkNavigator {
  constructor(private chunks: VideoChunk[])

  getCurrentChunk(time: number): VideoChunk | null
  getNextChunk(currentChunkId: string): VideoChunk | null
  getPreviousChunk(currentChunkId: string): VideoChunk | null
  findChunkById(id: string): VideoChunk | null
}
```

## Regras de Negocio

1. Chunks sao sequenciais e nao se sobrepoem
2. Um chunk tem duracao minima de 10 segundos
3. Um chunk tem duracao maxima de 60 segundos
4. Playback rate varia de 0.5x a 1.5x

## Zustand Store (Presentation)

```typescript
// features/player/presentation/stores/player-store.ts
interface PlayerStore {
  // State
  isPlaying: boolean
  currentTime: number
  playbackRate: PlaybackRate
  currentChunkId: string | null
  chunks: VideoChunk[]

  // Actions
  play: () => void
  pause: () => void
  seek: (time: number) => void
  setPlaybackRate: (rate: PlaybackRate) => void
  setChunks: (chunks: VideoChunk[]) => void
  goToChunk: (chunkId: string) => void
}
```

---

## Tags de Contexto

```
PRD: features/player
```

---

*Dominio definido para o Context Engineering Framework*
