# Add Tasks (Incremental)

## Input opcional: $ARGUMENTS

Adiciona novas tarefas **incrementalmente** ao sistema existente.

> **Diferenca do `/gerar-tasks`:** Este comando ADICIONA tarefas a um projeto ja em andamento.
> O `/gerar-tasks` e para geracao inicial (batch) a partir do PRD.

---

## CONTEXTO DO PROJETO: YouFluent

### Stack Tecnologica
| Tecnologia | Versao |
|------------|--------|
| Next.js | 16.1.1+ |
| React | 19.2.x |
| TypeScript | 5.9.x |
| Node.js | 20.19+ |
| Prisma | 7.x (com Driver Adapters) |
| PostgreSQL | 16 (Docker Compose) |
| Zustand | 5.x |
| Zod | latest |
| Tailwind CSS | v4 |
| shadcn/ui | 2.5.x |

### Dominios do Projeto
- **lesson** - Licoes geradas por IA
- **player** - Player YouTube
- **transcript** - Transcricoes e cache

### Estrategia de Testes (TDD)
| Camada | TDD | Cobertura | Ferramentas |
|--------|-----|-----------|-------------|
| Domain | Obrigatorio | 100% | Vitest |
| Application | Recomendado | 80-90% | Vitest + mocks |
| Infrastructure | Parcial | 60-80% | Vitest + Testcontainers + MSW |
| Presentation | Nao | E2E apenas | Playwright |

---

## REGRAS CRITICAS

### 1. PERGUNTAS COM OPCOES NUMERADAS (OBRIGATORIO)

```
SEMPRE faca perguntas neste formato:

"Que tipo de tarefas adicionar?

1. Testes (E2E, integracao, unit)
2. Bug fixes / Correcoes
3. Nova feature
4. Refatoracao
5. Outro

Digite o numero:"
```

**NUNCA** faca perguntas abertas sem opcoes.

### 2. PRESERVAR TAREFAS EXISTENTES (OBRIGATORIO)

- **NUNCA** sobrescrever tarefas existentes
- **SEMPRE** continuar a numeracao (T-031 existe → criar T-032, T-033...)
- **SEMPRE** adicionar nova secao no `_index.md` sem remover existentes

---

## MODOS DE USO

### 1. Modo Interativo (sem argumentos)
```bash
/add-tasks
```
Conduz entrevista para definir tarefas.

### 2. Modo Descricao Livre
```bash
/add-tasks "criar testes E2E com Playwright para todas as features"
```
Interpreta descricao e sugere tarefas.

### 3. Modo com Epic Explicito
```bash
/add-tasks --epic="Testes E2E" "testar player, transcript, lesson"
```
Cria tarefas agrupadas em um Epic.

---

## FASE 1: DETECTAR ESTADO ATUAL

### Instrucoes para o Claude

Antes de qualquer coisa, verificar estado atual:

```bash
# 1. Verificar ultima tarefa existente
ls context/TASKS/T-*.md | sort -V | tail -1

# 2. Ler indice atual
cat context/TASKS/_index.md

# 3. Ver ultima tarefa concluida (Git)
git log -1 --grep="^feat(T-\|^fix(T-" --format="%s" 2>/dev/null || echo "NENHUM"
```

**Extrair:**
- Ultimo ID de tarefa (ex: T-031)
- Proximo ID disponivel (ex: T-032)
- Epics/secoes existentes no _index.md
- Status do projeto (quantas tarefas concluidas)

**Informar ao usuario:**
```
ESTADO ATUAL DO PROJETO
=======================
Tarefas existentes: 31 (T-001 a T-031)
Tarefas concluidas: 31 (via Git)
Proximo ID: T-032

Epics existentes:
- Setup Inicial (T-001 a T-003)
- Player YouTube (T-004 a T-007)
- Transcricoes (T-008 a T-011)
- Licoes IA (T-012 a T-015)
- ...
```

---

## FASE 2: ENTREVISTA (Modo Interativo)

### Se SEM argumentos, conduzir entrevista

**FACA UMA PERGUNTA POR VEZ.**

```
PERGUNTA 1 - TIPO DE TAREFA
"Que tipo de tarefas adicionar?

1. Testes (E2E, integracao, unit)
2. Bug fixes / Correcoes
3. Nova feature
4. Refatoracao / Tech debt
5. Documentacao
6. Outro (descricao livre)

Digite o numero:"
```

