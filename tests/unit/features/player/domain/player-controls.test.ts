import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PlayerControls } from '@/features/player/domain/entities/player-controls'
import { PlayerAdapter } from '@/features/player/domain/interfaces/player-adapter'
import { PlaybackState } from '@/features/player/domain/value-objects/playback-state'
import { TimePosition } from '@/features/player/domain/value-objects/time-position'
import {
  PlaybackRate,
  DEFAULT_PLAYBACK_RATE,
} from '@/features/player/domain/value-objects/playback-rate'

/**
 * Mock implementation of PlayerAdapter for testing
 */
function createMockAdapter(overrides: Partial<PlayerAdapter> = {}): PlayerAdapter {
  let currentTime = 0
  const duration = 180
  let state = PlaybackState.paused()
  let playbackRate: PlaybackRate = DEFAULT_PLAYBACK_RATE
  const stateCallbacks: Array<(state: PlaybackState) => void> = []
  const timeCallbacks: Array<(position: TimePosition) => void> = []
  const errorCallbacks: Array<(error: Error) => void> = []

  return {
    play: vi.fn(() => {
      state = PlaybackState.playing()
      stateCallbacks.forEach((cb) => cb(state))
    }),
    pause: vi.fn(() => {
      state = PlaybackState.paused()
      stateCallbacks.forEach((cb) => cb(state))
    }),
    seekTo: vi.fn((seconds: number) => {
      currentTime = seconds
      const position = TimePosition.create(currentTime, duration)
      if (position.isSuccess) {
        timeCallbacks.forEach((cb) => cb(position.value))
      }
    }),
    setPlaybackRate: vi.fn((rate: PlaybackRate) => {
      playbackRate = rate
    }),
    getCurrentTime: vi.fn(() => currentTime),
    getDuration: vi.fn(() => duration),
    getState: vi.fn(() => state),
    getPlaybackRate: vi.fn(() => playbackRate),
    getTimePosition: vi.fn(() => {
      const result = TimePosition.create(currentTime, duration)
      return result.isSuccess ? result.value : null
    }),
    onStateChange: vi.fn((callback: (state: PlaybackState) => void) => {
      stateCallbacks.push(callback)
    }),
    onTimeUpdate: vi.fn((callback: (position: TimePosition) => void) => {
      timeCallbacks.push(callback)
    }),
    onError: vi.fn((callback: (error: Error) => void) => {
      errorCallbacks.push(callback)
    }),
    destroy: vi.fn(),
    ...overrides,
  }
}

