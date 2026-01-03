# PRP-007: Application - FetchTranscriptUseCase

---

## Input Summary

**Modo:** AUTO
**Tarefa:** T-007 - Application - FetchTranscriptUseCase
**Origem:** context/TASKS/T-007.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/PRD/features/transcript.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/dominios/transcript.md
- context/ARQUITETURA/decisoes/adr-004-cache-postgres.md

**Objetivo:** Use case completo para buscar transcricao com logica de cache (cache-first strategy).

**Escopo:**
- Implementar FetchTranscriptUseCase
- Implementar ChunkTranscriptUseCase (dividir em chunks)
- Logica de cache: verificar banco -> buscar YouTube -> salvar banco
- Testes TDD com mocks de repositorio e service

**Criterios de Aceite:**
- [ ] ChunkTranscriptUseCase divide em chunks de ~30s
- [ ] FetchTranscriptUseCase verifica cache primeiro
- [ ] Retorna do cache se existir (sem chamar YouTube)
- [ ] Busca do YouTube se nao cacheado
- [ ] Salva no cache apos buscar do YouTube
- [ ] Cobertura de testes: 80%+
- [ ] Todos os testes passam

---

## Goal

Implementar a camada de Application do dominio Transcript com dois use cases:

1. **ChunkTranscriptUseCase** - Divide segmentos de transcricao em chunks de ~30 segundos
2. **FetchTranscriptUseCase** - Orquestra busca de transcricao com cache-first strategy

O sistema deve:
- Verificar primeiro se a transcricao ja existe no cache (PostgreSQL)
- Se existir, retornar imediatamente (cache HIT)
- Se nao existir, buscar do YouTube, dividir em chunks, salvar no cache, e retornar
- Usar Result pattern para tratamento de erros
- Seguir TDD com cobertura minima de 80%

---

## Why

- **Performance**: Cache evita requisicoes repetidas ao YouTube (2-3s -> 50ms)
- **Custo**: Reduz chamadas a API externa
- **Experiencia**: Resposta rapida para videos ja processados
- **Resiliencia**: Video cacheado funciona mesmo se YouTube falhar
- **Clean Architecture**: Application layer orquestra domain e infrastructure

---

## What

### Comportamento FetchTranscriptUseCase

```
FetchTranscriptUseCase.execute(videoUrl: string)
     |
     v
[1. Extrair VideoId da URL]
     |
     +-- FALHA --> Return InvalidVideoUrlError
     |
     v
[2. Verificar cache (repository.findByVideoId)]
     |
     +-- Cache HIT --> Return Transcript (sem chamar YouTube)
     |
     +-- Cache MISS
          |
          v
     [3. Buscar do YouTube (fetcher.fetch)]
          |
          +-- FALHA --> Return TranscriptFetchError
          |
          v
     [4. Dividir em chunks (chunker.execute)]
          |
          v
     [5. Criar Transcript entity]
          |
          +-- FALHA --> Return TranscriptValidationError
          |
          v
     [6. Salvar no cache (repository.save)]
          |
          v
     Return Transcript
```

### Comportamento ChunkTranscriptUseCase

```
ChunkTranscriptUseCase.execute(segments: RawTranscriptSegment[], targetDuration: number = 30)
     |
     v
[Agrupa segmentos em chunks de ~targetDuration segundos]
     |
     v
[Gera ID unico para cada chunk]
     |
     v
[Cria Chunk entities]
     |
     v
Return Chunk[]
```

### Success Criteria

- [ ] ChunkTranscriptUseCase agrupa segmentos em chunks de ~30s
- [ ] FetchTranscriptUseCase retorna do cache quando disponivel
- [ ] FetchTranscriptUseCase busca do YouTube quando cache miss
- [ ] FetchTranscriptUseCase salva no cache apos buscar do YouTube
- [ ] Erros sao propagados corretamente com Result pattern
- [ ] Cobertura de testes >= 80%
- [ ] Todos os testes unitarios passam

---

## All Needed Context

### Documentation & References

