import { http, HttpResponse } from 'msw'

export const youtubeHandlers = [
  // Mock YouTube timedtext API (transcripts)
  http.get('https://www.youtube.com/api/timedtext*', () => {
    return HttpResponse.json({
      events: [
        { tStartMs: 0, dDurationMs: 5000, segs: [{ utf8: 'Hello world' }] },
        { tStartMs: 5000, dDurationMs: 5000, segs: [{ utf8: 'This is a test' }] },
        { tStartMs: 10000, dDurationMs: 5000, segs: [{ utf8: 'Welcome to the video' }] },
      ],
    })
  }),

  // Mock YouTube oEmbed API (video metadata)
  http.get('https://www.youtube.com/oembed', ({ request }) => {
    const url = new URL(request.url)
    const videoUrl = url.searchParams.get('url')

    if (!videoUrl) {
      return HttpResponse.json({ error: 'Missing url parameter' }, { status: 400 })
    }

    return HttpResponse.json({
      title: 'Test Video Title',
      author_name: 'Test Channel',
      author_url: 'https://www.youtube.com/channel/test',
      type: 'video',
      height: 113,
      width: 200,
      version: '1.0',
      provider_name: 'YouTube',
      provider_url: 'https://www.youtube.com/',
      thumbnail_height: 360,
      thumbnail_width: 480,
      thumbnail_url: 'https://i.ytimg.com/vi/test/hqdefault.jpg',
      html: '<iframe src="https://www.youtube.com/embed/test"></iframe>',
    })
  }),
]
