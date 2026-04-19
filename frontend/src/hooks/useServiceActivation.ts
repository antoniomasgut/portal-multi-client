'use client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

export function useToggleService(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ serviceId, active }: { serviceId: string; active: boolean }) =>
      api.patch(`/api/clients/${clientId}/services/${serviceId}/active`, { active })
         .then(r => r.data.data),
    onSuccess: () => {
      // Invalida la query del client perquè la llista de serveis es refresqui
      qc.invalidateQueries({ queryKey: ['client', clientId] })
      qc.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