```yaml
- file: src/features/transcript/domain/index.ts
  why: Public API do dominio - entities, VOs, interfaces, errors

- file: src/features/transcript/domain/entities/transcript.ts
  why: Transcript.create() pattern e props

- file: src/features/transcript/domain/entities/chunk.ts
  why: Chunk.create() pattern e props

- file: src/features/transcript/domain/interfaces/transcript-repository.ts
  why: Interface que FetchTranscriptUseCase usa para cache

- file: src/features/transcript/domain/interfaces/transcript-fetcher.ts
  why: Interface para buscar do YouTube, RawTranscript, RawTranscriptSegment

- file: src/features/transcript/domain/value-objects/video-id.ts
  why: VideoId.fromUrl() para extrair ID da URL

- file: src/features/transcript/domain/errors/transcript-errors.ts
  why: Tipos de erro para Result pattern

- file: src/shared/core/result.ts
  why: Result.ok() e Result.fail() pattern

- file: tests/unit/features/transcript/domain/transcript.test.ts
  why: Pattern de testes TDD para entidades
```

### Current Codebase Tree

```
src/features/transcript/
├── domain/
│   ├── entities/
│   │   ├── chunk.ts           [EXISTE]
│   │   └── transcript.ts      [EXISTE]
│   ├── errors/
│   │   └── transcript-errors.ts [EXISTE]
│   ├── interfaces/
│   │   ├── transcript-fetcher.ts  [EXISTE]
│   │   └── transcript-repository.ts [EXISTE]
│   ├── value-objects/
│   │   └── video-id.ts        [EXISTE]
│   └── index.ts               [EXISTE]
└── infrastructure/
    ├── mappers/
    │   └── transcript-mapper.ts [EXISTE]
    ├── repositories/
    │   └── prisma-transcript-repository.ts [EXISTE]
    └── services/
        └── youtube-transcript-service.ts [EXISTE]

tests/
├── unit/features/transcript/
│   ├── domain/
│   │   ├── video-id.test.ts   [EXISTE]
│   │   ├── chunk.test.ts      [EXISTE]
│   │   └── transcript.test.ts [EXISTE]
│   └── infrastructure/
│       └── transcript-mapper.test.ts [EXISTE]
└── integration/features/transcript/
    ├── prisma-transcript-repository.test.ts [EXISTE]
    └── youtube-transcript-service.test.ts [EXISTE]
```

### Desired Codebase Tree

```
src/features/transcript/
├── application/
│   └── use-cases/
│       ├── chunk-transcript.ts    [CRIAR] - ChunkTranscriptUseCase
│       ├── fetch-transcript.ts    [CRIAR] - FetchTranscriptUseCase
│       └── index.ts               [CRIAR] - Barrel exports
├── domain/                        [JA EXISTE]
└── infrastructure/                [JA EXISTE]

tests/unit/features/transcript/
└── application/
    ├── chunk-transcript.test.ts   [CRIAR] - Testes ChunkTranscriptUseCase
    └── fetch-transcript.test.ts   [CRIAR] - Testes FetchTranscriptUseCase
```

### Known Gotchas

```
# CRITICAL: Use cases nao conhecem detalhes de infraestrutura
# - Nao importar PrismaClient, YouTubeTranscriptService diretamente
# - Usar interfaces: TranscriptRepository, TranscriptFetcher

# CRITICAL: RawTranscriptSegment usa 'start' e 'duration' (em segundos)
# - start: tempo de inicio do segmento
# - duration: duracao do segmento
# - endTime = start + duration

# CRITICAL: Chunk.create() requer 'startTime' e 'endTime' (nao start/duration)
# - Converter RawTranscriptSegment -> ChunkProps no chunker

# PATTERN: Gerar IDs com crypto.randomUUID()
# - Chunk.id e Transcript.id devem ser gerados

# PATTERN: youtube-transcript nao retorna titulo
# - YouTubeTranscriptService.fetch() retorna title: '' (vazio)
# - FetchTranscriptUseCase deve gerar um titulo padrao ou aceitar vazio

# INVARIANT: Transcript requer pelo menos 1 chunk
# - Se YouTube retornar 0 segmentos, retornar erro

# TDD: Escrever teste ANTES da implementacao
# - RED: Teste falha
# - GREEN: Codigo minimo para passar
# - REFACTOR: Melhorar mantendo verde
```

---

## Implementation Blueprint

### Data Models

```typescript
// Input para FetchTranscriptUseCase
interface FetchTranscriptInput {
  videoUrl: string
}

// Output de FetchTranscriptUseCase
type FetchTranscriptResult = Result<Transcript, FetchTranscriptError>

// Erros possiveis
type FetchTranscriptError =
  | InvalidVideoUrlError      // URL invalida
  | TranscriptFetchError      // Falha ao buscar do YouTube
  | TranscriptValidationError // Falha ao criar Transcript entity
```

### Task 1: Criar estrutura de diretorios

```yaml
CREATE src/features/transcript/application/use-cases/:
  - Diretorio para use cases
```

