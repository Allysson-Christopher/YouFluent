# Arquitetura: YouFluent

> **Resumo da arquitetura - carregue este arquivo para contexto rapido.**

**Versao:** 2.0
**Data:** 2026-01-02
**Status:** Aprovado

---

## Stack Principal

| Camada | Tecnologia | Versao |
|--------|------------|--------|
| Framework | Next.js | 16.1.1+ |
| Runtime | Node.js | 20.19+ |
| Linguagem | TypeScript | 5.9.x |
| UI | React | 19.2.x |
| Estilizacao | Tailwind CSS | v4 |
| Componentes | shadcn/ui | 2.5.x |
| Estado | Zustand | 5.x |
| Validacao | Zod | latest |
| ORM | Prisma | 7.x |
| Database | PostgreSQL | 16 |
| IA | OpenAI SDK | 6.1.x |

## Estrutura de Diretorios (Feature-Clean)

```
src/
├── app/              # Next.js App Router (rotas apenas)
├── features/         # Dominios organizados por feature
│   ├── lesson/       # Licoes (domain, application, infra, presentation)
│   ├── player/       # Player YouTube
│   └── transcript/   # Transcricoes
├── shared/           # Codigo compartilhado
└── prisma/           # Schema e migrations
```

## Padroes Obrigatorios

- **DDD** - Domain-Driven Design
- **Clean Architecture** - Dependencias apontam para dentro
- **TDD** - Teste primeiro
- **Server-first** - Server Components por padrao

## ADRs Principais

| ADR | Decisao |
|-----|---------|
| ADR-001 | Next.js 16 como framework full-stack |
| ADR-002 | Prisma 7 com Driver Adapters |
| ADR-003 | Zustand para todo gerenciamento de estado |
| ADR-004 | Cache de transcricoes no PostgreSQL |
| ADR-005 | Estrategia de testes com TDD |

---

## Navegacao

| Secao | Arquivo | Quando Usar |
|-------|---------|-------------|
| Diagramas | `ARQUITETURA/visao-geral.md` | Entender sistema |
| Stack | `ARQUITETURA/stack.md` | Escolhas tecnicas |
| Lesson | `ARQUITETURA/dominios/lesson.md` | Implementar licoes |
| Player | `ARQUITETURA/dominios/player.md` | Implementar player |
| Transcript | `ARQUITETURA/dominios/transcript.md` | Implementar transcricoes |
| ADRs | `ARQUITETURA/decisoes/*.md` | Entender decisao |
| Padroes | `ARQUITETURA/padroes.md` | Setup/Refactor |
| Testes | `ARQUITETURA/decisoes/adr-005-testing-strategy.md` | Estrategia de testes |

---

*Gerado em: 2026-01-02*
*Context Engineering Framework v2.0*
