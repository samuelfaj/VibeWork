import { MySqlContainer, type StartedMySqlContainer } from '@testcontainers/mysql'

/** Pre-configured MySQL 8 container for integration tests. */
export async function createMySqlContainer(): Promise<StartedMySqlContainer> {
  return new MySqlContainer('mysql:8.0')
    .withDatabase('testdb')
    .withUsername('testuser')
    .withUserPassword('testpass')
    .withStartupTimeout(60_000)
    .start()
}

export function getMySqlConfig(container: StartedMySqlContainer) {
  return {
    host: container.getHost(),
    port: container.getPort(),
    user: container.getUsername(),
    password: container.getUserPassword(),
    database: container.getDatabase(),
  }
}
