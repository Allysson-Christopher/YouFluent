# Next Task

Executa automaticamente a proxima tarefa do inicio ao fim.

> **100% Autonomo:** Sem perguntas, sem confirmacoes.
> **Duas Etapas:** Gera PRP (com commit) → Executa PRP (com commit)

---

## CONTEXTO DO PROJETO: YouFluent

### Stack Tecnologica
| Tecnologia | Versao |
|------------|--------|
| Next.js | 16.1.1+ |
| React | 19.2.x |
| TypeScript | 5.9.x |
| Node.js | 20.19+ |
| Prisma | 7.x (com @prisma/adapter-pg) |
| PostgreSQL | 16 (Docker Compose) |
| Zustand | 5.x |
| Zod | latest |
| Tailwind CSS | v4 |
| shadcn/ui | 2.5.x |
| Vitest | 3.0.5+ |
| Playwright | 1.55.1+ |

### Dominios do Projeto
- **lesson** - Licoes geradas por IA
- **player** - Player YouTube
- **transcript** - Transcricoes e cache

### Estrategia de Testes (TDD)
| Camada | TDD | Cobertura |
|--------|-----|-----------|
| Domain | Obrigatorio | 100% |
| Application | Recomendado | 80-90% |
| Infrastructure | Parcial | 60-80% |
| Presentation | Nao | E2E apenas |

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
- **Commits separados:** PRP commitado na geracao, implementacao commitada na execucao

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
│ → Gera PRP + COMMIT do PRP          │
│ → Retorna: PRPs/XXX-slug/PRP.md     │
└────────────────┬────────────────────┘
                 │
                 ▼ (aguarda conclusao)
                 │
┌─────────────────────────────────────┐
│ Task 2: /execute-prp {PRP.md}       │
│ (implementa TDD + valida)           │
│ → Implementa + COMMIT completo      │
│ → Retorna: hash, arquivos, testes   │
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
Voce e um agente autonomo. Sua UNICA tarefa e gerar o PRP e commita-lo.

## Contexto do Projeto: YouFluent

Stack: Next.js 16.1.1+, React 19.2.x, Prisma 7.x, PostgreSQL 16, Zustand 5.x
Dominios: lesson, player, transcript
Padroes: DDD, Clean Architecture, TDD, Server-first

## Tarefa

Execute /generate-prp sem argumentos (modo AUTO).

O comando ira:
1. Detectar proxima tarefa via Git + TASKS/_index.md
2. Carregar contexto via Tags de Contexto
3. Gerar PRP completo em PRPs/{numero}-{slug}/PRP.md
4. **FAZER COMMIT do PRP gerado** (docs(T-XXX): Generate PRP for ...)

Lembre-se:
- NAO pesquisar versoes de bibliotecas (usar context/ARQUITETURA/stack.md)
- Seguir estrategia TDD por camada (Domain 100%, Application 80%)
- Server Components por padrao, "use client" apenas quando necessario
- Zustand para estado, Zod para validacao

## Retorno OBRIGATORIO

Ao finalizar, retorne EXATAMENTE neste formato:

PRP_PATH: PRPs/{numero}-{slug}/PRP.md
TASK_ID: T-XXX
TASK_NAME: Nome da tarefa
COMMIT_HASH: {hash do commit do PRP}
STATUS: SUCESSO ou FALHA
ERRO: (apenas se falhou)
```

---

## Prompt do Agente 2 (Execute PRP)

```
Voce e um agente autonomo. Sua UNICA tarefa e executar o PRP e commita-lo.

## Contexto do Projeto: YouFluent

Stack: Next.js 16.1.1+, React 19.2.x, Prisma 7.x, PostgreSQL 16, Zustand 5.x
Dominios: lesson, player, transcript
Padroes: DDD, Clean Architecture, TDD, Server-first

## Tarefa

Execute /execute-prp {PRP_PATH}

(Substitua {PRP_PATH} pelo caminho retornado pelo Agente 1)

O comando ira:
1. Implementar seguindo TDD:
   - Domain: TDD Obrigatorio (100% cobertura)
   - Application: TDD Recomendado (80% cobertura)
   - Infrastructure: Parcial (60% cobertura)
   - Presentation: Server-first, sem TDD
2. Validar (pnpm lint, pnpm type-check, pnpm test, pnpm build)
3. Atualizar PRP com pos-implementacao
4. **FAZER COMMIT COMPLETO** seguindo docs/git-docs/git-workflow.md
   - Todas as secoes obrigatorias
   - TDD Cycle documentado
   - Erros encontrados
   - Proxima tarefa identificada

Lembre-se:
- NAO pular validacao - todos os gates devem passar
- TDD: escrever teste ANTES do codigo (Domain e Application)
- Server Components por padrao
- Zustand para estado local
- Zod para validacao de inputs
- Commit DEVE ter todas as secoes do git-workflow.md

## Retorno OBRIGATORIO

Ao finalizar, retorne EXATAMENTE neste formato:

TASK_ID: T-XXX
TASK_NAME: Nome da tarefa
ARQUIVOS_CRIADOS: (lista)
ARQUIVOS_MODIFICADOS: (lista)
TESTES: {N} passando (Domain: X%, Application: Y%)
COMMIT_HASH: {hash do commit da implementacao}
STATUS: SUCESSO ou FALHA
ERRO: (apenas se falhou)
PROXIMA_TAREFA: T-XXX+1 - {nome}
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

### Erros comuns (YouFluent):
- **Prisma 7**: Verificar se @prisma/adapter-pg esta configurado
- **Tailwind v4**: Verificar se CSS-first config esta correto
- **TDD falhou**: Verificar cobertura minima por camada
- **Build falhou**: Verificar Server Components vs Client Components

---

## Output Final ao Usuario

Apos ambas as Tasks concluirem, exibir:

```
TAREFA CONCLUIDA
━━━━━━━━━━━━━━━━━━━━━━━━

Tarefa: T-XXX - {nome}
PRP: PRPs/{numero}-{slug}/PRP.md

Commits:
1. {hash1} - docs(T-XXX): Generate PRP for {nome}
2. {hash2} - feat(T-XXX): {descricao}

Arquivos criados:
- {lista}

Arquivos modificados:
- {lista}

Testes:
- Total: {N} passando
- Domain: {X}% cobertura
- Application: {Y}% cobertura

Validacao:
- [x] Lint: passou
- [x] Type-check: passou
- [x] Unit tests: passou
- [x] Build: passou

Proxima tarefa: T-XXX+1 - {nome}

Para continuar:
/next
```

---

## Notas

- **Duas Tasks sequenciais:** Task 2 so inicia apos Task 1 concluir com sucesso
- **Dois commits:** PRP commitado na geracao, implementacao commitada na execucao
- **Zero interacao:** Agentes executam sem perguntas
- **Git e a fonte de verdade:** Commits registram progresso
- **TDD por camada:** Domain 100%, Application 80%, Infrastructure 60%
- **Server-first:** Server Components por padrao
- **Zustand para estado:** Nao usar React Query, SWR ou tRPC
- **Commit completo:** Todas as secoes do git-workflow.md na implementacao
