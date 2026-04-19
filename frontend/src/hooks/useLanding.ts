'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

export type LandingStyle   = 'dark-tech' | 'minimal-light' | 'gradient-hero' | 'split-layout'
export type LandingFontPair = 'orbitron-rajdhani' | 'poppins-poppins' | 'playfair-merriweather' | 'merriweather-poppins' | 'mono-rajdhani'

export interface ClientLanding {
  id:           string
  clientId:     string
  slug:         string
  title:        string
  subtitle?:    string
  description?: string
  ctaText:      string
  ctaUrl?:      string
  primaryColor: string
  style:        LandingStyle
  fontPair?:    LandingFontPair
  logoUrl?:     string | null
  published:    boolean
  publishedAt?: string
  logoGcsPath?: string
}

export function useLanding(clientId: string) {
  return useQuery<ClientLanding | null>({
    queryKey: ['landing', clientId],
    queryFn:  async () => {
      const res = await api.get(`/api/landing/${clientId}`)
      return res.data.data ?? null
    },
    enabled:   !!clientId,
    staleTime: 5 * 60 * 1000, // evita refetch de fons mentre l'usuari edita
  })
}

export function useUpsertLanding(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<ClientLanding>) =>
      api.put(`/api/landing/${clientId}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['landing', clientId] }),
  })
}

export function usePublishLanding(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (publish: boolean) =>
      api.patch(`/api/landing/${clientId}/${publish ? 'publish' : 'unpublish'}`).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['landing', clientId] }),
  })
}
