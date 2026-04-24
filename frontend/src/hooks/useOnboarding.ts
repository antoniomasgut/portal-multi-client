'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface OnboardingProgress {
  clientId:    string
  hasAccessed: boolean
  day0SentAt:  string | null
  day1SentAt:  string | null
  day7SentAt:  string | null
  day15SentAt: string | null
  day30SentAt: string | null
  completedAt: string | null
  createdAt:   string
  client: {
    id:           string
    companyName:  string
    contactEmail: string
    language:     string
    isTest:       boolean
  }
}

async function apiFetch(path: string, opts?: RequestInit) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${path}`, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  })
  const json = await res.json()
  if (!json.success) throw new Error(json.message)
  return json.data
}

export function useOnboardingList() {
  return useQuery<OnboardingProgress[]>({
    queryKey: ['onboarding'],
    queryFn:  () => apiFetch('/api/onboarding'),
  })
}

export function useTriggerOnboarding() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => apiFetch('/api/onboarding/process'),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['onboarding'] }),
  })
}
