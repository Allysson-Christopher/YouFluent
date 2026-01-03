# PRP-001: Setup Next.js 16 + Estrutura Feature-Clean

---

## Input Summary

**Modo:** TAREFA
**Tarefa:** T-001 - Setup Next.js 16 + estrutura Feature-Clean
**Origem:** context/TASKS/T-001.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/stack.md
- context/ARQUITETURA/padroes.md

**Objetivo:** Projeto Next.js 16.1.1+ configurado com TypeScript, App Router e estrutura de pastas Feature-Clean pronta para desenvolvimento.

**Escopo:**
- Criar projeto Next.js 16.1.1+ com TypeScript
- Configurar App Router
- Criar estrutura de pastas Feature-Clean
- Configurar ESLint + Prettier
- Configurar path aliases (@/)

**Criterios de Aceite:**
- [ ] `pnpm dev` inicia servidor de desenvolvimento
- [ ] Pagina inicial renderiza sem erros
- [ ] Estrutura de pastas Feature-Clean criada
- [ ] Path aliases funcionando (@/features, @/shared)
- [ ] ESLint + Prettier configurados
- [ ] TypeScript strict mode habilitado

---

## Goal

Criar a base do projeto YouFluent com Next.js 16.1.1+ e estrutura Feature-Clean Architecture (DDD + Feature-Sliced), pronta para receber os domínios lesson, player e transcript.

## Why

- **Fundação sólida**: Todo o projeto depende desta estrutura inicial
- **DDD + Clean Architecture**: Estrutura que escala e mantém separação de responsabilidades
- **T-002 e T-003 dependem desta tarefa**: Prisma e Tailwind serão adicionados sobre esta base
- **Padrões consistentes**: Definir estrutura agora evita refatoração futura

## What

### Comportamento Esperado

1. Desenvolvedor executa `pnpm dev` e servidor Next.js inicia na porta 3000
2. Página inicial exibe "YouFluent" sem erros no console
3. Estrutura de pastas Feature-Clean existe em `src/features/`
4. Imports com `@/` resolvem corretamente
5. ESLint e Prettier formatam código automaticamente

### Requisitos Técnicos

| Aspecto | Especificação |
|---------|---------------|
| Framework | Next.js 16.1.1+ (ou latest se 16 não disponível) |
| Runtime | Node.js 20.19+ |
| Package Manager | pnpm |
| TypeScript | 5.9.x com strict mode |
| Bundler Dev | Turbopack |
| Lint | ESLint 9 (flat config) |
| Format | Prettier 3 |

### Success Criteria

- [ ] `node --version` >= 20.19.0
- [ ] `pnpm dev` inicia sem erros
- [ ] `pnpm lint` passa sem erros
- [ ] `pnpm build` completa sem erros
- [ ] Path alias `@/features/lesson/domain` resolve corretamente
- [ ] Estrutura de pastas conforme especificação

---

## All Needed Context

### Documentation & References

```yaml
- url: https://nextjs.org/docs/app/getting-started/installation
  why: Comando create-next-app e opções disponíveis

- url: https://nextjs.org/docs/app/api-reference/next-config-js
  why: Configuração do next.config.ts

- url: https://eslint.org/docs/latest/use/configure/configuration-files
  why: ESLint 9 flat config (eslint.config.mjs)

- file: context/ARQUITETURA/stack.md
  why: Versões exatas das dependências

- file: context/ARQUITETURA/padroes.md
  why: Estrutura DDD + Clean Architecture
```

### Current Codebase Tree

```bash
youfluent/
├── .claude/              # Comandos Claude Code
├── .env                  # Variáveis de ambiente (protótipo)
├── .git/
├── CLAUDE.md             # Instruções do framework
├── context/              # Contexto modular
├── docs/                 # Documentação
├── examples/             # Exemplos
├── index.html            # Protótipo HTML (será removido/movido)
├── PRPs/                 # PRPs gerados
├── server.py             # Protótipo Python (será removido/movido)
├── use-cases/            # Casos de uso do framework
└── validation/           # Sistema de validação
```

### Desired Codebase Tree

