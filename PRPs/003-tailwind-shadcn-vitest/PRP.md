# PRP-003: Setup Tailwind v4 + shadcn/ui + Vitest

---

## Input Summary

**Modo:** TAREFA
**Tarefa:** T-003 - Setup Tailwind v4 + shadcn/ui + Vitest
**Origem:** context/TASKS/T-003.md

**Contexto Carregado:**
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/stack.md
- context/ARQUITETURA/decisoes/adr-005-testing-strategy.md
- PRPs/templates/prp_base.md

**Objetivo:** Configurar UI com Tailwind CSS v4, shadcn/ui 2.5.x e framework de testes Vitest 3.0.5+.

**Escopo:**
- Instalar e configurar Tailwind CSS v4
- Instalar shadcn/ui com componentes base (Button, Card)
- Configurar Vitest 3.0.5+ com coverage
- Configurar estrutura de testes (unit, integration, e2e)
- Instalar Testcontainers e MSW

**Criterios de Aceite (da tarefa):**
- [ ] Tailwind v4 funcionando (CSS-first config)
- [ ] shadcn/ui Button e Card instalados
- [ ] `pnpm test` roda Vitest
- [ ] `pnpm test:coverage` gera relatorio
- [ ] Estrutura de testes criada
- [ ] MSW configurado para mocks

---

## Goal

Configurar a stack de UI e testes do YouFluent:
1. **Tailwind CSS v4** com CSS-first config (sem tailwind.config.js)
2. **shadcn/ui 2.5.x** com componentes Button e Card
3. **Vitest 3.0.5+** com coverage e thresholds por camada
4. **Estrutura de testes** seguindo ADR-005 (unit, integration, e2e)
5. **MSW 2.x** para mocks de APIs externas (YouTube, OpenAI)
6. **Testcontainers** para testes de integração com PostgreSQL real

---

## Why

- **Tailwind v4**: CSS-first simplifica configuração, performance melhor, utilidades modernas
- **shadcn/ui**: Componentes acessíveis, customizáveis, compatíveis com React 19 e Tailwind v4
- **Vitest**: Rápido, ESM nativo, API compatível com Jest, integração nativa com coverage
- **MSW**: Mock de APIs HTTP sem modificar código de produção
- **Testcontainers**: Testes de integração com banco real, sem mocks frágeis
- **TDD**: Qualidade garantida desde o início (ADR-005)

---

## What

### Comportamento Esperado

1. **Tailwind funcionando**: Classes utilitárias aplicadas corretamente
2. **Componentes shadcn/ui**: Button e Card renderizam com estilos corretos
3. **Testes executáveis**: `pnpm test` roda sem erros
4. **Coverage funcional**: `pnpm test:coverage` gera relatório HTML
5. **Mocks funcionais**: MSW intercepta requests para APIs externas

### Requisitos Técnicos

| Aspecto | Requisito |
|---------|-----------|
| Tailwind | v4, CSS-first config (sem tailwind.config.js) |
| shadcn/ui | 2.5.x, componentes Button e Card |
| Vitest | 3.0.5+ (CVE fix) |
| Coverage | v8 provider, thresholds por camada |
| MSW | 2.x (nova API) |
| Testcontainers | PostgreSQL 16 |

### Success Criteria

- [ ] `pnpm build` compila sem erros
- [ ] `pnpm test` executa e passa
- [ ] `pnpm test:coverage` gera relatório em coverage/
- [ ] Tailwind classes funcionam (verificar em dev)
- [ ] Button e Card renderizam corretamente
- [ ] MSW handlers interceptam requests em testes

---

## All Needed Context

### Documentation & References

