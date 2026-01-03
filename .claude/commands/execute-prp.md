# Execute PRP

Implementa uma feature usando o PRP e faz commit ao final.

## PRP File: $ARGUMENTS

> **Ciclo completo:** Implementa → Valida → Atualiza PRP → Commit
> **100% Autonomo:** Sem perguntas, sem confirmacoes.

> **VERSOES:** NAO pesquisar versoes de bibliotecas via WebSearch.
> Usar versoes ja definidas em `context/ARQUITETURA/stack.md` e no PRP.
> A pesquisa de versoes e responsabilidade EXCLUSIVA do `/gerar-arquitetura`.

> **CONTEXT7 MCP:** SEMPRE usar o MCP do Context7 para obter documentacao
> atualizada de bibliotecas quando encontrar erros, APIs desconhecidas ou
> comportamentos inesperados. O Context7 tem acesso a docs oficiais atualizadas.

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
| Testcontainers | latest |
| MSW | 2.x |

### Dominios do Projeto
- **lesson** - Licoes geradas por IA
- **player** - Player YouTube
- **transcript** - Transcricoes e cache

### Estrutura de Pastas
```
src/
├── app/                  # Next.js App Router (rotas apenas)
├── features/             # Dominios organizados por feature
│   ├── lesson/           # domain, application, infrastructure, presentation
│   ├── player/
│   └── transcript/
├── shared/               # Codigo compartilhado
└── prisma/               # Schema e migrations
```

### Estrategia de Testes (TDD)
| Camada | TDD | Cobertura | Ferramentas |
|--------|-----|-----------|-------------|
| Domain | Obrigatorio | 100% | Vitest |
| Application | Recomendado | 80-90% | Vitest + mocks |
| Infrastructure | Parcial | 60-80% | Vitest + Testcontainers + MSW |
| Presentation | Nao | E2E apenas | Playwright |

---

## Processo de Execucao

### Fase 1: Carregar PRP

1. Ler o arquivo PRP especificado
2. Entender todo o contexto e requisitos
3. Identificar:
   - ID da tarefa (T-XXX) do Input Summary
   - Nome da tarefa
   - Arquivos a criar/modificar
   - Validation gates
   - Criterios de aceite

### Fase 2: ULTRATHINK

Antes de implementar, planejar profundamente:

```
ULTRATHINK:
- Qual a ordem ideal de implementacao?
- Quais testes escrever primeiro (TDD)?
- Quais padroes existentes seguir?
- Quais os riscos e como mitigar?
- Como validar cada etapa?
- Quais bibliotecas podem ter APIs novas/diferentes? (consultar Context7)
```

- Usar TodoWrite para criar plano de implementacao
- Identificar patterns do codebase existente
- **Consultar Context7 MCP** para documentacao atualizada de bibliotecas da stack
- Fazer pesquisas adicionais se necessario (Read, Grep)

### Fase 3: Implementar (TDD)

Para cada componente do blueprint:

**Domain Layer (TDD Obrigatorio - 100%)**
```
1. RED    - Escrever teste em tests/unit/features/{feature}/domain/
2. GREEN  - Implementar em src/features/{feature}/domain/
3. REFACTOR - Melhorar mantendo testes verdes
```

**Application Layer (TDD Recomendado - 80-90%)**
```
1. RED    - Escrever teste com mocks em tests/unit/features/{feature}/application/
2. GREEN  - Implementar em src/features/{feature}/application/
3. REFACTOR
```

**Infrastructure Layer (Parcial - 60-80%)**
```
1. Implementar em src/features/{feature}/infrastructure/
2. Testar com Testcontainers (PostgreSQL real)
3. Testar com MSW (APIs externas mockadas)
```

**Presentation Layer (Sem TDD)**
```
1. Implementar Server Components em src/features/{feature}/presentation/
2. Usar "use client" apenas quando necessario
3. Zustand para estado local
```

**Padroes obrigatorios:**
- DDD (Domain-Driven Design)
- Clean Architecture
- TDD (Test-Driven Development) por camada
- Result pattern para erros
- Logs estruturados
- Zod para validacao de inputs

### Fase 4: Validar

Executar validation gates do PRP:

