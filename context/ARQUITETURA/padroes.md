# Padroes de Arquitetura

> **Padroes obrigatorios conforme PILARES.md**

---

## DDD - Domain-Driven Design

### Estrutura de Dominio (por Feature)

```
features/{feature}/domain/
├── entities/          # Entidades com identidade
├── value-objects/     # Objetos imutaveis sem identidade
├── interfaces/        # Interfaces (ports) para repositorios
└── errors/            # Erros tipados do dominio
```

### Regras

1. **Entidades** tem identidade unica e ciclo de vida
2. **Value Objects** sao imutaveis e comparados por valor
3. **Interfaces** sao definidas no dominio, implementadas na infra
4. **Domain tem ZERO dependencias externas** (nem React, nem Prisma, nem Zod)

### Linguagem Ubiqua (YouFluent)

| Termo | Definicao no Dominio |
|-------|---------------------|
| Lesson | Licao gerada por IA para um chunk |
| Chunk | Segmento de ~30s de um video |
| Transcript | Transcricao completa de um video |
| Exercise | Exercicio de pratica (multipla escolha, etc) |
| Vocabulary | Item de vocabulario com definicao e exemplo |

---

## Clean Architecture

### Camadas e Dependencias

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   presentation ──► application ──► domain ◄── infrastructure    │
│        │                            ▲                            │
│        │                            │                            │
│        └────────────────────────────┘                            │
│              Dependencias apontam para DENTRO                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Regras de Dependencia

| Camada | Pode Depender De | NAO Pode Depender De |
|--------|------------------|---------------------|
| domain | Nada (0 deps externas) | application, infra, presentation |
| application | domain | infrastructure, presentation |
| infrastructure | domain, application | presentation |
| presentation | application | domain direto*, infrastructure |

> *Excecao: presentation pode importar TIPOS do domain para tipagem TypeScript

### Estrutura por Feature

```
features/lesson/
├── domain/               # Regras de negocio puras
│   ├── entities/
│   │   └── lesson.ts     # class Lesson { ... }
│   ├── interfaces/
│   │   └── lesson-repository.ts  # interface LessonRepository
│   └── errors/
│       └── lesson-errors.ts
│
├── application/          # Casos de uso
│   └── use-cases/
│       ├── generate-lesson.ts    # GenerateLessonUseCase
│       └── get-lesson.ts
│
├── infrastructure/       # Implementacoes concretas
│   ├── repositories/
│   │   └── prisma-lesson-repository.ts
│   └── services/
│       └── openai-lesson-generator.ts
│
└── presentation/         # UI
    ├── components/
    │   └── lesson-card.tsx
    └── hooks/
        └── use-lesson.ts
```

---

## TDD - Test-Driven Development

### Ciclo

```
RED ──► GREEN ──► REFACTOR ──► (repeat)
```

1. **RED**: Escrever teste que falha
2. **GREEN**: Codigo minimo para passar
3. **REFACTOR**: Melhorar mantendo testes verdes

### Cobertura por Camada

| Camada | Cobertura Minima | Tipo de Teste |
|--------|------------------|---------------|
| domain | 100% | Unit |
| application | 90% | Unit |
| infrastructure | 80% | Integration |
| presentation | E2E criticos | E2E |

### Estrutura de Testes

```
tests/
├── unit/
│   └── features/
│       ├── lesson/
│       │   ├── domain/
│       │   └── application/
│       ├── player/
│       └── transcript/
├── integration/
│   └── api/
└── e2e/
    └── lesson-flow.spec.ts
```

### Comandos

```bash
# Unit tests
pnpm test

# Com coverage
pnpm test:coverage

# Integration tests
pnpm test:integration

# E2E tests
pnpm test:e2e

# Todos (CI)
pnpm test:all
```

---

## Server-first (Next.js 16)

### Regra Geral

- **Server Components** sao o padrao (sem marcacao)
- **Client Components** apenas quando necessario (`"use client"`)

### Quando usar Client Components

| Use Client | Exemplo |
|------------|---------|
| Hooks (useState, useEffect) | Estado local, side effects |
| Event handlers (onClick) | Interatividade |
| Browser APIs | localStorage, window |
| Bibliotecas client-only | YouTube IFrame API |

### Exemplo

```tsx
// Server Component (padrao) - busca dados
// app/(app)/lesson/[id]/page.tsx
async function LessonPage({ params }) {
  const lesson = await getLesson(params.id)  // Executa no servidor
  return <LessonViewer lesson={lesson} />
}

// Client Component - interatividade
// features/player/presentation/components/video-player.tsx
"use client"
import { useState } from 'react'

function VideoPlayer({ videoId }) {
  const [isPlaying, setIsPlaying] = useState(false)
  // ...
}
```

---

## Convencoes de Nomenclatura

| Tipo | Convencao | Exemplo |
|------|-----------|---------|
| Entidades | PascalCase | `Lesson`, `VideoChunk` |
| Interfaces | PascalCase (sem prefixo) | `LessonRepository` |
| Implementacoes | Prefixo descritivo | `PrismaLessonRepository` |
| Use Cases | Verbo + Substantivo | `GenerateLessonUseCase` |
| Componentes | PascalCase | `LessonCard` |
| Hooks | use + Nome | `useLesson` |
| Arquivos | kebab-case | `lesson-card.tsx` |
| Stores | use + Nome + Store | `useLessonStore` |

---

*Baseado em: docs/PILARES.md e FUNDACAO_V2.md*
*Atualizado em: 2026-01-02*
