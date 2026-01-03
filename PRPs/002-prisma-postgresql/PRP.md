# PRP: Setup Prisma 7 + PostgreSQL + Docker Compose

---

## Input Summary

**Modo:** AUTO
**Tarefa:** T-002 - Setup Prisma 7 + PostgreSQL + Docker Compose
**Origem:** context/TASKS/T-002.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/stack.md
- context/ARQUITETURA/decisoes/adr-002-prisma-7.md

**Objetivo:** Prisma 7 configurado com PostgreSQL rodando localmente via Docker, pronto para criar schemas e migrations.

**Escopo:**
- Criar docker-compose.yml para PostgreSQL 16
- Instalar Prisma 7 com @prisma/adapter-pg
- Configurar prisma.config.ts (obrigatorio no Prisma 7)
- Criar schema.prisma inicial
- Configurar Prisma Client singleton
- Criar .env.local com DATABASE_URL

**Criterios de Aceite:**
- [ ] `docker compose up -d` sobe PostgreSQL
- [ ] Conexao com banco funciona
- [ ] `pnpm prisma generate` gera client
- [ ] `pnpm prisma db push` aplica schema
- [ ] Prisma Client singleton configurado

---

## Goal

Configurar infraestrutura de banco de dados completa para o YouFluent:
- PostgreSQL 16 rodando via Docker Compose
- Prisma 7.x com Driver Adapters (arquitetura Rust-free)
- Schema inicial pronto para migrations
- Prisma Client singleton otimizado para Next.js 16

## Why

- **Foundation**: Banco de dados e a base para persistencia de transcricoes, licoes e progresso
- **Type-safety**: Prisma 7 oferece queries 100% tipadas com TypeScript
- **Developer Experience**: Docker elimina necessidade de instalar PostgreSQL localmente
- **Future-proof**: Prisma 7 com Driver Adapters e a arquitetura recomendada

## What

### User-Visible Behavior
- Nenhum (tarefa de infraestrutura)

### Technical Requirements
- PostgreSQL 16 acessivel em `localhost:5432`
- Prisma Client configurado com connection pooling
- Schema versionado em `prisma/schema.prisma`
- Suporte a Turbopack (Next.js 16 dev mode)

### Success Criteria
- [ ] Container PostgreSQL rodando e saudavel
- [ ] Prisma Client gera sem erros
- [ ] Schema inicial aplicado no banco
- [ ] Build do Next.js passa sem erros

---

## All Needed Context

### Documentation & References

```yaml
- doc: context/ARQUITETURA/stack.md
  why: Versoes exatas das dependencias (Prisma 7.x, pg, etc.)

- doc: context/ARQUITETURA/decisoes/adr-002-prisma-7.md
  why: Decisao arquitetural e configuracao necessaria

- critical: Prisma 7 REQUER Driver Adapters - nao e opcional
- critical: prisma.config.ts e obrigatorio no Prisma 7
- critical: Usar 'prisma-client-js' para compatibilidade com Turbopack
```

### Current Codebase Tree

```
youfluent/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── features/
│   │   ├── lesson/
│   │   │   ├── application/.gitkeep
│   │   │   ├── domain/.gitkeep
│   │   │   ├── infrastructure/.gitkeep
│   │   │   └── presentation/.gitkeep
│   │   ├── player/...
│   │   └── transcript/...
│   └── shared/
│       ├── components/
│       ├── hooks/
│       └── lib/
├── package.json
├── tsconfig.json
└── next.config.ts
```

### Desired Codebase Tree

```
youfluent/
├── docker-compose.yml           # [NEW] PostgreSQL 16 container
├── .env.local                   # [NEW] DATABASE_URL e secrets
├── prisma/
│   ├── schema.prisma            # [NEW] Schema inicial
│   └── prisma.config.ts         # [NEW] Config obrigatoria Prisma 7
├── src/
│   └── shared/
│       └── lib/
│           └── prisma.ts        # [NEW] Prisma Client singleton
└── package.json                 # [MODIFY] Add Prisma dependencies
```

### Known Gotchas

```
# CRITICAL: Prisma 7 requer Driver Adapters (@prisma/adapter-pg)
# O client padrao nao funciona sem o adapter!

# CRITICAL: prisma.config.ts e OBRIGATORIO
# Sem ele, `prisma generate` falha silenciosamente

# GOTCHA: Provider deve ser 'prisma-client-js' (nao 'prisma-client')
# 'prisma-client' causa problemas com Turbopack

# GOTCHA: Node.js 20.19+ e TypeScript 5.4+ sao requisitos do Prisma 7

# GOTCHA: Em dev com Next.js, usar singleton para evitar "too many clients"
# Hot reload cria novas instancias - singleton previne isso

# GOTCHA: Porta 5432 pode estar em uso por outra instancia PostgreSQL
# Alterar para 5433 em docker-compose.yml se necessario
```