describe('PlayerControls', () => {
  let adapter: PlayerAdapter
  let controls: PlayerControls

  beforeEach(() => {
    adapter = createMockAdapter()
    controls = new PlayerControls(adapter)
  })

  describe('play', () => {
    it('should call adapter.play', () => {
      controls.play()
      expect(adapter.play).toHaveBeenCalled()
    })
  })

  describe('pause', () => {
    it('should call adapter.pause', () => {
      controls.pause()
      expect(adapter.pause).toHaveBeenCalled()
    })
  })

  describe('toggle', () => {
    it('should pause when playing', () => {
      adapter = createMockAdapter({
        getState: vi.fn(() => PlaybackState.playing()),
      })
      controls = new PlayerControls(adapter)

      controls.toggle()
      expect(adapter.pause).toHaveBeenCalled()
    })

    it('should play when paused', () => {
      adapter = createMockAdapter({
        getState: vi.fn(() => PlaybackState.paused()),
      })
      controls = new PlayerControls(adapter)

      controls.toggle()
      expect(adapter.play).toHaveBeenCalled()
    })

    it('should play when ended', () => {
      adapter = createMockAdapter({
        getState: vi.fn(() => PlaybackState.ended()),
      })
      controls = new PlayerControls(adapter)

      controls.toggle()
      expect(adapter.play).toHaveBeenCalled()
    })

    it('should play when buffering', () => {
      adapter = createMockAdapter({
        getState: vi.fn(() => PlaybackState.buffering()),
      })
      controls = new PlayerControls(adapter)

      controls.toggle()
      expect(adapter.play).toHaveBeenCalled()
    })
  })

  describe('seekTo', () => {
    it('should succeed with valid position', () => {
      const result = controls.seekTo(30)
      expect(result.isSuccess).toBe(true)
      expect(adapter.seekTo).toHaveBeenCalledWith(30)
    })

    it('should succeed with position at start (0)', () => {
      const result = controls.seekTo(0)
      expect(result.isSuccess).toBe(true)
      expect(adapter.seekTo).toHaveBeenCalledWith(0)
    })

    it('should succeed with position at end', () => {
      adapter = createMockAdapter({
        getDuration: vi.fn(() => 180),
      })
      controls = new PlayerControls(adapter)

      const result = controls.seekTo(180)
      expect(result.isSuccess).toBe(true)
      expect(adapter.seekTo).toHaveBeenCalledWith(180)
    })

    it('should fail with negative position', () => {
      const result = controls.seekTo(-10)
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('SeekError')
      }
      expect(adapter.seekTo).not.toHaveBeenCalled()
    })

    it('should fail with position exceeding duration', () => {
      adapter = createMockAdapter({
        getDuration: vi.fn(() => 180),
      })
      controls = new PlayerControls(adapter)

      const result = controls.seekTo(200)
      expect(result.isFailure).toBe(true)
      if (result.isFailure) {
        expect(result.error._tag).toBe('SeekError')
        expect(result.error.reason).toContain('duration')
      }
      expect(adapter.seekTo).not.toHaveBeenCalled()
    })
  })

  describe('seekForward', () => {
    it('should seek forward by specified seconds', () => {
      adapter = createMockAdapter({
        getCurrentTime: vi.fn(() => 30),
        getDuration: vi.fn(() => 180),
      })
      controls = new PlayerControls(adapter)

      controls.seekForward(10)
      expect(adapter.seekTo).toHaveBeenCalledWith(40)
    })

    it('should not exceed duration', () => {
      adapter = createMockAdapter({
        getCurrentTime: vi.fn(() => 175),
        getDuration: vi.fn(() => 180),
      })
      controls = new PlayerControls(adapter)

      controls.seekForward(10)
      expect(adapter.seekTo).toHaveBeenCalledWith(180)
    })

    it('should use default of 10 seconds', () => {
      adapter = createMockAdapter({
        getCurrentTime: vi.fn(() => 30),
        getDuration: vi.fn(() => 180),
      })
      controls = new PlayerControls(adapter)

      controls.seekForward()
      expect(adapter.seekTo).toHaveBeenCalledWith(40)
    })
  })

  describe('seekBackward', () => {
    it('should seek backward by specified seconds', () => {
      adapter = createMockAdapter({
        getCurrentTime: vi.fn(() => 30),
      })
      controls = new PlayerControls(adapter)

      controls.seekBackward(10)
      expect(adapter.seekTo).toHaveBeenCalledWith(20)
    })

    it('should not go below 0', () => {
      adapter = createMockAdapter({
        getCurrentTime: vi.fn(() => 5),
      })
      controls = new PlayerControls(adapter)

      controls.seekBackward(10)
      expect(adapter.seekTo).toHaveBeenCalledWith(0)
    })

    it('should use default of 10 seconds', () => {
      adapter = createMockAdapter({
        getCurrentTime: vi.fn(() => 30),
      })
      controls = new PlayerControls(adapter)

      controls.seekBackward()
      expect(adapter.seekTo).toHaveBeenCalledWith(20)
    })
  })

  describe('setPlaybackRate', () => {
    it('should set playback rate via adapter', () => {
      controls.setPlaybackRate(1.5)
      expect(adapter.setPlaybackRate).toHaveBeenCalledWith(1.5)
    })

    it.each([0.5, 0.75, 1, 1.25, 1.5] as PlaybackRate[])(
      'should accept valid rate %s',
      (rate) => {
        controls.setPlaybackRate(rate)
        expect(adapter.setPlaybackRate).toHaveBeenCalledWith(rate)
      }
    )
  })

  describe('getState', () => {
    it('should return current state from adapter', () => {
      adapter = createMockAdapter({
        getState: vi.fn(() => PlaybackState.playing()),
      })
      controls = new PlayerControls(adapter)

      const state = controls.getState()
      expect(state.isPlaying).toBe(true)
    })
  })

  describe('getTimePosition', () => {
    it('should return time position from adapter', () => {
      const expectedPosition = TimePosition.create(30, 180)
      adapter = createMockAdapter({
        getTimePosition: vi.fn(() =>
          expectedPosition.isSuccess ? expectedPosition.value : null
        ),
      })
      controls = new PlayerControls(adapter)

      const position = controls.getTimePosition()
      expect(position).not.toBeNull()
      expect(position?.currentSeconds).toBe(30)
      expect(position?.durationSeconds).toBe(180)
    })

    it('should return null if video not loaded', () => {
      adapter = createMockAdapter({
        getTimePosition: vi.fn(() => null),
      })
      controls = new PlayerControls(adapter)

      const position = controls.getTimePosition()
      expect(position).toBeNull()
    })
  })

  describe('getPlaybackRate', () => {
    it('should return current playback rate from adapter', () => {
      adapter = createMockAdapter({
        getPlaybackRate: vi.fn(() => 1.25 as PlaybackRate),
      })
      controls = new PlayerControls(adapter)

      const rate = controls.getPlaybackRate()
      expect(rate).toBe(1.25)
    })
  })

  describe('getCurrentTime', () => {
    it('should return current time from adapter', () => {
      adapter = createMockAdapter({
        getCurrentTime: vi.fn(() => 45.5),
      })
      controls = new PlayerControls(adapter)

      const time = controls.getCurrentTime()
      expect(time).toBe(45.5)
    })
  })

  describe('getDuration', () => {
    it('should return duration from adapter', () => {
      adapter = createMockAdapter({
        getDuration: vi.fn(() => 180),
      })
      controls = new PlayerControls(adapter)

      const duration = controls.getDuration()
      expect(duration).toBe(180)
    })
  })
})
