'use client'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AdminDashboard() {
  const { user, clearAuth } = useAuthStore()
  const router = useRouter()

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

        {/* Stats placeholder */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'CLIENTS', value: '0' },
            { label: 'MRR', value: '0€' },
            { label: 'ACTIUS', value: '0' },
            { label: 'ALERTES', value: '0' },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <p className="font-mono text-[11px] tracking-[4px] text-[#FF6B00] uppercase mb-1">
                {s.label}
              </p>
              <p className="font-orbitron text-3xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Mòduls pendents */}
        <div className="alert-warning">
          <p className="font-mono text-[11px] tracking-widest text-[#FF6B00] uppercase mb-1">
            EN CONSTRUCCIÓ
          </p>
          <p className="font-rajdhani text-[var(--text)]">
            Mòdul 1 — Auth completat. Pròxim: Mòdul 2 — Clients + Plans.
          </p>
        </div>

      </div>
    </main>
  )
}
