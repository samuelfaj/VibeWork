import { randomBytes, scrypt } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { account, session, verification } from '../modules/users/schema/auth.schema'
import { user } from '../modules/users/schema/user.schema'
import { db, closeMySqlConnection } from '../src/infra/database/mysql'
import { TEST_USERS, DEFAULT_PASSWORD } from './data/users'
import { generateUUID } from './utils'

const SALT_LENGTH = 16
const SCRYPT_KEY_LENGTH = 64
const SCRYPT_N = 16_384
const SCRYPT_R = 16
const SCRYPT_P = 1
const SCRYPT_MAX_MEM = 67_108_864

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

async function cleanAndReseed() {
  console.log('Cleaning up and reseeding database...')
  console.log('WARNING: This will delete ALL existing data!')

  try {
    // Delete in correct order to respect foreign keys
    console.log('\nDeleting existing data...')

    // First delete sessions (references user)
    await db.delete(session)
    console.log('Deleted sessions')

    // Delete verifications
    await db.delete(verification)
    console.log('Deleted verifications')

    // Delete accounts (references user)
    await db.delete(account)
    console.log('Deleted accounts')

    // Delete users
    await db.delete(user)
    console.log('Deleted users')

    // Delete seeder run records
    try {
      await db.execute(sql`DELETE FROM seeder_run`)
      console.log('Deleted seeder run records')
    } catch {
      console.log('No seeder_run table yet')
    }

    // Generate password hash
    console.log('\nGenerating password hash...')
    const hashedPassword = await generatePasswordHash(DEFAULT_PASSWORD)
    console.log(`Generated hash (length: ${hashedPassword.length})`)

    // Create test users
    console.log('\nCreating test users...')
    for (const userData of TEST_USERS) {
      const userId = generateUUID()

      // Create user
      await db.insert(user).values({
        id: userId,
        email: userData.email,
        name: userData.name,
        emailVerified: userData.emailVerified,
        image: userData.image,
      })

      // Create account with password
      await db.insert(account).values({
        id: generateUUID(),
        accountId: userData.email,
        providerId: 'credential',
        userId: userId,
        password: hashedPassword,
      })

      console.log(`Created user and account: ${userData.email}`)
    }

    console.log('\nClean and reseed completed!')
    console.log(`Total users created: ${TEST_USERS.length}`)
    console.log(`Default password for all users: ${DEFAULT_PASSWORD}`)
  } catch (error) {
    console.error('Clean and reseed failed:', error)
    throw error
  } finally {
    await closeMySqlConnection()
  }
}

await cleanAndReseed()
