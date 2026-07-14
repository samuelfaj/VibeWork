#!/usr/bin/env bun
/**
 * Scaffold a product feature (vertical slice) for AI agents.
 *
 *   bun run slice:new <name>
 *   bun run slice:new billing
 *
 * ALWAYS:
 *   - contract + tests
 *   - backend module (MySQL schema — only store)
 *   - frontend feature
 *   - i18n en/pt-BR/es
 *   - e2e stub
 *   - wire backend/src/app.ts + frontend/src/App.tsx
 *
 * Platform modules (health, infra) are NOT created here.
 * No Mongo / Redis / Pub/Sub / controllers.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dir, '..')
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const name = args[0]?.trim().toLowerCase()

const PLATFORM = new Set(['health', 'infra', 'auth', 'users'])

if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: bun run slice:new <name>')
  console.error('  name: kebab-case product domain, e.g. billing, projects')
  process.exit(1)
}

if (PLATFORM.has(name)) {
  console.error(`"${name}" is reserved (platform or existing core domain). Pick another name.`)
  process.exit(1)
}

const pascal = name
  .split('-')
  .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
  .join('')
const camel = pascal.charAt(0).toLowerCase() + pascal.slice(1)
const constant = name.replaceAll('-', '_').toUpperCase()
const contractKey = name.replaceAll('-', '')

function write(path: string, content: string, force = false) {
  if (existsSync(path) && !force) {
    console.log(`skip (exists): ${path}`)
    return false
  }
  mkdirSync(join(path, '..'), { recursive: true })
  writeFileSync(path, content)
  console.log(`created: ${path}`)
  return true
}

function patchFile(path: string, transform: (src: string) => string | null) {
  const src = readFileSync(path, 'utf8')
  const next = transform(src)
  if (next == null || next === src) {
    console.log(`skip wire-up (already present or no change): ${path}`)
    return
  }
  writeFileSync(path, next)
  console.log(`wired: ${path}`)
}

// ─── Contract ───────────────────────────────────────────────────────────────
write(
  join(root, 'shared/contract/src', `${contractKey}.ts`),
  `import { t } from 'elysia'
import type { Static } from 'elysia'

/** SLOT: schemas — source of truth for BE validation + FE types. */
export const Create${pascal}Schema = t.Object({
  name: t.String({ minLength: 1 }),
})

export const ${pascal}Schema = t.Object({
  id: t.String(),
  name: t.String(),
  createdAt: t.String(),
})

export const ${pascal}ListResponseSchema = t.Object({
  data: t.Array(${pascal}Schema),
  total: t.Number(),
})

export type Create${pascal}Input = Static<typeof Create${pascal}Schema>
export type ${pascal} = Static<typeof ${pascal}Schema>
export type ${pascal}ListResponse = Static<typeof ${pascal}ListResponseSchema>
`
)

write(
  join(root, 'shared/contract/src', `${contractKey}.test.ts`),
  `import { Value } from '@sinclair/typebox/value'
import { describe, it, expect } from 'vitest'
import { Create${pascal}Schema, ${pascal}Schema } from './${contractKey}'

describe('${pascal} schemas', () => {
  it('validates create input', () => {
    expect(Value.Check(Create${pascal}Schema, { name: 'example' })).toBe(true)
  })

  it('validates entity', () => {
    expect(
      Value.Check(${pascal}Schema, {
        id: '1',
        name: 'example',
        createdAt: '2024-01-01T00:00:00.000Z',
      })
    ).toBe(true)
  })
})
`
)

const contractIndex = join(root, 'shared/contract/src/index.ts')
const indexContent = readFileSync(contractIndex, 'utf8')
const exportLine = `export * from './${contractKey}'`
if (!indexContent.includes(exportLine)) {
  writeFileSync(contractIndex, `${indexContent.trimEnd()}\n${exportLine}\n`)
  console.log(`updated: ${contractIndex}`)
}

// ─── Backend module ─────────────────────────────────────────────────────────
const modRoot = join(root, 'backend/modules', name)

write(
  join(modRoot, 'schema', `${name}.schema.ts`),
  `import { mysqlTable, varchar, timestamp } from 'drizzle-orm/mysql-core'

