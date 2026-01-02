# Gerar Tasks

## Input opcional: $ARGUMENTS

Gera uma lista de tarefas atomicas baseada no PRD e Arquitetura.

> **Principio Core:** 1 Tarefa = 1 Arquivo = 1 PRP = 1 Sessao
> **Estrutura:** Uma tarefa por arquivo (T-001.md, T-002.md, ...)
> **Progresso:** Via Git (commits), nao via arquivos

---

## ⚠️ REGRAS CRÍTICAS - LEIA ANTES DE COMEÇAR

### 1. PERGUNTAS COM OPÇÕES NUMERADAS (OBRIGATÓRIO)

```
SEMPRE faça perguntas neste formato:

"Como você prefere a granularidade das tarefas?

1. Pequenas (1-2 arquivos cada)
2. Médias (3-5 arquivos cada) - RECOMENDADO
3. Maiores (múltiplas camadas cada)

Digite o número:"
```

**NUNCA** faça perguntas abertas sem opções. O usuário deve poder responder apenas digitando um número.

### 2. OUTPUT MODULAR (OBRIGATÓRIO)

```
SEMPRE gere arquivos SEPARADOS nesta estrutura:

context/TASKS/
├── _index.md        # Índice (ordem + dependências)
├── T-001.md         # Tarefa 1
├── T-002.md         # Tarefa 2
├── T-003.md         # Tarefa 3
└── ...              # Uma tarefa por arquivo
```

**NUNCA** agrupe tarefas em um único arquivo. Cada tarefa deve ter seu próprio arquivo.

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

### Analise Automatica

```
ANALISE DO PRD:
━━━━━━━━━━━━━━━

MUST HAVE (MVP):
   - {F01}: {nome} - {descricao curta}
   - {F02}: {nome}
   ...

SHOULD HAVE (v1.0):
   - {F04}: {nome}
   ...

STACK IDENTIFICADA:
   - Backend: {linguagem} + {framework}
   - Database: {tipo}

PADROES: DDD, Clean Architecture, TDD
```

---

## FASE 2: ENTREVISTA DE REFINAMENTO

### Instrucoes para o Claude

Conduza uma breve entrevista. **FACA UMA PERGUNTA POR VEZ**.

### Roteiro de Perguntas

```
PERGUNTA 1 - VALIDACAO DO MVP
"Baseado no PRD, identifiquei estas funcionalidades como MVP:

{lista numerada}

Esta correto?

1. Sim, lista correta
2. Preciso adicionar funcionalidades
3. Preciso remover funcionalidades
4. Preciso ajustar varias coisas

Digite o numero:"

PERGUNTA 2 - PRIORIZACAO
"Sugiro esta ordem de implementacao:

{lista numerada}

A ordem esta boa?

1. Sim, ordem correta
2. Quero reordenar
3. Nao tenho preferencia

Digite o numero:"

PERGUNTA 3 - INFRAESTRUTURA INICIAL
"Antes das features, vou criar tarefas de setup:

1. Setup completo (estrutura DDD + configs + CI/CD + DB)
2. Setup minimo (estrutura DDD + configs apenas)
3. Sem setup (ja tenho projeto configurado)
4. Personalizado

Digite o numero:"

PERGUNTA 4 - GRANULARIDADE
"Granularidade das tarefas?

1. Pequenas (1-2 arquivos cada)
2. Medias (3-5 arquivos cada) - RECOMENDADO
3. Maiores (multiplas camadas cada)

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

### Template _index.md

```markdown
# Tasks: {Nome do Projeto}

> **Indice de tarefas - carregue apenas este arquivo para visao geral.**
> **Progresso via Git (commits).**

## Ordem de Execucao

T-001 → T-002 → T-003 → ...

## Lista de Tarefas

| ID | Nome | Tamanho | Prioridade |
|----|------|---------|------------|
| T-001 | {nome} | M | Must Have |
| T-002 | {nome} | M | Must Have |
| ... | ... | ... | ... |

## Dependencias

| Task | Depende de |
|------|------------|
| T-001 | - |
| T-002 | T-001 |
| ... | ... |

## Verificar Progresso

\`\`\`bash
git log --oneline --grep="T-"
\`\`\`
```

### Template T-XXX.md

```markdown
# T-XXX: {Nome da Tarefa}

| Campo | Valor |
|-------|-------|
| **Tamanho** | {P/M/G} |
| **Prioridade** | {Must/Should/Could} |
| **Epic** | {Epic} |
| **Depende de** | {T-YYY ou -} |

---

## Contexto

{Resumo em 1-2 linhas}

## Objetivo

{O que entrega quando concluida}

## Escopo

- {Deliverable 1}
- {Deliverable 2}

## Criterios de Aceite

- [ ] {Criterio verificavel 1}
- [ ] {Criterio verificavel 2}

## Validacao

\`\`\`bash
{comandos de teste}
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
   - Primeira: T-001 - {nome}
   - Todas com Tags de Contexto

PROGRESSO: Via Git
   git log --oneline --grep="T-"

Para comecar:
   /next
```

---

## REGRAS DE QUEBRA

### Tamanho Ideal

```
Uma tarefa deve:
- Caber em UMA sessao do Claude Code
- Tocar 1-3 arquivos principais (+ testes)
- Ter criterios de aceite claros
```

### Padrao de Quebra por Camada DDD

```
Funcionalidade X
│
├── T-0X1: Entidades e Value Objects
│          (domain/entities/, domain/value_objects/)
│
├── T-0X2: Use Case principal
│          (application/use_cases/)
│
├── T-0X3: Repository Interface + Impl
│          (domain/repositories/, infrastructure/)
│
└── T-0X4: API Endpoint
           (presentation/api/)
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
