'use client'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../../../utils/api'

interface DomainWithClient {
  id:           string
  domain:       string
  status:       'PENDING' | 'VERIFIED' | 'FAILED'
  verifiedAt:   string | null
  lastChecked:  string | null
  errorMessage: string | null
  createdAt:    string
  client: { id: string; companyName: string; contactEmail: string }
}

const STATUS_STYLES: Record<string, string> = {
  VERIFIED: 'text-green-400 bg-green-900/30',
  PENDING:  'text-yellow-400 bg-yellow-900/20',
  FAILED:   'text-red-400 bg-red-900/30',
}

export default function DomainsAdminPage() {
  const { data: domains, isLoading } = useQuery<DomainWithClient[]>({
    queryKey: ['all-domains'],
    queryFn:  async () => {
      const res = await api.get('/api/domains')
      return res.data.data
    },
  })

  const verified = domains?.filter(d => d.status === 'VERIFIED').length ?? 0
  const pending  = domains?.filter(d => d.status === 'PENDING').length ?? 0
  const failed   = domains?.filter(d => d.status === 'FAILED').length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-widest uppercase text-gray-100 font-mono">
          Dominis personalitzats
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Tots els dominis configurats pels clients
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Verificats', value: verified, color: 'text-green-400' },
          { label: 'Pendents',   value: pending,  color: 'text-yellow-400' },
          { label: 'Fallats',    value: failed,   color: 'text-red-400' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-3xl font-black font-mono ${s.color}`}>{s.value}</p>
            <p className="text-xs font-mono text-gray-500 mt-1 uppercase tracking-widest">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm font-mono">Carregant...</div>
        ) : !domains?.length ? (
          <div className="p-8 text-center text-gray-500 text-sm font-mono">
            Cap domini configurat. Afegeix-ne des del panell d'un client.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-orange-900/30">
                <th className="px-4 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">Domini</th>
                <th className="px-4 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">Client</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Estat</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Verificat</th>
              </tr>
            </thead>
            <tbody>
              {domains.map(d => (
                <tr key={d.id} className="border-b border-orange-900/20 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-mono text-gray-100">{d.domain}</p>
                    {d.errorMessage && (
                      <p className="text-xs text-red-400 mt-0.5">{d.errorMessage}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-300">{d.client.companyName}</p>
                    <p className="text-xs text-gray-600 font-mono">{d.client.contactEmail}</p>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${STATUS_STYLES[d.status]}`}>
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-xs font-mono text-gray-500">
                    {d.verifiedAt
                      ? new Date(d.verifiedAt).toLocaleDateString('ca-ES')
                      : d.lastChecked
                      ? `Comprovat: ${new Date(d.lastChecked).toLocaleDateString('ca-ES')}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-xs text-gray-600 font-mono space-y-1">
        <p>● Configura dominis per client des del panell de cada client → servei "Domini personalitzat"</p>
        <p>● Caddy gestiona TLS automàticament un cop el CNAME apunta al servidor</p>
        <p>● Variable <code className="text-orange-400">PORTAL_CNAME</code> al .env defineix el destí del CNAME</p>
      </div>
    </div>
  )
}
