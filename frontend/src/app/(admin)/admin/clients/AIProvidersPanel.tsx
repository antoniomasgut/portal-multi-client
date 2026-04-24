'use client'
import { useState } from 'react'
import {
  useAIProviders,
  useProviderModels,
  useCreateAIProvider,
  useUpdateAIProvider,
  useDeleteAIProvider,
  AIProviderEntry,
  AIProviderType,
} from '../../../../hooks/useAIProviders'

const PROVIDER_ICONS: Record<AIProviderType, string> = {
  GROQ:      '⚡',
  OLLAMA:    '🦙',
  OPENAI:    '◆',
  ANTHROPIC: '△',
}

const PROVIDER_COLORS: Record<AIProviderType, string> = {
  GROQ:      'text-yellow-400',
  OLLAMA:    'text-green-400',
  OPENAI:    'text-blue-400',
  ANTHROPIC: 'text-orange-400',
}

const NEEDS_API_KEY: AIProviderType[] = ['GROQ', 'OPENAI', 'ANTHROPIC']
const NEEDS_BASE_URL: AIProviderType[] = ['OLLAMA']

function ProviderRow({ prov, clientId }: { prov: AIProviderEntry; clientId: string }) {
  const update = useUpdateAIProvider(clientId)
  const remove = useDeleteAIProvider(clientId)
  const [editing, setEditing] = useState(false)
  const [apiKey, setApiKey]   = useState('')

  const handleToggle = () => update.mutate({ id: prov.id, isActive: !prov.isActive })
  const handleSaveKey = async () => {
    if (!apiKey.trim()) return
    await update.mutateAsync({ id: prov.id, apiKey: apiKey.trim() })
    setApiKey('')
    setEditing(false)
  }

  return (
    <div className="border-b border-orange-900/20 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className={`text-lg ${PROVIDER_COLORS[prov.provider]}`}>
            {PROVIDER_ICONS[prov.provider]}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-mono font-bold ${PROVIDER_COLORS[prov.provider]}`}>
                {prov.provider}
              </span>
              <span className="text-xs text-gray-400 font-mono">{prov.model}</span>
              {prov.baseUrl && (
                <span className="text-[10px] text-gray-600 font-mono">{prov.baseUrl}</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-mono text-gray-600">
                Prioritat {prov.priority}
              </span>
              {prov.hasApiKey && (
                <span className="text-[10px] font-mono text-green-500">● clau configurada</span>
              )}
              {!prov.hasApiKey && NEEDS_API_KEY.includes(prov.provider) && (
                <span className="text-[10px] font-mono text-yellow-500">⚠ falta API key</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggle}
            disabled={update.isPending}
            className={`text-[10px] font-mono px-2 py-0.5 rounded transition-colors ${
              prov.isActive ? 'bg-green-900/40 text-green-400' : 'bg-gray-800 text-gray-500'
            }`}
          >
            {prov.isActive ? 'ACTIU' : 'INACTIU'}
          </button>
          {NEEDS_API_KEY.includes(prov.provider) && (
            <button
              onClick={() => setEditing(!editing)}
              className="text-[10px] font-mono text-orange-400 hover:text-orange-300 transition-colors"
            >
              {editing ? '▲' : '🔑 clau'}
            </button>
          )}
          <button
            onClick={() => remove.mutate(prov.id)}
            disabled={remove.isPending}
            className="text-[10px] font-mono text-red-500 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {editing && (
        <div className="flex gap-2 mt-2">
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="Nova API key..."
            className="form-input flex-1 text-xs font-mono"
          />
          <button onClick={handleSaveKey} disabled={update.isPending || !apiKey.trim()} className="btn-primary text-xs px-3">
            DESAR
          </button>
          <button onClick={() => { setEditing(false); setApiKey('') }} className="btn-outline text-xs px-3">
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

function AddProviderForm({ clientId, onClose }: { clientId: string; onClose: () => void }) {
  const { data: models } = useProviderModels()
  const create = useCreateAIProvider(clientId)

  const [provider, setProvider] = useState<AIProviderType>('GROQ')
  const [model,    setModel]    = useState('')
  const [apiKey,   setApiKey]   = useState('')
  const [baseUrl,  setBaseUrl]  = useState('')
  const [priority, setPriority] = useState(0)
  const [error,    setError]    = useState('')

  const availableModels = models?.[provider] ?? []

  const handleProviderChange = (p: AIProviderType) => {
    setProvider(p)
    setModel(models?.[p]?.[0] ?? '')
    setApiKey('')
    setBaseUrl('')
  }

  const handleSubmit = async () => {
    setError('')
    if (!model) { setError('Selecciona un model'); return }
    if (NEEDS_API_KEY.includes(provider) && !apiKey.trim()) { setError('API key obligatòria per a aquest proveïdor'); return }
    if (NEEDS_BASE_URL.includes(provider) && !baseUrl.trim()) { setError('URL base obligatòria per a Ollama'); return }
    try {
      await create.mutateAsync({
        provider,
        model,
        apiKey:   apiKey.trim() || undefined,
        baseUrl:  baseUrl.trim() || undefined,
        priority,
      })
      onClose()
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err.message ?? 'Error')
    }
  }

  return (
    <div className="border border-orange-900/30 bg-[#0d0d1a] p-4 space-y-3 mt-3">
      <p className="text-xs font-mono text-orange-400 uppercase tracking-widest">Nou proveïdor</p>

      {/* Proveïdor */}
      <div className="flex gap-2 flex-wrap">
        {(['GROQ', 'OLLAMA', 'OPENAI', 'ANTHROPIC'] as AIProviderType[]).map(p => (
          <button
            key={p}
            onClick={() => handleProviderChange(p)}
            className={`text-[10px] font-mono px-3 py-1.5 border transition-colors ${
              provider === p
                ? 'border-orange-500 text-orange-400 bg-orange-900/20'
                : 'border-gray-700 text-gray-500 hover:border-gray-500'
            }`}
          >
            {PROVIDER_ICONS[p]} {p}
          </button>
        ))}
      </div>

      {/* Model */}
      <div>
        <label className="form-label">Model</label>
        <select
          value={model}
          onChange={e => setModel(e.target.value)}
          className="form-input w-full text-sm font-mono"
        >
          <option value="">Selecciona model...</option>
          {availableModels.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* API Key */}
      {NEEDS_API_KEY.includes(provider) && (
        <div>
          <label className="form-label">API Key</label>
          <input
            type="password"
            value={apiKey}
            onChange={e => setApiKey(e.target.value)}
            placeholder="sk-..."
            className="form-input w-full text-sm font-mono"
          />
        </div>
      )}

      {/* Base URL (Ollama) */}
      {NEEDS_BASE_URL.includes(provider) && (
        <div>
          <label className="form-label">URL Base (Ollama)</label>
          <input
            type="text"
            value={baseUrl}
            onChange={e => setBaseUrl(e.target.value)}
            placeholder="http://ollama:11434"
            className="form-input w-full text-sm font-mono"
          />
        </div>
      )}

      {/* Prioritat */}
      <div>
        <label className="form-label">Prioritat (0 = primer)</label>
        <input
          type="number"
          value={priority}
          onChange={e => setPriority(Number(e.target.value))}
          min={0} max={100}
          className="form-input w-24 text-sm font-mono"
        />
      </div>

      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button onClick={handleSubmit} disabled={create.isPending} className="btn-primary text-xs">
          {create.isPending ? 'AFEGINT...' : '+ AFEGIR'}
        </button>
        <button onClick={onClose} className="btn-outline text-xs">CANCEL·LAR</button>
      </div>
    </div>
  )
}

export function AIProvidersPanel({ clientId }: { clientId: string }) {
  const { data: providers, isLoading } = useAIProviders(clientId)
  const [showForm, setShowForm]        = useState(false)

  return (
    <div className="space-y-3">
      <p className="text-xs text-gray-500">
        Configura els models d'IA que farà servir aquest client. Els proveïdors es consulten
        per ordre de prioritat. Les API keys s'encripten amb AES-256-GCM.
      </p>

      {isLoading ? (
        <p className="text-xs text-gray-500 font-mono">Carregant...</p>
      ) : !providers?.length ? (
        <p className="text-xs text-gray-600 font-mono">Cap proveïdor configurat</p>
      ) : (
        <div>
          {providers.map(p => <ProviderRow key={p.id} prov={p} clientId={clientId} />)}
        </div>
      )}

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="btn-outline text-xs">
          + AFEGIR PROVEÏDOR
        </button>
      ) : (
        <AddProviderForm clientId={clientId} onClose={() => setShowForm(false)} />
      )}
    </div>
  )
}
