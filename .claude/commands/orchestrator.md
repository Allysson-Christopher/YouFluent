# Orchestrator - Loop Autonomo de Tarefas

Executa TODAS as tarefas do projeto em sequencia ate a conclusao total.

> **100% Autonomo:** Nao para por NADA. Zero intervencao humana.
> **Loop infinito:** Chama /next ate todas as tarefas estarem implementadas.
> **Auto-recuperacao:** Se uma tarefa falhar, tenta novamente.
> **Contexto isolado:** Cada /next roda em Task com contexto proprio.

---

## INSTRUCAO OBRIGATORIA

**VOCE DEVE executar um loop onde CADA /next e chamado via Task com contexto autonomo.**

### Regra Fundamental

**CADA iteracao DEVE usar a ferramenta Task:**
- Cada Task tem seu proprio contexto isolado
- Nao herda contexto da conversa principal
- O agente le CLAUDE.md e descobre tudo sozinho

---

## Implementacao do Loop

**EXECUTE TASKS SEQUENCIAIS, UMA DE CADA VEZ, AGUARDANDO CONCLUSAO.**

### Antes do Loop

Execute estes comandos Bash para obter os valores iniciais:

```bash
# Total de tarefas
ls context/TASKS/T-*.md 2>/dev/null | wc -l

# Tarefas ja concluidas
git log --oneline --grep="^feat(T-\|^fix(T-" | wc -l
```

### Estrutura do Loop

```
TOTAL_TAREFAS = (resultado do primeiro comando)
CONCLUIDAS = (resultado do segundo comando)

PARA i DE 1 ATE (TOTAL_TAREFAS + 10):

    1. SE CONCLUIDAS >= TOTAL_TAREFAS:
       ENCERRAR com sucesso
       EXIBIR resumo final

    2. EXECUTAR Task com contexto autonomo:

       Task(
         subagent_type: "general-purpose",
         prompt: "<PROMPT COMPLETO ABAIXO>",
         description: "task iteration {i}"
       )

    3. AGUARDAR conclusao da Task

    4. ANALISAR resultado retornado:
       - SE STATUS=SUCESSO: CONCLUIDAS += 1, continuar
       - SE STATUS=FALHA: retry (max 3x), depois continuar

    5. PROXIMA iteracao
```

---

## Prompt do Agente

**Prompt simples e direto:**

```
Execute /next
```

O agente automaticamente:
- Le CLAUDE.md e entende o projeto
- O comando /next faz todo o resto (detecta tarefa, gera PRP, implementa, valida, commit)

---

## Condicoes de Parada

O loop DEVE parar APENAS quando:

1. **Todas as tarefas concluidas:** `CONCLUIDAS >= TOTAL_TAREFAS`
2. **Limite de seguranca:** `TOTAL_TAREFAS + 10` iteracoes

**O loop NAO deve parar por:**
- Erro em uma tarefa (retry ate 3x, depois continua)
- Timeout
- Qualquer outro motivo

---

## Fluxo Visual

```
┌─────────────────────────────────────────────────────────────┐
│                     ORCHESTRATOR                            │
│                                                             │
│  INICIALIZACAO (Bash):                                      │
│    TOTAL = ls context/TASKS/T-*.md | wc -l                  │
│    CONCLUIDAS = git log --grep="T-" | wc -l                 │
│                                                             │
│  LOOP:                                                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                                                        │ │
│  │  [CONCLUIDAS >= TOTAL?] ──SIM──► ENCERRAR              │ │
│  │         │                                              │ │
│  │        NAO                                             │ │
│  │         ▼                                              │ │
│  │  ┌─────────────────────────────────────┐               │ │
│  │  │ Task(                               │               │ │
│  │  │   subagent_type: "general-purpose", │               │ │
│  │  │   prompt: "<prompt completo>",      │               │ │
│  │  │   description: "task iteration N"   │               │ │
│  │  │ )                                   │               │ │
│  │  │                                     │               │ │
│  │  │ → Agente executa /next              │               │ │
│  │  │ → Contexto AUTONOMO (le CLAUDE.md)  │               │ │
│  │  │ → Retorna STATUS                    │               │ │
│  │  └─────────────────────────────────────┘               │ │
│  │         │                                              │ │
│  │         ▼                                              │ │
│  │  [STATUS=SUCESSO?]                                     │ │
│  │    SIM → CONCLUIDAS += 1 → PROXIMA ITERACAO ──────┐    │ │
│  │    NAO → RETRY (max 3x) → PROXIMA ITERACAO ───────┤    │ │
│  │                                                   │    │ │
│  └───────────────────────────────────────────────────┘    │ │
│                                                             │
│  RESULTADO: Projeto completo, todos commits registrados     │
└─────────────────────────────────────────────────────────────┘
```

---

## Tratamento de Erros

| Situacao | Acao |
|----------|------|
| Task falha 1x | Retry imediato |
| Task falha 2x | Retry com delay |
| Task falha 3x | Registrar erro, continuar para proxima |
| Limite iteracoes | Parar, exibir estado atual |

---

## Notas

1. **Contexto autonomo:** Cada Task le CLAUDE.md e opera independentemente
2. **Zero intervencao:** Nao para para perguntas
3. **Git = verdade:** Progresso medido por commits
4. **Idempotente:** Pode reiniciar se interrompido
5. **Generico:** Funciona com qualquer projeto/numero de tarefas

---

*Context Engineering Framework - Orchestrator*