```yaml
- doc: Tailwind CSS v4
  url: https://tailwindcss.com/docs/installation/framework-guides/nextjs
  critical: |
    Tailwind v4 usa CSS-first config.
    NÃO criar tailwind.config.js.
    Usar @import "tailwindcss" no CSS.

- doc: shadcn/ui
  url: https://ui.shadcn.com/docs/installation/next
  critical: |
    Usar shadcn-ui@latest (CLI).
    components.json configura paths e estilo.
    Componentes vão para src/shared/components/ui/

- doc: Vitest
  url: https://vitest.dev/guide/
  critical: |
    Versão 3.0.5+ obrigatória (CVE).
    Precisa @vitejs/plugin-react para JSX.
    Coverage usa @vitest/coverage-v8.

- doc: MSW 2.x
  url: https://mswjs.io/docs/getting-started
  critical: |
    API mudou do 1.x: usar http.get() ao invés de rest.get().
    Precisa setupServer() para Node.

- doc: Testcontainers
  url: https://testcontainers.com/guides/getting-started-with-testcontainers-for-nodejs/
  critical: |
    Requer Docker rodando.
    Usar @testcontainers/postgresql.
```

### Current Codebase Tree

```
/home/allysson/projetos/YouFluent/
├── src/
│   ├── app/
│   │   ├── globals.css      # CSS placeholder (será substituído)
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Home page
│   ├── features/            # Domínios (vazio)
│   └── shared/
│       ├── lib/
│       │   └── prisma.ts    # Prisma client
│       └── types/
│           └── index.ts     # Tipos compartilhados
├── prisma/
│   └── schema.prisma        # Schema do banco
├── package.json             # Dependências atuais
├── tsconfig.json            # Config TypeScript
├── next.config.ts           # Config Next.js
└── docker-compose.yml       # PostgreSQL
```

### Desired Codebase Tree

```
/home/allysson/projetos/YouFluent/
├── src/
│   ├── app/
│   │   ├── globals.css         # MODIFY: Tailwind v4 imports
│   │   ├── layout.tsx          # MODIFY: Adicionar cn() e fonts
│   │   └── page.tsx
│   └── shared/
│       ├── components/
│       │   └── ui/             # CREATE: shadcn/ui components
│       │       ├── button.tsx
│       │       └── card.tsx
│       └── lib/
│           ├── prisma.ts
│           └── utils.ts        # CREATE: cn() helper
├── tests/                      # CREATE: Estrutura de testes
│   ├── unit/
│   │   └── .gitkeep
│   ├── integration/
│   │   └── .gitkeep
│   ├── e2e/
│   │   └── .gitkeep
│   ├── mocks/
│   │   ├── youtube.ts          # CREATE: MSW handler YouTube
│   │   └── openai.ts           # CREATE: MSW handler OpenAI
│   └── setup/
│       ├── vitest.setup.ts     # CREATE: Setup global
│       └── msw-server.ts       # CREATE: MSW server
├── components.json             # CREATE: shadcn config
├── postcss.config.mjs          # CREATE: PostCSS config
├── vitest.config.ts            # CREATE: Vitest config
└── package.json                # MODIFY: Novos scripts e deps
```

### Known Gotchas & Library Quirks

```
# CRITICAL: Tailwind v4 é CSS-first
- NÃO criar tailwind.config.js
- Usar @import "tailwindcss" em globals.css
- Configuração via CSS custom properties

# CRITICAL: shadcn/ui com Tailwind v4
- Usar npx shadcn@latest init (não shadcn-ui)
- Selecionar estilo "new-york" ou "default"
- Path aliases devem estar em tsconfig.json

# CRITICAL: Vitest 3.0.5+
- Versões anteriores têm CVE
- Precisa @vitejs/plugin-react para testar JSX
- Coverage usa @vitest/coverage-v8 (não istanbul)

# CRITICAL: MSW 2.x
- API mudou: http.get() ao invés de rest.get()
- HttpResponse ao invés de ctx.json()
- setupServer() para Node.js

# CRITICAL: Testcontainers
- Docker DEVE estar rodando
- Container leva ~5-10s para iniciar
- Usar beforeAll/afterAll para gerenciar lifecycle
```