```bash
youfluent/
├── src/
│   ├── app/
│   │   ├── layout.tsx           # Root layout com metadata
│   │   ├── page.tsx             # Home page placeholder
│   │   └── globals.css          # CSS reset básico (sem Tailwind ainda)
│   │
│   ├── features/
│   │   ├── lesson/
│   │   │   ├── domain/
│   │   │   │   └── .gitkeep
│   │   │   ├── application/
│   │   │   │   └── .gitkeep
│   │   │   ├── infrastructure/
│   │   │   │   └── .gitkeep
│   │   │   └── presentation/
│   │   │       └── .gitkeep
│   │   │
│   │   ├── player/
│   │   │   ├── domain/
│   │   │   │   └── .gitkeep
│   │   │   ├── application/
│   │   │   │   └── .gitkeep
│   │   │   ├── infrastructure/
│   │   │   │   └── .gitkeep
│   │   │   └── presentation/
│   │   │       └── .gitkeep
│   │   │
│   │   └── transcript/
│   │       ├── domain/
│   │       │   └── .gitkeep
│   │       ├── application/
│   │       │   └── .gitkeep
│   │       ├── infrastructure/
│   │       │   └── .gitkeep
│   │       └── presentation/
│   │           └── .gitkeep
│   │
│   └── shared/
│       ├── components/
│       │   └── ui/
│       │       └── .gitkeep      # Placeholder para shadcn/ui (T-003)
│       ├── lib/
│       │   └── .gitkeep          # Placeholder para Prisma client (T-002)
│       └── types/
│           └── index.ts          # Tipos compartilhados base
│
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs             # ESLint 9 flat config
├── .prettierrc
└── .prettierignore
```

### Known Gotchas

```
# CRITICAL: Next.js 16 pode não estar disponível como stable
# Se `create-next-app@16` falhar, usar `create-next-app@latest`
# Verificar versão instalada após criação

# CRITICAL: ESLint 9 usa flat config (eslint.config.mjs)
# Não criar .eslintrc.json - Next.js 15+ usa flat config por padrão

# CRITICAL: Turbopack é default no Next.js 15+
# Verificar se está habilitado em package.json scripts

# CRITICAL: Tailwind NÃO deve ser instalado nesta tarefa
# Será configurado em T-003 com Tailwind v4

# CRITICAL: Node.js 20.19+ é obrigatório
# Verificar versão antes de prosseguir
```

---

## Implementation Blueprint

### Data Models and Structure

Nesta tarefa não há models de domínio - apenas estrutura de arquivos.

**Types compartilhados base (src/shared/types/index.ts):**

```typescript
/**
 * Result pattern para operações que podem falhar
 * Será usado em todo o domínio
 */
export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E }

/**
 * Utility type para extrair o tipo de sucesso de um Result
 */
export type ResultValue<R> = R extends Result<infer T, unknown> ? T : never

/**
 * Utility type para extrair o tipo de erro de um Result
 */
export type ResultError<R> = R extends Result<unknown, infer E> ? E : never
```

---

### Task 1: Verificar Node.js e Preparar Ambiente

**Objetivo:** Garantir que Node.js 20.19+ está instalado

**Comandos:**
```bash
# Verificar versão do Node.js
node --version
# Esperado: v20.19.0 ou superior

# Verificar pnpm
pnpm --version
# Se não instalado: npm install -g pnpm
```

**Critério de Sucesso:** `node --version` retorna >= 20.19.0

---

### Task 2: Criar Projeto Next.js

**Objetivo:** Criar projeto base com create-next-app

**Comandos:**
```bash
# Criar projeto Next.js
pnpm create next-app@latest youfluent-app --typescript --eslint --app --src-dir --turbopack --no-tailwind --import-alias "@/*"

# Mover conteúdo para raiz (se necessário)
# Ou criar diretamente na pasta atual se estiver vazia
```

**Opções do create-next-app:**
- `--typescript`: TypeScript habilitado
- `--eslint`: ESLint configurado
- `--app`: App Router (não Pages)
- `--src-dir`: Usar diretório src/
- `--turbopack`: Habilitar Turbopack
- `--no-tailwind`: Não instalar Tailwind (será T-003)
- `--import-alias "@/*"`: Path alias padrão

**Critério de Sucesso:** Diretório criado com package.json e src/app/

---

### Task 3: Ajustar Estrutura de Diretórios

**Objetivo:** Criar estrutura Feature-Clean

**Pseudocode:**
```
# Criar diretórios de features
PARA cada feature EM [lesson, player, transcript]:
    CRIAR src/features/{feature}/domain/
    CRIAR src/features/{feature}/application/
    CRIAR src/features/{feature}/infrastructure/
    CRIAR src/features/{feature}/presentation/
    CRIAR .gitkeep em cada diretório

# Criar diretórios shared
CRIAR src/shared/components/ui/
CRIAR src/shared/lib/
CRIAR src/shared/types/

# Criar arquivo de tipos base
ESCREVER src/shared/types/index.ts com Result type
```