### Se resposta = 1 (Testes)

```
PERGUNTA 1.1 - TIPO DE TESTE
"Que tipo de testes?

1. E2E (Playwright)
2. Integracao (Testcontainers + MSW)
3. Unit tests (Vitest - TDD)
4. Todos os tipos

Digite o numero:"
```

```
PERGUNTA 1.2 - COBERTURA
"Quais areas cobrir com testes?

1. Todas as features existentes (player, transcript, lesson)
2. Selecionar features especificas
3. Camada especifica (domain, application, infrastructure)
4. Descrever manualmente

Digite o numero:"
```

Se resposta = 1 (Todas as features):
```
PERGUNTA 1.3 - GRANULARIDADE
"Identificamos estas features:
- Player YouTube
- Transcricoes
- Licoes IA

Quantas tarefas criar?

1. Uma tarefa por feature (3 tarefas: T-032 a T-034)
2. Uma tarefa geral (1 tarefa: T-032)
3. Por camada DDD para cada feature (12 tarefas)

Digite o numero:"
```

### Se resposta = 2 (Bug fixes)

```
PERGUNTA 2.1 - BUGS
"Descreva os bugs a corrigir (um por linha):

Exemplo:
- Player nao sincroniza com chunk selecionado
- Cache de transcricao nao persiste
- Licao IA gera vocabulario duplicado

Digite os bugs:"
```

### Se resposta = 3 (Nova feature)

```
PERGUNTA 3.1 - FEATURE
"Descreva a nova feature:

Exemplo: Sistema de progresso do usuario com salvamento local

Digite a descricao:"
```

```
PERGUNTA 3.2 - CAMADAS DDD
"Quantas tarefas para esta feature?

1. Uma tarefa (implementacao completa)
2. Por camada DDD (Domain, Application, Infrastructure, Presentation)
3. Personalizado

Digite o numero:"
```

### Se resposta = 4 (Refatoracao)

```
PERGUNTA 4.1 - REFATORACAO
"Que tipo de refatoracao?

1. Performance
2. Arquitetura / Organizacao
3. Atualizacao de dependencias
4. Remocao de tech debt
5. Outro

Digite o numero:"
```

### Se resposta = 6 (Outro)

```
PERGUNTA 6.1 - DESCRICAO LIVRE
"Descreva as tarefas que deseja adicionar:

Digite a descricao:"
```

---

## FASE 3: INTERPRETAR DESCRICAO (Modo Livre)

### Se com argumentos (descricao livre)

1. **Analisar a descricao** fornecida
2. **Identificar tipo** (testes, bugs, feature, refatoracao)
3. **Extrair itens** individuais
4. **Propor lista de tarefas** para confirmacao

```
ANALISE DA DESCRICAO
====================
Input: "criar testes E2E com Playwright para todas as features"

Tipo identificado: Testes E2E
Features a cobrir: Todas (3)

TAREFAS PROPOSTAS:
1. T-032: E2E - Testes do Player YouTube
2. T-033: E2E - Testes de Transcricoes
3. T-034: E2E - Testes de Licoes IA

Confirma a criacao destas tarefas?

1. Sim, criar todas
2. Quero ajustar a lista
3. Cancelar

Digite o numero:"
```

---

## FASE 4: GERAR ARQUIVOS

### Processo de Geracao

1. **Criar arquivos T-XXX.md** para cada tarefa
2. **Atualizar _index.md** com nova secao

### Template T-XXX.md (Testes E2E - YouFluent)

```markdown
# T-XXX: E2E - Testes de {Feature}

| Campo | Valor |
|-------|-------|
| **Tamanho** | M |
| **Prioridade** | Should Have |
| **Epic** | Testes E2E |
| **Depende de** | T-YYY |

---

## Contexto

Testes end-to-end para garantir funcionamento correto da feature {Feature} em cenarios reais de uso.

## Objetivo

Cobertura E2E completa da feature {Feature} com Playwright.

## Escopo

- Setup do Playwright (se nao existir)
- Testes dos fluxos principais
- Testes de casos de erro
- Testes de responsividade (opcional)

## Cenarios a Testar

### Fluxo Principal (Happy Path)
- [ ] {Cenario 1}
- [ ] {Cenario 2}

### Casos de Erro
- [ ] {Erro 1}
- [ ] {Erro 2}

### Edge Cases
- [ ] {Edge case 1}

## Arquivos a Criar

```
tests/
└── e2e/
    └── {feature}.spec.ts
