import { eq } from 'drizzle-orm'
import { db } from '../../../src/infra/database/mysql'
import { users, type User, type NewUser } from '../schema/user.schema'

export class UserService {
  async createUser(data: NewUser): Promise<User> {
    await db.insert(users).values(data)
    const [user] = await db.select().from(users).where(eq(users.id, data.id))
    if (!user) {
      throw new Error('Failed to create user')
    }
    return user
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.email, email))
    return user || null
  }

  async findUserById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id))
    return user || null
  }
}

export const userService = new UserService()
