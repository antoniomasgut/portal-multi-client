# Skill: CRUD Complet (Backend + Frontend)

## Ús
Generar un CRUD complet per a un recurs: backend (API REST) + frontend (llista + formulari).

## Backend — vegeu `skill-api-endpoint.md`
El backend segueix el patró routes → controllers → services.

## Frontend

### Hook de dades (`src/hooks/use[Resource].ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../utils/api'

const QUERY_KEY = ['resources']

export const useResources = () => useQuery({
  queryKey: QUERY_KEY,
  queryFn: () => api.get('/api/resources').then(r => r.data.data)
})

export const useCreateResource = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateDTO) => api.post('/api/resources', data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  })
}

export const useUpdateResource = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDTO }) =>
      api.patch(`/api/resources/${id}`, data).then(r => r.data.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  })
}

export const useDeleteResource = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/resources/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEY })
  })
}
```

### Llista (`src/components/[Resource]List.tsx`)
```tsx
export const ResourceList = () => {
  const { data = [], isLoading } = useResources()
  const deleteResource = useDeleteResource()

  if (isLoading) return <div className="text-text-muted font-mono text-sm">CARREGANT...</div>

  return (
    <div className="space-y-3">
      {data.map(item => (
        <div key={item.id} className="card flex justify-between items-center">
          <div>
            <h3 className="font-orbitron text-sm">{item.name}</h3>
            <span className="badge">{item.status}</span>
          </div>
          <button
            className="btn-outline text-xs"
            onClick={() => deleteResource.mutate(item.id)}
          >
            ELIMINAR
          </button>
        </div>
      ))}
    </div>
  )
}
```

### Formulari (`src/components/[Resource]Form.tsx`)
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

export const ResourceForm = ({ onSuccess }: { onSuccess: () => void }) => {
  const createResource = useCreateResource()
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(CreateSchema)
  })

  const onSubmit = (data: CreateDTO) =>
    createResource.mutate(data, { onSuccess })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="form-label">NOM</label>
        <input className="form-input" {...register('name')} />
        {errors.name && <p className="text-danger text-xs mt-1">{errors.name.message}</p>}
      </div>
      <button type="submit" className="btn-primary" disabled={createResource.isPending}>
        {createResource.isPending ? 'GUARDANT...' : 'CREAR'}
      </button>
    </form>
  )
}
```
