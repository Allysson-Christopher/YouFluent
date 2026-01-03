import { http, HttpResponse } from 'msw'

/**
 * Mock lesson output matching the lessonOutputSchema
 */
export const mockLessonOutput = {
  title: 'Learning English from Video Content',
  exercises: [
    {
      type: 'fill-blank',
      question: 'Complete the sentence: The video explains how to ___ your skills.',
      answer: 'improve',
      options: null,
      explanation: 'The verb "improve" means to make better or enhance.',
      chunkIndex: 0,
    },
    {
      type: 'multiple-choice',
      question: 'According to the video, what is the main topic discussed?',
      answer: 'Language learning techniques',
      options: [
        'Language learning techniques',
        'Cooking recipes',
        'Sports training',
        'Computer programming',
      ],
      explanation:
        'The video focuses on effective methods for learning a new language.',
      chunkIndex: 0,
    },
    {
      type: 'translation',
      question: 'Translate to your language: "Practice makes perfect"',
      answer: 'Practice makes perfect',
      options: null,
      explanation: 'This common saying emphasizes the importance of regular practice.',
      chunkIndex: 1,
    },
    {
      type: 'listening',
      question: 'What example did the speaker give about daily practice?',
      answer: 'Reading for 15 minutes every day',
      options: null,
      explanation: 'The speaker mentioned this as a practical tip for learners.',
      chunkIndex: 1,
    },
    {
      type: 'fill-blank',
      question: 'Learning a language requires ___ and dedication.',
      answer: 'patience',
      options: null,
      explanation: 'Patience is essential when learning something new.',
      chunkIndex: 2,
    },
  ],
  vocabulary: [
    {
      word: 'improve',
      definition: 'To make something better or to become better at something.',
      example: 'She worked hard to improve her English pronunciation.',
      partOfSpeech: 'verb',
      chunkIndex: 0,
    },
    {
      word: 'technique',
      definition: 'A particular way of doing something, especially one that requires skill.',
      example: 'This breathing technique helps reduce stress.',
      partOfSpeech: 'noun',
      chunkIndex: 0,
    },
    {
      word: 'practice',
      definition: 'The act of doing something regularly to improve a skill.',
      example: 'Daily practice is the key to mastering any instrument.',
      partOfSpeech: 'noun',
      chunkIndex: 1,
    },
    {
      word: 'dedication',
      definition: 'The quality of being committed to a task or purpose.',
      example: 'Her dedication to learning impressed all her teachers.',
      partOfSpeech: 'noun',
      chunkIndex: 2,
    },
    {
      word: 'fluent',
      definition: 'Able to speak or write a language easily and accurately.',
      example: 'After years of study, he became fluent in Japanese.',
      partOfSpeech: 'adjective',
      chunkIndex: 2,
    },
    {
      word: 'gradually',
      definition: 'Slowly over a period of time; in a gradual manner.',
      example: 'Your skills will gradually improve with regular practice.',
      partOfSpeech: 'adverb',
      chunkIndex: 1,
    },
    {
      word: 'get along with',
      definition: 'To have a friendly relationship with someone.',
      example: 'She gets along with all her classmates.',
      partOfSpeech: 'phrase',
      chunkIndex: 0,
    },
    {
      word: 'comprehension',
      definition: 'The ability to understand something.',
      example: 'Reading comprehension is tested in many language exams.',
      partOfSpeech: 'noun',
      chunkIndex: 1,
    },
  ],
}

/**
 * Create a structured output response for OpenAI
 * This matches the format returned when using zodResponseFormat
 */
function createParsedResponse(content: object) {
  return {
    id: 'chatcmpl-test-' + Date.now(),
    object: 'chat.completion',
    created: Math.floor(Date.now() / 1000),
    model: 'gpt-4o-mini',
    choices: [
      {
        index: 0,
        message: {
          role: 'assistant',
          content: JSON.stringify(content),
          refusal: null,
        },
        logprobs: null,
        finish_reason: 'stop',
      },
    ],
    usage: {
      prompt_tokens: 500,
      completion_tokens: 800,
      total_tokens: 1300,
    },
  }
}

export const openaiHandlers = [
  // Mock OpenAI Chat Completions API with structured outputs
  http.post('https://api.openai.com/v1/chat/completions', async () => {
    // Return structured lesson output for lesson generation requests
    return HttpResponse.json(createParsedResponse(mockLessonOutput))
  }),

  // Mock OpenAI Models API (for health check)
  http.get('https://api.openai.com/v1/models', () => {
    return HttpResponse.json({
      object: 'list',
      data: [
        { id: 'gpt-4o-mini', object: 'model', owned_by: 'openai' },
        { id: 'gpt-4o', object: 'model', owned_by: 'openai' },
      ],
    })
  }),
]

/**
 * Handler for rate limit error response
 */
export const rateLimitHandler = http.post(
  'https://api.openai.com/v1/chat/completions',
  () => {
    return HttpResponse.json(
      {
        error: {
          message: 'Rate limit exceeded. Please retry after 60 seconds.',
          type: 'rate_limit_error',
          code: 'rate_limit_exceeded',
        },
      },
      { status: 429 }
    )
  }
)

/**
 * Handler for empty response
 */
export const emptyResponseHandler = http.post(
  'https://api.openai.com/v1/chat/completions',
  () => {
    return HttpResponse.json({
      id: 'chatcmpl-test-empty',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'gpt-4o-mini',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: null,
            refusal: null,
          },
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 0,
        total_tokens: 100,
      },
    })
  }
)

/**
 * Handler for API error response
 */
export const apiErrorHandler = http.post(
  'https://api.openai.com/v1/chat/completions',
  () => {
    return HttpResponse.json(
      {
        error: {
          message: 'The server had an error processing your request.',
          type: 'server_error',
          code: 'internal_error',
        },
      },
      { status: 500 }
    )
  }
)

/**
 * Handler for model refusal
 */
export const refusalHandler = http.post(
  'https://api.openai.com/v1/chat/completions',
  () => {
    return HttpResponse.json({
      id: 'chatcmpl-test-refusal',
      object: 'chat.completion',
      created: Math.floor(Date.now() / 1000),
      model: 'gpt-4o-mini',
      choices: [
        {
          index: 0,
          message: {
            role: 'assistant',
            content: null,
            refusal: 'I cannot generate content for this request.',
          },
          logprobs: null,
          finish_reason: 'stop',
        },
      ],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 10,
        total_tokens: 110,
      },
    })
  }
)
