'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { usePlans, useCreateClient, useUpdateClient } from '../../../../hooks/useClients'
import type { Client } from '../../../../types'

const schema = z.object({
  companyName:  z.string().min(2, 'Mínim 2 caràcters'),
  contactName:  z.string().min(2, 'Mínim 2 caràcters'),
  contactEmail: z.string().email('Email no vàlid'),
  contactPhone: z.string().optional(),
  nif:          z.string().optional(),
  address:      z.string().optional(),
  domain:       z.string().optional(),
  notes:        z.string().optional(),
  planId:       z.string().uuid('Selecciona un pla'),
})
type FormData = z.infer<typeof schema>

interface Props {
  client:   Client | null
  onClose:  () => void
}

export default function ClientForm({ client, onClose }: Props) {
  const { data: plans = [] }  = usePlans()
  const createClient          = useCreateClient()
  const updateClient          = useUpdateClient(client?.id ?? '')

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: client ? {
      companyName:  client.companyName,
      contactName:  client.contactName,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone ?? '',
      nif:          client.nif ?? '',
      address:      client.address ?? '',
      domain:       client.domain ?? '',
      notes:        client.notes ?? '',
      planId:       client.subscriptions.find(s => s.status === 'ACTIVE')?.plan.id ?? '',
    } : {},
  })

  const onSubmit = async (data: FormData) => {
    if (client) {
      const { planId, ...rest } = data
      await updateClient.mutateAsync(rest)
    } else {
      await createClient.mutateAsync(data)
    }
    onClose()
  }

  const isEdit = !!client

  return (
    <main className="grid-bg min-h-screen p-8 relative">
      <div className="relative z-10 max-w-2xl mx-auto">

        <div className="mb-8">
          <p className="section-tag">{isEdit ? 'EDITAR CLIENT' : 'NOU CLIENT'}</p>
          <h1 className="font-orbitron font-black text-2xl text-[#FF6B00]">
            {isEdit ? client.companyName : 'Alta de client'}
          </h1>
        </div>

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

          {!isEdit && (
            <div>
              <label className="form-label">Pla contractat *</label>
              <select className="form-input" {...register('planId')}>
                <option value="">— Selecciona un pla —</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {p.priceMonthly}€/mes
                  </option>
                ))}
              </select>
              {errors.planId && <p className="font-mono text-[11px] text-[#ff4444] mt-1">{errors.planId.message}</p>}
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
