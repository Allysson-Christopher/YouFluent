# Padroes de Arquitetura

> **Padroes obrigatorios conforme PILARES.md**

---

## DDD - Domain-Driven Design

### Estrutura de Dominio

```
domain/
├── entities/          # Entidades com identidade
├── value_objects/     # Objetos imutaveis sem identidade
├── aggregates/        # Agregados (raiz + entidades)
├── events/            # Eventos de dominio
├── services/          # Servicos de dominio (logica que nao pertence a entidade)
├── repositories/      # Interfaces (ports) - NAO implementacoes
└── errors/            # Erros tipados do dominio
```

### Regras

1. **Entidades** tem identidade unica e ciclo de vida
2. **Value Objects** sao imutaveis e comparados por valor
3. **Aggregates** protegem invariantes e sao unidade de consistencia
4. **Domain Services** contem logica que nao pertence a uma entidade
5. **Repositories** sao interfaces definidas no dominio, implementadas na infra

### Linguagem Ubiqua

| Termo | Definicao no Dominio |
|-------|---------------------|
| {termo} | {definicao} |

---

## Clean Architecture

### Camadas e Dependencias

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   Presentation ──► Application ──► Domain ◄── Infrastructure    │
│                                      ▲                          │
│                                      │                          │
│                         Dependencias apontam para DENTRO        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Regras de Dependencia

| Camada | Pode Depender De | NAO Pode Depender De |
|--------|------------------|---------------------|
| Domain | Nada (0 deps externas) | Application, Infra, Presentation |
| Application | Domain | Infrastructure, Presentation |
| Infrastructure | Domain, Application | Presentation |
| Presentation | Application | Domain direto, Infrastructure |

### Estrutura de Diretorios

```
src/
├── domain/           # Regras de negocio puras
├── application/      # Casos de uso (orquestra dominio)
├── infrastructure/   # Implementacoes concretas (adapters)
└── presentation/     # Interface com usuario/mundo externo
```

---

## TDD - Test-Driven Development

### Ciclo

```
RED ──► GREEN ──► REFACTOR ──► (repeat)
```

1. **RED**: Escrever teste que falha
2. **GREEN**: Codigo minimo para passar
3. **REFACTOR**: Melhorar mantendo testes verdes

### Cobertura por Camada

| Camada | Cobertura Minima | Tipo de Teste |
|--------|------------------|---------------|
| Domain | 100% | Unit |
| Application | 90% | Unit |
| Infrastructure | 80% | Integration |
| Presentation | E2E criticos | E2E |

### Estrutura de Testes

```
tests/
├── unit/             # Sem I/O, rapidos
│   ├── domain/
│   └── application/
├── integration/      # Com dependencias reais
│   └── infrastructure/
└── e2e/              # Ponta a ponta
    └── api/
```

---

## Padroes Adicionais (Opcionais)

### Repository Pattern

- Interface no Domain
- Implementacao na Infrastructure
- Injeta via Dependency Injection

### Result Type

```python
# Nunca usar excecoes genericas
# Sempre retornar Result[T, E]

def get_user(id: str) -> Result[User, UserNotFoundError]:
    ...
```

### Design by Contract

```python
def transfer(from_acc: str, to_acc: str, amount: Decimal) -> Result:
    """
    PRE: amount > 0, from_acc.balance >= amount
    POST: from_acc.balance == OLD - amount
    ERRORS: InsufficientFundsError, AccountNotFoundError
    """
```

---

*Baseado em: docs/PILARES.md*
*Atualizado em: {data}*
