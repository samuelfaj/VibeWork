import { treaty } from '@elysiajs/eden'
import type { Elysia } from 'elysia'

// App type will be exported from backend once implemented
// For now, use generic Elysia type for treaty client setup
type App = Elysia

const DEFAULT_API_URL = 'http://localhost:3000'
const baseUrl = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL
export const api = treaty<App>(baseUrl)
