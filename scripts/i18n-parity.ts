#!/usr/bin/env bun
/**
 * Enforce frontend locale key parity: en.json is source of truth;
 * pt-BR and es must contain the same nested key paths.
 *
 *   bun run i18n:parity
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dir, '..')
const localesDir = join(root, 'frontend/src/i18n/locales')

function flattenKeys(obj: unknown, prefix = ''): string[] {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    return prefix ? [prefix] : []
  }
  const record = obj as Record<string, unknown>
  const keys: string[] = []
  for (const [k, v] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${k}` : k
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      keys.push(...flattenKeys(v, path))
    } else {
      keys.push(path)
    }
  }
  return keys
}

function load(name: string): Record<string, unknown> {
  return JSON.parse(readFileSync(join(localesDir, name), 'utf8')) as Record<string, unknown>
}

const en = load('en.json')
const pt = load('pt-BR.json')
const es = load('es.json')

const enKeys = new Set(flattenKeys(en))
const ptKeys = new Set(flattenKeys(pt))
const esKeys = new Set(flattenKeys(es))

const missingInPt = [...enKeys].filter((k) => !ptKeys.has(k)).sort()
const missingInEs = [...enKeys].filter((k) => !esKeys.has(k)).sort()
const extraInPt = [...ptKeys].filter((k) => !enKeys.has(k)).sort()
const extraInEs = [...esKeys].filter((k) => !enKeys.has(k)).sort()

let failed = false

function report(label: string, keys: string[]) {
  if (keys.length === 0) {
    console.log(`✅ ${label}`)
    return
  }
  failed = true
  console.error(`❌ ${label} (${keys.length})`)
  for (const k of keys.slice(0, 40)) console.error(`   - ${k}`)
  if (keys.length > 40) console.error(`   … +${keys.length - 40} more`)
}

report('pt-BR has all en keys', missingInPt)
report('es has all en keys', missingInEs)
report('pt-BR has no extra keys vs en', extraInPt)
report('es has no extra keys vs en', extraInEs)

if (failed) {
  console.error('\ni18n parity failed. en.json is the source of truth.')
  process.exit(1)
}

console.log(`\ni18n parity OK (${enKeys.size} leaf keys).`)
