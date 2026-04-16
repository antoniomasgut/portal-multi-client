'use client'
import { usePortalInvoices } from '../../../../hooks/usePortal'

const STATUS_COLORS: Record<string, string> = {
  PENDING:   'text-[#60a5fa] border-[#60a5fa]/40 bg-[#60a5fa]/10',
  PAID:      'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10',
  OVERDUE:   'text-[#ff4444] border-[#ff4444]/40 bg-[#ff4444]/10',
  CANCELLED: 'text-[var(--text-muted)] border-[var(--border)] opacity-50',
  DRAFT:     'text-[var(--text-muted)] border-[var(--border)]',
}
const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'ESBORRANY', PENDING: 'PENDENT', PAID: 'PAGAT', OVERDUE: 'VENÇUT', CANCELLED: 'CANCEL·LAT',
}

export default function ClientInvoicesPage() {
  const { data: invoices = [], isLoading } = usePortalInvoices()

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('ca-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <div className="p-6 max-w-4xl mx-auto">

      <div className="mb-8">
        <p className="section-tag">PORTAL CLIENT</p>
        <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">Les meves factures</h1>
        {!isLoading && (
          <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 tracking-widest">
            {invoices.length} factura{invoices.length !== 1 ? 'es' : ''}
          </p>
        )}
      </div>

      {isLoading ? (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] p-16 text-center">
          <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-[4px] animate-pulse uppercase">Carregant...</p>
        </div>
      ) : invoices.length === 0 ? (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] p-12 text-center">
          <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-widest">SENSE FACTURES</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-1)]">
            {['NÚMERO', 'EMISSIÓ', 'VENCIMENT', 'TOTAL', 'ESTAT'].map(h => (
              <p key={h} className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase">{h}</p>
            ))}
          </div>
          {invoices.map((inv, i) => (
            <div
              key={inv.id}
              className={`grid grid-cols-[1fr_1fr_1fr_1fr_auto] gap-4 px-5 py-4 items-center
                hover:bg-[var(--bg-1)] transition-colors
                ${i < invoices.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
            >
              <p className="font-mono text-[10px] text-[var(--text)]">{inv.number}</p>
              <p className="font-mono text-[10px] text-[var(--text-muted)]">{fmtDate(inv.issueDate)}</p>
              <p className={`font-mono text-[10px] ${inv.status === 'OVERDUE' ? 'text-[#ff4444]' : 'text-[var(--text-muted)]'}`}>
                {fmtDate(inv.dueDate)}
              </p>
              <p className="font-mono text-[11px] font-semibold text-[var(--text)]">{Number(inv.total).toFixed(2)}€</p>
              <span className={`font-mono text-[8px] tracking-widest px-2 py-0.5 border ${STATUS_COLORS[inv.status] ?? ''}`}>
                {STATUS_LABELS[inv.status] ?? inv.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
