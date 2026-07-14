import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { PushAuthService } from './push-auth.service'

describe('PushAuthService', () => {
  const original = process.env.PUBSUB_PUSH_TOKEN

  afterEach(() => {
    if (original === undefined) {
      delete process.env.PUBSUB_PUSH_TOKEN
    } else {
      process.env.PUBSUB_PUSH_TOKEN = original
    }
  })

  beforeEach(() => {
    delete process.env.PUBSUB_PUSH_TOKEN
  })

  it('allows all requests when token is not configured', () => {
    const request = new Request('http://localhost/pubsub/push')
    expect(PushAuthService.isAuthorized(request)).toBe(true)
  })

  it('accepts matching bearer token', () => {
    process.env.PUBSUB_PUSH_TOKEN = 'secret-token'
    const request = new Request('http://localhost/pubsub/push', {
      headers: { Authorization: 'Bearer secret-token' },
    })
    expect(PushAuthService.isAuthorized(request)).toBe(true)
  })

  it('accepts matching x-pubsub-token header', () => {
    process.env.PUBSUB_PUSH_TOKEN = 'secret-token'
    const request = new Request('http://localhost/pubsub/push', {
      headers: { 'X-Pubsub-Token': 'secret-token' },
    })
    expect(PushAuthService.isAuthorized(request)).toBe(true)
  })

  it('rejects mismatched token', () => {
    process.env.PUBSUB_PUSH_TOKEN = 'secret-token'
    const request = new Request('http://localhost/pubsub/push', {
      headers: { Authorization: 'Bearer wrong' },
    })
    expect(PushAuthService.isAuthorized(request)).toBe(false)
  })
})
