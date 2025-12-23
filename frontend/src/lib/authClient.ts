// Auth Client: Better-Auth endpoints (not typed in Eden Treaty)
import i18n from '../i18n'

const DEFAULT_API_URL = 'http://localhost:3000'
const API_BASE = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL

interface AuthRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: unknown
}

// Native fetch for Better-Auth (external API, not in Eden)
const httpRequest = globalThis.fetch.bind(globalThis) as typeof globalThis.fetch

export async function authRequest<TResult>(
  endpoint: string,
  options: AuthRequestOptions = {}
): Promise<TResult> {
  const { method = 'GET', body } = options

  const response = await httpRequest(`${API_BASE}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept-Language': i18n.language ?? 'pt-BR',
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  })

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as { message?: string }
    throw new Error(errorData.message ?? `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<TResult>
}
