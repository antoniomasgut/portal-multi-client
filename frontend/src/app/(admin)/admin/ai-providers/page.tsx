'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../utils/api'
import { AIProviderType } from '../../../../hooks/useAIProviders'

interface ProviderWithClient {
  id:        string
  provider:  AIProviderType
  model:     string
  isActive:  boolean
  priority:  number
  baseUrl:   string | null
  hasApiKey: boolean
  client:    { id: string; companyName: string }
}

const PROVIDER_COLORS: Record<AIProviderType, string> = {
  GROQ:      'text-yellow-400',
  OLLAMA:    'text-green-400',
  OPENAI:    'text-blue-400',
  ANTHROPIC: 'text-orange-400',
}

export default function AIProvidersAdminPage() {
  const { data: providers, isLoading } = useQuery<ProviderWithClient[]>({
    queryKey: ['all-ai-providers'],
    queryFn:  async () => {
      const res = await api.get('/api/ai-providers')
      return res.data.data
    },
  })

  const byProvider = (type: AIProviderType) => providers?.filter(p => p.provider === type) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-widest uppercase text-gray-100 font-mono">
          Proveïdors d'IA
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configuració de models per a tots els clients
        </p>
      </div>

      {/* Stats per proveïdor */}
      {providers && (
        <div className="grid grid-cols-4 gap-3">
          {(['GROQ', 'OLLAMA', 'OPENAI', 'ANTHROPIC'] as AIProviderType[]).map(p => {
            const count  = byProvider(p).length
            const active = byProvider(p).filter(x => x.isActive).length
            return (
              <div key={p} className="card p-3 text-center">
                <p className={`text-2xl font-black font-mono ${PROVIDER_COLORS[p]}`}>{count}</p>
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mt-1">{p}</p>
                {count > 0 && (
                  <p className="text-[10px] font-mono text-gray-600">{active} actius</p>
                )}
              </div>
            )
          })}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm font-mono">Carregant...</div>
        ) : !providers?.length ? (
          <div className="p-8 text-center text-gray-500 text-sm font-mono">
            Cap proveïdor configurat. Afegeix-ne des del panell de cada client.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-orange-900/30">
                <th className="px-4 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">Client</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">Proveïdor</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">Model</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Clau</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Estat</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Prio</th>
              </tr>
            </thead>
            <tbody>
              {providers.map(p => (
                <tr key={p.id} className="border-b border-orange-900/20 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-300">{p.client.companyName}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-mono font-bold ${PROVIDER_COLORS[p.provider]}`}>
                      {p.provider}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-mono text-gray-300">{p.model}</span>
                    {p.baseUrl && (
                      <p className="text-[10px] text-gray-600 font-mono">{p.baseUrl}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-mono ${p.hasApiKey ? 'text-green-500' : 'text-gray-600'}`}>
                      {p.hasApiKey ? '●' : '○'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      p.isActive ? 'text-green-400 bg-green-900/30' : 'text-gray-500 bg-gray-800'
                    }`}>
                      {p.isActive ? 'ACTIU' : 'INACTIU'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-mono text-gray-500">
                    {p.priority}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-xs text-gray-600 font-mono space-y-1">
        <p>● Les API keys s'emmagatzemen encriptades amb AES-256-GCM</p>
        <p>● El servei AI consulta <code className="text-orange-400">GET /api/clients/:id/ai-providers/config</code> (protegit per <code className="text-orange-400">INTERNAL_API_SECRET</code>)</p>
        <p>● Prioritat 0 = primer proveïdor a usar; si falla, s'intenta el següent</p>
      </div>
    </div>
  )
}
