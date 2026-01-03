# Context Manifest - YouFluent

**Versao:** 2.0
**Atualizado:** 2026-01-02

> **Indice central de todo o contexto do projeto.**
> Use este arquivo para navegar rapidamente e carregar apenas o contexto necessario.

---

## Estrutura de Contexto

```
context/
├── MANIFEST.md              # Este arquivo (indice)
├── PRD/
│   ├── _index.md            # Resumo do PRD (~1KB)
│   ├── visao.md             # Visao e proposta de valor
│   ├── personas.md          # Personas e jornadas
│   ├── features/
│   │   ├── player.md        # Feature: Player YouTube
│   │   ├── transcript.md    # Feature: Transcricoes
│   │   └── lesson.md        # Feature: Licoes IA
│   └── requisitos-nao-funcionais.md
├── ARQUITETURA/
│   ├── _index.md            # Resumo da arquitetura (~1KB)
│   ├── visao-geral.md       # Diagramas C4 e overview
│   ├── stack.md             # Stack tecnologica completa
│   ├── padroes.md           # DDD, Clean Arch, TDD, Server-first
│   ├── dominios/
│   │   ├── lesson.md        # Dominio: Licoes
│   │   ├── player.md        # Dominio: Player
│   │   └── transcript.md    # Dominio: Transcricoes
│   └── decisoes/
│       ├── adr-001-nextjs-16.md      # Next.js 16 como framework
│       ├── adr-002-prisma-7.md       # Prisma 7 com Driver Adapters
│       ├── adr-003-zustand.md        # Zustand para estado
│       ├── adr-004-cache-postgres.md # Cache no PostgreSQL
│       └── adr-005-testing-strategy.md # Estrategia de testes TDD
└── TASKS/
    ├── _index.md            # Indice (ordem + dependencias)
    └── T-XXX.md             # Uma tarefa por arquivo
```

---

## Indices por Modulo

### PRD (Product Requirements Document)

| Arquivo | Descricao | Tamanho |
|---------|-----------|---------|
| `PRD/_index.md` | **Resumo executivo** - visao, MVP, metricas | ~1KB |
| `PRD/visao.md` | Visao de longo prazo, proposta de valor | ~2KB |
| `PRD/personas.md` | Lucas (dev), Marina (estudante) | ~2KB |
| `PRD/features/player.md` | Feature: Player YouTube | ~2KB |
| `PRD/features/transcript.md` | Feature: Transcricoes e cache | ~2KB |
| `PRD/features/lesson.md` | Feature: Licoes com IA | ~2KB |
| `PRD/requisitos-nao-funcionais.md` | Performance, seguranca, escala | ~2KB |

**Para carregar contexto de PRD:**
- Tarefa de feature X → `PRD/_index.md` + `PRD/features/X.md`
- Tarefa de UX → `PRD/_index.md` + `PRD/personas.md`
- Tarefa de infra → `PRD/_index.md` + `PRD/requisitos-nao-funcionais.md`

### ARQUITETURA

| Arquivo | Descricao | Tamanho |
|---------|-----------|---------|
| `ARQUITETURA/_index.md` | **Resumo** - stack, padroes, ADRs | ~1KB |
| `ARQUITETURA/visao-geral.md` | Diagramas C4, fluxos | ~3KB |
| `ARQUITETURA/stack.md` | Next.js 16, Prisma 7, Zustand, etc | ~2KB |
| `ARQUITETURA/padroes.md` | DDD, Clean Arch, TDD, Server-first | ~3KB |
| `ARQUITETURA/dominios/lesson.md` | Modelo de dominio: Licoes | ~2KB |
| `ARQUITETURA/dominios/player.md` | Modelo de dominio: Player | ~2KB |
| `ARQUITETURA/dominios/transcript.md` | Modelo de dominio: Transcricoes | ~2KB |
| `ARQUITETURA/decisoes/adr-001-nextjs-16.md` | ADR: Next.js 16 | ~1KB |
| `ARQUITETURA/decisoes/adr-002-prisma-7.md` | ADR: Prisma 7 | ~1KB |
| `ARQUITETURA/decisoes/adr-003-zustand.md` | ADR: Zustand | ~1KB |
| `ARQUITETURA/decisoes/adr-004-cache-postgres.md` | ADR: Cache PostgreSQL | ~1KB |
| `ARQUITETURA/decisoes/adr-005-testing-strategy.md` | ADR: Testes TDD | ~4KB |

