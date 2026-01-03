import { describe, it, expect } from 'vitest'
import {
  PlaybackRate,
  VALID_PLAYBACK_RATES,
  DEFAULT_PLAYBACK_RATE,
  isValidPlaybackRate,
} from '@/features/player/domain/value-objects/playback-rate'

describe('PlaybackRate', () => {
  describe('VALID_PLAYBACK_RATES', () => {
    it('should contain all valid playback rates', () => {
      expect(VALID_PLAYBACK_RATES).toEqual([0.5, 0.75, 1, 1.25, 1.5])
    })

    it('should be readonly', () => {
      // TypeScript ensures this at compile time, but we verify the array is as expected
      expect(VALID_PLAYBACK_RATES.length).toBe(5)
    })
  })

  describe('DEFAULT_PLAYBACK_RATE', () => {
    it('should be 1 (normal speed)', () => {
      expect(DEFAULT_PLAYBACK_RATE).toBe(1)
    })

    it('should be a valid playback rate', () => {
      expect(isValidPlaybackRate(DEFAULT_PLAYBACK_RATE)).toBe(true)
    })
  })

  describe('isValidPlaybackRate', () => {
    describe('valid rates', () => {
      it.each([0.5, 0.75, 1, 1.25, 1.5] as PlaybackRate[])(
        'should return true for %s',
        (rate) => {
          expect(isValidPlaybackRate(rate)).toBe(true)
        }
      )
    })

    describe('invalid rates', () => {
      it.each([0, 0.25, 0.6, 0.8, 1.1, 1.75, 2, 3, -1, -0.5])(
        'should return false for %s',
        (rate) => {
          expect(isValidPlaybackRate(rate)).toBe(false)
        }
      )
    })

    it('should return false for non-number values', () => {
      expect(isValidPlaybackRate(NaN)).toBe(false)
      expect(isValidPlaybackRate(Infinity)).toBe(false)
      expect(isValidPlaybackRate(-Infinity)).toBe(false)
    })
  })
})
