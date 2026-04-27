'use client'
import { useRouter } from 'next/navigation'
import { useClients } from '../../../../hooks/useClients'
import { useTranslation } from '../../../../hooks/useTranslation'

export default function AdminDashboard() {
  const router                 = useRouter()
  const { data: clients = [] } = useClients()
  const { t }                  = useTranslation('admin')

  const realClients   = clients.filter(c => !c.isTest)
  const activeClients = realClients.filter(c => c.subscriptions.some(s => s.status === 'ACTIVE'))
  const mrr = realClients.reduce((acc, c) => {
    const sub = c.subscriptions.find(s => s.status === 'ACTIVE')
    const price = sub ? parseFloat(String(sub.priceMonthly)) || 0 : 0
    return acc + price
  }, 0)
  const hasTestClient = clients.some(c => c.isTest)

  const stats = [
    { label: t('dashboard.stats_clients'),      value: realClients.length,    suffix: '',  color: 'border-l-[#FF6B00]', text: 'text-[#FF6B00]' },
    { label: t('dashboard.stats_subscriptions'), value: activeClients.length, suffix: '',  color: 'border-l-[#4ade80]', text: 'text-[#4ade80]' },
    { label: t('dashboard.stats_mrr'),           value: isNaN(mrr) ? '—' : mrr.toFixed(2), suffix: isNaN(mrr) ? '' : '€', color: 'border-l-[#60a5fa]', text: 'text-[#60a5fa]' },
    { label: t('dashboard.stats_alerts'),        value: 0,                    suffix: '',  color: 'border-l-[#8888aa]', text: 'text-[var(--text-muted)]' },
  ]

  const modules = [
    {
      tag:    t('dashboard.module_clients_tag'),
      title:  t('dashboard.module_clients_title'),
      desc:   t('dashboard.module_clients_desc'),
      href:   '/admin/clients',
      active: true,
    },
    {
      tag:    t('dashboard.module_services_tag'),
      title:  t('dashboard.module_services_title'),
      desc:   t('dashboard.module_services_desc'),
      href:   '/admin/services',
      active: true,
    },
    {
      tag:    t('dashboard.module_settings_tag'),
      title:  t('dashboard.module_settings_title'),
      desc:   t('dashboard.module_settings_desc'),
      href:   '/admin/settings',
      active: true,
    },
    {
      tag:    t('dashboard.module_invoices_tag'),
      title:  t('dashboard.module_invoices_title'),
      desc:   t('dashboard.module_invoices_desc'),
      href:   '/admin/invoices',
      active: true,
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in-up">

      {hasTestClient && (
        <div className="mb-6 flex items-center gap-3 bg-[var(--bg-2)] border border-[#60a5fa]/30 border-l-2 border-l-[#60a5fa] px-4 py-3">
          <span className="font-mono text-[9px] tracking-widest px-2 py-0.5 border border-[#60a5fa]/40 text-[#60a5fa] bg-[#60a5fa]/10">TEST</span>
          <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
            {t('dashboard.test_client_banner')}
          </p>
        </div>
      )}

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

      <div className="flex items-center gap-4 mb-6">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <p className="font-mono text-[10px] tracking-[4px] text-[var(--text-muted)] uppercase">{t('dashboard.quick_actions')}</p>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

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
                {t('dashboard.open')}
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
