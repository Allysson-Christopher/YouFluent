# Sync Context

Valida e sincroniza a estrutura de contexto modular.

> **Uso:** `/sync-context`

---

## Processo

### 1. Verificar Estrutura de Diretorios

```bash
# Verificar se diretorios e arquivos existem
ls -la context/
ls -la context/PRD/
ls -la context/ARQUITETURA/
cat context/TASKS.md
```

**Estrutura esperada:**
```
context/
├── MANIFEST.md
├── TASKS.md            # Lista de tarefas (progresso via Git)
├── PRD/
│   ├── _index.md
│   ├── visao.md
│   ├── personas.md
│   ├── features/
│   └── requisitos-nao-funcionais.md
└── ARQUITETURA/
    ├── _index.md
    ├── visao-geral.md
    ├── stack.md
    ├── padroes.md
    ├── dominios/
    └── decisoes/
```

### 2. Verificar Links no MANIFEST

Ler `context/MANIFEST.md` e verificar se todos os arquivos referenciados existem.

### 3. Detectar Arquivos Orfaos

Listar arquivos em `context/` que nao estao no MANIFEST.

### 4. Verificar Tags nas Tarefas

Para cada tarefa em `context/TASKS/T-XXX.md`:
- Verificar se tem bloco "## Tags de Contexto" no formato padrao
- Verificar se tags apontam para arquivos existentes

**Formato Padrao de Tags (obrigatorio):**
```markdown
## Tags de Contexto

```
PRD: features/auth
ARQUITETURA: dominios/user, decisoes/adr-001
```
```

> Header H2 seguido de bloco de codigo com as tags.

### 5. Verificar Arquivos Legados

Se existir `context/PRD.md` (monolitico):
- Sugerir migracao para estrutura modular
- Oferecer comando de migracao

### 6. Calcular Metricas

```
Arquivos de contexto: {N}
Tamanho total: {X}KB
Tarefas com tags: {N}/{M}
Links quebrados: {N}
Arquivos orfaos: {N}
```

---

## Output

### Tudo OK

```
SYNC CONTEXT - VALIDACAO
━━━━━━━━━━━━━━━━━━━━━━━━

✅ Estrutura de diretorios OK
✅ MANIFEST.md atualizado
✅ Todos os links validos
✅ Sem arquivos orfaos
✅ Tarefas com tags: 15/15

📊 METRICAS:
   • Arquivos: 23
   • Tamanho total: 45KB
   • Media por arquivo: 2KB

🎯 Economia estimada: 85% vs monolitico
```

### Com Problemas

```
SYNC CONTEXT - VALIDACAO
━━━━━━━━━━━━━━━━━━━━━━━━

✅ Estrutura de diretorios OK
⚠️  MANIFEST.md desatualizado
❌ 2 links quebrados
⚠️  3 arquivos orfaos
⚠️  Tarefas com tags: 12/15

PROBLEMAS ENCONTRADOS:

1. Links quebrados:
   - context/PRD/features/payments.md (referenciado no MANIFEST)
   - context/ARQUITETURA/decisoes/adr-003.md (referenciado em T-005)

2. Arquivos orfaos (nao referenciados):
   - context/PRD/features/old-feature.md
   - context/ARQUITETURA/rascunho.md
   - context/notas.md

3. Tarefas sem tags de contexto:
   - T-008: Implementar dashboard
   - T-010: Refatorar API
   - T-012: Adicionar cache

ACOES SUGERIDAS:

Para links quebrados:
  → Criar arquivos faltantes ou remover referencias

Para arquivos orfaos:
  → Adicionar ao MANIFEST ou deletar

Para tarefas sem tags:
  → Adicionar bloco "## Tags de Contexto" (H2 + bloco codigo) em cada tarefa

Deseja que eu corrija automaticamente? (s/n)
```

---

## Correcao Automatica

Se usuario confirmar, o comando pode:

1. **Atualizar MANIFEST.md** com arquivos encontrados
2. **Adicionar tags vazias** em tarefas que nao tem
3. **Mover arquivos orfaos** para `context/.archive/`
4. **NÃO deleta** arquivos automaticamente (seguranca)

---

## Migracao de Legado

Se detectar `context/PRD.md` ou `context/ARQUITETURA.md` (monoliticos):

```
MIGRACAO DETECTADA
━━━━━━━━━━━━━━━━━━

Encontrei arquivos no formato antigo (monolitico):
- context/PRD.md (645 linhas, 17KB)
- context/ARQUITETURA.md (1025 linhas, 30KB)

Deseja migrar para formato modular? (s/n)

A migracao vai:
1. Criar estrutura de diretorios PRD/ e ARQUITETURA/
2. Dividir conteudo em arquivos menores
3. Gerar _index.md para cada modulo
4. Manter arquivos originais em context/.backup/

Economia estimada apos migracao: ~80% tokens por tarefa
```

---

## Checklist de Validacao

- [ ] Diretorio `context/` existe
- [ ] Subdiretorios `PRD/`, `ARQUITETURA/` existem
- [ ] Cada subdiretorio tem `_index.md`
- [ ] `TASKS.md` existe com lista de tarefas
- [ ] `MANIFEST.md` existe e esta atualizado
- [ ] Todos os links no MANIFEST sao validos
- [ ] Nenhum arquivo orfao
- [ ] Todas as tarefas tem tags de contexto
- [ ] Tags apontam para arquivos existentes

---

## Uso Recomendado

Execute `/sync-context` quando:
- Adicionar nova feature ao PRD
- Criar novo ADR
- Adicionar tarefas ao TASKS.md
- Antes de rodar `/next` pela primeira vez
- Periodicamente (1x por semana)
