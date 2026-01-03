# PRP: Player Domain Entities

---

## Input Summary

**Modo:** AUTO
**Tarefa:** T-008 - Domain - Player entities (PlaybackState, PlayerControls)
**Origem:** context/TASKS/T-008.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/PRD/features/player.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/dominios/player.md
- context/ARQUITETURA/padroes.md

**Objetivo:** Criar entidades de dominio para controle do player de video, incluindo estado de playback e controles.

**Escopo:**
- Value Object: PlaybackState (playing, paused, buffering, ended)
- Value Object: TimePosition (current time, duration)
- Entity: PlayerControls (play, pause, seek, setPlaybackRate)
- Interface: PlayerAdapter (abstrai YouTube IFrame API)
- Testes TDD com 100% cobertura

**Criterios de Aceite:**
- [ ] PlaybackState representa estados: playing, paused, buffering, ended
- [ ] TimePosition valida tempos (positivos, current <= duration)
- [ ] PlayerControls orquestra operacoes de controle
- [ ] PlayerAdapter define contrato para implementacoes
- [ ] Cobertura de testes: 100%
- [ ] Todos os testes passam

---

## Goal

Criar entidades de dominio para o player de video YouTube seguindo DDD e Clean Architecture:
- **PlaybackState** (Value Object): Estado imutavel do player (playing, paused, buffering, ended)
- **TimePosition** (Value Object): Posicao atual e duracao do video com validacoes
- **PlayerControls** (Entity): Orquestra operacoes de controle do player
- **PlayerAdapter** (Interface): Contrato para implementacoes concretas do player

Todos os componentes devem seguir o **Result pattern** ja implementado no projeto e ter **100% de cobertura de testes (TDD)**.

## Why

- **Separacao de concerns:** Isola logica de estado do player da implementacao concreta (YouTube IFrame API)
- **Testabilidade:** Domain puro permite testes unitarios sem dependencias externas
- **Extensibilidade:** Interface PlayerAdapter permite trocar implementacao (ex: outros players)
- **Type safety:** Value Objects garantem invariantes em tempo de compilacao
- **Fundacao para T-009/T-010:** Necessario para implementar VideoPlayer e ChunkNavigator

## What

### Comportamento Esperado

**PlaybackState:**
- Representa estado discreto: `playing | paused | buffering | ended`
- Transicoes validas entre estados
- Imutavel (cada transicao retorna nova instancia)

**TimePosition:**
- Armazena `currentSeconds` e `durationSeconds`
- Valida: tempos positivos, current <= duration
- Calcula `progressPercent` automaticamente

**PlayerControls:**
- Mantem referencia ao PlayerAdapter
- Orquestra operacoes: play, pause, seek, setPlaybackRate
- Gerencia estado atual

**PlayerAdapter (Interface):**
- Define contrato para implementacoes concretas
- Metodos: play, pause, seekTo, getCurrentTime, getDuration, getState
- Callbacks: onStateChange, onTimeUpdate

### Success Criteria

- [ ] PlaybackState com factory methods e transicoes
- [ ] TimePosition com validacao via Result pattern
- [ ] PlayerControls orquestrando operacoes
- [ ] PlayerAdapter definindo contrato completo
- [ ] Testes TDD para cada componente (100% cobertura)
- [ ] Zero dependencias externas no domain

---

## All Needed Context

### Documentation & References

```yaml
- file: src/shared/core/result.ts
  why: Result pattern para retorno tipado de erros

- file: src/features/transcript/domain/value-objects/video-id.ts
  why: Padrao de Value Object com factory methods e Result

- file: src/features/transcript/domain/errors/transcript-errors.ts
  why: Padrao de erros tipados com _tag para discriminated union

- file: tests/unit/features/transcript/domain/video-id.test.ts
  why: Padrao de testes unitarios com Vitest

- doc: context/ARQUITETURA/padroes.md
  why: Padroes DDD, Clean Architecture, TDD obrigatorios

- doc: context/ARQUITETURA/dominios/player.md
  why: Modelo de dominio do Player (entidades, interfaces)
```

