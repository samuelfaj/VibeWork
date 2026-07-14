/**
 * Minimal HTTP set shape compatible with Elysia `set` without coupling controllers to full Context.
 */
export type HttpSet = {
  status?: number | string
  headers?: Record<string, unknown>
}
