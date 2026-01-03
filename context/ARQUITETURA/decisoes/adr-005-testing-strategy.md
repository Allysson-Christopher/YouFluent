# ADR-005: Estratégia de Testes com TDD

**Status:** Accepted
**Data:** 2026-01-02
**Contexto:** Definição da estratégia de testes para YouFluent

---

## Contexto

O YouFluent precisa de uma estratégia de testes que:
- Suporte TDD onde aplicável
- Garanta qualidade sem overhead excessivo
- Seja pragmática para um MVP
- Permita desenvolvimento autônomo pelo Claude Code

## Decisão

Estratégia de testes em **4 camadas** com TDD adaptado por contexto.

## Estratégia por Camada

### 1. Domain Layer - TDD Obrigatório (100% cobertura)

| Aspecto | Decisão |
|---------|---------|
| Abordagem | TDD Clássico (Red → Green → Refactor) |
| Framework | Vitest |
| Cobertura | 100% obrigatório |
| Mocks | Nenhum (lógica pura) |

**O que testar:**
- Value Objects (VideoId, PlaybackRate)
- Entidades (Transcript, Lesson, Chunk)
- Regras de negócio (chunking, validações)
- Invariantes de domínio

```typescript
// Exemplo TDD - Domain
// 1. RED: Escrever teste que falha
describe('VideoId', () => {
  it('should extract ID from YouTube URL', () => {
    const videoId = VideoId.fromUrl('https://youtube.com/watch?v=abc123')
    expect(videoId.value).toBe('abc123')
  })

  it('should reject invalid URLs', () => {
    expect(() => VideoId.fromUrl('invalid')).toThrow(InvalidVideoUrlError)
  })
})

// 2. GREEN: Implementar código mínimo
// 3. REFACTOR: Melhorar mantendo testes verdes
```

### 2. Application Layer - TDD Recomendado (80-90% cobertura)

| Aspecto | Decisão |
|---------|---------|
| Abordagem | TDD para use cases, testes depois para DTOs |
| Framework | Vitest |
| Cobertura | 80-90% |
| Mocks | Interfaces de repositório e serviços externos |

**O que testar:**
- Use Cases (FetchTranscript, GenerateLesson)
- Fluxos de erro e edge cases
- Validação de input (Zod schemas)

```typescript
// Exemplo TDD - Application
describe('FetchTranscriptUseCase', () => {
  it('should return cached transcript if exists', async () => {
    const mockRepo = { findByVideoId: vi.fn().mockResolvedValue(cachedTranscript) }
    const useCase = new FetchTranscriptUseCase(mockRepo, mockFetcher)

    const result = await useCase.execute('abc123')

    expect(result).toEqual(cachedTranscript)
    expect(mockRepo.findByVideoId).toHaveBeenCalledWith('abc123')
  })
})
```

### 3. Infrastructure Layer - Testes de Integração (60-80% cobertura)

| Aspecto | Decisão |
|---------|---------|
| Abordagem | Integration tests com Testcontainers |
| Framework | Vitest + Testcontainers |
| Cobertura | 60-80% |
| Banco | PostgreSQL real via Docker |
| APIs externas | MSW (Mock Service Worker) |

**O que testar:**
- Repositories Prisma (queries reais)
- Integrações com APIs (YouTube, OpenAI via MSW)
- Cache hit/miss

```typescript
// Exemplo - Infrastructure com Testcontainers
import { PostgreSqlContainer } from '@testcontainers/postgresql'

describe('PrismaTranscriptRepository', () => {
  let container: StartedPostgreSqlContainer
  let prisma: PrismaClient

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start()
    prisma = new PrismaClient({
      datasources: { db: { url: container.getConnectionUri() } }
    })
    await prisma.$executeRaw`...migrations...`
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await container.stop()
  })

  it('should save and retrieve transcript', async () => {
    const repo = new PrismaTranscriptRepository(prisma)
    await repo.save(transcript)
    const found = await repo.findByVideoId('abc123')
    expect(found).toEqual(transcript)
  })
})
```

### 4. Presentation Layer - E2E Apenas (Sem TDD)

