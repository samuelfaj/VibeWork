import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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

export function useSignup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: AuthCredentials): Promise<AuthResponse> => {
      const response = await fetch(`${API_BASE}/api/auth/sign-up/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
          name: credentials.name || credentials.email.split('@')[0],
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Signup failed')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: AuthCredentials): Promise<AuthResponse> => {
      const response = await fetch(`${API_BASE}/api/auth/sign-in/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password,
        }),
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Login failed')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] })
    },
  })
}

export function useCurrentUser() {
  return useQuery<User | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/auth/get-session`, {
        credentials: 'include',
      })

      if (!response.ok) {
        return null
      }

      const data = await response.json()
      return data.user || null
    },
    retry: false,
  })
}
