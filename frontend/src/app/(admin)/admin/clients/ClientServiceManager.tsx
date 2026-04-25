'use client'
import { useState } from 'react'
import { useToggleService } from '../../../../hooks/useServiceActivation'
import LandingEditor from './LandingEditor'
import ConnectionsPanel from './ConnectionsPanel'
import CredentialsPanel from './CredentialsPanel'
import AutomationsPanel from './AutomationsPanel'
import { DomainsPanel } from './DomainsPanel'
import { AIProvidersPanel } from './AIProvidersPanel'
import RAGPanel from './RAGPanel'
import WhatsAppBotPanel from './WhatsAppBotPanel'
import TelegramBotPanel from './TelegramBotPanel'

// ── Tipus ──────────────────────────────────────────────────────────────────────

interface ServiceEntry {
  serviceId:   string
  serviceName: string
  serviceSlug: string
  serviceDesc: string | null
  category:    string
  active:      boolean
  activatedAt: string | null
  isExtra:     boolean
}

interface Props {
  clientId:    string
  companyName: string
  services:    ServiceEntry[]
}

// ── Tutorial per servei ────────────────────────────────────────────────────────

const TUTORIALS: Record<string, { step: string; desc: string }[]> = {
  landing: [
    { step: 'Pujar el logo',           desc: 'Selecciona la imatge corporativa del client. El sistema suggerirà un color i estil automàticament.' },
    { step: 'Títol i subtítol',        desc: 'Escriu el nom comercial o eslògan principal. El títol és opcional si hi ha logo.' },
    { step: 'Descripció dels serveis', desc: 'Afegeix un text breu explicant els serveis que ofereix el client.' },
    { step: 'Estil i colors',          desc: 'Tria l\'estil visual (Dark Tech, Minimal, Gradient o Split) i el color corporatiu.' },
    { step: 'Publicar',                desc: 'Desa els canvis i activa la publicació. La landing quedarà accessible a /l/[slug].' },
  ],
  whatsapp: [
    { step: 'Compte WhatsApp Business', desc: 'El client ha de tenir un número de WhatsApp Business actiu a Meta Business Suite.' },
    { step: 'Connectar OAuth',          desc: 'Fes clic a "CONNECTAR →" a la secció de connexions per autoritzar l\'accés via Meta.' },
    { step: 'Configurar n8n',           desc: 'Afegeix la URL del webhook n8n i l\'API Key als camps de credencials.' },
    { step: 'Provar el bot',            desc: 'Envia un missatge de prova al número del client per verificar que el bot respon.' },
  ],
  automatitzacions: [
    { step: 'Credencials n8n',     desc: 'Afegeix la URL del servidor n8n (WEBHOOK_URL) i l\'API Key del portal.' },
    { step: 'Activar workflows',   desc: 'Des del panell n8n, activa els fluxos corresponents al client.' },
    { step: 'Variables del client', desc: 'Configura les variables CLIENT_ID i CLIENT_EMAIL als workflows de n8n.' },
    { step: 'Provar l\'automatització', desc: 'Executa una prova manual del workflow per verificar el funcionament.' },
  ],
  telegram: [
    { step: 'Crear el bot a @BotFather', desc: 'Obre Telegram, escriu a @BotFather i executa /newbot. Segueix les instruccions per obtenir el token.' },
    { step: 'Afegir el token', desc: 'Enganxa el token del bot al camp "Token del Bot (BotFather)" del panell de configuració.' },
    { step: 'Configurar n8n', desc: 'Afegeix la URL del webhook n8n i l\'API Key als camps de credencials per als workflows de Telegram.' },
    { step: 'Provar el bot', desc: 'Obre el bot a Telegram, envia /start i verifica que respon correctament.' },
  ],
}

function getTutorial(slug: string) {
  if (slug.startsWith('landing-')) return TUTORIALS.landing
  if (slug === 'whatsapp-bot')      return TUTORIALS.whatsapp
  if (slug === 'automatitzacions')  return TUTORIALS.automatitzacions
  if (slug === 'bot-telegram')      return TUTORIALS.telegram
  return null
}

