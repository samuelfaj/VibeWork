import { hash, verify } from '@node-rs/argon2'

// OWASP recommended settings for argon2id
const ARGON2_OPTIONS = {
  memoryCost: 65536, // 64 MB
  timeCost: 3,
  parallelism: 4,
}

export async function hashPassword(password: string): Promise<string> {
  if (!password) {
    throw new Error('Password cannot be empty')
  }
  return hash(password, ARGON2_OPTIONS)
}

export async function verifyPassword(hashValue: string, password: string): Promise<boolean> {
  if (!hashValue || !password) {
    return false
  }
  try {
    return await verify(hashValue, password)
  } catch {
    return false
  }
}
