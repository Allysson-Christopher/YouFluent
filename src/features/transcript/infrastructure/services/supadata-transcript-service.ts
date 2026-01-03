import {
  TranscriptFetcher,
  RawTranscript,
  RawTranscriptSegment,
} from '../../domain/interfaces/transcript-fetcher'
import { VideoId } from '../../domain/value-objects/video-id'
import { Result } from '@/shared/core/result'
import { TranscriptFetchError } from '../../domain/errors/transcript-errors'

interface SupadataSegment {
  text: string
  offset: number
  duration: number
  lang: string
}

interface SupadataResponse {
  lang: string
  availableLangs: string[]
  content: SupadataSegment[]
}

/**
 * Supadata Transcript Service
 *
 * Uses the Supadata API to fetch YouTube transcripts.
 * This service works with any public YouTube video.
 *
 * @see https://supadata.ai/youtube-transcript-api
 */
export class SupadataTranscriptService implements TranscriptFetcher {
  private readonly apiKey: string
  private readonly baseUrl = 'https://api.supadata.ai/v1/youtube/transcript'

  constructor(apiKey?: string) {
    this.apiKey = apiKey ?? process.env.SUPADATA_API_KEY ?? ''
    if (!this.apiKey) {
      throw new Error('SUPADATA_API_KEY is required')
    }
  }

  async fetch(videoId: VideoId): Promise<Result<RawTranscript, TranscriptFetchError>> {
    try {
      const url = `${this.baseUrl}?url=https://www.youtube.com/watch?v=${videoId.value}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        return Result.fail(
          new TranscriptFetchError(
            videoId.value,
            `API error ${response.status}: ${errorText}`
          )
        )
      }

      const data: SupadataResponse = await response.json()

      if (!data.content || data.content.length === 0) {
        return Result.fail(
          new TranscriptFetchError(videoId.value, 'No transcript content available')
        )
      }

      // Convert Supadata segments to our format
      const segments: RawTranscriptSegment[] = data.content.map((segment) => ({
        text: segment.text,
        start: segment.offset / 1000, // Convert ms to seconds
        duration: segment.duration / 1000, // Convert ms to seconds
      }))

      // Get video title (Supadata doesn't provide it, so we use a placeholder)
      const title = `YouTube Video ${videoId.value}`

      return Result.ok({
        videoId: videoId.value,
        title,
        language: data.lang,
        segments,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return Result.fail(new TranscriptFetchError(videoId.value, errorMessage))
    }
  }
}
