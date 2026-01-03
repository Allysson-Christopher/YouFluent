# Generate PRP (Autonomo)

## Input: $ARGUMENTS

Gera um PRP completo de forma **100% autonoma**.

> **VERSOES:** NAO pesquisar versoes de bibliotecas via WebSearch.
> Usar versoes ja definidas em `context/ARQUITETURA/stack.md`.
> A pesquisa de versoes e responsabilidade EXCLUSIVA do `/gerar-arquitetura`.

> **3 Modos de Operacao:**
> - **AUTO** (sem argumentos): Detecta proxima tarefa via Git + TASKS/
> - **TAREFA** (T-XXX): Usa tarefa especifica
> - **LIVRE** ("descricao"): Descricao textual direta

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
| OpenAI SDK | 6.1.x |
| Vitest | 3.0.5+ |
| Playwright | 1.55.1+ |
| Testcontainers | latest |
| MSW | 2.x |

### Dominios do Projeto
- **lesson** - Licoes geradas por IA
- **player** - Player YouTube
- **transcript** - Transcricoes e cache

### Estrutura de Pastas (Feature-Clean)
```
src/
├── app/                  # Next.js App Router (rotas apenas)
├── features/             # Dominios organizados por feature
│   ├── lesson/
│   │   ├── domain/       # Entities, Value Objects, Interfaces
│   │   ├── application/  # Use Cases
│   │   ├── infrastructure/ # Repositories, Services
│   │   └── presentation/ # Components, Hooks, Stores
│   ├── player/
│   └── transcript/
├── shared/               # Codigo compartilhado
│   ├── components/ui/    # shadcn/ui
│   ├── lib/              # Prisma client, utils
│   └── hooks/
└── prisma/               # Schema e migrations
```

### Estrategia de Testes (TDD)
| Camada | TDD | Cobertura | Ferramentas |
|--------|-----|-----------|-------------|
| Domain | Obrigatorio | 100% | Vitest |
| Application | Recomendado | 80-90% | Vitest + mocks |
| Infrastructure | Parcial | 60-80% | Vitest + Testcontainers + MSW |
| Presentation | Nao | E2E apenas | Playwright |

### Decisoes Arquiteturais (ADRs)
- **ADR-001**: Next.js 16 como framework full-stack
- **ADR-002**: Prisma 7 com Driver Adapters
- **ADR-003**: Zustand para todo gerenciamento de estado
- **ADR-004**: Cache de transcricoes no PostgreSQL
- **ADR-005**: Estrategia de testes com TDD

---

## Modos de Input

### 1. Modo AUTO (sem argumentos)
```bash
/generate-prp
```
Detecta automaticamente a proxima tarefa nao concluida.

### 2. Modo TAREFA (ID especifico)
```bash
/generate-prp T-005
```
Usa a tarefa especificada.

### 3. Modo LIVRE (descricao textual)
```bash
/generate-prp "implementar cache de transcricoes no PostgreSQL"
```
Cria PRP a partir de descricao livre.

### 4. Modo INITIAL.md (retrocompatibilidade)
```bash
/generate-prp PRPs/001-auth/INITIAL.md
```
Usa arquivo INITIAL.md existente.

---

## Processo Completo

### Fase 1: Detectar Input e Tarefa

**Se SEM argumentos (Modo AUTO):**

1. Consultar Git para ultima tarefa concluida:
```bash
git log -1 --grep="^feat(T-\|^fix(T-" --format="%s" 2>/dev/null || echo "NENHUM"
```

2. Ler indice de tarefas:
```bash
cat context/TASKS/_index.md
```

3. Determinar proxima tarefa:
   - Se nenhum commit de tarefa → T-001
   - Se ultima foi T-003 → proxima e T-004
   - Seguir ordem de execucao do _index.md

4. Ler arquivo da tarefa:
```bash
cat context/TASKS/T-XXX.md
```

**Se argumento e T-XXX (Modo TAREFA):**

1. Ler arquivo da tarefa diretamente:
```bash
cat context/TASKS/T-XXX.md
```

**Se argumento e descricao ou INITIAL.md (Modo LIVRE):**

1. Pular para Fase 3 (sem carregamento de contexto modular)

### Fase 2: Carregar Contexto via Tags (Modos AUTO e TAREFA)

**Extrair Tags de Contexto do arquivo T-XXX.md:**

O bloco de tags esta no formato:
```markdown
## Tags de Contexto

```
PRD: features/transcript
ARQUITETURA: dominios/transcript, decisoes/adr-004-cache-postgres
```
```

**Parsear e resolver para arquivos:**

