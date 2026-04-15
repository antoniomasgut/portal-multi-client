'use client'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePlans, useCreateClient, useUpdateClient } from '../../../../hooks/useClients'
import type { Client } from '../../../../types'

const AVAILABLE_SERVICES = [
  'WhatsApp bot 24/7',
  'Landing page IA',
  'Gestió de domini',
  'Informes mensuals',
  'Informes setmanals',
  'Automatitzacions (n8n)',
  'Accés API',
  'Suport per email',
  'Suport prioritari',
  'Suport telefònic',
  'Account manager dedicat',
  'SLA 99.9%',
]

const schema = z.object({
  companyName:  z.string().min(2, 'Mínim 2 caràcters'),
  contactName:  z.string().min(2, 'Mínim 2 caràcters'),
  contactEmail: z.string().email('Email no vàlid'),
  contactPhone: z.string().optional(),
  nif:          z.string().optional(),
  address:      z.string().optional(),
  domain:       z.string().optional(),
  notes:        z.string().optional(),
  planId:       z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props {
  client:  Client | null
  onClose: () => void
}

export default function ClientForm({ client, onClose }: Props) {
  const { data: plans = [] } = usePlans()
  const createClient         = useCreateClient()
  const updateClient         = useUpdateClient(client?.id ?? '')
  const isEdit               = !!client

  const activeSub     = client?.subscriptions.find(s => s.status === 'ACTIVE')
  const activePlanId  = activeSub?.isCustom ? 'custom' : (activeSub?.plan?.id ?? '')

  const [planMode, setPlanMode]             = useState<string>(activePlanId)
  const [customPrice, setCustomPrice]       = useState<string>(
    activeSub?.customPriceMonthly?.toString() ?? ''
  )
  const [selectedServices, setSelectedServices] = useState<string[]>(
    activeSub?.customFeatures ?? []
  )
  const [submitError, setSubmitError] = useState('')

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

  const toggleService = (service: string) => {
    setSelectedServices(prev =>
      prev.includes(service) ? prev.filter(s => s !== service) : [...prev, service]
    )
  }

  const onSubmit = async (data: FormData) => {
    setSubmitError('')
    try {
      const isCustom = planMode === 'custom'

      if (isCustom && selectedServices.length === 0) {
        setSubmitError('Selecciona almenys un servei per al pla personalitzat')
        return
      }
      if (isCustom && !customPrice) {
        setSubmitError('Introdueix el preu mensual del pla personalitzat')
        return
      }

      const planPayload = planMode === ''
        ? {}
        : isCustom
          ? { isCustom: true as const, customPriceMonthly: parseFloat(customPrice), customFeatures: selectedServices }
          : { planId: planMode }

      if (isEdit) {
        await updateClient.mutateAsync({ ...data, ...planPayload })
      } else {
        await createClient.mutateAsync({ ...data, ...planPayload })
      }
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

          {/* ── Selector de pla ─────────────────────────────────────── */}
          <div className="border-t border-[var(--border)] pt-5">
            <label className="form-label">
              Pla contractat {!isEdit && <span className="text-[var(--text-muted)]">(opcional)</span>}
            </label>
            <select
              className="form-input"
              value={planMode}
              onChange={e => setPlanMode(e.target.value)}
            >
              <option value="">— Sense pla assignat —</option>
              {plans.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.priceMonthly}€/mes
                </option>
              ))}
              <option value="custom">✦ Pla personalitzat</option>
            </select>
          </div>

          {/* ── Pla personalitzat ────────────────────────────────────── */}
          {planMode === 'custom' && (
            <div className="bg-[var(--bg-0)] border border-[#FF6B00]/30 p-5 space-y-4">
              <p className="font-mono text-[10px] tracking-[3px] text-[#FF6B00] uppercase">
                Configuració del pla personalitzat
              </p>

              <div>
                <label className="form-label">Preu mensual (€) *</label>
                <input
                  className="form-input max-w-[180px]"
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="0.00"
                  value={customPrice}
                  onChange={e => setCustomPrice(e.target.value)}
                />
              </div>

              <div>
                <label className="form-label mb-3 block">Serveis inclosos *</label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_SERVICES.map(service => (
                    <label
                      key={service}
                      className={`flex items-center gap-2 p-2 border cursor-pointer transition-colors ${
                        selectedServices.includes(service)
                          ? 'border-[#FF6B00] bg-[#FF6B00]/10'
                          : 'border-[var(--border)] hover:border-[var(--text-muted)]'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-[#FF6B00]"
                        checked={selectedServices.includes(service)}
                        onChange={() => toggleService(service)}
                      />
                      <span className="font-rajdhani text-sm text-[var(--text)]">{service}</span>
                    </label>
                  ))}
                </div>
                {selectedServices.length > 0 && (
                  <p className="font-mono text-[10px] text-[#FF6B00] mt-2">
                    {selectedServices.length} servei{selectedServices.length !== 1 ? 's' : ''} seleccionat{selectedServices.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
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