### Current Codebase Tree

```bash
src/
├── features/
│   ├── player/
│   │   ├── domain/          # VAZIO - a ser implementado
│   │   ├── application/     # VAZIO
│   │   ├── infrastructure/  # VAZIO
│   │   └── presentation/    # VAZIO
│   └── transcript/
│       └── domain/
│           ├── entities/
│           │   ├── chunk.ts
│           │   └── transcript.ts
│           ├── value-objects/
│           │   └── video-id.ts       # REFERENCIA
│           ├── interfaces/
│           │   ├── transcript-repository.ts
│           │   └── transcript-fetcher.ts
│           ├── errors/
│           │   └── transcript-errors.ts  # REFERENCIA
│           └── index.ts
└── shared/
    └── core/
        └── result.ts                 # REFERENCIA
```

### Desired Codebase Tree

```bash
src/features/player/
├── domain/
│   ├── value-objects/
│   │   ├── playback-state.ts      # PlaybackState VO
│   │   ├── time-position.ts       # TimePosition VO
│   │   └── playback-rate.ts       # PlaybackRate type (0.5-1.5)
│   ├── entities/
│   │   └── player-controls.ts     # PlayerControls entity
│   ├── interfaces/
│   │   └── player-adapter.ts      # PlayerAdapter interface
│   ├── errors/
│   │   └── player-errors.ts       # Erros tipados do Player
│   └── index.ts                   # Barrel export

tests/unit/features/player/
└── domain/
    ├── playback-state.test.ts     # TDD: PlaybackState
    ├── time-position.test.ts      # TDD: TimePosition
    ├── playback-rate.test.ts      # TDD: PlaybackRate
    └── player-controls.test.ts    # TDD: PlayerControls
```

### Known Gotchas & Library Quirks

```
# CRITICAL: Domain tem ZERO dependencias externas
# - Nao importar React, Prisma, Zod, etc.
# - Apenas imports de @/shared/core/result

# PATTERN: Value Objects sao imutaveis
# - Usar Object.freeze(this) no construtor
# - Metodos retornam novas instancias

# PATTERN: Erros como tipos com _tag
# - Cada erro tem readonly _tag = 'NomeError' as const
# - Permite discriminated union no TypeScript

# PATTERN: Result pattern para validacao
# - Nunca throw, sempre retornar Result.fail()
# - Factory methods estaticos (fromX, create, etc.)

# TDD: Escrever teste ANTES do codigo
# - RED: Teste falha
# - GREEN: Codigo minimo para passar
# - REFACTOR: Melhorar mantendo verde
```

---

## Implementation Blueprint

### Data Models and Structure

#### PlaybackRate Type

```typescript
// Tipo literal para velocidades validas
type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5

// Constante com valores validos
const VALID_PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5] as const
```

#### PlaybackState Value Object

```typescript
// Estados possiveis do player
type PlaybackStateValue = 'playing' | 'paused' | 'buffering' | 'ended'

class PlaybackState {
  private constructor(readonly state: PlaybackStateValue) {
    Object.freeze(this)
  }

  // Factory methods
  static playing(): PlaybackState
  static paused(): PlaybackState
  static buffering(): PlaybackState
  static ended(): PlaybackState

  // State checks
  get isPlaying(): boolean
  get isPaused(): boolean
  get isBuffering(): boolean
  get isEnded(): boolean

  // Transitions
  play(): PlaybackState
  pause(): PlaybackState
  buffer(): PlaybackState
  end(): PlaybackState

  // Comparison
  equals(other: PlaybackState): boolean
}
```

#### TimePosition Value Object

