'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import type { Client, Plan } from '../types'

type PlanPayload =
  | { planId: string; extraServiceIds?: string[]; customPriceMonthly?: number }
  | { isCustom: true; serviceIds: string[]; customPriceMonthly: number }
  | {}

// ── Plans ────────────────────────────────────────────────────────────────

export function usePlans(params: { search?: string; sortBy?: string; sortDir?: 'asc' | 'desc' } = {}) {
  return useQuery<Plan[]>({
    queryKey: ['plans', params],
    queryFn:  async () => {
      const res = await api.get('/api/plans', { params })
      return res.data.data
    },
  })
}

export function useCreatePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Plan>) => api.post('/api/plans', data).then(r => r.data.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['plans'] }),
  })
}

export function useUpdatePlan(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Plan>) => api.patch(`/api/plans/${id}`, data).then(r => r.data.data),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: ['plans'] })
    },
  })
}

export function useDeletePlan() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/plans/${id}`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['plans'] }),
  })
}

// ── Clients ──────────────────────────────────────────────────────────────

export function useClients(params: { search?: string; sortBy?: string; sortDir?: 'asc' | 'desc' } = {}) {
  return useQuery<Client[]>({
    queryKey: ['clients', params],
    queryFn:  async () => {
      const res = await api.get('/api/clients', { params })
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

export function useImpersonateClient() {
  return useMutation({
    mutationFn: (id: string) => api.post(`/api/clients/${id}/impersonate`).then(r => r.data.data),
  })
}
