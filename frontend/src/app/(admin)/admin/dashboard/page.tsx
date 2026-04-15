'use client'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useClients } from '../../../../hooks/useClients'

export default function AdminDashboard() {
  const { user, clearAuth }           = useAuthStore()
  const router                        = useRouter()
  const { data: clients = [] }        = useClients()

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user])

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  return (
    <main className="grid-bg min-h-screen p-8 relative">
      <div className="relative z-10 max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="section-tag">PORTAL ADMIN</p>
            <h1 className="font-orbitron font-black text-2xl text-[#FF6B00]">
              AMG Enginyeria Digital
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[11px] text-[var(--text-muted)] tracking-widest">
              {user?.email}
            </span>
            <span className="badge">{user?.role}</span>
            <button className="btn-outline text-xs" onClick={handleLogout}>
              SORTIR
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'CLIENTS',  value: String(clients.length) },
            { label: 'MRR',      value: `${clients.reduce((acc, c) => acc + (c.subscriptions.find(s => s.status === 'ACTIVE')?.plan.priceMonthly ?? 0), 0)}€` },
            { label: 'ACTIUS',   value: String(clients.filter(c => c.subscriptions.some(s => s.status === 'ACTIVE')).length) },
            { label: 'ALERTES',  value: '0' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <p className="font-mono text-[11px] tracking-[4px] text-[#FF6B00] uppercase mb-1">
                {s.label}
              </p>
              <p className="font-orbitron text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Accions ràpides */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <button
            className="card p-5 text-left hover:border-[#FF6B00] transition-colors group"
            onClick={() => router.push('/admin/clients')}
          >
            <p className="font-mono text-[10px] tracking-[3px] text-[#FF6B00] uppercase mb-2">CLIENTS</p>
            <p className="font-rajdhani text-[var(--text-muted)] group-hover:text-[var(--text)] text-sm">
              Gestionar clients i subscripcions
            </p>
          </button>
          <div className="card p-5 opacity-40 cursor-not-allowed">
            <p className="font-mono text-[10px] tracking-[3px] text-[var(--text-muted)] uppercase mb-2">FACTURACIÓ</p>
            <p className="font-rajdhani text-[var(--text-muted)] text-sm">Pròximament</p>
          </div>
          <div className="card p-5 opacity-40 cursor-not-allowed">
            <p className="font-mono text-[10px] tracking-[3px] text-[var(--text-muted)] uppercase mb-2">AUTOMATITZACIONS</p>
            <p className="font-rajdhani text-[var(--text-muted)] text-sm">Pròximament</p>
          </div>
        </div>

      </div>
    </main>
  )
}
