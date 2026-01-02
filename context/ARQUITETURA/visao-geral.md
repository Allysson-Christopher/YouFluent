# Visao Geral da Arquitetura

---

## Diagrama de Contexto (C4 - Nivel 1)

```
┌─────────────────────────────────────────────────────────────────┐
│                         SISTEMA: {Nome}                          │
│                                                                  │
│  ┌──────────┐       ┌─────────────────┐       ┌──────────┐     │
│  │ Usuario  │──────►│   {Nome do      │◄─────►│ Sistema  │     │
│  │ {tipo}   │       │   Sistema}      │       │ Externo  │     │
│  └──────────┘       └─────────────────┘       └──────────┘     │
│                              │                                   │
│                              ▼                                   │
│                     ┌──────────────┐                            │
│                     │   Database   │                            │
│                     └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘
```

**Atores:**
- **{Usuario tipo 1}**: {descricao e como interage}
- **{Sistema externo}**: {descricao e proposito da integracao}

---

## Diagrama de Containers (C4 - Nivel 2)

```
┌────────────────────────────────────────────────────────────────────┐
│                          {Nome do Sistema}                          │
│                                                                     │
│   ┌─────────────┐    ┌─────────────┐    ┌─────────────────────┐   │
│   │   Frontend  │    │   Backend   │    │     Workers         │   │
│   │             │───►│   API       │───►│   (Background)      │   │
│   │ {framework} │    │ {framework} │    │   {se aplicavel}    │   │
│   │ {hosting}   │    │ {hosting}   │    │                     │   │
│   └─────────────┘    └──────┬──────┘    └─────────────────────┘   │
│                             │                                      │
│              ┌──────────────┼──────────────┐                      │
│              ▼              ▼              ▼                      │
│      ┌───────────┐   ┌───────────┐   ┌───────────┐              │
│      │ Database  │   │   Cache   │   │  Storage  │              │
│      │ {tipo}    │   │ {tipo}    │   │  {tipo}   │              │
│      └───────────┘   └───────────┘   └───────────┘              │
└────────────────────────────────────────────────────────────────────┘
```

### Containers

| Container | Tecnologia | Responsabilidade | Comunicacao |
|-----------|------------|------------------|-------------|
| Frontend | {stack} | {funcao} | HTTPS → Backend |
| Backend API | {stack} | {funcao} | REST/GraphQL |
| Database | {tipo} | {funcao} | TCP |
| Cache | {tipo} | {funcao} | TCP |

---

## Fluxo de Dados Principal

```
Usuario
   │
   ▼
[Frontend] ──HTTP──► [API Gateway]
                          │
                          ▼
                    [Use Case Layer]
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
        [Domain]               [Infrastructure]
              │                       │
              └───────────┬───────────┘
                          ▼
                    [Database]
```

---

*Extraido de: Arquitetura completa*
*Atualizado em: {data}*
