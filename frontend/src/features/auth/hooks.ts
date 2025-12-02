import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '../../lib/api'

interface AuthCredentials {
  email: string
  password: string
}

interface User {
  id: string
  email: string
}

// Type-safe API client will be available once backend exports App type
// For now, use dynamic access with type assertions
const typedApi = api as unknown as {
  signup: {
    post: (body: AuthCredentials) => Promise<{ data?: unknown; error?: { value: unknown } }>
  }
  login: {
    post: (body: AuthCredentials) => Promise<{ data?: unknown; error?: { value: unknown } }>
  }
  users: { me: { get: () => Promise<{ data?: unknown; error?: { value: unknown } }> } }
}

export function useSignup() {
  return useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      const response = await typedApi.signup.post(credentials)
      if (response.error) {
        throw new Error(response.error.value as string)
      }
      return response.data
    },
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      const response = await typedApi.login.post(credentials)
      if (response.error) {
        throw new Error(response.error.value as string)
      }
      return response.data
    },
  })
}

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await typedApi.users.me.get()
      if (response.error) {
        return null
      }
      return response.data as User
    },
    retry: false,
  })
}
