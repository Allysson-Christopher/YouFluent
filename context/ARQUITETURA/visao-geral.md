# Visao Geral da Arquitetura

---

## Diagrama de Contexto (C4 - Nivel 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                         SISTEMA: YouFluent                       │
│                                                                  │
│  ┌──────────┐       ┌─────────────────┐       ┌──────────┐     │
│  │ Usuario  │──────►│   YouFluent     │◄─────►│ YouTube  │     │
│  │ (Browser)│       │   Web App       │       │ API      │     │
│  └──────────┘       └─────────────────┘       └──────────┘     │
│                              │                                   │
│                              │                 ┌──────────┐     │
│                              │◄───────────────►│ OpenAI   │     │
│                              │                 │ API      │     │
│                              ▼                 └──────────┘     │
│                     ┌──────────────┐                            │
│                     │ PostgreSQL   │                            │
│                     │ (Docker)     │                            │
│                     └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

**Atores:**
- **Usuario (Browser)**: Estudante de ingles que acessa via navegador web
- **YouTube API**: Fonte de transcricoes de videos (via youtube-transcript)
- **OpenAI API**: Geracao de licoes, vocabulario e exercicios

---

## Diagrama de Containers (C4 - Nivel 2)

```
┌────────────────────────────────────────────────────────────────────┐
│                            YouFluent                                │
│                                                                     │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    Next.js 16 Application                    │  │
│   │  ┌─────────────┐    ┌─────────────┐    ┌─────────────────┐  │  │
│   │  │   React     │    │   API       │    │   Server        │  │  │
│   │  │   Client    │───►│   Routes    │    │   Actions       │  │  │
│   │  │  Components │    │             │    │                 │  │  │
│   │  │ (Browser)   │    │ (Node.js)   │    │ (Node.js)       │  │  │
│   │  └─────────────┘    └──────┬──────┘    └────────┬────────┘  │  │
│   │                            │                     │           │  │
│   │              ┌─────────────┴─────────────────────┘           │  │
│   │              ▼                                               │  │
│   │      ┌───────────────────────────────────────────┐          │  │
│   │      │              Features Layer                │          │  │
│   │      │  ┌─────────┐ ┌─────────┐ ┌─────────────┐  │          │  │
│   │      │  │ Lesson  │ │ Player  │ │ Transcript  │  │          │  │
│   │      │  └─────────┘ └─────────┘ └─────────────┘  │          │  │
│   │      └───────────────────────────────────────────┘          │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                              │                                      │
│              ┌───────────────┴───────────────┐                     │
│              ▼                               ▼                     │
│      ┌───────────┐                   ┌───────────┐                │
│      │PostgreSQL │                   │  OpenAI   │                │
│      │ (Docker)  │                   │   API     │                │
│      └───────────┘                   └───────────┘                │
└────────────────────────────────────────────────────────────────────┘
```

### Containers

| Container | Tecnologia | Responsabilidade | Comunicacao |
|-----------|------------|------------------|-------------|
| React Client | React 19 + Tailwind | UI interativa, player | HTTP/WebSocket |
| API Routes | Next.js 16 | Endpoints REST | JSON |
| Server Actions | Next.js 16 | Mutacoes tipadas | RPC-like |
| PostgreSQL | Docker Compose | Persistencia | TCP/5432 |
| OpenAI | API externa | Geracao de conteudo | HTTPS |
| YouTube | API externa | Transcricoes | HTTPS |

---

## Fluxo de Dados Principal

### Fluxo: Usuario processa novo video

```
┌────────┐     ┌──────────┐     ┌─────────────┐     ┌──────────┐
│Usuario │     │ Frontend │     │   Backend   │     │ External │
└───┬────┘     └────┬─────┘     └──────┬──────┘     └────┬─────┘
    │               │                   │                 │
    │ Cola URL      │                   │                 │
    │──────────────►│                   │                 │
    │               │ POST /transcript  │                 │
    │               │──────────────────►│                 │
    │               │                   │ Check cache     │
    │               │                   │────────────────►│ DB
    │               │                   │◄────────────────│
    │               │                   │                 │
    │               │                   │ [Se nao cached] │
    │               │                   │────────────────►│ YouTube
    │               │                   │◄────────────────│
    │               │                   │                 │
    │               │                   │ Salva no cache  │
    │               │                   │────────────────►│ DB
    │               │                   │                 │
    │               │◄──────────────────│                 │
    │◄──────────────│                   │                 │
    │               │                   │                 │
    │ Clica "Gerar  │                   │                 │
    │    Licao"     │                   │                 │
    │──────────────►│                   │                 │
    │               │ POST /lesson      │                 │
    │               │──────────────────►│                 │
    │               │                   │────────────────►│ OpenAI
    │               │                   │◄────────────────│
    │               │◄──────────────────│                 │
    │◄──────────────│                   │                 │
```

---

## Estrutura de Features (Clean Architecture)

```
features/
├── lesson/
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── lesson.ts
│   │   │   ├── exercise.ts
│   │   │   └── vocabulary.ts
│   │   └── interfaces/
│   │       └── lesson-repository.ts
│   ├── application/
│   │   └── use-cases/
│   │       ├── generate-lesson.ts
│   │       └── get-lesson.ts
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   └── prisma-lesson-repository.ts
│   │   └── services/
│   │       └── openai-lesson-generator.ts
│   └── presentation/
│       ├── components/
│       │   ├── lesson-card.tsx
│       │   └── exercise-panel.tsx
│       └── hooks/
│           └── use-lesson.ts
│
├── player/
│   └── ... (mesma estrutura)
│
└── transcript/
    └── ... (mesma estrutura)
```

---

*Atualizado em: 2026-01-02*
