'use client'
import { useState } from 'react'
import {
  useClientDomains,
  useAddDomain,
  useVerifyDomain,
  useRemoveDomain,
  useDomainInstructions,
  ClientDomain,
} from '../../../../hooks/useDomains'

const STATUS_STYLES: Record<string, string> = {
  VERIFIED: 'text-green-400 bg-green-900/30',
  PENDING:  'text-yellow-400 bg-yellow-900/20',
  FAILED:   'text-red-400 bg-red-900/30',
}
const STATUS_LABELS: Record<string, string> = {
  VERIFIED: '✓ VERIFICAT',
  PENDING:  '⏳ PENDENT',
  FAILED:   '✗ FALLAT',
}

function InstructionsCard({ clientId, domainId }: { clientId: string; domainId: string }) {
  const { data: inst, isLoading } = useDomainInstructions(clientId, domainId)

  if (isLoading) return <p className="text-xs text-gray-500 font-mono">Carregant instruccions...</p>
  if (!inst)     return null

  return (
    <div className="mt-3 space-y-3">
      <p className="text-xs font-mono text-orange-400 uppercase tracking-widest">Instruccions DNS</p>
      {[inst.cname, inst.txt].map((r, i) => (
        <div key={i} className="bg-[#0d0d1a] border border-orange-900/20 p-3 space-y-1.5">
          <p className="text-[10px] text-gray-500 font-mono">{r.desc}</p>
          <div className="flex gap-4 text-xs font-mono flex-wrap">
            <span><span className="text-gray-600">TIPUS:</span> <span className="text-orange-400">{r.type}</span></span>
            <span><span className="text-gray-600">HOST:</span> <span className="text-gray-200">{r.host}</span></span>
            <span><span className="text-gray-600">VALOR:</span> <span className="text-gray-200">{r.value}</span></span>
          </div>
        </div>
      ))}
    </div>
  )
}

function DomainRow({ dom, clientId }: { dom: ClientDomain; clientId: string }) {
  const verify  = useVerifyDomain(clientId)
  const remove  = useRemoveDomain(clientId)
  const [open, setOpen] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleVerify = async () => {
    setVerifyMsg(null)
    const res = await verify.mutateAsync(dom.id)
    setVerifyMsg({ ok: res.success, msg: res.message })
  }

  return (
    <div className="border-b border-orange-900/20 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${STATUS_STYLES[dom.status]}`}>
            {STATUS_LABELS[dom.status]}
          </span>
          <span className="text-sm font-mono text-gray-200">{dom.domain}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(!open)}
            className="text-[10px] font-mono text-gray-500 hover:text-orange-400 transition-colors"
          >
            {open ? '▲ instruccions' : '▼ instruccions'}
          </button>
          <button
            onClick={handleVerify}
            disabled={verify.isPending}
            className="btn-outline text-[10px] px-2 py-1"
          >
            {verify.isPending ? '...' : '▶ VERIFICAR'}
          </button>
          <button
            onClick={() => remove.mutate(dom.id)}
            disabled={remove.isPending}
            className="text-[10px] font-mono text-red-500 hover:text-red-400 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {verifyMsg && (
        <p className={`text-xs font-mono mt-1.5 ${verifyMsg.ok ? 'text-green-400' : 'text-red-400'}`}>
          {verifyMsg.msg}
        </p>
      )}
      {dom.errorMessage && !verifyMsg && (
        <p className="text-xs font-mono mt-1 text-red-400">{dom.errorMessage}</p>
      )}
      {dom.verifiedAt && (
        <p className="text-[10px] font-mono text-gray-600 mt-1">
          Verificat: {new Date(dom.verifiedAt).toLocaleDateString('ca-ES')}
        </p>
      )}

      {open && <InstructionsCard clientId={clientId} domainId={dom.id} />}
    </div>
  )
}

export function DomainsPanel({ clientId }: { clientId: string }) {
  const { data: domains, isLoading } = useClientDomains(clientId)
  const addDomain = useAddDomain(clientId)
  const [newDomain, setNewDomain]   = useState('')
  const [error, setError]           = useState('')

  const handleAdd = async () => {
    setError('')
    if (!newDomain.trim()) return
    try {
      await addDomain.mutateAsync(newDomain.trim())
      setNewDomain('')
    } catch (err: any) {
      setError(err?.response?.data?.message ?? err.message ?? 'Error afegint domini')
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-gray-500">
        Afegeix el domini personalitzat del client. Un cop afegit, el client ha de configurar
        el DNS i tu pots verificar-lo aquí.
      </p>

      {/* Afegir nou domini */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newDomain}
          onChange={e => setNewDomain(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
          placeholder="portal.exemple.com"
          className="form-input flex-1 text-sm font-mono"
        />
        <button
          onClick={handleAdd}
          disabled={addDomain.isPending || !newDomain.trim()}
          className="btn-primary text-xs px-4"
        >
          {addDomain.isPending ? '...' : '+ AFEGIR'}
        </button>
      </div>
      {error && <p className="text-xs text-red-400 font-mono">{error}</p>}

      {/* Llista de dominis */}
      {isLoading ? (
        <p className="text-xs text-gray-500 font-mono">Carregant...</p>
      ) : !domains?.length ? (
        <p className="text-xs text-gray-600 font-mono">Cap domini configurat</p>
      ) : (
        <div>
          {domains.map(dom => <DomainRow key={dom.id} dom={dom} clientId={clientId} />)}
        </div>
      )}
    </div>
  )
}
