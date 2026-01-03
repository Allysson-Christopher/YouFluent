# Feature: Player YouTube

**ID:** F01
**Prioridade:** MUST HAVE (MVP)
**Dominio:** `player`

---

## Descricao

Player de video integrado com YouTube que exibe video e transcricao sincronizada lado a lado. Permite navegacao por chunks (segmentos) do video.

## User Stories

### US-001: Visualizar Video com Transcricao

**Story:**
> Como usuario,
> Eu quero ver o video do YouTube com a transcricao ao lado,
> Para que eu possa acompanhar o que esta sendo dito.

**Acceptance Criteria:**
- [ ] Video do YouTube e exibido em player embedded
- [ ] Transcricao aparece ao lado do video
- [ ] Transcricao destaca a linha atual conforme video avanca
- [ ] Clicar em uma linha da transcricao move o video para aquele ponto

**Cenario Principal:**
```gherkin
Dado que o usuario esta na pagina de licao
Quando o video esta tocando
Entao a linha atual da transcricao e destacada
E a transcricao rola automaticamente para manter a linha visivel
```

### US-002: Navegar por Chunks

**Story:**
> Como usuario,
> Eu quero navegar entre segmentos do video,
> Para que eu possa focar em partes especificas.

**Acceptance Criteria:**
- [ ] Video e dividido em chunks de ~30 segundos
- [ ] Cada chunk e clicavel
- [ ] Clicar em chunk posiciona o video no inicio daquele segmento
- [ ] Chunk atual e destacado visualmente

### US-003: Controlar Velocidade

**Story:**
> Como usuario,
> Eu quero ajustar a velocidade do video,
> Para que eu possa ouvir mais devagar trechos dificeis.

**Acceptance Criteria:**
- [ ] Opcoes de velocidade: 0.5x, 0.75x, 1x, 1.25x, 1.5x
- [ ] Velocidade selecionada persiste durante a sessao

## Especificacoes Tecnicas

### Componentes

| Componente | Camada | Responsabilidade |
|------------|--------|------------------|
| `VideoPlayer` | presentation | Wrapper do YouTube IFrame API |
| `ChunkNavigator` | presentation | Lista de chunks clicaveis |
| `usePlayer` | presentation/hooks | Estado do player (tempo, velocidade) |
| `VideoChunk` | domain/entities | Entidade representando um segmento |

### Dependencias Externas

| Dependencia | Uso |
|-------------|-----|
| YouTube IFrame API | Embed e controle do video |

### Modelo de Dados

```typescript
interface VideoChunk {
  id: string
  startTime: number  // segundos
  endTime: number    // segundos
  text: string       // texto da transcricao
}

interface PlayerState {
  isPlaying: boolean
  currentTime: number
  playbackRate: number
  currentChunkId: string | null
}
```

## Fora de Escopo (MVP)

- Download de video
- Modo offline
- Picture-in-picture
- Legendas em outros idiomas

## Tags de Contexto

```
ARQUITETURA: dominios/player
```

---

*Feature definida para o Context Engineering Framework*
