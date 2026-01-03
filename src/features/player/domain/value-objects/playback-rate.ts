/**
 * Playback Rate Type
 *
 * Represents valid video playback speeds.
 * YouTube IFrame API supports: 0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2
 * We limit to a more practical subset for learning.
 */

/**
 * Valid playback rate values
 *
 * INVARIANTS:
 * - All values are positive numbers
 * - All values are multiples of 0.25
 * - Range: 0.5 to 1.5
 */
export type PlaybackRate = 0.5 | 0.75 | 1 | 1.25 | 1.5

/**
 * Array of all valid playback rates
 *
 * @readonly
 */
export const VALID_PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5] as const

/**
 * Default playback rate (normal speed)
 */
export const DEFAULT_PLAYBACK_RATE: PlaybackRate = 1

/**
 * Type guard to check if a number is a valid PlaybackRate
 *
 * PRE: rate is a number
 * POST: Returns true if rate is one of: 0.5, 0.75, 1, 1.25, 1.5
 *
 * @param rate - Number to validate
 * @returns true if rate is valid
 */
export function isValidPlaybackRate(rate: number): rate is PlaybackRate {
  return VALID_PLAYBACK_RATES.includes(rate as PlaybackRate)
}
