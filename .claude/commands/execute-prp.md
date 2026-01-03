# Execute PRP

Implementa uma feature usando o PRP e faz commit ao final.

## PRP File: $ARGUMENTS

> **Ciclo completo:** Implementa → Valida → Atualiza PRP → Commit
> **100% Autonomo:** Sem perguntas, sem confirmacoes.

> **VERSOES:** NAO pesquisar versoes de bibliotecas via WebSearch.
> Usar versoes ja definidas em `context/ARQUITETURA/stack.md` e no PRP.
> A pesquisa de versoes e responsabilidade EXCLUSIVA do `/gerar-arquitetura`.

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
```

- Usar TodoWrite para criar plano de implementacao
- Identificar patterns do codebase existente
- Fazer pesquisas adicionais se necessario (WebSearch, Read)

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
3. Corrigir codigo (nao o teste)
4. Re-executar validacao
5. Repetir ate passar

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

### Decisoes Tomadas
{decisoes durante implementacao}
```

### Fase 6: Commit

**Ler `docs/git-docs/git-workflow.md` para formato completo.**

1. Verificar status e diff:
```bash
git status
git diff --staged
```

2. Identificar proxima tarefa:
   - Ler `context/TASKS/_index.md`
   - Encontrar tarefa seguinte na ordem de execucao

3. Criar commit seguindo padrao:

```bash
git add .
git commit -m "$(cat <<'EOF'
feat(T-XXX): {descricao da tarefa}

## Roadmap Progress
Task atual: [T-XXX] - {Nome}
Status: COMPLETA
Proxima task: [T-XXX+1] - {Nome da proxima}

## Changes
- {lista de mudancas principais}

## Files Changed
- {arquivos modificados}

## Validation
- Lint: passou
- Type-check: passou
- Tests: {N} passando (Domain: 100%, App: 80%+)
- Build: passou

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
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
```

---

## Tratamento de Erros

### Se validacao falhar:
- NAO fazer commit
- Corrigir erros
- Re-executar validacao
- Continuar apenas quando passar

### Se commit falhar (pre-commit hooks):
- Verificar arquivos modificados pelos hooks
- Se safe, fazer amend
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
- [ ] Commit feito com formato correto
- [ ] Proxima tarefa identificada no commit

---

## Notas

- **Sempre re-ler o PRP** ao final para garantir que tudo foi implementado
- **Nunca pular validacao** - se falhar, corrigir antes de prosseguir
- **Commit e obrigatorio** - faz parte do ciclo completo
- **Git e a fonte de verdade** - o commit registra o progresso
- **Server-first** - Server Components por padrao, "use client" apenas quando necessario
- **Zustand para estado** - Nao usar React Query, SWR ou tRPC
- **Zod para validacao** - Em API Routes e forms
