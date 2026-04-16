'use client'
import { useState } from 'react'
import { useCredentials, useSetCredential, useDeleteCredential } from '../../../../hooks/useCredentials'

const SERVICE_PRESETS: { service: string; label: string; keys: string[] }[] = [
  { service: 'whatsapp', label: 'WhatsApp Business', keys: ['API_KEY', 'PHONE_ID', 'WEBHOOK_TOKEN'] },
  { service: 'n8n',      label: 'n8n',               keys: ['WEBHOOK_URL', 'API_KEY'] },
  { service: 'openai',   label: 'OpenAI',             keys: ['API_KEY'] },
]

interface Props { clientId: string }

export default function CredentialsPanel({ clientId }: Props) {
  const { data: creds = [], isLoading } = useCredentials(clientId)
  const setCredential    = useSetCredential(clientId)
  const deleteCredential = useDeleteCredential(clientId)

  const [form, setForm] = useState({ service: '', key: '', value: '' })
  const [showForm, setShowForm] = useState(false)
  const [showValues, setShowValues] = useState<Set<string>>(new Set())

  const handlePreset = (service: string, key: string) => {
    setForm({ service, key, value: '' })
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.service || !form.key || !form.value) return
    await setCredential.mutateAsync({ service: form.service.toLowerCase(), key: form.key.toUpperCase(), value: form.value })
    setForm({ service: '', key: '', value: '' })
    setShowForm(false)
  }

  const grouped = creds.reduce<Record<string, typeof creds>>((acc, c) => {
    if (!acc[c.service]) acc[c.service] = []
    acc[c.service].push(c)
    return acc
  }, {})

  return (
    <div className="space-y-4">

      {/* Ràpids d'afegir */}
      <div>
        <p className="form-label mb-2">Afegir ràpid</p>
        <div className="flex flex-wrap gap-2">
          {SERVICE_PRESETS.map(preset =>
            preset.keys.map(key => {
              const exists = creds.some(c => c.service === preset.service && c.key === key)
              return (
                <button
                  key={`${preset.service}-${key}`}
                  type="button"
                  onClick={() => handlePreset(preset.service, key)}
                  className={`font-mono text-[9px] tracking-wider px-2.5 py-1 border transition-colors ${
                    exists
                      ? 'text-[#4ade80] border-[#4ade80]/40 bg-[#4ade80]/5'
                      : 'text-[var(--text-muted)] border-[var(--border)] hover:border-[#FF6B00]/40 hover:text-[#FF6B00]'
                  }`}
                >
                  {preset.service.toUpperCase()} · {key}
                  {exists && ' ✓'}
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Formulari d'entrada */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-[var(--bg-1)] border border-[#FF6B00]/30 p-4 space-y-3">
          <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase">Nova credencial</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Servei</label>
              <input
                className="form-input font-mono text-sm"
                placeholder="whatsapp"
                value={form.service}
                onChange={e => setForm(v => ({ ...v, service: e.target.value }))}
              />
            </div>
            <div>
              <label className="form-label">Clau</label>
              <input
                className="form-input font-mono text-sm uppercase"
                placeholder="API_KEY"
                value={form.key}
                onChange={e => setForm(v => ({ ...v, key: e.target.value }))}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Valor</label>
            <input
              className="form-input font-mono text-sm"
              type="password"
              placeholder="••••••••"
              value={form.value}
              onChange={e => setForm(v => ({ ...v, value: e.target.value }))}
              autoComplete="off"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn-primary text-xs" disabled={setCredential.isPending}>
              {setCredential.isPending ? 'DESANT...' : 'DESAR'}
            </button>
            <button type="button" className="btn-outline text-xs" onClick={() => setShowForm(false)}>CANCEL·LAR</button>
          </div>
        </form>
      )}

      {/* Llista de credencials */}
      {isLoading ? (
        <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest animate-pulse">CARREGANT...</p>
      ) : creds.length === 0 ? (
        <div className="bg-[var(--bg-1)] border border-[var(--border)] p-6 text-center">
          <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest mb-3">SENSE CREDENCIALS</p>
          <button type="button" className="btn-outline text-xs" onClick={() => setShowForm(true)}>+ AFEGIR</button>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(grouped).map(([service, entries]) => (
            <div key={service} className="bg-[var(--bg-1)] border border-[var(--border)]">
              <div className="px-4 py-2 border-b border-[var(--border)] bg-[var(--bg-2)]">
                <p className="font-mono text-[9px] tracking-[3px] text-[#FF6B00] uppercase">{service}</p>
              </div>
              {entries.map(c => (
                <div key={c.id} className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-[var(--text)]">{c.key}</span>
                    <span className="font-mono text-[9px] text-[var(--text-muted)]">
                      {showValues.has(c.id) ? '(visible)' : '••••••••'}
                    </span>
                    <span className="font-mono text-[8px] text-[var(--text-muted)]">
                      {new Date(c.updatedAt).toLocaleDateString('ca-ES')}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="btn-outline text-[9px] px-2 py-1"
                      onClick={() => handlePreset(service, c.key)}
                    >
                      ACTUALITZAR
                    </button>
                    <button
                      type="button"
                      className="font-mono text-[9px] text-[#ff4444] hover:text-[#ff6666] tracking-widest transition-colors px-1"
                      onClick={() => deleteCredential.mutate(c.id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
          <button type="button" className="btn-outline text-xs" onClick={() => setShowForm(true)}>
            + AFEGIR CREDENCIAL
          </button>
        </div>
      )}
    </div>
  )
}
