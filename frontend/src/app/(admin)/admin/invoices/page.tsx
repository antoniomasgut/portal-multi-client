'use client'
import { useState } from 'react'
import { useInvoices, useInvoiceStats, useGenerateInvoice, useMarkPaid, useCancelInvoice } from '../../../../hooks/useInvoices'
import { useClients } from '../../../../hooks/useClients'

const STATUS_COLORS: Record<string, string> = {
  DRAFT:     'text-[var(--text-muted)] border-[var(--border)]',
  PENDING:   'text-[#60a5fa] border-[#60a5fa]/40 bg-[#60a5fa]/10',
  PAID:      'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10',
  OVERDUE:   'text-[#ff4444] border-[#ff4444]/40 bg-[#ff4444]/10',
  CANCELLED: 'text-[var(--text-muted)] border-[var(--border)] line-through opacity-60',
}
const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'ESBORRANY', PENDING: 'PENDENT', PAID: 'PAGAT', OVERDUE: 'VENÇUT', CANCELLED: 'CANCEL·LAT',
}

export default function InvoicesPage() {
  const { data: invoices = [], isLoading } = useInvoices()
  const { data: stats }                   = useInvoiceStats()
  const { data: clients = [] }            = useClients()
  const generate    = useGenerateInvoice()
  const markPaid    = useMarkPaid()
  const cancel      = useCancelInvoice()

  const [filterStatus, setFilterStatus]   = useState('')
  const [showGenForm, setShowGenForm]     = useState(false)
  const [genClientId, setGenClientId]     = useState('')
  const [genDueDays, setGenDueDays]       = useState('30')
  const [genNotes, setGenNotes]           = useState('')

  const filtered = filterStatus ? invoices.filter(i => i.status === filterStatus) : invoices

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!genClientId) return
    await generate.mutateAsync({ clientId: genClientId, dueInDays: parseInt(genDueDays) || 30, notes: genNotes || undefined })
    setShowGenForm(false)
    setGenClientId('')
    setGenNotes('')
  }

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="p-6 max-w-6xl mx-auto">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="section-tag">MÒDUL 4</p>
          <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">Facturació</h1>
          {!isLoading && (
            <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 tracking-widest">
              {invoices.length} factura{invoices.length !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
        <button className="btn-primary text-xs" onClick={() => setShowGenForm(true)}>
          + GENERAR FACTURA
        </button>
      </div>

      {/* ── Stats ───────────────────────────────────────────── */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'COBRAT TOTAL', value: `${stats.totalPaid.toFixed(2)}€`, color: 'border-l-[#4ade80]', text: 'text-[#4ade80]' },
            { label: 'AQUEST MES',   value: `${stats.thisMonth.toFixed(2)}€`, color: 'border-l-[#60a5fa]', text: 'text-[#60a5fa]' },
            { label: 'PENDENTS',     value: stats.pendingCount,               color: 'border-l-[#FF6B00]', text: 'text-[#FF6B00]' },
            { label: 'VENÇUDES',     value: stats.overdueCount,               color: 'border-l-[#ff4444]', text: 'text-[#ff4444]' },
          ].map(s => (
            <div key={s.label} className={`bg-[var(--bg-2)] border border-[var(--border)] border-l-2 ${s.color} p-4`}>
              <p className={`font-mono text-[9px] tracking-[3px] ${s.text} uppercase mb-2`}>{s.label}</p>
              <p className={`font-orbitron text-2xl font-bold ${s.text}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Filtre per estat ─────────────────────────────────── */}
      <div className="flex gap-2 mb-4">
        {['', 'PENDING', 'PAID', 'OVERDUE', 'CANCELLED'].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`font-mono text-[9px] tracking-widest px-3 py-1.5 border transition-colors ${
              filterStatus === s
                ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
            }`}
          >
            {s || 'TOTES'}
          </button>
        ))}
      </div>

      {/* ── Taula ───────────────────────────────────────────── */}
      {isLoading ? (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] p-16 text-center">
          <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-[4px] animate-pulse uppercase">Carregant...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] p-12 text-center">
          <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-widest mb-4">SENSE FACTURES</p>
          <button className="btn-primary text-xs" onClick={() => setShowGenForm(true)}>+ GENERAR FACTURA</button>
        </div>
      ) : (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden">
          <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-1)]">
            {['NÚMERO', 'CLIENT', 'EMISSIÓ', 'VENCIMENT', 'TOTAL', 'ESTAT', 'ACCIONS'].map(h => (
              <p key={h} className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase">{h}</p>
            ))}
          </div>
          {filtered.map((inv, i) => (
            <div
              key={inv.id}
              className={`grid grid-cols-[1fr_2fr_1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center
                hover:bg-[var(--bg-1)] transition-colors
                ${i < filtered.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
            >
              <p className="font-mono text-[10px] text-[var(--text)]">{inv.number}</p>
              <div>
                <p className="font-rajdhani font-semibold text-[var(--text)] text-sm leading-tight">{inv.client?.companyName}</p>
                <p className="font-mono text-[9px] text-[var(--text-muted)]">{inv.client?.contactEmail}</p>
              </div>
              <p className="font-mono text-[10px] text-[var(--text-muted)]">{fmtDate(inv.issueDate)}</p>
              <p className={`font-mono text-[10px] ${inv.status === 'OVERDUE' ? 'text-[#ff4444]' : 'text-[var(--text-muted)]'}`}>
                {fmtDate(inv.dueDate)}
              </p>
              <p className="font-mono text-[11px] text-[var(--text)] font-semibold">{Number(inv.total).toFixed(2)}€</p>
              <span className={`font-mono text-[8px] tracking-widest px-2 py-0.5 border w-fit ${STATUS_COLORS[inv.status] ?? ''}`}>
                {STATUS_LABELS[inv.status] ?? inv.status}
              </span>
              <div className="flex gap-1.5 justify-end">
                {inv.status === 'PENDING' && (
                  <button
                    className="font-mono text-[9px] px-2.5 py-1 border border-[#4ade80]/40 text-[#4ade80] hover:bg-[#4ade80]/10 transition-colors"
                    onClick={() => markPaid.mutate(inv.id)}
                  >PAGAR</button>
                )}
                {(inv.status === 'PENDING' || inv.status === 'OVERDUE') && (
                  <button
                    className="font-mono text-[9px] text-[#ff4444] hover:text-[#ff6666] tracking-widest transition-colors px-1"
                    onClick={() => cancel.mutate(inv.id)}
                  >✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Modal generar factura ──────────────────────────── */}
      {showGenForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-[var(--bg-1)] border border-[var(--border)] w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
              <div>
                <p className="font-mono text-[9px] tracking-[4px] text-[#FF6B00] uppercase">NOVA FACTURA</p>
                <p className="font-rajdhani font-semibold text-[var(--text)] mt-0.5">Generar des de subscripció</p>
              </div>
              <button onClick={() => setShowGenForm(false)} className="font-mono text-[var(--text-muted)] hover:text-[var(--text)] text-lg">✕</button>
            </div>
            <form onSubmit={handleGenerate} className="p-6 space-y-4">
              <div>
                <label className="form-label">Client *</label>
                <select
                  className="form-input"
                  value={genClientId}
                  onChange={e => setGenClientId(e.target.value)}
                  required
                >
                  <option value="">Selecciona un client...</option>
                  {clients.filter(c => !c.isTest && c.subscriptions.length > 0).map(c => (
                    <option key={c.id} value={c.id}>{c.companyName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Dies de venciment</label>
                <input
                  className="form-input"
                  type="number" min="1" max="365"
                  value={genDueDays}
                  onChange={e => setGenDueDays(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Notes (opcional)</label>
                <textarea
                  className="form-input h-16 resize-none"
                  value={genNotes}
                  onChange={e => setGenNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="submit" className="btn-primary text-xs" disabled={generate.isPending || !genClientId}>
                  {generate.isPending ? 'GENERANT...' : 'GENERAR FACTURA'}
                </button>
                <button type="button" className="btn-outline text-xs" onClick={() => setShowGenForm(false)}>CANCEL·LAR</button>
              </div>
              {generate.isError && (
                <p className="font-mono text-[10px] text-[#ff4444]">{(generate.error as any)?.response?.data?.message}</p>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