```bash
# Nivel 1: Syntax & Style
pnpm lint && pnpm format:check

# Nivel 2: Type Check
pnpm type-check

# Nivel 3: Unit Tests (TDD)
pnpm test:unit --coverage

# Nivel 4: Integration Tests
pnpm test:integration

# Nivel 5: Build
pnpm build
```

**Cobertura minima por camada:**
- Domain: 100%
- Application: 80%
- Infrastructure: 60%

**Se falhar:**
1. Ler erro completo
2. Identificar causa raiz
3. **Consultar Context7 MCP** se o erro envolver API de biblioteca
4. Corrigir codigo (nao o teste)
5. Re-executar validacao
6. Repetir ate passar

### Fase 5: Atualizar PRP com Pos-Implementacao

Adicionar secao no final do PRP.md:

```markdown
---

## Pos-Implementacao

**Data:** {data atual}
**Status:** Implementado

### Arquivos Criados/Modificados
- {lista de arquivos}

### Testes
- {N} testes criados
- Cobertura Domain: {X}%
- Cobertura Application: {Y}%
- Cobertura Infrastructure: {Z}%

### Validation Gates
- [x] Lint: passou
- [x] Type-check: passou
- [x] Unit tests: passou ({N} testes)
- [x] Integration tests: passou ({N} testes)
- [x] Build: passou

### Erros Encontrados
{erros e solucoes ou "Nenhum"}
{Se usou Context7, mencionar: "Resolvido via Context7 MCP"}

### Decisoes Tomadas
{decisoes durante implementacao}

### Context7 Consultado
{bibliotecas consultadas ou "Nenhuma consulta necessaria"}
```

### Fase 6: Commit (OBRIGATORIO)

**IMPORTANTE: Seguir o padrao de `docs/git-docs/git-workflow.md`**

#### 6.1 Verificar Status

```bash
git status
git diff --staged
git log -3 --oneline
```

#### 6.2 Identificar Proxima Tarefa

1. Ler `context/TASKS/_index.md`
2. Encontrar tarefa seguinte na ordem de execucao
3. Capturar ID e nome da proxima tarefa

#### 6.3 Criar Commit Completo

**O commit DEVE seguir o template do git-workflow.md com TODAS as secoes:**

```bash
git add -A

git commit -m "$(cat <<'EOF'
feat(T-XXX): {descricao da tarefa}

## Roadmap Progress
Task atual: [T-XXX] - {Nome}
Status: COMPLETA
Proxima task: [T-XXX+1] - {Nome da proxima}
Fase: {fase do TASKS/_index.md}
Progresso da fase: {X}/{Y} tasks completas

## Contexto
{Por que essa mudanca foi necessaria? Qual problema resolve?}

## Implementacao
{Como foi implementado tecnicamente?}
- {Bullet points das principais decisoes}

## TDD Cycle
- 🔴 RED: {N} testes criados, todos falhando inicialmente
- 🟢 GREEN: Implementacao minima para passar os testes
- 🔵 REFACTOR: {O que foi refatorado apos testes passarem}

## Erros Encontrados Durante Implementacao
{Liste TODOS os erros encontrados e solucoes, ou "Nenhum erro encontrado"}

## Decisoes de Design
{Escolhas arquiteturais e trade-offs}
- {Decisao 1}
- {Decisao 2}

## Testes
- Testes unitarios: {caminho dos arquivos de teste}
  - {Lista de testes criados}
- Cobertura alcancada:
  - Domain: {X}%
  - Application: {Y}%
  - Infrastructure: {Z}%
- Comando: pnpm test:unit

## Arquivos Modificados
- {arquivo 1} - {o que foi feito}
- {arquivo 2} - {o que foi feito}

## Proximos Passos / TODOs
{Pendencias ou "Nenhuma pendencia nesta task"}

PROXIMA TASK (TASKS.md):
[T-XXX+1]: {Nome da proxima tarefa}
Checklist da proxima task:
- [ ] {Item 1 da proxima tarefa}
- [ ] {Item 2 da proxima tarefa}

## Referencias
- {Links relevantes, docs, etc}

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

#### 6.4 Verificar Commit

```bash
git log -1 --format=fuller
```

### Fase 7: Reportar Conclusao

Exibir resumo final:

```
TAREFA T-XXX CONCLUIDA
━━━━━━━━━━━━━━━━━━━━━━━━

