'use client'
import { useState } from 'react'
import {
  useClientAutomations,
  useAutomationTemplates,
  useToggleAutomation,
  useDeleteAutomation,
  type ClientAutomation,
} from '../../../../hooks/useAutomations'
import AutomationWizard from './AutomationWizard'

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:   'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/10',
  PAUSED:   'text-[#fbbf24] border-[#fbbf24]/40 bg-[#fbbf24]/10',
  INACTIVE: 'text-[var(--text-muted)] border-[var(--border)]',
  ERROR:    'text-[#ff4444] border-[#ff4444]/40 bg-[#ff4444]/10',
}

const EXEC_STATUS_DOT: Record<string, string> = {
  SUCCESS: 'bg-[#4ade80]',
  FAILED:  'bg-[#ff4444]',
  RUNNING: 'bg-[#fbbf24]',
}

const CATEGORY_LABELS: Record<string, string> = {
  booking:   'Reserves',
  sales:     'Vendes',
  marketing: 'Màrqueting',
  billing:   'Facturació',
  onboarding:'Onboarding',
  retention: 'Retenció',
  ecommerce: 'E-commerce',
  general:   'General',
}

function AutomationRow({ auto, clientId }: { auto: ClientAutomation; clientId: string }) {
  const [expanded, setExpanded] = useState(false)
  const toggle  = useToggleAutomation(clientId)
  const remove  = useDeleteAutomation(clientId)

  const isActive  = auto.status === 'ACTIVE'
  const isPaused  = auto.status === 'PAUSED'
  const hasN8n    = Boolean(auto.n8nWorkflowId)

  return (
    <div className={`border transition-all ${
      isActive ? 'border-[#4ade80]/20 bg-[#4ade80]/3' :
      auto.status === 'ERROR' ? 'border-[#ff4444]/20 bg-[#ff4444]/3' :
      'border-[var(--border)] bg-[var(--bg-1)]'
    }`}>
      <div className="flex items-center justify-between px-4 py-3 gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-rajdhani font-semibold text-sm text-[var(--text)] truncate">{auto.name}</p>
            <span className={`font-mono text-[8px] px-1.5 py-0.5 border ${STATUS_STYLE[auto.status] ?? STATUS_STYLE.INACTIVE}`}>
              {auto.status}
            </span>
            {!hasN8n && (
              <span className="font-mono text-[8px] px-1.5 py-0.5 border border-[#fbbf24]/30 text-[#fbbf24]">
                SENSE N8N
              </span>
            )}
          </div>
          <p className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5">
            {CATEGORY_LABELS[auto.template.category] ?? auto.template.category}
            {auto.lastRunAt && ` · última execució: ${new Date(auto.lastRunAt).toLocaleDateString('ca-ES')}`}
            {auto.errorCount > 0 && ` · errors: ${auto.errorCount}`}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {auto.executions.length > 0 && (
            <button
              type="button"
              onClick={() => setExpanded(v => !v)}
              className="font-mono text-[9px] tracking-widest px-2 py-1 border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
            >
              {expanded ? 'TANCAR ▲' : `EXECUCIONS (${auto.executions.length}) ▼`}
            </button>
          )}

          {/* Pause / Resume */}
          {(isActive || isPaused) && (
            <button
              type="button"
              disabled={toggle.isPending}
              onClick={() => toggle.mutate({ autoId: auto.id, active: !isActive })}
              className={`font-mono text-[9px] tracking-widest px-3 py-1.5 border transition-colors ${
                isActive
                  ? 'text-[#fbbf24] border-[#fbbf24]/30 hover:bg-[#fbbf24]/10'
                  : 'text-[#4ade80] border-[#4ade80]/30 hover:bg-[#4ade80]/10'
              }`}
            >
              {toggle.isPending ? '...' : isActive ? 'PAUSAR' : 'REPRENDRE'}
            </button>
          )}

          {/* Eliminar */}
          <button
            type="button"
            disabled={remove.isPending}
            onClick={() => {
              if (confirm(`Eliminar "${auto.name}"?`)) remove.mutate(auto.id)
            }}
            className="font-mono text-[9px] tracking-widest px-2 py-1.5 border border-[#ff4444]/20 text-[#ff4444]/60 hover:text-[#ff4444] hover:border-[#ff4444]/40 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Execucions recents */}
      {expanded && auto.executions.length > 0 && (
        <div className="border-t border-[var(--border)] px-4 py-3 space-y-1.5">
          <p className="font-mono text-[9px] tracking-[3px] text-[var(--text-muted)] uppercase mb-2">Execucions recents</p>
          {auto.executions.map(ex => (
            <div key={ex.id} className="flex items-center gap-3 py-1 border-b border-[var(--border)]/50 last:border-0">
              <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${EXEC_STATUS_DOT[ex.status] ?? 'bg-gray-400'}`} />
              <span className="font-mono text-[9px] text-[var(--text-muted)] w-24 shrink-0">
                {new Date(ex.startedAt).toLocaleDateString('ca-ES')}
              </span>
              <span className={`font-mono text-[9px] ${ex.status === 'FAILED' ? 'text-[#ff4444]' : 'text-[var(--text-muted)]'}`}>
                {ex.status}{ex.durationMs ? ` · ${ex.durationMs}ms` : ''}
              </span>
              {ex.error && (
                <span className="font-mono text-[9px] text-[#ff4444] truncate">{ex.error}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error info */}
      {auto.status === 'ERROR' && auto.lastError && (
        <div className="border-t border-[#ff4444]/20 px-4 py-2">
          <p className="font-mono text-[9px] text-[#ff4444]">⚠ {auto.lastError}</p>
        </div>
      )}
    </div>
  )
}

export default function AutomationsPanel({ clientId }: { clientId: string }) {
  const { data: automations, isLoading } = useClientAutomations(clientId)
  const { data: templates }              = useAutomationTemplates()
  const [showWizard, setShowWizard]      = useState(false)

  if (isLoading) {
    return <p className="font-mono text-[10px] text-[var(--text-muted)]">Carregant automatitzacions...</p>
  }

  return (
    <div className="space-y-4">

      {/* Header + botó afegir */}
      <div className="flex items-center justify-between">
        <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase">
          Automatitzacions ({automations?.length ?? 0})
        </p>
        <button
          type="button"
          onClick={() => setShowWizard(true)}
          className="font-mono text-[9px] tracking-widest px-3 py-1.5 border border-[#FF6B00]/40 text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors"
        >
          + AFEGIR
        </button>
      </div>

      {/* Wizard d'automatitzacions */}
      {showWizard && templates && (
        <AutomationWizard
          clientId={clientId}
          templates={templates}
          onClose={() => setShowWizard(false)}
          onCreated={() => setShowWizard(false)}
        />
      )}

      {/* Llista d'automatitzacions */}
      {automations && automations.length > 0 ? (
        <div className="space-y-2">
          {automations.map(auto => (
            <AutomationRow key={auto.id} auto={auto} clientId={clientId} />
          ))}
        </div>
      ) : (
        <div className="border border-[var(--border)] p-4 text-center">
          <p className="font-mono text-[10px] text-[var(--text-muted)]">
            Cap automatització configurada. Afegeix-ne una des del botó de dalt.
          </p>
        </div>
      )}
    </div>
  )
}
