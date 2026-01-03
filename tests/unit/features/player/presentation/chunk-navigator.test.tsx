/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ChunkNavigator } from '@/features/player/presentation/components/chunk-navigator'
import { usePlayerStore } from '@/features/player/presentation/stores/player-store'

// Mock the store
vi.mock('@/features/player/presentation/stores/player-store')

/**
 * Mock chunk data for testing
 * Note: These are simplified mock objects that implement the required interface
 * for testing purposes. The actual Chunk class has additional methods like
 * containsTime() and duration getter, but those are not used by ChunkNavigator.
 */
const mockChunks = [
  { id: '1', index: 0, startTime: 0, endTime: 30, text: 'First chunk text' },
  { id: '2', index: 1, startTime: 30, endTime: 60, text: 'Second chunk text' },
  { id: '3', index: 2, startTime: 60, endTime: 90, text: 'Third chunk text' },
]

/**
 * Helper to create mock store implementation
 * Uses 'any' to bypass strict store typing in tests
 */
function createMockStore(
  chunks: typeof mockChunks,
  activeChunkIndex: number,
  seekToChunk: ReturnType<typeof vi.fn>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (selector: (state: any) => any) => {
    const state = { chunks, activeChunkIndex, seekToChunk }
    return selector(state)
  }
}

describe('ChunkNavigator', () => {
  const mockSeekToChunk = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders all chunks', () => {
    vi.mocked(usePlayerStore).mockImplementation(
      createMockStore(mockChunks, -1, mockSeekToChunk)
    )

    render(<ChunkNavigator />)

    expect(screen.getByText('First chunk text')).toBeInTheDocument()
    expect(screen.getByText('Second chunk text')).toBeInTheDocument()
    expect(screen.getByText('Third chunk text')).toBeInTheDocument()
  })

  it('displays chunk count in header', () => {
    vi.mocked(usePlayerStore).mockImplementation(
      createMockStore(mockChunks, -1, mockSeekToChunk)
    )

    render(<ChunkNavigator />)

    expect(screen.getByText('Chunks (3)')).toBeInTheDocument()
  })

  it('highlights active chunk with bg-primary', () => {
    vi.mocked(usePlayerStore).mockImplementation(
      createMockStore(mockChunks, 1, mockSeekToChunk)
    )

    render(<ChunkNavigator />)

    const secondChunk = screen.getByTestId('chunk-1')
    expect(secondChunk).toHaveClass('bg-primary')
  })

  it('does not highlight inactive chunks', () => {
    vi.mocked(usePlayerStore).mockImplementation(
      createMockStore(mockChunks, 1, mockSeekToChunk)
    )

    render(<ChunkNavigator />)

    const firstChunk = screen.getByTestId('chunk-0')
    const thirdChunk = screen.getByTestId('chunk-2')

    expect(firstChunk).not.toHaveClass('bg-primary')
    expect(thirdChunk).not.toHaveClass('bg-primary')
  })

  it('calls seekToChunk on click', () => {
    vi.mocked(usePlayerStore).mockImplementation(
      createMockStore(mockChunks, 0, mockSeekToChunk)
    )

    render(<ChunkNavigator />)

    fireEvent.click(screen.getByTestId('chunk-2'))
    expect(mockSeekToChunk).toHaveBeenCalledWith(2)
  })

  it('shows empty state when no chunks', () => {
    vi.mocked(usePlayerStore).mockImplementation(
      createMockStore([], -1, mockSeekToChunk)
    )

    render(<ChunkNavigator />)

    expect(screen.getByText('No chunks available')).toBeInTheDocument()
    expect(screen.getByTestId('chunk-navigator-empty')).toBeInTheDocument()
  })

  it('displays formatted timestamps', () => {
    vi.mocked(usePlayerStore).mockImplementation(
      createMockStore(mockChunks, -1, mockSeekToChunk)
    )

    render(<ChunkNavigator />)

    // First chunk: 0:00 - 0:30
    expect(screen.getByText('0:00 - 0:30')).toBeInTheDocument()
    // Second chunk: 0:30 - 1:00
    expect(screen.getByText('0:30 - 1:00')).toBeInTheDocument()
    // Third chunk: 1:00 - 1:30
    expect(screen.getByText('1:00 - 1:30')).toBeInTheDocument()
  })

  it('displays chunk index/total', () => {
    vi.mocked(usePlayerStore).mockImplementation(
      createMockStore(mockChunks, -1, mockSeekToChunk)
    )

    render(<ChunkNavigator />)

    expect(screen.getByText('1/3')).toBeInTheDocument()
    expect(screen.getByText('2/3')).toBeInTheDocument()
    expect(screen.getByText('3/3')).toBeInTheDocument()
  })
})
