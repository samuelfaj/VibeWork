import { treaty } from '@elysiajs/eden'
import i18n from '../i18n'

const DEFAULT_API_URL = 'http://localhost:3000'
const baseUrl = import.meta.env.VITE_API_URL ?? DEFAULT_API_URL

// App type will be exported from backend once implemented
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const api = treaty<any>(baseUrl, {
  headers: () => ({
    'Accept-Language': i18n.language ?? 'pt-BR',
  }),
})