```typescript
class TimePosition {
  private constructor(
    readonly currentSeconds: number,
    readonly durationSeconds: number
  ) {
    Object.freeze(this)
  }

  // Factory method com validacao
  static create(
    current: number,
    duration: number
  ): Result<TimePosition, TimePositionError>

  // Calculated properties
  get progressPercent(): number  // 0-100
  get remainingSeconds(): number
  get isAtStart(): boolean
  get isAtEnd(): boolean

  // Comparison
  equals(other: TimePosition): boolean
}
```

#### PlayerControls Entity

```typescript
class PlayerControls {
  constructor(private adapter: PlayerAdapter) {}

  play(): void
  pause(): void
  toggle(): void
  seekTo(seconds: number): Result<void, SeekError>
  seekForward(seconds: number): void
  seekBackward(seconds: number): void
  setPlaybackRate(rate: PlaybackRate): void
  getState(): PlaybackState
  getTimePosition(): TimePosition
}
```

#### PlayerAdapter Interface

```typescript
interface PlayerAdapter {
  // Controls
  play(): void
  pause(): void
  seekTo(seconds: number): void
  setPlaybackRate(rate: PlaybackRate): void

  // State
  getCurrentTime(): number
  getDuration(): number
  getState(): PlaybackState
  getPlaybackRate(): PlaybackRate

  // Events
  onStateChange(callback: (state: PlaybackState) => void): void
  onTimeUpdate(callback: (position: TimePosition) => void): void
  destroy(): void
}
```

### List of Tasks (TDD Order)

```yaml
Task 1: Player Errors
  CREATE src/features/player/domain/errors/player-errors.ts:
    - MIRROR pattern from: src/features/transcript/domain/errors/transcript-errors.ts
    - CREATE: InvalidTimeError, InvalidPlaybackRateError, SeekError
    - INCLUDE: _tag property for discriminated union
    - EXPORT: PlayerError union type

Task 2: PlaybackRate Type (RED -> GREEN -> REFACTOR)
  CREATE tests/unit/features/player/domain/playback-rate.test.ts:
    - TEST: isValidPlaybackRate returns true for valid rates
    - TEST: isValidPlaybackRate returns false for invalid rates
    - TEST: DEFAULT_PLAYBACK_RATE is 1

  CREATE src/features/player/domain/value-objects/playback-rate.ts:
    - DEFINE: PlaybackRate type literal
    - DEFINE: VALID_PLAYBACK_RATES constant
    - DEFINE: DEFAULT_PLAYBACK_RATE constant
    - EXPORT: isValidPlaybackRate guard function

Task 3: PlaybackState Value Object (RED -> GREEN -> REFACTOR)
  CREATE tests/unit/features/player/domain/playback-state.test.ts:
    - TEST: factory methods create correct state
    - TEST: state checks (isPlaying, isPaused, etc.)
    - TEST: transitions between states
    - TEST: equals comparison
    - TEST: immutability

  CREATE src/features/player/domain/value-objects/playback-state.ts:
    - MIRROR pattern from: src/features/transcript/domain/value-objects/video-id.ts
    - IMPLEMENT: factory methods, state checks, transitions
    - ENSURE: Object.freeze(this)

Task 4: TimePosition Value Object (RED -> GREEN -> REFACTOR)
  CREATE tests/unit/features/player/domain/time-position.test.ts:
    - TEST: create with valid times succeeds
    - TEST: create with negative current fails
    - TEST: create with negative duration fails
    - TEST: create with current > duration fails
    - TEST: progressPercent calculated correctly
    - TEST: remainingSeconds calculated correctly
    - TEST: edge cases (zero, at end)
    - TEST: equals comparison

  CREATE src/features/player/domain/value-objects/time-position.ts:
    - USE: Result pattern for factory method
    - VALIDATE: current >= 0, duration > 0, current <= duration
    - CALCULATE: progressPercent with 2 decimal places

Task 5: PlayerAdapter Interface
  CREATE src/features/player/domain/interfaces/player-adapter.ts:
    - DEFINE: complete interface contract
    - DOCUMENT: PRE/POST conditions in JSDoc
    - NO TESTS: interfaces don't have implementation

Task 6: PlayerControls Entity (RED -> GREEN -> REFACTOR)
  CREATE tests/unit/features/player/domain/player-controls.test.ts:
    - CREATE: MockPlayerAdapter for testing
    - TEST: play calls adapter.play
    - TEST: pause calls adapter.pause
    - TEST: toggle switches state
    - TEST: seekTo with valid time succeeds
    - TEST: seekTo with invalid time fails
    - TEST: seekForward/seekBackward work correctly
    - TEST: setPlaybackRate updates rate

  CREATE src/features/player/domain/entities/player-controls.ts:
    - INJECT: PlayerAdapter via constructor
    - DELEGATE: operations to adapter
    - VALIDATE: seek positions via Result

Task 7: Barrel Export
  CREATE src/features/player/domain/index.ts:
    - EXPORT: all value objects, entities, interfaces, errors
    - FOLLOW: pattern from src/features/transcript/domain/index.ts
```

