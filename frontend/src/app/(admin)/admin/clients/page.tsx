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
  const { data: clients = [], isLoading } = useClients()
  const deleteClient                = useDeleteClient()
  const impersonate                 = useImpersonateClient()
  const startImpersonate            = useAuthStore(s => s.startImpersonate)
  const { t }                       = useTranslation('admin')
  const [showForm, setShowForm]     = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)
  const [setupClient, setSetupClient] = useState<Client | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(t('clients.delete_confirm').replace('{{name}}', name))) return
    await deleteClient.mutateAsync(id)
  }

  const handleImpersonate = async (client: Client) => {
    const data = await impersonate.mutateAsync(client.id)
    startImpersonate(data.user, data.accessToken)
    router.push('/client/dashboard')
  }

  if (setupClient) {
    return (
      <SetupWizard
        client={setupClient}
        onClose={() => setSetupClient(null)}
      />
    )
  }

  if (showForm || editClient) {
    return (
      <ClientForm
        client={editClient}
        onClose={() => { setShowForm(false); setEditClient(null) }}
      />
    )
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="section-tag">{t('clients.tag')}</p>
          <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">{t('clients.title')}</h1>
          {!isLoading && (
            <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 tracking-widest">
              {clients.length !== 1
                ? t('clients.registered_count_other').replace('{{count}}', String(clients.length))
                : t('clients.registered_count_one').replace('{{count}}', String(clients.length))}
            </p>
          )}
        </div>
        <button className="btn-primary text-xs" onClick={() => setShowForm(true)}>
          {t('clients.new_client_btn')}
        </button>
      </div>

      {isLoading ? (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] p-16 text-center">
          <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-[4px] animate-pulse uppercase">
            {t('clients.loading')}
          </p>
        </div>
      ) : clients.length === 0 ? (
        <div className="alert-warning p-8 text-center">
          <p className="font-mono text-[11px] tracking-[4px] text-[#FF6B00] uppercase mb-3">{t('clients.no_clients')}</p>
          <p className="font-rajdhani text-[var(--text)] mb-5">
            {t('clients.no_clients_desc')}
          </p>
          <button className="btn-primary text-xs" onClick={() => setShowForm(true)}>
            {t('clients.new_client_btn')}
          </button>
        </div>
      ) : (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] overflow-hidden">
          <div className="grid grid-cols-[2fr_1.5fr_1.8fr_1.2fr_0.6fr_200px] gap-4 px-5 py-3 border-b border-[var(--border)] bg-[var(--bg-1)]">
            {[
              t('clients.col_company'),
              t('clients.col_subscription'),
              t('clients.col_services'),
              t('clients.col_domain'),
              t('clients.col_users'),
              t('clients.col_actions'),
            ].map(h => (
              <p key={h} className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase">{h}</p>
            ))}
          </div>

          {clients.map((client, i) => {
            const activeSub = client.subscriptions.find(s => s.status === 'ACTIVE')
            return (
              <div
                key={client.id}
                className={`grid grid-cols-[2fr_1.5fr_1.8fr_1.2fr_0.6fr_200px] gap-4 px-5 py-4 items-center
                  hover:bg-[var(--bg-1)] transition-colors
                  ${i < clients.length - 1 ? 'border-b border-[var(--border)]' : ''}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-rajdhani font-semibold text-[var(--text)] text-base leading-tight">
                      {client.companyName}
                    </p>
                    {client.isTest && (
                      <span className="font-mono text-[8px] tracking-widest px-1.5 py-0.5 border border-[#60a5fa]/40 text-[#60a5fa] bg-[#60a5fa]/10 shrink-0">
                        {t('clients.test_badge')}
                      </span>
                    )}
                  </div>
                  <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">{client.contactEmail}</p>
                  {client.contactName !== client.companyName && (
                    <p className="font-rajdhani text-[12px] text-[var(--text-muted)]">{client.contactName}</p>
                  )}
                </div>

                <div>
                  {activeSub ? (
                    <>
                      <span className={`font-mono text-[9px] tracking-widest px-2 py-0.5 border ${
                        STATUS_COLORS[activeSub.status] ?? STATUS_COLORS.EXPIRED
                      }`}>
                        {activeSub.status}
                      </span>
                      <div className="mt-1.5">
                        {activeSub.isCustom ? (
                          <span className="font-mono text-[10px] text-[#FF6B00]">{t('clients.custom')}</span>
                        ) : (
                          <span className="font-rajdhani text-sm text-[var(--text)]">{activeSub.plan?.name}</span>
                        )}
                      </div>
                      {activeSub.priceMonthly > 0 && (
                        <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5">
                          {activeSub.priceMonthly}€/mes
                          {activeSub.priceSetup > 0 && (
                            <span className="text-[#FF6B00]"> · {activeSub.priceSetup}€ setup</span>
                          )}
                        </p>
                      )}
                    </>
                  ) : (
                    <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest">{t('clients.no_plan')}</span>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {activeSub && activeSub.services.length > 0 ? (
                    <>
                      {activeSub.services.slice(0, 3).map(ss => (
                        <span key={ss.serviceId} className={`font-mono text-[8px] tracking-wider px-1.5 py-0.5 border ${
                          ss.isExtra
                            ? 'text-[#FF6B00] border-[#FF6B00]/40'
                            : 'text-[var(--text-muted)] border-[var(--border)]'
                        }`}>
                          {ss.service.name.split(' ').slice(0, 2).join(' ')}
                          {ss.isExtra && ' +'}
                        </span>
                      ))}
                      {activeSub.services.length > 3 && (
                        <span className="font-mono text-[8px] text-[var(--text-muted)] px-1.5 py-0.5 border border-[var(--border)]">
                          +{activeSub.services.length - 3}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="font-mono text-[10px] text-[var(--text-muted)]">—</span>
                  )}
                </div>

                <p className="font-mono text-[10px] text-[var(--text-muted)] truncate">
                  {client.domain || '—'}
                </p>

                <p className="font-mono text-[11px] text-[var(--text-muted)] text-center">
                  {client._count?.users ?? 0}
                </p>

                <div className="flex gap-2 justify-end">
                  <button
                    className="font-mono text-[9px] tracking-widest px-2.5 py-1.5 border border-[#60a5fa]/40 text-[#60a5fa] hover:bg-[#60a5fa]/10 transition-colors"
                    onClick={() => handleImpersonate(client)}
                    title="Entrar al portal del client sense necessitar la seva contrasenya"
                  >
                    {t('clients.enter')}
                  </button>
                  <button
                    className="font-mono text-[9px] tracking-widest px-2.5 py-1.5 border border-[#FF6B00]/40 text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
                    onClick={() => setSetupClient(client)}
                    title="Flux de configuració"
                  >
                    {t('clients.setup')}
                  </button>
                  <button
                    className="btn-outline text-[9px] px-3 py-1.5"
                    onClick={() => setEditClient(client)}
                  >
                    {t('clients.edit')}
                  </button>
                  <button
                    className="font-mono text-[9px] text-[#ff4444] hover:text-[#ff6666] tracking-widest transition-colors px-1"
                    onClick={() => handleDelete(client.id, client.companyName)}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
