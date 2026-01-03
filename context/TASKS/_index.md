# Tasks: YouFluent

> **Indice de tarefas - carregue apenas este arquivo para visao geral.**
> **Progresso via Git (commits).**

**Total:** 16 tarefas
**Gerado em:** 2026-01-02

---

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

INTEGRATION
T-015 → T-016
```

---

## Lista de Tarefas

### Setup Inicial

| ID | Nome | Tamanho | Prioridade | TDD |
|----|------|---------|------------|-----|
| T-001 | Setup Next.js 16 + estrutura Feature-Clean | M | Must Have | - |
| T-002 | Setup Prisma 7 + PostgreSQL + Docker Compose | M | Must Have | - |
| T-003 | Setup Tailwind v4 + shadcn/ui + Vitest | M | Must Have | - |

### Transcript

| ID | Nome | Tamanho | Prioridade | TDD |
|----|------|---------|------------|-----|
| T-004 | Domain - Transcript entities (VideoId, Chunk, Transcript) | M | Must Have | 100% |
| T-005 | Infrastructure - YouTubeTranscriptService | M | Must Have | MSW |
| T-006 | Infrastructure - PrismaTranscriptRepository | M | Must Have | Testcontainers |
| T-007 | Application - FetchTranscriptUseCase | M | Must Have | 80% |

### Player

| ID | Nome | Tamanho | Prioridade | TDD |
|----|------|---------|------------|-----|
| T-008 | Domain - Player entities (VideoChunk, PlayerState) | P | Must Have | 100% |
| T-009 | Presentation - VideoPlayer + YouTube IFrame API | M | Must Have | - |
| T-010 | Presentation - ChunkNavigator + Zustand store | M | Must Have | - |

### Lesson

| ID | Nome | Tamanho | Prioridade | TDD |
|----|------|---------|------------|-----|
| T-011 | Domain - Lesson entities (Lesson, VocabularyItem, Exercise) | M | Must Have | 100% |
| T-012 | Infrastructure - OpenAILessonGenerator | M | Must Have | MSW |
| T-013 | Infrastructure - PrismaLessonRepository | M | Must Have | Testcontainers |
| T-014 | Application - GenerateLessonUseCase | M | Must Have | 80% |

### Integration

| ID | Nome | Tamanho | Prioridade | TDD |
|----|------|---------|------------|-----|
| T-015 | Presentation - LessonCard + ExercisePanel + VocabularyList | M | Must Have | - |
| T-016 | Pages - Home + Lesson page + routing | M | Must Have | E2E |

---

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
| T-015 | T-014, T-010 |
| T-016 | T-015 |

---

## Verificar Progresso

```bash
# Ver ultima tarefa concluida
git log -1 --grep="^feat(T-\|^fix(T-" --format="%s"

# Ver todas as tarefas concluidas
git log --oneline --grep="T-"
```

---

## Estrategia de Testes

| Camada | TDD | Cobertura | Ferramentas |
|--------|-----|-----------|-------------|
| Domain | Obrigatorio | 100% | Vitest |
| Application | Recomendado | 80% | Vitest + mocks |
| Infrastructure | Parcial | 60% | Testcontainers + MSW |
| Presentation | Nao | E2E | Playwright |

---

*Gerado pelo Context Engineering Framework v2.0*
