'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePlans, useCreatePlan, useUpdatePlan, useDeletePlan } from '../../../../hooks/useClients'
import { useTranslation } from '../../../../hooks/useTranslation'
import type { Plan } from '../../../../types'

const schema = z.object({
  name:         z.string().min(2, 'Mínim 2 caràcters'),
  slug:         z.string().min(2).regex(/^[a-z0-9-]+$/, 'Minúscules, números i guions'),
  priceMonthly: z.coerce.number().min(0),
  maxDomains:   z.coerce.number().int().min(1),
  maxUsers:     z.coerce.number().int().min(1),
  maxConversations: z.coerce.number().int().nullable().optional(),
  maxTokens:        z.coerce.number().int().nullable().optional(),
  maxAutomations:   z.coerce.number().int().nullable().optional(),
  maxRagDocuments:  z.coerce.number().int().nullable().optional(),
  hasLandingPro:   z.boolean().default(false),
  hasCustomDomain: z.boolean().default(false),
  hasRag:          z.boolean().default(false),
  hasTelegram:     z.boolean().default(false),
  extraConversationPrice: z.coerce.number().min(0),
  extraTokenPrice:        z.coerce.number().min(0),
  isActive: z.boolean().default(true),
})

type FormData = z.infer<typeof schema>

function PlanForm({ plan, onClose }: { plan?: Plan; onClose: () => void }) {
  const { t } = useTranslation('admin')
  const create = useCreatePlan()
  const update = useUpdatePlan(plan?.id ?? '')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name:         plan?.name         ?? '',
      slug:         plan?.slug         ?? '',
      priceMonthly: plan?.priceMonthly ?? 0,
      maxDomains:   plan?.maxDomains   ?? 1,
      maxUsers:     plan?.maxUsers     ?? 1,
      maxConversations: plan?.maxConversations ?? null,
      maxTokens:        plan?.maxTokens        ?? null,
      maxAutomations:   plan?.maxAutomations   ?? null,
      maxRagDocuments:  plan?.maxRagDocuments  ?? null,
      hasLandingPro:   plan?.hasLandingPro   ?? false,
      hasCustomDomain: plan?.hasCustomDomain ?? false,
      hasRag:          plan?.hasRag          ?? false,
      hasTelegram:     plan?.hasTelegram     ?? false,
      extraConversationPrice: plan?.extraConversationPrice ?? 0.005,
      extraTokenPrice:        plan?.extraTokenPrice        ?? 0.0001,
      isActive: plan?.isActive ?? true,
    },
  })

  const onSubmit = async (data: FormData) => {
    try {
      if (plan) await update.mutateAsync(data)
      else      await create.mutateAsync(data)
      onClose()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[var(--bg-1)] border border-[var(--border)] w-full max-w-2xl my-8">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
          <div>
            <p className="section-tag">{plan ? t('plans.form_title_edit') : t('plans.form_title_new')}</p>
            <p className="font-rajdhani font-semibold text-[var(--text)] mt-0.5">
              {plan ? plan.name : t('plans.new_plan')}
            </p>
          </div>
          <button onClick={onClose} className="font-mono text-[var(--text-muted)] hover:text-[var(--text)] text-lg">✕</button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t('plans.form_label_name')}</label>
              <input className="form-input" {...register('name')} />
              {errors.name && <p className="form-error">{errors.name.message}</p>}
            </div>
            <div>
              <label className="form-label">{t('plans.form_label_slug')}</label>
              <input className="form-input font-mono" {...register('slug')} />
              {errors.slug && <p className="form-error">{errors.slug.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">{t('plans.form_label_price')}</label>
              <div className="relative">
                <input className="form-input pr-7" type="number" step="0.01" {...register('priceMonthly')} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--text-muted)]">€</span>
              </div>
            </div>
            <div>
              <label className="form-label">{t('plans.form_label_max_domains')}</label>
              <input className="form-input" type="number" {...register('maxDomains')} />
            </div>
            <div>
              <label className="form-label">{t('plans.form_label_max_users')}</label>
              <input className="form-input" type="number" {...register('maxUsers')} />
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-[2px] text-[#FF6B00] uppercase mb-3">{t('plans.form_label_limits')}</p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: 'maxConversations', label: t('plans.form_label_max_conversations') },
                { name: 'maxTokens', label: t('plans.form_label_max_tokens') },
                { name: 'maxAutomations', label: t('plans.form_label_max_automations') },
                { name: 'maxRagDocuments', label: t('plans.form_label_max_rag_documents') },
              ].map(f => (
                <div key={f.name}>
                  <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1.5 block">{f.label}</label>
                  <input className="form-input" type="number" placeholder="∞" {...register(f.name as any)} />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-[2px] text-[#FF6B00] uppercase mb-3">{t('plans.form_label_features')}</p>
            <div className="grid grid-cols-4 gap-4">
              {[
                { name: 'hasLandingPro', label: t('plans.form_label_has_landing') },
                { name: 'hasCustomDomain', label: t('plans.form_label_has_domain') },
                { name: 'hasRag', label: t('plans.form_label_has_rag') },
                { name: 'hasTelegram', label: t('plans.form_label_has_telegram') },
              ].map(f => (
                <label key={f.name} className="flex items-center gap-2 cursor-pointer group">
                  <input type="checkbox" className="hidden peer" {...register(f.name as any)} />
                  <div className="w-4 h-4 border border-[var(--border)] flex items-center justify-center peer-checked:bg-[#FF6B00] peer-checked:border-[#FF6B00] transition-colors">
                    <span className="text-[10px] text-white opacity-0 peer-checked:opacity-100">✓</span>
                  </div>
                  <span className="font-mono text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors uppercase tracking-wider">
                    {f.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <p className="font-mono text-[10px] tracking-[2px] text-[#FF6B00] uppercase mb-3">{t('plans.form_label_extra_prices')}</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1.5 block">{t('plans.form_label_extra_conversation')}</label>
                <input className="form-input" type="number" step="0.0001" {...register('extraConversationPrice')} />
              </div>
              <div>
                <label className="font-mono text-[9px] text-[var(--text-muted)] uppercase mb-1.5 block">{t('plans.form_label_extra_token')}</label>
                <input className="form-input" type="number" step="0.000001" {...register('extraTokenPrice')} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-[var(--border)]">
            <button type="submit" disabled={isSubmitting} className="btn-primary text-xs flex-1">
              {isSubmitting ? '...' : plan ? t('plans.form_btn_save') : t('plans.form_btn_create')}
            </button>
            <button type="button" onClick={onClose} className="btn-outline text-xs flex-1">
              {t('plans.form_btn_cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PlansPage() {
  const { t } = useTranslation('admin')
  const [search, setSearch]       = useState('')
  const [sortBy, setSortBy]       = useState('priceMonthly')
  const [sortDir, setSortDir]     = useState<'asc' | 'desc'>('asc')
  
  const { data: plans = [], isLoading } = usePlans({ search, sortBy, sortDir })
  const del = useDeletePlan()
  const [showForm, setShowForm] = useState(false)
  const [editPlan, setEditPlan] = useState<Plan | undefined>()

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const handleDelete = (p: Plan) => {
    if (window.confirm(t('plans.delete_confirm', { name: p.name }))) {
      del.mutate(p.id)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in-up">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="section-tag">{t('plans.tag')}</p>
          <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">{t('plans.title')}</h1>
          {!isLoading && <p className="font-mono text-xs text-[var(--text-muted)] mt-1 tracking-widest">{t('plans.active_count', { count: plans.length })}</p>}
        </div>
        <button className="btn-primary text-xs" onClick={() => setShowForm(true)}>{t('plans.new_plan')}</button>
      </div>

      <div className="mb-4">
        <input
          className="form-input max-w-xs text-sm"
          placeholder={t('clients.search_placeholder')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] p-16 text-center">
          <p className="font-mono text-xs text-[var(--text-muted)] tracking-[4px] animate-pulse uppercase">{t('plans.loading')}</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden">
          <div className="grid grid-cols-[1.5fr_1fr_2fr_1.5fr_auto] gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-1)]">
            {[
              { label: t('plans.col_plan'), key: 'name' },
              { label: t('plans.col_price'), key: 'priceMonthly' },
              { label: t('plans.col_limits'), key: '' },
              { label: t('plans.col_features'), key: '' },
              { label: t('plans.col_actions'), key: '' },
            ].map(h => (
              <button 
                key={h.label}
                className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase text-left flex items-center gap-1"
                onClick={() => h.key && toggleSort(h.key)}
              >
                {h.label}
                {sortBy === h.key && <span className="text-[10px]">{sortDir === 'asc' ? '▲' : '▼'}</span>}
              </button>
            ))}
          </div>

          <div className="divide-y divide-[var(--border)]">
            {plans.map(p => (
              <div key={p.id} className={`grid grid-cols-[1.5fr_1fr_2fr_1.5fr_auto] gap-4 px-5 py-4 items-center transition-colors hover:bg-[var(--bg-1)] ${!p.isActive && 'opacity-40'}`}>
                <div>
                  <p className="font-rajdhani font-semibold text-[var(--text)] text-base">{p.name}</p>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider">{p.slug}</p>
                </div>
                <div>
                  <p className="font-mono text-base text-[var(--text)]">{p.priceMonthly}€<span className="text-[10px] text-[var(--text-muted)] ml-1">/mes</span></p>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-tighter">Dom: <span className="text-[var(--text)]">{p.maxDomains}</span></p>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-tighter">Usr: <span className="text-[var(--text)]">{p.maxUsers}</span></p>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-tighter">Conv: <span className="text-[var(--text)]">{p.maxConversations ?? '∞'}</span></p>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-tighter">Tok: <span className="text-[var(--text)]">{p.maxTokens ?? '∞'}</span></p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {p.hasLandingPro && <span className="badge-feature">LANDING</span>}
                  {p.hasCustomDomain && <span className="badge-feature">DOMAIN</span>}
                  {p.hasRag && <span className="badge-feature">RAG</span>}
                  {p.hasTelegram && <span className="badge-feature">TEL</span>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditPlan(p)} className="btn-outline text-[9px] px-3 py-1.5">{t('clients.edit')}</button>
                  <button onClick={() => handleDelete(p)} className="btn-outline text-[9px] px-3 py-1.5 border-[#ff4444]/20 text-[#ff4444]/60 hover:text-[#ff4444] hover:bg-[#ff4444]/10">✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(showForm || editPlan) && (
        <PlanForm
          plan={editPlan}
          onClose={() => { setShowForm(false); setEditPlan(undefined) }}
        />
      )}

      <style jsx>{`
        .badge-feature {
          font-family: var(--font-mono);
          font-size: 8px;
          letter-spacing: 1px;
          padding: 1px 4px;
          border: 1px solid var(--border);
          color: var(--text-muted);
        }
      `}</style>
    </div>
  )
}
