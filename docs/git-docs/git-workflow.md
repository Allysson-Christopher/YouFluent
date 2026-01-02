# Git Workflow

## Objetivo

Usar o Git como fonte primária de contexto histórico para guiar agentes de IA ao longo de todo o desenvolvimento do projeto.

---

## Filosofia

Cada commit deve conter informação suficiente para que um agente de IA (ou desenvolvedor) possa:

1. Entender **por que** a mudança foi feita
2. Entender **como** foi implementada
3. Conhecer **erros comuns** e suas soluções
4. Reproduzir ou modificar a implementação com contexto completo

---

## Tipos de Commit

| Tipo       | Descrição                                | Exemplo                                               |
| ---------- | ---------------------------------------- | ----------------------------------------------------- |
| `feat`     | Nova funcionalidade                      | `feat: implement User entity with TDD`                |
| `fix`      | Correção de bug                          | `fix: resolve Prisma connection timeout in Docker`    |
| `refactor` | Refatoração sem mudança de comportamento | `refactor: extract validation logic to value objects` |
| `test`     | Adição/modificação de testes             | `test: add integration tests for UserRepository`      |
| `docs`     | Documentação                             | `docs: add API documentation for auth endpoints`      |
| `chore`    | Tarefas de manutenção                    | `chore: update dependencies to latest versions`       |
| `style`    | Formatação de código                     | `style: apply Prettier formatting`                    |
| `perf`     | Melhorias de performance                 | `perf: optimize availability query with indexes`      |

---

## Estrutura de Mensagem de Commit

### 1. Título (Obrigatório)

- Máximo 72 caracteres
- Formato: `<tipo>(<task>): <descrição>`
- Incluir numero da task (T-XXX do TASKS.md)
- Usar imperativo ("add", não "added")
- Não terminar com ponto final

**Exemplos:**

```
feat(task-1.1): implement User entity with validation
fix(task-0.6): resolve Docker network configuration issue
test(task-1.3): add unit tests for Group entity
chore(task-0.1): setup monorepo structure
```

### 2. Corpo (Obrigatório para commits não-triviais)

Use as seções do template:

#### **## Roadmap Progress** (Obrigatorio)

Informacoes sobre a task atual e proxima task do TASKS.md.

#### **## Contexto** (Obrigatório)

Por que essa mudança foi necessária?

#### **## Implementação** (Obrigatório)

Como foi implementado tecnicamente?

#### **## TDD Cycle** (Obrigatório para features)

Documentar o ciclo RED → GREEN → REFACTOR.

#### **## Erros Encontrados Durante Implementação** (Obrigatório)

Liste TODOS os erros encontrados e soluções. Se não houve erros, escreva "Nenhum erro encontrado".

#### **## Decisões de Design** (Obrigatório para features)

Escolhas arquiteturais e trade-offs.

#### **## Testes** (Obrigatório quando há código)

Testes criados e cobertura alcançada.

#### **## Arquivos Modificados** (Opcional)

Lista dos principais arquivos e o que foi feito.

#### **## Próximos Passos / TODOs** (Opcional)

Pendências relacionadas a este commit.

#### **## Referências** (Opcional)

Links, docs, issues relacionadas.

#### **## Observações Adicionais** (Opcional)

Qualquer informação extra relevante.

---

## Exemplos Práticos

### Exemplo 1: Feature com TDD

```
feat(task-1.1): implement User entity with validation

## Roadmap Progress
Task atual: [1.1] - Entidade User
Status: COMPLETA
Próxima task: [1.2] - Entidade Sport
Fase: Fase 1: Domain Layer (Backend)
Progresso da fase: 1/8 tasks completas

## Contexto
Precisamos da entidade User como base do domínio, seguindo DDD
com Value Objects para validações de email, telefone e nível.

## Implementação
- Criada entidade User em src/domain/entities/user.entity.ts
- Value Objects: Email, Phone, Level
- Validações no construtor (fail-fast principle)
- Entidade imutável (readonly properties)
- Sem dependência de frameworks externos

## TDD Cycle
- 🔴 RED: 5 testes criados, todos falhando inicialmente
- 🟢 GREEN: Implementação mínima para passar os testes
- 🔵 REFACTOR: Extraídas validações para Value Objects

## Erros Encontrados Durante Implementação
Nenhum erro encontrado durante implementação.

## Decisões de Design
- Value Objects imutáveis seguindo DDD patterns
- Validação no construtor (fail-fast principle)
- Níveis como enum: Iniciante, 5ª a 1ª classe
- Email como Value Object para garantir formato válido

## Testes
- Testes unitários: apps/api/src/domain/__tests__/user.entity.spec.ts
  - Deve criar User com dados válidos
  - Deve falhar com email inválido
  - Deve falhar com nível inválido
  - Deve validar formato de telefone
  - Deve ser imutável
- Cobertura alcançada: 100%
- Comando: npm run test:api

## Arquivos Modificados
- apps/api/src/domain/entities/user.entity.ts - Entidade User
- apps/api/src/domain/value-objects/email.vo.ts - VO Email
- apps/api/src/domain/value-objects/phone.vo.ts - VO Phone
- apps/api/src/domain/value-objects/level.vo.ts - VO Level
- apps/api/src/domain/__tests__/user.entity.spec.ts - Testes

## Próximos Passos / TODOs
Nenhuma pendência nesta task.

PROXIMA TASK (TASKS.md):
[T-002]: Entidade Sport
Checklist da próxima task:
- [ ] Criar entidade Sport com níveis configuráveis
- [ ] Implementar testes unitários (TDD)
- [ ] Garantir 100% de cobertura

## Referências
- DDD Value Objects: https://martinfowler.com/bliki/ValueObject.html
- Clean Architecture: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html

🤖 Generated with Claude Code (https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

### Exemplo 2: Fix com Erros Detalhados

```
fix(task-0.6): resolve Prisma connection timeout in Docker

