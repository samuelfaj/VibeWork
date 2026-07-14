import { treaty, type Treaty } from '@elysiajs/eden'
import type { App } from '@vibework/backend/app'
import i18n from '../i18n'
import { AppError, hasErrorField, isRecord } from './errors'
import { createRequestId } from './request-id'

const DEFAULT_API_URL = 'http://localhost:3000'
const baseUrl = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL

/**
 * Typed Eden client for domain APIs (session cookie via credentials).
 * Prefer `unwrapEden` for hooks so error handling stays consistent.
 */
export const api: Treaty.Create<App> = treaty<App>(baseUrl, {
  fetch: {
    credentials: 'include',
  },
  headers: () => ({
    'Accept-Language': i18n.language ?? 'pt-BR',
    'X-Request-Id': createRequestId(),
  }),
})

type EdenResult<T> = {
  data: T | null
  error: unknown
  status?: number
  response?: Response
}

type ApiErrorBody = { error: { code?: string; message?: string } }

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return hasErrorField(value)
}

/**
 * Unwraps an Eden treaty call into data or throws AppError.
 * Handles both transport errors and `{ error: { code, message } }` API bodies.
 */
export async function unwrapEden<T>(
  resultPromise: Promise<EdenResult<T>>
): Promise<Exclude<T, ApiErrorBody>> {
  const result = await resultPromise

  if (result.error) {
    const message =
      isRecord(result.error) && typeof result.error.message === 'string'
        ? result.error.message
        : result.error instanceof Error
          ? result.error.message
          : 'Request failed'
    const code =
      isRecord(result.error) && typeof result.error.code === 'string'
        ? result.error.code
        : 'EDEN_ERROR'
    throw new AppError(message, code, result.status)
  }

  if (result.data == null) {
    throw new AppError('Empty response', 'EMPTY_RESPONSE', result.status)
  }

  if (isApiErrorBody(result.data)) {
    throw new AppError(
      result.data.error.message ?? 'Request failed',
      result.data.error.code ?? 'API_ERROR',
      result.status
    )
  }

  return result.data as Exclude<T, ApiErrorBody>
}
