'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

export interface Invoice {
  id:          string
  number:      string
  status:      'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  issueDate:   string
  dueDate:     string
  subtotal:    number
  discountAmt: number
  taxRate:     number
  taxAmt:      number
  total:       number
  notes?:      string
  paidAt?:     string
  client?: {
    companyName:  string
    contactEmail: string
    nif?:         string
    address?:     string
  }
  items?: {
    id:          string
    description: string
    quantity:    number
    unitPrice:   number
    total:       number
  }[]
}

export interface InvoiceStats {
  totalPaid:    number
  pendingCount: number
  overdueCount: number
  thisMonth:    number
}

export function useInvoices(params: { clientId?: string; status?: string; search?: string; sortBy?: string; sortDir?: 'asc' | 'desc' } = {}) {
  return useQuery<Invoice[]>({
    queryKey: ['invoices', params],
    queryFn:  async () => {
      const res = await api.get('/api/invoices', { params })
      return res.data.data
    },
  })
}

export function useInvoice(id: string) {
  return useQuery<Invoice>({
    queryKey: ['invoices', id],
    queryFn:  async () => {
      const res = await api.get(`/api/invoices/${id}`)
      return res.data.data
    },
    enabled: !!id,
  })
}

export function useInvoiceStats() {
  return useQuery<InvoiceStats>({
    queryKey: ['invoices-stats'],
    queryFn:  async () => {
      const res = await api.get('/api/invoices/stats')
      return res.data.data
    },
  })
}

export function useGenerateInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { clientId: string; dueInDays?: number; notes?: string; taxRate?: number }) =>
      api.post('/api/invoices/generate', data).then(r => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['invoices'] })
      qc.invalidateQueries({ queryKey: ['invoices-stats'] })
    },
  })
}

export function useMarkPaid() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/invoices/${id}/pay`).then(r => r.data.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}

export function useCancelInvoice() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/invoices/${id}/cancel`).then(r => r.data.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['invoices'] }),
  })
}
