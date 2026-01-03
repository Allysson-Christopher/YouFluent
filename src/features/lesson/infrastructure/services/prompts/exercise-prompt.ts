import { Chunk } from '@/features/transcript/domain/entities/chunk'
import { Difficulty, DifficultyLevel } from '@/features/lesson/domain/value-objects/difficulty'

/**
 * Difficulty-specific guidelines for exercise generation
 */
const DIFFICULTY_GUIDES: Record<DifficultyLevel, string> = {
  easy: `
Focus on:
- Basic vocabulary and common words
- Simple sentence structures
- Clear and straightforward questions
- Shorter sentences for listening exercises
- Common everyday expressions`,
  medium: `
Focus on:
- Some challenging vocabulary and phrasal verbs
- Varied sentence structures including compound sentences
- Questions that require some inference
- Natural speech patterns and idioms
- Mix of formal and informal language`,
  hard: `
Focus on:
- Advanced vocabulary and academic terms
- Complex sentence structures with subordinate clauses
- Questions requiring deep comprehension
- Idiomatic expressions and cultural references
- Nuanced meanings and subtle distinctions`,
}

/**
 * Build the exercise generation prompt
 *
 * @param chunks - Transcript chunks to base exercises on
 * @param difficulty - Target difficulty level
 * @returns Formatted prompt string for exercise generation
 */
export function buildExercisePrompt(chunks: readonly Chunk[], difficulty: Difficulty): string {
  const chunksText = chunks
    .map((chunk, idx) => `[Chunk ${idx}] (${formatTime(chunk.startTime)} - ${formatTime(chunk.endTime)})\n${chunk.text}`)
    .join('\n\n')

  return `
## EXERCISE GENERATION INSTRUCTIONS

You are creating English learning exercises from a video transcript.

### DIFFICULTY LEVEL: ${difficulty.value.toUpperCase()}
${DIFFICULTY_GUIDES[difficulty.value]}

### TRANSCRIPT CHUNKS:
${chunksText}

### REQUIREMENTS:

1. **Create 5-8 exercises** with a mix of types:
   - fill-blank: Complete the sentence with the missing word
   - multiple-choice: Select the correct answer from 4 options
   - translation: Translate the phrase/sentence
   - listening: Answer based on what was said

2. **For each exercise:**
   - question: Clear, specific question (minimum 10 characters)
   - answer: The correct answer (exactly as it should appear)
   - options: For multiple-choice only, provide 4 options including the correct answer (null for other types)
   - explanation: Brief explanation of why the answer is correct
   - chunkIndex: Index of the chunk (0-based) the exercise relates to

3. **Quality guidelines:**
   - Use ACTUAL content from the transcript
   - Vary the chunk indices (don't focus on just one chunk)
   - Make questions progressively harder within the difficulty level
   - Ensure multiple-choice distractors are plausible but clearly wrong
   - Fill-blank should test vocabulary understanding

4. **Format reminders:**
   - For fill-blank: Use "___" to indicate the blank in the question
   - For multiple-choice: The answer MUST be one of the options exactly
   - For translation: Include the original language phrase in the question
   - For listening: Reference specific parts of what was said
`.trim()
}

/**
 * Format time in seconds to MM:SS format
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
