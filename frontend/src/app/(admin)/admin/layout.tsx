'use client'
import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '../../../store/useAuthStore'

const NAV_ITEMS = [
  { label: 'DASHBOARD',    href: '/admin/dashboard'  },
  { label: 'CLIENTS',      href: '/admin/clients'    },
  { label: 'SERVEIS',      href: '/admin/services'   },
  { label: 'CONFIGURACIÓ', href: '/admin/settings'   },
]

const PAGE_TITLES: Record<string, string> = {
  '/admin/dashboard': 'Dashboard',
  '/admin/clients':   'Clients',
  '/admin/services':  'Serveis',
  '/admin/settings':  'Configuració',
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, clearAuth } = useAuthStore()
  const router              = useRouter()
  const pathnameRaw         = usePathname()
  const pathname            = pathnameRaw ?? ''

  useEffect(() => {
    if (!user) router.push('/login')
  }, [user, router])

  const handleLogout = () => {
    clearAuth()
    router.push('/login')
  }

  // Determine current page title for breadcrumb
  const pageTitle = PAGE_TITLES[pathname] ?? 'Admin'

  if (!user) return null

  return (
    <div className="flex min-h-screen bg-[var(--bg-0)]">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        style={{ width: 180, minWidth: 180 }}
        className="fixed top-0 left-0 h-full flex flex-col bg-[var(--bg-1)] border-r border-[var(--border)] z-30"
      >
        {/* Brand */}
        <div className="px-4 py-5 border-b border-[var(--border)]">
          <p className="font-mono text-[9px] tracking-[3px] text-[var(--text-muted)] uppercase mb-1">
            PORTAL ADMIN
          </p>
          <p className="font-orbitron font-black text-[#FF6B00] text-lg leading-tight tracking-wider">
            AMG
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4">
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'flex items-center px-4 py-2.5 font-mono text-[11px] tracking-[2px] uppercase transition-all duration-150',
                  'border-l-2',
                  isActive
                    ? 'border-l-[#FF6B00] bg-[rgba(255,107,0,0.06)] text-[#FF6B00]'
                    : 'border-l-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[rgba(255,107,0,0.03)]',
                ].join(' ')}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User + Logout */}
        <div className="px-4 py-4 border-t border-[var(--border)] space-y-3">
          <div>
            <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-widest leading-relaxed break-all">
              {user.email}
            </p>
            <span className="badge text-[9px] mt-1 inline-block">{user.role}</span>
          </div>
          <button
            className="btn-outline text-[10px] w-full"
            onClick={handleLogout}
          >
            SORTIR
          </button>
        </div>
      </aside>

      {/* ── Main area ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1" style={{ marginLeft: 180 }}>

        {/* Top bar */}
        <header
          className="sticky top-0 z-20 flex items-center px-6 border-b border-[var(--border)]"
          style={{
            height: 70,
            background: 'rgba(19, 19, 42, 0.9)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] tracking-[3px] text-[var(--text-muted)] uppercase">
              ADMIN
            </span>
            <span className="font-mono text-[10px] text-[var(--text-muted)]">/</span>
            <span className="font-mono text-[10px] tracking-[2px] text-[#FF6B00] uppercase">
              {pageTitle}
            </span>
          </div>
        </header>

        {/* Scrollable content with grid background */}
        <main className="flex-1 grid-bg relative overflow-auto">
          <div className="relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
