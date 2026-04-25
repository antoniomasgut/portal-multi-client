'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export interface FAQ { q: string; a: string }

export interface WhatsAppBotConfig {
  id:            string
  clientId:      string
  botName:       string | null
  greeting:      string
  tone:          'professional' | 'amable' | 'informal'
  businessHours: string | null
  faqs:          FAQ[]
  isActive:      boolean
  createdAt:     string
  updatedAt:     string
}

export interface BotConfigInput {
  botName?:       string
  greeting?:      string
  tone?:          'professional' | 'amable' | 'informal'
  businessHours?: string | null
  faqs?:          FAQ[]
  isActive?:      boolean
}

async function fetchJSON(url: string, init?: RequestInit) {
  const res = await fetch(url, { credentials: 'include', ...init })
  return res.json()
}

export function useWhatsAppBot(clientId: string) {
  return useQuery<{ success: boolean; data: WhatsAppBotConfig | null }>({
    queryKey: ['whatsapp-bot', clientId],
    queryFn:  () => fetchJSON(`${API}/api/clients/${clientId}/whatsapp-bot`),
    enabled:  !!clientId,
  })
}

export function useSaveWhatsAppBot(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: BotConfigInput) =>
      fetchJSON(`${API}/api/clients/${clientId}/whatsapp-bot`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp-bot', clientId] }),
  })
}

export function useGenerateWhatsAppBot(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { companyName: string; sector: string; lang: string }) =>
      fetchJSON(`${API}/api/clients/${clientId}/whatsapp-bot/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['whatsapp-bot', clientId] }),
  })
}
