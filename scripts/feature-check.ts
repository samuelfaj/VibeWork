#!/usr/bin/env bun
/**
 * Binary gate for agents: banlist + i18n + types + unit (BE+FE+contract) + coverage.
 */
import { $ } from 'bun'

async function run(label: string, cmd: string[]) {
  console.log(`\n▸ ${label}`)
  const result = await $`${cmd}`
  if (result.exitCode !== 0) {
    console.error(`Failed: ${label}`)
    process.exit(result.exitCode ?? 1)
  }
}

await run('banlist', ['bun', 'run', 'scripts/banlist.ts'])
await run('i18n parity', ['bun', 'run', 'scripts/i18n-parity.ts'])
await run('generate FEATURE_MAP', ['bun', 'run', 'scripts/generate-feature-map.ts'])
await run('contract build', ['bun', 'run', '--filter', '@vibe-code/contract', 'build'])
await run('backend build:types', ['bun', 'run', '--filter', '@vibework/backend', 'build:types'])
await run('contract typecheck', ['bun', 'run', '--filter', '@vibe-code/contract', 'typecheck'])
await run('backend typecheck', ['bun', 'run', '--filter', '@vibework/backend', 'typecheck'])
await run('frontend typecheck', ['bun', 'run', '--filter', '@vibe/frontend', 'typecheck'])
await run('contract test', ['bun', 'run', '--filter', '@vibe-code/contract', 'test'])
await run('backend test', ['bun', 'run', '--filter', '@vibework/backend', 'test'])
await run('frontend test', ['bun', 'run', '--filter', '@vibe/frontend', 'test'])
await run('backend coverage thresholds', [
  'bun',
  'run',
  '--filter',
  '@vibework/backend',
  'test:coverage',
])

console.log('\n✅ feature:check passed')
