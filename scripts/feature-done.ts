#!/usr/bin/env bun
/**
 * Per-slice Definition of Done for AI agents.
 *
 *   bun run feature:done notifications
 *   bun run feature:done billing
 *
 * Special case: domain "users" maps FE feature "auth" + contract "user".
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { $ } from 'bun'

const root = join(import.meta.dir, '..')
const name = process.argv[2]?.trim().toLowerCase()

if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: bun run feature:done <name>')
  process.exit(1)
}

const PLATFORM = new Set(['health'])
if (PLATFORM.has(name)) {
  console.error(`"${name}" is a platform module, not a product slice.`)
  process.exit(1)
}

/** users domain uses auth FE + user contract; notifications → notification.ts */
const isUsers = name === 'users' || name === 'auth'
const moduleName = isUsers ? 'users' : name
const featureName = isUsers ? 'auth' : name
const contractAliases: Record<string, string> = {
  users: 'user',
  auth: 'user',
  notifications: 'notification',
}
const contractBase =
  contractAliases[name] ?? contractAliases[moduleName] ?? name.replaceAll('-', '')
const camel = name
  .split('-')
  .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
  .join('')
  .replace(/^[A-Z]/, (c) => c.toLowerCase())
const i18nKey = isUsers
  ? 'auth'
  : camel.includes('-')
    ? name.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    : name.replaceAll('-', '')

const failures: string[] = []

function ok(label: string, pass: boolean, detail = '') {
  if (pass) console.log(`✅ ${label}${detail ? ` — ${detail}` : ''}`)
  else {
    console.error(`❌ ${label}${detail ? ` — ${detail}` : ''}`)
    failures.push(label)
  }
}

function fileExists(rel: string) {
  return existsSync(join(root, rel))
}

// Paths
ok(
  'backend module',
  fileExists(`backend/modules/${moduleName}/index.ts`),
  `backend/modules/${moduleName}/`
)
ok(
  'backend routes',
  fileExists(`backend/modules/${moduleName}/routes`) ||
    readdirSync(join(root, 'backend/modules', moduleName), { withFileTypes: true }).some(
      (d) => d.isDirectory() && d.name === 'routes'
    )
)
ok('frontend feature barrel', fileExists(`frontend/src/features/${featureName}/index.ts`))
ok('contract schema', fileExists(`shared/contract/src/${contractBase}.ts`))
ok('contract test', fileExists(`shared/contract/src/${contractBase}.test.ts`))

// Test files required per slice (agent DoD)
const routesDir = join(root, 'backend/modules', moduleName, 'routes')
const hasRouteTest =
  existsSync(routesDir) &&
  readdirSync(routesDir).some((f) => f.endsWith('.test.ts') || f.endsWith('.routes.test.ts'))
ok('backend route unit test', hasRouteTest, `${moduleName}/routes/*.test.ts`)

const servicesDir = join(root, 'backend/modules', moduleName, 'services')
if (existsSync(servicesDir)) {
  const serviceFiles = readdirSync(servicesDir).filter(
    (f) => f.endsWith('.service.ts') && !f.endsWith('.test.ts')
  )
  const hasServiceTest =
    serviceFiles.length === 0 ||
    readdirSync(servicesDir).some((f) => f.endsWith('.service.test.ts') || f.endsWith('.test.ts'))
  ok('backend service unit test', hasServiceTest, `${moduleName}/services/*.test.ts`)
}

const feHooks = `frontend/src/features/${featureName}/hooks.ts`
const feHooksTest = `frontend/src/features/${featureName}/hooks.test.ts`
if (fileExists(feHooks)) {
  ok('frontend hooks unit test', fileExists(feHooksTest), feHooksTest)
}

const appTs = readFileSync(join(root, 'backend/src/app.ts'), 'utf8')
ok(
  'wired in backend/src/app.ts',
  appTs.includes(`modules/${moduleName}`) ||
    appTs.includes(`${moduleName}Module`) ||
    (moduleName === 'users' && appTs.includes('usersModule'))
)

const appTsx = readFileSync(join(root, 'frontend/src/App.tsx'), 'utf8')
ok(
  'wired in frontend/src/App.tsx',
  appTsx.includes(`features/${featureName}`) ||
    appTsx.includes(`/${featureName}`) ||
    (featureName === 'auth' && (appTsx.includes('/login') || appTsx.includes('LoginForm')))
)

// i18n namespace present in all 3 locales
for (const locale of ['en.json', 'pt-BR.json', 'es.json']) {
  const path = join(root, 'frontend/src/i18n/locales', locale)
  const json = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
  const key =
    featureName === 'auth'
      ? 'auth'
      : featureName.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
  const present =
    json[key] != null ||
    json[featureName] != null ||
    json[name] != null ||
    json[i18nKey] != null ||
    (featureName === 'notifications' && json.notifications != null)
  ok(`i18n ${locale} namespace`, present, key)
}

// Full locale tree parity (en is source of truth)
{
  const parity = await $`bun run scripts/i18n-parity.ts`.nothrow()
  ok('i18n en|pt-BR|es key parity', parity.exitCode === 0)
}

// Prefer MySQL schema for non-notifications product modules unless models exist intentionally
const hasSchema = existsSync(join(root, 'backend/modules', moduleName, 'schema'))
const hasModels = existsSync(join(root, 'backend/modules', moduleName, 'models'))
if (moduleName !== 'notifications' && moduleName !== 'users') {
  ok('storage default (schema/ MySQL or documented models/)', hasSchema || hasModels)
}

// Canonical E2E = Playwright only
const playwrightSpec =
  featureName === 'auth'
    ? 'e2e/playwright/tests/auth.spec.ts'
    : `e2e/playwright/tests/${name}.spec.ts`
ok('playwright e2e spec', fileExists(playwrightSpec), playwrightSpec)

if (failures.length > 0) {
  console.error(`\n❌ feature:done ${name} — ${failures.length} check(s) failed`)
  console.error('Fix structure, then re-run. See AGENTS.md Definition of Done.')
  process.exit(1)
}

console.log(`\n▸ structural checks passed for "${name}", running feature:check…`)
const check = await $`bun run scripts/feature-check.ts`.nothrow()
if (check.exitCode !== 0) {
  process.exit(check.exitCode ?? 1)
}

console.log(`\n✅ feature:done ${name} — slice is complete`)
