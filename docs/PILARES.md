# Pilares Fundamentais do Framework

Este documento define os princípios inegociáveis que guiam todo o desenvolvimento do Context Engineering Framework. Todos os templates, comandos e workflows devem estar alinhados com estes pilares.

---

## 1. Claude Code como Desenvolvedor Principal

> **O desenvolvimento é implementado pelo Claude Code.**

- O Claude Code não é apenas uma ferramenta de assistência - ele é o **desenvolvedor principal**
- Todo o framework é construído para maximizar a capacidade do Claude Code de implementar features completas
- Os comandos, templates e documentação são otimizados para consumo e execução pelo Claude Code
- A qualidade do contexto fornecido determina diretamente a qualidade do código produzido

### Implicações Práticas
- Documentação deve ser clara, estruturada e sem ambiguidades
- Exemplos de código devem ser completos e funcionais
- Padrões devem ser explícitos e consistentes
- Anti-patterns devem ser documentados para evitar erros comuns

---

## 2. Desenvolvedor Solo + Claude Code

> **Eu desenvolvo sozinho. Não tenho equipe. Só eu e o Claude Code.**

- Este framework é otimizado para um único desenvolvedor humano trabalhando em parceria com Claude Code
- Não há overhead de comunicação de equipe, code review de pares, ou processos de aprovação
- A validação é feita através de **testes automatizados**, não revisão humana
- O desenvolvedor humano foca em:
  - Definir requisitos (INITIAL.md)
  - Validar resultados finais
  - Tomar decisões de arquitetura de alto nível
- O Claude Code foca em:
  - Pesquisar e documentar (PRP)
  - Implementar código
  - Criar e executar testes
  - Refatorar e otimizar

### Implicações Práticas
- Workflows devem minimizar intervenção humana durante execução
- Checkpoints de validação são automatizados, não manuais
- Documentação serve para o Claude Code, não para onboarding de equipe

---

## 3. Autonomia Total na Implementação

> **O trabalho de Context Engineering deve permitir que o Claude Code trabalhe de maneira autônoma, sem intervenção humana.**

Este é o objetivo central do framework:

```
INICIAL.md (input humano)
        ↓
   [AUTOMAÇÃO TOTAL]
        ↓
Feature Completa (validação humana final)
```

### Requisitos para Autonomia
1. **Contexto Completo**: O PRP deve conter TUDO que o Claude Code precisa
2. **Decisões Pré-definidas**: Escolhas de arquitetura documentadas, não deixadas para "decidir na hora"
3. **Validação Automatizada**: Testes que confirmam sucesso sem olho humano
4. **Recuperação de Erros**: Instruções claras para quando algo falha
5. **Critérios de Conclusão**: Definição objetiva de "pronto"

### O que "Sem Intervenção Humana" Significa
- ✅ Claude Code pode executar do início ao fim sem perguntas
- ✅ Validação acontece via testes, não aprovação manual
- ✅ Erros são detectados e corrigidos automaticamente
- ❌ Não significa que humano nunca revisa - significa que não é necessário durante execução

---

## 4. Domain-Driven Design (DDD)

> **Em todos os projetos nós trabalhamos com Domain-Driven Design.**

### Princípios DDD Obrigatórios

#### Linguagem Ubíqua
- Termos do domínio são definidos no INITIAL.md
- Código usa exatamente os mesmos termos
- Glossário incluso em cada PRP quando relevante

#### Bounded Contexts
- Cada feature/módulo tem fronteiras claras
- Dependências entre contextos são explícitas
- Comunicação entre contextos via interfaces bem definidas

#### Entidades e Value Objects
- Entidades têm identidade única
- Value Objects são imutáveis
- Agregados definem limites de consistência

#### Estrutura de Pastas DDD
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

### No INITIAL.md e PRP
- Seção obrigatória: **DOMÍNIO** com entidades, regras de negócio, glossário
- Diagramas de agregados quando complexidade justifica
- Eventos de domínio documentados

---

## 5. Clean Architecture

> **Em todos os projetos nós trabalhamos com Clean Architecture.**

