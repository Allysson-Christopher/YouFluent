# Stack Tecnologica

---

## Linguagem e Runtime

| Camada | Tecnologia | Versao | Justificativa |
|--------|------------|--------|---------------|
| Full-stack | TypeScript | 5.9.x | Type-safety, melhor DX, exigido pelo Prisma 7 |
| Runtime | Node.js | 20.19+ | LTS, exigido pelo Prisma 7 |

## Frameworks e Bibliotecas Core

### Frontend

| Categoria | Biblioteca | Versao | Proposito |
|-----------|------------|--------|-----------|
| Framework | Next.js | 16.1.1+ | Full-stack, App Router, Server Components |
| UI Library | React | 19.2.x | View Transitions, Activity |
| Estilizacao | Tailwind CSS | v4 | CSS-first config, utility classes |
| Componentes | shadcn/ui | 2.5.x | Componentes acessiveis, customizaveis |
| Estado | Zustand | 5.x | Estado global leve, sem boilerplate |
| Validacao | Zod | latest | Validacao de schemas, type inference |

### Backend

| Categoria | Biblioteca | Versao | Proposito |
|-----------|------------|--------|-----------|
| ORM | Prisma | 7.x | Type-safe queries, migrations |
| DB Adapter | @prisma/adapter-pg | latest | Driver Adapter obrigatorio no Prisma 7 |
| DB Driver | pg | latest | Driver PostgreSQL nativo |
| IA | OpenAI SDK | 6.1.x | Geracao de licoes com GPT |
| Transcricao | youtube-transcript | latest | Buscar legendas do YouTube |

### Testes

| Categoria | Biblioteca | Versao | Proposito |
|-----------|------------|--------|-----------|
| Unit/Integration | Vitest | 3.0.5+ | Testes rapidos, compativel com ESM |
| Components | Testing Library | 16.3.x | Testes de componentes React |
| E2E | Playwright | 1.55.1+ | Testes end-to-end |

## Banco de Dados

| Tipo | Tecnologia | Uso | Hosting |
|------|------------|-----|---------|
| Principal | PostgreSQL 16 | Transcricoes, licoes, cache | Docker Compose (local) |

## Servicos Externos

| Servico | Provider | Proposito | Tier |
|---------|----------|-----------|------|
| IA | OpenAI | Geracao de licoes | Paid (pay-per-use) |
| Transcricao | YouTube | Legendas de videos | Free (unofficial) |

## Infraestrutura

| Aspecto | Escolha | Notas |
|---------|---------|-------|
| DB Local | Docker Compose | Container isolado |
| Hosting | A definir | Vercel, Railway ou similar |
| CI/CD | A definir | GitHub Actions |

---

## Dependencias por Ambiente

### Producao

```json
{
  "next": "^16.1.1",
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "@prisma/client": "^7.0.0",
  "@prisma/adapter-pg": "^7.0.0",
  "pg": "^8.0.0",
  "zustand": "^5.0.0",
  "zod": "^3.0.0",
  "openai": "^6.1.0",
  "youtube-transcript": "^1.0.0"
}
```

### Desenvolvimento

```json
{
  "typescript": "^5.9.0",
  "prisma": "^7.0.0",
  "@types/node": "^20.0.0",
  "@types/react": "^19.0.0",
  "tailwindcss": "^4.0.0",
  "eslint": "^9.0.0",
  "prettier": "^3.0.0"
}
```

### Teste

```json
{
  "vitest": "^3.0.5",
  "@testing-library/react": "^16.3.0",
  "@playwright/test": "^1.55.1"
}
```

---

## O que NAO usamos (e por que)

| Tecnologia | Motivo |
|------------|--------|
| tRPC | Server Components + Server Actions + Zod ja oferecem type-safety |
| React Query / SWR | Server Components fazem fetch no servidor |
| Prefixo "I" em interfaces | Convencao TypeScript moderna |
| Express / Fastify | Next.js API Routes e suficiente |
| MongoDB | PostgreSQL oferece JSON + relacional |

---

*Atualizado em: 2026-01-02*