### Task 2: Implementar ChunkTranscriptUseCase (TDD)

**TESTE PRIMEIRO:**

```typescript
// tests/unit/features/transcript/application/chunk-transcript.test.ts
import { describe, it, expect } from 'vitest'
import { ChunkTranscriptUseCase } from '@/features/transcript/application/use-cases/chunk-transcript'
import type { RawTranscriptSegment } from '@/features/transcript/domain'

describe('ChunkTranscriptUseCase', () => {
  describe('execute', () => {
    it('should create chunks of approximately 30 seconds', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 10, text: 'Hello' },
        { start: 10, duration: 10, text: 'World' },
        { start: 20, duration: 10, text: 'Test' },
        { start: 30, duration: 10, text: 'More' },
        { start: 40, duration: 10, text: 'Content' },
      ]

      const chunks = useCase.execute(segments)

      // Primeiro chunk: 0-30s (3 segmentos)
      expect(chunks[0].startTime).toBe(0)
      expect(chunks[0].endTime).toBeLessThanOrEqual(35) // ~30s com tolerancia
    })

    it('should combine segment texts in each chunk', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 10, text: 'Hello' },
        { start: 10, duration: 10, text: 'World' },
      ]

      const chunks = useCase.execute(segments)

      expect(chunks[0].text).toBe('Hello World')
    })

    it('should generate unique IDs for each chunk', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 30, text: 'First' },
        { start: 30, duration: 30, text: 'Second' },
      ]

      const chunks = useCase.execute(segments)

      expect(chunks[0].id).toBeDefined()
      expect(chunks[1].id).toBeDefined()
      expect(chunks[0].id).not.toBe(chunks[1].id)
    })

    it('should assign sequential indexes', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 30, text: 'First' },
        { start: 30, duration: 30, text: 'Second' },
        { start: 60, duration: 30, text: 'Third' },
      ]

      const chunks = useCase.execute(segments)

      expect(chunks[0].index).toBe(0)
      expect(chunks[1].index).toBe(1)
      expect(chunks[2].index).toBe(2)
    })

    it('should handle empty segments array', () => {
      const useCase = new ChunkTranscriptUseCase()

      const chunks = useCase.execute([])

      expect(chunks).toEqual([])
    })

    it('should handle single segment', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 15, text: 'Single segment' },
      ]

      const chunks = useCase.execute(segments)

      expect(chunks).toHaveLength(1)
      expect(chunks[0].text).toBe('Single segment')
    })

    it('should respect custom target duration', () => {
      const useCase = new ChunkTranscriptUseCase()
      const segments: RawTranscriptSegment[] = [
        { start: 0, duration: 10, text: 'A' },
        { start: 10, duration: 10, text: 'B' },
        { start: 20, duration: 10, text: 'C' },
        { start: 30, duration: 10, text: 'D' },
      ]

      // Target: 15 segundos
      const chunks = useCase.execute(segments, 15)

      // Deveria ter mais chunks com duracao menor
      expect(chunks.length).toBeGreaterThan(1)
    })
  })
})
```

**DEPOIS - IMPLEMENTACAO:**

```typescript
// src/features/transcript/application/use-cases/chunk-transcript.ts
import { Chunk, type RawTranscriptSegment } from '../../domain'

/**
 * ChunkTranscriptUseCase
 *
 * Divides raw transcript segments into chunks of approximately
 * targetDuration seconds (default: 30s).
 *
 * PRE: segments is an array of RawTranscriptSegment (can be empty)
 * POST: Returns array of Chunk entities with sequential indexes
 */
export class ChunkTranscriptUseCase {
  private static readonly DEFAULT_TARGET_DURATION = 30 // seconds

  /**
   * Execute chunking algorithm
   *
   * @param segments - Raw transcript segments from YouTube
   * @param targetDuration - Target duration per chunk in seconds (default: 30)
   * @returns Array of Chunk entities
   */
  execute(
    segments: RawTranscriptSegment[],
    targetDuration: number = ChunkTranscriptUseCase.DEFAULT_TARGET_DURATION
  ): Chunk[] {
    if (segments.length === 0) {
      return []
    }

    const chunks: Chunk[] = []
    let currentTexts: string[] = []
    let currentStartTime = segments[0].start
    let currentEndTime = segments[0].start
    let chunkIndex = 0

    for (const segment of segments) {
      const segmentEndTime = segment.start + segment.duration
      const currentDuration = segmentEndTime - currentStartTime

      // Se adicionar este segmento exceder o target, finaliza chunk atual
      if (currentDuration > targetDuration && currentTexts.length > 0) {
        const chunk = this.createChunk(
          chunkIndex,
          currentStartTime,
          currentEndTime,
          currentTexts
        )
        chunks.push(chunk)

        // Inicia novo chunk
        chunkIndex++
        currentTexts = [segment.text]
        currentStartTime = segment.start
        currentEndTime = segmentEndTime
      } else {
        // Adiciona ao chunk atual
        currentTexts.push(segment.text)
        currentEndTime = segmentEndTime
      }
    }

    // Finaliza ultimo chunk se tiver conteudo
    if (currentTexts.length > 0) {
      const chunk = this.createChunk(
        chunkIndex,
        currentStartTime,
        currentEndTime,
        currentTexts
      )
      chunks.push(chunk)
    }

    return chunks
  }

  private createChunk(
    index: number,
    startTime: number,
    endTime: number,
    texts: string[]
  ): Chunk {
    const result = Chunk.create({
      id: crypto.randomUUID(),
      index,
      startTime,
      endTime,
      text: texts.join(' '),
    })

    // CRITICAL: Chunk.create() pode falhar, mas com nossos dados nao deve
    if (result.isFailure) {
      throw new Error(`Failed to create chunk: ${result.error.message}`)
    }

    return result.value
  }
}
```

