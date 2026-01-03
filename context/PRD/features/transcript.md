# Feature: Transcricoes

**ID:** F02
**Prioridade:** MUST HAVE (MVP)
**Dominio:** `transcript`

---

## Descricao

Sistema de busca, cache e processamento de transcricoes de videos do YouTube. Divide a transcricao em chunks navegaveis e persiste no banco para acesso rapido.

## User Stories

### US-004: Buscar Transcricao

**Story:**
> Como usuario,
> Eu quero colar uma URL do YouTube e obter a transcricao,
> Para que eu possa estudar o conteudo do video.

**Acceptance Criteria:**
- [ ] Campo para colar URL do YouTube
- [ ] Validacao de URL (aceita youtube.com e youtu.be)
- [ ] Extrai video ID da URL
- [ ] Busca transcricao automaticamente
- [ ] Exibe loading enquanto busca
- [ ] Mostra erro amigavel se video nao tiver transcricao

**Cenario Principal:**
```gherkin
Dado que o usuario esta na pagina inicial
Quando cola uma URL valida do YouTube
E clica em "Processar"
Entao o sistema busca a transcricao
E redireciona para a pagina de licao com o video
```

**Edge Cases:**
- Video sem transcricao: Exibir mensagem "Este video nao possui legendas disponiveis"
- Video privado: Exibir mensagem "Video indisponivel"
- URL invalida: Exibir mensagem "URL invalida"

### US-005: Cache de Transcricao

**Story:**
> Como sistema,
> Eu quero salvar transcricoes no banco de dados,
> Para que proximas buscas do mesmo video sejam instantaneas.

**Acceptance Criteria:**
- [ ] Primeira busca salva transcricao no PostgreSQL
- [ ] Proximas buscas retornam do cache (sem chamar YouTube)
- [ ] Cache armazena: videoId, titulo, transcricao, chunks, data

### US-006: Dividir em Chunks

**Story:**
> Como sistema,
> Eu quero dividir a transcricao em segmentos de ~30 segundos,
> Para que o usuario possa navegar facilmente.

**Acceptance Criteria:**
- [ ] Chunks tem duracao aproximada de 30 segundos
- [ ] Cada chunk contem texto completo daquele periodo
- [ ] Chunks respeitam pausas naturais quando possivel

## Especificacoes Tecnicas

### Componentes

| Componente | Camada | Responsabilidade |
|------------|--------|------------------|
| `Transcript` | domain/entities | Entidade transcricao completa |
| `Chunk` | domain/entities | Entidade segmento de transcricao |
| `TranscriptRepository` | domain/interfaces | Interface de persistencia |
| `FetchTranscriptUseCase` | application | Buscar e processar transcricao |
| `ChunkTranscriptUseCase` | application | Dividir transcricao em chunks |
| `YouTubeTranscriptService` | infrastructure | Implementacao de busca (npm package) |
| `PrismaTranscriptRepository` | infrastructure | Implementacao com Prisma |

### Dependencias Externas

| Dependencia | Uso |
|-------------|-----|
| youtube-transcript | Buscar transcricao do YouTube |

### Modelo de Dados

```typescript
// Domain Entity
interface Transcript {
  id: string
  videoId: string
  title: string
  language: string
  fullText: string
  chunks: Chunk[]
  createdAt: Date
}

interface Chunk {
  id: string
  index: number
  startTime: number
  endTime: number
  text: string
}
```

```prisma
// Prisma Schema
model Transcript {
  id        String   @id @default(cuid())
  videoId   String   @unique
  title     String
  language  String   @default("en")
  fullText  String   @db.Text
  createdAt DateTime @default(now())
  chunks    Chunk[]
}

model Chunk {
  id           String     @id @default(cuid())
  index        Int
  startTime    Float
  endTime      Float
  text         String     @db.Text
  transcriptId String
  transcript   Transcript @relation(fields: [transcriptId], references: [id])
}
```

## Fora de Escopo (MVP)

- Traducao automatica
- Multiplas legendas por video
- Edicao manual de transcricao
- Exportar transcricao

## Tags de Contexto

```
ARQUITETURA: dominios/transcript, decisoes/adr-002-cache
```

---

*Feature definida para o Context Engineering Framework*