**Para carregar contexto de Arquitetura:**
- Tarefa de dominio X → `ARQUITETURA/_index.md` + `ARQUITETURA/dominios/X.md`
- Tarefa de integracao → `ARQUITETURA/_index.md` + `ARQUITETURA/stack.md`
- Tarefa de setup → `ARQUITETURA/_index.md` + `ARQUITETURA/padroes.md`

### TASKS

| Arquivo | Descricao | Tamanho |
|---------|-----------|---------|
| `TASKS/_index.md` | **Indice** - ordem, dependencias | ~0.5KB |
| `TASKS/T-XXX.md` | Uma tarefa por arquivo | ~1KB cada |

**Progresso:** Acompanhado via Git (commits), nao via arquivos.

---

## Stack Principal (Resumo)

| Camada | Tecnologia | Versao |
|--------|------------|--------|
| Framework | Next.js | 16.1.1+ |
| UI | React + Tailwind + shadcn | 19.2.x + v4 |
| Estado | Zustand | 5.x |
| ORM | Prisma | 7.x |
| Database | PostgreSQL | 16 |
| IA | OpenAI SDK | 6.1.x |

---

## Carregamento por Tipo de Tarefa

### Setup/Infraestrutura
```
Carregar:
├── ARQUITETURA/_index.md
├── ARQUITETURA/stack.md
├── ARQUITETURA/padroes.md
└── TASKS/T-XXX.md

~6KB total
```

### Feature de Negocio
```
Carregar:
├── PRD/_index.md
├── PRD/features/{feature}.md
├── ARQUITETURA/_index.md
├── ARQUITETURA/dominios/{dominio}.md
└── TASKS/T-XXX.md

~8KB total
```

### Bug Fix
```
Carregar:
├── ARQUITETURA/_index.md
├── ARQUITETURA/dominios/{dominio-afetado}.md
└── TASKS/T-XXX.md

~4KB total
```

---

## Tags de Contexto

Cada arquivo `TASKS/T-XXX.md` especifica tags de contexto:

```markdown
## Tags de Contexto

```
PRD: features/lesson
ARQUITETURA: dominios/lesson, decisoes/adr-001-nextjs-16
```
```

O loader inteligente (`/carregar-contexto`) usa essas tags para carregar apenas os arquivos necessarios.

---

## Economia de Tokens

| Cenario | Antes (monolitico) | Depois (modular) | Economia |
|---------|-------------------|------------------|----------|
| Setup inicial | ~50KB | ~6KB | **88%** |
| Feature media | ~50KB | ~8KB | **84%** |
| Bug fix | ~50KB | ~4KB | **92%** |
| Refatoracao | ~50KB | ~6KB | **88%** |

**Media:** ~88% de economia de tokens por tarefa

---

## Validacao

Execute `/sync-context` para:
- Verificar links quebrados
- Detectar arquivos orfaos
- Sugerir reorganizacao
- Atualizar este manifest

---

## Referencias

| Documento | Descricao |
|-----------|-----------|
| `CLAUDE.md` | Regras globais do projeto |
| `FUNDACAO_V2.md` | Decisoes tecnicas de fundacao |
| `docs/PILARES.md` | Pilares fundamentais |
| `.claude/commands/` | Comandos do framework |

---

*Manifest gerado pelo Context Engineering Framework*
*Sistema de Contexto Modular v2.0*
