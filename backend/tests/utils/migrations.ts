import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import type mysql from 'mysql2/promise'

function splitMigrationStatements(contents: string): string[] {
  return contents
    .split('--> statement-breakpoint')
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0)
}

export async function applySqlMigrations(pool: mysql.Pool, migrationsDir: string): Promise<void> {
  // eslint-disable-next-line security/detect-non-literal-fs-filename
  const entries = await readdir(migrationsDir, { withFileTypes: true })
  const migrationFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort()

  console.log(`Found ${migrationFiles.length} migration files`)

  for (const filename of migrationFiles) {
    const fullPath = path.join(migrationsDir, filename)
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const contents = await readFile(fullPath, 'utf8')
    const statements = splitMigrationStatements(contents)

    console.log(`Applying migration: ${filename} (${statements.length} statements)`)

    for (const statement of statements) {
      await pool.execute(statement)
    }
  }

  console.log('All migrations applied successfully')
}
