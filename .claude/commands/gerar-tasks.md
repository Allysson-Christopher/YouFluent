# Gerar Tasks

## Input opcional: $ARGUMENTS

Gera uma lista de tarefas atomicas baseada no PRD e Arquitetura.

> **Principio Core:** 1 Tarefa = 1 Arquivo = 1 PRP = 1 Sessao
> **Estrutura:** Uma tarefa por arquivo (T-001.md, T-002.md, ...)
> **Progresso:** Via Git (commits), nao via arquivos

---

## CONTEXTO DO PROJETO: YouFluent

### Stack Tecnologica
| Tecnologia | Versao |
|------------|--------|
| Next.js | 16.1.1+ |
| React | 19.2.x |
| TypeScript | 5.9.x |
| Node.js | 20.19+ |
| Prisma | 7.x (com @prisma/adapter-pg) |
| PostgreSQL | 16 (Docker Compose) |
| Zustand | 5.x |
| Zod | latest |
| Tailwind CSS | v4 |
| shadcn/ui | 2.5.x |
| Vitest | 3.0.5+ |
| Playwright | 1.55.1+ |

### Dominios do Projeto
- **lesson** - Licoes geradas por IA
- **player** - Player YouTube
- **transcript** - Transcricoes e cache

### Estrutura de Pastas (Feature-Clean)
```
src/
├── app/                  # Next.js App Router (rotas apenas)
├── features/             # Dominios organizados por feature
│   ├── lesson/           # domain, application, infrastructure, presentation
│   ├── player/
│   └── transcript/
├── shared/               # Codigo compartilhado
└── prisma/               # Schema e migrations
```

### Estrategia de Testes (TDD)
| Camada | TDD | Cobertura | Ferramentas |
|--------|-----|-----------|-------------|
| Domain | Obrigatorio | 100% | Vitest |
| Application | Recomendado | 80-90% | Vitest + mocks |
| Infrastructure | Parcial | 60-80% | Vitest + Testcontainers + MSW |
| Presentation | Nao | E2E apenas | Playwright |

---

## REGRAS CRITICAS - LEIA ANTES DE COMECAR

### 1. PERGUNTAS COM OPCOES NUMERADAS (OBRIGATORIO)

```
SEMPRE faca perguntas neste formato:

"Como voce prefere a granularidade das tarefas?

1. Pequenas (1-2 arquivos cada)
2. Medias (3-5 arquivos cada) - RECOMENDADO
3. Maiores (multiplas camadas cada)

Digite o numero:"
```

**NUNCA** faca perguntas abertas sem opcoes. O usuario deve poder responder apenas digitando um numero.

### 2. OUTPUT MODULAR (OBRIGATORIO)

```
SEMPRE gere arquivos SEPARADOS nesta estrutura:

context/TASKS/
├── _index.md        # Indice (ordem + dependencias)
├── T-001.md         # Tarefa 1
├── T-002.md         # Tarefa 2
├── T-003.md         # Tarefa 3
└── ...              # Uma tarefa por arquivo
```

**NUNCA** agrupe tarefas em um unico arquivo. Cada tarefa deve ter seu proprio arquivo.

---

## PRE-REQUISITOS

Antes de iniciar, carregar os documentos de contexto:

1. **PRD** (`context/PRD/` ou `context/PRD.md`) - **OBRIGATORIO**
2. **Arquitetura** (`context/ARQUITETURA/` ou `context/ARQUITETURA.md`) - **OBRIGATORIO**

Se PRD ou Arquitetura nao existirem, informar o usuario e sugerir executar os comandos correspondentes primeiro.

---

## FASE 1: ANALISE DOS DOCUMENTOS

### Instrucoes para o Claude

1. **Carregar e analisar** todos os documentos de contexto
2. **Extrair funcionalidades** do PRD (secao MoSCoW)
3. **Mapear dependencias tecnicas** da Arquitetura
4. **Identificar a ordem logica** de implementacao

### Analise Automatica (YouFluent)

```
ANALISE DO PRD:
━━━━━━━━━━━━━━━

MUST HAVE (MVP):
   - Player YouTube: Visualizar video com transcricao
   - Transcricoes: Buscar e cachear transcricoes
   - Licoes IA: Gerar licoes com vocabulario e exercicios

DOMINIOS IDENTIFICADOS:
   - player (Player YouTube)
   - transcript (Transcricoes)
   - lesson (Licoes IA)

STACK:
   - Framework: Next.js 16.1.1+
   - UI: React 19.2.x + Tailwind v4 + shadcn/ui
   - Estado: Zustand 5.x
   - ORM: Prisma 7.x + PostgreSQL 16
   - IA: OpenAI SDK 6.1.x

PADROES: DDD, Clean Architecture, TDD, Server-first
```

---

