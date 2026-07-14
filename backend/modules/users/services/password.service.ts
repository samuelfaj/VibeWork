import { hash, verify } from '@node-rs/argon2'

// OWASP recommended settings for argon2id
const ARGON2_OPTIONS = {
  memoryCost: 65_536, // 64 MB
  timeCost: 3,
  parallelism: 4,
}

/** Stateless crypto helpers (module object). */
export const PasswordService = {
  async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password cannot be empty')
    }
    return hash(password, ARGON2_OPTIONS)
  },

  async verify(hashValue: string, password: string): Promise<boolean> {
    if (!hashValue || !password) {
      return false
    }
    try {
      return await verify(hashValue, password)
    } catch {
      return false
    }
  },
}