{nome da tarefa}

PRP: {caminho do PRP}
Arquivos: {N} criados/modificados
Testes: {N} passando
Cobertura:
  - Domain: {X}%
  - Application: {Y}%
  - Infrastructure: {Z}%

Commit: {hash} - feat(T-XXX): {descricao}

Proxima tarefa: T-XXX+1 - {nome}

Para continuar:
/next
ou
/generate-prp
```

---

## Tratamento de Erros

### Uso do Context7 MCP (OBRIGATORIO)

Quando encontrar erros relacionados a bibliotecas da stack, **SEMPRE** consultar
o Context7 MCP antes de tentar resolver manualmente:

```typescript
// 1. Resolver ID da biblioteca
mcp__context7__resolve-library-id({
  libraryName: "prisma",  // ou next, react, vitest, etc.
  query: "descricao do problema ou API que precisa consultar"
})

// 2. Consultar documentacao
mcp__context7__query-docs({
  libraryId: "/prisma/docs",  // ID retornado pelo resolve
  query: "configuracao especifica ou erro encontrado"
})
```

**Quando usar Context7:**
- Erros de TypeScript relacionados a tipos de bibliotecas
- APIs que mudaram entre versoes (ex: Prisma 6 → 7)
- Configuracoes que nao funcionam como esperado
- Padroes recomendados para a versao atual
- Integracao entre bibliotecas (ex: Prisma + Next.js)

**Bibliotecas principais para consultar:**
- `/prisma/docs` - Prisma ORM
- `/vercel/next.js` - Next.js
- `/tailwindlabs/tailwindcss` - Tailwind CSS
- `/shadcn-ui/ui` - shadcn/ui
- `/vitest-dev/vitest` - Vitest

### Se validacao falhar:
- NAO fazer commit
- Corrigir erros
- Re-executar validacao
- Continuar apenas quando passar

### Se commit falhar (pre-commit hooks):
- Verificar arquivos modificados pelos hooks
- Se safe, fazer amend (APENAS se commit ainda nao foi pushado)
- Se nao, criar novo commit

### Se nao conseguir implementar:
- Documentar bloqueio no PRP
- NAO fazer commit parcial
- Reportar erro ao usuario

---

## Comandos de Validacao YouFluent

```bash
# Scripts pnpm (definir em package.json)
pnpm lint              # ESLint
pnpm format:check      # Prettier check
pnpm type-check        # tsc --noEmit
pnpm test              # Vitest (todos)
pnpm test:unit         # Vitest unit only
pnpm test:integration  # Vitest integration (Testcontainers)
pnpm test:e2e          # Playwright
pnpm test:coverage     # Vitest com cobertura
pnpm build             # Next.js build

# Comandos diretos
pnpm vitest run tests/unit/ --coverage
pnpm vitest run tests/integration/
pnpm exec playwright test
```

---

## Checklist Final

Antes de considerar completo:

- [ ] Todos os criterios de aceite do PRP atendidos
- [ ] TDD seguido (Domain 100%, Application 80%+)
- [ ] Todos os validation gates passando
- [ ] PRP atualizado com pos-implementacao
- [ ] Commit feito com formato completo (todas as secoes)
- [ ] Proxima tarefa identificada no commit
- [ ] Checklist da proxima tarefa incluida no commit

---

## Notas

- **Sempre re-ler o PRP** ao final para garantir que tudo foi implementado
- **Nunca pular validacao** - se falhar, corrigir antes de prosseguir
- **Commit e obrigatorio** - faz parte do ciclo completo
- **Git e a fonte de verdade** - o commit registra o progresso
- **Server-first** - Server Components por padrao, "use client" apenas quando necessario
- **Zustand para estado** - Nao usar React Query, SWR ou tRPC
- **Zod para validacao** - Em API Routes e forms
- **Commit completo** - Usar TODAS as secoes do git-workflow.md
- **Context7 MCP e obrigatorio** - Consultar SEMPRE ao encontrar erros de bibliotecas
