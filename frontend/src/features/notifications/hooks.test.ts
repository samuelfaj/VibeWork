import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { createElement, type ReactNode } from 'react'

const unwrapEden = vi.fn()
const getList = vi.fn()
const postCreate = vi.fn()
const patchRead = vi.fn()

vi.mock('../../lib/api', () => ({
  api: {
    notifications: Object.assign(
      (params: { id: string }) => ({
        read: { patch: () => patchRead(params.id) },
      }),
      {
        get: (args: unknown) => getList(args),
        post: (body: unknown) => postCreate(body),
      }
    ),
  },
  unwrapEden: (p: unknown) => unwrapEden(p),
}))

import { useCreateNotification, useMarkNotificationRead, useNotifications } from './hooks'

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return createElement(QueryClientProvider, { client }, children)
}

describe('notifications hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('useNotifications unwraps list payload', async () => {
    const payload = {
      data: [
        {
          id: '1',
          userId: 'u1',
          type: 'in-app' as const,
          message: 'hi',
          read: false,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
      total: 1,
      page: 1,
      limit: 50,
    }
    unwrapEden.mockResolvedValue(payload)
    getList.mockReturnValue(Promise.resolve({ data: payload, error: null }))

    const { result } = renderHook(() => useNotifications(), { wrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.data?.total).toBe(1)
    expect(unwrapEden).toHaveBeenCalled()
  })

  it('useCreateNotification posts body via unwrapEden', async () => {
    const created = {
      id: 'n1',
      userId: 'u1',
      type: 'in-app' as const,
      message: 'x',
      read: false,
      createdAt: '2024-01-01T00:00:00.000Z',
    }
    unwrapEden.mockResolvedValue(created)
    postCreate.mockReturnValue(Promise.resolve({ data: created, error: null }))

    const { result } = renderHook(() => useCreateNotification(), { wrapper })
    await result.current.mutateAsync({
      userId: 'u1',
      message: 'x',
      type: 'in-app',
    })
    expect(postCreate).toHaveBeenCalledWith({
      userId: 'u1',
      message: 'x',
      type: 'in-app',
    })
  })

  it('useMarkNotificationRead patches by id', async () => {
    const updated = {
      id: 'n1',
      userId: 'u1',
      type: 'in-app' as const,
      message: 'x',
      read: true,
      createdAt: '2024-01-01T00:00:00.000Z',
    }
    unwrapEden.mockResolvedValue(updated)
    patchRead.mockReturnValue(Promise.resolve({ data: updated, error: null }))

    const { result } = renderHook(() => useMarkNotificationRead(), { wrapper })
    await result.current.mutateAsync('n1')
    expect(patchRead).toHaveBeenCalledWith('n1')
  })
})