---

## Implementation Blueprint

### Data Models

```prisma
// Schema INICIAL - apenas configuracao, sem models
// Models serao adicionados nas tasks T-004 (Transcript), T-011 (Lesson)

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Tasks (ordem de execucao)

```yaml
Task 1: Criar docker-compose.yml
  FILE: docker-compose.yml
  ACTION: CREATE
  PURPOSE: Container PostgreSQL 16 para desenvolvimento local

Task 2: Criar .env.local
  FILE: .env.local
  ACTION: CREATE
  PURPOSE: DATABASE_URL e configuracoes sensiveis
  NOTE: Adicionar ao .gitignore se nao estiver

Task 3: Instalar dependencias
  ACTION: RUN pnpm add
  PACKAGES:
    - @prisma/client@^7.0.0
    - @prisma/adapter-pg@^7.0.0
    - pg@^8.0.0
  DEV_PACKAGES:
    - prisma@^7.0.0
    - @types/pg@^8.0.0

Task 4: Criar prisma.config.ts
  FILE: prisma/prisma.config.ts
  ACTION: CREATE
  PURPOSE: Configuracao obrigatoria do Prisma 7

Task 5: Criar schema.prisma
  FILE: prisma/schema.prisma
  ACTION: CREATE
  PURPOSE: Schema inicial (vazio, apenas configuracao)

Task 6: Criar Prisma Client singleton
  FILE: src/shared/lib/prisma.ts
  ACTION: CREATE
  PURPOSE: Client singleton para Next.js (evita "too many clients" em dev)

Task 7: Adicionar scripts ao package.json
  FILE: package.json
  ACTION: MODIFY
  ADD_SCRIPTS:
    - "db:up": "docker compose up -d"
    - "db:down": "docker compose down"
    - "db:push": "prisma db push"
    - "db:generate": "prisma generate"
    - "db:studio": "prisma studio"

Task 8: Validar setup completo
  ACTIONS:
    - docker compose up -d
    - pnpm db:generate
    - pnpm db:push
    - pnpm build
```

### Per-Task Pseudocode

```yaml
# Task 1: docker-compose.yml
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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U youfluent"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

# Task 2: .env.local
DATABASE_URL="postgresql://youfluent:youfluent_dev@localhost:5432/youfluent?schema=public"

# Task 4: prisma.config.ts
import { defineConfig } from 'prisma'

export default defineConfig({
  earlyAccess: true,
  schema: './schema.prisma',
})

# Task 6: src/shared/lib/prisma.ts
# PATTERN: Singleton para Next.js dev mode
# Usar PrismaClient com Driver Adapter

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  })
  const adapter = new PrismaPg(pool)
  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
```

### Integration Points

```yaml
DOCKER:
  - Container: youfluent-db (PostgreSQL 16)
  - Port: 5432 -> 5432
  - Volume: postgres_data (persistencia)

ENVIRONMENT:
  - .env.local: DATABASE_URL
  - NOTE: Nao commitar .env.local (secrets)

PACKAGE.JSON:
  - scripts: db:up, db:down, db:push, db:generate, db:studio
  - dependencies: @prisma/client, @prisma/adapter-pg, pg
  - devDependencies: prisma, @types/pg
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Verificar sintaxe TypeScript
pnpm type-check

# Verificar linting
pnpm lint

# Expected: No errors
```

### Level 2: Docker Validation

```bash
# Subir container
docker compose up -d

# Verificar status
docker compose ps
# Expected: youfluent-db running (healthy)

# Verificar logs
docker compose logs db
# Expected: "database system is ready to accept connections"

# Testar conexao
docker compose exec db psql -U youfluent -c "SELECT 1"
# Expected: "?column?" = 1
```

### Level 3: Prisma Validation

```bash
# Gerar client
pnpm db:generate
# Expected: "Generated Prisma Client"

# Push schema
pnpm db:push
# Expected: "Your database is now in sync"

