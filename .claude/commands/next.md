# Next Task

Executa automaticamente a proxima tarefa do inicio ao fim.

> **100% Autonomo:** Sem perguntas, sem confirmacoes.
> **Duas Tasks Sequenciais:** Uma para gerar PRP, outra para executar.

---

## INSTRUCAO OBRIGATORIA

**VOCE DEVE usar a ferramenta `Task` em DUAS etapas sequenciais.**

### Etapa 1: Gerar PRP

```
Task(
  subagent_type: "general-purpose",
  prompt: "<prompt do agente 1 abaixo>",
  description: "generate PRP"
)
```

**Aguarde a conclusao e capture o caminho do PRP retornado.**

### Etapa 2: Executar PRP

```
Task(
  subagent_type: "general-purpose",
  prompt: "<prompt do agente 2 abaixo, incluindo o caminho do PRP>",
  description: "execute PRP"
)
```

**Por que duas Tasks?**
- Isolamento: cada fase tem seu proprio contexto
- Resiliencia: falha em uma fase nao polui a outra
- Clareza: resultado de cada fase e visivel

**NAO execute os passos diretamente na conversa principal.**

---

## Fluxo

```
Conversa Principal
  │
  ▼
┌─────────────────────────────────────┐
│ Task 1: /generate-prp               │
│ (detecta tarefa + carrega contexto) │
│ → Retorna: PRPs/XXX-slug/PRP.md     │
└────────────────┬────────────────────┘
                 │
                 ▼ (aguarda conclusao)
                 │
┌─────────────────────────────────────┐
│ Task 2: /execute-prp {PRP.md}       │
│ (implementa + valida + commit)      │
│ → Retorna: commit hash, arquivos    │
└────────────────┬────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│ Exibir resultado final ao usuario   │
└─────────────────────────────────────┘
```

---

## Prompt do Agente 1 (Generate PRP)

```
Voce e um agente autonomo. Sua UNICA tarefa e gerar o PRP.

## Tarefa

Execute /generate-prp sem argumentos (modo AUTO).

O comando ira:
1. Detectar proxima tarefa via Git + TASKS/_index.md
2. Carregar contexto via Tags de Contexto
3. Gerar PRP completo em PRPs/{numero}-{slug}/PRP.md

## Retorno OBRIGATORIO

Ao finalizar, retorne EXATAMENTE neste formato:

PRP_PATH: PRPs/{numero}-{slug}/PRP.md
TASK_ID: T-XXX
TASK_NAME: Nome da tarefa
STATUS: SUCESSO ou FALHA
ERRO: (apenas se falhou)
```

---

## Prompt do Agente 2 (Execute PRP)

```
Voce e um agente autonomo. Sua UNICA tarefa e executar o PRP.

## Tarefa

Execute /execute-prp {PRP_PATH}

(Substitua {PRP_PATH} pelo caminho retornado pelo Agente 1)

O comando ira:
1. Implementar seguindo TDD
2. Validar (lint, tests, build)
3. Atualizar PRP com pos-implementacao
4. Fazer commit com formato padrao

## Retorno OBRIGATORIO

Ao finalizar, retorne EXATAMENTE neste formato:

TASK_ID: T-XXX
TASK_NAME: Nome da tarefa
ARQUIVOS_CRIADOS: (lista)
ARQUIVOS_MODIFICADOS: (lista)
COMMIT_HASH: abc1234
STATUS: SUCESSO ou FALHA
ERRO: (apenas se falhou)
```

---

## Tratamento de Erros

### Se Task 1 (/generate-prp) falhar:
- NAO execute Task 2
- Exibir erro ao usuario
- Sugerir: "Verifique TASKS/_index.md e Tags de Contexto"

### Se Task 2 (/execute-prp) falhar:
- Exibir erro com logs
- Sugerir: "Revise o PRP em {caminho} e execute /execute-prp manualmente"

---

## Notas

- **Duas Tasks sequenciais:** Task 2 so inicia apos Task 1 concluir com sucesso
- **Zero interacao:** Agentes executam sem perguntas
- **Git e a fonte de verdade:** Commit registra progresso
- **Capturar PRP_PATH:** Essencial para passar da Task 1 para Task 2
