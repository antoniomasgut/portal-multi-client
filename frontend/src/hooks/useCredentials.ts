'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

export interface CredentialEntry {
  id:        string
  service:   string
  key:       string
  updatedAt: string
}

export function useCredentials(clientId: string) {
  return useQuery<CredentialEntry[]>({
    queryKey: ['credentials', clientId],
    queryFn:  async () => {
      const res = await api.get(`/api/clients/${clientId}/credentials`)
      return res.data.data
    },
    enabled: !!clientId,
  })
}

export function useSetCredential(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { service: string; key: string; value: string }) =>
      api.post(`/api/clients/${clientId}/credentials`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credentials', clientId] }),
  })
}

export function useDeleteCredential(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (credId: string) =>
      api.delete(`/api/clients/${clientId}/credentials/${credId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['credentials', clientId] }),
  })
}
