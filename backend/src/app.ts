import { Elysia } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'

export const app = new Elysia()
  .use(swagger({ path: '/swagger' }))
  .use(cors())
  .onError(({ error, code }) => {
    console.error(`[backend] Error: ${code}`, error)
    return { error: 'Internal Server Error' }
  })
  .get('/', () => ({ status: 'ok' }))

export type App = typeof app
