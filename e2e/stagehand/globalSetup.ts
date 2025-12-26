import { exec } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execAsync = promisify(exec)

const BACKEND_TIMEOUT_MS = 60_000
const FRONTEND_TIMEOUT_MS = 30_000

function resolveMonorepoRoot(): string {
  const currentDir = path.dirname(fileURLToPath(import.meta.url))
  return path.resolve(currentDir, '..')
}

// Global setup for E2E tests - starts docker-compose services before running tests
export async function setup(): Promise<void> {
  const rootDir = resolveMonorepoRoot()

  console.log('Starting services via docker-compose...')

  try {
    await execAsync('docker-compose up -d', { cwd: rootDir })

    console.log('Services started. Waiting for health checks...')

    // Wait for backend to be ready
    await waitForHealth('http://localhost:3000/healthz', BACKEND_TIMEOUT_MS)
    console.log('Backend is ready')

    // Wait for frontend to be ready
    await waitForHealth('http://localhost:5173', FRONTEND_TIMEOUT_MS)
    console.log('Frontend is ready')

    console.log('All services are ready for E2E tests')
  } catch (error) {
    console.error('Failed to start services:', error)
    throw error
  }
}

/**
 * Wait for a service to become healthy
 */
async function waitForHealth(url: string, timeout: number): Promise<void> {
  const startTime = Date.now()
  const checkInterval = 1000

  while (Date.now() - startTime < timeout) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        return
      }
    } catch {
      // Service not ready yet, continue waiting
    }

    await new Promise((resolve) => setTimeout(resolve, checkInterval))
  }

  throw new Error(`Service at ${url} did not become healthy within ${timeout}ms`)
}
