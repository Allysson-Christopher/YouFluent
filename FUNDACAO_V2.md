# YouFluent 2.0 - Decisoes de Fundacao

**Data:** 2026-01-02
**Status:** Aprovado
**Contexto:** Migracao do prototipo HTML/Flask para stack profissional

---

## 1. Resumo Executivo

Este documento define as decisoes tecnicas para converter o YouFluent de um prototipo (HTML + Flask + Python) para uma aplicacao profissional usando Next.js, TypeScript e React.

### Perfil do Projeto
- **Desenvolvedor:** Solo (com Claude Code escrevendo 100% do codigo)
- **Objetivo:** App para aprender ingles atraves de videos do YouTube
- **Escopo desta fase:** Fundacao tecnica (nao inclui features novas)

---

## 2. Decisoes de Stack

### 2.1 Estrutura do Projeto

| Decisao | Escolha | Justificativa |
|---------|---------|---------------|
| Organizacao | **Monorepo** | Frontend e backend no mesmo repo, usando Next.js API Routes |
| Backend | **Migrar para TypeScript** | Reescrever APIs Flask em Next.js API Routes + Server Actions |
| Router | **App Router** | Server Components, layouts aninhados, padrao moderno |
| Componentes | **Server-first** | Server Components por padrao; `"use client"` apenas quando necessario |

### 2.2 Frontend

| Categoria | Tecnologia | Versao | Notas |
|-----------|------------|--------|-------|
| Framework | Next.js | **16.1.1+** | Turbopack padrao, React Compiler estavel |
| UI Library | React | 19.2.x | View Transitions, Activity, useEffectEvent |
| Estilizacao | Tailwind CSS | v4.x | CSS-first config, sem tailwind.config.js |
| Componentes | shadcn/ui | 2.5.x | Compativel com React 19 e Tailwind v4 |
| Estado | Zustand | 5.x | Leve, sem boilerplate - usado para TODO o estado |
| Validacao | Zod | latest | Validacao de inputs em API Routes e forms |

### 2.3 Backend

| Categoria | Tecnologia | Versao | Notas |
|-----------|------------|--------|-------|
| Runtime | Node.js | **20.19+** | Exigido pelo Prisma 7 |
| TypeScript | TypeScript | **5.9.x** | Minimo 5.4 para Prisma 7 |
| API | Next.js API Routes | - | Server Actions para mutacoes simples |
| Database | PostgreSQL | 16.x | Robusto, suporta JSON |
| DB Local | Docker Compose | - | Container isolado para desenvolvimento |
| ORM | Prisma | **7.x** | Arquitetura Rust-free, requer Driver Adapters |
| ORM Adapter | @prisma/adapter-pg | latest | Obrigatorio para Prisma 7 |
| DB Driver | pg | latest | Driver PostgreSQL para Node.js |
| AI | OpenAI SDK | 6.1.x | SDK oficial Node.js |

### 2.4 Transcricao YouTube

| Categoria | Tecnologia | Notas |
|-----------|------------|-------|
| Biblioteca | youtube-transcript | Pacote npm (substitui youtube-transcript-api Python) |
| Cache | PostgreSQL | Transcricoes salvas no banco apos primeira busca |
| Alternativa | Playwright + scraping | Fallback se API unofficial quebrar |

### 2.5 Testes

| Tipo | Tecnologia | Versao | Notas |
|------|------------|--------|-------|
| Unit/Integration | Vitest | **3.0.5+** | OBRIGATORIO versao patcheada (CVE-2025-24964) |
| Components | Testing Library | 16.3.x | @testing-library/react |
| E2E | Playwright | **1.55.1+** | Recomendado versao patcheada (CVE-2025-59288) |
| DB Integration | Testcontainers | latest | PostgreSQL real em Docker para testes |
| API Mocking | MSW | 2.x | Mock Service Worker para OpenAI/YouTube |
| Cobertura | @vitest/coverage-v8 | latest | Cobertura por camada |

#### Estrategia de TDD por Camada

| Camada | TDD | Cobertura | Ferramentas |
|--------|-----|-----------|-------------|
| **Domain** | Obrigatorio | 100% | Vitest apenas |
| **Application** | Recomendado | 80-90% | Vitest + mocks |
| **Infrastructure** | Parcial | 60-80% | Vitest + Testcontainers + MSW |
| **Presentation** | Nao | E2E apenas | Playwright |

