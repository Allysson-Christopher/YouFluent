/**
 * Result pattern para operações que podem falhar
 * Usado em toda a camada de domínio e aplicação
 */
export type Result<T, E> = { success: true; value: T } | { success: false; error: E }

/**
 * Cria um Result de sucesso
 */
export function ok<T>(value: T): Result<T, never> {
  return { success: true, value }
}

/**
 * Cria um Result de erro
 */
export function err<E>(error: E): Result<never, E> {
  return { success: false, error }
}

/**
 * Tipo para IDs de entidades (branded type)
 */
export type EntityId<T extends string> = string & { readonly __brand: T }

/**
 * Utility type para extrair o tipo de sucesso de um Result
 */
export type ResultValue<R> = R extends Result<infer T, unknown> ? T : never

/**
 * Utility type para extrair o tipo de erro de um Result
 */
export type ResultError<R> = R extends Result<unknown, infer E> ? E : never
