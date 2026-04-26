'use client'
import { useState } from 'react'
import {
  useCreateAutomation,
  type AutomationTemplate,
  type RequiredParam,
} from '../../../../hooks/useAutomations'

const CATEGORY_LABELS: Record<string, string> = {
  booking:    'Reserves',
  sales:      'Vendes',
  marketing:  'Màrqueting',
  billing:    'Facturació',
  onboarding: 'Onboarding',
  retention:  'Retenció',
  ecommerce:  'E-commerce',
  comunicacio:'Comunicació',
  general:    'General',
}

const CATEGORY_COLORS: Record<string, string> = {
  booking:    'text-[#60a5fa] border-[#60a5fa]/30 bg-[#60a5fa]/10',
  sales:      'text-[#4ade80] border-[#4ade80]/30 bg-[#4ade80]/10',
  marketing:  'text-[#f472b6] border-[#f472b6]/30 bg-[#f472b6]/10',
  billing:    'text-[#fbbf24] border-[#fbbf24]/30 bg-[#fbbf24]/10',
  onboarding: 'text-[#a78bfa] border-[#a78bfa]/30 bg-[#a78bfa]/10',
  retention:  'text-[#34d399] border-[#34d399]/30 bg-[#34d399]/10',
  ecommerce:  'text-[#fb923c] border-[#fb923c]/30 bg-[#fb923c]/10',
  comunicacio:'text-[#22d3ee] border-[#22d3ee]/30 bg-[#22d3ee]/10',
  general:    'text-[var(--text-muted)] border-[var(--border)]',
}

interface AutomationWizardProps {
  clientId:  string
  templates: AutomationTemplate[]
  onClose:   () => void
  onCreated: () => void
}

// ── Pas 1: seleccionar template ───────────────────────────────────────────────

