'use client'
import { usePortalDashboard } from '../../../../hooks/usePortal'

const PLAN_COLORS: Record<string, string> = {
  basic:       '#4ade80',
  pro:         '#60a5fa',
  premium:     '#c084fc',
  empresarial: '#FF6B00',
  custom:      '#FF6B00',
}

function UsageBar({ used, max, label, color }: { used: number; max: number | null; label: string; color: string }) {
  const pct = max ? Math.min(100, Math.round((used / max) * 100)) : 0
  return (
    <div>
      <div className="flex justify-between items-baseline mb-1.5">
        <p className="font-mono text-[9px] tracking-[2px] text-[var(--text-muted)] uppercase">{label}</p>
        <p className="font-mono text-[10px]" style={{ color }}>
          {used.toLocaleString('ca-ES')}{max ? ` / ${max.toLocaleString('ca-ES')}` : ' (il·limitat)'}
        </p>
      </div>
      {max && (
        <div className="h-1 bg-[var(--border)] w-full">
          <div
            className="h-full transition-all"
            style={{ width: `${pct}%`, background: pct > 85 ? '#ff4444' : color }}
          />
        </div>
      )}
    </div>
  )
}

export default function ClientDashboard() {
  const { data, isLoading } = usePortalDashboard()

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[300px]">
        <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-[4px] animate-pulse uppercase">Carregant...</p>
      </div>
    )
  }

  if (!data) return null

  const { client, subscription: sub, usage } = data
  const planColor = sub ? (PLAN_COLORS[sub.planSlug] ?? '#FF6B00') : 'var(--text-muted)'

  return (
    <div className="p-6 max-w-4xl mx-auto animate-fade-in-up">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-8">
        <p className="section-tag">MÒDUL 5</p>
        <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">{client.companyName}</h1>
        {client.domain && (
          <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 tracking-widest">{client.domain}</p>
        )}
        {client.isTest && (
          <span className="inline-flex mt-2 font-mono text-[8px] tracking-widest px-2 py-0.5 border border-[#60a5fa]/40 text-[#60a5fa] bg-[#60a5fa]/10">
            CLIENT DE PROVA
          </span>
        )}
      </div>

      {/* ── Subscripció activa ───────────────────────────────── */}
      {sub ? (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] border-l-2 p-6 mb-6"
          style={{ borderLeftColor: planColor }}>
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-mono text-[9px] tracking-[3px] uppercase mb-1" style={{ color: planColor }}>SUBSCRIPCIÓ ACTIVA</p>
              <p className="font-orbitron font-bold text-xl" style={{ color: planColor }}>{sub.planName}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] text-[var(--text-muted)]">quota mensual</p>
              <p className="font-orbitron text-2xl font-bold text-[var(--text)]">{Number(sub.priceMonthly).toFixed(2)}€</p>
            </div>
          </div>
          {sub.renewsAt && (
            <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider">
              Renova el {new Date(sub.renewsAt).toLocaleDateString('ca-ES', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      ) : (
        <div className="bg-[var(--bg-2)] border border-[var(--border)] p-6 mb-6 text-center">
          <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest">SENSE SUBSCRIPCIÓ ACTIVA</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── Serveis ─────────────────────────────────────────── */}
        {sub && sub.services.length > 0 && (
          <div className="bg-[var(--bg-2)] border border-[var(--border)] p-6">
            <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase mb-4">Serveis inclosos</p>
            <div className="space-y-2">
              {sub.services.map(s => (
                <div key={s.slug} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: planColor }} />
                  <p className="font-rajdhani text-sm text-[var(--text)]">{s.name}</p>
                  {s.isExtra && (
                    <span className="font-mono text-[8px] tracking-widest text-[#FF6B00] border border-[#FF6B00]/30 px-1">+</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Ús del mes ──────────────────────────────────────── */}
        <div className="bg-[var(--bg-2)] border border-[var(--border)] p-6">
          <div className="flex items-center justify-between mb-4">
            <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase">Ús del mes</p>
            <p className="font-mono text-[9px] text-[var(--text-muted)]">
              {new Date(usage.periodStart).toLocaleDateString('ca-ES', { month: 'long' }).toUpperCase()}
            </p>
          </div>
          <div className="space-y-4">
            <UsageBar
              label="Converses"
              used={usage.conversationsUsed}
              max={sub?.limits?.maxConversations ?? null}
              color={planColor}
            />
            <UsageBar
              label="Tokens IA"
              used={usage.tokensUsed}
              max={sub?.limits?.maxTokens ?? null}
              color={planColor}
            />
            <UsageBar
              label="Automatitzacions"
              used={usage.automationsUsed}
              max={sub?.limits?.maxAutomations ?? null}
              color={planColor}
            />
          </div>
        </div>

      </div>
    </div>
  )
}
