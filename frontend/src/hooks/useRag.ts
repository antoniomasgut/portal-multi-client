'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'

export interface RAGDocument {
  id:         string
  clientId:   string
  filename:   string
  gcsPath:    string
  mimeType:   string
  sizeBytes:  number
  status:     'PENDING' | 'INDEXING' | 'INDEXED' | 'FAILED'
  chunkCount: number | null
  error:      string | null
  indexedAt:  string | null
  createdAt:  string
}

async function fetchJSON(url: string, init?: RequestInit) {
  const res = await fetch(url, { credentials: 'include', ...init })
  return res.json()
}

export function useRagDocuments(clientId: string) {
  return useQuery<{ success: boolean; data: RAGDocument[] }>({
    queryKey: ['rag', clientId],
    queryFn:  () => fetchJSON(`${API}/api/clients/${clientId}/rag`),
    enabled:  !!clientId,
    refetchInterval: 5000,
  })
}

export function useUploadRagDocument(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      return fetchJSON(`${API}/api/clients/${clientId}/rag`, { method: 'POST', body: form })
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rag', clientId] }),
  })
}

export function useDeleteRagDocument(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (docId: string) =>
      fetchJSON(`${API}/api/clients/${clientId}/rag/${docId}`, { method: 'DELETE' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rag', clientId] }),
  })
}

export function useReindexRagDocument(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (docId: string) =>
      fetchJSON(`${API}/api/clients/${clientId}/rag/${docId}/reindex`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rag', clientId] }),
  })
}