### Regra de Dependência
```
Presentation → Application → Domain ← Infrastructure
                    ↑______________|

Dependências apontam para DENTRO (Domain)
Infrastructure implementa interfaces definidas em Domain/Application
```

### Camadas Obrigatórias

#### Domain (Centro)
- Zero dependências externas
- Entidades, Value Objects, Regras de Negócio
- Interfaces de repositório (não implementações)
- Testável isoladamente

#### Application (Casos de Uso)
- Orquestra o domínio
- Define DTOs de entrada/saída
- Implementa regras de aplicação (não de negócio)
- Depende apenas de Domain

#### Infrastructure (Adaptadores)
- Implementa interfaces do Domain
- Conexões com banco de dados
- Clientes de APIs externas
- Frameworks e bibliotecas

#### Presentation (Interface)
- Controllers, Handlers, CLI
- Validação de entrada
- Formatação de saída
- Depende de Application

### Validação de Arquitetura
- Todo PRP deve incluir verificação de que imports respeitam a regra de dependência
- Testes de arquitetura automatizados quando possível

---

## 6. Test-Driven Development (TDD)

> **Em todos os projetos nós trabalhamos com Test-Driven Development.**

### O Ciclo TDD é Obrigatório

```
┌─────────────────────────────────────────┐
│                                         │
│   RED → GREEN → REFACTOR → (repeat)     │
│                                         │
└─────────────────────────────────────────┘
```

1. **RED**: Escrever teste que falha (define o comportamento esperado)
2. **GREEN**: Escrever código mínimo para passar o teste
3. **REFACTOR**: Melhorar código mantendo testes passando

### Estrutura de Testes Obrigatória

```
tests/
├── unit/                    # Testes isolados, sem I/O
│   ├── domain/
│   ├── application/
│   └── infrastructure/
├── integration/             # Testes com dependências reais
│   ├── repositories/
│   └── external_services/
└── e2e/                     # Testes de ponta a ponta
    ├── api/
    └── workflows/
```

### Requisitos de Cobertura
- **Domain**: 100% de cobertura (regras de negócio são críticas)
- **Application**: 90%+ de cobertura
- **Infrastructure**: 80%+ de cobertura (foco em edge cases)
- **E2E**: Fluxos críticos cobertos

### No Workflow do Claude Code
1. Claude Code PRIMEIRO escreve o teste
2. Verifica que o teste FALHA (red)
3. Implementa o código
4. Verifica que o teste PASSA (green)
5. Refatora se necessário
6. Repete para próxima funcionalidade

---

## 7. Testes Reais Substituem Revisão Humana

> **Devemos criar estratégias específicas para cada projeto para que o Claude Code consiga fazer testes reais na aplicação, substituindo a necessidade de revisão humana.**

### Filosofia Central

```
Revisão Humana Tradicional    vs    Validação por Testes Reais
─────────────────────────────────────────────────────────────
"Olha esse código"                  "Todos os testes passam"
Subjetivo                           Objetivo
Inconsistente                       Reproduzível
Demorado                            Instantâneo
Não escalável                       100% escalável
```

### Estratégia de Validação por Projeto

Cada projeto DEVE definir no PRP:

#### 1. Testes de Unidade Executáveis
```bash
# Comando que Claude Code executa
pytest tests/unit/ -v --cov=src --cov-fail-under=90
```

#### 2. Testes de Integração com Ambiente Real
```bash
# Banco de dados real (Docker)
docker-compose up -d test-db
pytest tests/integration/ -v

# APIs externas (mocks ou sandbox)
pytest tests/integration/external/ --use-sandbox
```

#### 3. Testes E2E que Simulam Usuário Real
```bash
# Para APIs
pytest tests/e2e/ -v
# ou
curl -X POST http://localhost:8000/api/endpoint -d '{"test": "data"}'

# Para Frontend
npx playwright test

# Para CLI
./cli --command --flags | grep "expected output"
```

#### 4. Validação de Arquitetura
```bash
# Python
pytest tests/architecture/ -v
# ou ferramentas como import-linter, pytestarch

# TypeScript
npx eslint --rule 'import/no-restricted-paths'
```

