import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'
import { AppError } from '../../lib/errors'

const unwrapEden = vi.fn()
const signInEmail = vi.fn()
const signUpEmail = vi.fn()
const signOut = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    users: {
      me: {
        get: () => Promise.resolve({ data: null, error: null }),
      },
    },
  },
  unwrapEden: (p: unknown) => unwrapEden(p),
}))

vi.mock('../../lib/authClient', () => ({
  authClient: {
    signIn: { email: (args: unknown) => signInEmail(args) },
    signUp: { email: (args: unknown) => signUpEmail(args) },
    signOut: () => signOut(),
  },
}))

import { useCurrentUser, useLogin, useLogout, useSignup } from './hooks'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return createElement(QueryClientProvider, { client }, children)
}

describe('auth hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('useLogin throws AppError on better-auth failure', async () => {
    signInEmail.mockResolvedValue({ error: { message: 'bad creds' }, data: null })
    const { result } = renderHook(() => useLogin(), { wrapper })
    await expect(
      result.current.mutateAsync({ email: 'a@b.com', password: 'x' })
    ).rejects.toBeInstanceOf(AppError)
  })

  it('useSignup calls authClient with name fallback', async () => {
    signUpEmail.mockResolvedValue({ data: { user: { id: '1' } }, error: null })
    const { result } = renderHook(() => useSignup(), { wrapper })
    await result.current.mutateAsync({ email: 'a@b.com', password: 'password1' })
    expect(signUpEmail).toHaveBeenCalledWith(
      expect.objectContaining({ email: 'a@b.com', name: 'a' })
    )
  })

  it('useLogout clears via authClient', async () => {
    signOut.mockResolvedValue({ error: null })
    const { result } = renderHook(() => useLogout(), { wrapper })
    await result.current.mutateAsync()
    expect(signOut).toHaveBeenCalled()
  })

  it('useCurrentUser returns null when unwrap fails', async () => {
    unwrapEden.mockRejectedValue(new AppError('no', 'UNAUTHORIZED'))
    const { result } = renderHook(() => useCurrentUser(), { wrapper })
    await waitFor(() => expect(result.current.isFetched).toBe(true))
    expect(result.current.data).toBeNull()
  })

  it('useCurrentUser returns profile when unwrap succeeds', async () => {
    const user = {
      id: '1',
      email: 'a@b.com',
      name: 'A',
      role: 'client' as const,
      emailVerified: true,
      image: null,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }
    unwrapEden.mockResolvedValue(user)
    const { result } = renderHook(() => useCurrentUser(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data).toEqual(user)
  })
})