---

## Implementation Blueprint

### Data Models & Structure

Nenhum modelo de dados novo. Esta tarefa é de configuração de ferramentas.

### Task List (Ordem de Execução)

```yaml
Task 1: Instalar dependências Tailwind v4
  type: bash
  commands:
    - pnpm add -D tailwindcss@4 postcss autoprefixer @tailwindcss/postcss

Task 2: Criar postcss.config.mjs
  type: create
  file: postcss.config.mjs
  content: |
    export default {
      plugins: {
        '@tailwindcss/postcss': {},
      },
    }

Task 3: Atualizar globals.css para Tailwind v4
  type: modify
  file: src/app/globals.css
  content: |
    @import "tailwindcss";

    /* CSS custom properties para tema */
    :root {
      --background: oklch(1 0 0);
      --foreground: oklch(0.145 0 0);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.145 0 0);
      --primary: oklch(0.205 0 0);
      --primary-foreground: oklch(0.985 0 0);
      --secondary: oklch(0.97 0 0);
      --secondary-foreground: oklch(0.205 0 0);
      --muted: oklch(0.97 0 0);
      --muted-foreground: oklch(0.556 0 0);
      --accent: oklch(0.97 0 0);
      --accent-foreground: oklch(0.205 0 0);
      --destructive: oklch(0.577 0.245 27.325);
      --border: oklch(0.922 0 0);
      --input: oklch(0.922 0 0);
      --ring: oklch(0.708 0 0);
      --radius: 0.5rem;
    }

    .dark {
      --background: oklch(0.145 0 0);
      --foreground: oklch(0.985 0 0);
      /* ... dark mode vars */
    }

    body {
      background-color: var(--background);
      color: var(--foreground);
    }

Task 4: Instalar dependências shadcn/ui
  type: bash
  commands:
    - pnpm add clsx tailwind-merge class-variance-authority lucide-react

Task 5: Criar utils.ts com cn()
  type: create
  file: src/shared/lib/utils.ts
  content: |
    import { type ClassValue, clsx } from 'clsx'
    import { twMerge } from 'tailwind-merge'

    export function cn(...inputs: ClassValue[]) {
      return twMerge(clsx(inputs))
    }

Task 6: Criar components.json (shadcn config)
  type: create
  file: components.json
  content: |
    {
      "$schema": "https://ui.shadcn.com/schema.json",
      "style": "new-york",
      "rsc": true,
      "tsx": true,
      "tailwind": {
        "config": "",
        "css": "src/app/globals.css",
        "baseColor": "neutral",
        "cssVariables": true,
        "prefix": ""
      },
      "aliases": {
        "components": "@/shared/components",
        "utils": "@/shared/lib/utils",
        "ui": "@/shared/components/ui",
        "lib": "@/shared/lib",
        "hooks": "@/shared/hooks"
      },
      "iconLibrary": "lucide"
    }

Task 7: Criar diretório ui e componentes base
  type: create
  files:
    - src/shared/components/ui/button.tsx
    - src/shared/components/ui/card.tsx
  note: |
    Usar npx shadcn@latest add button card
    Ou criar manualmente seguindo padrão shadcn/ui

Task 8: Instalar dependências Vitest
  type: bash
  commands:
    - pnpm add -D vitest @vitest/coverage-v8 @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom

Task 9: Criar vitest.config.ts
  type: create
  file: vitest.config.ts
  content: Ver seção Pseudocode

Task 10: Criar estrutura de testes
  type: create
  directories:
    - tests/unit/
    - tests/integration/
    - tests/e2e/
    - tests/mocks/
    - tests/setup/

Task 11: Instalar MSW
  type: bash
  commands:
    - pnpm add -D msw@2

Task 12: Criar MSW handlers
  type: create
  files:
    - tests/mocks/youtube.ts
    - tests/mocks/openai.ts
    - tests/setup/msw-server.ts

Task 13: Instalar Testcontainers
  type: bash
  commands:
    - pnpm add -D @testcontainers/postgresql

Task 14: Criar setup de Testcontainers
  type: create
  file: tests/setup/testcontainers.ts

Task 15: Atualizar package.json com scripts
  type: modify
  file: package.json
  add_scripts:
    test: vitest run
    test:watch: vitest
    test:unit: vitest run tests/unit
    test:integration: vitest run tests/integration
    test:coverage: vitest run --coverage

Task 16: Atualizar tsconfig.json para incluir tests
  type: modify
  file: tsconfig.json
  add_to_include: tests/**/*.ts
```

