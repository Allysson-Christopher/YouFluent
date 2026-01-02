# Context Engineering Framework

## Objetivo do Projeto

Este projeto tem como objetivo construir um **framework completo para automatizar todo o processo de Context Engineering** - a disciplina de engenharia de contexto para assistentes de código IA, garantindo que eles tenham todas as informações necessárias para executar tarefas de ponta a ponta com sucesso.

> **Context Engineering é 10x melhor que prompt engineering e 100x melhor que vibe coding.**

### Visão

Criar um sistema onde:
1. O desenvolvedor descreve o que quer construir (descrição ou tarefa de TASKS/)
2. O framework automaticamente pesquisa, documenta e planeja (PRP consolidado)
3. A implementação é executada com validação contínua
4. O resultado é código production-ready na primeira tentativa

---

## Pilares Fundamentais

> **Documento completo: `docs/PILARES.md`**

### 1. Claude Code como Desenvolvedor Principal

O Claude Code não é apenas uma ferramenta de assistência - ele é o **desenvolvedor principal**. Todo o framework é construído para maximizar sua capacidade de implementar features completas.

**Implicações:**
- Documentação clara, estruturada e sem ambiguidades
- Exemplos de código completos e funcionais
- Padrões explícitos e consistentes
- Anti-patterns documentados

### 2. Desenvolvedor Solo + Claude Code

Este framework é otimizado para **um único desenvolvedor humano** trabalhando em parceria com Claude Code. Não há overhead de equipe.

**Divisão de responsabilidades:**
- **Humano**: Define requisitos, valida resultados finais, decisões de arquitetura de alto nível
- **Claude Code**: Pesquisa, documenta, implementa, testa, refatora

### 3. Autonomia Total na Implementação

O trabalho de Context Engineering deve permitir que o Claude Code trabalhe de **maneira autônoma, sem intervenção humana** durante a execução.

```
INICIAL.md (input humano) → [AUTOMAÇÃO TOTAL] → Feature Completa (validação final)
```

**Requisitos:**
- Contexto completo no PRP
- Decisões pré-definidas
- Validação automatizada
- Recuperação de erros documentada
- Critérios de conclusão objetivos

### 4. Domain-Driven Design (DDD)

**Obrigatório em todos os projetos.**

```
src/
├── domain/           # Regras de negócio puras
│   ├── entities/
│   ├── value_objects/
│   ├── aggregates/
│   ├── events/
│   └── services/
├── application/      # Casos de uso
│   ├── use_cases/
│   ├── dtos/
│   └── interfaces/
├── infrastructure/   # Implementações externas
│   ├── repositories/
│   ├── external_services/
│   └── persistence/
└── presentation/     # Interface com usuário/API
    ├── api/
    ├── cli/
    └── handlers/
```

**No INITIAL.md e PRP:** Seção obrigatória de DOMÍNIO com entidades, regras de negócio e glossário (linguagem ubíqua).

### 5. Clean Architecture

**Obrigatório em todos os projetos.**

```
Presentation → Application → Domain ← Infrastructure
                    ↑______________|

Dependências SEMPRE apontam para DENTRO (Domain)
```

**Regras:**
- Domain: Zero dependências externas
- Application: Depende apenas de Domain
- Infrastructure: Implementa interfaces definidas em Domain
- Presentation: Depende de Application

### 6. Test-Driven Development (TDD)

**Obrigatório em todos os projetos.**

```
RED → GREEN → REFACTOR → (repeat)
```

1. **RED**: Escrever teste que falha
2. **GREEN**: Código mínimo para passar
3. **REFACTOR**: Melhorar mantendo testes verdes

**Cobertura mínima:**
- Domain: 100%
- Application: 90%+
- Infrastructure: 80%+

**Estrutura:**
```
tests/
├── unit/           # Sem I/O
├── integration/    # Com dependências reais
└── e2e/            # Ponta a ponta
```

### 7. Testes Reais Substituem Revisão Humana

Criar estratégias específicas para cada projeto para que o Claude Code faça **testes reais na aplicação**, substituindo revisão humana.

