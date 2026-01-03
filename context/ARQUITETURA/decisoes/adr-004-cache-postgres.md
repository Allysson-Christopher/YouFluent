# ADR-004: Cache de Transcricoes no PostgreSQL

**Status:** Accepted
**Data:** 2026-01-02
**Contexto:** Estrategia de cache para transcricoes do YouTube

---

## Contexto

Buscar transcricoes do YouTube:
- E lento (1-3 segundos por requisicao)
- Pode falhar (rate limiting, video indisponivel)
- Conteudo e estatico (transcricao nao muda)

Se o mesmo video for acessado novamente, devemos evitar re-buscar.

## Decisao

Cachear transcricoes no **PostgreSQL** apos primeira busca.

## Alternativas Consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| Sem cache | Simples | Lento, desperdicio de recursos |
| Redis | Rapido, TTL facil | +1 servico, custo |
| Cache em memoria | Muito rapido | Perde ao reiniciar |
| **PostgreSQL** | **Ja temos, persistente** | **Menos rapido que Redis** |

## Consequencias

### Positivas

- **Uma dependencia a menos**: Ja usamos PostgreSQL
- **Persistente**: Sobrevive a restarts
- **Consistente**: Mesmo cache em todas as instancias
- **Sem TTL necessario**: Transcricoes nao mudam

### Negativas

- **Mais lento que Redis**: ~10ms vs ~1ms
- **Mais storage**: Transcricoes podem ser longas

### Mitigacao

- 10ms e aceitavel para nosso caso de uso
- Comprimir fullText se necessario (futuro)
- Indexar por videoId para queries rapidas

## Modelo de Dados

```prisma
model Transcript {
  id        String   @id @default(cuid())
  videoId   String   @unique  // Indice para cache lookup
  title     String
  language  String   @default("en")
  fullText  String   @db.Text
  createdAt DateTime @default(now())
  chunks    Chunk[]

  @@index([videoId])
}

model Chunk {
  id           String     @id @default(cuid())
  index        Int
  startTime    Float
  endTime      Float
  text         String     @db.Text
  transcriptId String
  transcript   Transcript @relation(fields: [transcriptId], references: [id], onDelete: Cascade)

  @@index([transcriptId])
}
```

## Fluxo de Cache

```typescript
// application/use-cases/fetch-transcript.ts
async execute(videoUrl: string): Promise<Transcript> {
  const videoId = VideoId.fromUrl(videoUrl)

  // 1. Verifica cache
  const cached = await this.transcriptRepo.findByVideoId(videoId)
  if (cached) {
    return cached  // Cache HIT
  }

  // 2. Busca do YouTube
  const raw = await this.transcriptFetcher.fetch(videoId)

  // 3. Processa em chunks
  const chunks = this.chunker.chunk(raw.segments)

  // 4. Cria entidade
  const transcript = Transcript.create({
    videoId,
    title: raw.title,
    language: raw.language,
    fullText: raw.segments.map(s => s.text).join(' '),
    chunks
  })

  // 5. Salva no cache
  await this.transcriptRepo.save(transcript)

  return transcript
}
```

## Metricas Esperadas

| Metrica | Cache MISS | Cache HIT |
|---------|------------|-----------|
| Latencia | ~2-3s | ~50ms |
| Custo API | 1 chamada | 0 chamadas |
| DB writes | 1 | 0 |

## Notas

- Nao ha necessidade de invalidacao (conteudo estatico)
- Considerar limpeza de cache antigo (>1 ano) se storage crescer
- Log de hit/miss para monitorar efetividade

---

*ADR criada para o Context Engineering Framework*