```

## Implementacao

```typescript
import { test, expect } from '@playwright/test'

test.describe('{Feature}', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('deve {acao principal}', async ({ page }) => {
    // Arrange
    // Act
    // Assert
  })

  test('deve mostrar erro quando {condicao de erro}', async ({ page }) => {
    // Test error handling
  })
})
```

## Criterios de Aceite

- [ ] Todos os cenarios do fluxo principal passam
- [ ] Casos de erro estao cobertos
- [ ] Testes rodam em < 60s
- [ ] Nenhum teste flaky (rodar 3x sem falha)

## Validacao

```bash
pnpm exec playwright test {feature}.spec.ts
pnpm exec playwright test {feature}.spec.ts --repeat-each=3
```

---

## Tags de Contexto

```
PRD: features/{feature}
ARQUITETURA: stack, decisoes/adr-005-testing-strategy
```
```

### Template T-XXX.md (Unit Tests TDD - YouFluent)

```markdown
# T-XXX: Unit - Testes de {Camada} para {Feature}

| Campo | Valor |
|-------|-------|
| **Tamanho** | M |
| **Prioridade** | Must Have |
| **Epic** | Testes TDD |
| **Depende de** | T-YYY |

---

## Contexto

Testes unitarios TDD para a camada {Domain/Application} da feature {Feature}.

## Objetivo

Cobertura {100%/80-90%} da camada {Domain/Application} com TDD.

## Escopo

- Testes de entidades e value objects
- Testes de use cases
- Testes de regras de negocio

## Processo TDD

```
1. RED    - Escrever teste que falha
2. GREEN  - Codigo minimo para passar
3. REFACTOR - Melhorar mantendo testes verdes
```

## Arquivos a Criar

```
tests/
└── unit/
    └── features/
        └── {feature}/
            ├── domain/
            │   └── {entity}.test.ts
            └── application/
                └── {use-case}.test.ts
```

## Implementacao

```typescript
import { describe, it, expect } from 'vitest'
import { {Entity} } from '@/features/{feature}/domain/entities/{entity}'

describe('{Entity}', () => {
  it('should {comportamento esperado}', () => {
    // Arrange
    const input = {}

    // Act
    const result = {Entity}.create(input)

    // Assert
    expect(result.isSuccess).toBe(true)
  })

  it('should fail when {condicao de falha}', () => {
    // Test error case
  })
})
```

## Criterios de Aceite

- [ ] Cobertura {100%/80-90%} atingida
- [ ] Todos os testes passam
- [ ] TDD seguido (teste primeiro)

## Validacao

```bash
pnpm test:unit --coverage
pnpm vitest run tests/unit/features/{feature}/ --coverage
```

---

## Tags de Contexto

```
PRD: features/{feature}
ARQUITETURA: dominios/{feature}, decisoes/adr-005-testing-strategy
```
```

### Template T-XXX.md (Integration Tests - YouFluent)

```markdown
# T-XXX: Integration - Testes de {Repository/Service}

| Campo | Valor |
|-------|-------|
| **Tamanho** | M |
| **Prioridade** | Should Have |
| **Epic** | Testes Integracao |
| **Depende de** | T-YYY |

---

## Contexto

Testes de integracao para {Repository/Service} usando banco real (Testcontainers) e mocks de APIs externas (MSW).

## Objetivo

Validar integracao com PostgreSQL e APIs externas (YouTube, OpenAI).

## Escopo

- Setup Testcontainers para PostgreSQL
- Setup MSW para mocking de APIs
- Testes de repositories Prisma
- Testes de servicos externos

## Arquivos a Criar

```
tests/
├── integration/
│   └── {feature}/
│       └── {repository}.test.ts
├── mocks/
│   ├── youtube.ts
│   └── openai.ts
└── setup/
    ├── testcontainers.ts
    └── msw-server.ts
