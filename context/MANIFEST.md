# Context Manifest

**Versao:** 1.0
**Atualizado:** {auto}

> **Indice central de todo o contexto do projeto.**
> Use este arquivo para navegar rapidamente e carregar apenas o contexto necessario.

---

## Estrutura de Contexto

```
context/
├── MANIFEST.md              # Este arquivo (indice)
├── PRD/
│   ├── _index.md            # Resumo do PRD (~1KB)
│   ├── visao.md             # Visao e proposta de valor
│   ├── personas.md          # Personas e jornadas
│   ├── features/            # Uma feature por arquivo
│   │   ├── {feature-slug}.md
│   │   └── ...
│   └── requisitos-nao-funcionais.md
├── ARQUITETURA/
│   ├── _index.md            # Resumo da arquitetura (~1KB)
│   ├── visao-geral.md       # Diagramas C4 e overview
│   ├── stack.md             # Stack tecnologica completa
│   ├── dominios/            # Um dominio por arquivo
│   │   ├── {dominio-slug}.md
│   │   └── ...
│   ├── decisoes/            # ADRs
│   │   ├── adr-001-{slug}.md
│   │   └── ...
│   └── padroes.md           # DDD, Clean Arch, TDD
└── TASKS/
    ├── _index.md            # Indice (ordem + dependencias)
    ├── T-001.md             # Tarefa 1
    ├── T-002.md             # Tarefa 2
    └── ...                  # Uma tarefa por arquivo
```

---

## Indices por Modulo

### PRD (Product Requirements Document)

| Arquivo | Descricao | Tamanho |
|---------|-----------|---------|
| `PRD/_index.md` | **Resumo executivo** - visao, proposta, MVP | ~1KB |
| `PRD/visao.md` | Visao de longo prazo, proposta de valor | ~2KB |
| `PRD/personas.md` | Personas e jornadas do usuario | ~3KB |
| `PRD/features/*.md` | Features detalhadas (MoSCoW) | ~2KB cada |
| `PRD/requisitos-nao-funcionais.md` | Performance, seguranca, escala | ~2KB |

**Para carregar contexto de PRD:**
- Tarefa de feature X → `PRD/_index.md` + `PRD/features/X.md`
- Tarefa de UX → `PRD/_index.md` + `PRD/personas.md`
- Tarefa de infra → `PRD/_index.md` + `PRD/requisitos-nao-funcionais.md`

### ARQUITETURA

| Arquivo | Descricao | Tamanho |
|---------|-----------|---------|
| `ARQUITETURA/_index.md` | **Resumo** - stack, padroes, estrutura | ~1KB |
| `ARQUITETURA/visao-geral.md` | Diagramas C4, contexto, containers | ~3KB |
| `ARQUITETURA/stack.md` | Linguagens, frameworks, servicos | ~2KB |
| `ARQUITETURA/dominios/*.md` | Modelo de dominio por bounded context | ~2KB cada |
| `ARQUITETURA/decisoes/*.md` | ADRs (Architecture Decision Records) | ~1KB cada |
| `ARQUITETURA/padroes.md` | DDD, Clean Architecture, TDD | ~2KB |

**Para carregar contexto de Arquitetura:**
- Tarefa de dominio X → `ARQUITETURA/_index.md` + `ARQUITETURA/dominios/X.md`
- Tarefa de integracao → `ARQUITETURA/_index.md` + `ARQUITETURA/stack.md` + ADRs relevantes
- Tarefa de setup → `ARQUITETURA/_index.md` + `ARQUITETURA/padroes.md`

### TASKS

| Arquivo | Descricao | Tamanho |
|---------|-----------|---------|
| `TASKS/_index.md` | **Indice** - ordem, dependencias, lista de IDs | ~0.5KB |
| `TASKS/T-XXX.md` | Uma tarefa por arquivo | ~1KB cada |

**Progresso:** Acompanhado via Git (commits), nao via arquivos.
```bash
git log -1 --grep="^feat(T-\|^fix(T-" --format="%s"  # Ultima concluida
git log --oneline --grep="T-"                         # Todas concluidas
```

**Para carregar contexto de Tasks:**
- Iniciar tarefa → `TASKS/_index.md` (ordem) + `TASKS/T-XXX.md` (tarefa especifica)
- Visao geral → `TASKS/_index.md` apenas
- Tarefa com dependencia → `T-XXX.md` + `T-YYY.md` (dependencias)

---

## Carregamento por Tipo de Tarefa

### Setup/Infraestrutura
```
Carregar:
├── ARQUITETURA/_index.md
├── ARQUITETURA/stack.md
├── ARQUITETURA/padroes.md
└── TASKS/T-XXX.md (tarefa especifica via Git)

~6KB total
```

### Feature de Negocio
```
Carregar:
├── PRD/_index.md
├── PRD/features/{feature}.md
├── ARQUITETURA/_index.md
├── ARQUITETURA/dominios/{dominio}.md
├── ARQUITETURA/decisoes/{adrs-relevantes}.md
└── TASKS/T-XXX.md (tarefa especifica via Git)

~10KB total
```

### Bug Fix
```
Carregar:
├── ARQUITETURA/_index.md
├── ARQUITETURA/dominios/{dominio-afetado}.md
└── TASKS/T-XXX.md (tarefa especifica via Git)

~4KB total
```

### Refatoracao
```
Carregar:
├── ARQUITETURA/_index.md
├── ARQUITETURA/padroes.md
├── ARQUITETURA/dominios/{dominio}.md
└── TASKS/T-XXX.md (tarefa especifica via Git)

~6KB total
```

---

## Tags de Contexto

Cada arquivo `TASKS/T-XXX.md` especifica tags de contexto:

```markdown
**Tags de Contexto:**
PRD: features/auth
ARQUITETURA: dominios/user, decisoes/adr-001-db
```

O loader inteligente (`/carregar-contexto`) usa essas tags para carregar apenas os arquivos necessarios.

---

## Economia de Tokens

| Cenario | Antes (monolitico) | Depois (modular) | Economia |
|---------|-------------------|------------------|----------|
| Setup inicial | ~50KB | ~6KB | **88%** |
| Feature media | ~50KB | ~10KB | **80%** |
| Bug fix | ~50KB | ~4KB | **92%** |
| Refatoracao | ~50KB | ~6KB | **88%** |

**Media:** ~85% de economia de tokens por tarefa

---

## Validacao

Execute `/sync-context` para:
- Verificar links quebrados
- Detectar arquivos orfaos
- Sugerir reorganizacao
- Atualizar este manifest

---

## Referencias

| Documento | Descricao |
|-----------|-----------|
| `CLAUDE.md` | Regras globais do projeto |
| `docs/PILARES.md` | Pilares fundamentais |
| `.claude/commands/` | Comandos do framework |

---

*Manifest gerado pelo Context Engineering Framework*
*Sistema de Contexto Modular v1.0*
