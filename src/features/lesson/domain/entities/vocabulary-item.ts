import { Result } from '@/shared/core/result'
import { VocabularyValidationError } from '../errors/lesson-errors'

/**
 * Valid parts of speech
 */
export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase'

/**
 * Valid parts of speech array for validation
 */
const VALID_PARTS_OF_SPEECH: PartOfSpeech[] = ['noun', 'verb', 'adjective', 'adverb', 'phrase']

/**
 * VocabularyItem creation properties
 */
export interface VocabularyItemProps {
  readonly id: string
  readonly word: string
  readonly definition: string
  readonly example: string
  readonly partOfSpeech: PartOfSpeech
  readonly chunkIndex: number
}

/**
 * VocabularyItem Entity
 *
 * Represents a vocabulary word/phrase from a lesson.
 * Entities have identity and are compared by ID.
 *
 * INVARIANTS:
 * - id is non-empty
 * - word is non-empty (after trimming)
 * - definition is non-empty (after trimming)
 * - partOfSpeech is one of: noun, verb, adjective, adverb, phrase
 * - chunkIndex is non-negative
 */
export class VocabularyItem {
  /**
   * Private constructor enforces factory method usage
   */
  private constructor(
    readonly id: string,
    readonly word: string,
    readonly definition: string,
    readonly example: string,
    readonly partOfSpeech: PartOfSpeech,
    readonly chunkIndex: number
  ) {
    Object.freeze(this)
  }

  /**
   * Create a new VocabularyItem
   *
   * PRE: props contains valid id, word, definition, example, partOfSpeech, chunkIndex
   * POST: Returns Success<VocabularyItem> if all validations pass
   * ERRORS: VocabularyValidationError with field and message
   *
   * @param props - VocabularyItem creation properties
   * @returns Result with VocabularyItem or VocabularyValidationError
   */
  static create(props: VocabularyItemProps): Result<VocabularyItem, VocabularyValidationError> {
    // Validate id
    if (!props.id || typeof props.id !== 'string' || props.id.trim() === '') {
      return Result.fail(new VocabularyValidationError('id', 'ID cannot be empty'))
    }

    // Validate word
    if (!props.word || typeof props.word !== 'string' || props.word.trim() === '') {
      return Result.fail(new VocabularyValidationError('word', 'Word cannot be empty'))
    }

    // Validate definition
    if (!props.definition || typeof props.definition !== 'string' || props.definition.trim() === '') {
      return Result.fail(new VocabularyValidationError('definition', 'Definition cannot be empty'))
    }

    // Validate partOfSpeech
    if (!VALID_PARTS_OF_SPEECH.includes(props.partOfSpeech)) {
      return Result.fail(
        new VocabularyValidationError(
          'partOfSpeech',
          `Invalid part of speech: ${props.partOfSpeech}. Valid values: ${VALID_PARTS_OF_SPEECH.join(', ')}`
        )
      )
    }

    // Validate chunkIndex
    if (props.chunkIndex < 0) {
      return Result.fail(new VocabularyValidationError('chunkIndex', 'Chunk index cannot be negative'))
    }

    return Result.ok(
      new VocabularyItem(
        props.id.trim(),
        props.word.trim(),
        props.definition.trim(),
        props.example?.trim() ?? '',
        props.partOfSpeech,
        props.chunkIndex
      )
    )
  }

  /**
   * Compare two VocabularyItem instances by id
   *
   * @param other - VocabularyItem to compare with
   * @returns true if ids are equal
   */
  equals(other: VocabularyItem): boolean {
    return this.id === other.id
  }
}
