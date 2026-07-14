import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { UserResponse } from '@vibe-code/contract'
import { api, unwrapEden } from '../../lib/api'
import { authClient } from '../../lib/authClient'
import { AppError, toAppError } from '../../lib/errors'

interface AuthCredentials {
  email: string
  password: string
  name?: string
}

/**
 * Auth domain hooks.
 * Better-Auth = session transport; profile = Eden GET /users/me.
 */
export function useSignup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      const namePart = credentials.email.split('@')[0]
      const result = await authClient.signUp.email({
        email: credentials.email,
        password: credentials.password,
        name: credentials.name ?? namePart ?? 'User',
      })
      if (result.error) {
        throw new AppError(result.error.message ?? 'Signup failed', 'SIGNUP_FAILED')
      }
      return result.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      void queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials: AuthCredentials) => {
      const result = await authClient.signIn.email({
        email: credentials.email,
        password: credentials.password,
      })
      if (result.error) {
        throw new AppError(result.error.message ?? 'Login failed', 'LOGIN_FAILED')
      }
      return result.data
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['currentUser'] })
      void queryClient.invalidateQueries({ queryKey: ['session'] })
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const result = await authClient.signOut()
      if (result.error) {
        throw toAppError(result.error, 'Logout failed')
      }
    },
    onSuccess: () => {
      queryClient.clear()
    },
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async (): Promise<UserResponse | null> => {
      try {
        return await unwrapEden(api.users.me.get())
      } catch {
        return null
      }
    },
    retry: false,
  })
}
