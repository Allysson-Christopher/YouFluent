/**
 * Transcript Domain Layer Exports
 *
 * This is the public API of the transcript domain.
 * Only export what is needed by other layers.
 */

// Entities
export { Transcript } from './entities/transcript'
export type { TranscriptProps } from './entities/transcript'
export { Chunk } from './entities/chunk'
export type { ChunkProps } from './entities/chunk'

// Value Objects
export { VideoId } from './value-objects/video-id'

// Interfaces (Ports)
export type { TranscriptRepository } from './interfaces/transcript-repository'
export type {
  TranscriptFetcher,
  RawTranscript,
  RawTranscriptSegment,
} from './interfaces/transcript-fetcher'

// Errors
export {
  InvalidVideoUrlError,
  InvalidVideoIdError,
  ChunkValidationError,
  TranscriptValidationError,
  TranscriptFetchError,
} from './errors/transcript-errors'
export type { TranscriptError } from './errors/transcript-errors'