# Abrir studio (teste manual)
pnpm db:studio
# Expected: Browser abre em localhost:5555
```

### Level 4: Build Validation

```bash
# Build completo
pnpm build
# Expected: Build successful, no errors
```

---

## Final Checklist

- [ ] `docker compose up -d` sobe PostgreSQL
- [ ] `docker compose ps` mostra container healthy
- [ ] Conexao com banco funciona (`psql -U youfluent`)
- [ ] `pnpm db:generate` gera client sem erros
- [ ] `pnpm db:push` aplica schema sem erros
- [ ] `pnpm type-check` passa sem erros
- [ ] `pnpm lint` passa sem erros
- [ ] `pnpm build` passa sem erros
- [ ] Prisma Client singleton configurado em `src/shared/lib/prisma.ts`
- [ ] Scripts de conveniencia adicionados ao package.json

---

## Anti-Patterns to Avoid

- **NAO** usar Prisma sem Driver Adapter (obrigatorio no Prisma 7)
- **NAO** esquecer prisma.config.ts (causa falha silenciosa)
- **NAO** criar nova instancia PrismaClient em cada request (usar singleton)
- **NAO** usar provider 'prisma-client' (usar 'prisma-client-js' para Turbopack)
- **NAO** commitar .env.local (adicionar ao .gitignore)
- **NAO** usar pool connection sem limit (configurar max connections)
- **NAO** ignorar healthcheck do Docker (importante para CI/CD)

---

## Notes

- Schema inicial esta vazio (apenas configuracao)
- Models serao adicionados em:
  - T-004: Transcript domain (VideoId, Chunk, Transcript)
  - T-011: Lesson domain (Lesson, VocabularyItem, Exercise)
- Esta task e fundacao - nao tem testes unitarios (apenas validacao de infra)
- Para CI/CD futuro: usar Testcontainers (T-006 introduzira)

---

*PRP gerado pelo Context Engineering Framework v2.0*
*Tarefa: T-002 | Modo: AUTO | Confianca: 9/10*

---

## Pos-Implementacao

**Data:** 2026-01-03
**Status:** Implementado

### Arquivos Criados/Modificados

- `docker-compose.yml` - Container PostgreSQL 16 (porta 5433 devido a conflito)
- `.env.local` - DATABASE_URL com porta 5433
- `prisma/schema.prisma` - Schema inicial sem models
- `prisma.config.ts` - Configuracao Prisma 7 na raiz do projeto
- `src/shared/lib/prisma.ts` - Prisma Client singleton com PrismaPg adapter
- `package.json` - Scripts db:* e dependencias Prisma 7

### Testes

- N/A (tarefa de infraestrutura, sem testes unitarios)
- Validacao via comandos: docker compose, prisma generate, prisma db push, build

### Validation Gates

- [x] Lint: passou
- [x] Type-check: passou
- [x] Docker: container healthy na porta 5433
- [x] Prisma generate: Generated Prisma Client (v7.2.0)
- [x] Prisma db push: Database in sync
- [x] Build: passou (Next.js 16.1.1)

### Erros Encontrados

1. **Porta 5432 em uso**: Outra instancia PostgreSQL ocupava a porta. Solucao: alterado para porta 5433.

2. **prisma.config.ts no lugar errado**: Prisma 7 espera o arquivo na raiz do projeto, nao dentro de `prisma/`. Solucao: movido para raiz.

3. **datasource.url removido do schema.prisma**: No Prisma 7, a URL e configurada apenas no `prisma.config.ts`, nao mais no schema.

4. **previewFeatures driverAdapters deprecated**: No Prisma 7.2.0, driverAdapters nao precisa mais ser declarado como preview feature.

5. **PrismaPg API mudou**: No Prisma 7, `PrismaPg` aceita objeto `{ connectionString }` diretamente, nao mais uma instancia de `Pool`.

### Decisoes Tomadas

1. **Porta 5433**: Mantida para evitar conflitos com outras instancias PostgreSQL locais.

2. **dotenv para .env.local**: Prisma 7 nao carrega `.env.local` automaticamente, apenas `.env`. Usado dotenv com path explicito.

3. **env() helper do Prisma**: Usado `env('DATABASE_URL')` em vez de `process.env.DATABASE_URL` para melhor integracao com Prisma CLI.

4. **Singleton pattern simplificado**: Removido Pool explicito, usando `PrismaPg({ connectionString })` diretamente conforme docs Prisma 7.

### Versoes Instaladas

- prisma: 7.2.0
- @prisma/client: 7.2.0
- @prisma/adapter-pg: 7.2.0
- pg: 8.16.3
- @types/pg: 8.16.0
- dotenv: 17.2.3
