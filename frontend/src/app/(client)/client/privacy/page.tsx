'use client'
import { useState } from 'react'
import { useAuthStore } from '../../../../store/useAuthStore'
import {
  useConsents,
  useLogConsent,
  useDataExports,
  useRequestExport,
  useDownloadExport,
  ConsentType,
  DataExportRequest,
} from '../../../../hooks/useRgpd'

const CONSENT_LABELS: Record<ConsentType, { label: string; desc: string }> = {
  COOKIES_NECESSARY:  { label: 'Galetes necessàries',  desc: 'Necessàries per al funcionament del portal. Sempre actives.' },
  COOKIES_ANALYTICS:  { label: 'Galetes analítiques',  desc: 'Ens ajuden a millorar el servei mesurant l\'ús.' },
  COOKIES_MARKETING:  { label: 'Galetes màrqueting',   desc: 'Per oferir contingut i ofertes personalitzades.' },
  DATA_PROCESSING:    { label: 'Tractament de dades',  desc: 'Consentiment per tractar les teves dades per a la prestació del servei (obligatori).' },
  COMMUNICATIONS:     { label: 'Comunicacions',        desc: 'Rebre notificacions, informes i novetats per email.' },
}

function ExportRow({ exp, clientId }: { exp: DataExportRequest; clientId: string }) {
  const download = useDownloadExport(clientId)
  const [url, setUrl] = useState<string | null>(null)

  const handleDownload = async () => {
    const downloadUrl = await download.mutateAsync(exp.id)
    if (downloadUrl) {
      setUrl(downloadUrl)
      window.open(downloadUrl, '_blank')
    }
  }

  return (
    <div className="flex items-center justify-between py-2 border-b border-orange-900/20">
      <div>
        <p className="text-xs font-mono text-gray-300">
          {new Date(exp.requestedAt).toLocaleDateString('ca-ES')}
        </p>
        <span className={`text-[10px] font-mono ${
          exp.status === 'COMPLETED'  ? 'text-green-400' :
          exp.status === 'FAILED'     ? 'text-red-400'   :
          'text-yellow-400'
        }`}>
          {exp.status === 'COMPLETED' ? 'COMPLETAT' : exp.status === 'FAILED' ? 'ERROR' : 'EN PROCÉS'}
        </span>
      </div>
      {exp.status === 'COMPLETED' && (
        <button
          onClick={handleDownload}
          disabled={download.isPending}
          className="btn-outline text-[10px] px-3 py-1"
        >
          {download.isPending ? '...' : '⬇ JSON'}
        </button>
      )}
    </div>
  )
}

export default function PrivacyPage() {
  const { user }                                 = useAuthStore()
  const clientId                                 = user?.clientId ?? ''
  const { data: consents }                       = useConsents(clientId)
  const { data: exports }                        = useDataExports(clientId)
  const logConsent                               = useLogConsent(clientId)
  const requestExport                            = useRequestExport(clientId)
  const [showAnonConfirm, setShowAnonConfirm]   = useState(false)

  const isGranted = (type: ConsentType) => consents?.some(c => c.type === type) ?? false

  const ALL_TYPES: ConsentType[] = [
    'COOKIES_NECESSARY', 'COOKIES_ANALYTICS', 'COOKIES_MARKETING',
    'DATA_PROCESSING', 'COMMUNICATIONS',
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-black tracking-widest uppercase text-gray-100 font-mono">
          Privacitat i dades
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Gestiona els teus consentiments i exerceix els teus drets RGPD
        </p>
      </div>

      {/* Consentiments */}
      <div className="card p-5 space-y-4">
        <h2 className="text-xs font-mono tracking-widest text-orange-400 uppercase">
          Els meus consentiments
        </h2>
        {ALL_TYPES.map(type => {
          const granted  = isGranted(type)
          const info     = CONSENT_LABELS[type]
          const isForced = type === 'COOKIES_NECESSARY' || type === 'DATA_PROCESSING'

          return (
            <div key={type} className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-200">{info.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{info.desc}</p>
              </div>
              <button
                disabled={isForced || logConsent.isPending}
                onClick={() => logConsent.mutate({ type, granted: !granted })}
                className={`flex-shrink-0 w-10 h-6 rounded-full transition-colors relative ${
                  granted ? 'bg-orange-500' : 'bg-gray-700'
                } ${isForced ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${
                  granted ? 'left-5' : 'left-1'
                }`} />
              </button>
            </div>
          )
        })}
      </div>

      {/* Exportació de dades */}
      <div className="card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono tracking-widest text-orange-400 uppercase">
            Les meves dades (dret d'accés)
          </h2>
          <button
            onClick={() => requestExport.mutate()}
            disabled={requestExport.isPending}
            className="btn-outline text-[10px] px-3 py-1"
          >
            {requestExport.isPending ? 'SOL·LICITANT...' : '+ SOL·LICITAR EXPORTACIÓ'}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Pots descarregar totes les dades que guardem sobre tu en format JSON.
          El fitxer inclou dades del compte, factures, automatitzacions i historial d'accessos.
        </p>
        {exports && exports.length > 0 ? (
          <div className="space-y-0">
            {exports.map(exp => (
              <ExportRow key={exp.id} exp={exp} clientId={clientId} />
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-600 font-mono">Cap exportació sol·licitada</p>
        )}
      </div>

      {/* Dret d'oblit */}
      <div className="card p-5 space-y-3 border border-red-900/30">
        <h2 className="text-xs font-mono tracking-widest text-red-400 uppercase">
          Dret d'oblit
        </h2>
        <p className="text-xs text-gray-500">
          Sol·licita l'eliminació de les teves dades personals. El compte quedarà desactivat
          i les dades identificatives seran anonimitzades de manera irreversible.
          Les dades de facturació es conserven per obligació legal.
        </p>
        {!showAnonConfirm ? (
          <button
            onClick={() => setShowAnonConfirm(true)}
            className="text-xs font-mono text-red-400 border border-red-900/40 px-3 py-1.5 hover:bg-red-900/20 transition-colors"
          >
            SOL·LICITAR ELIMINACIÓ
          </button>
        ) : (
          <div className="bg-red-950/30 border border-red-900/40 p-4 space-y-3">
            <p className="text-sm text-red-300 font-semibold">
              Aquesta acció és irreversible. El teu compte serà eliminat.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAnonConfirm(false)}
                className="btn-outline text-xs"
              >
                CANCEL·LAR
              </button>
              <a
                href="mailto:info@amgdigital.es?subject=Sol·licitud dret d'oblit"
                className="text-xs font-mono text-red-400 underline self-center"
              >
                Contacta amb nosaltres per email
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
