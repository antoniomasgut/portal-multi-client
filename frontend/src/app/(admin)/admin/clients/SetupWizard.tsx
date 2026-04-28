'use client'
import { useState } from 'react'
import type { Client } from '../../../../types'
import ConnectionsPanel from './ConnectionsPanel'
import CredentialsPanel from './CredentialsPanel'

const STEPS = [
  { id: 'verificar',   label: 'Verificar dades',   icon: '✓' },
  { id: 'connexions',  label: 'Connexions',         icon: '⚡' },
  { id: 'credencials', label: 'Credencials API',    icon: '🔑' },
  { id: 'completat',   label: 'Completat',          icon: '🎯' },
]

interface Props {
  client:  Client
  onClose: () => void
}

export default function SetupWizard({ client, onClose }: Props) {
  const [step, setStep] = useState(0)

  const activeSub = client.subscriptions.find(s => s.status === 'ACTIVE')

  return (
    <div className="p-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <p className="section-tag">FLUX DE CONFIGURACIÓ</p>
          <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">{client.companyName}</h1>
          <p className="font-mono text-[11px] text-[var(--text-muted)] mt-1 tracking-widest">
            Configura el client pas a pas
          </p>
        </div>
        <button className="btn-outline text-xs" onClick={onClose}>TANCA</button>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => setStep(i)}
              className={`flex flex-col items-center gap-1.5 transition-all ${i <= step ? 'opacity-100' : 'opacity-40'}`}
            >
              <div className={`w-8 h-8 flex items-center justify-center border font-mono text-[11px] transition-all ${
                i < step  ? 'bg-[#4ade80] border-[#4ade80] text-black' :
                i === step ? 'bg-[#FF6B00] border-[#FF6B00] text-white' :
                             'border-[var(--border)] text-[var(--text-muted)]'
              }`}>
                {i < step ? '✓' : (i + 1)}
              </div>
              <p className="font-mono text-[8px] tracking-wider text-[var(--text-muted)] whitespace-nowrap">{s.label.toUpperCase()}</p>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-px mx-2 ${i < step ? 'bg-[#4ade80]' : 'bg-[var(--border)]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-[var(--bg-2)] border border-[var(--border)] p-6 min-h-[300px]">

        {step === 0 && (
          <div>
            <p className="font-mono text-[10px] tracking-[4px] text-[#FF6B00] uppercase mb-5">Resum del client</p>
            <div className="space-y-3">
              <Row label="Empresa"  value={client.companyName} />
              <Row label="Contacte" value={`${client.contactName} · ${client.contactEmail}`} />
              <Row label="Domini"   value={client.domain || '—'} />
              <Row label="Pla"      value={activeSub?.plan?.name ?? (activeSub?.isCustom ? 'Personalitzat' : '—')} />
              {activeSub && (
                <Row label="Preu"   value={`${parseFloat(String(activeSub.priceMonthly)) || 0}€/mes${parseFloat(String(activeSub.priceSetup)) > 0 ? ` · ${parseFloat(String(activeSub.priceSetup))}€ setup` : ''}`} />
              )}
              {client.isTest && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="font-mono text-[8px] tracking-widest px-1.5 py-0.5 border border-[#60a5fa]/40 text-[#60a5fa] bg-[#60a5fa]/10">TEST</span>
                  <p className="font-mono text-[9px] text-[var(--text-muted)]">Client de prova — no genera factures</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 1 && (
          <div>
            <p className="font-mono text-[10px] tracking-[4px] text-[#4ade80] uppercase mb-5">Connexions de serveis</p>
            <ConnectionsPanel clientId={client.id} />
          </div>
        )}

        {step === 2 && (
          <div>
            <p className="font-mono text-[10px] tracking-[4px] text-[var(--text-muted)] uppercase mb-3">Credencials API</p>
            <p className="font-rajdhani text-[var(--text-muted)] text-sm mb-5">
              Afegeix les claus API manuals que no s'obtenen via OAuth (n8n webhook URL, SMTP, etc.)
            </p>
            <CredentialsPanel clientId={client.id} />
          </div>
        )}

        {step === 3 && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-[#4ade80]/10 border border-[#4ade80]/30 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <p className="font-orbitron font-bold text-xl text-[#4ade80] mb-2">Configuració completada</p>
            <p className="font-rajdhani text-[var(--text-muted)] text-sm mb-6">
              El client <strong className="text-[var(--text)]">{client.companyName}</strong> ja està llest per operar.
            </p>
            <button className="btn-primary text-xs" onClick={onClose}>
              ANAR A LA LLISTA DE CLIENTS
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step < 3 && (
        <div className="flex justify-between mt-6">
          <button
            className="btn-outline text-xs"
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            ← ANTERIOR
          </button>
          <button
            className="btn-primary text-xs"
            onClick={() => setStep(s => s + 1)}
          >
            {step === 2 ? 'FINALITZAR →' : 'SEGÜENT →'}
          </button>
        </div>
      )}

    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <p className="font-mono text-[9px] tracking-[3px] text-[var(--text-muted)] uppercase w-20 shrink-0">{label}</p>
      <p className="font-rajdhani text-[var(--text)] text-sm">{value}</p>
    </div>
  )
}
