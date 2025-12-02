import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockSend = vi.fn().mockResolvedValue({})

vi.mock('@aws-sdk/client-ses', () => ({
  SESClient: class MockSESClient {
    send = mockSend
  },
  SendEmailCommand: class MockSendEmailCommand {
    constructor(public input: unknown) {}
  },
}))

describe('MockEmailService', () => {
  it('resolves without error', async () => {
    const { MockEmailService } = await import('../email.service')
    const service = new MockEmailService()

    await expect(service.sendEmail('test@example.com', 'Subject', 'Body')).resolves.not.toThrow()
  })
})

describe('SESEmailService', () => {
  beforeEach(() => {
    mockSend.mockClear()
  })

  it('calls AWS SES client send method', async () => {
    const { SESEmailService } = await import('../email.service')
    const service = new SESEmailService()

    await service.sendEmail('recipient@example.com', 'Test Subject', 'Test Body')

    expect(mockSend).toHaveBeenCalledTimes(1)
  })
})

describe('createEmailService factory', () => {
  it('returns MockEmailService when useMock is true', async () => {
    const { createEmailService, MockEmailService } = await import('../email.service')

    const service = createEmailService(true)

    expect(service).toBeInstanceOf(MockEmailService)
  })

  it('returns SESEmailService when useMock is false', async () => {
    const { createEmailService, SESEmailService } = await import('../email.service')

    const service = createEmailService(false)

    expect(service).toBeInstanceOf(SESEmailService)
  })
})