// ── Icones per categoria ──────────────────────────────────────────────────────

const CATEGORY_ICON: Record<string, string> = {
  PRODUCTE:        '📦',
  IA:              '🤖',
  AUTOMATITZACIONS:'⚡',
  COMUNICACIO:     '💬',
  INFORMES:        '📊',
  SUPORT:          '🛠',
  OPERACIONAL:     '🔧',
}

// ── Panel de configuració per slug ────────────────────────────────────────────

function ServiceConfigPanel({ clientId, companyName, slug }: { clientId: string; companyName: string; slug: string }) {
  if (slug.startsWith('landing-')) {
    return <LandingEditor clientId={clientId} companyName={companyName} />
  }

  if (slug === 'whatsapp-bot') {
    return (
      <div className="space-y-6">
        <div>
          <p className="font-mono text-[9px] tracking-[3px] text-[#60a5fa] uppercase mb-3">Connexió WhatsApp Business</p>
          <ConnectionsPanel clientId={clientId} filterProvider="whatsapp" />
        </div>
        <div>
          <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase mb-3">Connexió n8n (Webhook)</p>
          <ConnectionsPanel clientId={clientId} filterProvider="n8n" />
          <div className="mt-3">
            <CredentialsPanel clientId={clientId} filterService="n8n" />
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-4">
          <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase mb-3">Configuració del Bot</p>
          <WhatsAppBotPanel clientId={clientId} companyName={companyName} />
        </div>
      </div>
    )
  }

  if (slug === 'bot-telegram') {
    return (
      <div className="space-y-6">
        <div>
          <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase mb-3">Connexió n8n (Webhook)</p>
          <ConnectionsPanel clientId={clientId} filterProvider="n8n" />
          <div className="mt-3">
            <CredentialsPanel clientId={clientId} filterService="n8n" />
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-4">
          <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase mb-3">Configuració del Bot Telegram</p>
          <TelegramBotPanel clientId={clientId} companyName={companyName} />
        </div>
      </div>
    )
  }

  if (slug === 'automatitzacions') {
    return (
      <div className="space-y-6">
        <div>
          <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase mb-3">Credencials n8n</p>
          <ConnectionsPanel clientId={clientId} filterProvider="n8n" />
          <div className="mt-3">
            <CredentialsPanel clientId={clientId} filterService="n8n" />
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-4">
          <AutomationsPanel clientId={clientId} />
        </div>
      </div>
    )
  }

  if (slug === 'domini-personalitzat' || slug.includes('domini')) {
    return <DomainsPanel clientId={clientId} />
  }

  if (slug.includes('rag') || slug === 'documents-rag') {
    return (
      <div className="space-y-6">
        <div>
          <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase mb-3">Proveïdors IA</p>
          <AIProvidersPanel clientId={clientId} />
        </div>
        <div className="border-t border-[var(--border)] pt-4">
          <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase mb-3">Documents RAG</p>
          <RAGPanel clientId={clientId} />
        </div>
      </div>
    )
  }

  if (slug.includes('ia') || slug.includes('ai') || slug.includes('proveidor')) {
    return <AIProvidersPanel clientId={clientId} />
  }

  return (
    <div className="p-4 border border-[var(--border)] bg-[var(--bg-1)]">
      <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
        Configuració disponible pròximament per a aquest servei.
      </p>
    </div>
  )
}

// ── Tutorial component ────────────────────────────────────────────────────────

