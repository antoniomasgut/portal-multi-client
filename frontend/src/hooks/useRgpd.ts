'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

export type ConsentType =
  | 'COOKIES_NECESSARY'
  | 'COOKIES_ANALYTICS'
  | 'COOKIES_MARKETING'
  | 'DATA_PROCESSING'
  | 'COMMUNICATIONS'

export interface ConsentLog {
  id:        string
  type:      ConsentType
  granted:   boolean
  grantedAt: string
  revokedAt: string | null
}

export interface DataExportRequest {
  id:          string
  status:      'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
  gcsPath:     string | null
  requestedAt: string
  completedAt: string | null
  error:       string | null
}

export function useConsents(clientId: string) {
  return useQuery<ConsentLog[]>({
    queryKey: ['consents', clientId],
    queryFn:  async () => {
      const res = await api.get(`/api/clients/${clientId}/consent`)
      return res.data.data
    },
  })
}

export function useLogConsent(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ type, granted }: { type: ConsentType; granted: boolean }) =>
      api.post(`/api/clients/${clientId}/consent`, { type, granted }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['consents', clientId] }),
  })
}

export function useDataExports(clientId: string) {
  return useQuery<DataExportRequest[]>({
    queryKey: ['data-exports', clientId],
    queryFn:  async () => {
      const res = await api.get(`/api/clients/${clientId}/data-export`)
      return res.data.data
    },
  })
}

export function useRequestExport(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () =>
      api.post(`/api/clients/${clientId}/data-export`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['data-exports', clientId] }),
  })
}

export function useDownloadExport(clientId: string) {
  return useMutation({
    mutationFn: (exportId: string) =>
      api.get(`/api/clients/${clientId}/data-export/${exportId}/download`).then(r => r.data.data.url as string),
  })
}
