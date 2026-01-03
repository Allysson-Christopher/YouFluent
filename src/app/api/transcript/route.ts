import { NextRequest, NextResponse } from 'next/server'
import { SupadataTranscriptService } from '@/features/transcript/infrastructure/services/supadata-transcript-service'
import { VideoId } from '@/features/transcript/domain/value-objects/video-id'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  if (!url) {
    return NextResponse.json({ error: 'Missing url parameter' }, { status: 400 })
  }

  const videoIdResult = VideoId.fromUrl(url)
  if (!videoIdResult.isSuccess) {
    return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
  }

  try {
    const service = new SupadataTranscriptService()
    const result = await service.fetch(videoIdResult.value)

    if (!result.isSuccess) {
      return NextResponse.json(
        {
          error: result.error._tag,
          message: result.error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      videoId: result.value.videoId,
      title: result.value.title,
      language: result.value.language,
      segments: result.value.segments,
      count: result.value.segments.length,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'ServiceError',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