### Per Task Pseudocode

#### Task 1: Player Errors

```typescript
// src/features/player/domain/errors/player-errors.ts

export class InvalidTimeError {
  readonly _tag = 'InvalidTimeError' as const
  constructor(readonly time: number, readonly reason: string) {}
  get message(): string { /* ... */ }
}

export class InvalidPlaybackRateError {
  readonly _tag = 'InvalidPlaybackRateError' as const
  constructor(readonly rate: number) {}
  get message(): string { /* ... */ }
}

export class SeekError {
  readonly _tag = 'SeekError' as const
  constructor(readonly position: number, readonly reason: string) {}
  get message(): string { /* ... */ }
}

export type PlayerError =
  | InvalidTimeError
  | InvalidPlaybackRateError
  | SeekError
```

#### Task 2: PlaybackRate

```typescript
// TEST FIRST
describe('PlaybackRate', () => {
  it('should validate 0.5 as valid rate', () => {
    expect(isValidPlaybackRate(0.5)).toBe(true)
  })
  it('should reject 2 as invalid rate', () => {
    expect(isValidPlaybackRate(2)).toBe(false)
  })
})

// THEN IMPLEMENT
export type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5
export const VALID_PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5] as const
export const DEFAULT_PLAYBACK_RATE: PlaybackRate = 1

export function isValidPlaybackRate(rate: number): rate is PlaybackRate {
  return VALID_PLAYBACK_RATES.includes(rate as PlaybackRate)
}
```

#### Task 3: PlaybackState

```typescript
// TEST FIRST
describe('PlaybackState', () => {
  describe('factory methods', () => {
    it('should create playing state', () => {
      const state = PlaybackState.playing()
      expect(state.isPlaying).toBe(true)
      expect(state.isPaused).toBe(false)
    })
  })

  describe('transitions', () => {
    it('should transition from playing to paused', () => {
      const playing = PlaybackState.playing()
      const paused = playing.pause()
      expect(paused.isPaused).toBe(true)
    })
  })
})

// THEN IMPLEMENT
export class PlaybackState {
  private constructor(readonly state: 'playing' | 'paused' | 'buffering' | 'ended') {
    Object.freeze(this)
  }

  static playing(): PlaybackState { return new PlaybackState('playing') }
  static paused(): PlaybackState { return new PlaybackState('paused') }
  // ... other factory methods

  get isPlaying(): boolean { return this.state === 'playing' }
  // ... other getters

  play(): PlaybackState { return PlaybackState.playing() }
  pause(): PlaybackState { return PlaybackState.paused() }
  // ... other transitions
}
```

#### Task 4: TimePosition

