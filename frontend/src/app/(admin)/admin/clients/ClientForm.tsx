'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePlans, useCreateClient, useUpdateClient } from '../../../../hooks/useClients'
import { useServices } from '../../../../hooks/useServices'
import type { Client, Service } from '../../../../types'
import CredentialsPanel from './CredentialsPanel'
import ConnectionsPanel from './ConnectionsPanel'
import LandingEditor    from './LandingEditor'

// ── Badge descriptors per pla ────────────────────────────────────────────
const PLAN_STYLES: Record<string, {
  accent: string
  bg:     string
  border: string
  label:  string
  short:  string
}> = {
  basic:       { accent: '#4ade80', bg: 'bg-[#4ade80]/5',  border: 'border-[#4ade80]/30', label: 'Bàsic',       short: 'BÀS' },
  pro:         { accent: '#60a5fa', bg: 'bg-[#60a5fa]/5',  border: 'border-[#60a5fa]/30', label: 'Pro',         short: 'PRO' },
  premium:     { accent: '#c084fc', bg: 'bg-[#c084fc]/5',  border: 'border-[#c084fc]/30', label: 'Premium',     short: 'PRE' },
  empresarial: { accent: '#FF6B00', bg: 'bg-[#FF6B00]/5',  border: 'border-[#FF6B00]/30', label: 'Empresarial', short: 'EMP' },
}

