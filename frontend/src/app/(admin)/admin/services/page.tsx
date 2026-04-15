'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useServices, useCreateService, useUpdateService, useDeleteService } from '../../../../hooks/useServices'
import type { Service } from '../../../../types'

const PLAN_STYLES: Record<string, { accent: string; bg: string; label: string }> = {
  basic:       { accent: '#4ade80', bg: 'bg-[#4ade80]/10',  label: 'Bàsic'       },
  pro:         { accent: '#60a5fa', bg: 'bg-[#60a5fa]/10',  label: 'Pro'         },
  premium:     { accent: '#c084fc', bg: 'bg-[#c084fc]/10',  label: 'Premium'     },
  empresarial: { accent: '#FF6B00', bg: 'bg-[#FF6B00]/10',  label: 'Empresarial' },
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
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[var(--bg-1)] border border-[var(--border)] w-full max-w-md">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <p className="font-mono text-[9px] tracking-[4px] text-[#FF6B00] uppercase">
              {service ? 'EDITAR SERVEI' : 'NOU SERVEI'}
            </p>
            <p className="font-rajdhani font-semibold text-[var(--text)] mt-0.5">
              {service ? service.name : 'Afegir al catàleg'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[var(--text-muted)] hover:text-[var(--text)] text-lg leading-none"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="form-label">Nom *</label>
            <input className="form-input" {...register('name')} />
            {errors.name && <p className="font-mono text-[10px] text-[#ff4444] mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="form-label">Slug *</label>
            <input className="form-input font-mono" placeholder="nom-del-servei" {...register('slug')} />
            {errors.slug && <p className="font-mono text-[10px] text-[#ff4444] mt-1">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="form-label">Descripció</label>
            <textarea className="form-input h-20 resize-none" {...register('description')} />
          </div>

          {/* Preus */}
          <div>
            <label className="form-label">Preus</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Setup (únic)</label>
                <div className="relative">
                  <input className="form-input pr-7" type="number" min="0" step="0.01" {...register('setupPrice')} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[var(--text-muted)]">€</span>
                </div>
              </div>
              <div>
                <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">Mensual</label>
                <div className="relative">
                  <input className="form-input pr-7" type="number" min="0" step="0.01" {...register('monthlyPrice')} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[var(--text-muted)]">€</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary text-xs" disabled={isSubmitting}>
              {isSubmitting ? 'DESANT...' : service ? 'DESAR' : 'CREAR SERVEI'}
            </button>
            <button type="button" className="btn-outline text-xs" onClick={onClose}>CANCEL·LAR</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const { data: services = [], isLoading } = useServices()
  const deleteService = useDeleteService()
  const [showForm, setShowForm]   = useState(false)
  const [editService, setEdit]    = useState<Service | undefined>()

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="section-tag">CONFIGURACIÓ</p>
          <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">Serveis</h1>
          {!isLoading && (
            <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 tracking-widest">
              {services.length} servei{services.length !== 1 ? 's' : ''} al catàleg
            </p>
          )}
        </div>
        <button className="btn-primary text-xs" onClick={() => setShowForm(true)}>
          + NOU SERVEI
        </button>
      </div>

      {/* ── Contingut ───────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] p-16 text-center">
          <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-[4px] animate-pulse uppercase">
            Carregant serveis...
          </p>
        </div>
      ) : (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden">

          {/* Capçalera */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-1)]">
            {['SERVEI', 'SETUP', 'MENSUAL', 'PLANS', 'ACCIONS'].map(h => (
              <p key={h} className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase">{h}</p>
            ))}
          </div>

          {services.length === 0 ? (
            <div className="p-12 text-center">
              <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-widest mb-4">CATÀLEG BUIT</p>
              <button className="btn-primary text-xs" onClick={() => setShowForm(true)}>
                + NOU SERVEI
              </button>
            </div>
          ) : (
            services.map((s, i) => {
              const planSlugs = (s.planServices ?? []).map(ps => ps.plan.slug)
              return (
                <div
                  key={s.id}
                  className={`grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-4 px-5 py-4 items-center
                    hover:bg-[var(--bg-1)] transition-colors
                    ${i < services.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
                >
                  {/* Nom */}
                  <div>
                    <p className="font-rajdhani font-semibold text-[var(--text)] text-base leading-tight">{s.name}</p>
                    <p className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5">{s.slug}</p>
                    {s.description && (
                      <p className="font-rajdhani text-[12px] text-[var(--text-muted)] mt-0.5 line-clamp-1">{s.description}</p>
                    )}
                  </div>

                  {/* Setup */}
                  <p className="font-mono text-[11px] text-[var(--text)]">
                    {s.setupPrice > 0 ? `${s.setupPrice}€` : <span className="text-[var(--text-muted)]">—</span>}
                  </p>

                  {/* Mensual */}
                  <p className="font-mono text-[11px] text-[var(--text)]">
                    {s.monthlyPrice > 0 ? `${s.monthlyPrice}€` : <span className="text-[var(--text-muted)]">—</span>}
                  </p>

                  {/* Plans */}
                  <div className="flex flex-wrap gap-1">
                    {planSlugs.length === 0 ? (
                      <span className="font-mono text-[9px] text-[var(--text-muted)]">cap pla</span>
                    ) : planSlugs.map(slug => {
                      const style = PLAN_STYLES[slug]
                      if (!style) return null
                      return (
                        <span
                          key={slug}
                          className={`font-mono text-[8px] tracking-wider px-2 py-0.5 border ${style.bg}`}
                          style={{ color: style.accent, borderColor: `${style.accent}40` }}
                        >
                          {style.label.slice(0, 3).toUpperCase()}
                        </span>
                      )
                    })}
                  </div>

                  {/* Accions */}
                  <div className="flex gap-2 justify-end">
                    <button
                      className="btn-outline text-[9px] px-3 py-1.5"
                      onClick={() => setEdit(s)}
                    >
                      EDITAR
                    </button>
                    <button
                      className="font-mono text-[9px] text-[#ff4444] hover:text-[#ff6666] tracking-widest transition-colors px-1"
                      onClick={() => deleteService.mutate(s.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })
          )}
        </div>
      )}

      {(showForm || editService) && (
        <ServiceForm
          service={editService}
          onClose={() => { setShowForm(false); setEdit(undefined) }}
        />
      )}
    </div>
  )
}