### Pseudocode por Task

#### Task 9: vitest.config.ts

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'node', // Default para unit tests
    include: ['tests/**/*.test.ts', 'tests/**/*.test.tsx'],
    exclude: ['tests/e2e/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      exclude: [
        'tests/**',
        '**/*.d.ts',
        '**/node_modules/**',
        '.next/**',
      ],
      thresholds: {
        // Domain: 100%
        'src/**/domain/**': {
          statements: 100,
          branches: 100,
          functions: 100,
          lines: 100,
        },
        // Application: 80%
        'src/**/application/**': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        // Infrastructure: 60%
        'src/**/infrastructure/**': {
          statements: 60,
          branches: 60,
          functions: 60,
          lines: 60,
        },
      },
    },
    setupFiles: ['tests/setup/vitest.setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/features': path.resolve(__dirname, './src/features'),
      '@/shared': path.resolve(__dirname, './src/shared'),
    },
  },
})
```

#### Task 12: MSW Handlers

```typescript
// tests/mocks/youtube.ts
import { http, HttpResponse } from 'msw'

export const youtubeHandlers = [
  http.get('https://www.youtube.com/api/timedtext*', () => {
    return HttpResponse.json({
      events: [
        { tStartMs: 0, dDurationMs: 5000, segs: [{ utf8: 'Hello world' }] },
        { tStartMs: 5000, dDurationMs: 5000, segs: [{ utf8: 'This is a test' }] },
      ],
    })
  }),
]

// tests/mocks/openai.ts
import { http, HttpResponse } from 'msw'

export const openaiHandlers = [
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: 'Generated lesson content for testing',
          },
          finish_reason: 'stop',
        },
      ],
    })
  }),
]

// tests/setup/msw-server.ts
import { setupServer } from 'msw/node'
import { youtubeHandlers } from '../mocks/youtube'
import { openaiHandlers } from '../mocks/openai'

export const server = setupServer(...youtubeHandlers, ...openaiHandlers)
```

#### Task 14: Testcontainers Setup

```typescript
// tests/setup/testcontainers.ts
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

let container: StartedPostgreSqlContainer
let prisma: PrismaClient

export async function setupTestDatabase() {
  container = await new PostgreSqlContainer('postgres:16')
    .withDatabase('youfluent_test')
    .start()

  const pool = new Pool({
    connectionString: container.getConnectionUri(),
  })

  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })

  // Run migrations
  // await prisma.$executeRaw`...`

  return { prisma, container }
}

export async function teardownTestDatabase() {
  if (prisma) {
    await prisma.$disconnect()
  }
  if (container) {
    await container.stop()
  }
}

export { prisma }
```

### Integration Points

```yaml
PACKAGE.JSON:
  dependencies:
    - tailwindcss@4
    - clsx
    - tailwind-merge
    - class-variance-authority
    - lucide-react
  devDependencies:
    - postcss
    - autoprefixer
    - @tailwindcss/postcss
    - vitest@^3.0.5
    - @vitest/coverage-v8
    - @vitejs/plugin-react
    - jsdom
    - @testing-library/react
    - @testing-library/dom
    - msw@2
    - @testcontainers/postgresql

