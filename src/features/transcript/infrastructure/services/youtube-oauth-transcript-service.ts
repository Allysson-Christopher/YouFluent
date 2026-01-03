import { google, youtube_v3 } from 'googleapis'
import {
  TranscriptFetcher,
  RawTranscript,
  RawTranscriptSegment,
} from '../../domain/interfaces/transcript-fetcher'
import { VideoId } from '../../domain/value-objects/video-id'
import { Result } from '@/shared/core/result'
import { TranscriptFetchError } from '../../domain/errors/transcript-errors'

/**
 * YouTube Transcript Service using OAuth 2.0
 *
 * This service uses the authenticated user's credentials to fetch captions
 * from YouTube videos. It requires a valid OAuth access token.
 */
export class YouTubeOAuthTranscriptService implements TranscriptFetcher {
  private youtube: youtube_v3.Youtube

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })

    this.youtube = google.youtube({
      version: 'v3',
      auth,
    })
  }

  async fetch(videoId: VideoId): Promise<Result<RawTranscript, TranscriptFetchError>> {
    try {
      // 1. Get video info for title
      const videoResponse = await this.youtube.videos.list({
        part: ['snippet'],
        id: [videoId.value],
      })

      const videoInfo = videoResponse.data.items?.[0]
      const title = videoInfo?.snippet?.title || 'Unknown Title'

      // 2. List available captions
      const captionsResponse = await this.youtube.captions.list({
        part: ['snippet'],
        videoId: videoId.value,
      })

      const captionTracks = captionsResponse.data.items
      if (!captionTracks || captionTracks.length === 0) {
        return Result.fail(
          new TranscriptFetchError(videoId.value, 'No captions available for this video')
        )
      }

      // 3. Find English caption (prefer manual over auto-generated)
      const englishCaption =
        captionTracks.find(
          (c) => c.snippet?.language === 'en' && c.snippet?.trackKind === 'standard'
        ) ||
        captionTracks.find((c) => c.snippet?.language === 'en') ||
        captionTracks[0]

      if (!englishCaption?.id) {
        return Result.fail(new TranscriptFetchError(videoId.value, 'No valid caption track found'))
      }

      const language = englishCaption.snippet?.language || 'en'

      // 4. Download caption content
      const downloadResponse = await this.youtube.captions.download({
        id: englishCaption.id,
        tfmt: 'srt', // SubRip format
      })

      const srtContent = downloadResponse.data as string
      if (!srtContent) {
        return Result.fail(new TranscriptFetchError(videoId.value, 'Empty caption content'))
      }

      // 5. Parse SRT to segments
      const segments = this.parseSrt(srtContent)

      return Result.ok({
        videoId: videoId.value,
        title,
        language,
        segments,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      return Result.fail(new TranscriptFetchError(videoId.value, errorMessage))
    }
  }

  /**
   * Parse SRT format to RawTranscriptSegment[]
   *
   * SRT format example:
   * 1
   * 00:00:00,000 --> 00:00:02,500
   * Hello world
   *
   * 2
   * 00:00:02,500 --> 00:00:05,000
   * This is a test
   */
  private parseSrt(srtContent: string): RawTranscriptSegment[] {
    const segments: RawTranscriptSegment[] = []
    const blocks = srtContent.trim().split(/\n\n+/)

    for (const block of blocks) {
      const lines = block.split('\n')
      if (lines.length < 3) continue

      // Line 0: sequence number (ignored)
      // Line 1: timestamps
      // Line 2+: text

      const timestampLine = lines[1]
      const timestampMatch = timestampLine.match(
        /(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/
      )

      if (!timestampMatch) continue

      const startMs =
        parseInt(timestampMatch[1]) * 3600000 +
        parseInt(timestampMatch[2]) * 60000 +
        parseInt(timestampMatch[3]) * 1000 +
        parseInt(timestampMatch[4])

      const endMs =
        parseInt(timestampMatch[5]) * 3600000 +
        parseInt(timestampMatch[6]) * 60000 +
        parseInt(timestampMatch[7]) * 1000 +
        parseInt(timestampMatch[8])

      const text = lines
        .slice(2)
        .join(' ')
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .trim()

      if (text) {
        segments.push({
          text,
          start: startMs / 1000, // Convert to seconds
          duration: (endMs - startMs) / 1000,
        })
      }
    }

    return segments
  }
}