#### Fluxo TDD

```
1. Domain/Application:
   RED (escrever teste) → GREEN (codigo minimo) → REFACTOR

2. Infrastructure:
   Implementar → Testar com DB real (Testcontainers)

3. Presentation:
   Implementar → E2E para fluxo critico apenas
```

> Ver ADR completo: `context/ARQUITETURA/decisoes/adr-005-testing-strategy.md`

### 2.6 Infraestrutura

| Categoria | Decisao | Notas |
|-----------|---------|-------|
| Autenticacao | Nenhuma por agora | Foco na funcionalidade primeiro |
| Deploy | A definir | Configurar local primeiro |
| CI/CD | A definir | Prioridade apos MVP funcional |

### 2.7 O que NAO usamos (e por que)

| Tecnologia | Motivo |
|------------|--------|
| tRPC | Server Components + Server Actions + Zod ja oferecem type-safety suficiente |
| React Query / SWR | Server Components fazem fetch no servidor; Zustand para estado local |
| Prefixo "I" em interfaces | Convencao TypeScript moderna nao usa prefixo |

---

## 3. Verificacao de Seguranca

### 3.1 Vulnerabilidades Conhecidas

| Biblioteca | CVE | CVSS | Descricao | Acao |
|------------|-----|------|-----------|------|
| Next.js 15.x | CVE-2025-55182 | 10.0 CRITICAL | React2Shell - RCE via RSC | Corrigido no 16.x |
| Next.js 15.x | CVE-2025-66478 | 10.0 CRITICAL | Relacionado ao RSC | Corrigido no 16.x |
| Vitest | CVE-2025-24964 | **9.6 CRITICAL** | RCE via WebSocket hijacking | Usar 3.0.5+ |
| Playwright | CVE-2025-59288 | 5.3 Medium | SSL cert bypass em downloads | Usar 1.55.1+ |

> **Nota:** Usando Next.js 16.1.1+, os CVEs criticos do Next.js 15 nao se aplicam.

### 3.2 Bibliotecas Verificadas (Sem CVEs Criticos)

| Biblioteca | Status | Fonte |
|------------|--------|-------|
| Next.js 16.x | Seguro | Versao mais recente |
| Prisma 7.x | Seguro | Snyk - sem CVEs diretos |
| Zustand 5.x | Seguro | Sem CVEs conhecidos |
| Zod | Seguro | Sem CVEs conhecidos |
| shadcn/ui | Seguro | Componentes client-side |
| OpenAI SDK | Seguro | Sem CVEs no SDK Node.js |
| Tailwind v4 | Seguro | Sem CVEs conhecidos |

### 3.3 Matriz de Compatibilidade Verificada

| Dependencia A | Dependencia B | Status |
|---------------|---------------|--------|
| Next.js 16.1.1 | React 19.2.x | Compativel |
| Next.js 16.1.1 | Tailwind v4 | Compativel |
| Next.js 16.1.1 | Turbopack | Padrao (estavel) |
| shadcn/ui 2.5 | React 19 | Compativel |
| shadcn/ui 2.5 | Tailwind v4 | Compativel |
| Prisma 7.x | PostgreSQL 16 | Compativel (requer adapter) |
| Prisma 7.x | Node.js 20.19+ | Compativel |
| Zustand 5.x | React 19 | Compativel |
| Vitest 3.x | React 19 | Compativel |

---

## 4. Arquitetura de Codigo

### 4.1 Padrao Escolhido: Feature-Clean Architecture

Combinacao de **Feature-Based** (organizacao por dominio) com **Clean Architecture** (separacao de camadas dentro de cada feature).

### 4.2 Estrutura de Pastas

