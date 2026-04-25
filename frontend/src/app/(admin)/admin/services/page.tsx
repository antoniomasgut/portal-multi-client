'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAllServices, useCreateService, useUpdateService, useToggleService } from '../../../../hooks/useServices'
import type { Service, ServiceCategory } from '../../../../types'
import { useTranslation } from '../../../../hooks/useTranslation'

const PLAN_STYLES: Record<string, { accent: string; bg: string; label: string }> = {
  basic:       { accent: '#4ade80', bg: 'bg-[#4ade80]/10',  label: 'Bàsic'       },
  pro:         { accent: '#60a5fa', bg: 'bg-[#60a5fa]/10',  label: 'Pro'         },
  premium:     { accent: '#c084fc', bg: 'bg-[#c084fc]/10',  label: 'Premium'     },
  empresarial: { accent: '#FF6B00', bg: 'bg-[#FF6B00]/10',  label: 'Empresarial' },
}

const CATEGORY_META: Record<ServiceCategory, { label: string; color: string; icon: string }> = {
  PRODUCTE:        { label: 'Producte',         color: '#FF6B00', icon: '◈' },
  IA:              { label: 'Intel·ligència IA', color: '#c084fc', icon: '◆' },
  AUTOMATITZACIONS:{ label: 'Automatitzacions',  color: '#60a5fa', icon: '⬡' },
  COMUNICACIO:     { label: 'Comunicació',       color: '#4ade80', icon: '◉' },
  INFORMES:        { label: 'Informes',          color: '#facc15', icon: '◧' },
  SUPORT:          { label: 'Suport',            color: '#8888aa', icon: '◫' },
  OPERACIONAL:     { label: 'Operacional',       color: '#f87171', icon: '◪' },
}

const CATEGORY_ORDER: ServiceCategory[] = ['PRODUCTE', 'IA', 'AUTOMATITZACIONS', 'COMUNICACIO', 'INFORMES', 'SUPORT', 'OPERACIONAL']

const schema = z.object({
  name:         z.string().min(2, 'Mínim 2 caràcters'),
  slug:         z.string().min(2).regex(/^[a-z0-9-]+$/, 'Minúscules, números i guions'),
  description:  z.string().optional(),
  category:     z.enum(['PRODUCTE', 'IA', 'AUTOMATITZACIONS', 'COMUNICACIO', 'INFORMES', 'SUPORT', 'OPERACIONAL']),
  setupPrice:   z.coerce.number().min(0).default(0),
  monthlyPrice: z.coerce.number().min(0).default(0),
})
type FormData = z.infer<typeof schema>