**Comandos:**
```bash
# Criar estrutura de features
mkdir -p src/features/lesson/{domain,application,infrastructure,presentation}
mkdir -p src/features/player/{domain,application,infrastructure,presentation}
mkdir -p src/features/transcript/{domain,application,infrastructure,presentation}

# Criar estrutura shared
mkdir -p src/shared/components/ui
mkdir -p src/shared/lib
mkdir -p src/shared/types

# Criar .gitkeep em diretórios vazios
find src/features -type d -empty -exec touch {}/.gitkeep \;
touch src/shared/components/ui/.gitkeep
touch src/shared/lib/.gitkeep
```

**Critério de Sucesso:** Estrutura de diretórios conforme especificação

---

### Task 4: Configurar TypeScript com Path Aliases

**Objetivo:** Configurar tsconfig.json com strict mode e aliases

**Arquivo: tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"],
      "@/features/*": ["./src/features/*"],
      "@/shared/*": ["./src/shared/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

**Pontos Críticos:**
- `"strict": true` é obrigatório
- Paths devem incluir `@/features/*` e `@/shared/*`

---

### Task 5: Configurar ESLint (Flat Config)

**Objetivo:** Configurar ESLint 9 com regras do projeto

**Arquivo: eslint.config.mjs**
```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // TypeScript strict rules
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/no-explicit-any": "error",

      // Enforce consistent imports
      "import/order": ["error", {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": { "order": "asc" }
      }],
    }
  }
];

export default eslintConfig;
```

---

### Task 6: Configurar Prettier

**Objetivo:** Configurar Prettier para formatação consistente

**Arquivo: .prettierrc**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": []
}
```

**Arquivo: .prettierignore**
```
node_modules
.next
.git
pnpm-lock.yaml
```

**Instalar Prettier:**
```bash
pnpm add -D prettier
```

**Adicionar scripts em package.json:**
```json
{
  "scripts": {
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

---

### Task 7: Criar Arquivos Base da Aplicação

**Objetivo:** Criar layout e página inicial

**Arquivo: src/app/layout.tsx**
```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YouFluent',
  description: 'Aprenda inglês com vídeos do YouTube',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
```

**Arquivo: src/app/page.tsx**
```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">YouFluent</h1>
      <p className="mt-4 text-lg text-gray-600">
        Aprenda inglês com vídeos do YouTube
      </p>
    </main>
  )
}
```

**Arquivo: src/app/globals.css**
```css
* {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html,
body {
  max-width: 100vw;
  overflow-x: hidden;
  font-family: system-ui, -apple-system, sans-serif;
}

/* Placeholder styles - Tailwind será configurado em T-003 */
.flex { display: flex; }
.min-h-screen { min-height: 100vh; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.justify-center { justify-content: center; }
.text-4xl { font-size: 2.25rem; }
.font-bold { font-weight: 700; }
.mt-4 { margin-top: 1rem; }
.text-lg { font-size: 1.125rem; }
.text-gray-600 { color: #4b5563; }
```

---

### Task 8: Criar Arquivo de Tipos Compartilhados

**Objetivo:** Criar types base para o projeto

**Arquivo: src/shared/types/index.ts**
```typescript
/**
 * Result pattern para operações que podem falhar
 * Usado em toda a camada de domínio e aplicação
 */
export type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E }

/**
 * Cria um Result de sucesso
 */
export function ok<T>(value: T): Result<T, never> {
  return { success: true, value }
}

/**
 * Cria um Result de erro
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error }
}

/**
 * Tipo para IDs de entidades (branded type)
 */
export type EntityId<T extends string> = string & { readonly __brand: T }

/**
 * Utility type para extrair o tipo de sucesso de um Result
 */
export type ResultValue<R> = R extends Result<infer T, unknown> ? T : never

/**
 * Utility type para extrair o tipo de erro de um Result
 */
export type ResultError<R> = R extends Result<unknown, infer E> ? E : never
```

---

### Task 9: Validar Instalação

**Objetivo:** Executar todos os comandos de validação

**Comandos:**
```bash
# Verificar se servidor inicia
pnpm dev
# Acessar http://localhost:3000 e verificar página

# Verificar lint
pnpm lint

# Verificar tipos
pnpm tsc --noEmit

# Verificar build
pnpm build

# Verificar formatação
pnpm format:check
```

---

## Validation Loop

### Level 1: Syntax & Style

```bash
# ESLint
pnpm lint

# Prettier
pnpm format:check

# Esperado: Sem erros
# Se erros: pnpm lint --fix && pnpm format
```

### Level 2: Type Check

```bash
# TypeScript
pnpm tsc --noEmit

# Esperado: Sem erros de tipo
# Se erros: Verificar imports e tipos
```

### Level 3: Unit Tests

```bash
# Não há testes nesta tarefa (setup)
# Testes serão adicionados a partir de T-004
```

### Level 4: Integration Test

```bash
# Iniciar servidor
pnpm dev

# Em outro terminal, verificar se responde
curl http://localhost:3000

# Esperado: HTML com "YouFluent"
```

### Level 5: Build

```bash
# Build de produção
pnpm build

# Esperado: Build completa sem erros
# Output em .next/
```

---

## Final Validation Checklist

- [ ] `node --version` >= 20.19.0
- [ ] `pnpm dev` inicia sem erros na porta 3000
- [ ] Página exibe "YouFluent" corretamente
- [ ] `pnpm lint` passa sem erros
- [ ] `pnpm tsc --noEmit` passa sem erros
- [ ] `pnpm build` completa sem erros
- [ ] `pnpm format:check` passa sem erros
- [ ] Estrutura `src/features/{lesson,player,transcript}/{domain,application,infrastructure,presentation}` existe
- [ ] Estrutura `src/shared/{components/ui,lib,types}` existe
- [ ] Path alias `@/shared/types` funciona (import sem erro)
- [ ] TypeScript strict mode habilitado
- [ ] Turbopack habilitado (verificar log do dev server)

---

## Anti-Patterns to Avoid

- **NAO instalar Tailwind** - Será configurado em T-003 com v4
- **NAO criar .eslintrc.json** - Next.js 15+ usa flat config (eslint.config.mjs)
- **NAO usar yarn ou npm** - Projeto usa pnpm
- **NAO criar Pages Router** - Apenas App Router
- **NAO criar testes ainda** - TDD começa em T-004 (domain)
- **NAO adicionar dependências extras** - Apenas o mínimo necessário
- **NAO remover protótipo Python/HTML** - Manter para referência, mover se necessário
- **NAO configurar Prisma** - Será T-002
- **NAO adicionar componentes UI** - shadcn/ui será T-003

---

## Pós-Implementação

**Data:** 2026-01-03
**Status:** Implementado

### Arquivos Criados/Modificados
- `package.json` - Configuração do projeto Next.js
- `next.config.ts` - Configuração do Next.js
- `tsconfig.json` - TypeScript com strict mode e path aliases
- `eslint.config.mjs` - ESLint 9 flat config
- `.prettierrc` - Configuração Prettier
- `.prettierignore` - Arquivos ignorados pelo Prettier
- `next-env.d.ts` - Tipos do Next.js
- `src/app/layout.tsx` - Root layout
- `src/app/page.tsx` - Página inicial
- `src/app/globals.css` - Estilos base (placeholder para Tailwind)
- `src/shared/types/index.ts` - Result pattern e tipos base
- `src/features/lesson/{domain,application,infrastructure,presentation}/.gitkeep`
- `src/features/player/{domain,application,infrastructure,presentation}/.gitkeep`
- `src/features/transcript/{domain,application,infrastructure,presentation}/.gitkeep`
- `src/shared/components/ui/.gitkeep`
- `src/shared/lib/.gitkeep`

### Testes
- Não aplicável nesta tarefa (setup)
- TDD começa em T-004

### Validation Gates
- [x] Lint: passou
- [x] Type-check: passou
- [x] Format-check: passou
- [x] Build: passou

### Erros Encontrados e Soluções
1. **TypeScript verificando pastas externas**: tsconfig.json estava incluindo `use-cases/` e outras pastas com projetos separados. Solução: adicionado ao `exclude` do tsconfig.json.
2. **Prettier verificando arquivos de contexto**: Arquivos .md e .html existentes não estavam formatados. Solução: adicionados ao `.prettierignore`.

### Decisões Tomadas Durante Implementação
1. **Next.js 15.5.9 ao invés de 16**: Next.js 16 não está disponível como versão stable. Instalado 15.5.9 (latest) conforme fallback documentado.
2. **Configuração manual**: Como a pasta já continha arquivos do framework, optamos por configurar manualmente ao invés de usar create-next-app.
3. **Exclusão de subprojetos**: Pastas `use-cases/`, `claude-code-full-guide/`, `examples/`, `validation/` excluídas do TypeScript e Prettier para evitar conflitos.

### Desvios do Plano Original
- Nenhum desvio significativo. A única diferença foi a versão do Next.js (15.5.9 vs 16.1.1).

---

**Nota de Confiança: 10/10**

Razão: Implementação concluída com sucesso. Todas as validações passando.
