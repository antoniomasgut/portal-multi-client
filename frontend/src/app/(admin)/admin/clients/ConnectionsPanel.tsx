'use client'
import { useConnectionStatus, useStartOAuth, useDisconnectOAuth } from '../../../../hooks/useOAuth'

const PROVIDERS = [
  {
    id:    'whatsapp',
    label: 'WhatsApp Business',
    desc:  'Bot IA 24/7 per atendre clients via WhatsApp',
    icon:  '💬',
    needsOAuth: true,
  },
  {
    id:    'n8n',
    label: 'n8n Automatitzacions',
    desc:  'Fluxos d\'automatització personalitzats',
    icon:  '⚡',
    needsOAuth: false,
  },
]

interface Props { clientId: string }

export default function ConnectionsPanel({ clientId }: Props) {
  const { data: status = {}, isLoading } = useConnectionStatus(clientId)
  const startOAuth   = useStartOAuth(clientId)
  const disconnect   = useDisconnectOAuth(clientId)

  if (isLoading) {
    return <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest animate-pulse">CARREGANT...</p>
  }

  return (
    <div className="space-y-3">
      {PROVIDERS.map(p => {
        const connected = status[p.id] ?? false
        return (
          <div key={p.id} className={`flex items-center justify-between p-4 border transition-colors ${
            connected
              ? 'border-[#4ade80]/30 bg-[#4ade80]/5'
              : 'border-[var(--border)] bg-[var(--bg-1)]'
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{p.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-rajdhani font-semibold text-[var(--text)] text-sm">{p.label}</p>
                  {connected ? (
                    <span className="font-mono text-[8px] tracking-widest px-1.5 py-0.5 border border-[#4ade80]/40 text-[#4ade80] bg-[#4ade80]/10">
                      CONNECTAT
                    </span>
                  ) : (
                    <span className="font-mono text-[8px] tracking-widest px-1.5 py-0.5 border border-[var(--border)] text-[var(--text-muted)]">
                      DESCONNECTAT
                    </span>
                  )}
                </div>
                <p className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5">{p.desc}</p>
              </div>
            </div>

            <div className="flex gap-2 shrink-0">
              {connected ? (
                <button
                  type="button"
                  className="font-mono text-[9px] text-[#ff4444] hover:text-[#ff6666] tracking-widest transition-colors border border-[#ff4444]/30 hover:border-[#ff4444]/50 px-2.5 py-1"
                  onClick={() => disconnect.mutate(p.id)}
                  disabled={disconnect.isPending}
                >
                  DESCONNECTAR
                </button>
              ) : p.needsOAuth ? (
                <button
                  type="button"
                  className="btn-outline text-[9px] px-3 py-1.5"
                  onClick={() => startOAuth.mutate(p.id)}
                  disabled={startOAuth.isPending}
                >
                  {startOAuth.isPending ? 'OBRINT...' : 'CONNECTAR →'}
                </button>
              ) : (
                <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-widest">Via API Key</p>
              )}
            </div>
          </div>
        )
      })}

      <p className="font-mono text-[9px] text-[var(--text-muted)] tracking-wider">
        Les credencials s'emmagatzemen encriptades (AES-256-GCM)
      </p>
    </div>
  )
}
