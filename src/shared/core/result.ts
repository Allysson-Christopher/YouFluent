/**
 * Result pattern for typed error handling
 *
 * PRE: None
 * POST: Returns either Success<T> or Failure<E>
 *
 * Usage:
 *   const result = Result.ok(value)    // Success
 *   const result = Result.fail(error)  // Failure
 *
 *   if (result.isSuccess) {
 *     // result.value is available
 *   } else {
 *     // result.error is available
 *   }
 */

export interface Success<T> {
  readonly isSuccess: true
  readonly isFailure: false
  readonly value: T
}

export interface Failure<E> {
  readonly isSuccess: false
  readonly isFailure: true
  readonly error: E
}

export type Result<T, E> = Success<T> | Failure<E>

export const Result = {
  /**
   * Creates a successful result
   *
   * PRE: value must be of type T
   * POST: Returns Success<T> with isSuccess=true
   */
  ok: <T>(value: T): Success<T> => ({
    isSuccess: true,
    isFailure: false,
    value,
  }),

  /**
   * Creates a failure result
   *
   * PRE: error must be of type E
   * POST: Returns Failure<E> with isFailure=true
   */
  fail: <E>(error: E): Failure<E> => ({
    isSuccess: false,
    isFailure: true,
    error,
  }),
}
