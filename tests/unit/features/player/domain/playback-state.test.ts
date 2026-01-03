import { describe, it, expect } from 'vitest'
import { PlaybackState } from '@/features/player/domain/value-objects/playback-state'

describe('PlaybackState', () => {
  describe('factory methods', () => {
    it('should create playing state', () => {
      const state = PlaybackState.playing()
      expect(state.state).toBe('playing')
    })

    it('should create paused state', () => {
      const state = PlaybackState.paused()
      expect(state.state).toBe('paused')
    })

    it('should create buffering state', () => {
      const state = PlaybackState.buffering()
      expect(state.state).toBe('buffering')
    })

    it('should create ended state', () => {
      const state = PlaybackState.ended()
      expect(state.state).toBe('ended')
    })
  })

  describe('state checks', () => {
    describe('isPlaying', () => {
      it('should return true for playing state', () => {
        const state = PlaybackState.playing()
        expect(state.isPlaying).toBe(true)
      })

      it('should return false for non-playing states', () => {
        expect(PlaybackState.paused().isPlaying).toBe(false)
        expect(PlaybackState.buffering().isPlaying).toBe(false)
        expect(PlaybackState.ended().isPlaying).toBe(false)
      })
    })

    describe('isPaused', () => {
      it('should return true for paused state', () => {
        const state = PlaybackState.paused()
        expect(state.isPaused).toBe(true)
      })

      it('should return false for non-paused states', () => {
        expect(PlaybackState.playing().isPaused).toBe(false)
        expect(PlaybackState.buffering().isPaused).toBe(false)
        expect(PlaybackState.ended().isPaused).toBe(false)
      })
    })

    describe('isBuffering', () => {
      it('should return true for buffering state', () => {
        const state = PlaybackState.buffering()
        expect(state.isBuffering).toBe(true)
      })

      it('should return false for non-buffering states', () => {
        expect(PlaybackState.playing().isBuffering).toBe(false)
        expect(PlaybackState.paused().isBuffering).toBe(false)
        expect(PlaybackState.ended().isBuffering).toBe(false)
      })
    })

    describe('isEnded', () => {
      it('should return true for ended state', () => {
        const state = PlaybackState.ended()
        expect(state.isEnded).toBe(true)
      })

      it('should return false for non-ended states', () => {
        expect(PlaybackState.playing().isEnded).toBe(false)
        expect(PlaybackState.paused().isEnded).toBe(false)
        expect(PlaybackState.buffering().isEnded).toBe(false)
      })
    })
  })

  describe('transitions', () => {
    describe('play()', () => {
      it('should return playing state from paused', () => {
        const paused = PlaybackState.paused()
        const playing = paused.play()
        expect(playing.isPlaying).toBe(true)
      })

      it('should return playing state from buffering', () => {
        const buffering = PlaybackState.buffering()
        const playing = buffering.play()
        expect(playing.isPlaying).toBe(true)
      })

      it('should return same state if already playing', () => {
        const playing = PlaybackState.playing()
        const result = playing.play()
        expect(result.isPlaying).toBe(true)
      })
    })

    describe('pause()', () => {
      it('should return paused state from playing', () => {
        const playing = PlaybackState.playing()
        const paused = playing.pause()
        expect(paused.isPaused).toBe(true)
      })

      it('should return same state if already paused', () => {
        const paused = PlaybackState.paused()
        const result = paused.pause()
        expect(result.isPaused).toBe(true)
      })
    })

    describe('buffer()', () => {
      it('should return buffering state from playing', () => {
        const playing = PlaybackState.playing()
        const buffering = playing.buffer()
        expect(buffering.isBuffering).toBe(true)
      })

      it('should return buffering state from paused', () => {
        const paused = PlaybackState.paused()
        const buffering = paused.buffer()
        expect(buffering.isBuffering).toBe(true)
      })
    })

    describe('end()', () => {
      it('should return ended state from playing', () => {
        const playing = PlaybackState.playing()
        const ended = playing.end()
        expect(ended.isEnded).toBe(true)
      })

      it('should return ended state from paused', () => {
        const paused = PlaybackState.paused()
        const ended = paused.end()
        expect(ended.isEnded).toBe(true)
      })
    })
  })

  describe('equals', () => {
    it('should return true for same state', () => {
      const state1 = PlaybackState.playing()
      const state2 = PlaybackState.playing()
      expect(state1.equals(state2)).toBe(true)
    })

    it('should return false for different states', () => {
      const playing = PlaybackState.playing()
      const paused = PlaybackState.paused()
      expect(playing.equals(paused)).toBe(false)
    })

    it('should be commutative', () => {
      const s1 = PlaybackState.buffering()
      const s2 = PlaybackState.buffering()
      expect(s1.equals(s2)).toBe(s2.equals(s1))
    })
  })

  describe('immutability', () => {
    it('should be frozen', () => {
      const state = PlaybackState.playing()
      expect(Object.isFrozen(state)).toBe(true)
    })

    it('transitions should return new instances', () => {
      const playing = PlaybackState.playing()
      const paused = playing.pause()
      expect(playing).not.toBe(paused)
    })
  })

  describe('toString', () => {
    it('should return state string', () => {
      expect(PlaybackState.playing().toString()).toBe('playing')
      expect(PlaybackState.paused().toString()).toBe('paused')
      expect(PlaybackState.buffering().toString()).toBe('buffering')
      expect(PlaybackState.ended().toString()).toBe('ended')
    })
  })
})
