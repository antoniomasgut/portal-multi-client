import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

// ── Polítiques de descompte ──────────────────────────────────────────────
export function useDiscountPolicies() {
  return useQuery({
    queryKey: ['discount-policies'],
    queryFn:  () => api.get('/api/settings/discount-policies').then(r => r.data.data),
  })
}

export function useUpdateDiscountPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; [k: string]: any }) =>
      api.put(`/api/settings/discount-policies/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discount-policies'] }),
  })
}

export function useToggleDiscountPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.patch(`/api/settings/discount-policies/${id}/toggle`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['discount-policies'] }),
  })
}

export function useApplyManualDiscount(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { percentage?: number; monthsFree?: number; expiresAt?: string; reason?: string }) =>
      api.post(`/api/settings/discount-policies/${clientId}/manual`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['client-discounts', clientId] }),
  })
}

export function useClientDiscounts(clientId: string) {
  return useQuery({
    queryKey: ['client-discounts', clientId],
    queryFn:  () => api.get(`/api/settings/clients/${clientId}/discounts`).then(r => r.data.data),
    enabled:  !!clientId,
  })
}

// ── Política de preus ────────────────────────────────────────────────────
export function usePricingPolicy() {
  return useQuery({
    queryKey: ['pricing-policy'],
    queryFn:  () => api.get('/api/settings/pricing-policy').then(r => r.data.data),
  })
}

export function useUpdatePricingPolicy() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { minNoticeDays?: number; allowImmediateChange?: boolean; notifyClientsOnChange?: boolean }) =>
      api.put('/api/settings/pricing-policy', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pricing-policy'] }),
  })
}

// ── Ús del client ────────────────────────────────────────────────────────
export function useClientUsage(clientId: string) {
  return useQuery({
    queryKey: ['client-usage', clientId],
    queryFn:  () => api.get(`/api/clients/${clientId}/usage`).then(r => r.data.data),
    enabled:  !!clientId,
  })
}