## FASE 2: ENTREVISTA DE REFINAMENTO

### Instrucoes para o Claude

Conduza uma breve entrevista. **FACA UMA PERGUNTA POR VEZ**.

### Roteiro de Perguntas (YouFluent)

```
PERGUNTA 1 - VALIDACAO DO MVP
"Baseado no PRD, identifiquei estas funcionalidades como MVP:

1. Player YouTube - visualizar video com transcricao
2. Transcricoes - buscar, cachear e dividir em chunks
3. Licoes IA - gerar licoes com vocabulario e exercicios

Esta correto?

1. Sim, lista correta
2. Preciso adicionar funcionalidades
3. Preciso remover funcionalidades
4. Preciso ajustar varias coisas

Digite o numero:"

PERGUNTA 2 - PRIORIZACAO
"Sugiro esta ordem de implementacao:

1. Setup (Next.js, Prisma, estrutura DDD)
2. Transcript (domain → infrastructure → application)
3. Player (sincronizacao com chunks)
4. Lesson (geracao com OpenAI)

A ordem esta boa?

1. Sim, ordem correta
2. Quero reordenar
3. Nao tenho preferencia

Digite o numero:"

PERGUNTA 3 - INFRAESTRUTURA INICIAL
"Antes das features, vou criar tarefas de setup:

1. Setup completo (estrutura DDD + Prisma + Tailwind + shadcn + Docker)
2. Setup minimo (estrutura DDD + Prisma apenas)
3. Sem setup (ja tenho projeto configurado)
4. Personalizado

Digite o numero:"

PERGUNTA 4 - GRANULARIDADE
"Granularidade das tarefas?

1. Pequenas (1-2 arquivos cada)
2. Medias (3-5 arquivos cada) - RECOMENDADO
3. Maiores (multiplas camadas cada)

Digite o numero:"

PERGUNTA 5 - TESTES
"Como incluir testes nas tarefas?

1. Testes junto com cada tarefa (TDD integrado)
2. Tarefas de testes separadas ao final
3. Sem tarefas de testes (adicionar depois com /add-tasks)

Digite o numero:"
```

---

## FASE 3: GERACAO DAS TASKS

### Estrutura de Output

```
context/TASKS/
├── _index.md          # Indice (ordem + dependencias)
├── T-001.md           # Tarefa 1
├── T-002.md           # Tarefa 2
├── T-003.md           # Tarefa 3
└── ...
```

### Processo de Geracao

1. **Criar `_index.md`** com:
   - Ordem de execucao
   - Tabela de tarefas (ID, Nome, Tamanho, Prioridade)
   - Grafo de dependencias

2. **Criar um arquivo por tarefa** (`T-XXX.md`):
   - Seguir template padrao
   - Incluir Tags de Contexto
   - Criterios de aceite verificaveis

### Template _index.md (YouFluent)

```markdown
# Tasks: YouFluent

> **Indice de tarefas - carregue apenas este arquivo para visao geral.**
> **Progresso via Git (commits).**

## Ordem de Execucao

```
SETUP
T-001 → T-002 → T-003

TRANSCRIPT
T-004 → T-005 → T-006 → T-007

PLAYER
T-008 → T-009 → T-010

LESSON
T-011 → T-012 → T-013 → T-014

TESTES
T-015 → T-016 → T-017
```

## Lista de Tarefas

### Setup Inicial

| ID | Nome | Tamanho | Prioridade |
|----|------|---------|------------|
| T-001 | Setup Next.js 16 + estrutura DDD | M | Must Have |
| T-002 | Setup Prisma 7 + PostgreSQL | M | Must Have |
| T-003 | Setup Tailwind v4 + shadcn/ui | M | Must Have |

### Transcript

| ID | Nome | Tamanho | Prioridade |
|----|------|---------|------------|
| T-004 | Domain - Transcript entities (VideoId, Chunk, Transcript) | M | Must Have |
| T-005 | Infrastructure - YouTubeTranscriptService | M | Must Have |
| T-006 | Infrastructure - PrismaTranscriptRepository + cache | M | Must Have |
| T-007 | Application - FetchTranscriptUseCase | M | Must Have |

### Player

| ID | Nome | Tamanho | Prioridade |
|----|------|---------|------------|
| T-008 | Domain - Player entities (VideoChunk, PlayerState) | P | Must Have |
| T-009 | Presentation - VideoPlayer + ChunkNavigator | M | Must Have |
| T-010 | Integration - Player sync com Transcript | M | Must Have |

### Lesson

| ID | Nome | Tamanho | Prioridade |
|----|------|---------|------------|
| T-011 | Domain - Lesson entities (Lesson, VocabularyItem, Exercise) | M | Must Have |
| T-012 | Infrastructure - OpenAILessonGenerator | M | Must Have |
| T-013 | Infrastructure - PrismaLessonRepository | M | Must Have |
| T-014 | Application - GenerateLessonUseCase | M | Must Have |

### Testes

| ID | Nome | Tamanho | Prioridade |
|----|------|---------|------------|
| T-015 | Unit TDD - Domain layer (todos os dominios) | M | Should Have |
| T-016 | Integration - Repositories + Services | M | Should Have |
| T-017 | E2E - Fluxo critico (URL → Licao) | M | Should Have |

## Dependencias

| Task | Depende de |
|------|------------|
| T-001 | - |
| T-002 | T-001 |
| T-003 | T-001 |
| T-004 | T-002 |
| T-005 | T-004 |
| T-006 | T-004, T-002 |
| T-007 | T-005, T-006 |
| T-008 | T-004 |
| T-009 | T-003, T-008 |
| T-010 | T-007, T-009 |
| T-011 | T-002 |
| T-012 | T-011 |
| T-013 | T-011, T-002 |
| T-014 | T-012, T-013 |
| T-015 | T-007, T-010, T-014 |
| T-016 | T-015 |
| T-017 | T-016 |

## Verificar Progresso

\`\`\`bash
git log --oneline --grep="T-"
\`\`\`

**Total:** 17 tarefas
```