/** SLOT: drizzle schema — MySQL is the only store. */
export const ${camel}Table = mysqlTable('${name.replaceAll('-', '_')}', {
  id: varchar('id', { length: 36 }).primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { fsp: 3 }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { fsp: 3 })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export type ${pascal}Row = typeof ${camel}Table.$inferSelect
export type New${pascal}Row = typeof ${camel}Table.$inferInsert
`
)

write(
  join(modRoot, 'services', `${name}.service.ts`),
  `import type { Create${pascal}Input, ${pascal} } from '@vibe-code/contract'

/**
 * SLOT: service — business rules only (no HTTP, no Elysia Context).
 * PATTERN: module object (export const XService = { methods }).
 * DO-NOT-TOUCH: no class, no static methods, no \`new\`, no controllers.
 * Golden: NotificationService / UserService.
 */
export const ${pascal}Service = {
  async list(): Promise<${pascal}[]> {
    // TODO: load from schema (Drizzle)
    return []
  },

  async create(input: Create${pascal}Input): Promise<${pascal}> {
    // TODO: persist with Drizzle
    return {
      id: crypto.randomUUID(),
      name: input.name,
      createdAt: new Date().toISOString(),
    }
  },
}
`
)

write(
  join(modRoot, 'services', `${name}.service.test.ts`),
  `import { describe, it, expect } from 'vitest'
import { ${pascal}Service } from './${name}.service'

describe('${pascal}Service', () => {
  it('create returns entity with name', async () => {
    const item = await ${pascal}Service.create({ name: 'example' })
    expect(item.name).toBe('example')
    expect(item.id).toBeTruthy()
  })

  it('list returns an array', async () => {
    const list = await ${pascal}Service.list()
    expect(Array.isArray(list)).toBe(true)
  })
})
`
)

write(
  join(modRoot, 'routes', `${name}.routes.ts`),
  `import {
  Create${pascal}Schema,
  ${pascal}Schema,
  ${pascal}ListResponseSchema,
  ErrorBodySchema,
} from '@vibe-code/contract'
import { Elysia } from 'elysia'
import { requireAuth } from '../../../src/infra/auth-guard'
import { ${pascal}Service } from '../services/${name}.service'

/** DO-NOT-TOUCH: requireAuth — user is non-null. Routes call service directly. */
export const ${camel}Routes = new Elysia({ prefix: '/${name}' })
  .use(requireAuth)
  .get(
    '/',
    async () => {
      const data = await ${pascal}Service.list()
      return { data, total: data.length }
    },
    {
      response: {
        200: ${pascal}ListResponseSchema,
        401: ErrorBodySchema,
      },
    }
  )
  .post(
    '/',
    async ({ body, set }) => {
      const item = await ${pascal}Service.create(body)
      set.status = 201
      return item
    },
    {
      body: Create${pascal}Schema,
      response: {
        201: ${pascal}Schema,
        401: ErrorBodySchema,
      },
    }
  )
`
)

write(
  join(modRoot, 'routes', `${name}.routes.test.ts`),
  `import { Elysia } from 'elysia'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const authUser = {
  id: 'user-1',
  email: 'u@example.com',
  name: 'User',
  role: 'client' as const,
  emailVerified: true,
  image: null,
}

vi.mock('../../../src/infra/auth-guard', () => ({
  requireAuth: new Elysia({ name: 'mock-require-auth' })
    .resolve(() => ({ user: authUser }))
    .as('scoped'),
}))

vi.mock('../services/${name}.service', () => ({
  ${pascal}Service: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({
      id: '1',
      name: 'example',
      createdAt: '2024-01-01T00:00:00.000Z',
    }),
  },
}))

describe('${pascal} routes', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let app: any

  beforeEach(async () => {
    vi.clearAllMocks()
    const { ${camel}Routes } = await import('./${name}.routes')
    app = new Elysia().use(${camel}Routes)
  })

  it('GET /${name} returns list for authenticated user', async () => {
    const response = await app.handle(new Request('http://localhost/${name}'))
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ data: [], total: 0 })
  })
})
`
)

write(
  join(modRoot, 'index.ts'),
  `import { Elysia } from 'elysia'
import { ${camel}Routes } from './routes/${name}.routes'

/** Public module surface — other modules import only from here. */
export const ${camel}Module = new Elysia().use(${camel}Routes)

export { ${pascal}Service } from './services/${name}.service'
`
)

// ─── Frontend ───────────────────────────────────────────────────────────────
const feRoot = join(root, 'frontend/src/features', name)

write(
  join(feRoot, 'hooks.ts'),
  `import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Create${pascal}Input, ${pascal}ListResponse } from '@vibe-code/contract'
import { api, unwrapEden } from '../../lib/api'

/** SLOT: hooks — Eden + unwrapEden only (no fetch, no authClient). */
export function use${pascal}List() {
  return useQuery({
    queryKey: ['${name}'],
    queryFn: async (): Promise<${pascal}ListResponse> => {
      // After app.ts wire-up + build:types, prefer:
      // return unwrapEden(api.${camel}.get())
      void api
      void unwrapEden
      return { data: [], total: 0 }
    },
  })
}

export function useCreate${pascal}() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (input: Create${pascal}Input) => {
      void input
      // return unwrapEden(api.${camel}.post(input))
      throw new Error('Wire Eden path after build:types — see AGENTS.md')
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['${name}'] })
    },
  })
}
`
)

write(
  join(feRoot, 'hooks.test.ts'),
  `import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'

const unwrapEden = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {},
  unwrapEden: (p: unknown) => unwrapEden(p),
}))