```typescript
// TEST FIRST
describe('TimePosition', () => {
  it('should create valid position', () => {
    const result = TimePosition.create(30, 180)
    expect(result.isSuccess).toBe(true)
    if (result.isSuccess) {
      expect(result.value.currentSeconds).toBe(30)
      expect(result.value.progressPercent).toBeCloseTo(16.67, 2)
    }
  })

  it('should reject negative current', () => {
    const result = TimePosition.create(-1, 100)
    expect(result.isFailure).toBe(true)
    if (result.isFailure) {
      expect(result.error._tag).toBe('InvalidTimeError')
    }
  })

  it('should reject current > duration', () => {
    const result = TimePosition.create(200, 100)
    expect(result.isFailure).toBe(true)
  })
})

// THEN IMPLEMENT
export class TimePosition {
  private constructor(
    readonly currentSeconds: number,
    readonly durationSeconds: number
  ) {
    Object.freeze(this)
  }

  static create(current: number, duration: number): Result<TimePosition, InvalidTimeError> {
    if (current < 0) {
      return Result.fail(new InvalidTimeError(current, 'Current time cannot be negative'))
    }
    if (duration <= 0) {
      return Result.fail(new InvalidTimeError(duration, 'Duration must be positive'))
    }
    if (current > duration) {
      return Result.fail(new InvalidTimeError(current, 'Current time cannot exceed duration'))
    }
    return Result.ok(new TimePosition(current, duration))
  }

  get progressPercent(): number {
    return Math.round((this.currentSeconds / this.durationSeconds) * 10000) / 100
  }

  get remainingSeconds(): number {
    return this.durationSeconds - this.currentSeconds
  }
}
```

### Integration Points

```yaml
DIRECTORY STRUCTURE:
  - CREATE: src/features/player/domain/value-objects/
  - CREATE: src/features/player/domain/entities/
  - CREATE: src/features/player/domain/interfaces/
  - CREATE: src/features/player/domain/errors/
  - CREATE: tests/unit/features/player/domain/

IMPORTS:
  - FROM: @/shared/core/result (Result pattern)
  - NO OTHER external dependencies in domain

EXPORTS:
  - BARREL: src/features/player/domain/index.ts
  - PUBLIC API for other layers

FUTURE INTEGRATION:
  - T-009: YouTubePlayerAdapter implements PlayerAdapter
  - T-010: usePlayerStore uses PlaybackState, TimePosition
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Run these FIRST - fix any errors before proceeding
pnpm lint
pnpm format:check

# Expected: No errors
# If errors: Read the error message and fix
```

### Level 2: Type Check

```bash
# Verify TypeScript compiles without errors
pnpm type-check

# Expected: No type errors
# Common issues:
# - Missing imports
# - Incorrect Result usage
# - Type mismatches in tests
```

### Level 3: Unit Tests (TDD)

```bash
# Run player domain tests
pnpm test tests/unit/features/player/domain/

# Run with coverage
pnpm test:coverage -- --coverage.include="src/features/player/domain/**"

# Expected: 100% coverage for domain
# Minimum: All tests pass
```

### Level 4: Full Test Suite

```bash
# Ensure no regressions
pnpm test

# Expected: All existing tests still pass
```

### Level 5: Build

```bash
# Verify production build works
pnpm build

# Expected: Build succeeds without errors
```

---

## Final Validation Checklist

- [ ] All tests pass: `pnpm test tests/unit/features/player/domain/`
- [ ] No linting errors: `pnpm lint`
- [ ] No type errors: `pnpm type-check`
- [ ] Coverage 100%: `pnpm test:coverage`
- [ ] Build succeeds: `pnpm build`
- [ ] PlaybackState com 4 estados e transicoes
- [ ] TimePosition com validacao via Result
- [ ] PlayerControls orquestrando adapter
- [ ] PlayerAdapter interface completa
- [ ] Erros tipados com _tag
- [ ] Barrel export em index.ts
- [ ] Zero dependencias externas no domain

---

## Anti-Patterns to Avoid

