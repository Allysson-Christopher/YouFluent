/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExercisePanel } from '@/features/lesson/presentation/components/exercise-panel'
import { useLessonStore } from '@/features/lesson/presentation/stores/lesson-store'

// Mock the store
vi.mock('@/features/lesson/presentation/stores/lesson-store')

/**
 * Mock exercise data for testing
 */
const mockFillBlankExercise = {
  id: 'ex-1',
  type: { value: 'fill-blank' as const },
  question: 'What is the capital of France?',
  answer: 'Paris',
  options: null,
  explanation: 'Paris is the capital city of France.',
  chunkIndex: 0,
}

const mockMultipleChoiceExercise = {
  id: 'ex-2',
  type: { value: 'multiple-choice' as const },
  question: 'Select the correct answer',
  answer: 'Option B',
  options: ['Option A', 'Option B', 'Option C'],
  explanation: 'Option B is correct because...',
  chunkIndex: 1,
}

const mockLesson = {
  id: 'lesson-1',
  exerciseCount: 2,
}

/**
 * Helper to create mock store implementation
 */
function createMockStore(config: {
  lesson: typeof mockLesson | null
  currentExerciseIndex: number
  getCurrentExercise: () => typeof mockFillBlankExercise | typeof mockMultipleChoiceExercise | null
  submitAnswer: ReturnType<typeof vi.fn>
  nextExercise: ReturnType<typeof vi.fn>
  previousExercise: ReturnType<typeof vi.fn>
  isAnswerCorrect: (id: string) => boolean | null
  answers: Map<string, string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (selector: (state: any) => any) => {
    const state = {
      lesson: config.lesson,
      currentExerciseIndex: config.currentExerciseIndex,
      getCurrentExercise: config.getCurrentExercise,
      submitAnswer: config.submitAnswer,
      nextExercise: config.nextExercise,
      previousExercise: config.previousExercise,
      isAnswerCorrect: config.isAnswerCorrect,
      answers: config.answers,
    }
    return selector(state)
  }
}

describe('ExercisePanel', () => {
  const mockSubmitAnswer = vi.fn()
  const mockNextExercise = vi.fn()
  const mockPreviousExercise = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows empty state when no exercise', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => null,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => null,
        answers: new Map(),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('exercise-panel-empty')).toBeInTheDocument()
    expect(screen.getByText('No exercise available')).toBeInTheDocument()
  })

  it('displays question', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => null,
        answers: new Map(),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('exercise-question')).toHaveTextContent(
      'What is the capital of France?'
    )
  })

  it('displays exercise header with index', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => null,
        answers: new Map(),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('exercise-header')).toHaveTextContent('Exercise 1 of 2')
  })

  it('renders input for fill-blank type', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => null,
        answers: new Map(),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('answer-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('renders options for multiple-choice type', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 1,
        getCurrentExercise: () => mockMultipleChoiceExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => null,
        answers: new Map(),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('exercise-options')).toBeInTheDocument()
    expect(screen.getByTestId('option-0')).toHaveTextContent('Option A')
    expect(screen.getByTestId('option-1')).toHaveTextContent('Option B')
    expect(screen.getByTestId('option-2')).toHaveTextContent('Option C')
  })

  it('calls submitAnswer on submit button click for fill-blank', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => null,
        answers: new Map(),
      })
    )

    render(<ExercisePanel />)

    const input = screen.getByTestId('answer-input')
    fireEvent.change(input, { target: { value: 'Paris' } })
    fireEvent.click(screen.getByTestId('submit-button'))

    expect(mockSubmitAnswer).toHaveBeenCalledWith('ex-1', 'Paris')
  })

  it('calls submitAnswer on option click for multiple-choice', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 1,
        getCurrentExercise: () => mockMultipleChoiceExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => null,
        answers: new Map(),
      })
    )

    render(<ExercisePanel />)

    fireEvent.click(screen.getByTestId('option-1'))

    expect(mockSubmitAnswer).toHaveBeenCalledWith('ex-2', 'Option B')
  })

  it('shows correct feedback after correct answer', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => true,
        answers: new Map([['ex-1', 'Paris']]),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('exercise-feedback')).toHaveTextContent('Correct!')
    expect(screen.getByTestId('exercise-feedback')).toHaveClass('bg-green-100')
  })

  it('shows incorrect feedback after wrong answer', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => false,
        answers: new Map([['ex-1', 'London']]),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('exercise-feedback')).toHaveTextContent('Incorrect')
    expect(screen.getByTestId('exercise-feedback')).toHaveTextContent('The answer is: Paris')
    expect(screen.getByTestId('exercise-feedback')).toHaveClass('bg-red-100')
  })

  it('shows explanation after answering', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => true,
        answers: new Map([['ex-1', 'Paris']]),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('exercise-explanation')).toHaveTextContent(
      'Paris is the capital city of France.'
    )
  })

  it('disables input after answering', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => true,
        answers: new Map([['ex-1', 'Paris']]),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('answer-input')).toBeDisabled()
    expect(screen.getByTestId('submit-button')).toBeDisabled()
  })

  it('disables options after answering', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 1,
        getCurrentExercise: () => mockMultipleChoiceExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => true,
        answers: new Map([['ex-2', 'Option B']]),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('option-0')).toBeDisabled()
    expect(screen.getByTestId('option-1')).toBeDisabled()
    expect(screen.getByTestId('option-2')).toBeDisabled()
  })

  it('enables next button after answering', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => true,
        answers: new Map([['ex-1', 'Paris']]),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('next-button')).not.toBeDisabled()
  })

  it('disables next button before answering', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => null,
        answers: new Map(),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('next-button')).toBeDisabled()
  })

  it('calls nextExercise on next click', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => true,
        answers: new Map([['ex-1', 'Paris']]),
      })
    )

    render(<ExercisePanel />)

    fireEvent.click(screen.getByTestId('next-button'))

    expect(mockNextExercise).toHaveBeenCalled()
  })

  it('calls previousExercise on prev click', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 1,
        getCurrentExercise: () => mockMultipleChoiceExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => null,
        answers: new Map(),
      })
    )

    render(<ExercisePanel />)

    fireEvent.click(screen.getByTestId('prev-button'))

    expect(mockPreviousExercise).toHaveBeenCalled()
  })

  it('disables prev on first exercise', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => null,
        answers: new Map(),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('prev-button')).toBeDisabled()
  })

  it('shows Finish on last exercise', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 1,
        getCurrentExercise: () => mockMultipleChoiceExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => true,
        answers: new Map([['ex-2', 'Option B']]),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('next-button')).toHaveTextContent('Finish')
  })

  it('shows Next on non-last exercise', () => {
    vi.mocked(useLessonStore).mockImplementation(
      createMockStore({
        lesson: mockLesson,
        currentExerciseIndex: 0,
        getCurrentExercise: () => mockFillBlankExercise,
        submitAnswer: mockSubmitAnswer,
        nextExercise: mockNextExercise,
        previousExercise: mockPreviousExercise,
        isAnswerCorrect: () => true,
        answers: new Map([['ex-1', 'Paris']]),
      })
    )

    render(<ExercisePanel />)

    expect(screen.getByTestId('next-button')).toHaveTextContent('Next')
  })
})
