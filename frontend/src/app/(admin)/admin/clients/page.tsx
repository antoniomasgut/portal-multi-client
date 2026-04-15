'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useClients, useDeleteClient } from '../../../../hooks/useClients'
import ClientForm from './ClientForm'
import type { Client } from '../../../../types'

export default function ClientsPage() {
  const router                = useRouter()
  const { data: clients = [], isLoading } = useClients()
  const deleteClient          = useDeleteClient()
  const [showForm, setShowForm]   = useState(false)
  const [editClient, setEditClient] = useState<Client | null>(null)

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Eliminar el client "${name}"?`)) return
    await deleteClient.mutateAsync(id)
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
    <main className="grid-bg min-h-screen p-8 relative">
      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="section-tag">MÒDUL 2</p>
            <h1 className="font-orbitron font-black text-2xl text-[#FF6B00]">Clients</h1>
          </div>
          <div className="flex gap-3">
            <button className="btn-outline text-xs" onClick={() => router.push('/admin/dashboard')}>
              ← DASHBOARD
            </button>
            <button className="btn-primary text-xs" onClick={() => setShowForm(true)}>
              + NOU CLIENT
            </button>
          </div>
        </div>

        {/* Taula */}
        {isLoading ? (
          <div className="card p-8 text-center">
            <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-widest animate-pulse">
              CARREGANT...
            </p>
          </div>
        ) : clients.length === 0 ? (
          <div className="alert-warning">
            <p className="font-mono text-[11px] tracking-widest text-[#FF6B00] uppercase mb-1">
              SENSE CLIENTS
            </p>
            <p className="font-rajdhani text-[var(--text)]">
              Crea el primer client amb el botó "+ NOU CLIENT".
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  {['EMPRESA', 'CONTACTE', 'PLA', 'DOMINI', 'USUARIS', 'ACCIONS'].map(h => (
                    <th key={h} className="text-left font-mono text-[10px] tracking-[3px] text-[#FF6B00] py-3 pr-4">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clients.map(client => {
                  const activeSub = client.subscriptions.find(s => s.status === 'ACTIVE')
                  return (
                    <tr
                      key={client.id}
                      className="border-b border-[var(--border)] hover:bg-[var(--bg-1)] transition-colors"
                    >
                      <td className="py-3 pr-4">
                        <p className="font-rajdhani font-semibold text-[var(--text)]">{client.companyName}</p>
                        <p className="font-mono text-[10px] text-[var(--text-muted)]">{client.contactEmail}</p>
                      </td>
                      <td className="py-3 pr-4 font-rajdhani text-[var(--text-muted)]">{client.contactName}</td>
                      <td className="py-3 pr-4">
                        {activeSub ? (
                          <div>
                            {activeSub.isCustom ? (
                              <span className="badge border-[#FF6B00] text-[#FF6B00]">Personalitzat</span>
                            ) : (
                              <span className="badge">{activeSub.plan?.name}</span>
                            )}
                            {activeSub.customPriceMonthly && (
                              <p className="font-mono text-[10px] text-[#FF6B00] mt-0.5">
                                {activeSub.customPriceMonthly}€/mes
                              </p>
                            )}
                            {activeSub.services.filter(s => s.isExtra).length > 0 && (
                              <p className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5">
                                +{activeSub.services.filter(s => s.isExtra).length} extra{activeSub.services.filter(s => s.isExtra).length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="font-mono text-[10px] text-[var(--text-muted)]">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-mono text-[11px] text-[var(--text-muted)]">
                        {client.domain || '—'}
                      </td>
                      <td className="py-3 pr-4 font-mono text-[11px] text-[var(--text-muted)]">
                        {client._count?.users ?? 0}
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <button
                            className="btn-outline text-[10px] px-2 py-1"
                            onClick={() => setEditClient(client)}
                          >
                            EDITAR
                          </button>
                          <button
                            className="font-mono text-[10px] text-[#ff4444] hover:text-[#ff6666] tracking-widest transition-colors"
                            onClick={() => handleDelete(client.id, client.companyName)}
                          >
                            ELIMINAR
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