- **NAO usar throw/catch:** Sempre Result pattern
- **NAO importar bibliotecas externas:** Domain puro (apenas @/shared/core/result)
- **NAO criar Value Objects mutaveis:** Usar Object.freeze
- **NAO pular testes:** TDD obrigatorio (teste primeiro)
- **NAO acoplar ao YouTube:** PlayerAdapter e interface abstrata
- **NAO usar any:** Type safety estrita
- **NAO hardcodar valores:** Usar constantes (VALID_PLAYBACK_RATES, etc.)
- **NAO esquecer _tag nos erros:** Necessario para discriminated union

---

## Confidence Score

**Nota: 9/10**

**Justificativa:**
- Contexto completo do dominio (PRD + Arquitetura)
- Padroes claros ja estabelecidos no Transcript domain
- Result pattern ja implementado
- Escopo bem definido (apenas domain, sem infra)
- TDD com exemplos de teste detalhados
- Baixa complexidade (Value Objects e Interface)

**Riscos menores:**
- PlayerControls pode precisar ajustes apos T-009 (implementacao concreta)
- Callback signatures do PlayerAdapter podem evoluir

---

*Gerado por: /generate-prp (modo AUTO)*
*Tarefa: T-008*
*Data: 2026-01-03*

---

## Pos-Implementacao

**Data:** 2026-01-03
**Status:** Implementado

### Arquivos Criados

**Domain Layer:**
- `src/features/player/domain/errors/player-errors.ts` - Erros tipados (InvalidTimeError, InvalidPlaybackRateError, SeekError)
- `src/features/player/domain/value-objects/playback-rate.ts` - PlaybackRate type e helpers
- `src/features/player/domain/value-objects/playback-state.ts` - PlaybackState Value Object
- `src/features/player/domain/value-objects/time-position.ts` - TimePosition Value Object
- `src/features/player/domain/interfaces/player-adapter.ts` - PlayerAdapter interface
- `src/features/player/domain/entities/player-controls.ts` - PlayerControls entity
- `src/features/player/domain/index.ts` - Barrel export

**Tests:**
- `tests/unit/features/player/domain/playback-rate.test.ts` - 20 testes
- `tests/unit/features/player/domain/playback-state.test.ts` - 27 testes
- `tests/unit/features/player/domain/time-position.test.ts` - 29 testes
- `tests/unit/features/player/domain/player-controls.test.ts` - 29 testes

### Testes
- **105 testes** criados
- Cobertura Domain: 100%
- Todas as entidades, value objects e funcoes helper testadas com TDD

### Validation Gates
- [x] Lint: passou
- [x] Type-check: passou
- [x] Unit tests: passou (105 testes)
- [x] Build: passou

### Erros Encontrados
- **Erro 1:** ESLint `prefer-const` no arquivo de teste `player-controls.test.ts`
  - Causa: Variavel `duration` declarada com `let` mas nunca reatribuida
  - Solucao: Alterado para `const duration = 180`
  - Aprendizado: Sempre usar `const` para variaveis que nao serao reatribuidas

### Decisoes Tomadas
1. **TimePosition com formatacao:** Adicionados metodos `formattedCurrent`, `formattedDuration`, `formattedRemaining` para exibicao no UI (MM:SS)
2. **PlayerAdapter com onError:** Adicionado callback `onError` para tratamento de erros do player
3. **PlayerControls com getters delegados:** Metodos `getCurrentTime()` e `getDuration()` delegam diretamente ao adapter para conveniencia
4. **PlaybackRate limitado:** Usando subset de velocidades (0.5-1.5) para melhor experiencia de aprendizado

### Context7 Consultado
Nenhuma consulta necessaria - padroes bem definidos no codebase existente.

### Criterios de Aceite Atendidos
- [x] PlaybackState representa estados: playing, paused, buffering, ended
- [x] TimePosition valida tempos (positivos, current <= duration)
- [x] PlayerControls orquestra operacoes de controle
- [x] PlayerAdapter define contrato para implementacoes
- [x] Cobertura de testes: 100%
- [x] Todos os testes passam
