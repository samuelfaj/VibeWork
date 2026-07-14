import { logger } from '../../../../src/infra/logger'

/**
 * Validates Pub/Sub push requests.
 * When PUBSUB_PUSH_TOKEN is set, requires matching Authorization Bearer or X-Pubsub-Token.
 * When unset (local/dev), allows all requests.
 */
export const PushAuthService = {
  isAuthorized(request: Request): boolean {
    const expected = process.env.PUBSUB_PUSH_TOKEN
    if (!expected) {
      return true
    }

    const authHeader = request.headers.get('authorization')
    const bearer = authHeader?.toLowerCase().startsWith('bearer ')
      ? authHeader.slice('bearer '.length).trim()
      : null
    const headerToken = request.headers.get('x-pubsub-token')
    const provided = bearer ?? headerToken

    if (provided && provided === expected) {
      return true
    }

    logger.warn('pubsub push auth failed', { action: 'PushAuthService.isAuthorized' })
    return false
  },
}
