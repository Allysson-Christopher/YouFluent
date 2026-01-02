# Add Tasks (Incremental)

## Input opcional: $ARGUMENTS

Adiciona novas tarefas **incrementalmente** ao sistema existente.

> **Diferenca do `/gerar-tasks`:** Este comando ADICIONA tarefas a um projeto ja em andamento.
> O `/gerar-tasks` e para geracao inicial (batch) a partir do PRD.

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
/add-tasks --epic="Testes E2E" "testar auth, equipes, tarefas"
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
- Autenticacao (T-004 a T-007)
- Equipes (T-008 a T-011)
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

1. E2E (Playwright/Cypress)
2. Integracao
3. Unit tests
4. Todos os tipos

Digite o numero:"
```

```
PERGUNTA 1.2 - COBERTURA
"Quais areas cobrir com testes?

1. Todas as features existentes
2. Selecionar features especificas
3. Area especifica do codigo
4. Descrever manualmente

Digite o numero:"
```

Se resposta = 1 (Todas as features):
```
PERGUNTA 1.3 - GRANULARIDADE
"Identificamos estas features:
- Autenticacao
- Equipes
- Investigacoes
- Tarefas
- Lembretes
- Notas e Anexos
- Colaboracao

Quantas tarefas criar?

1. Uma tarefa por feature (7 tarefas: T-032 a T-038)
2. Uma tarefa geral (1 tarefa: T-032)
3. Agrupar por complexidade (ex: 3 tarefas)

Digite o numero:"
```

### Se resposta = 2 (Bug fixes)

```
PERGUNTA 2.1 - BUGS
"Descreva os bugs a corrigir (um por linha):

Exemplo:
- Login nao redireciona apos autenticacao
- Filtro de tarefas nao persiste
- Drag and drop quebra em mobile

Digite os bugs:"
```

### Se resposta = 3 (Nova feature)

```
PERGUNTA 3.1 - FEATURE
"Descreva a nova feature:

Exemplo: Sistema de notificacoes push com Firebase

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
Features a cobrir: Todas (7)

TAREFAS PROPOSTAS:
1. T-032: E2E - Testes de Autenticacao
2. T-033: E2E - Testes de Equipes
3. T-034: E2E - Testes de Investigacoes
4. T-035: E2E - Testes de Gestao de Tarefas
5. T-036: E2E - Testes de Lembretes
6. T-037: E2E - Testes de Notas e Anexos
7. T-038: E2E - Testes de Colaboracao

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

### Template T-XXX.md (Testes E2E)

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
    // Setup: login, navegacao, etc
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
npx playwright test {feature}.spec.ts
npx playwright test {feature}.spec.ts --repeat-each=3
```

---

## Tags de Contexto

```
PRD: features/{feature}
ARQUITETURA: stack
```
```

### Template T-XXX.md (Bug Fix)

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
- Adicionar teste de regressao

## Arquivos a Modificar

```
src/
└── {caminho do arquivo afetado}
tests/
└── {teste de regressao}
```

## Criterios de Aceite

- [ ] Bug nao reproduz mais
- [ ] Teste de regressao adicionado
- [ ] Nenhuma regressao em testes existentes

## Validacao

```bash
npm run test
npm run build
```

---

## Tags de Contexto

```
PRD: features/{feature-afetada}
ARQUITETURA: {camada-afetada}
```
```

### Template T-XXX.md (Nova Feature)

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
src/
└── {estrutura de arquivos}
```

## Implementacao

{Pseudocodigo ou exemplos}

## Criterios de Aceite

- [ ] {Criterio 1}
- [ ] {Criterio 2}

## Validacao

```bash
{comandos de validacao}
```

---

## Tags de Contexto

```
PRD: features/{feature}
ARQUITETURA: dominios/{dominio}
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

## EXEMPLOS COMPLETOS

### Exemplo 1: Testes E2E (Interativo)

```
Usuario: /add-tasks

Claude:
ESTADO ATUAL DO PROJETO
=======================
Tarefas existentes: 31 (T-001 a T-031)
Proximo ID: T-032

Que tipo de tarefas adicionar?

1. Testes (E2E, integracao, unit)
2. Bug fixes / Correcoes
3. Nova feature
4. Refatoracao / Tech debt
5. Documentacao
6. Outro

Digite o numero:

Usuario: 1

Claude:
Que tipo de testes?

1. E2E (Playwright/Cypress)
2. Integracao
3. Unit tests
4. Todos os tipos

Digite o numero:

Usuario: 1

Claude:
Quais areas cobrir com testes E2E?

1. Todas as features existentes
2. Selecionar features especificas
3. Descrever manualmente

Digite o numero:

Usuario: 1

Claude:
Features identificadas:
- Autenticacao (F07)
- Equipes (F05)
- Investigacoes (F02)
- Gestao de Tarefas (F01)
- Lembretes (F03)
- Notas e Anexos (F04)
- Colaboracao (F06)

Quantas tarefas criar?

1. Uma tarefa por feature (7 tarefas: T-032 a T-038)
2. Uma tarefa geral (1 tarefa: T-032)
3. Agrupar por complexidade

Digite o numero:

Usuario: 1

Claude:
[Cria 7 arquivos T-032.md a T-038.md]
[Atualiza _index.md]

TAREFAS ADICIONADAS COM SUCESSO
===============================
...
```

### Exemplo 2: Bug Fixes (Descricao Livre)

```
Usuario: /add-tasks "corrigir: login nao redireciona, filtro nao persiste, drag quebra em mobile"

Claude:
ANALISE DA DESCRICAO
====================
Tipo identificado: Bug Fixes
Bugs encontrados: 3

TAREFAS PROPOSTAS:
1. T-032: Fix - Login nao redireciona apos autenticacao
2. T-033: Fix - Filtro de tarefas nao persiste
3. T-034: Fix - Drag and drop quebra em mobile

Confirma a criacao destas tarefas?

1. Sim, criar todas
2. Quero ajustar
3. Cancelar

Usuario: 1

Claude:
[Cria arquivos e atualiza _index.md]
...
```

### Exemplo 3: Nova Feature (Com Epic)

```
Usuario: /add-tasks --epic="Notificacoes Push" "implementar notificacoes push com Firebase"

Claude:
ANALISE DA DESCRICAO
====================
Epic: Notificacoes Push
Tipo: Nova Feature

Quantas tarefas criar?

1. Uma tarefa (implementacao completa)
2. Por camada DDD (4 tarefas: Domain, Application, Infrastructure, Presentation)
3. Personalizado

Usuario: 2

Claude:
TAREFAS PROPOSTAS:
1. T-032: Domain - Notification entity + eventos
2. T-033: Application - Push Notification Use Cases
3. T-034: Infrastructure - Firebase Integration
4. T-035: Presentation - UI de permissao + notificacoes

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
- [ ] Comandos de validacao executaveis

---

## INTEGRACAO COM FLUXO

Apos adicionar tarefas:

```bash
# Fluxo normal continua funcionando
/next           # Detecta T-032, gera PRP, executa

# Ou manualmente
/generate-prp T-032
/execute-prp PRPs/032-e2e-auth/PRP.md
```

O `/generate-prp` modo AUTO detectara automaticamente as novas tarefas via Git + _index.md.
