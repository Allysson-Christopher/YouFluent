/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LessonCard } from '@/features/lesson/presentation/components/lesson-card'
import { useLessonStore } from '@/features/lesson/presentation/stores/lesson-store'

// Mock the store
vi.mock('@/features/lesson/presentation/stores/lesson-store')

/**
 * Mock lesson type for testing
 */
interface MockLesson {
  id: string
  title: string
  difficulty: { value: 'easy' | 'medium' | 'hard' }
  exerciseCount: number
  vocabularyCount: number
  exercises: never[]
  vocabulary: never[]
}

/**
 * Mock lesson data for testing
 */
const mockLesson: MockLesson = {
  id: 'lesson-1',
  title: 'Test Lesson',
  difficulty: { value: 'medium' },
  exerciseCount: 5,
  vocabularyCount: 3,
  exercises: [],
  vocabulary: [],
}

/**
 * Helper to create mock store implementation
 */
function createMockStore(config: {
  lesson: MockLesson | null
  score: number
  isComplete: boolean
  getProgress: () => number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (selector: (state: any) => any) => {
    const state = {
      lesson: config.lesson,
      score: config.score,
      isComplete: config.isComplete,
      getProgress: config.getProgress,
    }
    return selector(state)
  }
}

describe('LessonCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading when no lesson', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: null,
        score: 0,
        isComplete: false,
        getProgress: () => 0,
      })
    )

    render(<LessonCard />)

    expect(screen.getByTestId('lesson-card-loading')).toBeInTheDocument()
    expect(screen.getByText('Loading lesson...')).toBeInTheDocument()
  })

  it('displays lesson title', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        score: 0,
        isComplete: false,
        getProgress: () => 0,
      })
    )

    render(<LessonCard />)

    expect(screen.getByTestId('lesson-title')).toHaveTextContent('Test Lesson')
  })

  it('displays difficulty badge', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        score: 0,
        isComplete: false,
        getProgress: () => 0,
      })
    )

    render(<LessonCard />)

    const badge = screen.getByTestId('lesson-difficulty')
    expect(badge).toHaveTextContent('medium')
  })

  it('displays easy difficulty with green color', () => {
    const easyLesson = { ...mockLesson, difficulty: { value: 'easy' as const } }

    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: easyLesson,
        score: 0,
        isComplete: false,
        getProgress: () => 0,
      })
    )

    render(<LessonCard />)

    const badge = screen.getByTestId('lesson-difficulty')
    expect(badge).toHaveClass('bg-green-500')
  })

  it('displays medium difficulty with yellow color', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        score: 0,
        isComplete: false,
        getProgress: () => 0,
      })
    )

    render(<LessonCard />)

    const badge = screen.getByTestId('lesson-difficulty')
    expect(badge).toHaveClass('bg-yellow-500')
  })

  it('displays hard difficulty with red color', () => {
    const hardLesson = { ...mockLesson, difficulty: { value: 'hard' as const } }

    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: hardLesson,
        score: 0,
        isComplete: false,
        getProgress: () => 0,
      })
    )

    render(<LessonCard />)

    const badge = screen.getByTestId('lesson-difficulty')
    expect(badge).toHaveClass('bg-red-500')
  })

  it('displays exercise and vocabulary counts', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        score: 0,
        isComplete: false,
        getProgress: () => 0,
      })
    )

    render(<LessonCard />)

    expect(screen.getByTestId('lesson-stats')).toHaveTextContent('5 exercises - 3 vocabulary words')
  })

  it('displays progress bar', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        score: 0,
        isComplete: false,
        getProgress: () => 50,
      })
    )

    render(<LessonCard />)

    expect(screen.getByTestId('lesson-progress-bar')).toBeInTheDocument()
    expect(screen.getByTestId('lesson-progress-text')).toHaveTextContent('50%')
  })

  it('shows completion message when isComplete', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        score: 4,
        isComplete: true,
        getProgress: () => 100,
      })
    )

    render(<LessonCard />)

    expect(screen.getByTestId('lesson-complete')).toBeInTheDocument()
    expect(screen.getByText('Lesson Complete!')).toBeInTheDocument()
    expect(screen.getByTestId('lesson-score')).toHaveTextContent('Score: 4/5')
  })

  it('does not show completion message when not complete', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        score: 0,
        isComplete: false,
        getProgress: () => 50,
      })
    )

    render(<LessonCard />)

    expect(screen.queryByTestId('lesson-complete')).not.toBeInTheDocument()
  })
})
