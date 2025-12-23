import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authRequest } from '../../lib/authClient'

interface AuthCredentials {
  email: string
  password: string
  name?: string
}

interface User {
  id: string
  email: string
  name: string
  emailVerified: boolean
  image: string | null
  createdAt: string
  updatedAt: string
}

interface AuthResponse {
  token: string
  user: User
}

interface SessionResponse {
  user: User | null
}

export function useSignup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: AuthCredentials): Promise<AuthResponse> => {
      const namePart = credentials.email.split('@')[0]
      return authRequest<AuthResponse>('/api/auth/sign-up/email', {
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password,
          name: credentials.name ?? namePart,
        },
      })
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: AuthCredentials): Promise<AuthResponse> =>
      authRequest<AuthResponse>('/api/auth/sign-in/email', {
        method: 'POST',
        body: {
          email: credentials.email,
          password: credentials.password,
        },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        const data = await authRequest<SessionResponse>('/api/auth/get-session')
        return data.user ?? null
      } catch {
        return null
      }
    },
    retry: false,
  })
}