### Task 3: Implementar FetchTranscriptUseCase (TDD)

**TESTE PRIMEIRO:**

```typescript
// tests/unit/features/transcript/application/fetch-transcript.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { FetchTranscriptUseCase } from '@/features/transcript/application/use-cases/fetch-transcript'
import { ChunkTranscriptUseCase } from '@/features/transcript/application/use-cases/chunk-transcript'
import { Result } from '@/shared/core/result'
import {
  Transcript,
  Chunk,
  VideoId,
  TranscriptFetchError,
  InvalidVideoUrlError,
  type TranscriptRepository,
  type TranscriptFetcher,
  type RawTranscript,
} from '@/features/transcript/domain'

// Mock implementations
const createMockRepository = (): TranscriptRepository => ({
  save: vi.fn().mockResolvedValue(undefined),
  findByVideoId: vi.fn().mockResolvedValue(null),
  exists: vi.fn().mockResolvedValue(false),
  deleteByVideoId: vi.fn().mockResolvedValue(undefined),
})

const createMockFetcher = (rawTranscript: RawTranscript): TranscriptFetcher => ({
  fetch: vi.fn().mockResolvedValue(Result.ok(rawTranscript)),
})

const createMockChunker = (): ChunkTranscriptUseCase => ({
  execute: vi.fn().mockImplementation((segments) => {
    // Criar chunks reais para os testes
    return segments.map((seg: any, i: number) =>
      Chunk.create({
        id: `chunk-${i}`,
        index: i,
        startTime: seg.start,
        endTime: seg.start + seg.duration,
        text: seg.text,
      }).value
    )
  }),
}) as unknown as ChunkTranscriptUseCase

const validRawTranscript: RawTranscript = {
  videoId: 'dQw4w9WgXcQ',
  title: 'Test Video',
  language: 'en',
  segments: [
    { start: 0, duration: 30, text: 'Hello world' },
    { start: 30, duration: 30, text: 'Testing transcript' },
  ],
}

describe('FetchTranscriptUseCase', () => {
  let repository: TranscriptRepository
  let fetcher: TranscriptFetcher
  let chunker: ChunkTranscriptUseCase
  let useCase: FetchTranscriptUseCase

  beforeEach(() => {
    repository = createMockRepository()
    fetcher = createMockFetcher(validRawTranscript)
    chunker = createMockChunker()
    useCase = new FetchTranscriptUseCase(repository, fetcher, chunker)
  })

  describe('execute', () => {
    it('should return cached transcript if exists (cache HIT)', async () => {
      // Arrange: Criar transcript cacheado
      const videoId = VideoId.fromId('dQw4w9WgXcQ').value
      const chunk = Chunk.create({
        id: 'chunk-1',
        index: 0,
        startTime: 0,
        endTime: 30,
        text: 'Cached content',
      }).value

      const cachedTranscript = Transcript.create({
        id: 'transcript-1',
        videoId,
        title: 'Cached Video',
        language: 'en',
        chunks: [chunk],
      }).value

      // Mock repository para retornar transcricao cacheada
      ;(repository.findByVideoId as any).mockResolvedValue(cachedTranscript)

      // Act
      const result = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      // Assert
      expect(result.isSuccess).toBe(true)
      if (result.isSuccess) {
        expect(result.value.id).toBe('transcript-1')
        expect(result.value.title).toBe('Cached Video')
      }

      // Fetcher NAO deve ser chamado (cache HIT)
      expect(fetcher.fetch).not.toHaveBeenCalled()
      expect(repository.save).not.toHaveBeenCalled()
    })

    it('should fetch from YouTube and cache if not cached (cache MISS)', async () => {
      // Arrange: Repository retorna null (cache miss)
      ;(repository.findByVideoId as any).mockResolvedValue(null)

      // Act
      const result = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      // Assert
      expect(result.isSuccess).toBe(true)
      expect(fetcher.fetch).toHaveBeenCalled()
      expect(repository.save).toHaveBeenCalled()
    })

    it('should fail for invalid URL', async () => {
      const result = await useCase.execute('invalid-url')

      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('InvalidVideoUrlError')
      }
    })

    it('should propagate error from YouTube fetcher', async () => {
      ;(repository.findByVideoId as any).mockResolvedValue(null)
      ;(fetcher.fetch as any).mockResolvedValue(
        Result.fail(new TranscriptFetchError('dQw4w9WgXcQ', 'Video unavailable'))
      )

      const result = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('TranscriptFetchError')
      }
    })

    it('should use chunker to divide segments', async () => {
      ;(repository.findByVideoId as any).mockResolvedValue(null)

      await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      expect(chunker.execute).toHaveBeenCalledWith(validRawTranscript.segments)
    })

    it('should generate unique transcript ID', async () => {
      ;(repository.findByVideoId as any).mockResolvedValue(null)

      const result1 = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      // Reset mocks e executar novamente
      vi.clearAllMocks()
      ;(repository.findByVideoId as any).mockResolvedValue(null)

      const result2 = await useCase.execute('https://youtu.be/dQw4w9WgXcQ')

      if (result1.isSuccess && result2.isSuccess) {
        expect(result1.value.id).not.toBe(result2.value.id)
      }
    })
  })
})
```