## Roadmap Progress
Task atual: [0.6] - Configurar Docker
Status: COMPLETA
Próxima task: [0.7] - Configurar Prisma
Fase: Fase 0: Setup do Projeto
Progresso da fase: 6/16 tasks completas

## Contexto
O Prisma não conseguia conectar ao PostgreSQL quando executado
dentro do container Docker, causando timeout após 10 segundos.
Isso bloqueava todos os testes de integração e o start do servidor.

## Implementação
- Ajustado DATABASE_URL em .env para usar nome do serviço Docker
- Alterado de localhost:5432 para postgres:5432
- Adicionado depends_on no docker-compose.yml para garantir ordem
- Adicionado healthcheck no serviço PostgreSQL

## Erros Encontrados Durante Implementação
- Erro 1: PrismaClientInitializationError - Connection timeout
  Causa: DATABASE_URL apontava para localhost, mas dentro do container
         localhost refere-se ao próprio container, não ao host
  Solução: Trocar localhost pelo nome do serviço 'postgres' definido
           no docker-compose.yml
  Aprendizado: Docker networking usa service names, não localhost

- Erro 2: Container backend iniciava antes do PostgreSQL estar pronto
  Causa: Docker Compose sobe containers em paralelo sem garantir
         que o DB esteja aceitando conexões
  Solução: Adicionado healthcheck no serviço postgres e depends_on
           com condition: service_healthy no backend
  Aprendizado: depends_on simples não espera o serviço estar ready

## Decisões de Design
- Usar variável de ambiente para DATABASE_URL permite fácil switch
  entre ambiente Docker e local
- Healthcheck verifica pg_isready ao invés de apenas container running

## Testes
- Testado manualmente: docker-compose up
- Verificado logs: docker-compose logs postgres
- Conexão bem-sucedida em < 2 segundos
- Testes de integração passando: npm run test

## Arquivos Modificados
- docker-compose.yml - Adicionado healthcheck e depends_on
- .env.example - Documentado uso de 'postgres' ao invés de 'localhost'
- README.md - Atualizada seção de setup Docker

## Próximos Passos / TODOs
Nenhuma pendência nesta task.

PROXIMA TASK (TASKS.md):
[T-007]: Configurar Prisma
Checklist da próxima task:
- [ ] Instalar Prisma e inicializar
- [ ] Criar schema base
- [ ] Configurar conexão com PostgreSQL
- [ ] Criar PrismaService

## Referências
- Docker Compose healthcheck: https://docs.docker.com/compose/compose-file/05-services/#healthcheck
- Prisma connection troubleshooting: https://www.prisma.io/docs/guides/database/troubleshooting-orm

## Observações Adicionais
Este erro é comum em ambientes Docker e pode reaparecer se alguém
tentar usar localhost na DATABASE_URL. Considerar adicionar validação
no startup do backend para detectar esse erro comum.

