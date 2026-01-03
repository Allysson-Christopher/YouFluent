import { setupServer } from 'msw/node'
import { youtubeHandlers } from '../mocks/youtube'
import { openaiHandlers } from '../mocks/openai'

// Create the MSW server with all handlers
export const server = setupServer(...youtubeHandlers, ...openaiHandlers)

// Re-export handlers for individual use in tests
export { youtubeHandlers, openaiHandlers }