```

## Implementacao

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { PrismaClient } from '@prisma/client'

describe('{Repository}', () => {
  let container: StartedPostgreSqlContainer
  let prisma: PrismaClient

  beforeAll(async () => {
    container = await new PostgreSqlContainer().start()
    prisma = new PrismaClient({
      datasources: { db: { url: container.getConnectionUri() } }
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await container.stop()
  })

  it('should save and retrieve {entity}', async () => {
    // Arrange
    const repo = new Prisma{Entity}Repository(prisma)

    // Act
    await repo.save(entity)
    const found = await repo.findById(entity.id)

    // Assert
    expect(found).toEqual(entity)
  })
})
```

## Criterios de Aceite

- [ ] Testcontainers configurado e funcionando
- [ ] MSW mockando APIs externas
- [ ] Cobertura 60-80% atingida
- [ ] Testes passam com DB real

## Validacao

```bash
docker --version  # Verificar Docker instalado
pnpm test:integration
```

---

## Tags de Contexto

```
PRD: features/{feature}
ARQUITETURA: dominios/{feature}, decisoes/adr-005-testing-strategy
```
```

### Template T-XXX.md (Bug Fix - YouFluent)

```markdown
# T-XXX: Fix - {Descricao do Bug}

| Campo | Valor |
|-------|-------|
| **Tamanho** | P |
| **Prioridade** | Must Have |
| **Epic** | Bug Fixes |
| **Depende de** | - |

---

## Contexto

Bug reportado: {descricao do problema}

## Objetivo

Corrigir o bug garantindo que {comportamento esperado}.

## Reproducao

1. {Passo 1}
2. {Passo 2}
3. {Resultado atual vs esperado}

## Escopo

- Identificar causa raiz
- Implementar correcao
- Adicionar teste de regressao (TDD)

## Arquivos a Modificar

```
src/features/{feature}/
└── {caminho do arquivo afetado}
tests/
└── unit/features/{feature}/
    └── {teste de regressao}
```

## Criterios de Aceite

- [ ] Bug nao reproduz mais
- [ ] Teste de regressao adicionado (TDD)
- [ ] Nenhuma regressao em testes existentes
- [ ] Lint e type-check passam

## Validacao

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

---

## Tags de Contexto

```
PRD: features/{feature-afetada}
ARQUITETURA: dominios/{dominio-afetado}
```
```

### Template T-XXX.md (Nova Feature - YouFluent)

```markdown
# T-XXX: {Camada} - {Nome da Feature}

| Campo | Valor |
|-------|-------|
| **Tamanho** | M |
| **Prioridade** | {Should/Could} Have |
| **Epic** | {Nome do Epic} |
| **Depende de** | T-YYY |

---

## Contexto

{Por que esta feature e necessaria}

## Objetivo

{O que sera entregue}

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
├── infrastructure/
│   └── repositories/
│       └── prisma-{entity}-repository.ts
└── presentation/
    └── components/
        └── {component}.tsx
```

## Implementacao (TDD)

### 1. Domain (TDD Obrigatorio)

```typescript
// Primeiro: teste
// tests/unit/features/{feature}/domain/{entity}.test.ts
describe('{Entity}', () => {
  it('should create valid {entity}', () => {
    const result = {Entity}.create({ ... })
    expect(result.isSuccess).toBe(true)
  })
})

// Depois: implementacao
// src/features/{feature}/domain/entities/{entity}.ts
```

### 2. Application (TDD Recomendado)

```typescript
// Primeiro: teste com mocks
// tests/unit/features/{feature}/application/{use-case}.test.ts
describe('{UseCase}', () => {
  it('should {acao esperada}', async () => {
    const mockRepo = { ... }
    const useCase = new {UseCase}(mockRepo)
    const result = await useCase.execute(input)
    expect(result).toEqual(expected)
  })
})
```

## Criterios de Aceite

- [ ] {Criterio 1}
- [ ] {Criterio 2}
- [ ] Testes TDD passando (Domain 100%, Application 80%+)
- [ ] Lint e type-check passam
- [ ] Build passa

## Validacao

```bash
pnpm lint
pnpm type-check
pnpm test
pnpm build
```

---

## Tags de Contexto

```
PRD: features/{feature}
ARQUITETURA: dominios/{dominio}, padroes
```
```

