'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export interface FAQ { q: string; a: string }

export interface TelegramBotConfig {
  id:               string
  clientId:         string
  botName:          string | null
  telegramBotToken: string | null
  greeting:         string
  tone:             'professional' | 'amable' | 'informal'
  businessHours:    string | null
  faqs:             FAQ[]
  isActive:         boolean
  createdAt:        string
  updatedAt:        string
}

export interface TelegramBotConfigInput {
  botName?:          string
  telegramBotToken?: string | null
  greeting?:         string
  tone?:             'professional' | 'amable' | 'informal'
  businessHours?:    string | null
  faqs?:             FAQ[]
  isActive?:         boolean
}

async function fetchJSON(url: string, init?: RequestInit) {
  const res = await fetch(url, { credentials: 'include', ...init })
  return res.json()
}

export function useTelegramBot(clientId: string) {
  return useQuery<{ success: boolean; data: TelegramBotConfig | null }>({
    queryKey: ['telegram-bot', clientId],
    queryFn:  () => fetchJSON(`${API}/api/clients/${clientId}/telegram-bot`),
    enabled:  !!clientId,
  })
}

export function useSaveTelegramBot(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: TelegramBotConfigInput) =>
      fetchJSON(`${API}/api/clients/${clientId}/telegram-bot`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['telegram-bot', clientId] }),
  })
}

export function useGenerateTelegramBot(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: { companyName: string; sector: string; lang: string }) =>
      fetchJSON(`${API}/api/clients/${clientId}/telegram-bot/generate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['telegram-bot', clientId] }),
  })
}