TSCONFIG:
  include:
    - tests/**/*.ts
    - tests/**/*.tsx

NEXT.CONFIG:
  # Nenhuma alteração necessária
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# Verificar lint
pnpm lint

# Verificar formatação
pnpm format:check

# Fix automático se necessário
pnpm lint:fix && pnpm format

# Expected: No errors
```

### Level 2: Type Check

```bash
# Verificar tipos
pnpm type-check

# Expected: No errors
# Se houver erros, verificar:
# - Path aliases em tsconfig.json
# - Types instalados (@types/*)
```

### Level 3: Unit Tests

```bash
# Rodar testes unitários
pnpm test:unit

# Rodar com coverage
pnpm test:coverage

# Expected:
# - Todos os testes passam
# - Coverage report gerado em coverage/

# NOTA: Não haverá testes ainda, mas o comando deve funcionar
```

### Level 4: Integration Tests

```bash
# Verificar se Docker está rodando
docker info

# Rodar testes de integração
pnpm test:integration

# Expected:
# - Testcontainers inicia PostgreSQL
# - Testes passam (se houver)
# - Container é destruído após testes
```

### Level 5: Build

```bash
# Build completo
pnpm build

# Expected:
# - Build sucesso
# - Tailwind CSS compilado
# - Sem erros de tipo