import { use${pascal}List } from './hooks'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return createElement(QueryClientProvider, { client }, children)
}

describe('${pascal} hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('use${pascal}List returns list shape', async () => {
    // Scaffold returns empty list until Eden is wired
    const { result } = renderHook(() => use${pascal}List(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual({ data: [], total: 0 })
  })
})
`
)

write(
  join(feRoot, `${pascal}Page.tsx`),
  `import { Spin, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { use${pascal}List } from './hooks'

const { Title, Text } = Typography

/** SLOT: page UI */
export function ${pascal}Page() {
  const { t } = useTranslation()
  const { data, isLoading, isError } = use${pascal}List()

  if (isLoading) return <Spin />
  if (isError) return <Text type="danger">{t('${camel}.loadError')}</Text>

  return (
    <div>
      <Title level={3}>{t('${camel}.title')}</Title>
      <Text type="secondary">{t('${camel}.empty')} ({data?.total ?? 0})</Text>
    </div>
  )
}
`
)

write(
  join(feRoot, 'index.ts'),
  `/** Public barrel — other features import only from here. */
export { ${pascal}Page } from './${pascal}Page'
export { use${pascal}List, useCreate${pascal} } from './hooks'
`
)

// i18n
function patchLocale(file: string, title: string, loadError: string, empty: string) {
  const path = join(root, 'frontend/src/i18n/locales', file)
  const json = JSON.parse(readFileSync(path, 'utf8')) as Record<string, unknown>
  if (!json[camel]) {
    json[camel] = { title, loadError, empty, create: file.startsWith('en') ? 'Create' : 'Create' }
    writeFileSync(path, `${JSON.stringify(json, null, 2)}\n`)
    console.log(`updated i18n: ${file}`)
  }
}
patchLocale('en.json', pascal, `Could not load ${name}`, `No ${name} yet`)
patchLocale('pt-BR.json', pascal, `Não foi possível carregar ${name}`, `Nenhum ${name} ainda`)
patchLocale('es.json', pascal, `No se pudo cargar ${name}`, `Aún no hay ${name}`)

// Canonical E2E = Playwright only
write(
  join(root, 'e2e/playwright/tests', `${name}.spec.ts`),
  `/**
 * Playwright E2E for ${name} — copy auth/notifications golden specs.
 * Prefer getByTestId. Stagehand was removed from this monorepo.
 */
import { test, expect } from '@playwright/test'
import { generateTestUser, signUp, expectAuthenticated } from '../fixtures/auth'

test.describe('${pascal} (golden path)', () => {
  test('authenticated user can open /${name}', async ({ page }) => {
    const user = generateTestUser()
    await signUp(page, user)
    await expectAuthenticated(page)

    await page.goto('/${name}')
    // TODO: add data-testid on ${pascal}Page and assert it here
    await expect(page).toHaveURL(/\\/${name}/)
  })
})
`
)

// ─── Wire app.ts ────────────────────────────────────────────────────────────
patchFile(join(root, 'backend/src/app.ts'), (src) => {
  if (src.includes(`${camel}Module`) || src.includes(`modules/${name}`)) return null
  let next = src
  if (!next.includes(`import { ${camel}Module }`)) {
    next = next.replace(
      `import { usersModule } from '../modules/users'\n`,
      `import { usersModule } from '../modules/users'\nimport { ${camel}Module } from '../modules/${name}'\n`
    )
  }
  if (!next.includes(`.use(${camel}Module)`)) {
    next = next.replace(
      `.use(notificationsModule)\n`,
      `.use(notificationsModule)\n    .use(${camel}Module)\n`
    )
  }
  return next
})

// ─── Wire App.tsx ───────────────────────────────────────────────────────────
patchFile(join(root, 'frontend/src/App.tsx'), (src) => {
  if (src.includes(`${pascal}Page`) || src.includes(`features/${name}`)) return null
  let next = src
  if (!next.includes(`from './features/${name}'`)) {
    next = next.replace(
      `import { NotificationsPage } from './features/notifications'\n`,
      `import { NotificationsPage } from './features/notifications'\nimport { ${pascal}Page } from './features/${name}'\n`
    )
  }
  if (!next.includes(`path="/${name}"`)) {
    next = next.replace(
      `<Route path="/notifications" element={<NotificationsPage />} />\n`,
      `<Route path="/notifications" element={<NotificationsPage />} />\n          <Route path="/${name}" element={<${pascal}Page />} />\n`
    )
  }
  return next
})

console.log(`
✅ Slice "${name}" scaffolded (MySQL schema).

Agent next steps (in order):
  1. Implement service + schema (SLOT) — module objects; routes → service (no controllers)
  2. bun run --filter @vibe-code/contract build
  3. bun run --filter @vibework/backend build:types
  4. Point FE hooks at api.${camel} via unwrapEden
  5. bun run feature:done ${name}

See AGENTS.md — golden path: notifications
`)