function ServiceTutorial({ steps }: { steps: { step: string; desc: string }[] }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border border-[#60a5fa]/20 bg-[#60a5fa]/3">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[#60a5fa]/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] tracking-widest text-[#60a5fa]">TUTORIAL DE CONFIGURACIÓ</span>
        </div>
        <span className="font-mono text-[10px] text-[#60a5fa]">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-[#60a5fa]/20">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3 pt-3">
              <div className="w-5 h-5 rounded-full border border-[#60a5fa]/40 flex items-center justify-center shrink-0 mt-0.5">
                <span className="font-mono text-[9px] text-[#60a5fa]">{i + 1}</span>
              </div>
              <div>
                <p className="font-rajdhani font-semibold text-sm text-[var(--text)]">{s.step}</p>
                <p className="font-mono text-[10px] text-[var(--text-muted)] mt-0.5 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Component principal ───────────────────────────────────────────────────────

export default function ClientServiceManager({ clientId, companyName, services }: Props) {
  const toggle = useToggleService(clientId)
  const [expandedId, setExpandedId] = useState<string | null>(
    // auto-expandir el primer servei actiu (si n'hi ha)
    services.find(s => s.active)?.serviceId ?? null
  )

  if (services.length === 0) {
    return (
      <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
        Aquest client no té cap servei contractat.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {services.map(svc => {
        const isExpanded = expandedId === svc.serviceId
        const tutorial   = getTutorial(svc.serviceSlug)
        const icon       = CATEGORY_ICON[svc.category] ?? '📦'

        return (
          <div key={svc.serviceId}
            className={`border transition-all ${
              svc.active
                ? 'border-[#4ade80]/30 bg-[#4ade80]/3'
                : 'border-[var(--border)] bg-[var(--bg-1)]'
            }`}>

            {/* ── Capçalera del servei ─────────────────────── */}
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg shrink-0">{icon}</span>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-rajdhani font-semibold text-sm text-[var(--text)]">{svc.serviceName}</p>
                    {svc.isExtra && (
                      <span className="font-mono text-[8px] px-1.5 py-0.5 border border-[#FF6B00]/30 text-[#FF6B00]">EXTRA</span>
                    )}
                    {svc.active ? (
                      <span className="font-mono text-[8px] px-1.5 py-0.5 border border-[#4ade80]/40 text-[#4ade80] bg-[#4ade80]/10">ACTIU</span>
                    ) : (
                      <span className="font-mono text-[8px] px-1.5 py-0.5 border border-[var(--border)] text-[var(--text-muted)]">INACTIU</span>
                    )}
                  </div>
                  <p className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5 truncate">{svc.serviceDesc}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 ml-3">
                {/* Botó configurar (si actiu) */}
                {svc.active && (
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : svc.serviceId)}
                    className={`font-mono text-[9px] tracking-widest px-3 py-1.5 border transition-colors ${
                      isExpanded
                        ? 'border-[var(--text-muted)] text-[var(--text)]'
                        : 'border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'
                    }`}
                  >
                    {isExpanded ? 'TANCAR ▲' : 'CONFIGURAR ▼'}
                  </button>
                )}

                {/* Toggle actiu/inactiu */}
                <button
                  type="button"
                  disabled={toggle.isPending}
                  onClick={() => {
                    const next = !svc.active
                    toggle.mutate({ serviceId: svc.serviceId, active: next })
                    if (next) setExpandedId(svc.serviceId)
                    else if (expandedId === svc.serviceId) setExpandedId(null)
                  }}
                  className={`font-mono text-[9px] tracking-widest px-3 py-1.5 border transition-colors ${
                    svc.active
                      ? 'text-[#ff4444] border-[#ff4444]/30 hover:bg-[#ff4444]/10'
                      : 'text-[#4ade80] border-[#4ade80]/30 hover:bg-[#4ade80]/10'
                  }`}
                >
                  {toggle.isPending ? '...' : svc.active ? 'DESACTIVAR' : 'ACTIVAR'}
                </button>
              </div>
            </div>

            {/* ── Panell de configuració (expandit) ────────── */}
            {svc.active && isExpanded && (
              <div className="border-t border-[var(--border)] p-4 space-y-4">
                {tutorial && <ServiceTutorial steps={tutorial} />}
                <ServiceConfigPanel
                  clientId={clientId}
                  companyName={companyName}
                  slug={svc.serviceSlug}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
