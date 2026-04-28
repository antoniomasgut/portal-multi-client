'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClients, useDeleteClient, useImpersonateClient } from '../../../../hooks/useClients'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useTranslation } from '../../../../hooks/useTranslation'
import ClientForm from './ClientForm'
import SetupWizard from './SetupWizard'
import type { Client } from '../../../../types'

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:    'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10',
  TRIAL:     'text-[#60a5fa] border-[#60a5fa]/40 bg-[#60a5fa]/10',
  CANCELLED: 'text-[#ff4444] border-[#ff4444]/40 bg-[#ff4444]/10',
  EXPIRED:   'text-[var(--text-muted)] border-[var(--border)] bg-transparent',
}

export default function ClientsPage() {
  const router                      = useRouter()
  const [search, setSearch]         = useState('')
  const [sortBy, setSortBy]         = useState('createdAt')
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('desc')
  
  const { data: clients = [], isLoading } = useClients({ search, sortBy, sortDir })
  const deleteClient                = useDeleteClient()
  const impersonate                 = useImpersonateClient()
  const startImpersonate            = useAuthStore(s => s.startImpersonate)
  const { t }                       = useTranslation('admin')
  const [showForm, setShowForm]     = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [setupClient, setSetupClient] = useState<Client | null>(null)

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('asc')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('clients.delete_confirm').replace('{{name}}', name))) return
    try {
      await deleteClient.mutateAsync(id)
    } catch (err: any) {
      alert(err?.response?.data?.message ?? 'Error en eliminar el client')
    }
  }

  const handleImpersonate = async (client: Client) => {
    const data = await impersonate.mutateAsync(client.id)
    startImpersonate(data.user, data.accessToken)
    router.push('/client/dashboard')
  }

  if (setupClient) return <SetupWizard client={setupClient} onClose={() => setSetupClient(null)} />
  if (showForm || editClient) return <ClientForm client={editClient} onClose={() => { setShowForm(false); setEditClient(null) }} />

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="section-tag">{t('clients.tag')}</p>
          <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">{t('clients.title')}</h1>
          {!isLoading && (
            <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 tracking-widest">
              {t('clients.registered_count_other').replace('{{count}}', String(clients.length))}
            </p>
          )}
        </div>
        <button className="btn-primary text-xs" onClick={() => setShowForm(true)}>
          {t('clients.new_client_btn')}
        </button>
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
          <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-[4px] animate-pulse uppercase">{t('clients.loading')}</p>
        </div>
      ) : (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden">
          <div className="grid grid-cols-[2fr_1.5fr_1.8fr_1.2fr_0.6fr_200px] gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-1)]">
            {[
              { label: t('clients.col_company'), key: 'companyName' },
              { label: t('clients.col_subscription'), key: 'subscriptions' },
              { label: t('clients.col_services'), key: 'services' },
              { label: t('clients.col_domain'), key: 'domain' },
              { label: t('clients.col_users'), key: 'users' },
              { label: t('clients.col_actions'), key: '' },
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

          {clients.map((client, i) => {
            const activeSub = client.subscriptions.find(s => s.status === 'ACTIVE')
            return (
              <div key={client.id} className={`grid grid-cols-[2fr_1.5fr_1.8fr_1.2fr_0.6fr_200px] gap-4 px-5 py-4 items-center hover:bg-[var(--bg-1)] transition-colors ${i < clients.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-rajdhani font-semibold text-[var(--text)] text-base leading-tight">{client.companyName}</p>
                    {client.isTest && <span className="badge-test">{t('clients.test_badge')}</span>}
                  </div>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">{client.contactEmail}</p>
                </div>
                <div>
                  {activeSub ? (
                    <>
                      <span className={`font-mono text-[9px] px-2 py-0.5 border ${STATUS_COLORS[activeSub.status] ?? STATUS_COLORS.EXPIRED}`}>{activeSub.status}</span>
                      <p className="font-rajdhani text-sm text-[var(--text)] mt-1.5">{activeSub.plan?.name}</p>
                    </>
                  ) : <span className="font-mono text-[10px] text-[var(--text-muted)]">{t('clients.no_plan')}</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  {activeSub?.services.slice(0, 3).map(ss => (
                    <span key={ss.serviceId} className="badge-feature">{ss.service.name.slice(0,8)}</span>
                  ))}
                </div>
                <p className="font-mono text-[10px] text-[var(--text-muted)] truncate">{client.domain || '—'}</p>
                <p className="font-mono text-[11px] text-[var(--text-muted)] text-center">{client._count?.users ?? 0}</p>
                <div className="flex gap-2 justify-end">
                  <button className="btn-outline text-[9px] px-2" onClick={() => handleImpersonate(client)}>{t('clients.enter')}</button>
                  <button className="btn-outline text-[9px] px-2" onClick={() => setSetupClient(client)}>{t('clients.setup')}</button>
                  <button className="btn-outline text-[9px] px-2" onClick={() => setEditClient(client)}>{t('clients.edit')}</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <style jsx>{`
        .badge-test { font-family: var(--font-mono); font-size: 8px; letter-spacing: 1px; padding: 1px 4px; border: 1px solid #60a5fa40; color: #60a5fa; background: #60a5fa10; }
        .badge-feature { font-family: var(--font-mono); font-size: 8px; letter-spacing: 1px; padding: 1px 4px; border: 1px solid var(--border); color: var(--text-muted); }
      `}</style>
    </div>
  )
}
