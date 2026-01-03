import { http, HttpResponse } from 'msw'

export const openaiHandlers = [
  // Mock OpenAI Chat Completions API
  http.post('https://api.openai.com/v1/chat/completions', async ({ request }) => {
    const body = (await request.json()) as { messages?: Array<{ content: string }> }
    const messages = body.messages || []
    const lastMessage = messages[messages.length - 1]?.content || ''

    // Generate mock response based on the request
    const mockContent = lastMessage.includes('vocabulary')
      ? JSON.stringify({
          words: [
            { word: 'test', translation: 'teste', example: 'This is a test.' },
            { word: 'video', translation: 'video', example: 'Watch the video.' },
          ],
        })
      : 'Generated lesson content for testing purposes. This is a mock response from OpenAI.'

    return HttpResponse.json({
      id: 'chatcmpl-test-' + Date.now(),
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'gpt-4',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: mockContent,
          },
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 50,
        total_tokens: 150,
      },
    })
  }),

  // Mock OpenAI Models API (for health check)
  http.get('https://api.openai.com/v1/models', () => {
    return HttpResponse.json({
      object: 'list',
      data: [
        { id: 'gpt-4', object: 'model', owned_by: 'openai' },
        { id: 'gpt-3.5-turbo', object: 'model', owned_by: 'openai' },
      ],
    })
  }),
]