1. Encontrar secao `## Tags de Contexto`
2. Extrair conteudo do bloco de codigo
3. Para cada linha `TIPO: arquivo1, arquivo2`:
   - `PRD: features/transcript` → `context/PRD/features/transcript.md`
   - `ARQUITETURA: dominios/transcript` → `context/ARQUITETURA/dominios/transcript.md`

**Arquivos a carregar (em ordem):**

```
# Sempre incluir indices
context/PRD/_index.md
context/ARQUITETURA/_index.md

# Arquivos especificos das tags
context/PRD/{arquivo}.md
context/ARQUITETURA/{arquivo}.md

# Template do PRP
PRPs/templates/prp_base.md
```

**Fallback se arquivo nao existir:**
1. Tentar arquivo especifico
2. Se nao existir → tentar arquivo legado (context/PRD.md ou context/ARQUITETURA.md)

**Ler todos os arquivos de contexto necessarios antes de prosseguir.**

### Fase 3: Criar Diretorio do PRP

**Nomenclatura:**
- `{numero}` = proximo numero sequencial (verificar PRPs/ existentes)
- `{slug}` = nome em lowercase, palavras separadas por hifen

```bash
# Verificar ultimo numero
ls -d PRPs/[0-9]*/ 2>/dev/null | tail -1

# Criar diretorio
mkdir -p PRPs/{numero}-{slug}/
```

Exemplos (YouFluent):
- `PRPs/001-setup-nextjs-16/`
- `PRPs/002-prisma-postgresql/`
- `PRPs/003-transcript-domain/`
- `PRPs/004-youtube-transcript-service/`
- `PRPs/005-lesson-domain/`

### Fase 4: Pesquisa Profunda

**Analise do Codebase:**
- Identificar padroes existentes relacionados a tarefa
- Encontrar exemplos relevantes em `examples/`
- Detectar stack/linguagem do projeto
- Mapear dependencias e integracoes existentes
- Verificar testes existentes para padroes de validacao

**Pesquisa Externa (se necessario):**
- Buscar documentacao oficial das bibliotecas necessarias
- Encontrar exemplos de implementacao
- Identificar best practices e pitfalls comuns

**Identificacao de Gotchas (YouFluent):**
- Prisma 7 requer Driver Adapters (@prisma/adapter-pg)
- Next.js 16 Server Components por padrao
- Tailwind v4 usa CSS-first config (sem tailwind.config.js)
- Zustand stores ficam em `presentation/stores/`
- TDD obrigatorio para domain (100% cobertura)

### Fase 5: ULTRATHINK + Geracao

**Antes de escrever o PRP:**

```
ULTRATHINK: Planeje profundamente a implementacao:
- Qual a arquitetura ideal (DDD + Clean Architecture)?
- Quais entidades e value objects?
- Qual o fluxo de dados?
- Quais testes escrever primeiro (TDD)?
- Quais os riscos e mitigacoes?
- Qual a ordem de implementacao?
```

**Gerar PRP usando template `PRPs/templates/prp_base.md`:**

O PRP DEVE conter todas as secoes:
1. **Input Summary** - Tarefa original (ID, nome, contexto, objetivo, escopo)
2. **Goal** - O que construir (especifico)
3. **Why** - Valor de negocio
4. **What** - Comportamento e requisitos tecnicos
5. **Documentation & References** - URLs, arquivos de contexto carregados, gotchas
6. **Codebase Trees** - Atual e desejado
7. **Implementation Blueprint** - Tasks ordenadas com pseudocodigo TDD
8. **Validation Loop** - 5 niveis (lint, types, unit, integration, build)
9. **Final Checklist** - Criterios de conclusao (copiar da tarefa)
10. **Anti-Patterns** - O que evitar

### Fase 6: Input Summary (Documentacao)

Adicionar secao no inicio do PRP:

```markdown
---
## Input Summary

**Modo:** AUTO | TAREFA | LIVRE
**Tarefa:** T-XXX - {nome}
**Origem:** context/TASKS/T-XXX.md

**Contexto Carregado:**
- context/PRD/_index.md
- context/PRD/features/{feature}.md
- context/ARQUITETURA/_index.md
- context/ARQUITETURA/dominios/{dominio}.md
- context/ARQUITETURA/decisoes/{adr}.md

**Objetivo:** {objetivo da tarefa}

**Escopo:**
{escopo da tarefa}

**Criterios de Aceite:**
{criterios da tarefa}

---
```

---

## Output

### Estrutura de Arquivos

```
PRPs/{numero}-{slug}/
└── PRP.md          # PRP completo gerado
```

