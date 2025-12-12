import { describe, it, expect } from 'vitest'
import { PasswordService, hashPassword, verifyPassword } from './password.service'

describe('PasswordService', () => {
  describe('hash', () => {
    it('returns a string starting with $argon2', async () => {
      const hash = await PasswordService.hash('secret123')
      expect(hash).toMatch(/^\$argon2/)
    })

    it('produces different hashes for same input (salting)', async () => {
      const hash1 = await PasswordService.hash('same')
      const hash2 = await PasswordService.hash('same')
      expect(hash1).not.toBe(hash2)
    })

    it('throws for empty password', async () => {
      await expect(PasswordService.hash('')).rejects.toThrow('Password cannot be empty')
    })
  })

  describe('verify', () => {
    it('returns true for correct password', async () => {
      const hash = await PasswordService.hash('secret123')
      const result = await PasswordService.verify(hash, 'secret123')
      expect(result).toBe(true)
    })

    it('returns false for incorrect password', async () => {
      const hash = await PasswordService.hash('secret123')
      const result = await PasswordService.verify(hash, 'wrongpassword')
      expect(result).toBe(false)
    })

    it('returns false for empty hash', async () => {
      const result = await PasswordService.verify('', 'password')
      expect(result).toBe(false)
    })

    it('returns false for empty password', async () => {
      const hash = await PasswordService.hash('secret123')
      const result = await PasswordService.verify(hash, '')
      expect(result).toBe(false)
    })
  })

  describe('backward compatibility (deprecated functions)', () => {
    it('hashPassword works', async () => {
      const hash = await hashPassword('secret123')
      expect(hash).toMatch(/^\$argon2/)
    })

    it('verifyPassword works', async () => {
      const hash = await hashPassword('secret123')
      const result = await verifyPassword(hash, 'secret123')
      expect(result).toBe(true)
    })
  })
})