**DEPOIS - IMPLEMENTACAO:**

```typescript
// src/features/transcript/application/use-cases/fetch-transcript.ts
import { Result } from '@/shared/core/result'
import {
  Transcript,
  VideoId,
  InvalidVideoUrlError,
  TranscriptFetchError,
  TranscriptValidationError,
  type TranscriptRepository,
  type TranscriptFetcher,
} from '../../domain'
import { ChunkTranscriptUseCase } from './chunk-transcript'

/**
 * FetchTranscriptUseCase Errors
 */
export type FetchTranscriptError =
  | InvalidVideoUrlError
  | TranscriptFetchError
  | TranscriptValidationError

/**
 * FetchTranscriptUseCase
 *
 * Orchestrates transcript fetching with cache-first strategy:
 * 1. Check cache (PostgreSQL)
 * 2. If miss, fetch from YouTube
 * 3. Chunk the transcript
 * 4. Save to cache
 * 5. Return transcript
 *
 * PRE: videoUrl is a string (not necessarily valid)
 * POST: Returns Transcript or specific error
 * ERRORS: InvalidVideoUrlError, TranscriptFetchError, TranscriptValidationError
 */
export class FetchTranscriptUseCase {
  constructor(
    private readonly transcriptRepo: TranscriptRepository,
    private readonly transcriptFetcher: TranscriptFetcher,
    private readonly chunker: ChunkTranscriptUseCase
  ) {}

  /**
   * Execute the use case
   *
   * @param videoUrl - YouTube video URL
   * @returns Result with Transcript or error
   */
  async execute(videoUrl: string): Promise<Result<Transcript, FetchTranscriptError>> {
    // 1. Extract VideoId from URL
    const videoIdResult = VideoId.fromUrl(videoUrl)
    if (videoIdResult.isFailure) {
      return Result.fail(videoIdResult.error)
    }
    const videoId = videoIdResult.value

    // 2. Check cache (PostgreSQL)
    const cached = await this.transcriptRepo.findByVideoId(videoId)
    if (cached) {
      return Result.ok(cached) // Cache HIT
    }

    // 3. Fetch from YouTube (cache MISS)
    const fetchResult = await this.transcriptFetcher.fetch(videoId)
    if (fetchResult.isFailure) {
      return Result.fail(fetchResult.error)
    }
    const rawTranscript = fetchResult.value

    // 4. Chunk the transcript
    const chunks = this.chunker.execute(rawTranscript.segments)

    // 5. Validate: must have at least one chunk
    if (chunks.length === 0) {
      return Result.fail(
        new TranscriptValidationError('chunks', 'Transcript has no content')
      )
    }

    // 6. Create Transcript entity
    const transcriptResult = Transcript.create({
      id: crypto.randomUUID(),
      videoId,
      title: rawTranscript.title || `Video ${videoId.value}`,
      language: rawTranscript.language,
      chunks,
    })

    if (transcriptResult.isFailure) {
      return Result.fail(transcriptResult.error)
    }

    // 7. Save to cache (PostgreSQL)
    await this.transcriptRepo.save(transcriptResult.value)

    return Result.ok(transcriptResult.value)
  }
}
```

