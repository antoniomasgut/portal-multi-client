'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAllServices, useCreateService, useUpdateService, useToggleService, useDeleteService } from '../../../../hooks/useServices'
import { useTranslation } from '../../../../hooks/useTranslation'
import type { Service } from '../../../../types'

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  category: z.enum(['PRODUCTE', 'IA', 'AUTOMATITZACIONS', 'COMUNICACIO', 'INFORMES', 'SUPORT', 'OPERACIONAL']),
  setupPrice: z.coerce.number().min(0),
  monthlyPrice: z.coerce.number().min(0),
})

function ServiceForm({ service, onClose }: { service?: Service; onClose: () => void }) {
  const { t } = useTranslation('admin')
  const create = useCreateService()
  const update = useUpdateService(service?.id ?? '')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: service?.name ?? '',
      slug: service?.slug ?? '',
      description: service?.description ?? '',
      category: service?.category ?? 'PRODUCTE',
      setupPrice: service?.setupPrice ?? 0,
      monthlyPrice: service?.monthlyPrice ?? 0,
    },
  })

  const onSubmit = async (data: any) => {
    if (service) await update.mutateAsync(data)
    else await create.mutateAsync(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-[var(--bg-1)] border border-[var(--border)] w-full max-w-lg p-6">
        <h2 className="font-orbitron font-black text-xl mb-6">{service ? t('services.form_title_edit') : t('services.form_title_new')}</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input className="form-input" placeholder={t('services.form_label_name')} {...register('name')} />
          <input className="form-input" placeholder={t('services.form_label_slug')} {...register('slug')} />
          <select className="form-input" {...register('category')}>
            {['PRODUCTE', 'IA', 'AUTOMATITZACIONS', 'COMUNICACIO', 'INFORMES', 'SUPORT', 'OPERACIONAL'].map(c => <option key={c} value={c}>{t(`services.cat_${c.toLowerCase()}`)}</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input className="form-input" type="number" placeholder={t('services.form_label_setup_once')} {...register('setupPrice')} />
            <input className="form-input" type="number" placeholder={t('services.form_label_monthly')} {...register('monthlyPrice')} />
          </div>
          <button className="btn-primary w-full" disabled={isSubmitting}>{isSubmitting ? t('actions.loading') : t('services.form_btn_save')}</button>
          <button type="button" className="btn-outline w-full" onClick={onClose}>{t('actions.cancel')}</button>
        </form>
      </div>
    </div>
  )
}

export default function ServicesPage() {
  const { t } = useTranslation('admin')
  const [search, setSearch]       = useState('')
  const [sortBy, setSortBy]       = useState('name')
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc')
  
  const { data: services = [], isLoading } = useAllServices({ search, sortBy, sortDir })
  const toggleSvc = useToggleService()
  const deleteSvc = useDeleteService()
  const [showForm, setShowForm] = useState(false)
  const [editService, setEdit] = useState<Service | undefined>()

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="section-tag">{t('services.tag')}</p>
          <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">{t('services.title')}</h1>
        </div>
        <button className="btn-primary text-xs" onClick={() => setShowForm(true)}>{t('services.new_service')}</button>
      </div>

      <div className="mb-4">
        <input
          className="form-input max-w-xs text-sm"
          placeholder={t('clients.search_placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-1)]">
            {[
              { label: t('services.col_service'), key: 'name' },
              { label: t('services.col_setup'), key: 'setupPrice' },
              { label: t('services.col_monthly'), key: 'monthlyPrice' },
              { label: t('services.col_category'), key: 'category' },
              { label: t('services.col_actions'), key: '' },
            ].map(h => (
              <button key={h.label} className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase text-left flex items-center gap-1" onClick={() => h.key && toggleSort(h.key)}>
                {h.label}
                {sortBy === h.key && <span className="text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>}
              </button>
            ))}
        </div>

        {isLoading ? (
          <div className="p-16 text-center font-mono text-[10px] uppercase tracking-widest">{t('services.loading')}</div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {services.map(s => (
              <div key={s.id} className={`grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center ${!s.isActive && 'opacity-50'}`}>
                <div>
                  <p className="font-semibold text-sm">{s.name}</p>
                  <p className="font-mono text-[9px] text-[var(--text-muted)]">{s.slug}</p>
                </div>
                <p className="font-mono text-sm">{s.setupPrice}€</p>
                <p className="font-mono text-sm">{s.monthlyPrice}€</p>
                <p className="font-mono text-[9px] uppercase tracking-widest text-[var(--text-muted)]">{t(`services.cat_${s.category.toLowerCase()}`)}</p>
                <div className="flex gap-2">
                  <button className="btn-outline text-[9px] px-2" onClick={() => toggleSvc.mutate(s.id)}>{s.isActive ? t('services.deactivate') : t('services.activate')}</button>
                  <button className="btn-outline text-[9px] px-2" onClick={() => setEdit(s)}>{t('actions.edit')}</button>
                  <button className="text-[var(--text-muted)] hover:text-[#ff4444] px-1" onClick={() => deleteSvc.mutate(s.id)}>✕</button>
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
    </div>
  )
}