#### 5. Smoke Tests de Deploy
```bash
# Verifica que aplicação sobe e responde
docker-compose up -d
curl http://localhost:8000/health | grep "ok"
```

### Critérios de "Pronto" Automatizados

Uma feature SÓ está completa quando:
- [ ] `make test-unit` passa (ou equivalente)
- [ ] `make test-integration` passa
- [ ] `make test-e2e` passa
- [ ] `make lint` passa
- [ ] `make type-check` passa
- [ ] Cobertura acima do threshold definido

---

## 8. INITIAL.md e PRP.md Refletem os Pilares

> **Os arquivos INITIAL.md e PRP.md gerados para cada tarefa devem refletir estes princípios.**

### Template INITIAL.md Atualizado

Todo INITIAL.md DEVE conter:

```markdown
## FEATURE
[Descrição clara do que construir]

## DOMÍNIO (DDD)
### Entidades
### Value Objects
### Regras de Negócio
### Glossário (Linguagem Ubíqua)

## ARQUITETURA
### Camada de Domínio
### Camada de Aplicação
### Camada de Infraestrutura
### Camada de Apresentação

## TESTES REQUERIDOS
### Testes de Unidade (por camada)
### Testes de Integração
### Testes E2E
### Critérios de Cobertura

## VALIDAÇÃO AUTOMATIZADA
### Comandos de Validação
### Critérios de Conclusão Objetivos

## EXAMPLES
[Exemplos de código seguindo os padrões]

## DOCUMENTATION
[Links e referências]

## OTHER CONSIDERATIONS
[Especificidades do projeto]
```

### Template PRP.md Atualizado

Todo PRP DEVE incluir:

```markdown
## 1. GOAL
[Objetivo claro e mensurável]

## 2. DOMAIN MODEL (DDD)
### Bounded Context
### Entidades e Aggregates
### Value Objects
### Domain Events
### Domain Services

## 3. ARCHITECTURE (Clean Architecture)
### Estrutura de Pastas
### Regra de Dependência
### Interfaces e Implementações

## 4. IMPLEMENTATION BLUEPRINT (TDD)
### Para cada componente:
1. Teste a escrever PRIMEIRO
2. Código mínimo para passar
3. Refatoração planejada

## 5. VALIDATION LOOPS (Substituem Revisão Humana)
### Level 1: Syntax & Style
[Comandos específicos]

### Level 2: Unit Tests
[Comandos + cobertura esperada]

### Level 3: Integration Tests
[Setup de ambiente + comandos]

### Level 4: E2E Tests
[Cenários + comandos de execução]

### Level 5: Architecture Validation
[Verificação de dependências]

## 6. AUTONOMOUS EXECUTION CHECKLIST
### Pré-condições (Claude Code verifica antes de começar)
### Critérios de Conclusão (objetivos, automatizados)
### Recuperação de Erros (o que fazer se X falha)

## 7. ANTI-PATTERNS
[O que NÃO fazer - específico para este projeto]
```

---

## 9. Logs Estruturados para Debug Autônomo

> **Todo log deve ser estruturado e parseável para que o Claude Code consiga diagnosticar problemas autonomamente.**

### Problema com Logs Tradicionais
```python
# ❌ RUIM - Claude Code não consegue parsear
print("erro no usuario")
logger.info("Processando...")
logger.error(f"Falhou: {e}")
```

### Logs Estruturados Obrigatórios
```python
# ✅ BOM - Estruturado, parseável, contexto completo
import structlog

logger = structlog.get_logger()

logger.info("user.creation.started",
    user_id=user_id,
    email=email,
    source="api"
)

logger.error("user.creation.failed",
    user_id=user_id,
    reason="email_already_exists",
    input={"email": email},
    stack_trace=traceback.format_exc(),
    correlation_id=request.correlation_id
)
```

### Padrão de Nomenclatura
```
{domain}.{entity}.{action}.{result}

Exemplos:
- user.account.create.success
- order.payment.process.failed
- auth.token.validate.expired
```