**5 níveis de validação automatizada:**

| Nível | Tipo | Exemplo |
|-------|------|---------|
| 1 | Syntax & Style | `make lint`, `make format` |
| 2 | Unit Tests | `pytest tests/unit/ --cov-fail-under=90` |
| 3 | Integration | `docker-compose up -d && pytest tests/integration/` |
| 4 | E2E | `playwright test` ou `curl http://localhost/health` |
| 5 | Architecture | Validação de imports e dependências |

**Feature só está completa quando TODOS os níveis passam.**

### 8. Templates Refletem os Pilares

Todo INITIAL.md e PRP.md DEVE incorporar os pilares acima. Ver seções de templates abaixo.

### 9. Logs Estruturados para Debug Autônomo

Todo log deve ser estruturado e parseável para debug autônomo.

```python
# ❌ RUIM
print("erro no usuario")

# ✅ BOM
logger.error("user.creation.failed",
    user_id=user_id,
    reason="email_already_exists",
    correlation_id=request.correlation_id
)
```

**Padrão:** `{domain}.{entity}.{action}.{result}` (ex: `order.payment.process.failed`)

### 10. Contratos Explícitos (Design by Contract)

Toda interface deve ter pré-condições, pós-condições e invariantes documentados.

```python
def transfer(from_acc: str, to_acc: str, amount: Decimal) -> Result:
    """
    PRE: amount > 0, from_acc.balance >= amount
    POST: from_acc.balance == OLD - amount, to_acc.balance == OLD + amount
    ERRORS: InsufficientFundsError, AccountNotFoundError
    """
```

**Benefício:** Cada PRE/POST vira um teste; sem ambiguidade sobre comportamento esperado.

### 11. Erros como Tipos (Errors as Values)

Nunca usar exceções genéricas. Toda falha é um tipo explícito.

```python
# ❌ RUIM
raise Exception("User not found")

# ✅ BOM
@dataclass(frozen=True)
class UserNotFoundError:
    user_id: str
    searched_at: datetime

def get_user(id: str) -> Result[User, UserNotFoundError | DatabaseError]:
    ...
```

**Benefício:** Handling exaustivo; testes cobrem cada tipo de erro; sem surpresas em runtime.

---

## Estado Atual do Projeto

### Componentes Implementados

#### Comandos Slash (`.claude/commands/`)
| Comando | Função |
|---------|--------|
| `/generate-prp` | **(Autonomo)** Gera PRPs com 4 modos: AUTO (detecta proxima tarefa), TAREFA (T-XXX), LIVRE (descricao), INITIAL.md |
| `/execute-prp` | **(Ciclo completo)** Implementa PRP + valida + atualiza PRP + commit |
| `/next` | **(Orquestrador)** Apenas 2 comandos: /generate-prp → /execute-prp |
| `/carregar-contexto` | Carrega contexto modular por tags |
| `/sync-context` | Valida e sincroniza estrutura de contexto |
| `/gerar-prd` | Gera PRD com output modular |
| `/gerar-arquitetura` | Gera arquitetura com output modular |

#### Templates (`PRPs/templates/`)
- `INITIAL.md` - Template para requisições de features
- `INITIAL_EXAMPLE.md` - Exemplo real de requisição
- `prp_base.md` - Template base com 18 seções para PRPs completos

#### Use Cases (`use-cases/`)
1. **agent-factory-with-subagents** - Fábrica de agentes IA com subagentes paralelos
2. **mcp-server** - Servidores MCP com OAuth e PostgreSQL
3. **pydantic-ai** - Agentes usando Pydantic AI
4. **template-generator** - Meta-framework para gerar templates
5. **ai-coding-workflows-foundation** - Base para workflows de código IA

#### Documentação (`docs/`)
- `PILARES.md` - Pilares fundamentais do framework
- Git workflow usando commits como contexto para IA
- Templates de mensagens de commit

#### Validação (`validation/`)
- Sistema de validação em 5 fases
- Comando `/ultimate_validate_command` para auto-geração

---

## Sistema de Contexto e Progresso