### Informar ao Usuario

Ao finalizar, exibir:

```
PRP GERADO COM SUCESSO
━━━━━━━━━━━━━━━━━━━━━━━━

Modo: {AUTO | TAREFA | LIVRE}
Tarefa: T-XXX - {nome}
Arquivo: PRPs/{numero}-{slug}/PRP.md

Contexto carregado:
- {lista de arquivos}

Nota de confianca: {X}/10

Proximo passo:
/execute-prp PRPs/{numero}-{slug}/PRP.md
```

---

## Validation Gates (YouFluent)

Incluir no PRP os comandos de validacao apropriados:

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

**Cobertura minima:**
- Domain: 100%
- Application: 80%
- Infrastructure: 60%

---

## Quality Checklist

Antes de finalizar, verificar:

- [ ] Modo de input detectado corretamente
- [ ] Tarefa identificada (AUTO/TAREFA) ou descricao extraida (LIVRE)
- [ ] Tags de Contexto parseadas corretamente
- [ ] Arquivos de contexto carregados
- [ ] Diretorio criado com nomenclatura correta
- [ ] Goal claro e especifico
- [ ] Modelo de dominio definido (entidades, VOs, regras)
- [ ] Arquitetura Clean Architecture mapeada
- [ ] Blueprint TDD (teste primeiro para cada componente)
- [ ] Validation gates executaveis (pnpm)
- [ ] Criterios de conclusao objetivos (copiados da tarefa)
- [ ] Decisoes do projeto respeitadas (Zustand, Zod, Server-first)

---

## Nota de Confianca

Ao finalizar, atribuir nota de 1-10:

| Nota | Significado |
|------|-------------|
| 9-10 | Contexto completo, implementacao trivial |
| 7-8 | Bom contexto, algumas decisoes em aberto |
| 5-6 | Contexto parcial, pode precisar iteracao |
| < 5 | Falta contexto critico, revisar antes de executar |

---

## Exemplos de Uso (YouFluent)

### Modo AUTO (mais comum)
```bash
/generate-prp
```
Detecta que ultima tarefa foi T-003, gera PRP para T-004.

### Modo TAREFA
```bash
/generate-prp T-005
```
Gera PRP para tarefa especifica T-005 (YouTubeTranscriptService).

### Modo LIVRE
```bash
/generate-prp "criar entidades de dominio para Transcript com VideoId, Chunk e Transcript"
```
Gera PRP a partir de descricao.

### Modo INITIAL.md (retrocompatibilidade)
```bash
/generate-prp PRPs/001-setup/INITIAL.md
```
Usa arquivo INITIAL.md existente.

---

## Proximo Passo

Apos gerar o PRP, executar:

```bash
/execute-prp PRPs/{numero}-{slug}/PRP.md
```

Ou usar `/next` para fluxo completo automatizado (gera + executa + commit).

---

## Padroes a Seguir no PRP (YouFluent)

### Domain Layer
```typescript
// Entidades com Result pattern
export class Transcript {
  private constructor(
    public readonly id: string,
    public readonly videoId: VideoId,
    public readonly chunks: Chunk[]
  ) {}

  static create(props: CreateTranscriptProps): Result<Transcript, TranscriptError> {
    // validacoes
    return Result.ok(new Transcript(...))
  }
}
```

### Application Layer
```typescript
// Use case com injecao de dependencias
export class FetchTranscriptUseCase {
  constructor(
    private readonly transcriptRepo: TranscriptRepository,
    private readonly transcriptFetcher: TranscriptFetcher
  ) {}

  async execute(videoUrl: string): Promise<Result<Transcript, FetchError>> {
    // 1. Verificar cache
    // 2. Buscar do YouTube se nao cacheado
    // 3. Salvar no cache
    // 4. Retornar
  }
}
```

### Infrastructure Layer
```typescript
// Repository com Prisma
export class PrismaTranscriptRepository implements TranscriptRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByVideoId(videoId: VideoId): Promise<Transcript | null> {
    const data = await this.prisma.transcript.findUnique({
      where: { videoId: videoId.value },
      include: { chunks: true }
    })
    return data ? TranscriptMapper.toDomain(data) : null
  }
}
```

### Presentation Layer
```typescript
// Server Component por padrao
export default async function TranscriptPage({ params }: Props) {
  const transcript = await fetchTranscript(params.videoId)
  return <TranscriptViewer transcript={transcript} />
}

// Client Component apenas quando necessario
'use client'
export function VideoPlayer() {
  const { isPlaying, play, pause } = usePlayerStore()
  // ...
}
```
