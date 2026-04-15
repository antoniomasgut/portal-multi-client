'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import type { Client, Plan } from '../types'

type PlanPayload =
  | { planId: string; extraServiceIds?: string[]; customPriceMonthly?: number }
  | { isCustom: true; serviceIds: string[]; customPriceMonthly: number }
  | {}

// ── Plans ────────────────────────────────────────────────────────────────

export function usePlans() {
  return useQuery<Plan[]>({
    queryKey: ['plans'],
    queryFn:  async () => {
      const res = await api.get('/api/clients/plans')
      return res.data.data
    },
  })
}

// ── Clients ──────────────────────────────────────────────────────────────

export function useClients() {
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn:  async () => {
      const res = await api.get('/api/clients')
      return res.data.data
    },
  })
}

export function useClient(id: string) {
  return useQuery<Client>({
    queryKey: ['clients', id],
    queryFn:  async () => {
      const res = await api.get(`/api/clients/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      companyName:  string
      contactName:  string
      contactEmail: string
      contactPhone?: string
      nif?:          string
      address?:      string
      domain?:       string
      notes?:        string
    } & PlanPayload) => api.post('/api/clients', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}

export function useUpdateClient(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Omit<Client, 'id' | 'createdAt' | 'subscriptions' | '_count'>> & PlanPayload) =>
      api.patch(`/api/clients/${id}`, data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['clients', id] })
    },
  })
}

export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/clients/${id}`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['clients'] }),
  })
}