### Template T-XXX.md (YouFluent)

```markdown
# T-XXX: {Nome da Tarefa}

| Campo | Valor |
|-------|-------|
| **Tamanho** | {P/M/G} |
| **Prioridade** | {Must/Should/Could} |
| **Epic** | {Setup/Transcript/Player/Lesson/Testes} |
| **Depende de** | {T-YYY ou -} |

---

## Contexto

{Resumo em 1-2 linhas}

## Objetivo

{O que entrega quando concluida}

## Escopo

- {Deliverable 1}
- {Deliverable 2}

## Arquivos a Criar/Modificar

```
src/features/{feature}/
├── domain/
│   └── entities/
│       └── {entity}.ts
├── application/
│   └── use-cases/
│       └── {use-case}.ts
└── ...
```

## Implementacao (TDD)

### Domain (TDD Obrigatorio)

```typescript
// Primeiro: teste
// tests/unit/features/{feature}/domain/{entity}.test.ts

// Depois: implementacao
// src/features/{feature}/domain/entities/{entity}.ts
```

## Criterios de Aceite

- [ ] {Criterio verificavel 1}
- [ ] {Criterio verificavel 2}
- [ ] Testes TDD passando (cobertura minima: Domain 100%, App 80%)

## Validacao

\`\`\`bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
\`\`\`

---

## Tags de Contexto

\`\`\`
PRD: features/{feature}
ARQUITETURA: dominios/{dominio}
\`\`\`
```

---

## PROXIMOS PASSOS

Apos gerar as tasks, informar:

```
Tasks geradas com sucesso!

ESTRUTURA:
   context/TASKS/
   ├── _index.md (indice)
   ├── T-001.md
   ├── T-002.md
   └── ... ({N} arquivos)

Resumo:
   - {N} tarefas no total
   - Epics: Setup, Transcript, Player, Lesson, Testes
   - Primeira: T-001 - Setup Next.js 16 + estrutura DDD
   - Todas com Tags de Contexto

PROGRESSO: Via Git
   git log --oneline --grep="T-"

Para comecar:
   /next
```

---

## REGRAS DE QUEBRA (YouFluent)

### Tamanho Ideal

```
Uma tarefa deve:
- Caber em UMA sessao do Claude Code
- Tocar 1-3 arquivos principais (+ testes)
- Ter criterios de aceite claros
```

### Padrao de Quebra por Camada DDD

```
Feature: Transcript
│
├── T-0X1: Domain - Entities e Value Objects
│          (src/features/transcript/domain/)
│          TDD Obrigatorio - 100% cobertura
│
├── T-0X2: Infrastructure - Services externos
│          (src/features/transcript/infrastructure/services/)
│          Testar com MSW
│
├── T-0X3: Infrastructure - Repository
│          (src/features/transcript/infrastructure/repositories/)
│          Testar com Testcontainers
│
└── T-0X4: Application - Use Cases
│          (src/features/transcript/application/use-cases/)
│          TDD Recomendado - 80% cobertura
│
└── T-0X5: Presentation - Components
           (src/features/transcript/presentation/)
           Server Components por padrao
```

---

## CHECKLIST

- [ ] PRD e Arquitetura carregados
- [ ] MVP validado com usuario
- [ ] Ordem de execucao definida
- [ ] Um arquivo por tarefa criado
- [ ] _index.md com ordem e dependencias
- [ ] Tags de Contexto em cada tarefa
- [ ] Criterios de aceite verificaveis
- [ ] Estrategia TDD refletida em cada tarefa
- [ ] Comandos de validacao pnpm
