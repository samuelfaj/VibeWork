import { hash, verify } from '@node-rs/argon2'

// OWASP recommended settings for argon2id
const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
}

export class PasswordService {
  static async hash(password: string): Promise<string> {
    if (!password) {
      throw new Error('Password cannot be empty')
    }
    return hash(password, ARGON2_OPTIONS)
  }

  static async verify(hashValue: string, password: string): Promise<boolean> {
    if (!hashValue || !password) {
      return false
    }
    try {
      return await verify(hashValue, password)
    } catch {
      return false
    }
  }
}

/**
 * @deprecated Use PasswordService.hash() instead
 */
export async function hashPassword(password: string): Promise<string> {
  return PasswordService.hash(password)
}

/**
 * @deprecated Use PasswordService.verify() instead
 */
export async function verifyPassword(hashValue: string, password: string): Promise<boolean> {
  return PasswordService.verify(hashValue, password)
}