```
src/
├── app/                          # Next.js App Router (APENAS rotas)
│   ├── (public)/                 # Grupo: rotas publicas
│   │   ├── page.tsx              # Home
│   │   └── layout.tsx
│   ├── (app)/                    # Grupo: rotas da aplicacao
│   │   ├── lesson/[id]/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── api/                      # API Routes
│   │   ├── transcript/
│   │   │   └── [videoId]/route.ts
│   │   └── lesson/
│   │       └── generate/route.ts
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Tailwind imports
│
├── features/                     # CORE: Organizado por dominio
│   │
│   ├── lesson/                   # Feature: Licoes de Ingles
│   │   ├── domain/               # Regras de negocio PURAS
│   │   │   ├── entities/
│   │   │   │   ├── lesson.ts           # Entidade Lesson
│   │   │   │   ├── exercise.ts         # Entidade Exercise
│   │   │   │   └── vocabulary.ts       # Entidade Vocabulary
│   │   │   └── interfaces/
│   │   │       └── lesson-repository.ts # Interface ILessonRepository
│   │   │
│   │   ├── application/          # Casos de uso (orquestra dominio)
│   │   │   └── use-cases/
│   │   │       ├── generate-lesson.ts  # GenerateLessonUseCase
│   │   │       ├── get-lesson.ts       # GetLessonUseCase
│   │   │       └── save-progress.ts    # SaveProgressUseCase
│   │   │
│   │   ├── infrastructure/       # Implementacoes concretas
│   │   │   ├── repositories/
│   │   │   │   └── prisma-lesson-repository.ts
│   │   │   └── services/
│   │   │       └── openai-lesson-generator.ts
│   │   │
│   │   └── presentation/         # UI da feature
│   │       ├── components/
│   │       │   ├── lesson-card.tsx
│   │       │   ├── exercise-panel.tsx
│   │       │   └── vocabulary-list.tsx
│   │       └── hooks/
│   │           ├── use-lesson.ts
│   │           └── use-exercise.ts
│   │
│   ├── player/                   # Feature: Player YouTube
│   │   ├── domain/
│   │   │   └── entities/
│   │   │       └── video-chunk.ts
│   │   ├── application/
│   │   │   └── use-cases/
│   │   │       └── sync-player-with-lesson.ts
│   │   ├── infrastructure/
│   │   │   └── services/
│   │   │       └── youtube-player-adapter.ts
│   │   └── presentation/
│   │       ├── components/
│   │       │   ├── video-player.tsx
│   │       │   └── chunk-navigator.tsx
│   │       └── hooks/
│   │           └── use-player.ts
│   │
│   └── transcript/               # Feature: Transcricoes
│       ├── domain/
│       │   └── entities/
│       │       ├── transcript.ts
│       │       └── chunk.ts
│       ├── application/
│       │   └── use-cases/
│       │       ├── fetch-transcript.ts
│       │       └── chunk-transcript.ts
│       ├── infrastructure/
│       │   └── services/
│       │       └── youtube-transcript-service.ts
│       └── presentation/
│           ├── components/
│           │   └── transcript-viewer.tsx
│           └── hooks/
│               └── use-transcript.ts
│
├── shared/                       # Codigo compartilhado entre features
│   ├── components/
│   │   └── ui/                   # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── prisma.ts             # Prisma client singleton
│   │   ├── openai.ts             # OpenAI client config
│   │   └── utils.ts              # Utilidades gerais (cn, formatters)
│   ├── hooks/
│   │   └── use-local-storage.ts
│   ├── types/
│   │   └── index.ts              # Types globais
│   └── config/
│       └── constants.ts          # Constantes da aplicacao
│
├── prisma/
│   ├── schema.prisma             # Schema do banco
│   └── migrations/
│
└── tests/
    ├── unit/
    │   └── features/
    │       ├── lesson/
    │       ├── player/
    │       └── transcript/
    ├── integration/
    │   └── api/
    └── e2e/
        └── lesson-flow.spec.ts
```

### 4.3 Regras de Dependencia

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   app/ ──► features/presentation ──► features/application       │
│                                              │                   │
│                                              ▼                   │
│                                       features/domain            │
│                                              ▲                   │
│                                              │                   │
│                              features/infrastructure             │
│                                                                  │
│   Regras:                                                        │
│   • domain: ZERO dependencias externas                          │
│   • application: depende apenas de domain                       │
│   • infrastructure: implementa interfaces do domain             │
│   • presentation: usa application, nunca domain direto          │
│   • app/: apenas orquestra, importa de presentation             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.4 Convencoes de Nomenclatura

