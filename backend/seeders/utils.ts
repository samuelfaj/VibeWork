import { randomUUID } from 'node:crypto'

export function generateUUID(): string {
  return randomUUID()
}

export function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function getRandomItem<Item>(array: Item[]): Item {
  return array[Math.floor(Math.random() * array.length)]
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function setHourMinute(date: Date, hour: number, minute: number): Date {
  const result = new Date(date)
  result.setHours(hour, minute, 0, 0)
  return result
}
