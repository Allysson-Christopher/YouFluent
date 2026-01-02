# Execute PRP

Implementa uma feature usando o PRP e faz commit ao final.

## PRP File: $ARGUMENTS

> **Ciclo completo:** Implementa → Valida → Atualiza PRP → Commit
> **100% Autonomo:** Sem perguntas, sem confirmacoes.

> ⚠️ **VERSÕES:** NÃO pesquisar versões de bibliotecas via WebSearch.
> Usar versões já definidas em `context/ARQUITETURA/stack.md` e no PRP.
> A pesquisa de versões é responsabilidade EXCLUSIVA do `/gerar-arquitetura`.

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

```
1. RED    - Escrever teste que falha
2. GREEN  - Codigo minimo para passar
3. REFACTOR - Melhorar mantendo testes verdes
```

**Padroes obrigatorios:**
- DDD (Domain-Driven Design)
- Clean Architecture
- TDD (Test-Driven Development)
- Result pattern para erros
- Logs estruturados

### Fase 4: Validar

Executar validation gates do PRP:

```bash
# Nivel 1: Syntax & Style
npm run lint && npm run format:check

# Nivel 2: Unit Tests
npm run test:unit

# Nivel 3: Integration Tests
npm run test:integration

# Nivel 4: Type Check + Build
npm run type-check && npm run build
```

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
- Cobertura: {X}%

### Validation Gates
- [x] Lint: passou
- [x] Type-check: passou
- [x] Unit tests: passou
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
- Tests: {N} passando
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
Cobertura: {X}%

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

## Checklist Final

Antes de considerar completo:

- [ ] Todos os criterios de aceite do PRP atendidos
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
