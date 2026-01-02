# Arquitetura: {Nome do Projeto}

> **Resumo da arquitetura - carregue este arquivo para contexto rapido.**

---

## Stack Principal

| Camada | Tecnologia |
|--------|------------|
| Backend | {linguagem} + {framework} |
| Database | {tipo} |
| Auth | {metodo} |
| Hosting | {onde} |

## Estrutura de Diretorios

```
src/
├── domain/           # Regras de negocio puras
├── application/      # Casos de uso
├── infrastructure/   # Implementacoes externas
└── presentation/     # API/CLI
```

## Padroes Obrigatorios

- **DDD** - Domain-Driven Design
- **Clean Architecture** - Dependencias apontam para dentro
- **TDD** - Teste primeiro

## ADRs Principais

| ADR | Decisao |
|-----|---------|
| ADR-001 | {titulo} |
| ADR-002 | {titulo} |

---

## Navegacao

| Secao | Arquivo | Quando Usar |
|-------|---------|-------------|
| Diagramas | `ARQUITETURA/visao-geral.md` | Entender sistema |
| Stack | `ARQUITETURA/stack.md` | Escolhas tecnicas |
| Dominios | `ARQUITETURA/dominios/*.md` | Implementar entidade |
| ADRs | `ARQUITETURA/decisoes/*.md` | Entender decisao |
| Padroes | `ARQUITETURA/padroes.md` | Setup/Refactor |

---

*Gerado em: {data}*
