'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '../utils/api'

export interface PortalDashboard {
  client: {
    id:          string
    companyName: string
    domain?:     string
    isTest:      boolean
  }
  subscription: {
    status:       string
    planName:     string
    planSlug:     string
    priceMonthly: number
    renewsAt?:    string
    services:     { name: string; slug: string; isExtra: boolean }[]
    limits: {
      maxConversations?: number | null
      maxTokens?:        number | null
      maxAutomations?:   number | null
    } | null
  } | null
  usage: {
    conversationsUsed: number
    tokensUsed:        number
    automationsUsed:   number
    periodStart:       string
    periodEnd:         string
  }
}

export interface PortalInvoice {
  id:        string
  number:    string
  status:    string
  issueDate: string
  dueDate:   string
  total:     number
  paidAt?:   string
}

export function usePortalDashboard() {
  return useQuery<PortalDashboard>({
    queryKey: ['portal-dashboard'],
    queryFn:  async () => {
      const res = await api.get('/api/portal/dashboard')
      return res.data.data
    },
  })
}

export function usePortalInvoices() {
  return useQuery<PortalInvoice[]>({
    queryKey: ['portal-invoices'],
    queryFn:  async () => {
      const res = await api.get('/api/portal/invoices')
      return res.data.data
    },
  })
}
