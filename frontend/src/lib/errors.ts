/**
 * Unified client-side error for domain API and auth failures.
 * Features should catch this shape only — not raw Better-Auth / Eden errors.
 */
export class AppError extends Error {
  readonly code: string
  readonly status?: number

  constructor(message: string, code = 'UNKNOWN', status?: number) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.status = status
  }
}

export function toAppError(error: unknown, fallbackMessage = 'Request failed'): AppError {
  if (error instanceof AppError) return error
  if (error instanceof Error) return new AppError(error.message)
  if (typeof error === 'object' && error !== null) {
    const record = error as Record<string, unknown>
    if (typeof record.message === 'string') {
      return new AppError(record.message, typeof record.code === 'string' ? record.code : 'UNKNOWN')
    }
  }
  return new AppError(fallbackMessage)
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function hasErrorField(value: unknown): boolean {
  return isRecord(value) && 'error' in value
}
