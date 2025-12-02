import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'

export interface EmailService {
  sendEmail(to: string, subject: string, body: string): Promise<void>
}

export class SESEmailService implements EmailService {
  private client: SESClient
  private fromAddress: string

  constructor() {
    this.client = new SESClient({
      region: process.env.AWS_REGION || 'us-east-1',
    })
    this.fromAddress = process.env.EMAIL_FROM || 'noreply@vibework.com'
  }

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const command = new SendEmailCommand({
      Destination: { ToAddresses: [to] },
      Message: {
        Body: { Text: { Data: body } },
        Subject: { Data: subject },
      },
      Source: this.fromAddress,
    })
    await this.client.send(command)
  }
}

export class MockEmailService implements EmailService {
  async sendEmail(to: string, subject: string, _body: string): Promise<void> {
    console.log(`Mock email to ${to}: ${subject}`)
  }
}

export function createEmailService(useMock?: boolean): EmailService {
  return (useMock ?? process.env.EMAIL_SERVICE_MOCK === 'true')
    ? new MockEmailService()
    : new SESEmailService()
}