# Verificar em dev
pnpm dev
# Acessar http://localhost:3000 e verificar estilos
```

---

## Final Validation Checklist

- [ ] Tailwind v4 funcionando (CSS-first config, sem tailwind.config.js)
- [ ] globals.css usa @import "tailwindcss"
- [ ] shadcn/ui Button instalado e funcional
- [ ] shadcn/ui Card instalado e funcional
- [ ] cn() helper em src/shared/lib/utils.ts
- [ ] components.json configurado
- [ ] vitest.config.ts criado com thresholds
- [ ] `pnpm test` roda Vitest sem erros
- [ ] `pnpm test:coverage` gera relatório
- [ ] tests/unit/ criado
- [ ] tests/integration/ criado
- [ ] tests/e2e/ criado
- [ ] tests/mocks/youtube.ts criado
- [ ] tests/mocks/openai.ts criado
- [ ] tests/setup/msw-server.ts criado
- [ ] tests/setup/testcontainers.ts criado
- [ ] MSW 2.x handlers funcionais
- [ ] `pnpm build` sucesso
- [ ] `pnpm lint` sem erros
- [ ] `pnpm type-check` sem erros

---

## Anti-Patterns to Avoid

- ❌ **NÃO criar tailwind.config.js** - Tailwind v4 é CSS-first
- ❌ **NÃO usar MSW 1.x API** - rest.get() foi substituído por http.get()
- ❌ **NÃO usar istanbul para coverage** - Vitest usa v8
- ❌ **NÃO ignorar Docker** - Testcontainers requer Docker rodando
- ❌ **NÃO mockar Prisma em integration tests** - Usar Testcontainers com banco real
- ❌ **NÃO criar testes frágeis** - Testes de integração com banco real são mais confiáveis
- ❌ **NÃO esquecer path aliases** - Vitest precisa dos mesmos aliases do tsconfig
- ❌ **NÃO instalar versão antiga do Vitest** - 3.0.5+ obrigatório (CVE)
- ❌ **NÃO criar componentes shadcn manualmente sem seguir o padrão** - Usar CLI ou copiar exatamente

---

## Notes

- **Ordem importa**: Tailwind primeiro, depois shadcn, depois Vitest
- **Docker obrigatório**: Para testes de integração com Testcontainers
- **MSW 2.x**: API completamente diferente do 1.x
- **Vitest 3.0.5+**: Versões anteriores têm vulnerabilidade
- **Coverage thresholds**: Vão falhar até ter código real - isso é esperado

---

*PRP gerado em: 2026-01-03*
*Context Engineering Framework v2.0*

---

## Pos-Implementacao

**Data:** 2026-01-03
**Status:** Implementado

### Arquivos Criados/Modificados

**Criados:**
- `postcss.config.mjs` - PostCSS config para Tailwind v4
- `components.json` - shadcn/ui config
- `vitest.config.ts` - Vitest config com aliases
- `src/shared/lib/utils.ts` - cn() helper function
- `src/shared/components/ui/button.tsx` - shadcn/ui Button component
- `src/shared/components/ui/card.tsx` - shadcn/ui Card component
- `tests/unit/.gitkeep` - Placeholder
- `tests/integration/.gitkeep` - Placeholder
- `tests/e2e/.gitkeep` - Placeholder
- `tests/unit/shared/lib/utils.test.ts` - Testes do cn() utility
- `tests/mocks/youtube.ts` - MSW handler para YouTube API
- `tests/mocks/openai.ts` - MSW handler para OpenAI API
- `tests/setup/vitest.setup.ts` - Vitest global setup
- `tests/setup/msw-server.ts` - MSW server setup
- `tests/setup/testcontainers.ts` - Testcontainers PostgreSQL setup

**Modificados:**
- `src/app/globals.css` - Tailwind v4 CSS-first config com CSS variables
- `package.json` - Scripts de teste e novas dependencias

### Dependencias Instaladas

**Dependencies:**
- `@radix-ui/react-slot` - Para shadcn/ui Button asChild
- `class-variance-authority` - CVA para variantes de componentes
- `clsx` - Class name utility
- `lucide-react` - Icons
- `tailwind-merge` - Merge tailwind classes

**DevDependencies:**
- `tailwindcss@4.1.18` - Tailwind CSS v4
- `@tailwindcss/postcss` - PostCSS plugin para Tailwind v4
- `postcss` - PostCSS
- `autoprefixer` - Autoprefixer
- `vitest@3.2.4` - Test runner
- `@vitest/coverage-v8@3.2.4` - Coverage provider
- `@vitejs/plugin-react` - React plugin para Vitest
- `jsdom` - DOM implementation
- `@testing-library/react` - React testing utilities
- `@testing-library/dom` - DOM testing utilities
- `@testing-library/jest-dom` - Jest DOM matchers
- `msw@2.12.7` - Mock Service Worker
- `@testcontainers/postgresql` - PostgreSQL container
- `testcontainers` - Testcontainers core

### Testes
- 5 testes criados para cn() utility
- Cobertura utils.ts: 100%
- Comando: `pnpm test`

### Validation Gates
- [x] Lint: passou
- [x] Type-check: passou
- [x] Unit tests: passou (5 testes)
- [x] Test coverage: passou (100% utils.ts)
- [x] Build: passou

### Erros Encontrados

1. **ESLint warning em postcss.config.mjs**: "Assign object to a variable before exporting"
   - Solucao: Alterado de export default anonimo para const config com export

2. **Prisma client nao gerado**: "Module has no exported member 'PrismaClient'"
   - Solucao: Executado `pnpm db:generate` para gerar o client

3. **@vitest/coverage-v8 peer dependency**: Versao 4.x incompativel com vitest 3.x
   - Solucao: Instalado @vitest/coverage-v8@^3.0.0 compativel

### Decisoes Tomadas

1. **Tailwind v4 CSS-first**: Usado @theme inline para cores customizadas em globals.css
2. **shadcn/ui manual**: Componentes Button e Card criados manualmente seguindo padrao oficial
3. **Vitest environment node**: Default para unit tests, jsdom disponivel quando necessario
4. **MSW 2.x API**: Usado http.get/post e HttpResponse (nova API)
5. **Testcontainers setup completo**: Incluido cleanDatabase() para limpar entre testes

### Context7 Consultado

- `/websites/ui_shadcn` - Documentacao shadcn/ui para Button variants e padroes
