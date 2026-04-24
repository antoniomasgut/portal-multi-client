'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

export type AIProviderType = 'GROQ' | 'OLLAMA' | 'OPENAI' | 'ANTHROPIC'

export interface AIProviderEntry {
  id:        string
  clientId:  string
  provider:  AIProviderType
  model:     string
  baseUrl:   string | null
  isActive:  boolean
  priority:  number
  hasApiKey: boolean
  createdAt: string
}

export interface ProviderModels {
  GROQ:      string[]
  OLLAMA:    string[]
  OPENAI:    string[]
  ANTHROPIC: string[]
}

export function useAIProviders(clientId: string) {
  return useQuery<AIProviderEntry[]>({
    queryKey: ['ai-providers', clientId],
    queryFn:  async () => {
      const res = await api.get(`/api/clients/${clientId}/ai-providers`)
      return res.data.data
    },
    enabled: !!clientId,
  })
}

export function useProviderModels() {
  return useQuery<ProviderModels>({
    queryKey: ['ai-provider-models'],
    queryFn:  async () => {
      const res = await api.get('/api/ai-providers/models')
      return res.data.data
    },
  })
}

export function useCreateAIProvider(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { provider: AIProviderType; model: string; apiKey?: string; baseUrl?: string; priority?: number }) =>
      api.post(`/api/clients/${clientId}/ai-providers`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-providers', clientId] }),
  })
}

export function useUpdateAIProvider(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; model?: string; apiKey?: string; baseUrl?: string | null; isActive?: boolean; priority?: number }) =>
      api.patch(`/api/clients/${clientId}/ai-providers/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-providers', clientId] }),
  })
}

export function useDeleteAIProvider(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      api.delete(`/api/clients/${clientId}/ai-providers/${id}`).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['ai-providers', clientId] }),
  })
}
