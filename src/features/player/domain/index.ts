/**
 * Player Domain Layer Exports
 *
 * This is the public API of the player domain.
 * Only export what is needed by other layers.
 */

// Entities
export { PlayerControls } from './entities/player-controls'

// Value Objects
export { PlaybackState } from './value-objects/playback-state'
export type { PlaybackStateValue } from './value-objects/playback-state'

export { TimePosition } from './value-objects/time-position'

export {
  type PlaybackRate,
  VALID_PLAYBACK_RATES,
  DEFAULT_PLAYBACK_RATE,
  isValidPlaybackRate,
} from './value-objects/playback-rate'

// Interfaces (Ports)
export type { PlayerAdapter } from './interfaces/player-adapter'

// Errors
export {
  InvalidTimeError,
  InvalidPlaybackRateError,
  SeekError,
} from './errors/player-errors'
export type { PlayerError } from './errors/player-errors'
