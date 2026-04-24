'use client'
import { useState } from 'react'
import {
  useAutomationTemplatesWithUsage,
  useToggleTemplate,
  useTestTemplate,
  AutomationTemplateWithUsage,
} from '../../../../hooks/useAutomations'

const CATEGORY_LABELS: Record<string, string> = {
  cites:        'Cites',
  leads:        'Leads',
  ressenyes:    'Ressenyes',
  comunicacio:  'Comunicació',
  facturacio:   'Facturació',
  ecommerce:    'eCommerce',
  estoc:        'Estoc',
}

function TemplateRow({ t }: { t: AutomationTemplateWithUsage }) {
  const toggle   = useToggleTemplate()
  const testMut  = useTestTemplate()
  const [testMsg, setTestMsg] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleTest = async () => {
    setTestMsg(null)
    const res = await testMut.mutateAsync(t.id)
    setTestMsg({ ok: res.success, msg: res.message })
    setTimeout(() => setTestMsg(null), 5000)
  }

  return (
    <tr className="border-b border-orange-900/20 hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-100">{t.name}</p>
        <p className="text-xs text-gray-500 font-mono">{t.slug}</p>
        {t.description && <p className="text-xs text-gray-600 mt-0.5">{t.description}</p>}
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-xs font-mono px-2 py-0.5 bg-[#1a1a2e] text-gray-400 rounded">
          {CATEGORY_LABELS[t.category] ?? t.category}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-mono font-bold text-orange-400">{t.clientCount}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => toggle.mutate({ id: t.id, isActive: !t.isActive })}
          disabled={toggle.isPending}
          className={`text-xs font-mono px-3 py-1 rounded transition-colors ${
            t.isActive
              ? 'bg-green-900/40 text-green-400 hover:bg-red-900/40 hover:text-red-400'
              : 'bg-gray-800 text-gray-500 hover:bg-green-900/40 hover:text-green-400'
          }`}
        >
          {t.isActive ? 'ACTIU' : 'INACTIU'}
        </button>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <button
            onClick={handleTest}
            disabled={testMut.isPending}
            className="btn-outline text-[10px] px-2 py-1"
          >
            {testMut.isPending ? '...' : '▶ TEST'}
          </button>
          {testMsg && (
            <span className={`text-[10px] font-mono ${testMsg.ok ? 'text-green-400' : 'text-red-400'}`}>
              {testMsg.ok ? '✓' : '✗'} {testMsg.msg.slice(0, 40)}
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

export default function AutomationsPage() {
  const { data: templates, isLoading } = useAutomationTemplatesWithUsage()

  const categoriesSet = new Set((templates ?? []).map(t => t.category))
  const categories    = Array.from(categoriesSet).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-widest uppercase text-gray-100 font-mono">
            Templates d'Automatització
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestiona els workflows n8n disponibles per als clients
          </p>
        </div>
        <div className="flex gap-2 text-xs font-mono text-gray-500">
          <span>{templates?.filter(t => t.isActive).length ?? 0} actius</span>
          <span>/</span>
          <span>{templates?.length ?? 0} total</span>
        </div>
      </div>

      {/* Stats per categoria */}
      {templates && templates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const count = templates.filter(t => t.category === cat).length
            return (
              <span key={cat} className="badge text-[10px]">
                {CATEGORY_LABELS[cat] ?? cat} ({count})
              </span>
            )
          })}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm font-mono">Carregant...</div>
        ) : !templates?.length ? (
          <div className="p-8 text-center text-gray-500 text-sm font-mono">
            Cap template disponible. Executa el seed per crear-ne.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-orange-900/30">
                <th className="px-4 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">Template</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Categoria</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Clients</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">Estat</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">n8n</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(t => <TemplateRow key={t.id} t={t} />)}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-xs text-gray-600 font-mono space-y-1">
        <p>● Clicar <strong>ACTIU/INACTIU</strong> oculta/mostra el template als clients (no afecta automatitzacions ja creades)</p>
        <p>● <strong>TEST</strong> crea i elimina un workflow de prova a n8n per verificar que la connexió funciona</p>
        <p>● La columna <strong>Clients</strong> mostra quants clients han activat aquest template</p>
      </div>
    </div>
  )
}
