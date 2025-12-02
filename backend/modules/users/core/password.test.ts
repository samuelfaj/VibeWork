import { describe, it, expect } from 'vitest'
import { hashPassword, verifyPassword } from './password'

describe('password utilities', () => {
  it('hashPassword returns a string starting with $argon2', async () => {
    const hash = await hashPassword('secret123')
    expect(hash).toMatch(/^\$argon2/)
  })

  it('verifyPassword returns true for correct password', async () => {
    const hash = await hashPassword('secret123')
    const result = await verifyPassword(hash, 'secret123')
    expect(result).toBe(true)
  })

  it('verifyPassword returns false for incorrect password', async () => {
    const hash = await hashPassword('secret123')
    const result = await verifyPassword(hash, 'wrongpassword')
    expect(result).toBe(false)
  })

  it('hashPassword produces different hashes for same input (salting)', async () => {
    const hash1 = await hashPassword('same')
    const hash2 = await hashPassword('same')
    expect(hash1).not.toBe(hash2)
  })

  it('hashPassword throws for empty password', async () => {
    await expect(hashPassword('')).rejects.toThrow('Password cannot be empty')
  })

  it('verifyPassword returns false for empty hash', async () => {
    const result = await verifyPassword('', 'password')
    expect(result).toBe(false)
  })

  it('verifyPassword returns false for empty password', async () => {
    const hash = await hashPassword('secret123')
    const result = await verifyPassword(hash, '')
    expect(result).toBe(false)
  })
})
