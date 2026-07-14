import { Elysia } from 'elysia'
import { logger } from './logger'

const REQUEST_ID_HEADER = 'x-request-id'

function createRequestId(): string {
  return crypto.randomUUID()
}

/**
 * Assigns requestId, logs request start/end with duration.
 */
export const requestContext = new Elysia({ name: 'request-context' })
  .derive({ as: 'global' }, ({ request }) => {
    const incoming = request.headers.get(REQUEST_ID_HEADER)
    const requestId = incoming && incoming.length > 0 ? incoming : createRequestId()
    return { requestId, startedAt: Date.now() }
  })
  .onRequest(({ request }) => {
    // derive runs after onRequest in some versions; log happens in onAfterHandle too
    void request
  })
  .onAfterHandle({ as: 'global' }, ({ request, set, requestId, startedAt }) => {
    set.headers[REQUEST_ID_HEADER] = requestId
    const durationMs = Date.now() - startedAt
    logger.info('request completed', {
      requestId,
      action: `${request.method} ${new URL(request.url).pathname}`,
      status: set.status ?? 200,
      durationMs,
    })
  })
  .onError({ as: 'global' }, ({ request, error, requestId, startedAt, set }) => {
    if (requestId) {
      set.headers[REQUEST_ID_HEADER] = requestId
    }
    logger.error('request failed', {
      requestId,
      action: `${request.method} ${new URL(request.url).pathname}`,
      durationMs: startedAt ? Date.now() - startedAt : undefined,
      error: error instanceof Error ? error.message : String(error),
    })
  })
