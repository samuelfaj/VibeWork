import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql'
import { MongoDBContainer, StartedMongoDBContainer } from '@testcontainers/mongodb'

/**
 * Create a pre-configured MySQL container for integration tests
 * Uses MySQL 8.0 with default test credentials
 */
export async function createMySqlContainer(): Promise<StartedMySqlContainer> {
  const container = await new MySqlContainer('mysql:8.0')
    .withDatabase('testdb')
    .withUsername('testuser')
    .withUserPassword('testpass')
    .withStartupTimeout(60000)
    .start()

  return container
}

/**
 * Create a pre-configured MongoDB container for integration tests
 * Uses MongoDB 7.0
 */
export async function createMongoContainer(): Promise<StartedMongoDBContainer> {
  const container = await new MongoDBContainer('mongo:7.0').withStartupTimeout(60000).start()

  return container
}

/**
 * Get MySQL connection config from a started container
 */
export function getMySqlConfig(container: StartedMySqlContainer) {
  return {
    host: container.getHost(),
    port: container.getPort(),
    user: container.getUsername(),
    password: container.getUserPassword(),
    database: container.getDatabase(),
  }
}

/**
 * Get MongoDB connection string from a started container
 */
export function getMongoConnectionString(container: StartedMongoDBContainer): string {
  return container.getConnectionString()
}
