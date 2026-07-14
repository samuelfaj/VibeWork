import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Notification, NotificationListResponse } from '@vibe-code/contract'
import { api, unwrapEden } from '../../lib/api'

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async (): Promise<NotificationListResponse> =>
      unwrapEden(
        api.notifications.get({
          query: { page: '1', limit: '50' },
        })
      ),
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<Notification> =>
      unwrapEden(api.notifications({ id }).read.patch()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useCreateNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      userId: string
      message: string
      type: 'in-app' | 'email'
    }): Promise<Notification> => unwrapEden(api.notifications.post(input)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
