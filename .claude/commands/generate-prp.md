# Generate PRP (Autonomo)

## Input: $ARGUMENTS

Gera um PRP completo de forma **100% autonoma**.

> ⚠️ **VERSÕES:** NÃO pesquisar versões de bibliotecas via WebSearch.
> Usar versões já definidas em `context/ARQUITETURA/stack.md`.
> A pesquisa de versões é responsabilidade EXCLUSIVA do `/gerar-arquitetura`.

> **3 Modos de Operacao:**
> - **AUTO** (sem argumentos): Detecta proxima tarefa via Git + TASKS/
> - **TAREFA** (T-XXX): Usa tarefa especifica
> - **LIVRE** ("descricao"): Descricao textual direta

---

## Modos de Input

### 1. Modo AUTO (sem argumentos)
```bash
/generate-prp
```
Detecta automaticamente a proxima tarefa nao concluida.

### 2. Modo TAREFA (ID especifico)
```bash
/generate-prp T-005
```
Usa a tarefa especificada.

### 3. Modo LIVRE (descricao textual)
```bash
/generate-prp "implementar autenticacao JWT com refresh tokens"
```
Cria PRP a partir de descricao livre.

### 4. Modo INITIAL.md (retrocompatibilidade)
```bash
/generate-prp PRPs/001-auth/INITIAL.md
```
Usa arquivo INITIAL.md existente.

---

## Processo Completo

### Fase 1: Detectar Input e Tarefa

**Se SEM argumentos (Modo AUTO):**

1. Consultar Git para ultima tarefa concluida:
```bash
git log -1 --grep="^feat(T-\|^fix(T-" --format="%s" 2>/dev/null || echo "NENHUM"
```

2. Ler indice de tarefas:
```bash
cat context/TASKS/_index.md
```

3. Determinar proxima tarefa:
   - Se nenhum commit de tarefa → T-001
   - Se ultima foi T-003 → proxima e T-004
   - Seguir ordem de execucao do _index.md

4. Ler arquivo da tarefa:
```bash
cat context/TASKS/T-XXX.md
```

**Se argumento e T-XXX (Modo TAREFA):**

1. Ler arquivo da tarefa diretamente:
```bash
cat context/TASKS/T-XXX.md
```

**Se argumento e descricao ou INITIAL.md (Modo LIVRE):**

1. Pular para Fase 3 (sem carregamento de contexto modular)

### Fase 2: Carregar Contexto via Tags (Modos AUTO e TAREFA)

**Extrair Tags de Contexto do arquivo T-XXX.md:**

O bloco de tags esta no formato:
```markdown
## Tags de Contexto

```
PRD: features/auth
ARQUITETURA: dominios/user, decisoes/adr-001-db
```
```

**Parsear e resolver para arquivos:**

1. Encontrar secao `## Tags de Contexto`
2. Extrair conteudo do bloco de codigo
3. Para cada linha `TIPO: arquivo1, arquivo2`:
   - `PRD: features/auth` → `context/PRD/features/auth.md`
   - `ARQUITETURA: dominios/user` → `context/ARQUITETURA/dominios/user.md`

**Arquivos a carregar (em ordem):**

```
# Sempre incluir indices
context/PRD/_index.md
context/ARQUITETURA/_index.md

# Arquivos especificos das tags
context/PRD/{arquivo}.md
context/ARQUITETURA/{arquivo}.md

# Template do PRP
PRPs/templates/prp_base.md
```

**Fallback se arquivo nao existir:**
1. Tentar arquivo especifico
2. Se nao existir → tentar arquivo legado (context/PRD.md ou context/ARQUITETURA.md)

**Ler todos os arquivos de contexto necessarios antes de prosseguir.**

### Fase 3: Criar Diretorio do PRP

**Nomenclatura:**
- `{numero}` = proximo numero sequencial (verificar PRPs/ existentes)
- `{slug}` = nome em lowercase, palavras separadas por hifen

```bash
# Verificar ultimo numero
ls -d PRPs/[0-9]*/ 2>/dev/null | tail -1

# Criar diretorio
mkdir -p PRPs/{numero}-{slug}/
```

Exemplos:
- `PRPs/001-setup-nextjs/`
- `PRPs/002-prisma-postgresql/`
- `PRPs/003-autenticacao/`

### Fase 4: Pesquisa Profunda

**Analise do Codebase:**
- Identificar padroes existentes relacionados a tarefa
- Encontrar exemplos relevantes em `examples/`
- Detectar stack/linguagem do projeto
- Mapear dependencias e integracoes existentes
- Verificar testes existentes para padroes de validacao

**Pesquisa Externa (se necessario):**
- Buscar documentacao oficial das bibliotecas necessarias
- Encontrar exemplos de implementacao
- Identificar best practices e pitfalls comuns

**Identificacao de Gotchas:**
- Quirks de bibliotecas
- Limitacoes conhecidas
- Consideracoes de seguranca
- Padroes obrigatorios do projeto (DDD, Clean Architecture, TDD)