function StepSelectTemplate({
  templates,
  onSelect,
}: {
  templates: AutomationTemplate[]
  onSelect:  (t: AutomationTemplate) => void
}) {
  const categories = Array.from(new Set(templates.map(t => t.category)))
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const filtered = activeCategory === 'all'
    ? templates
    : templates.filter(t => t.category === activeCategory)

  return (
    <div className="space-y-4">
      {/* Filtres de categoria */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`font-mono text-[9px] tracking-widest px-2.5 py-1 border transition-colors ${
            activeCategory === 'all'
              ? 'border-[#FF6B00]/60 text-[#FF6B00] bg-[#FF6B00]/10'
              : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
          }`}
        >
          TOTS
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`font-mono text-[9px] tracking-widest px-2.5 py-1 border transition-colors ${
              activeCategory === cat
                ? 'border-[#FF6B00]/60 text-[#FF6B00] bg-[#FF6B00]/10'
                : 'border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text)]'
            }`}
          >
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {/* Llista de templates */}
      {filtered.length === 0 ? (
        <p className="font-mono text-[10px] text-[var(--text-muted)] text-center py-6">
          Cap template disponible en aquesta categoria.
        </p>
      ) : (
        <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {filtered.map(t => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t)}
              className="w-full text-left border border-[var(--border)] bg-[var(--bg-1)] hover:border-[#FF6B00]/40 hover:bg-[#FF6B00]/5 transition-all p-3 group"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="font-rajdhani font-semibold text-sm text-[var(--text)] group-hover:text-[#FF6B00] transition-colors">
                  {t.name}
                </span>
                <span className={`font-mono text-[8px] px-1.5 py-0.5 border ${CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS.general}`}>
                  {CATEGORY_LABELS[t.category] ?? t.category}
                </span>
              </div>
              {t.description && (
                <p className="font-mono text-[9px] text-[var(--text-muted)] leading-relaxed">
                  {t.description}
                </p>
              )}
              {t.requiredParams?.length > 0 && (
                <p className="font-mono text-[8px] text-[#FF6B00]/60 mt-1">
                  {t.requiredParams.filter(p => p.required).length} paràmetre(s) requerit(s)
                </p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Pas 2: configurar paràmetres ──────────────────────────────────────────────

function ParamField({
  param,
  value,
  onChange,
}: {
  param:    RequiredParam
  value:    string
  onChange: (v: string) => void
}) {
  if (param.type === 'telegram_bot') {
    return (
      <div className="border border-[#22d3ee]/20 bg-[#22d3ee]/5 p-3">
        <p className="form-label mb-1">{param.label}</p>
        <p className="font-mono text-[9px] text-[#22d3ee]">
          El token s&apos;obté automàticament de la configuració del bot d&apos;aquest client.
        </p>
        {param.help && (
          <p className="font-mono text-[8px] text-[var(--text-muted)] mt-1">{param.help}</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-1">
      <label className="form-label">
        {param.label}
        {param.required && <span className="text-[#FF6B00] ml-0.5">*</span>}
      </label>
      <input
        type={param.type === 'password' ? 'password' : param.type === 'number' ? 'number' : param.type === 'email' ? 'email' : 'text'}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={param.default ?? ''}
        className="form-input w-full"
      />
      {param.help && (
        <p className="font-mono text-[8px] text-[var(--text-muted)]">{param.help}</p>
      )}
    </div>
  )
}

function StepConfigureParams({
  template,
  params,
  onChange,
}: {
  template: AutomationTemplate
  params:   Record<string, string>
  onChange: (key: string, value: string) => void
}) {
  const [autoOpen, setAutoOpen] = useState(false)
  const hasTelegram = template.requiredParams?.some(p => p.type === 'telegram_bot')

  const editableParams = template.requiredParams?.filter(p => p.type !== 'telegram_bot') ?? []
  const infoParams     = template.requiredParams?.filter(p => p.type === 'telegram_bot') ?? []

  return (
    <div className="space-y-4">
      <p className="font-rajdhani font-semibold text-sm text-[var(--text)]">
        Configura <span className="text-[#FF6B00]">{template.name}</span>
      </p>

      {template.description && (
        <p className="font-mono text-[9px] text-[var(--text-muted)]">{template.description}</p>
      )}

      {/* Paràmetres editables */}
      {editableParams.length > 0 && (
        <div className="space-y-3">
          {editableParams.map(param => (
            <ParamField
              key={param.key}
              param={param}
              value={params[param.key] ?? ''}
              onChange={v => onChange(param.key, v)}
            />
          ))}
        </div>
      )}

      {/* Paràmetres informatius (telegram_bot, etc.) */}
      {infoParams.length > 0 && (
        <div className="space-y-2">
          {infoParams.map(param => (
            <ParamField
              key={param.key}
              param={param}
              value=""
              onChange={() => {}}
            />
          ))}
        </div>
      )}

      {editableParams.length === 0 && infoParams.length === 0 && (
        <div className="border border-[var(--border)] bg-[var(--bg-2)] p-3">
          <p className="font-mono text-[9px] text-[var(--text-muted)]">
            Aquest template no requereix cap configuració addicional.
          </p>
        </div>
      )}

      {/* Configuració automàtica (col·lapsable) */}
      <div className="border border-[var(--border)] bg-[var(--bg-2)]">
        <button
          type="button"
          onClick={() => setAutoOpen(v => !v)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-[var(--bg-1)] transition-colors"
        >
          <span className="font-mono text-[9px] tracking-[2px] text-[var(--text-muted)] uppercase">
            Configuració automàtica
          </span>
          <span className="font-mono text-[9px] text-[var(--text-muted)]">
            {autoOpen ? '▲' : '▼'}
          </span>
        </button>
        {autoOpen && (
          <div className="border-t border-[var(--border)] px-3 py-2 space-y-1.5">
            <p className="font-mono text-[8px] text-[var(--text-muted)] mb-2">
              Les següents variables s&apos;injecten automàticament al workflow:
            </p>
            {[
              { key: 'CLIENT_ID',       desc: 'Identificador únic del client' },
              { key: 'CLIENT_NAME',     desc: 'Nom del client' },
              { key: 'WEBHOOK_SECRET',  desc: 'Secret per validar webhooks' },
              ...(hasTelegram ? [{ key: 'TELEGRAM_TOKEN', desc: 'Token del bot de Telegram' }] : []),
            ].map(v => (
              <div key={v.key} className="flex items-start gap-2">
                <span className="font-mono text-[8px] text-[#FF6B00]/80 shrink-0 w-36">{v.key}</span>
                <span className="font-mono text-[8px] text-[var(--text-muted)]">{v.desc}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Pas 3: desplegar ──────────────────────────────────────────────────────────

function StepDeploy({
  template,
  params,
  clientId,
  onCreated,
}: {
  template: AutomationTemplate
  params:   Record<string, string>
  clientId: string
  onCreated: () => void
}) {
  const create = useCreateAutomation(clientId)

  const editableParams = Object.entries(params).filter(([, v]) => v !== '')

  async function handleCreate() {
    await create.mutateAsync({ templateId: template.id, params })
    onCreated()
  }

  return (
    <div className="space-y-4">
      <p className="font-mono text-[9px] tracking-[3px] text-[var(--text-muted)] uppercase">
        Resum del desplegament
      </p>

      {/* Nom del template */}
      <div className="border border-[var(--border)] bg-[var(--bg-2)] p-3 space-y-1">
        <p className="font-mono text-[8px] text-[var(--text-muted)] tracking-widest uppercase">Template</p>
        <div className="flex items-center gap-2">
          <p className="font-rajdhani font-semibold text-sm text-[var(--text)]">{template.name}</p>
          <span className={`font-mono text-[8px] px-1.5 py-0.5 border ${CATEGORY_COLORS[template.category] ?? CATEGORY_COLORS.general}`}>
            {CATEGORY_LABELS[template.category] ?? template.category}
          </span>
        </div>
        {template.description && (
          <p className="font-mono text-[9px] text-[var(--text-muted)]">{template.description}</p>
        )}
      </div>

      {/* Paràmetres introduïts */}
      {editableParams.length > 0 && (
        <div className="border border-[var(--border)] bg-[var(--bg-2)] p-3 space-y-2">
          <p className="font-mono text-[8px] text-[var(--text-muted)] tracking-widest uppercase">Paràmetres configurats</p>
          {editableParams.map(([key, value]) => {
            const paramDef = template.requiredParams?.find(p => p.key === key)
            const isPassword = paramDef?.type === 'password'
            return (
              <div key={key} className="flex items-start gap-2">
                <span className="font-mono text-[9px] text-[#FF6B00]/80 shrink-0 w-36">
                  {paramDef?.label ?? key}
                </span>
                <span className="font-mono text-[9px] text-[var(--text)]">
                  {isPassword ? '••••••••' : value}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Configuració automàtica (info) */}
      <div className="border border-[var(--border)]/50 p-2">
        <p className="font-mono text-[8px] text-[var(--text-muted)]">
          Variables automàtiques: CLIENT_ID · CLIENT_NAME · WEBHOOK_SECRET
          {template.requiredParams?.some(p => p.type === 'telegram_bot') && ' · TELEGRAM_TOKEN'}
        </p>
      </div>

      {/* Botó crear */}
      <button
        type="button"
        disabled={create.isPending}
        onClick={handleCreate}
        className="btn-primary w-full text-[10px]"
      >
        {create.isPending ? 'CREANT WORKFLOW...' : 'CREAR WORKFLOW'}
      </button>

      {create.isError && (
        <p className="font-mono text-[9px] text-[#ff4444]">
          Error en crear el workflow. Comprova que n8n estigui actiu i torna-ho a intentar.
        </p>
      )}
    </div>
  )
}

// ── Wizard principal ──────────────────────────────────────────────────────────

const STEP_LABELS = ['Seleccionar', 'Configurar', 'Desplegar']

export default function AutomationWizard({
  clientId,
  templates,
  onClose,
  onCreated,
}: AutomationWizardProps) {
  const [step, setStep]               = useState<1 | 2 | 3>(1)
  const [selected, setSelected]       = useState<AutomationTemplate | null>(null)
  const [params, setParams]           = useState<Record<string, string>>({})

  function handleSelectTemplate(t: AutomationTemplate) {
    setSelected(t)
    // Pre-omplir valors per defecte
    const defaults: Record<string, string> = {}
    t.requiredParams?.forEach(p => {
      if (p.default) defaults[p.key] = p.default
    })
    setParams(defaults)
    setStep(2)
  }

  function handleParamChange(key: string, value: string) {
    setParams(prev => ({ ...prev, [key]: value }))
  }

  function canProceedStep2(): boolean {
    if (!selected) return false
    const editableRequired = selected.requiredParams?.filter(
      p => p.required && p.type !== 'telegram_bot'
    ) ?? []
    return editableRequired.every(p => (params[p.key] ?? '').trim() !== '')
  }

  return (
    // Overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-lg bg-[#0d0d1a] border border-[var(--border)] flex flex-col max-h-[90vh]">

        {/* Capçalera */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div>
            <p className="font-mono text-[8px] tracking-[3px] text-[#FF6B00] uppercase mb-1">
              Nou Workflow
            </p>
            {/* Indicador de passos */}
            <div className="flex items-center gap-2">
              {STEP_LABELS.map((label, i) => {
                const num = i + 1
                const isActive   = step === num
                const isDone     = step > num
                return (
                  <div key={label} className="flex items-center gap-1.5">
                    {i > 0 && (
                      <div className={`w-6 h-px ${isDone ? 'bg-[#FF6B00]/60' : 'bg-[var(--border)]'}`} />
                    )}
                    <div className="flex items-center gap-1">
                      <div className={`w-4 h-4 flex items-center justify-center font-mono text-[8px] border transition-colors ${
                        isActive ? 'border-[#FF6B00] text-[#FF6B00] bg-[#FF6B00]/10' :
                        isDone   ? 'border-[#FF6B00]/40 text-[#FF6B00]/60 bg-[#FF6B00]/5' :
                        'border-[var(--border)] text-[var(--text-muted)]'
                      }`}>
                        {isDone ? '✓' : num}
                      </div>
                      <span className={`font-mono text-[8px] tracking-wider ${
                        isActive ? 'text-[var(--text)]' : 'text-[var(--text-muted)]'
                      }`}>
                        {label.toUpperCase()}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--border)] px-2 py-1 hover:border-[var(--text-muted)] transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Contingut del pas */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === 1 && (
            <StepSelectTemplate
              templates={templates}
              onSelect={handleSelectTemplate}
            />
          )}
          {step === 2 && selected && (
            <StepConfigureParams
              template={selected}
              params={params}
              onChange={handleParamChange}
            />
          )}
          {step === 3 && selected && (
            <StepDeploy
              template={selected}
              params={params}
              clientId={clientId}
              onCreated={onCreated}
            />
          )}
        </div>

        {/* Peu de pàgina amb navegació (no al pas 1 ni al 3) */}
        {step === 2 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="btn-outline text-[10px]"
            >
              ← ENRERE
            </button>
            <button
              type="button"
              disabled={!canProceedStep2()}
              onClick={() => setStep(3)}
              className="btn-primary text-[10px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              SEGÜENT →
            </button>
          </div>
        )}
        {step === 3 && (
          <div className="flex items-center px-5 py-3 border-t border-[var(--border)]">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="btn-outline text-[10px]"
            >
              ← ENRERE
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
