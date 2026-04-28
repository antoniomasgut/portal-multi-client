'use client'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'
import type { Service } from '../types'

export function useServices(params: { search?: string; sortBy?: string; sortDir?: 'asc' | 'desc' } = {}) {
  return useQuery<Service[]>({
    queryKey: ['services', params],
    queryFn:  async () => {
      const res = await api.get('/api/services', { params })
      return res.data.data
    },
  })
}

/** Admin: inclou serveis inactius */
export function useAllServices(params: { search?: string; sortBy?: string; sortDir?: 'asc' | 'desc' } = {}) {
  return useQuery<Service[]>({
    queryKey: ['services', 'all', params],
    queryFn:  async () => {
      const res = await api.get('/api/services/all', { params })
      return res.data.data
    },
  })
}

export function useCreateService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: {
      name:         string
      slug:         string
      description?: string
      setupPrice:   number
      monthlyPrice: number
    }) => api.post('/api/services', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useUpdateService(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<{
      name:         string
      slug:         string
      description:  string
      setupPrice:   number
      monthlyPrice: number
    }>) => api.patch(`/api/services/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useToggleService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/api/services/${id}/toggle`).then(r => r.data.data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}

export function useDeleteService() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/services/${id}`),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['services'] }),
  })
}