### Fase 5: ULTRATHINK + Geracao

**Antes de escrever o PRP:**

```
ULTRATHINK: Planeje profundamente a implementacao:
- Qual a arquitetura ideal (DDD + Clean Architecture)?
- Quais entidades e value objects?
- Qual o fluxo de dados?
- Quais testes escrever primeiro (TDD)?
- Quais os riscos e mitigacoes?
- Qual a ordem de implementacao?
```

**Gerar PRP usando template `PRPs/templates/prp_base.md`:**

O PRP DEVE conter todas as secoes:
1. **Input Summary** - Tarefa original (ID, nome, contexto, objetivo, escopo)
2. **Goal** - O que construir (especifico)
3. **Why** - Valor de negocio
4. **What** - Comportamento e requisitos tecnicos
5. **Documentation & References** - URLs, arquivos de contexto carregados, gotchas
6. **Codebase Trees** - Atual e desejado
7. **Implementation Blueprint** - Tasks ordenadas com pseudocodigo
8. **Validation Loop** - 3 niveis (syntax, unit, integration)
9. **Final Checklist** - Criterios de conclusao (copiar da tarefa)
10. **Anti-Patterns** - O que evitar

### Fase 6: Input Summary (Documentacao)

Adicionar secao no inicio do PRP:

```markdown
---
## Input Summary

**Modo:** AUTO | TAREFA | LIVRE
**Tarefa:** T-XXX - {nome}
**Origem:** context/TASKS/T-XXX.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/PRD/features/{feature}.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/{arquivos}.md

**Objetivo:** {objetivo da tarefa}

**Escopo:**
{escopo da tarefa}

**Criterios de Aceite:**
{criterios da tarefa}

---
```

---

## Output

### Estrutura de Arquivos

```
PRPs/{numero}-{slug}/
└── PRP.md          # PRP completo gerado
```

### Informar ao Usuario

Ao finalizar, exibir:

```
PRP GERADO COM SUCESSO
━━━━━━━━━━━━━━━━━━━━━━━━

Modo: {AUTO | TAREFA | LIVRE}
Tarefa: T-XXX - {nome}
Arquivo: PRPs/{numero}-{slug}/PRP.md

Contexto carregado:
- {lista de arquivos}

Nota de confianca: {X}/10

Proximo passo:
/execute-prp PRPs/{numero}-{slug}/PRP.md
```

---

## Validation Gates (Obrigatorios no PRP)

Identificar a stack do projeto e incluir comandos apropriados:

**Python:**
```bash
ruff check --fix && mypy . && pytest tests/ -v --cov --cov-fail-under=80
```

**Node.js/TypeScript:**
```bash
npm run lint && npm run type-check && npm test
```

**Go:**
```bash
go fmt ./... && go vet ./... && go test ./...
```

**Rust:**
```bash
cargo fmt --check && cargo clippy && cargo test
```

---

## Quality Checklist

Antes de finalizar, verificar:

- [ ] Modo de input detectado corretamente
- [ ] Tarefa identificada (AUTO/TAREFA) ou descricao extraida (LIVRE)
- [ ] Tags de Contexto parseadas corretamente
- [ ] Arquivos de contexto carregados
- [ ] Diretorio criado com nomenclatura correta
- [ ] Goal claro e especifico
- [ ] Modelo de dominio definido (entidades, VOs, regras)
- [ ] Arquitetura Clean Architecture mapeada
- [ ] Blueprint TDD (teste primeiro para cada componente)
- [ ] Validation gates executaveis
- [ ] Criterios de conclusao objetivos (copiados da tarefa)

---

## Nota de Confianca

Ao finalizar, atribuir nota de 1-10:

| Nota | Significado |
|------|-------------|
| 9-10 | Contexto completo, implementacao trivial |
| 7-8 | Bom contexto, algumas decisoes em aberto |
| 5-6 | Contexto parcial, pode precisar iteracao |
| < 5 | Falta contexto critico, revisar antes de executar |

---

## Exemplos de Uso

### Modo AUTO (mais comum)
```bash
/generate-prp
```
Detecta que ultima tarefa foi T-003, gera PRP para T-004.

### Modo TAREFA
```bash
/generate-prp T-005
```
Gera PRP para tarefa especifica T-005.

### Modo LIVRE
```bash
/generate-prp "criar endpoint REST para CRUD de usuarios com validacao"
```
Gera PRP a partir de descricao.

### Modo INITIAL.md (retrocompatibilidade)
```bash
/generate-prp PRPs/001-auth/INITIAL.md
```
Usa arquivo INITIAL.md existente.

---

## Proximo Passo

Apos gerar o PRP, executar:

```bash
/execute-prp PRPs/{numero}-{slug}/PRP.md
```

Ou usar `/next` para fluxo completo automatizado (gera + executa + commit).
