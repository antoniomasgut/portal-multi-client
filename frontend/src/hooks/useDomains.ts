'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

export interface ClientDomain {
  id:           string
  clientId:     string
  domain:       string
  status:       'PENDING' | 'VERIFIED' | 'FAILED'
  dnsToken:     string
  verifiedAt:   string | null
  lastChecked:  string | null
  errorMessage: string | null
  createdAt:    string
}

export interface DomainInstructions {
  cname: { type: string; host: string; value: string; desc: string }
  txt:   { type: string; host: string; value: string; desc: string }
}

export function useClientDomains(clientId: string) {
  return useQuery<ClientDomain[]>({
    queryKey: ['domains', clientId],
    queryFn:  async () => {
      const res = await api.get(`/api/clients/${clientId}/domains`)
      return res.data.data
    },
    enabled: !!clientId,
  })
}

export function useAddDomain(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (domain: string) =>
      api.post(`/api/clients/${clientId}/domains`, { domain }).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains', clientId] }),
  })
}

export function useVerifyDomain(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (domainId: string) =>
      api.post(`/api/clients/${clientId}/domains/${domainId}/verify`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains', clientId] }),
  })
}

export function useRemoveDomain(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (domainId: string) =>
      api.delete(`/api/clients/${clientId}/domains/${domainId}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains', clientId] }),
  })
}

export function useDomainInstructions(clientId: string, domainId: string | null) {
  return useQuery<DomainInstructions>({
    queryKey: ['domain-instructions', domainId],
    queryFn:  async () => {
      const res = await api.get(`/api/clients/${clientId}/domains/${domainId}/instructions`)
      return res.data.data
    },
    enabled: !!domainId,
  })
}