🤖 Generated with Claude Code (https://claude.com/claude-code)
Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Tags Anotadas para Marcos

Ao finalizar cada fase do projeto, criar tag anotada:

```bash
git tag -a v0.1-fase0-complete -m "
Fase 0 Completa: Setup do Projeto

## O que foi feito
- Setup do monorepo com apps/api, apps/mobile, packages
- NestJS com Clean Architecture
- Expo com React Native
- Docker Compose com PostgreSQL
- Prisma configurado
- ESLint + Prettier + Husky
- GitHub Actions CI/CD

## Problemas Encontrados e Resolvidos
1. Prisma timeout em Docker
   - Solução: Usar nome do serviço 'postgres' ao invés de localhost

## Cobertura de Testes
- Backend: Setup completo, Jest configurado
- Frontend: Setup completo, Jest + RNTL configurados

## Próxima Fase
Fase 1: Domain Layer com TDD rigoroso

## Commits Inclusos
- abc1234 - chore(task-0.1): setup monorepo structure
- def5678 - feat(task-0.2): setup backend with NestJS
- ghi9012 - feat(task-0.3): setup frontend with Expo
- ...
"
```

**Criar tag:**

```bash
git tag -a v0.1-fase0-complete
```

**Listar tags com mensagens:**

```bash
git tag -n99
```

**Ver detalhes de uma tag:**

```bash
git show v0.1-fase0-complete
```

---

## Comandos Úteis

### Ver histórico detalhado

```bash
# Ver todos os commits com mensagens completas
git log --format=fuller

# Ver commits com diff
git log -p

# Ver apenas commits de um tipo
git log --grep="^feat:"

# Ver commits que modificaram arquivo específico
git log --follow -- src/domain/entities/user.entity.ts
```

### Buscar no histórico

```bash
# Buscar erro específico nas mensagens de commit
git log --all --grep="timeout"

# Buscar no conteúdo dos commits
git log -S "PrismaClient" --source --all
```

### Extrair contexto para IA

```bash
# Últimos 10 commits com contexto completo
git log -10 --format=fuller

# Histórico de uma task específica
git log --grep="task-1.1" --format=fuller

# Ver todas as decisões de design
git log --all --grep="## Decisões de Design" --format=fuller
```

---

## Checklist Antes de Commitar

- [ ] Código testado e funcionando
- [ ] TDD seguido (RED → GREEN → REFACTOR)
- [ ] Testes passando
- [ ] Cobertura >= 80%
- [ ] Linter sem erros
- [ ] Mensagem de commit usa o template
- [ ] Seção "TDD Cycle" preenchida
- [ ] Seção "Erros Encontrados" preenchida (ou "Nenhum erro")
- [ ] Seção "Testes" preenchida com cobertura
- [ ] Todas as seções obrigatórias estão completas
- [ ] Checklist da próxima task incluída

---

## Instrução para Claude Code

### Prompt Completo

Ao pedir para o Claude Code fazer commit, use:

```
Crie um commit para esta implementação seguindo as especificações em docs/git-docs/git-workflow.md.

OBRIGATÓRIO incluir no título:
- Tipo e número da task: feat(task-X.Y): descrição

OBRIGATÓRIO incluir todas as seções:
1. Roadmap Progress (task atual, status, próxima task, fase, progresso)
2. Contexto
3. Implementação
4. TDD Cycle (🔴 RED, 🟢 GREEN, 🔵 REFACTOR)
5. Erros Encontrados (liste todos ou escreva "Nenhum erro encontrado")
6. Decisões de Design
7. Testes (com cobertura alcançada)
8. Arquivos Modificados
9. Proximos Passos / TODOs (incluindo checklist da PROXIMA TASK do TASKS.md)

Se houver informações relevantes, adicione também:
- Referências
- Observações Adicionais

Use formato markdown nas seções.
```

### Template Rápido

```
Commit da task atual com template completo incluindo:
- Roadmap Progress (task X.Y, status, próxima task, progresso da fase)
- Todos os erros encontrados e soluções
- Decisões de design tomadas
- Cobertura de testes alcançada
- Checklist da proxima task do TASKS.md
```

### Exemplos de Solicitação

**Task Completa:**
```
A task 1.2 está completa. Crie um commit com:
- Tipo: feat(task-1.2)
- Status: COMPLETA
- Próxima: Task 1.3
- Incluir todos os erros encontrados
- Cobertura de testes alcançada
- Checklist completa da Task 1.3
```

**Commit Parcial:**
```
Finalizei parte da task 1.1 (User entity criada, faltam alguns testes).
Crie commit com:
- Tipo: feat(task-1.1)
- Status: PARCIAL
- Incluir erros encontrados
- Listar TODOs restantes nesta task
- Próxima task: continuar Task 1.1
```

**Fix Durante Task:**
```
Encontrei e corrigi bug na task 0.6. Crie commit com:
- Tipo: fix(task-0.6)
- Status: EM PROGRESSO
- Detalhar o erro encontrado
- Solução implementada
- Task ainda em progresso
```

### Após o Commit

Após cada commit de task completa, considere:

1. Criar tag se completou uma fase:
   ```bash
   git tag -a v0.X-faseX-complete
   ```
2. Verificar que a mensagem ficou correta:
   ```bash
   git log -1 --format=fuller
   ```

---

## Benefícios dessa Abordagem

1. **Contexto Rico**: Todo o contexto fica no git log
2. **Busca Fácil**: `git log --grep` permite encontrar soluções passadas
3. **IA-Friendly**: Agentes podem ler git log para entender o projeto
4. **Onboarding**: Novos devs (ou IAs) entendem decisões passadas
5. **Debugging**: Quando algo quebra, o contexto está no blame/log
6. **Documentação Viva**: Documentação que evolui com o código
7. **TDD Documentado**: Ciclo de desenvolvimento visível no histórico
