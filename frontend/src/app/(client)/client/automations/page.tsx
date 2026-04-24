'use client'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useClientAutomations, useToggleAutomation } from '../../../../hooks/useAutomations'

const STATUS_LABEL: Record<string, string> = {
  ACTIVE:   'ACTIU',
  PAUSED:   'PAUSAT',
  INACTIVE: 'INACTIU',
  ERROR:    'ERROR',
}

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10',
  PAUSED:   'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10',
  INACTIVE: 'text-[var(--text-muted)] border-[var(--border)]',
  ERROR:    'text-[#ff4444] border-[#ff4444]/40 bg-[#ff4444]/10',
}

export default function ClientAutomationsPage() {
  const user     = useAuthStore(s => s.user)
  const clientId = user?.clientId ?? ''

  const { data: automations, isLoading } = useClientAutomations(clientId)
  const toggle = useToggleAutomation(clientId)

  if (isLoading) {
    return (
      <div className="p-8">
        <p className="font-mono text-[10px] text-[var(--text-muted)]">Carregant...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl">

      {/* Header */}
      <div>
        <p className="section-tag">PORTAL CLIENT</p>
        <h1 className="font-orbitron font-black text-2xl text-[var(--text)] tracking-wide">
          Les meves Automatitzacions
        </h1>
        <p className="font-rajdhani text-[var(--text-muted)] mt-1">
          Gestiona els fluxos automàtics actius del teu compte.
        </p>
      </div>

      {/* Llista */}
      {!automations || automations.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="font-orbitron text-[var(--text-muted)] text-sm">Cap automatització activa</p>
          <p className="font-mono text-[10px] text-[var(--text-muted)] mt-2">
            Contacta amb AMG per activar fluxos automàtics al teu pla.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map(auto => (
            <div key={auto.id} className={`border p-4 transition-all ${
              auto.status === 'ACTIVE' ? 'border-[#4ade80]/20 bg-[#4ade80]/3' :
              auto.status === 'ERROR'  ? 'border-[#ff4444]/20 bg-[#ff4444]/3' :
              'border-[var(--border)] bg-[var(--bg-1)]'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-rajdhani font-semibold text-[var(--text)]">{auto.template.name}</p>
                    <span className={`font-mono text-[8px] px-1.5 py-0.5 border ${STATUS_STYLE[auto.status]}`}>
                      {STATUS_LABEL[auto.status]}
                    </span>
                  </div>
                  <p className="font-mono text-[10px] text-[var(--text-muted)]">
                    {auto.template.description}
                  </p>
                  {auto.lastRunAt && (
                    <p className="font-mono text-[9px] text-[var(--text-muted)] mt-1">
                      Última execució: {new Date(auto.lastRunAt).toLocaleString('ca-ES')}
                    </p>
                  )}
                  {auto.status === 'ERROR' && auto.lastError && (
                    <p className="font-mono text-[9px] text-[#ff4444] mt-1">⚠ {auto.lastError}</p>
                  )}
                </div>

                {/* Toggle client: només pause/resume, no crear/eliminar */}
                {(auto.status === 'ACTIVE' || auto.status === 'PAUSED') && (
                  <button
                    type="button"
                    disabled={toggle.isPending}
                    onClick={() => toggle.mutate({ autoId: auto.id, active: auto.status !== 'ACTIVE' })}
                    className={`font-mono text-[9px] tracking-widest px-3 py-1.5 border transition-colors shrink-0 ${
                      auto.status === 'ACTIVE'
                        ? 'text-[#fbbf24] border-[#fbbf24]/30 hover:bg-[#fbbf24]/10'
                        : 'text-[#4ade80] border-[#4ade80]/30 hover:bg-[#4ade80]/10'
                    }`}
                  >
                    {toggle.isPending ? '...' : auto.status === 'ACTIVE' ? 'PAUSAR' : 'REPRENDRE'}
                  </button>
                )}
              </div>

              {/* Últimes execucions */}
              {auto.executions.length > 0 && (
                <div className="mt-3 pt-3 border-t border-[var(--border)]/50 flex gap-2">
                  {auto.executions.slice(0, 5).map(ex => (
                    <div
                      key={ex.id}
                      title={`${ex.status} · ${new Date(ex.startedAt).toLocaleString('ca-ES')}`}
                      className={`w-2 h-2 rounded-full ${
                        ex.status === 'SUCCESS' ? 'bg-[#4ade80]' :
                        ex.status === 'FAILED'  ? 'bg-[#ff4444]' : 'bg-[#fbbf24]'
                      }`}
                    />
                  ))}
                  <p className="font-mono text-[9px] text-[var(--text-muted)] ml-1">últimes execucions</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
