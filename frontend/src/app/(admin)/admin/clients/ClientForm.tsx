'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePlans, useCreateClient, useUpdateClient } from '../../../../hooks/useClients'
import { useServices } from '../../../../hooks/useServices'
import type { Client, Service } from '../../../../types'

const PLAN_BADGES: Record<string, { label: string; cls: string }> = {
  basic:       { label: 'Bàsic',       cls: 'text-[#4ade80] border-[#4ade80]/40' },
  pro:         { label: 'Pro',         cls: 'text-[#60a5fa] border-[#60a5fa]/40' },
  premium:     { label: 'Premium',     cls: 'text-[#c084fc] border-[#c084fc]/40' },
  empresarial: { label: 'Empresarial', cls: 'text-[#FF6B00] border-[#FF6B00]/40' },
}

const schema = z.object({
  companyName:  z.string().min(2, 'Mínim 2 caràcters'),
  contactName:  z.string().min(2, 'Mínim 2 caràcters'),
  contactEmail: z.string().email('Email no vàlid'),
  contactPhone: z.string().optional(),
  nif:          z.string().optional(),
  address:      z.string().optional(),
  domain:       z.string().optional(),
  notes:        z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  client:  Client | null
  onClose: () => void
}

export default function ClientForm({ client, onClose }: Props) {
  const { data: plans    = [] } = usePlans()
  const { data: services = [] } = useServices()
  const createClient = useCreateClient()
  const updateClient = useUpdateClient(client?.id ?? '')
  const isEdit       = !!client

  const activeSub    = client?.subscriptions.find(s => s.status === 'ACTIVE')
  const initPlanMode = activeSub?.isCustom ? 'custom' : (activeSub?.plan?.id ?? '')
  const initExtras   = activeSub?.services.filter(s => s.isExtra).map(s => s.serviceId) ?? []
  const initCustom   = activeSub?.services.filter(s => !s.isExtra).map(s => s.serviceId) ?? []

  const [planMode, setPlanMode]           = useState(initPlanMode)
  const [extraIds, setExtraIds]           = useState<string[]>(initExtras)
  const [customIds, setCustomIds]         = useState<string[]>(initCustom)
  const [priceMonthly, setPriceMonthly]   = useState(activeSub?.priceMonthly?.toString() ?? '')
  const [priceSetup, setPriceSetup]       = useState(activeSub?.priceSetup?.toString() ?? '')
  const [submitError, setSubmitError]     = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      companyName:  client?.companyName  ?? '',
      contactName:  client?.contactName  ?? '',
      contactEmail: client?.contactEmail ?? '',
      contactPhone: client?.contactPhone ?? '',
      nif:          client?.nif          ?? '',
      address:      client?.address      ?? '',
      domain:       client?.domain       ?? '',
      notes:        client?.notes        ?? '',
    },
  })

  // Serveis inclosos al pla seleccionat
  const selectedPlan    = plans.find(p => p.id === planMode)
  const planServiceIds  = selectedPlan?.services.map(ps => ps.service.id) ?? []

  // Mapa: serviceId → plans que l'inclouen
  const servicePlanMap = Object.fromEntries(
    services.map(s => [
      s.id,
      (s.planServices ?? []).map(ps => ps.plan.slug),
    ])
  )

  const calcPrices = (ids: string[], baseMonthly = 0, baseSetup = 0) => {
    const selected = services.filter(s => ids.includes(s.id))
    const monthly  = baseMonthly + selected.reduce((a, s) => a + Number(s.monthlyPrice), 0)
    const setup    = baseSetup   + selected.reduce((a, s) => a + Number(s.setupPrice),   0)
    return { monthly, setup }
  }

  const toggleExtra = (id: string) => {
    const next    = extraIds.includes(id) ? extraIds.filter(x => x !== id) : [...extraIds, id]
    const base    = selectedPlan ? Number(selectedPlan.priceMonthly) : 0
    const { monthly, setup } = calcPrices(next, base, 0)
    setExtraIds(next)
    setPriceMonthly(monthly.toString())
    setPriceSetup(setup.toString())
  }

  const toggleCustom = (id: string) => {
    const next = customIds.includes(id) ? customIds.filter(x => x !== id) : [...customIds, id]
    const { monthly, setup } = calcPrices(next)
    setCustomIds(next)
    setPriceMonthly(monthly.toString())
    setPriceSetup(setup.toString())
  }

  const onSubmit = async (data: FormData) => {
    setSubmitError('')
    try {
      const isCustom = planMode === 'custom'

      if (isCustom) {
        if (customIds.length === 0) { setSubmitError('Selecciona almenys un servei'); return }
        if (!priceMonthly)          { setSubmitError('Introdueix el preu mensual');   return }
      }

      const pm = priceMonthly ? parseFloat(priceMonthly) : undefined
      const ps = priceSetup   ? parseFloat(priceSetup)   : undefined

      const planPayload =
        planMode === ''     ? {} :
        isCustom            ? { isCustom: true as const, priceMonthly: pm ?? 0, priceSetup: ps ?? 0, serviceIds: customIds } :
        extraIds.length > 0 ? { planId: planMode, extraServiceIds: extraIds, priceMonthly: pm, priceSetup: ps } :
                              { planId: planMode, priceMonthly: pm, priceSetup: ps }

      if (isEdit) await updateClient.mutateAsync({ ...data, ...planPayload })
      else        await createClient.mutateAsync({ ...data, ...planPayload })
      onClose()
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Error en desar el client')
    }
  }

  return (
    <main className="grid-bg min-h-screen p-8 relative">
      <div className="relative z-10 max-w-2xl mx-auto">

        <div className="mb-8">
          <p className="section-tag">{isEdit ? 'EDITAR CLIENT' : 'NOU CLIENT'}</p>
          <h1 className="font-orbitron font-black text-2xl text-[#FF6B00]">
            {isEdit ? client.companyName : 'Alta de client'}
          </h1>
        </div>

        {submitError && (
          <div className="alert-danger mb-4">
            <p className="font-rajdhani text-[#ff4444] text-sm">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-5">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Nom empresa *</label>
              <input className="form-input" {...register('companyName')} />
              {errors.companyName && <p className="font-mono text-[11px] text-[#ff4444] mt-1">{errors.companyName.message}</p>}
            </div>
            <div>
              <label className="form-label">Persona de contacte *</label>
              <input className="form-input" {...register('contactName')} />
              {errors.contactName && <p className="font-mono text-[11px] text-[#ff4444] mt-1">{errors.contactName.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Email de contacte *</label>
              <input className="form-input" type="email" {...register('contactEmail')} />
              {errors.contactEmail && <p className="font-mono text-[11px] text-[#ff4444] mt-1">{errors.contactEmail.message}</p>}
            </div>
            <div>
              <label className="form-label">Telèfon</label>
              <input className="form-input" type="tel" {...register('contactPhone')} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">NIF / CIF</label>
              <input className="form-input" {...register('nif')} />
            </div>
            <div>
              <label className="form-label">Domini web</label>
              <input className="form-input" placeholder="exemple.com" {...register('domain')} />
            </div>
          </div>

          <div>
            <label className="form-label">Adreça</label>
            <input className="form-input" {...register('address')} />
          </div>

          <div>
            <label className="form-label">Notes internes</label>
            <textarea className="form-input h-20 resize-none" {...register('notes')} />
          </div>

          {/* ── Selector de pla ───────────────────────────────── */}
          <div className="border-t border-[var(--border)] pt-5">
            <label className="form-label">Pla contractat</label>
            <select
              className="form-input"
              value={planMode}
              onChange={e => {
                const newPlan = plans.find(p => p.id === e.target.value)
                setPlanMode(e.target.value)
                setExtraIds([])
                setCustomIds([])
                if (newPlan) {
                  setPriceMonthly(Number(newPlan.priceMonthly).toString())
                  setPriceSetup('0')
                } else if (e.target.value === 'custom') {
                  setPriceMonthly('0')
                  setPriceSetup('0')
                } else {
                  setPriceMonthly('')
                  setPriceSetup('')
                }
              }}
            >
              <option value="">— Sense pla assignat —</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.priceMonthly}€/mes ({p.services.length} serveis)
                </option>
              ))}
              <option value="custom">✦ Pla personalitzat</option>
            </select>
          </div>

          {/* ── Serveis del pla seleccionat (bloquejats) ─────── */}
          {planMode && planMode !== 'custom' && selectedPlan && (
            <div className="bg-[var(--bg-0)] border border-[var(--border)] p-4">
              <p className="font-mono text-[10px] tracking-[3px] text-[var(--text-muted)] uppercase mb-3">
                Serveis inclosos al pla {selectedPlan.name}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedPlan.services.map(ps => (
                  <span key={ps.service.id} className="font-rajdhani text-sm text-[var(--text)] bg-[var(--bg-1)] border border-[var(--border)] px-2 py-1">
                    ✓ {ps.service.name}
                  </span>
                ))}
              </div>

              {/* Serveis extra disponibles */}
              {services.filter(s => !planServiceIds.includes(s.id)).length > 0 && (
                <>
                  <p className="font-mono text-[10px] tracking-[3px] text-[#FF6B00] uppercase mb-2">
                    Serveis addicionals
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {services.filter(s => !planServiceIds.includes(s.id)).map(s => (
                      <ServiceCheckbox
                        key={s.id}
                        service={s}
                        checked={extraIds.includes(s.id)}
                        onChange={() => toggleExtra(s.id)}
                        planSlugs={servicePlanMap[s.id] ?? []}
                      />
                    ))}
                  </div>
                  <PriceFields
                    priceMonthly={priceMonthly}
                    priceSetup={priceSetup}
                    onChangeMonthly={setPriceMonthly}
                    onChangeSetup={setPriceSetup}
                    showAlways={extraIds.length > 0}
                  />
                </>
              )}
            </div>
          )}

          {/* ── Pla personalitzat ─────────────────────────────── */}
          {planMode === 'custom' && (
            <div className="bg-[var(--bg-0)] border border-[#FF6B00]/30 p-4 space-y-4">
              <p className="font-mono text-[10px] tracking-[3px] text-[#FF6B00] uppercase">
                Pla personalitzat — selecciona serveis
              </p>
              <div className="grid grid-cols-1 gap-1">
                {services.map(s => (
                  <ServiceCheckbox
                    key={s.id}
                    service={s}
                    checked={customIds.includes(s.id)}
                    onChange={() => toggleCustom(s.id)}
                    planSlugs={servicePlanMap[s.id] ?? []}
                  />
                ))}
              </div>
              {customIds.length > 0 && (
                <p className="font-mono text-[10px] text-[#FF6B00]">
                  {customIds.length} servei{customIds.length !== 1 ? 's' : ''} seleccionat{customIds.length !== 1 ? 's' : ''}
                </p>
              )}
              <PriceFields
                priceMonthly={priceMonthly}
                priceSetup={priceSetup}
                onChangeMonthly={setPriceMonthly}
                onChangeSetup={setPriceSetup}
                showAlways
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'DESANT...' : isEdit ? 'DESAR CANVIS' : 'CREAR CLIENT'}
            </button>
            <button type="button" className="btn-outline" onClick={onClose}>
              CANCEL·LAR
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

// ── Camps de preu editables ────────────────────────────────────────────
function PriceFields({ priceMonthly, priceSetup, onChangeMonthly, onChangeSetup, showAlways }: {
  priceMonthly:    string
  priceSetup:      string
  onChangeMonthly: (v: string) => void
  onChangeSetup:   (v: string) => void
  showAlways?:     boolean
}) {
  if (!showAlways && !priceMonthly && !priceSetup) return null
  return (
    <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[var(--border)]">
      <div>
        <label className="form-label">
          Setup (€)
          <span className="text-[var(--text-muted)] font-normal ml-1">(únic)</span>
        </label>
        <input
          className="form-input"
          type="number" min="0" step="0.01" placeholder="0.00"
          value={priceSetup}
          onChange={e => onChangeSetup(e.target.value)}
        />
      </div>
      <div>
        <label className="form-label">
          Mensual (€)
          <span className="text-[var(--text-muted)] font-normal ml-1">(recurrent)</span>
        </label>
        <input
          className="form-input"
          type="number" min="0" step="0.01" placeholder="0.00"
          value={priceMonthly}
          onChange={e => onChangeMonthly(e.target.value)}
        />
      </div>
      <p className="col-span-2 font-mono text-[10px] text-[var(--text-muted)]">
        Preus calculats automàticament. Pots modificar-los lliurement.
      </p>
    </div>
  )
}

// ── Component de checkbox amb indicadors de pla ────────────────────────
function ServiceCheckbox({ service, checked, onChange, planSlugs }: {
  service:   Service
  checked:   boolean
  onChange:  () => void
  planSlugs: string[]
}) {
  return (
    <label className={`flex items-center gap-3 p-2 border cursor-pointer transition-colors ${
      checked
        ? 'border-[#FF6B00] bg-[#FF6B00]/10'
        : 'border-[var(--border)] hover:border-[var(--text-muted)]'
    }`}>
      <input type="checkbox" className="accent-[#FF6B00]" checked={checked} onChange={onChange} />
      <span className="font-rajdhani text-sm text-[var(--text)] flex-1">{service.name}</span>
      <span className="font-mono text-[10px] text-[var(--text-muted)] whitespace-nowrap">
        {service.setupPrice > 0 && `${service.setupPrice}€ setup`}
        {service.setupPrice > 0 && service.monthlyPrice > 0 && ' · '}
        {service.monthlyPrice > 0 && `${service.monthlyPrice}€/mes`}
      </span>
      <div className="flex gap-1">
        {planSlugs.map(slug => {
          const badge = PLAN_BADGES[slug]
          if (!badge) return null
          return (
            <span key={slug} className={`font-mono text-[8px] tracking-wider px-1.5 py-0.5 border ${badge.cls}`}>
              {badge.label.slice(0, 3).toUpperCase()}
            </span>
          )
        })}
      </div>
    </label>
  )
}
