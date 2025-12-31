import { randomBytes, scrypt } from 'node:crypto'
import { eq, sql } from 'drizzle-orm'
import { account } from '../modules/users/schema/auth.schema'
import { user } from '../modules/users/schema/user.schema'
import { db, closeMySqlConnection } from '../src/infra/database/mysql'
import { TEST_USERS, DEFAULT_PASSWORD } from './data/users'
import { seederRun } from './schema/seeder-run.schema'
import { generateUUID } from './utils'

const SEED_NAME = 'initial-seed-v1'
const SALT_LENGTH = 16
const SCRYPT_KEY_LENGTH = 64
const SCRYPT_N = 16_384
const SCRYPT_R = 16
const SCRYPT_P = 1
const SCRYPT_MAX_MEM = 67_108_864

// Generates password hash compatible with Better-Auth
// Uses Node.js built-in scrypt (same algorithm as Better-Auth)
async function generatePasswordHash(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH).toString('hex')
  return new Promise((resolve, reject) => {
    scrypt(
      password.normalize('NFKC'),
      salt,
      SCRYPT_KEY_LENGTH,
      {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
        maxmem: SCRYPT_MAX_MEM,
      },
      (error, derived) => {
        if (error) reject(error)
        else resolve(`${salt}:${derived.toString('hex')}`)
      }
    )
  })
}

async function ensureSeederRunTable() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS seeder_run (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      run_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)
    )
  `)
}

async function hasSeederRun(name: string): Promise<boolean> {
  const [result] = await db.select().from(seederRun).where(eq(seederRun.name, name)).limit(1)
  return !!result
}

async function markSeederAsRun(name: string): Promise<void> {
  await db.insert(seederRun).values({
    id: generateUUID(),
    name,
  })
}

async function seed() {
  console.log('Starting seed...')

  // Ensure seeder_run table exists
  await ensureSeederRunTable()

  // Check if seed has already run
  if (await hasSeederRun(SEED_NAME)) {
    console.log(`Seed "${SEED_NAME}" has already run. Skipping...`)
    await closeMySqlConnection()
    return
  }

  console.log(`Running seed "${SEED_NAME}"...`)

  try {
    // Generate password hash
    console.log('Generating password hash...')
    const hashedPassword = await generatePasswordHash(DEFAULT_PASSWORD)
    console.log(`Generated hash (length: ${hashedPassword.length})`)

    // Create test users
    for (const userData of TEST_USERS) {
      console.log(`\nProcessing user: ${userData.name}`)

      const [existingUser] = await db
        .select()
        .from(user)
        .where(eq(user.email, userData.email))
        .limit(1)

      let currentUserId = existingUser?.id

      if (!existingUser) {
        // Create user
        currentUserId = generateUUID()
        await db.insert(user).values({
          id: currentUserId,
          email: userData.email,
          name: userData.name,
          emailVerified: userData.emailVerified,
          image: userData.image,
        })
        console.log(`Created user: ${userData.email}`)
      } else {
        console.log(`User already exists: ${userData.email}`)
      }

      // Check if account already exists
      const [existingAccount] = await db
        .select()
        .from(account)
        .where(eq(account.userId, currentUserId!))
        .limit(1)

      if (!existingAccount) {
        // Create account with password
        await db.insert(account).values({
          id: generateUUID(),
          accountId: userData.email,
          providerId: 'credential',
          userId: currentUserId!,
          password: hashedPassword,
        })
        console.log(`Created account for: ${userData.email}`)
      } else {
        console.log(`Account already exists for: ${userData.email}`)
      }
    }

    // Mark seed as completed
    await markSeederAsRun(SEED_NAME)

    console.log('\nSeed completed successfully!')
    console.log(`Total users processed: ${TEST_USERS.length}`)
    console.log(`Default password for all users: ${DEFAULT_PASSWORD}`)
  } catch (error) {
    console.error('Seed failed:', error)
    throw error
  } finally {
    await closeMySqlConnection()
  }
}

await seed()