### Task 4: Criar barrel exports

```typescript
// src/features/transcript/application/use-cases/index.ts
export { ChunkTranscriptUseCase } from './chunk-transcript'
export { FetchTranscriptUseCase } from './fetch-transcript'
export type { FetchTranscriptError } from './fetch-transcript'
```

### Task 5: Criar index da application layer

```typescript
// src/features/transcript/application/index.ts
export * from './use-cases'
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Rodar linting e formatacao
pnpm lint
pnpm format:check

# Esperado: Sem erros. Se houver, corrigir.
```

### Level 2: Type Check

```bash
# Verificar tipos
pnpm type-check

# Esperado: Sem erros de tipo
```

### Level 3: Unit Tests (TDD)

```bash
# Rodar testes de application layer
pnpm test tests/unit/features/transcript/application/

# Rodar com cobertura
pnpm test:coverage -- --coverage.include="src/features/transcript/application/**"

# Esperado:
# - Todos os testes passam
# - Cobertura >= 80%
```

### Level 4: Integration Tests

```bash
# Testes ja existentes de infraestrutura devem continuar passando
pnpm test tests/integration/features/transcript/

# Esperado: Todos passam
```

### Level 5: Build

```bash
# Build completo
pnpm build

# Esperado: Build sucesso sem erros
```

---

## Final Validation Checklist

- [ ] `pnpm lint` passa sem erros
- [ ] `pnpm type-check` passa sem erros
- [ ] `pnpm test tests/unit/features/transcript/application/` passa
- [ ] Cobertura de testes >= 80% em application layer
- [ ] `pnpm build` sucesso
- [ ] ChunkTranscriptUseCase divide em chunks de ~30s
- [ ] FetchTranscriptUseCase verifica cache primeiro
- [ ] FetchTranscriptUseCase retorna do cache se existir (cache HIT)
- [ ] FetchTranscriptUseCase busca do YouTube se cache miss
- [ ] FetchTranscriptUseCase salva no cache apos buscar
- [ ] Result pattern usado para tratamento de erros
- [ ] Interfaces de domain usadas (nao implementacoes)

---

## Anti-Patterns to Avoid

- **NAO** importar PrismaClient ou YouTubeTranscriptService diretamente
- **NAO** usar `any` type - usar tipos do domain
- **NAO** esquecer de verificar Result.isFailure antes de acessar value
- **NAO** criar chunks sem ID unico (crypto.randomUUID())
- **NAO** esquecer de salvar no cache apos fetch bem-sucedido
- **NAO** chamar YouTube quando cache HIT
- **NAO** retornar Transcript vazio (sem chunks)
- **NAO** pular testes - TDD e obrigatorio para application layer
- **NAO** catch generico - propagar erros tipados
- **NAO** esquecer de exportar em index.ts

---

## Dependencies

```yaml
Depende de:
  - T-004: Domain entities (Transcript, Chunk, VideoId) [CONCLUIDA]
  - T-005: YouTubeTranscriptService (TranscriptFetcher) [CONCLUIDA]
  - T-006: PrismaTranscriptRepository (TranscriptRepository) [CONCLUIDA]

Dependencias existentes no projeto:
  - src/shared/core/result.ts (Result pattern)
  - crypto.randomUUID() (Node.js 16+)
```

---

## Notes

- TDD recomendado: escrever teste ANTES do codigo
- Use case nao sabe detalhes de implementacao (Prisma, YouTube API)
- Injecao de dependencias via construtor
- Cache strategy: cache-first (verificar banco antes de buscar API)
- youtube-transcript nao retorna titulo - usar fallback

---

*PRP gerado pelo Context Engineering Framework v2.0*
*Tarefa: T-007 - Application - FetchTranscriptUseCase*
*Nota de confianca: 9/10*
