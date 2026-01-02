# Tasks: {Nome do Projeto}

> **Indice de tarefas - carregue apenas este arquivo para visao geral.**
> **Para detalhes, carregue o arquivo T-XXX.md especifico.**
> **Progresso via Git (commits).**

---

## Ordem de Execucao

```
T-001 → T-002 → T-003 → T-004 → T-005 → ...
```

## Lista de Tarefas

| ID | Nome | Tamanho | Prioridade |
|----|------|---------|------------|
| T-001 | {Setup inicial} | M | Must Have |
| T-002 | {Entidades de dominio} | M | Must Have |
| T-003 | {Use Case principal} | M | Must Have |
| T-004 | {Repository} | P | Must Have |
| T-005 | {API Endpoint} | M | Must Have |

## Dependencias

| Task | Depende de |
|------|------------|
| T-001 | - |
| T-002 | T-001 |
| T-003 | T-002 |
| T-004 | T-002 |
| T-005 | T-003, T-004 |

## Verificar Progresso

```bash
# Ultima tarefa concluida
git log -1 --grep="^feat(T-\|^fix(T-" --format="%s"

# Todas as tarefas concluidas
git log --oneline --grep="T-"
```

---

## Navegacao

Para carregar uma tarefa especifica:
```
context/TASKS/T-001.md
context/TASKS/T-002.md
...
```

---

*Progresso via Git, nao via arquivos.*
