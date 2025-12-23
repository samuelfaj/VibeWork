import { QueryClient } from '@tanstack/react-query'

const MS_PER_SECOND = 1000
const SECONDS_PER_MINUTE = 60
const STALE_TIME_MINUTES = 5
const STALE_TIME_MS = MS_PER_SECOND * SECONDS_PER_MINUTE * STALE_TIME_MINUTES

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME_MS,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