// ── Esquema ──────────────────────────────────────────────────────────────
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

  const [planMode, setPlanMode]         = useState(initPlanMode)
  const [extraIds, setExtraIds]         = useState<string[]>(initExtras)
  const [customIds, setCustomIds]       = useState<string[]>(initCustom)
  const [priceMonthly, setPriceMonthly] = useState(activeSub?.priceMonthly?.toString() ?? '')
  const [priceSetup, setPriceSetup]     = useState(activeSub?.priceSetup?.toString() ?? '')
  const [submitError, setSubmitError]   = useState('')

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

  const selectedPlan   = plans.find(p => p.id === planMode)
  const planServiceIds = selectedPlan?.services.map(ps => ps.service.id) ?? []

  const servicePlanMap = Object.fromEntries(
    services.map(s => [s.id, (s.planServices ?? []).map(ps => ps.plan.slug)])
  )

  const calcPrices = (ids: string[], baseMonthly = 0, baseSetup = 0) => {
    const sel     = services.filter(s => ids.includes(s.id))
    const monthly = baseMonthly + sel.reduce((a, s) => a + Number(s.monthlyPrice), 0)
    const setup   = baseSetup   + sel.reduce((a, s) => a + Number(s.setupPrice),   0)
    return { monthly, setup }
  }

  const toggleExtra = (id: string) => {
    const next = extraIds.includes(id) ? extraIds.filter(x => x !== id) : [...extraIds, id]
    const base = selectedPlan ? Number(selectedPlan.priceMonthly) : 0
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

  const selectPlan = (id: string) => {
    const newPlan = plans.find(p => p.id === id)
    setPlanMode(id)
    setExtraIds([])
    setCustomIds([])
    if (newPlan) {
      setPriceMonthly(Number(newPlan.priceMonthly).toString())
      setPriceSetup('0')
    } else if (id === 'custom') {
      setPriceMonthly('0')
      setPriceSetup('0')
    } else {
      setPriceMonthly('')
      setPriceSetup('')
    }
  }

  const onSubmit = async (data: FormData) => {
    setSubmitError('')
    try {
      const isCustom = planMode === 'custom'
      if (isCustom && customIds.length === 0) { setSubmitError('Selecciona almenys un servei'); return }
      if (isCustom && !priceMonthly)          { setSubmitError('Introdueix el preu mensual');   return }

      const pm = priceMonthly ? parseFloat(priceMonthly) : undefined
      const ps = priceSetup   ? parseFloat(priceSetup)   : undefined

      const planPayload =
        planMode === '' ? {} :
        isCustom        ? { isCustom: true as const, priceMonthly: pm ?? 0, priceSetup: ps ?? 0, serviceIds: customIds } :
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
    <div className="p-6 max-w-3xl mx-auto">

        {/* ── Header ──────────────────────────────────────────── */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="section-tag">{isEdit ? 'EDITAR CLIENT' : 'NOU CLIENT'}</p>
            <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">
              {isEdit ? client.companyName : 'Alta de client'}
            </h1>
          </div>
          <button className="btn-outline text-xs" onClick={onClose}>CANCEL·LAR</button>
        </div>

        {submitError && (
          <div className="alert-danger mb-6">
            <p className="font-rajdhani text-[#ff4444]">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* ── Dades empresa ─────────────────────────────────── */}
          <section className="bg-[var(--bg-2)] border border-[var(--border)] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 bg-[#FF6B00]" />
              <p className="font-mono text-[10px] tracking-[4px] text-[#FF6B00] uppercase">Dades empresa</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="form-label">Nom empresa *</label>
                <input className="form-input" {...register('companyName')} />
                {errors.companyName && <p className="font-mono text-[10px] text-[#ff4444] mt-1">{errors.companyName.message}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="form-label">NIF / CIF</label>
                <input className="form-input" {...register('nif')} />
              </div>
              <div className="col-span-2">
                <label className="form-label">Adreça</label>
                <input className="form-input" {...register('address')} />
              </div>
              <div className="col-span-2">
                <label className="form-label">Domini web</label>
                <input className="form-input" placeholder="exemple.com" {...register('domain')} />
              </div>
            </div>
          </section>

          {/* ── Dades contacte ────────────────────────────────── */}
          <section className="bg-[var(--bg-2)] border border-[var(--border)] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 bg-[#60a5fa]" />
              <p className="font-mono text-[10px] tracking-[4px] text-[#60a5fa] uppercase">Contacte</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="form-label">Persona de contacte *</label>
                <input className="form-input" {...register('contactName')} />
                {errors.contactName && <p className="font-mono text-[10px] text-[#ff4444] mt-1">{errors.contactName.message}</p>}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="form-label">Telèfon</label>
                <input className="form-input" type="tel" {...register('contactPhone')} />
              </div>
              <div className="col-span-2">
                <label className="form-label">Email de contacte *</label>
                <input className="form-input" type="email" {...register('contactEmail')} />
                {errors.contactEmail && <p className="font-mono text-[10px] text-[#ff4444] mt-1">{errors.contactEmail.message}</p>}
              </div>
              <div className="col-span-2">
                <label className="form-label">Notes internes</label>
                <textarea className="form-input h-20 resize-none" {...register('notes')} />
              </div>
            </div>
          </section>

          {/* ── Pla contractat ────────────────────────────────── */}
          <section className="bg-[var(--bg-2)] border border-[var(--border)] p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-5 bg-[#c084fc]" />
              <p className="font-mono text-[10px] tracking-[4px] text-[#c084fc] uppercase">Pla contractat</p>
            </div>

            {/* Cards de plans */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
              {/* Opció: sense pla */}
              <button
                type="button"
                onClick={() => selectPlan('')}
                className={`p-3 border text-left transition-all ${
                  planMode === ''
                    ? 'border-[var(--text-muted)] bg-[var(--bg-1)]'
                    : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                }`}
              >
                <p className="font-mono text-[9px] tracking-widest text-[var(--text-muted)] uppercase mb-1">SENSE PLA</p>
                <p className="font-rajdhani text-sm text-[var(--text-muted)]">Sense subscripció</p>
              </button>

              {/* Plans estàndard */}
              {plans.map(p => {
                const style   = PLAN_STYLES[p.slug]
                const isActive = planMode === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectPlan(p.id)}
                    className={`p-3 border text-left transition-all ${
                      isActive
                        ? `${style?.border ?? 'border-[#FF6B00]'} ${style?.bg ?? ''}`
                        : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    <p className="font-mono text-[9px] tracking-widest uppercase mb-1"
                      style={{ color: isActive ? (style?.accent ?? '#FF6B00') : 'var(--text-muted)' }}>
                      {p.services.length} SERVEIS
                    </p>
                    <p className="font-rajdhani font-semibold text-sm text-[var(--text)]">{p.name}</p>
                    <p className="font-mono text-[10px] mt-0.5" style={{ color: style?.accent ?? '#FF6B00' }}>
                      {p.priceMonthly}€/mes
                    </p>
                  </button>
                )
              })}

              {/* Pla personalitzat */}
              <button
                type="button"
                onClick={() => selectPlan('custom')}
                className={`p-3 border text-left transition-all col-span-2 sm:col-span-1 ${
                  planMode === 'custom'
                    ? 'border-[#FF6B00] bg-[#FF6B00]/5'
                    : 'border-[#FF6B00]/30 hover:border-[#FF6B00]'
                }`}
              >
                <p className="font-mono text-[9px] tracking-widest text-[#FF6B00] uppercase mb-1">PERSONALITZAT</p>
                <p className="font-rajdhani font-semibold text-sm text-[var(--text)]">Pla a mida</p>
                <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">Selecció lliure</p>
              </button>
            </div>

            {/* ── Serveis del pla estàndard (bloquejats) ──────── */}
            {planMode && planMode !== 'custom' && selectedPlan && (
              <div className="mt-4 space-y-4">
                {/* Serveis inclosos */}
                <div>
                  <p className="font-mono text-[9px] tracking-[3px] text-[var(--text-muted)] uppercase mb-2">
                    Inclosos al pla {selectedPlan.name}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPlan.services.map(ps => {
                      const style = PLAN_STYLES[selectedPlan.slug]
                      return (
                        <span
                          key={ps.service.id}
                          className="font-mono text-[9px] tracking-wider px-2 py-1 border"
                          style={{ color: style?.accent ?? '#FF6B00', borderColor: `${style?.accent ?? '#FF6B00'}40` }}
                        >
                          ✓ {ps.service.name}
                        </span>
                      )
                    })}
                  </div>
                </div>

                {/* Serveis extra disponibles */}
                {services.filter(s => !planServiceIds.includes(s.id)).length > 0 && (
                  <div>
                    <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase mb-2">
                      Serveis addicionals (opcional)
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
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
                    {extraIds.length > 0 && (
                      <PriceFields
                        priceMonthly={priceMonthly}
                        priceSetup={priceSetup}
                        onChangeMonthly={setPriceMonthly}
                        onChangeSetup={setPriceSetup}
                      />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Pla personalitzat ────────────────────────────── */}
            {planMode === 'custom' && (
              <div className="mt-4 space-y-3">
                <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase mb-2">
                  Selecciona els serveis contractats
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
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
                {customIds.length > 0 ? (
                  <PriceFields
                    priceMonthly={priceMonthly}
                    priceSetup={priceSetup}
                    onChangeMonthly={setPriceMonthly}
                    onChangeSetup={setPriceSetup}
                  />
                ) : (
                  <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest py-2">
                    Selecciona serveis per calcular el preu
                  </p>
                )}
              </div>
            )}
          </section>

          {/* ── Micro-Landing (només edició) ─────────────────── */}
          {isEdit && (
            <section className="bg-[var(--bg-2)] border border-[var(--border)] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 bg-[#c084fc]" />
                <p className="font-mono text-[10px] tracking-[4px] text-[#c084fc] uppercase">Micro-Landing</p>
              </div>
              <LandingEditor clientId={client!.id} companyName={client!.companyName} />
            </section>
          )}

          {/* ── Connexions OAuth (només edició) ───────────────── */}
          {isEdit && (
            <section className="bg-[var(--bg-2)] border border-[var(--border)] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 bg-[#4ade80]" />
                <p className="font-mono text-[10px] tracking-[4px] text-[#4ade80] uppercase">Connexions</p>
              </div>
              <ConnectionsPanel clientId={client!.id} />
            </section>
          )}

          {/* ── Credencials API (només edició) ────────────────── */}
          {isEdit && (
            <section className="bg-[var(--bg-2)] border border-[var(--border)] p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-1 h-5 bg-[#8888aa]" />
                <p className="font-mono text-[10px] tracking-[4px] text-[var(--text-muted)] uppercase">Credencials API</p>
              </div>
              <CredentialsPanel clientId={client!.id} />
            </section>
          )}

          {/* ── Botons ────────────────────────────────────────── */}
          <div className="flex gap-3 pb-8">
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'DESANT...' : isEdit ? 'DESAR CANVIS' : 'CREAR CLIENT'}
            </button>
            <button type="button" className="btn-outline" onClick={onClose}>
              CANCEL·LAR
            </button>
          </div>

        </form>
    </div>
  )
}

// ── PriceFields ──────────────────────────────────────────────────────────
function PriceFields({ priceMonthly, priceSetup, onChangeMonthly, onChangeSetup }: {
  priceMonthly:    string
  priceSetup:      string
  onChangeMonthly: (v: string) => void
  onChangeSetup:   (v: string) => void
}) {
  return (
    <div className="mt-4 p-4 bg-[var(--bg-1)] border border-[#FF6B00]/20">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-1 h-4 bg-[#FF6B00]" />
        <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase">Preu final del contracte</p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="form-label text-[9px]">Setup (€) — pagament únic</label>
          <div className="relative">
            <input
              className="form-input pr-8"
              type="number" min="0" step="0.01" placeholder="0.00"
              value={priceSetup}
              onChange={e => onChangeSetup(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[var(--text-muted)]">€</span>
          </div>
        </div>
        <div>
          <label className="form-label text-[9px]">Mensual (€) — recurrent</label>
          <div className="relative">
            <input
              className="form-input pr-8"
              type="number" min="0" step="0.01" placeholder="0.00"
              value={priceMonthly}
              onChange={e => onChangeMonthly(e.target.value)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[11px] text-[var(--text-muted)]">€</span>
          </div>
        </div>
      </div>
      <p className="font-mono text-[9px] text-[var(--text-muted)] mt-2">
        Calculat automàticament a partir dels serveis · Pots modificar-lo lliurement
      </p>
    </div>
  )
}

// ── ServiceCheckbox ──────────────────────────────────────────────────────
function ServiceCheckbox({ service, checked, onChange, planSlugs }: {
  service:   Service
  checked:   boolean
  onChange:  () => void
  planSlugs: string[]
}) {
  return (
    <label className={`flex items-start gap-2.5 p-2.5 border cursor-pointer transition-all ${
      checked
        ? 'border-[#FF6B00] bg-[#FF6B00]/8'
        : 'border-[var(--border)] hover:border-[var(--text-muted)]'
    }`}>
      <input type="checkbox" className="accent-[#FF6B00] mt-0.5 shrink-0" checked={checked} onChange={onChange} />
      <div className="flex-1 min-w-0">
        <p className="font-rajdhani text-sm text-[var(--text)] leading-tight">{service.name}</p>
        <p className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5">
          {service.setupPrice > 0 && `${service.setupPrice}€ setup`}
          {service.setupPrice > 0 && service.monthlyPrice > 0 && ' · '}
          {service.monthlyPrice > 0 && `${service.monthlyPrice}€/mes`}
          {service.setupPrice === 0 && service.monthlyPrice === 0 && 'sense cost addicional'}
        </p>
      </div>
      {planSlugs.length > 0 && (
        <div className="flex flex-col gap-0.5 shrink-0">
          {planSlugs.map(slug => {
            const style = PLAN_STYLES[slug]
            if (!style) return null
            return (
              <span
                key={slug}
                className="font-mono text-[7px] tracking-wider px-1 py-0.5 border text-center"
                style={{ color: style.accent, borderColor: `${style.accent}40` }}
              >
                {style.short}
              </span>
            )
          })}
        </div>
      )}
    </label>
  )
}
