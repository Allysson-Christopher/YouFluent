/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VocabularyList } from '@/features/lesson/presentation/components/vocabulary-list'
import { useLessonStore } from '@/features/lesson/presentation/stores/lesson-store'
import { usePlayerStore } from '@/features/player/presentation/stores/player-store'

// Mock the stores
vi.mock('@/features/lesson/presentation/stores/lesson-store')
vi.mock('@/features/player/presentation/stores/player-store')

/**
 * Mock vocabulary data for testing
 */
const mockVocabulary = [
  {
    id: 'vocab-1',
    word: 'hello',
    definition: 'A greeting used when meeting someone',
    example: 'Hello, how are you today?',
    partOfSpeech: 'noun',
    chunkIndex: 0,
  },
  {
    id: 'vocab-2',
    word: 'run',
    definition: 'To move quickly on foot',
    example: 'She runs every morning.',
    partOfSpeech: 'verb',
    chunkIndex: 2,
  },
]

const mockLesson = {
  id: 'lesson-1',
  vocabularyCount: 2,
  vocabulary: mockVocabulary,
}

/**
 * Helper to create mock lesson store implementation
 */
function createMockLessonStore(config: { lesson: typeof mockLesson | null }): (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selector: (state: any) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (selector: (state: any) => any) => {
    const state = { lesson: config.lesson }
    return selector(state)
  }
}

/**
 * Helper to create mock player store implementation
 */
function createMockPlayerStore(config: { seekToChunk: ReturnType<typeof vi.fn> }): (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selector: (state: any) => any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
) => any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (selector: (state: any) => any) => {
    const state = { seekToChunk: config.seekToChunk }
    return selector(state)
  }
}

describe('VocabularyList', () => {
  const mockSeekToChunk = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns null when no lesson', () => {
    vi.mocked(useLessonStore).mockImplementation(createMockLessonStore({ lesson: null }))
    vi.mocked(usePlayerStore).mockImplementation(
      createMockPlayerStore({ seekToChunk: mockSeekToChunk })
    )

    const { container } = render(<VocabularyList />)

    expect(container.firstChild).toBeNull()
  })

  it('returns null when vocabulary is empty', () => {
    const emptyLesson = { ...mockLesson, vocabularyCount: 0, vocabulary: [] }

    vi.mocked(useLessonStore).mockImplementation(createMockLessonStore({ lesson: emptyLesson }))
    vi.mocked(usePlayerStore).mockImplementation(
      createMockPlayerStore({ seekToChunk: mockSeekToChunk })
    )

    const { container } = render(<VocabularyList />)

    expect(container.firstChild).toBeNull()
  })

  it('displays vocabulary count in header', () => {
    vi.mocked(useLessonStore).mockImplementation(createMockLessonStore({ lesson: mockLesson }))
    vi.mocked(usePlayerStore).mockImplementation(
      createMockPlayerStore({ seekToChunk: mockSeekToChunk })
    )

    render(<VocabularyList />)

    expect(screen.getByTestId('vocabulary-header')).toHaveTextContent('Vocabulary (2)')
  })

  it('displays word for each item', () => {
    vi.mocked(useLessonStore).mockImplementation(createMockLessonStore({ lesson: mockLesson }))
    vi.mocked(usePlayerStore).mockImplementation(
      createMockPlayerStore({ seekToChunk: mockSeekToChunk })
    )

    render(<VocabularyList />)

    expect(screen.getByTestId('vocab-0-word')).toHaveTextContent('hello')
    expect(screen.getByTestId('vocab-1-word')).toHaveTextContent('run')
  })

  it('displays definition for each item', () => {
    vi.mocked(useLessonStore).mockImplementation(createMockLessonStore({ lesson: mockLesson }))
    vi.mocked(usePlayerStore).mockImplementation(
      createMockPlayerStore({ seekToChunk: mockSeekToChunk })
    )

    render(<VocabularyList />)

    expect(screen.getByTestId('vocab-0-definition')).toHaveTextContent(
      'A greeting used when meeting someone'
    )
    expect(screen.getByTestId('vocab-1-definition')).toHaveTextContent('To move quickly on foot')
  })

  it('displays example for each item', () => {
    vi.mocked(useLessonStore).mockImplementation(createMockLessonStore({ lesson: mockLesson }))
    vi.mocked(usePlayerStore).mockImplementation(
      createMockPlayerStore({ seekToChunk: mockSeekToChunk })
    )

    render(<VocabularyList />)

    expect(screen.getByTestId('vocab-0-example')).toHaveTextContent('"Hello, how are you today?"')
    expect(screen.getByTestId('vocab-1-example')).toHaveTextContent('"She runs every morning."')
  })

  it('displays partOfSpeech for each item', () => {
    vi.mocked(useLessonStore).mockImplementation(createMockLessonStore({ lesson: mockLesson }))
    vi.mocked(usePlayerStore).mockImplementation(
      createMockPlayerStore({ seekToChunk: mockSeekToChunk })
    )

    render(<VocabularyList />)

    expect(screen.getByTestId('vocab-0-pos')).toHaveTextContent('noun')
    expect(screen.getByTestId('vocab-1-pos')).toHaveTextContent('verb')
  })

  it('calls seekToChunk on item click', () => {
    vi.mocked(useLessonStore).mockImplementation(createMockLessonStore({ lesson: mockLesson }))
    vi.mocked(usePlayerStore).mockImplementation(
      createMockPlayerStore({ seekToChunk: mockSeekToChunk })
    )

    render(<VocabularyList />)

    fireEvent.click(screen.getByTestId('vocab-0'))
    expect(mockSeekToChunk).toHaveBeenCalledWith(0)

    fireEvent.click(screen.getByTestId('vocab-1'))
    expect(mockSeekToChunk).toHaveBeenCalledWith(2)
  })
})
