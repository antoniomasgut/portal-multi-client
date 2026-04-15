'use client'
import { useRouter } from 'next/navigation'
import { useClients } from '../../../../hooks/useClients'

export default function AdminDashboard() {
  const router                 = useRouter()
  const { data: clients = [] } = useClients()

  const activeClients = clients.filter(c => c.subscriptions.some(s => s.status === 'ACTIVE'))
  const mrr = clients.reduce((acc, c) => {
    const sub = c.subscriptions.find(s => s.status === 'ACTIVE')
    return acc + (sub ? Number(sub.priceMonthly) : 0)
  }, 0)

  const stats = [
    { label: 'CLIENTS TOTALS', value: clients.length,        suffix: '',   color: 'border-l-[#FF6B00]', text: 'text-[#FF6B00]' },
    { label: 'SUBSCRIPCIONS', value: activeClients.length,   suffix: '',   color: 'border-l-[#4ade80]', text: 'text-[#4ade80]' },
    { label: 'MRR',           value: mrr,                    suffix: '€',  color: 'border-l-[#60a5fa]', text: 'text-[#60a5fa]' },
    { label: 'ALERTES',       value: 0,                      suffix: '',   color: 'border-l-[#8888aa]', text: 'text-[var(--text-muted)]' },
  ]

  const modules = [
    {
      tag: 'MÒDUL 2',
      title: 'Clients',
      desc: 'Gestionar clients, subscripcions i serveis contractats',
      href: '/admin/clients',
      active: true,
    },
    {
      tag: 'CONFIGURACIÓ',
      title: 'Serveis',
      desc: 'Catàleg de serveis amb preus i assignació de plans',
      href: '/admin/services',
      active: true,
    },
    {
      tag: 'CONFIGURACIÓ',
      title: 'Configuració',
      desc: 'Polítiques de descompte i de canvis de preu',
      href: '/admin/settings',
      active: true,
    },
    {
      tag: 'PRÒXIMAMENT',
      title: 'Facturació',
      desc: 'Generació de factures i seguiment de pagaments',
      href: '',
      active: false,
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Stats ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <div key={s.label} className={`bg-[var(--bg-2)] border border-[var(--border)] border-l-2 ${s.color} p-5`}>
            <p className={`font-mono text-[10px] tracking-[3px] ${s.text} uppercase mb-2`}>{s.label}</p>
            <p className={`font-orbitron text-4xl font-bold ${s.text}`}>
              {s.value}{s.suffix}
            </p>
          </div>
        ))}
      </div>

      {/* ── Divisor ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <p className="font-mono text-[10px] tracking-[4px] text-[var(--text-muted)] uppercase">Accions ràpides</p>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      {/* ── Mòduls ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {modules.map(m => (
          m.active ? (
            <button
              key={m.title}
              className="bg-[var(--bg-2)] border border-[var(--border)] p-6 text-left hover:border-[#FF6B00] hover:-translate-y-0.5 transition-all duration-200 group"
              onClick={() => router.push(m.href)}
            >
              <p className="font-mono text-[10px] tracking-[3px] text-[#FF6B00] uppercase mb-3">{m.tag}</p>
              <p className="font-orbitron font-bold text-lg text-[var(--text)] group-hover:text-[#FF6B00] transition-colors mb-2">{m.title}</p>
              <p className="font-rajdhani text-[var(--text-muted)] text-sm leading-relaxed">{m.desc}</p>
              <p className="font-mono text-[10px] text-[#FF6B00] mt-4 tracking-widest group-hover:tracking-[4px] transition-all">
                OBRIR →
              </p>
            </button>
          ) : (
            <div key={m.title} className="bg-[var(--bg-2)] border border-[var(--border)] p-6 opacity-35 cursor-not-allowed">
              <p className="font-mono text-[10px] tracking-[3px] text-[var(--text-muted)] uppercase mb-3">{m.tag}</p>
              <p className="font-orbitron font-bold text-lg text-[var(--text-muted)] mb-2">{m.title}</p>
              <p className="font-rajdhani text-[var(--text-muted)] text-sm leading-relaxed">{m.desc}</p>
            </div>
          )
        ))}
      </div>

    </div>
  )
}
