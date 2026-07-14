type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogFields {
  requestId?: string
  userId?: string
  action?: string
  [key: string]: unknown
}

function write(level: LogLevel, message: string, fields: LogFields = {}): void {
  const entry = {
    level,
    message,
    ts: new Date().toISOString(),
    service: process.env.SERVICE_NAME ?? 'vibework-backend',
    ...fields,
  }
  const line = JSON.stringify(entry)
  if (level === 'error') {
    console.error(line)
    return
  }
  if (level === 'warn') {
    console.warn(line)
    return
  }
  console.log(line)
}

export const logger = {
  debug: (message: string, fields?: LogFields) => write('debug', message, fields),
  info: (message: string, fields?: LogFields) => write('info', message, fields),
  warn: (message: string, fields?: LogFields) => write('warn', message, fields),
  error: (message: string, fields?: LogFields) => write('error', message, fields),
}
