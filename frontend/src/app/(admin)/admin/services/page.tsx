'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useServices, useCreateService, useUpdateService, useDeleteService } from '../../../../hooks/useServices'
import type { Service } from '../../../../types'

const PLAN_COLORS: Record<string, string> = {
  basic:       'bg-[#1a3a1a] text-[#4ade80] border-[#4ade80]/30',
  pro:         'bg-[#1a2a3a] text-[#60a5fa] border-[#60a5fa]/30',
  premium:     'bg-[#2a1a3a] text-[#c084fc] border-[#c084fc]/30',
  empresarial: 'bg-[#3a2a1a] text-[#FF6B00] border-[#FF6B00]/30',
}

const schema = z.object({
  name:         z.string().min(2, 'Mínim 2 caràcters'),
  slug:         z.string().min(2).regex(/^[a-z0-9-]+$/, 'Minúscules, números i guions'),
  description:  z.string().optional(),
  setupPrice:   z.coerce.number().min(0).default(0),
  monthlyPrice: z.coerce.number().min(0).default(0),
})
type FormData = z.infer<typeof schema>

function ServiceForm({ service, onClose }: { service?: Service; onClose: () => void }) {
  const create = useCreateService()
  const update = useUpdateService(service?.id ?? '')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:         service?.name         ?? '',
      slug:         service?.slug         ?? '',
      description:  service?.description  ?? '',
      setupPrice:   service?.setupPrice   ?? 0,
      monthlyPrice: service?.monthlyPrice ?? 0,
    },
  })
  const onSubmit = async (data: FormData) => {
    if (service) await update.mutateAsync(data)
    else         await create.mutateAsync(data)
    onClose()
  }
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-1)] border border-[var(--border)] p-6 w-full max-w-md">
        <p className="section-tag mb-4">{service ? 'EDITAR SERVEI' : 'NOU SERVEI'}</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="form-label">Nom *</label>
            <input className="form-input" {...register('name')} />
            {errors.name && <p className="font-mono text-[11px] text-[#ff4444] mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="form-label">Slug *</label>
            <input className="form-input" placeholder="nom-del-servei" {...register('slug')} />
            {errors.slug && <p className="font-mono text-[11px] text-[#ff4444] mt-1">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="form-label">Descripció</label>
            <textarea className="form-input h-20 resize-none" {...register('description')} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Preu setup (€)</label>
              <input className="form-input" type="number" min="0" step="0.01" {...register('setupPrice')} />
            </div>
            <div>
              <label className="form-label">Preu mensual (€)</label>
              <input className="form-input" type="number" min="0" step="0.01" {...register('monthlyPrice')} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary text-xs" disabled={isSubmitting}>
              {isSubmitting ? 'DESANT...' : service ? 'DESAR' : 'CREAR'}
            </button>
            <button type="button" className="btn-outline text-xs" onClick={onClose}>CANCEL·LAR</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const router = useRouter()
  const { data: services = [], isLoading } = useServices()
  const deleteService = useDeleteService()
  const [showForm, setShowForm]     = useState(false)
  const [editService, setEdit]      = useState<Service | undefined>()

  return (
    <main className="grid-bg min-h-screen p-8 relative">
      <div className="relative z-10 max-w-5xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="section-tag">CONFIGURACIÓ</p>
            <h1 className="font-orbitron font-black text-2xl text-[#FF6B00]">Serveis</h1>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline text-xs" onClick={() => router.push('/admin/dashboard')}>
              ← DASHBOARD
            </button>
            <button className="btn-primary text-xs" onClick={() => setShowForm(true)}>
              + NOU SERVEI
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="card p-8 text-center">
            <p className="font-mono text-[11px] text-[var(--text-muted)] animate-pulse">CARREGANT...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {services.map(s => (
              <div key={s.id} className="card p-4 flex items-center gap-4">
                <div className="flex-1">
                  <p className="font-rajdhani font-semibold text-[var(--text)]">{s.name}</p>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">
                    {s.setupPrice > 0 && `Setup: ${s.setupPrice}€`}
                    {s.setupPrice > 0 && s.monthlyPrice > 0 && ' · '}
                    {s.monthlyPrice > 0 && `Mensual: ${s.monthlyPrice}€`}
                    {s.setupPrice === 0 && s.monthlyPrice === 0 && 'Sense preu configurat'}
                  </p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end">
                  {(s.planServices ?? []).map(ps => (
                    <span
                      key={ps.plan.id}
                      className={`font-mono text-[9px] tracking-widest px-2 py-0.5 border ${PLAN_COLORS[ps.plan.slug] ?? 'bg-[var(--bg-0)] text-[var(--text-muted)] border-[var(--border)]'}`}
                    >
                      {ps.plan.name.toUpperCase()}
                    </span>
                  ))}
                  {(s.planServices ?? []).length === 0 && (
                    <span className="font-mono text-[9px] text-[var(--text-muted)]">cap pla</span>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="btn-outline text-[10px] px-2 py-1" onClick={() => setEdit(s)}>
                    EDITAR
                  </button>
                  <button
                    className="font-mono text-[10px] text-[#ff4444] hover:text-[#ff6666] tracking-widest"
                    onClick={() => deleteService.mutate(s.id)}
                  >
                    ELIMINAR
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {(showForm || editService) && (
        <ServiceForm
          service={editService}
          onClose={() => { setShowForm(false); setEdit(undefined) }}
        />
      )}
    </main>
  )
}
