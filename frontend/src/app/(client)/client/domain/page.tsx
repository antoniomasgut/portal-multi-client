'use client'
import { useAuthStore } from '../../../../store/useAuthStore'
import { useClientDomains, useDomainInstructions } from '../../../../hooks/useDomains'

function InstructionBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-orange-900/10">
      <span className="text-xs text-gray-500 font-mono uppercase tracking-widest flex-shrink-0 w-16">{label}</span>
      <span className="text-xs text-orange-300 font-mono break-all text-right">{value}</span>
    </div>
  )
}

function DomainCard({ domainId, clientId }: { domainId: string; clientId: string }) {
  const { data: inst } = useDomainInstructions(clientId, domainId)
  if (!inst) return null

  return (
    <div className="card p-4 space-y-3 mt-3">
      <p className="text-xs font-mono text-orange-400 uppercase tracking-widest">
        Opció 1 — Registre CNAME (recomanat)
      </p>
      <div>
        <InstructionBlock label="TIPUS" value={inst.cname.type}  />
        <InstructionBlock label="HOST"  value={inst.cname.host}  />
        <InstructionBlock label="VALOR" value={inst.cname.value} />
      </div>
      <p className="text-xs text-gray-600 font-mono border-t border-orange-900/10 pt-3">
        Opció 2 — Registre TXT (si CNAME no és possible)
      </p>
      <div>
        <InstructionBlock label="TIPUS" value={inst.txt.type}  />
        <InstructionBlock label="HOST"  value={inst.txt.host}  />
        <InstructionBlock label="VALOR" value={inst.txt.value} />
      </div>
    </div>
  )
}

export default function DomainClientPage() {
  const { user }               = useAuthStore()
  const clientId               = user?.clientId ?? ''
  const { data: domains, isLoading } = useClientDomains(clientId)

  const dom = domains?.[0]

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-black tracking-widest uppercase text-gray-100 font-mono">
          El meu Domini
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Configura el teu domini personalitzat per accedir al portal
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-gray-500 font-mono">Carregant...</p>
      ) : !dom ? (
        <div className="card p-6 text-center space-y-2">
          <p className="text-sm text-gray-400">Cap domini configurat encara.</p>
          <p className="text-xs text-gray-600">
            Contacta amb el teu responsable d'AMG Enginyeria Digital per activar el domini personalitzat.
          </p>
        </div>
      ) : (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-lg font-mono font-bold text-gray-100">{dom.domain}</p>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
              dom.status === 'VERIFIED' ? 'text-green-400 bg-green-900/30' :
              dom.status === 'FAILED'   ? 'text-red-400 bg-red-900/30'    :
              'text-yellow-400 bg-yellow-900/20'
            }`}>
              {dom.status === 'VERIFIED' ? '✓ VERIFICAT' : dom.status === 'FAILED' ? '✗ ERROR' : '⏳ PENDENT'}
            </span>
          </div>

          {dom.status === 'VERIFIED' && dom.verifiedAt && (
            <p className="text-xs text-green-400 font-mono">
              Domini actiu des de {new Date(dom.verifiedAt).toLocaleDateString('ca-ES')}
            </p>
          )}

          {dom.status !== 'VERIFIED' && (
            <>
              <div className="border-t border-orange-900/20 pt-4">
                <p className="text-sm font-semibold text-gray-300">Configura el DNS del teu domini</p>
                <p className="text-xs text-gray-500 mt-1">
                  Accedeix al tauler del teu proveïdor de dominis (GoDaddy, Namecheap, etc.)
                  i afegeix un d'aquests registres:
                </p>
                <DomainCard domainId={dom.id} clientId={clientId} />
              </div>
              <p className="text-xs text-gray-600">
                Un cop fet el canvi, els DNS poden trigar entre 5 minuts i 48 hores en propagar-se.
                El nostre sistema verificarà el domini automàticament.
              </p>
            </>
          )}

          {dom.errorMessage && (
            <div className="bg-red-950/30 border border-red-900/30 p-3">
              <p className="text-xs text-red-400 font-mono">{dom.errorMessage}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