| Aspecto | Decisão |
|---------|---------|
| Abordagem | E2E para fluxo crítico apenas |
| Framework | Playwright |
| Cobertura | Fluxo crítico (URL → Lição) |
| Escopo MVP | 3-5 testes E2E |

**Fluxo crítico a testar:**
1. Usuário acessa página inicial
2. Cola URL do YouTube
3. Transcrição é carregada
4. Seleciona chunk
5. Lição é gerada

```typescript
// Exemplo - E2E com Playwright
test('complete lesson flow', async ({ page }) => {
  await page.goto('/')
  await page.fill('[data-testid="video-url"]', 'https://youtube.com/watch?v=abc123')
  await page.click('[data-testid="load-video"]')

  await expect(page.locator('[data-testid="transcript"]')).toBeVisible()

  await page.click('[data-testid="chunk-0"]')
  await page.click('[data-testid="generate-lesson"]')

  await expect(page.locator('[data-testid="lesson-content"]')).toBeVisible()
})
```

## Ferramentas Escolhidas

| Ferramenta | Uso |
|------------|-----|
| **Vitest** | Unit e Integration tests |
| **Testcontainers** | PostgreSQL para integration |
| **MSW** | Mock de APIs externas (OpenAI, YouTube) |
| **Playwright** | E2E tests |
| **@vitest/coverage-v8** | Cobertura de código |

## Estrutura de Diretórios

```
tests/
├── unit/                    # Testes de domínio e application
│   ├── domain/
│   │   ├── entities/
│   │   └── value-objects/
│   └── application/
│       └── use-cases/
├── integration/             # Testes com DB real
│   ├── repositories/
│   └── services/
├── e2e/                     # Playwright
│   └── flows/
├── mocks/                   # MSW handlers
│   ├── youtube.ts
│   └── openai.ts
└── setup/
    ├── testcontainers.ts
    └── msw-server.ts
```

## Configuração

### vitest.config.ts

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['tests/**', '**/*.d.ts'],
      thresholds: {
        'src/domain/**': { statements: 100, branches: 100 },
        'src/application/**': { statements: 80 },
        'src/infrastructure/**': { statements: 60 },
      }
    },
    setupFiles: ['tests/setup/msw-server.ts'],
  },
})
```

### MSW Setup

```typescript
// tests/mocks/youtube.ts
import { http, HttpResponse } from 'msw'

export const youtubeHandlers = [
  http.get('https://www.youtube.com/api/timedtext', () => {
    return HttpResponse.json({
      events: [
        { tStartMs: 0, dDurationMs: 5000, segs: [{ utf8: 'Hello world' }] }
      ]
    })
  })
]

// tests/mocks/openai.ts
export const openaiHandlers = [
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      choices: [{ message: { content: 'Generated lesson content' } }]
    })
  })
]
```

## Comandos de Validação

```bash
# Todos os testes
pnpm test

# Unit tests apenas (rápido, TDD)
pnpm test:unit

# Integration tests (requer Docker)
pnpm test:integration

# E2E tests (requer app rodando)
pnpm test:e2e

# Cobertura
pnpm test:coverage

# Watch mode para TDD
pnpm test:watch
```

## Métricas de Qualidade

| Camada | Cobertura Mínima | TDD |
|--------|------------------|-----|
| Domain | 100% | Obrigatório |
| Application | 80% | Recomendado |
| Infrastructure | 60% | Não |
| Presentation | N/A | Não |

## Fluxo TDD Recomendado

```
1. Antes de implementar qualquer código de Domain/Application:
   - Escrever teste que falha (RED)
   - Implementar código mínimo (GREEN)
   - Refatorar se necessário (REFACTOR)

2. Para Infrastructure:
   - Implementar primeiro
   - Adicionar testes de integração depois
   - Usar Testcontainers para DB real

3. Para Presentation:
   - Implementar componentes
   - Adicionar E2E apenas para fluxo crítico
```

## Notas

- Testcontainers requer Docker rodando
- MSW intercepta requests HTTP automaticamente
- E2E tests são lentos - rodar apenas em CI ou antes de PR
- Coverage thresholds são por diretório no Vitest

---

*ADR criada para o Context Engineering Framework*