### Campos Obrigatórios em Logs de Erro
| Campo | Descrição |
|-------|-----------|
| `correlation_id` | ID para rastrear request através do sistema |
| `timestamp` | ISO 8601 com timezone |
| `level` | debug, info, warning, error, critical |
| `event` | Nome estruturado do evento |
| `context` | Dados relevantes para debug |
| `stack_trace` | Para erros, trace completo |

### Benefício para Autonomia
Claude Code pode:
- `grep` por padrões específicos de erro
- Identificar causa raiz sem perguntar
- Correlacionar eventos entre serviços
- Sugerir fix baseado no contexto do erro

---

## 10. Contratos Explícitos (Design by Contract)

> **Toda interface deve ter pré-condições, pós-condições e invariantes documentados.**

### Filosofia
```
Se o contrato está claro, o teste se escreve sozinho.
Se o teste se escreve sozinho, Claude Code implementa sem ambiguidade.
```

### Estrutura de Contrato

```python
from typing import Protocol
from dataclasses import dataclass

@dataclass(frozen=True)
class TransferResult:
    success: bool
    transaction_id: str
    new_balance: Decimal

class MoneyTransferService(Protocol):
    """
    Serviço de transferência de dinheiro entre contas.

    PRE-CONDITIONS (o que DEVE ser verdade antes de chamar):
        - amount > 0
        - from_account.balance >= amount
        - from_account != to_account
        - from_account.status == 'active'
        - to_account.status == 'active'

    POST-CONDITIONS (o que SERÁ verdade depois de chamar com sucesso):
        - from_account.balance == OLD(from_account.balance) - amount
        - to_account.balance == OLD(to_account.balance) + amount
        - result.transaction_id is unique
        - TransferEvent was published

    INVARIANTS (o que SEMPRE é verdade):
        - total_money_in_system == constant (dinheiro não é criado/destruído)
        - all transactions are logged

    ERRORS:
        - InsufficientFundsError: when from_account.balance < amount
        - AccountNotFoundError: when account doesn't exist
        - AccountInactiveError: when account.status != 'active'
    """

    def transfer(
        self,
        from_account: AccountId,
        to_account: AccountId,
        amount: Decimal
    ) -> TransferResult:
        ...
```

### Validação de Contratos em Runtime

```python
from contracts import require, ensure, invariant

class BankAccount:
    @invariant(lambda self: self.balance >= 0)
    def __init__(self, initial_balance: Decimal):
        self.balance = initial_balance

    @require(lambda self, amount: amount > 0, "amount must be positive")
    @require(lambda self, amount: self.balance >= amount, "insufficient funds")
    @ensure(lambda self, amount, result: self.balance == old.balance - amount)
    def withdraw(self, amount: Decimal) -> Decimal:
        self.balance -= amount
        return self.balance
```

### No PRP - Seção de Contratos
```markdown
## CONTRACTS

### UserService.create_user()
PRE:
  - email is valid format
  - email not in database
  - password meets strength requirements
POST:
  - User exists in database
  - Welcome email queued
  - UserCreatedEvent published
ERRORS:
  - EmailAlreadyExistsError
  - WeakPasswordError
```

### Benefício para Autonomia
- Claude Code sabe exatamente o que testar (cada PRE/POST vira um teste)
- Sem ambiguidade sobre comportamento esperado
- Erros possíveis estão documentados = handling completo

---

## 11. Erros como Tipos (Errors as Values)

> **Nunca usar exceções genéricas. Toda falha possível é um tipo explícito e tratável.**

### Problema com Exceções Genéricas
```python
# ❌ RUIM - Claude Code não sabe quais erros tratar
def get_user(user_id: str) -> User:
    user = db.find(user_id)
    if not user:
        raise Exception("User not found")  # Genérico demais
    return user

# Quem chama não sabe o que pode dar errado
try:
    user = get_user(id)
except Exception as e:  # Captura tudo, inclusive bugs
    ...
```

### Erros como Tipos - Padrão Obrigatório

