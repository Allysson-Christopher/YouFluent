import { Chunk } from '@/features/transcript/domain/entities/chunk'
import { Difficulty, DifficultyLevel } from '@/features/lesson/domain/value-objects/difficulty'

/**
 * Difficulty-specific guidelines for vocabulary extraction
 */
const DIFFICULTY_GUIDES: Record<DifficultyLevel, string> = {
  easy: `
Extract vocabulary suitable for beginners:
- Common everyday words
- Basic verbs and nouns
- Simple adjectives and adverbs
- High-frequency words
- Avoid technical jargon`,
  medium: `
Extract vocabulary for intermediate learners:
- Phrasal verbs and collocations
- Academic vocabulary
- Less common but useful words
- Idiomatic expressions
- Domain-specific terms when relevant`,
  hard: `
Extract vocabulary for advanced learners:
- Sophisticated vocabulary and synonyms
- Rare or literary words
- Complex phrasal expressions
- Nuanced meanings and connotations
- Academic and professional terminology`,
}

/**
 * Build the vocabulary extraction prompt
 *
 * @param chunks - Transcript chunks to extract vocabulary from
 * @param difficulty - Target difficulty level
 * @returns Formatted prompt string for vocabulary extraction
 */
export function buildVocabularyPrompt(chunks: readonly Chunk[], difficulty: Difficulty): string {
  const fullText = chunks.map((chunk) => chunk.text).join(' ')

  return `
## VOCABULARY EXTRACTION INSTRUCTIONS

You are extracting English vocabulary from a video transcript for language learning.

### DIFFICULTY LEVEL: ${difficulty.value.toUpperCase()}
${DIFFICULTY_GUIDES[difficulty.value]}

### FULL TRANSCRIPT TEXT:
${fullText}

### CHUNK MAPPING:
${chunks.map((chunk, idx) => `[${idx}]: "${chunk.text.slice(0, 50)}..."`).join('\n')}

### REQUIREMENTS:

1. **Extract 8-12 vocabulary items** that appear in the transcript

2. **For each vocabulary item:**
   - word: The exact word or phrase as it appears (or its base form for verbs)
   - definition: Clear, learner-friendly definition (minimum 10 characters)
   - example: A new example sentence using the word (minimum 10 characters, different from transcript)
   - partOfSpeech: One of: noun, verb, adjective, adverb, phrase
   - chunkIndex: Index of the chunk (0-based) where this word appears

3. **Selection criteria:**
   - Choose words that are ACTUALLY in the transcript
   - Prioritize words useful for the learner's level
   - Include a mix of parts of speech
   - Avoid very common words for medium/hard levels (a, the, is, etc.)
   - Include phrasal verbs and expressions when relevant

4. **Quality guidelines:**
   - Definitions should be simple and clear
   - Example sentences should demonstrate typical usage
   - Use "phrase" for multi-word expressions like "get along with"
   - Spread selections across different chunks when possible
`.trim()
}
