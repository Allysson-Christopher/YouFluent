import { describe, it, expect } from 'vitest'
import { TimePosition } from '@/features/player/domain/value-objects/time-position'

describe('TimePosition', () => {
  describe('create', () => {
    describe('valid times', () => {
      it('should create position with valid times', () => {
        const result = TimePosition.create(30, 180)
        expect(result.isSuccess).toBe(true)
        if (result.isSuccess) {
          expect(result.value.currentSeconds).toBe(30)
          expect(result.value.durationSeconds).toBe(180)
        }
      })

      it('should create position at start (current = 0)', () => {
        const result = TimePosition.create(0, 100)
        expect(result.isSuccess).toBe(true)
        if (result.isSuccess) {
          expect(result.value.currentSeconds).toBe(0)
        }
      })

      it('should create position at end (current = duration)', () => {
        const result = TimePosition.create(100, 100)
        expect(result.isSuccess).toBe(true)
        if (result.isSuccess) {
          expect(result.value.currentSeconds).toBe(100)
          expect(result.value.durationSeconds).toBe(100)
        }
      })

      it('should handle fractional seconds', () => {
        const result = TimePosition.create(30.5, 180.75)
        expect(result.isSuccess).toBe(true)
        if (result.isSuccess) {
          expect(result.value.currentSeconds).toBe(30.5)
          expect(result.value.durationSeconds).toBe(180.75)
        }
      })
    })

    describe('invalid times', () => {
      it('should fail for negative current time', () => {
        const result = TimePosition.create(-1, 100)
        expect(result.isFailure).toBe(true)
        if (result.isFailure) {
          expect(result.error._tag).toBe('InvalidTimeError')
          expect(result.error.reason).toContain('negative')
        }
      })

      it('should fail for negative duration', () => {
        const result = TimePosition.create(0, -100)
        expect(result.isFailure).toBe(true)
        if (result.isFailure) {
          expect(result.error._tag).toBe('InvalidTimeError')
          expect(result.error.reason).toContain('positive')
        }
      })

      it('should fail for zero duration', () => {
        const result = TimePosition.create(0, 0)
        expect(result.isFailure).toBe(true)
        if (result.isFailure) {
          expect(result.error._tag).toBe('InvalidTimeError')
          expect(result.error.reason).toContain('positive')
        }
      })

      it('should fail when current exceeds duration', () => {
        const result = TimePosition.create(200, 100)
        expect(result.isFailure).toBe(true)
        if (result.isFailure) {
          expect(result.error._tag).toBe('InvalidTimeError')
          expect(result.error.reason).toContain('exceed')
        }
      })
    })
  })

  describe('progressPercent', () => {
    it('should calculate 0% at start', () => {
      const result = TimePosition.create(0, 100)
      if (result.isSuccess) {
        expect(result.value.progressPercent).toBe(0)
      }
    })

    it('should calculate 100% at end', () => {
      const result = TimePosition.create(100, 100)
      if (result.isSuccess) {
        expect(result.value.progressPercent).toBe(100)
      }
    })

    it('should calculate 50% at middle', () => {
      const result = TimePosition.create(50, 100)
      if (result.isSuccess) {
        expect(result.value.progressPercent).toBe(50)
      }
    })

    it('should calculate progress with 2 decimal places', () => {
      const result = TimePosition.create(30, 180)
      if (result.isSuccess) {
        // 30/180 = 0.16666... = 16.67%
        expect(result.value.progressPercent).toBeCloseTo(16.67, 2)
      }
    })

    it('should handle edge case of very small progress', () => {
      const result = TimePosition.create(1, 10000)
      if (result.isSuccess) {
        expect(result.value.progressPercent).toBeCloseTo(0.01, 2)
      }
    })
  })

  describe('remainingSeconds', () => {
    it('should return full duration at start', () => {
      const result = TimePosition.create(0, 100)
      if (result.isSuccess) {
        expect(result.value.remainingSeconds).toBe(100)
      }
    })

    it('should return 0 at end', () => {
      const result = TimePosition.create(100, 100)
      if (result.isSuccess) {
        expect(result.value.remainingSeconds).toBe(0)
      }
    })

    it('should calculate remaining correctly', () => {
      const result = TimePosition.create(30, 180)
      if (result.isSuccess) {
        expect(result.value.remainingSeconds).toBe(150)
      }
    })
  })

  describe('isAtStart', () => {
    it('should return true when current is 0', () => {
      const result = TimePosition.create(0, 100)
      if (result.isSuccess) {
        expect(result.value.isAtStart).toBe(true)
      }
    })

    it('should return false when current is not 0', () => {
      const result = TimePosition.create(1, 100)
      if (result.isSuccess) {
        expect(result.value.isAtStart).toBe(false)
      }
    })
  })

  describe('isAtEnd', () => {
    it('should return true when current equals duration', () => {
      const result = TimePosition.create(100, 100)
      if (result.isSuccess) {
        expect(result.value.isAtEnd).toBe(true)
      }
    })

    it('should return false when current is less than duration', () => {
      const result = TimePosition.create(99, 100)
      if (result.isSuccess) {
        expect(result.value.isAtEnd).toBe(false)
      }
    })
  })

  describe('equals', () => {
    it('should return true for same values', () => {
      const pos1 = TimePosition.create(30, 180)
      const pos2 = TimePosition.create(30, 180)
      if (pos1.isSuccess && pos2.isSuccess) {
        expect(pos1.value.equals(pos2.value)).toBe(true)
      }
    })

    it('should return false for different current times', () => {
      const pos1 = TimePosition.create(30, 180)
      const pos2 = TimePosition.create(40, 180)
      if (pos1.isSuccess && pos2.isSuccess) {
        expect(pos1.value.equals(pos2.value)).toBe(false)
      }
    })

    it('should return false for different durations', () => {
      const pos1 = TimePosition.create(30, 180)
      const pos2 = TimePosition.create(30, 200)
      if (pos1.isSuccess && pos2.isSuccess) {
        expect(pos1.value.equals(pos2.value)).toBe(false)
      }
    })
  })

  describe('immutability', () => {
    it('should be frozen', () => {
      const result = TimePosition.create(30, 180)
      if (result.isSuccess) {
        expect(Object.isFrozen(result.value)).toBe(true)
      }
    })
  })

  describe('formatting', () => {
    describe('formattedCurrent', () => {
      it('should format seconds as MM:SS', () => {
        const result = TimePosition.create(65, 180)
        if (result.isSuccess) {
          expect(result.value.formattedCurrent).toBe('1:05')
        }
      })

      it('should format zero seconds', () => {
        const result = TimePosition.create(0, 180)
        if (result.isSuccess) {
          expect(result.value.formattedCurrent).toBe('0:00')
        }
      })

      it('should format large times correctly', () => {
        const result = TimePosition.create(3661, 7200) // 1h 1m 1s
        if (result.isSuccess) {
          expect(result.value.formattedCurrent).toBe('61:01')
        }
      })
    })

    describe('formattedDuration', () => {
      it('should format duration as MM:SS', () => {
        const result = TimePosition.create(0, 180)
        if (result.isSuccess) {
          expect(result.value.formattedDuration).toBe('3:00')
        }
      })
    })

    describe('formattedRemaining', () => {
      it('should format remaining time as MM:SS', () => {
        const result = TimePosition.create(30, 180)
        if (result.isSuccess) {
          expect(result.value.formattedRemaining).toBe('2:30')
        }
      })
    })
  })
})