```python
from dataclasses import dataclass
from typing import Union
from result import Result, Ok, Err

# Definir tipos específicos para cada erro possível
@dataclass(frozen=True)
class UserNotFoundError:
    user_id: str
    searched_at: datetime

@dataclass(frozen=True)
class UserInactiveError:
    user_id: str
    deactivated_at: datetime
    reason: str

@dataclass(frozen=True)
class DatabaseConnectionError:
    host: str
    error_message: str
    retry_count: int

# Union de todos os erros possíveis
UserError = Union[UserNotFoundError, UserInactiveError, DatabaseConnectionError]

# Função retorna Result em vez de raise
def get_user(user_id: str) -> Result[User, UserError]:
    try:
        user = db.find(user_id)
    except ConnectionError as e:
        return Err(DatabaseConnectionError(
            host=db.host,
            error_message=str(e),
            retry_count=0
        ))

    if not user:
        return Err(UserNotFoundError(
            user_id=user_id,
            searched_at=datetime.now()
        ))

    if not user.is_active:
        return Err(UserInactiveError(
            user_id=user_id,
            deactivated_at=user.deactivated_at,
            reason=user.deactivation_reason
        ))

    return Ok(user)
```

### Pattern Matching para Handling Exaustivo

```python
# ✅ BOM - Compilador/linter garante que todos os casos são tratados
match get_user(user_id):
    case Ok(user):
        return {"status": "success", "user": user}
    case Err(UserNotFoundError(user_id=uid)):
        return {"status": "error", "code": "NOT_FOUND", "user_id": uid}
    case Err(UserInactiveError(reason=reason)):
        return {"status": "error", "code": "INACTIVE", "reason": reason}
    case Err(DatabaseConnectionError(retry_count=count)):
        if count < 3:
            return retry_get_user(user_id, count + 1)
        return {"status": "error", "code": "DB_UNAVAILABLE"}
```

### Hierarquia de Erros por Camada

```
domain/errors/
├── base.py           # DomainError base
├── user_errors.py    # UserNotFoundError, UserInactiveError
├── order_errors.py   # OrderNotFoundError, InvalidOrderStateError
└── payment_errors.py # PaymentDeclinedError, InsufficientFundsError

application/errors/
├── validation_errors.py  # InvalidInputError, MissingFieldError
└── authorization_errors.py # NotAuthorizedError, TokenExpiredError

infrastructure/errors/
├── database_errors.py    # ConnectionError, QueryTimeoutError
└── external_api_errors.py # APIUnavailableError, RateLimitError
```

### Benefício para Autonomia
- Claude Code vê todos os erros possíveis no tipo de retorno
- Implementa handling exaustivo (nenhum caso esquecido)
- Testes cobrem cada tipo de erro explicitamente
- Sem surpresas em runtime - erros são dados, não exceções

---

## Checklist de Conformidade

Antes de iniciar qualquer implementação, verifique:

- [ ] INITIAL.md segue o template com seções DDD
- [ ] PRP inclui modelo de domínio completo
- [ ] Arquitetura segue Clean Architecture
- [ ] Workflow TDD está definido (teste primeiro)
- [ ] Comandos de validação são executáveis pelo Claude Code
- [ ] Critérios de conclusão são objetivos e automatizados
- [ ] Nenhuma etapa requer intervenção humana durante execução

---

## Resumo dos Pilares

| # | Pilar | Implicação Principal |
|---|-------|---------------------|
| 1 | Claude Code é o desenvolvedor | Framework otimizado para IA |
| 2 | Dev solo + Claude Code | Sem overhead de equipe |
| 3 | Autonomia total | Zero intervenção durante execução |
| 4 | DDD | Domínio bem modelado em todo projeto |
| 5 | Clean Architecture | Dependências sempre para dentro |
| 6 | TDD | Teste primeiro, código depois |
| 7 | Testes = Revisão | Validação automatizada substitui humano |
| 8 | Templates refletem pilares | INITIAL e PRP incorporam tudo acima |
| 9 | Logs Estruturados | Debug autônomo sem perguntas |
| 10 | Contratos Explícitos | PRE/POST conditions = testes sem ambiguidade |
| 11 | Erros como Tipos | Handling exaustivo, sem exceções genéricas |

---

*Este documento é a fonte de verdade para os princípios do framework. Qualquer conflito com outros documentos deve ser resolvido em favor destes pilares.*
