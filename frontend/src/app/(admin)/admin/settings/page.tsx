'use client'
import { useState } from 'react'
import { useDiscountPolicies, useToggleDiscountPolicy, useUpdateDiscountPolicy, usePricingPolicy, useUpdatePricingPolicy } from '../../../../hooks/useSettings'

const DISCOUNT_LABELS: Record<string, string> = {
  NEW_CLIENT:        'Nou client',
  ANNUAL_PAYMENT:    'Pagament anual',
  REFERRAL_REFERRER: 'Referidor',
  REFERRAL_NEW:      'Client referit',
  MANUAL:            'Descompte manual',
}

export default function SettingsPage() {
  const { data: discountPolicies = [], isLoading: loadingDisc } = useDiscountPolicies()
  const { data: pricingPolicy,          isLoading: loadingPrice } = usePricingPolicy()
  const toggleDiscount  = useToggleDiscountPolicy()
  const updateDiscount  = useUpdateDiscountPolicy()
  const updatePricing   = useUpdatePricingPolicy()

  const [editingDiscount, setEditingDiscount] = useState<string | null>(null)
  const [discountForm, setDiscountForm]       = useState<Record<string, any>>({})

  const startEditDiscount = (p: any) => {
    setEditingDiscount(p.id)
    setDiscountForm({
      percentage:     p.percentage ?? '',
      durationMonths: p.durationMonths ?? '',
      description:    p.description ?? '',
    })
  }

  const saveDiscount = async (id: string) => {
    await updateDiscount.mutateAsync({
      id,
      percentage:     discountForm.percentage     !== '' ? Number(discountForm.percentage)     : null,
      durationMonths: discountForm.durationMonths !== '' ? Number(discountForm.durationMonths) : null,
      description:    discountForm.description    || null,
    })
    setEditingDiscount(null)
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p className="section-tag">MÒDUL 2</p>
        <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">Configuració</h1>
        <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 tracking-widest">
          Polítiques de descompte i preus
        </p>
      </div>

      {/* ── Polítiques de descompte ──────────────────────────────── */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-[#4ade80]" />
          <p className="font-mono text-[10px] tracking-[4px] text-[#4ade80] uppercase">Polítiques de descompte</p>
        </div>

        {loadingDisc ? (
          <div className="bg-[var(--bg-2)] border border-[var(--border)] p-8 text-center">
            <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-[4px] animate-pulse">CARREGANT...</p>
          </div>
        ) : (
          <div className="bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-1)]">
              {['POLÍTICA', 'DESCOMPTE', 'DURADA', 'ESTAT', 'ACCIONS'].map(h => (
                <p key={h} className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase">{h}</p>
              ))}
            </div>

            {discountPolicies.map((p: any, i: number) => (
              <div
                key={p.id}
                className={`grid grid-cols-[1.5fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-start
                  ${i < discountPolicies.length - 1 ? 'border-b border-[var(--border)]' : ''}
                  ${editingDiscount === p.id ? 'bg-[var(--bg-1)]' : 'hover:bg-[var(--bg-1)]'} transition-colors`}
              >
                {/* Nom */}
                <div>
                  <p className="font-rajdhani font-semibold text-[var(--text)] text-base">
                    {DISCOUNT_LABELS[p.type] ?? p.type}
                  </p>
                  {editingDiscount === p.id ? (
                    <input
                      className="form-input text-xs mt-1"
                      value={discountForm.description}
                      onChange={e => setDiscountForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Descripció..."
                    />
                  ) : (
                    <p className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Descompte % */}
                <div>
                  {editingDiscount === p.id ? (
                    <div className="relative">
                      <input
                        className="form-input pr-6 text-sm"
                        type="number" min="0" max="100" step="1"
                        value={discountForm.percentage}
                        onChange={e => setDiscountForm(f => ({ ...f, percentage: e.target.value }))}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[var(--text-muted)]">%</span>
                    </div>
                  ) : (
                    <p className="font-mono text-sm text-[#4ade80]">
                      {p.percentage != null ? `${p.percentage}%` : '—'}
                    </p>
                  )}
                </div>

                {/* Durada mesos */}
                <div>
                  {editingDiscount === p.id ? (
                    <div className="relative">
                      <input
                        className="form-input pr-8 text-sm"
                        type="number" min="0" step="1"
                        value={discountForm.durationMonths}
                        onChange={e => setDiscountForm(f => ({ ...f, durationMonths: e.target.value }))}
                      />
                      <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-mono text-[9px] text-[var(--text-muted)]">m</span>
                    </div>
                  ) : (
                    <p className="font-mono text-sm text-[var(--text)]">
                      {p.durationMonths != null ? `${p.durationMonths} mesos` : '∞'}
                    </p>
                  )}
                </div>

                {/* Estat */}
                <div>
                  <span className={`font-mono text-[9px] tracking-widest px-2 py-0.5 border ${
                    p.isActive
                      ? 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10'
                      : 'text-[var(--text-muted)] border-[var(--border)]'
                  }`}>
                    {p.isActive ? 'ACTIU' : 'INACTIU'}
                  </span>
                </div>

                {/* Accions */}
                <div className="flex gap-2 justify-end">
                  {editingDiscount === p.id ? (
                    <>
                      <button
                        className="btn-primary text-[9px] px-3 py-1.5"
                        onClick={() => saveDiscount(p.id)}
                        disabled={updateDiscount.isPending}
                      >
                        {updateDiscount.isPending ? '...' : 'DESAR'}
                      </button>
                      <button
                        className="btn-outline text-[9px] px-3 py-1.5"
                        onClick={() => setEditingDiscount(null)}
                      >
                        ✕
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn-outline text-[9px] px-3 py-1.5"
                        onClick={() => startEditDiscount(p)}
                      >
                        EDITAR
                      </button>
                      <button
                        className={`font-mono text-[9px] tracking-widest px-2 transition-colors ${
                          p.isActive
                            ? 'text-[var(--text-muted)] hover:text-[#ff4444]'
                            : 'text-[#4ade80] hover:text-[#4ade80]/70'
                        }`}
                        onClick={() => toggleDiscount.mutate(p.id)}
                        disabled={toggleDiscount.isPending}
                      >
                        {p.isActive ? 'DESACTIVAR' : 'ACTIVAR'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Política de preus ────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-1 h-5 bg-[#60a5fa]" />
          <p className="font-mono text-[10px] tracking-[4px] text-[#60a5fa] uppercase">Política de canvis de preu</p>
        </div>

        {loadingPrice ? (
          <div className="bg-[var(--bg-2)] border border-[var(--border)] p-8 text-center">
            <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-[4px] animate-pulse">CARREGANT...</p>
          </div>
        ) : pricingPolicy ? (
          <div className="bg-[var(--bg-2)] border border-[var(--border)] p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Dies avís mínim */}
              <div>
                <label className="form-label">Dies d'avís mínim</label>
                <div className="relative">
                  <input
                    className="form-input pr-10"
                    type="number" min="0" step="1"
                    defaultValue={pricingPolicy.minNoticeDays}
                    onBlur={e => updatePricing.mutate({ minNoticeDays: Number(e.target.value) })}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] text-[var(--text-muted)]">dies</span>
                </div>
                <p className="font-mono text-[9px] text-[var(--text-muted)] mt-1">
                  Temps mínim d'avís als clients abans d'un canvi de preu
                </p>
              </div>

              {/* Permetre canvi immediat */}
              <div>
                <label className="form-label">Canvi immediat</label>
                <button
                  className={`w-full px-4 py-3 border font-mono text-[10px] tracking-widest transition-colors ${
                    pricingPolicy.allowImmediateChange
                      ? 'border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]'
                      : 'border-[var(--border)] text-[var(--text-muted)]'
                  }`}
                  onClick={() => updatePricing.mutate({ allowImmediateChange: !pricingPolicy.allowImmediateChange })}
                  disabled={updatePricing.isPending}
                >
                  {pricingPolicy.allowImmediateChange ? 'PERMÈS' : 'NO PERMÈS'}
                </button>
                <p className="font-mono text-[9px] text-[var(--text-muted)] mt-1">
                  Permet canviar preus sense avís previ
                </p>
              </div>

              {/* Notificar clients */}
              <div>
                <label className="form-label">Notificar clients</label>
                <button
                  className={`w-full px-4 py-3 border font-mono text-[10px] tracking-widest transition-colors ${
                    pricingPolicy.notifyClientsOnChange
                      ? 'border-[#4ade80] bg-[#4ade80]/10 text-[#4ade80]'
                      : 'border-[var(--border)] text-[var(--text-muted)]'
                  }`}
                  onClick={() => updatePricing.mutate({ notifyClientsOnChange: !pricingPolicy.notifyClientsOnChange })}
                  disabled={updatePricing.isPending}
                >
                  {pricingPolicy.notifyClientsOnChange ? 'ACTIVAT' : 'DESACTIVAT'}
                </button>
                <p className="font-mono text-[9px] text-[var(--text-muted)] mt-1">
                  Enviar email als clients quan canvia el seu preu
                </p>
              </div>
            </div>
          </div>
        ) : null}
      </section>

    </div>
  )
}
