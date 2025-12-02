import { Elysia } from 'elysia'

interface RequestOptions {
  headers?: Record<string, string>
}

interface TestClient {
  get(path: string, options?: RequestOptions): Promise<Response>
  post(path: string, body: unknown, options?: RequestOptions): Promise<Response>
  patch(path: string, body: unknown, options?: RequestOptions): Promise<Response>
  delete(path: string, options?: RequestOptions): Promise<Response>
}

/**
 * Create a test client bound to an Elysia app instance
 * Allows making HTTP requests without starting a real server
 */
export function createTestClient(app: Elysia): TestClient {
  const baseHeaders = {
    'Content-Type': 'application/json',
  }

  return {
    async get(path: string, options?: RequestOptions): Promise<Response> {
      const request = new Request(`http://localhost${path}`, {
        method: 'GET',
        headers: { ...baseHeaders, ...options?.headers },
      })
      return app.handle(request)
    },

    async post(path: string, body: unknown, options?: RequestOptions): Promise<Response> {
      const request = new Request(`http://localhost${path}`, {
        method: 'POST',
        headers: { ...baseHeaders, ...options?.headers },
        body: JSON.stringify(body),
      })
      return app.handle(request)
    },

    async patch(path: string, body: unknown, options?: RequestOptions): Promise<Response> {
      const request = new Request(`http://localhost${path}`, {
        method: 'PATCH',
        headers: { ...baseHeaders, ...options?.headers },
        body: JSON.stringify(body),
      })
      return app.handle(request)
    },

    async delete(path: string, options?: RequestOptions): Promise<Response> {
      const request = new Request(`http://localhost${path}`, {
        method: 'DELETE',
        headers: { ...baseHeaders, ...options?.headers },
      })
      return app.handle(request)
    },
  }
}