### Git como Fonte de Progresso

**Progresso de tarefas e acompanhado via Git, nao via arquivos.**

```
TASKS/ (lista de tarefas) + Git (progresso) = Sistema Completo
```

- **TASKS/**: Uma tarefa por arquivo (T-001.md, T-002.md, ...)
- **Git commits**: Registro de tarefas concluidas e proxima tarefa
- **git-workflow.md**: Padrao de commits com secao "Roadmap Progress"

**Verificar progresso:**
```bash
# Ver ultima tarefa concluida
git log -1 --grep="^feat(T-\|^fix(T-" --format="%s"

# Ver todas as tarefas concluidas
git log --oneline --grep="T-"
```

### Sistema de Contexto Modular

> **Economia de ~85% de tokens por tarefa**

O problema do contexto monolitico:
- Cada tarefa carregava TODO o PRD e ARQUITETURA (~50KB+)
- Muitos tokens gastos com informacao irrelevante para a tarefa atual

A solucao modular:
- Arquivos divididos por secao
- Cada tarefa especifica apenas o que precisa via **Tags de Contexto**
- Carregamento inteligente com fallback para legado

### Estrutura de Contexto

```
context/
├── MANIFEST.md              # Indice central (navegacao)
├── TASKS/                   # Lista de tarefas (uma por arquivo)
│   ├── _index.md            # Indice (ordem + dependencias)
│   ├── T-001.md             # Tarefa 1
│   ├── T-002.md             # Tarefa 2
│   └── ...                  # Uma tarefa por arquivo
├── PRD/
│   ├── _index.md            # Resumo (~1KB) - SEMPRE carregado
│   ├── visao.md             # Visao e proposta de valor
│   ├── personas.md          # Personas e jornadas
│   ├── features/            # Uma feature por arquivo
│   │   ├── auth.md
│   │   ├── dashboard.md
│   │   └── ...
│   └── requisitos-nao-funcionais.md
└── ARQUITETURA/
    ├── _index.md            # Resumo (~1KB) - SEMPRE carregado
    ├── visao-geral.md       # Diagramas C4
    ├── stack.md             # Stack tecnologica
    ├── padroes.md           # DDD, Clean Arch, TDD
    ├── dominios/            # Um dominio por arquivo
    │   ├── user.md
    │   ├── order.md
    │   └── ...
    └── decisoes/            # ADRs
        ├── adr-001-db.md
        └── ...
```

### Tags de Contexto

Cada arquivo T-XXX.md especifica quais arquivos de contexto precisa.

**Formato Padrao (OBRIGATORIO):**

```markdown
## Tags de Contexto

```
PRD: features/auth
ARQUITETURA: dominios/user, decisoes/adr-001-db
```
```

> **Importante:** Este formato (header H2 + bloco de codigo) e o padrao oficial.
> O `/generate-prp` (modo AUTO/TAREFA) extrai e carrega contexto automaticamente.
> Outros comandos (`/carregar-contexto`, `/sync-context`) tambem usam este formato.

**Sintaxe das Tags:**
- `PRD: {arquivo}` - Carrega `context/PRD/{arquivo}.md`
- `ARQUITETURA: {arquivo}` - Carrega `context/ARQUITETURA/{arquivo}.md`
- Multiplos arquivos separados por virgula: `dominios/user, decisoes/adr-001`

O `/generate-prp` resolve essas tags para arquivos e carrega apenas o necessario.

### Comandos de Contexto

| Comando | Funcao |
|---------|--------|
| `/carregar-contexto` | Carrega contexto por tags ou tipo de tarefa |
| `/sync-context` | Valida estrutura, detecta links quebrados |

### Economia de Tokens

| Cenario | Antes (monolitico) | Depois (modular) | Economia |
|---------|-------------------|------------------|----------|
| Setup | ~50KB | ~6KB | **88%** |
| Feature | ~50KB | ~10KB | **80%** |
| Bug fix | ~50KB | ~4KB | **92%** |
| Refactor | ~50KB | ~6KB | **88%** |

### Fallback Automatico

Se arquivos modulares nao existirem, o sistema usa arquivos legados:
- `context/PRD/features/auth.md` → fallback para `context/PRD.md`
- `context/ARQUITETURA/dominios/user.md` → fallback para `context/ARQUITETURA.md`

---

## Regras para Desenvolvimento

### Consciencia do Projeto
- **Sempre leia este arquivo** no inicio de uma nova conversa
- **Leia `docs/PILARES.md`** para entender os principios fundamentais
- **Verifique a proxima tarefa:** `git log -1 --grep="T-"` + `context/TASKS/T-XXX.md`
- **Use `/carregar-contexto`** para carregar apenas contexto relevante por tags

### Estrutura de Código
- **Nunca crie arquivos com mais de 500 linhas** - refatore em módulos
- **Siga a estrutura DDD** definida nos pilares
- **Respeite Clean Architecture** - dependências apontam para Domain
- **Use variáveis de ambiente** para configuração

### Testes (TDD Obrigatório)
- **SEMPRE escreva o teste PRIMEIRO** (RED)
- **Implemente código mínimo** para passar (GREEN)
- **Refatore** mantendo testes verdes (REFACTOR)
- **Cobertura mínima**: Domain 100%, Application 90%, Infrastructure 80%

### Validação Automatizada
- **Execute todos os 5 níveis** de validação antes de considerar completo
- **Testes substituem revisão humana** - se os testes passam, o código está correto
- **Documente comandos de validação** específicos para cada projeto

### Conclusao de Tarefas
- **Commit e a fonte de verdade:** Ao concluir, faca commit seguindo `docs/git-docs/git-workflow.md`
- **O commit deve incluir:** Secao "Roadmap Progress" com task atual e proxima
- **Documente erros e decisoes** no PRP apos implementacao
- **Uma feature so esta completa** quando todos os testes passam

### Estilo e Convenções
- **Siga convenções estabelecidas** do projeto e framework
- **Use type annotations** sempre
- **Use bibliotecas de validação** (Pydantic, Zod, etc.)
- **Escreva docstrings** para toda função/método público

### Comportamento da IA (Claude Code)
- **Trabalhe de forma autônoma** - minimize perguntas durante execução
- **Nunca assuma contexto faltante** - busque no codebase ou documentação
- **Nunca invente bibliotecas ou funções** - use apenas pacotes verificados
- **Execute testes reais** - não apenas simule ou assuma que funcionam

---

## Workflow Principal: O Ciclo PRP (Autonomo)

```
/next (ou /generate-prp + /execute-prp manualmente)
        ↓
┌─────────────────────────────────────┐
│ /generate-prp (MODO AUTO)           │
│   • Git log → ultima tarefa         │
│   • TASKS/_index.md → proxima       │
│   • Extrair Tags de Contexto        │
│   • Carregar PRD + ARQUITETURA      │
│   • Gerar PRPs/{n}-{slug}/PRP.md    │
└────────────────┬────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│ /execute-prp                        │
│   • ULTRATHINK + TodoWrite          │
│   • Implementar (TDD)               │
│   • Validar (lint, tests, build)    │
│   • Atualizar PRP pos-implementacao │
│   • Commit seguindo git-workflow    │
│   • Reportar conclusao              │
└─────────────────────────────────────┘
                 ↓
        Feature Production-Ready
        + Commit registrado no Git
```

**Ganhos da arquitetura:**
- `/generate-prp`: 100% autossuficiente (detecta tarefa + carrega contexto + gera PRP)
- `/execute-prp`: Ciclo completo (implementa + valida + commit)
- `/next`: Orquestrador minimo (apenas 2 comandos)
- Responsabilidades claras e sem duplicacao

---

## Estrutura de INITIAL.md (Opcional - Retrocompatibilidade)

> **Nota:** Com o `/generate-prp` consolidado, o INITIAL.md não é mais obrigatório.
> Você pode passar uma descrição textual diretamente. O PRP gerado terá uma seção
> "Input Summary" que documenta o que seria o INITIAL.md.

Se preferir usar INITIAL.md (para requisições complexas):

```markdown
## FEATURE
[Descrição clara do que construir]

## DOMÍNIO (DDD)
### Entidades
### Value Objects
### Regras de Negócio
### Glossário (Linguagem Ubíqua)

## ARQUITETURA (Clean Architecture)
### Camada de Domínio
### Camada de Aplicação
### Camada de Infraestrutura
### Camada de Apresentação

## TESTES (TDD)
### Testes de Unidade (por camada)
### Testes de Integração
### Testes E2E
### Cobertura Mínima

## VALIDAÇÃO AUTOMATIZADA
### Comandos de Validação (5 níveis)
### Critérios de Conclusão Objetivos

## EXAMPLES
## DOCUMENTATION
## OTHER CONSIDERATIONS
```

---

## Estrutura de PRP.md (Obrigatória)

```markdown
## 1. GOAL
## 2. DOMAIN MODEL (DDD)
## 3. ARCHITECTURE (Clean Architecture)
## 4. IMPLEMENTATION BLUEPRINT (TDD)
    - Para cada componente: teste → código → refactor
## 5. VALIDATION LOOPS (5 níveis)
## 6. AUTONOMOUS EXECUTION CHECKLIST
    - Pré-condições
    - Critérios de conclusão
    - Recuperação de erros
## 7. ANTI-PATTERNS
```

---

## Arquivos Importantes

| Arquivo/Pasta | Proposito |
|---------------|-----------|
| `docs/PILARES.md` | **Pilares fundamentais (fonte de verdade)** |
| `docs/git-docs/git-workflow.md` | **Padrao de commits (progresso via Git)** |
| `context/TASKS/` | **Lista de tarefas (uma por arquivo: T-001.md, T-002.md)** |
| `.claude/commands/` | Comandos slash do Claude Code |
| `PRPs/templates/` | Templates para INITIAL e PRP |
| `PRPs/` | PRPs gerados para features |
| `use-cases/` | Implementacoes especializadas |
| `docs/` | Documentacao de workflows |
| `validation/` | Sistema de validacao |
| `examples/` | Exemplos de codigo |
| `context/MANIFEST.md` | Indice do contexto modular |
| `context/PRD/` | PRD modular (features separadas) |
| `context/ARQUITETURA/` | Arquitetura modular (dominios, ADRs) |

---

## Comandos Uteis

```bash
# Workflow completo automatizado
/next

# Verificar progresso (Git e a fonte de verdade)
git log -1 --grep="T-" --format="%s"   # Ultima tarefa
git log --oneline --grep="T-"           # Todas as tarefas

# Gerar PRP - MODO AUTO (detecta proxima tarefa automaticamente)
/generate-prp

# Gerar PRP - MODO TAREFA (tarefa especifica)
/generate-prp T-003

# Gerar PRP - MODO LIVRE (descricao textual)
/generate-prp "implementar autenticacao JWT com refresh tokens"

# Gerar PRP - MODO INITIAL.md (retrocompatibilidade)
/generate-prp PRPs/001-auth/INITIAL.md

# Executar um PRP para implementar feature
/execute-prp PRPs/001-auth/PRP.md

# Carregar contexto especifico por tags
/carregar-contexto PRD:features/auth ARQUITETURA:dominios/user

# Carregar contexto por tipo de tarefa
/carregar-contexto --tipo=feature --feature=auth

# Validar estrutura de contexto
/sync-context

# Gerar documentos (output modular)
/gerar-prd
/gerar-arquitetura
```

---

## Checklist de Conformidade

Antes de qualquer implementação, verifique:

- [ ] PRP gerado com `/generate-prp` (descrição, INITIAL.md ou T-XXX)
- [ ] PRP inclui Input Summary (documenta requisição original)
- [ ] PRP inclui modelo de domínio completo (DDD)
- [ ] Arquitetura segue Clean Architecture
- [ ] Workflow TDD definido (teste primeiro)
- [ ] Validation gates são executáveis
- [ ] Critérios de conclusão são objetivos e automatizados
- [ ] Nenhuma etapa requer intervenção humana durante execução
