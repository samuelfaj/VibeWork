import { exec } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

const SERVICES_PROMISE_KEY = Symbol.for('vibework:e2e:servicesPromise')
const HEALTH_CHECK_TIMEOUT_MS = 120_000

type GlobalWithServices = typeof globalThis & {
  [SERVICES_PROMISE_KEY]?: Promise<void>
}

function resolveMonorepoRoot(): string {
  const helpersDir = path.dirname(fileURLToPath(import.meta.url))
  const e2eStagehandDir = path.resolve(helpersDir, '..')
  return path.resolve(e2eStagehandDir, '..')
}

async function isHealthy(url: string): Promise<boolean> {
  try {
    const res = await fetch(url)
    return res.ok
  } catch {
    return false
  }
}

async function waitForHealth(url: string, timeoutMs: number): Promise<void> {
  const startTime = Date.now()
  const pollIntervalMs = 1000

  while (Date.now() - startTime < timeoutMs) {
    if (await isHealthy(url)) return
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs))
  }

  throw new Error(`Service at ${url} did not become healthy within ${timeoutMs}ms`)
}

// Ensure backend and frontend services are running - starts Docker services if needed
export async function ensureServices(): Promise<void> {
  const global = globalThis as GlobalWithServices
  if (global[SERVICES_PROMISE_KEY]) return global[SERVICES_PROMISE_KEY]

  global[SERVICES_PROMISE_KEY] = (async () => {
    const backendUrl = 'http://localhost:3000/healthz'
    const frontendUrl = 'http://localhost:5173/'
    const rootDir = resolveMonorepoRoot()

    // Fast-path: services already up
    const servicesUp = (await isHealthy(backendUrl)) && (await isHealthy(frontendUrl))

    if (!servicesUp) {
      console.log('Starting services via docker-compose...')
      await execAsync('docker-compose up -d', { cwd: rootDir })

      console.log('Waiting for backend/frontend health...')
      await waitForHealth(backendUrl, HEALTH_CHECK_TIMEOUT_MS)
      await waitForHealth(frontendUrl, HEALTH_CHECK_TIMEOUT_MS)
    }

    // Ensure DB schema is up-to-date
    console.log('Running backend migrations...')
    try {
      await execAsync('bun run db:migrate', {
        cwd: path.join(rootDir, 'backend'),
      })
    } catch (error) {
      console.warn('Warning: Migration failed (may already be up to date):', error)
    }
  })()

  return global[SERVICES_PROMISE_KEY]
}
