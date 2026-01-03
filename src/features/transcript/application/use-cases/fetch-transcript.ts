import { Result } from '@/shared/core/result'
import {
  Transcript,
  VideoId,
  InvalidVideoUrlError,
  TranscriptFetchError,
  TranscriptValidationError,
  type TranscriptRepository,
  type TranscriptFetcher,
} from '../../domain'
import { ChunkTranscriptUseCase } from './chunk-transcript'

/**
 * FetchTranscriptUseCase Errors
 */
export type FetchTranscriptError =
  | InvalidVideoUrlError
  | TranscriptFetchError
  | TranscriptValidationError

/**
 * FetchTranscriptUseCase
 *
 * Orchestrates transcript fetching with cache-first strategy:
 * 1. Check cache (PostgreSQL)
 * 2. If miss, fetch from YouTube
 * 3. Chunk the transcript
 * 4. Save to cache
 * 5. Return transcript
 *
 * PRE: videoUrl is a string (not necessarily valid)
 * POST: Returns Transcript or specific error
 * ERRORS: InvalidVideoUrlError, TranscriptFetchError, TranscriptValidationError
 */
export class FetchTranscriptUseCase {
  constructor(
    private readonly transcriptRepo: TranscriptRepository,
    private readonly transcriptFetcher: TranscriptFetcher,
    private readonly chunker: ChunkTranscriptUseCase
  ) {}

  /**
   * Execute the use case
   *
   * @param videoUrl - YouTube video URL
   * @returns Result with Transcript or error
   */
  async execute(videoUrl: string): Promise<Result<Transcript, FetchTranscriptError>> {
    // 1. Extract VideoId from URL
    const videoIdResult = VideoId.fromUrl(videoUrl)
    if (videoIdResult.isFailure) {
      return Result.fail(videoIdResult.error)
    }
    const videoId = videoIdResult.value

    // 2. Check cache (PostgreSQL)
    const cached = await this.transcriptRepo.findByVideoId(videoId)
    if (cached) {
      return Result.ok(cached) // Cache HIT
    }

    // 3. Fetch from YouTube (cache MISS)
    const fetchResult = await this.transcriptFetcher.fetch(videoId)
    if (fetchResult.isFailure) {
      return Result.fail(fetchResult.error)
    }
    const rawTranscript = fetchResult.value

    // 4. Chunk the transcript
    const chunks = this.chunker.execute(rawTranscript.segments)

    // 5. Validate: must have at least one chunk
    if (chunks.length === 0) {
      return Result.fail(
        new TranscriptValidationError('chunks', 'Transcript has no content')
      )
    }

    // 6. Create Transcript entity
    const transcriptResult = Transcript.create({
      id: crypto.randomUUID(),
      videoId,
      title: rawTranscript.title || `Video ${videoId.value}`,
      language: rawTranscript.language,
      chunks,
    })

    if (transcriptResult.isFailure) {
      return Result.fail(transcriptResult.error)
    }

    // 7. Save to cache (PostgreSQL)
    await this.transcriptRepo.save(transcriptResult.value)

    return Result.ok(transcriptResult.value)
  }
}
