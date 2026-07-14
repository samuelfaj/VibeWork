#!/usr/bin/env bun
/**
 * Fail CI/agent runs when forbidden patterns appear in product code.
 * Agents copy whatever exists in the repo — ban dead patterns.
 */
import { $ } from 'bun'

const checks: { name: string; cmd: string[]; allowExit1?: boolean }[] = [
  {
    name: 'X-User-Id header auth (use session / requireAuth)',
    cmd: [
      'rg',
      '-n',
      '--glob',
      '!**/node_modules/**',
      '--glob',
      '!**/dist/**',
      '--glob',
      '!**/dist-types/**',
      '--glob',
      '!scripts/**',
      '--glob',
      '!AGENTS.md',
      '--glob',
      '!docs/**',
      '[\'"]X-User-Id[\'"]|[\'"]x-user-id[\'"]|headers\\[[\'"]x-user-id[\'"]\\]',
      'backend',
      'frontend',
    ],
  },
  {
    name: 'as never on product routes',
    cmd: [
      'rg',
      '-n',
      '--glob',
      '**/routes/**/*.ts',
      '--glob',
      '!**/*.test.ts',
      'as never',
      'backend/modules',
    ],
  },
  {
    name: 'raw fetch() in frontend features',
    cmd: ['rg', '-n', '--glob', 'frontend/src/features/**/*.{ts,tsx}', '\\bfetch\\s*\\('],
  },
  {
    name: 'authClient imported outside features/auth',
    cmd: [
      'rg',
      '-n',
      '--glob',
      'frontend/src/**/*.{ts,tsx}',
      '--glob',
      '!frontend/src/features/auth/**',
      '--glob',
      '!frontend/src/lib/authClient.ts',
      'from [\'"].*authClient|from [\'"]@/lib/authClient',
    ],
  },
  {
    name: 'better-auth imported outside auth surface',
    cmd: [
      'rg',
      '-n',
      '--glob',
      'frontend/src/**/*.{ts,tsx}',
      '--glob',
      '!frontend/src/lib/authClient.ts',
      '--glob',
      '!frontend/src/features/auth/**',
      'from [\'"]better-auth',
    ],
  },
  {
    name: 'orphan lead/whatsapp scaffolding',
    cmd: [
      'rg',
      '-n',
      '--glob',
      '!**/node_modules/**',
      '--glob',
      '!**/dist/**',
      '--glob',
      '!scripts/**',
      '--glob',
      '!docs/**',
      'send-whatsapp-message|modules/leads|FollowUpHandler',
      'backend',
    ],
  },
  {
    // Domain services must be module objects, not static classes.
    // Allowed classes: Error subclasses, lifecycle workers (*Subscriber), email adapters (*EmailService).
    name: 'static domain service class (use module object export const XService = {…})',
    cmd: [
      'rg',
      '-n',
      '--glob',
      'backend/modules/**/services/**/*.ts',
      '--glob',
      '!**/*.test.ts',
      '--glob',
      '!**/*email*.ts',
      '--glob',
      '!**/*subscriber*.ts',
      'export\\s+class\\s+\\w+Service\\b',
    ],
  },
]

let failed = false

for (const check of checks) {
  const result = await $`${check.cmd}`.nothrow().quiet()
  // rg exit 0 = matches found (bad); exit 1 = no matches (good)
  if (result.exitCode === 0) {
    failed = true
    console.error(`\n❌ BANLIST: ${check.name}`)
    console.error(result.stdout.toString() || result.stderr.toString())
  } else {
    console.log(`✅ ${check.name}`)
  }
}

if (failed) {
  console.error('\nBanlist failed. Fix matches or update scripts/banlist.ts intentionally.')
  process.exit(1)
}

console.log('\nBanlist passed.')
