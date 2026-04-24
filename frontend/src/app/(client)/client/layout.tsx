'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuthStore } from '../../../store/useAuthStore'
import { useTranslation } from '../../../hooks/useTranslation'
import { LanguageSwitcher } from '../../../components/LanguageSwitcher'

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname() ?? ''
  const { user, clearAuth, isImpersonating, stopImpersonate, isInitialized } = useAuthStore()
  const { t }    = useTranslation('client')
  const { t: tc } = useTranslation('common')

  const NAV_ITEMS = [
    { label: t('nav.dashboard'),    href: '/client/dashboard'    },
    { label: t('nav.automations'),  href: '/client/automations'  },
    { label: t('nav.invoices'),     href: '/client/invoices'      },
    { label: t('nav.domain'),        href: '/client/domain'        },
    { label: t('nav.privacy'),      href: '/client/privacy'       },
  ]

  useEffect(() => {
    if (!isInitialized) return
    if (!user) router.push('/login')
    else if (user.role === 'ADMIN') router.push('/admin/dashboard')
  }, [user, router, isInitialized])

  if (!isInitialized) return null
  if (!user) return null

  const handleStopImpersonate = () => {
    stopImpersonate()
    router.push('/admin/clients')
  }

  return (
    <div className="flex flex-col h-screen bg-[var(--bg-0)] overflow-hidden">

      {/* ── Banner impersonació ─────────────────────────────── */}
      {isImpersonating() && (
        <div className="shrink-0 flex items-center justify-between px-6 py-2 bg-[#60a5fa]/10 border-b border-[#60a5fa]/30">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] tracking-widest px-2 py-0.5 border border-[#60a5fa]/40 text-[#60a5fa] bg-[#60a5fa]/10">
              ADMIN
            </span>
            <p className="font-mono text-[10px] text-[#60a5fa] tracking-wider">
              {tc('impersonate.banner', { email: user.email })}
            </p>
          </div>
          <button
            onClick={handleStopImpersonate}
            className="font-mono text-[10px] tracking-widest text-[#60a5fa] hover:text-white border border-[#60a5fa]/40 hover:border-[#60a5fa] px-3 py-1 transition-all"
          >
            {tc('actions.return_admin')}
          </button>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <aside className="w-[180px] shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--bg-1)]">

          {/* Brand */}
          <div className="px-5 py-5 border-b border-[var(--border)]">
            <p className="font-mono text-[8px] tracking-[4px] text-[#FF6B00] uppercase">{tc('portal.client_title')}</p>
            <p className="font-orbitron font-black text-[13px] text-[var(--text)] mt-0.5 leading-tight truncate">
              {user.email.split('@')[0].toUpperCase()}
            </p>
          </div>

          {/* Nav */}
          <nav className="flex-1 py-4">
            {NAV_ITEMS.map(item => {
              const active = pathname.startsWith(item.href)
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full text-left px-5 py-2.5 font-mono text-[10px] tracking-[2px] transition-all border-l-2 ${
                    active
                      ? 'border-l-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/5'
                      : 'border-l-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-2)]'
                  }`}
                >
                  {item.label}
                </button>
              )
            })}
          </nav>

          {/* Language + User */}
          <div className="border-t border-[var(--border)] px-5 py-4 space-y-3">
            <LanguageSwitcher />
            <p className="font-mono text-[9px] text-[var(--text-muted)] truncate">{user.email}</p>
            {isImpersonating() ? (
              <button
                onClick={handleStopImpersonate}
                className="font-mono text-[9px] tracking-widest text-[#60a5fa] hover:text-white transition-colors"
              >
                {tc('actions.return_admin')}
              </button>
            ) : (
              <button
                onClick={() => { clearAuth(); router.push('/login') }}
                className="font-mono text-[9px] tracking-widest text-[var(--text-muted)] hover:text-[#ff4444] transition-colors"
              >
                {tc('actions.logout')}
              </button>
            )}
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-[70px] shrink-0 border-b border-[var(--border)] bg-[var(--bg-1)]/80 backdrop-blur-sm flex items-center px-6">
            <p className="font-mono text-[9px] tracking-[3px] text-[var(--text-muted)] uppercase">{tc('portal.client_title')}</p>
          </header>
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