function ServiceForm({ service, onClose }: { service?: Service; onClose: () => void }) {
  const { t } = useTranslation('admin')
  const create = useCreateService()
  const update = useUpdateService(service?.id ?? '')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:         service?.name         ?? '',
      slug:         service?.slug         ?? '',
      description:  service?.description  ?? '',
      category:     service?.category     ?? 'PRODUCTE',
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <p className="font-mono text-[9px] tracking-[4px] text-[#FF6B00] uppercase">
              {service ? t('services.form_title_edit') : t('services.form_title_new')}
            </p>
            <p className="font-rajdhani font-semibold text-[var(--text)] mt-0.5">
              {service ? service.name : t('services.form_subtitle_new')}
            </p>
          </div>
          <button type="button" onClick={onClose}
            className="font-mono text-[var(--text-muted)] hover:text-[var(--text)] text-lg leading-none">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="form-label">{t('services.form_label_name')}</label>
            <input className="form-input" {...register('name')} />
            {errors.name && <p className="font-mono text-[10px] text-[#ff4444] mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="form-label">{t('services.form_label_slug')}</label>
            <input className="form-input font-mono" placeholder="nom-del-servei" {...register('slug')} />
            {errors.slug && <p className="font-mono text-[10px] text-[#ff4444] mt-1">{errors.slug.message}</p>}
          </div>
          <div>
            <label className="form-label">{t('services.form_label_category')}</label>
            <select className="form-input" {...register('category')}>
              {CATEGORY_ORDER.map(cat => (
                <option key={cat} value={cat}>{t(`services.cat_${cat.toLowerCase()}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">{t('services.form_label_description')}</label>
            <textarea className="form-input h-20 resize-none" {...register('description')} />
          </div>
          <div>
            <label className="form-label">{t('services.form_label_prices')}</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">{t('services.form_label_setup_once')}</label>
                <div className="relative">
                  <input className="form-input pr-7" type="number" min="0" step="0.01" {...register('setupPrice')} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[var(--text-muted)]">€</span>
                </div>
              </div>
              <div>
                <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase tracking-wider block mb-1.5">{t('services.form_label_monthly')}</label>
                <div className="relative">
                  <input className="form-input pr-7" type="number" min="0" step="0.01" {...register('monthlyPrice')} />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[var(--text-muted)]">€</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary text-xs" disabled={isSubmitting}>
              {isSubmitting ? t('services.form_btn_saving') : service ? t('services.form_btn_save') : t('services.form_btn_create')}
            </button>
            <button type="button" className="btn-outline text-xs" onClick={onClose}>{t('services.form_btn_cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ServiceRow({ s, onEdit, onToggle, isLast }: { s: Service; onEdit: () => void; onToggle: () => void; isLast: boolean }) {
  const { t } = useTranslation('admin')
  const planSlugs = (s.planServices ?? []).map(ps => ps.plan.slug)
  return (
    <div className={`grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-4 px-5 py-4 items-center transition-colors
      ${s.isActive ? 'hover:bg-[var(--bg-1)]' : 'opacity-40'}
      ${!isLast ? 'border-b border-[var(--border)]' : ''}`}>
      <div>
        <div className="flex items-center gap-2">
          <p className="font-rajdhani font-semibold text-[var(--text)] text-base leading-tight">{s.name}</p>
          {!s.isActive && (
            <span className="font-mono text-[8px] tracking-widest px-1.5 py-0.5 border border-[var(--border)] text-[var(--text-muted)]">
              {t('services.inactive')}
            </span>
          )}
        </div>
        {s.description && (
          <p className="font-rajdhani text-[12px] text-[var(--text-muted)] mt-0.5 line-clamp-1">{s.description}</p>
        )}
      </div>
      <p className="font-mono text-sm text-[var(--text)]">
        {s.setupPrice > 0 ? `${s.setupPrice}€` : <span className="text-[var(--text-muted)]">—</span>}
      </p>
      <p className="font-mono text-sm text-[var(--text)]">
        {s.monthlyPrice > 0 ? `${s.monthlyPrice}€/mes` : <span className="text-[var(--text-muted)]">—</span>}
      </p>
      <div className="flex flex-wrap gap-1">
        {planSlugs.length === 0 ? (
          <span className="font-mono text-[9px] text-[var(--text-muted)]">{t('services.no_plan')}</span>
        ) : planSlugs.map(slug => {
          const style = PLAN_STYLES[slug]
          if (!style) return null
          return (
            <span key={slug} className={`font-mono text-[8px] tracking-wider px-2 py-0.5 border ${style.bg}`}
              style={{ color: style.accent, borderColor: `${style.accent}40` }}>
              {style.label.slice(0, 3).toUpperCase()}
            </span>
          )
        })}
      </div>
      <div className="flex gap-2 justify-end">
        <button className="btn-outline text-[9px] px-3 py-1.5" onClick={onEdit}>{t('clients.edit')}</button>
        <button
          className={`font-mono text-[9px] tracking-widest transition-colors px-2 py-1 border ${
            s.isActive
              ? 'text-[var(--text-muted)] border-[var(--border)] hover:text-[#ff4444] hover:border-[#ff4444]/40'
              : 'text-[#4ade80] border-[#4ade80]/40 hover:bg-[#4ade80]/10'
          }`}
          onClick={onToggle}
          title={s.isActive ? t('services.deactivate') : t('services.activate')}>
          {s.isActive ? 'OFF' : 'ON'}
        </button>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const { t } = useTranslation('admin')
  const { data: services = [], isLoading } = useAllServices()
  const toggle     = useToggleService()
  const [showForm, setShowForm] = useState(false)
  const [editService, setEdit]  = useState<Service | undefined>()

  const activeCount   = services.filter(s => s.isActive).length
  const inactiveCount = services.filter(s => !s.isActive).length

  const grouped = CATEGORY_ORDER.reduce((acc, cat) => {
    acc[cat] = services.filter(s => s.category === cat)
    return acc
  }, {} as Record<ServiceCategory, Service[]>)

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in-up">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="section-tag">{t('services.tag')}</p>
          <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">{t('services.title')}</h1>
          {!isLoading && (
            <p className="font-mono text-xs text-[var(--text-muted)] mt-1 tracking-widest">
              {t('services.active_count', { count: services.length, active: activeCount })}
              {inactiveCount > 0 && t('services.inactive_suffix', { count: inactiveCount })}
            </p>
          )}
        </div>
        <button className="btn-primary text-xs" onClick={() => setShowForm(true)}>
          {t('services.new_service')}
        </button>
      </div>

      {isLoading ? (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] p-16 text-center">
          <p className="font-mono text-xs text-[var(--text-muted)] tracking-[4px] animate-pulse uppercase">
            {t('services.loading')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORY_ORDER.map(cat => {
            const catServices = grouped[cat]
            if (catServices.length === 0) return null
            const meta = CATEGORY_META[cat]
            return (
              <div key={cat} className="bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden">
                {/* Capçalera categoria */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-1)]">
                  <span className="text-base" style={{ color: meta.color }}>{meta.icon}</span>
                  <p className="font-mono text-xs tracking-[3px] uppercase font-bold" style={{ color: meta.color }}>
                    {t(`services.cat_${cat.toLowerCase()}`)}
                  </p>
                  <span className="font-mono text-[10px] text-[var(--text-muted)] ml-auto">
                    {catServices.filter(s => s.isActive).length}/{catServices.length}
                  </span>
                </div>

                {/* Capçalera columnes */}
                <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_auto] gap-4 px-5 py-2 border-b border-[var(--border)]">
                  {[t('services.col_service'), t('services.col_setup'), t('services.col_monthly'), t('services.col_plans'), t('services.col_actions')].map(h => (
                    <p key={h} className="font-mono text-[9px] tracking-[3px] text-[var(--text-muted)] uppercase">{h}</p>
                  ))}
                </div>

                {catServices.map((s, i) => (
                  <ServiceRow
                    key={s.id}
                    s={s}
                    onEdit={() => setEdit(s)}
                    onToggle={() => toggle.mutate(s.id)}
                    isLast={i === catServices.length - 1}
                  />
                ))}
              </div>
            )
          })}
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
