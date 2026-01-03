# Feature: Licoes com IA

**ID:** F03
**Prioridade:** MUST HAVE (MVP)
**Dominio:** `lesson`

---

## Descricao

Sistema de geracao de licoes interativas usando IA (OpenAI). A partir de um chunk de transcricao, gera vocabulario, definicoes e exercicios contextualizados.

## User Stories

### US-007: Gerar Licao para Chunk

**Story:**
> Como usuario,
> Eu quero gerar uma licao a partir de um trecho do video,
> Para que eu possa aprender o vocabulario e expressoes daquele trecho.

**Acceptance Criteria:**
- [ ] Botao "Gerar Licao" disponivel em cada chunk
- [ ] Ao clicar, envia chunk para geracao com IA
- [ ] Exibe loading durante geracao (~5-10s)
- [ ] Retorna licao com vocabulario e exercicios

**Cenario Principal:**
```gherkin
Dado que o usuario esta visualizando um chunk
Quando clica em "Gerar Licao"
Entao o sistema envia o texto do chunk para a IA
E exibe a licao gerada com vocabulario e exercicios
```

### US-008: Visualizar Vocabulario

**Story:**
> Como usuario,
> Eu quero ver as palavras-chave do trecho com definicoes,
> Para que eu possa expandir meu vocabulario.

**Acceptance Criteria:**
- [ ] Lista de 5-10 palavras/expressoes relevantes
- [ ] Cada palavra tem: termo, definicao, exemplo de uso
- [ ] Exemplos usam contexto do video quando possivel

### US-009: Fazer Exercicios

**Story:**
> Como usuario,
> Eu quero praticar com exercicios baseados no trecho,
> Para que eu possa fixar o aprendizado.

**Acceptance Criteria:**
- [ ] 3-5 exercicios por licao
- [ ] Tipos: multipla escolha, preencher lacuna, ordenar palavras
- [ ] Feedback imediato (certo/errado)
- [ ] Explicacao da resposta correta

## Especificacoes Tecnicas

### Componentes

| Componente | Camada | Responsabilidade |
|------------|--------|------------------|
| `Lesson` | domain/entities | Entidade licao completa |
| `Exercise` | domain/entities | Entidade exercicio |
| `Vocabulary` | domain/entities | Entidade item de vocabulario |
| `LessonRepository` | domain/interfaces | Interface de persistencia |
| `GenerateLessonUseCase` | application | Orquestrar geracao de licao |
| `OpenAILessonGenerator` | infrastructure | Implementacao com OpenAI |
| `PrismaLessonRepository` | infrastructure | Implementacao com Prisma |
| `LessonCard` | presentation | Exibir licao |
| `ExercisePanel` | presentation | Exibir e validar exercicios |
| `VocabularyList` | presentation | Exibir lista de vocabulario |

### Dependencias Externas

| Dependencia | Uso |
|-------------|-----|
| OpenAI SDK | Geracao de conteudo com GPT |

### Modelo de Dados

```typescript
// Domain Entities
interface Lesson {
  id: string
  chunkId: string
  vocabulary: VocabularyItem[]
  exercises: Exercise[]
  createdAt: Date
}

interface VocabularyItem {
  term: string
  definition: string
  example: string
  partOfSpeech: string
}

interface Exercise {
  id: string
  type: 'multiple_choice' | 'fill_blank' | 'order_words'
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
}
```

### Prompt da IA (Exemplo)

```
You are an English teacher creating a lesson from a video transcript.

Given this transcript excerpt:
"{chunk.text}"

Generate:
1. 5-8 key vocabulary words with definitions and example sentences
2. 3-5 exercises (mix of multiple choice, fill in the blank, word ordering)

Focus on:
- Words that might be challenging for intermediate learners
- Idiomatic expressions and phrasal verbs
- Context-specific vocabulary

Return as JSON with this structure:
{
  "vocabulary": [...],
  "exercises": [...]
}
```

### Custo Estimado

| Operacao | Tokens (aprox) | Custo (GPT-4) |
|----------|----------------|---------------|
| Input (chunk + prompt) | ~500 | ~$0.01 |
| Output (licao) | ~1000 | ~$0.03 |
| **Total por licao** | ~1500 | **~$0.04** |

## Fora de Escopo (MVP)

- Salvar licoes geradas
- Historico de licoes
- Spaced repetition
- Audio de pronuncia
- Diferentes niveis de dificuldade

## Tags de Contexto

```
ARQUITETURA: dominios/lesson, decisoes/adr-003-openai
```

---

*Feature definida para o Context Engineering Framework*
