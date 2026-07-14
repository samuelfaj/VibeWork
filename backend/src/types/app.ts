/**
 * Stable re-export of the Elysia App type for Eden Treaty consumers.
 * Prefer: `import type { App } from '@vibework/backend/app'`
 *
 * Frontend should only import this type (import type) — never runtime backend code.
 */
export type { App } from '../app'
export { createApp } from '../app'