### Atualizar _index.md

Adicionar nova secao **SEM REMOVER** secoes existentes:

```markdown
### {Nome do Epic} (NOVO)

| ID | Nome | Tamanho | Prioridade |
|----|------|---------|------------|
| T-032 | {nome} | M | Should Have |
| T-033 | {nome} | M | Should Have |
| ...
```

Atualizar secao "Ordem de Execucao":

```markdown
## Ordem de Execucao

```
... (manter existente)

{NOME DO EPIC} (NOVO)
T-032 → T-033 → T-034 → ...
```
```

Atualizar secao "Dependencias":

```markdown
## Dependencias

| Task | Depende de |
|------|------------|
| ... (manter existente) |
| T-032 | T-031 |
| T-033 | T-032 |
| ...
```

Atualizar totais:

```markdown
**Total:** {N} tarefas (era 31, agora 38)
```

---

## FASE 5: CONFIRMAR E REPORTAR

### Output Final

```
TAREFAS ADICIONADAS COM SUCESSO
===============================

Epic: {Nome do Epic}
Tarefas criadas: {N} (T-032 a T-0XX)

Arquivos criados:
- context/TASKS/T-032.md
- context/TASKS/T-033.md
- ...
- context/TASKS/_index.md (atualizado)

Resumo:
- Total de tarefas: {N total} (eram 31, agora {N total})
- Proxima tarefa: T-032 - {nome}

Para executar:
/next

Ou gerar PRP especifico:
/generate-prp T-032
```

---

## EXEMPLOS COMPLETOS (YouFluent)

### Exemplo 1: Testes E2E

```
Usuario: /add-tasks "criar testes E2E com Playwright para player, transcript e lesson"

Claude:
ANALISE DA DESCRICAO
====================
Tipo identificado: Testes E2E
Features: player, transcript, lesson

TAREFAS PROPOSTAS:
1. T-032: E2E - Testes do Player YouTube
2. T-033: E2E - Testes de Transcricoes
3. T-034: E2E - Testes de Licoes IA

Confirma?

Usuario: 1

Claude:
[Cria arquivos e atualiza _index.md]
...
```

### Exemplo 2: Testes TDD por Camada

```
Usuario: /add-tasks "testes unitarios TDD para domain layer"

Claude:
ANALISE DA DESCRICAO
====================
Tipo identificado: Unit Tests (TDD)
Camada: Domain
Features: player, transcript, lesson

TAREFAS PROPOSTAS:
1. T-032: Unit TDD - Domain Transcript (VideoId, Chunk, Transcript)
2. T-033: Unit TDD - Domain Player (VideoChunk, PlayerState)
3. T-034: Unit TDD - Domain Lesson (Lesson, VocabularyItem, Exercise)

Confirma?
...
```

### Exemplo 3: Integration Tests

```
Usuario: /add-tasks "testes de integracao com Testcontainers e MSW"

Claude:
TAREFAS PROPOSTAS:
1. T-032: Integration - Setup Testcontainers e MSW
2. T-033: Integration - TranscriptRepository com PostgreSQL
3. T-034: Integration - LessonRepository com PostgreSQL
4. T-035: Integration - YouTubeTranscriptService com MSW
5. T-036: Integration - OpenAILessonGenerator com MSW

Confirma?
...
```

---

## CHECKLIST DE QUALIDADE

Antes de finalizar, verificar:

- [ ] Estado atual detectado corretamente
- [ ] IDs sequenciais (sem gaps, sem duplicatas)
- [ ] Arquivos T-XXX.md criados com template correto
- [ ] Tags de Contexto em cada tarefa
- [ ] _index.md atualizado (nova secao, ordem, dependencias, totais)
- [ ] Criterios de aceite verificaveis
- [ ] Comandos de validacao executaveis (pnpm)
- [ ] Estrategia TDD refletida nos templates

---

## INTEGRACAO COM FLUXO

Apos adicionar tarefas:

```bash
# Fluxo normal continua funcionando
/next           # Detecta T-032, gera PRP, executa

# Ou manualmente
/generate-prp T-032
/execute-prp PRPs/032-e2e-player/PRP.md
```

O `/generate-prp` modo AUTO detectara automaticamente as novas tarefas via Git + _index.md.
