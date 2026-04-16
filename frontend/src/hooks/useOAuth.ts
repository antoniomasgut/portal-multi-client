'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

export function useConnectionStatus(clientId: string) {
  return useQuery<Record<string, boolean>>({
    queryKey: ['oauth-status', clientId],
    queryFn:  async () => {
      const res = await api.get(`/api/oauth/status/${clientId}`)
      return res.data.data
    },
    enabled: !!clientId,
  })
}

export function useStartOAuth(clientId: string) {
  return useMutation({
    mutationFn: async (provider: string) => {
      const res = await api.post(`/api/oauth/${provider}/start`, { clientId })
      return res.data.data as { url: string }
    },
    onSuccess: ({ url }) => {
      window.open(url, '_blank', 'width=600,height=700')
    },
  })
}

export function useDisconnectOAuth(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (provider: string) =>
      api.delete(`/api/oauth/${provider}/disconnect/${clientId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['oauth-status', clientId] })
      qc.invalidateQueries({ queryKey: ['credentials', clientId] })
    },
  })
}