| Tipo | Convencao | Exemplo |
|------|-----------|---------|
| Entidades | PascalCase | `Lesson`, `VideoChunk` |
| Interfaces | PascalCase (sem prefixo) | `LessonRepository` |
| Implementacoes | Prefixo descritivo | `PrismaLessonRepository` |
| Use Cases | Verbo + Substantivo | `GenerateLessonUseCase` |
| Componentes | PascalCase | `LessonCard.tsx` |
| Hooks | use + Nome | `useLesson.ts` |
| Arquivos | kebab-case | `lesson-card.tsx` |
| Pastas | kebab-case | `use-cases/` |
| Stores (Zustand) | use + Nome + Store | `useLessonStore` |

---

## 5. Ambiente de Desenvolvimento Local

### 5.1 Docker Compose para PostgreSQL

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16
    container_name: youfluent-db
    restart: unless-stopped
    environment:
      POSTGRES_USER: youfluent
      POSTGRES_PASSWORD: youfluent_dev
      POSTGRES_DB: youfluent
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 5.2 Variaveis de Ambiente

```bash
# .env.local
DATABASE_URL="postgresql://youfluent:youfluent_dev@localhost:5432/youfluent"
OPENAI_API_KEY="sk-..."
```

### 5.3 Comandos de Desenvolvimento

```bash
# Subir banco de dados
docker compose up -d

# Verificar status
docker compose ps

# Ver logs
docker compose logs -f db

# Parar banco
docker compose down

# Resetar banco (apaga dados)
docker compose down -v
```

---

## 6. Proximos Passos

### Fase 1: Setup do Projeto
1. [ ] Criar projeto Next.js 16.1.1+ com TypeScript
2. [ ] Configurar Docker Compose para PostgreSQL
3. [ ] Configurar Tailwind v4 + shadcn/ui
4. [ ] Configurar Prisma 7 com Driver Adapter
5. [ ] Estruturar pastas conforme arquitetura
6. [ ] Configurar ESLint + Prettier
7. [ ] Configurar Zod para validacao

### Fase 2: Migracao do Core
1. [ ] Migrar logica de transcricao (Python → TypeScript)
2. [ ] Implementar cache de transcricoes no PostgreSQL
3. [ ] Migrar integracao OpenAI
4. [ ] Criar entidades do dominio
5. [ ] Implementar API Routes + Server Actions

### Fase 3: UI
1. [ ] Recriar interface com shadcn/ui
2. [ ] Implementar player YouTube
3. [ ] Configurar Zustand stores
4. [ ] Conectar UI com API

### Fase 4: Testes (TDD)
1. [ ] Configurar Vitest 3.0.5+ com coverage thresholds
2. [ ] Configurar Testcontainers para PostgreSQL
3. [ ] Configurar MSW para mocking de APIs externas
4. [ ] Configurar Playwright 1.55.1+
5. [ ] Escrever testes unitarios do dominio (TDD - 100% cobertura)
6. [ ] Escrever testes de integration para repositories
7. [ ] Escrever testes E2E do fluxo critico (URL → Licao)

---

## 7. Referencias

### Documentacao Oficial
- [Next.js 16 Docs](https://nextjs.org/docs)
- [Next.js 16 Release Notes](https://nextjs.org/blog/next-16)
- [Prisma 7 Docs](https://www.prisma.io/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS v4](https://tailwindcss.com/docs)
- [Zustand](https://github.com/pmndrs/zustand)
- [Zod](https://zod.dev)

### Seguranca
- [Next.js Security Update Dec 2025](https://nextjs.org/blog/security-update-2025-12-11)
- [Vitest CVE-2025-24964](https://www.cve.news/cve-2025-24964/)
- [NVD - National Vulnerability Database](https://nvd.nist.gov/)
- [Snyk Vulnerability DB](https://security.snyk.io/)

### Arquitetura
- [Clean Architecture - Uncle Bob](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Next.js Clean Architecture Example](https://github.com/nikolovlazar/nextjs-clean-architecture)

---

## 8. Historico

| Versao | Data | Mudancas |
|--------|------|----------|
| 1.0 | 2026-01-02 | Documento inicial - Decisoes de fundacao |
| 2.0 | 2026-01-02 | Atualizacao para Next.js 16.1.1, Prisma 7, adicao de Docker Compose, Zod, decisoes de arquitetura |

---

*Documento gerado com Claude Code*
