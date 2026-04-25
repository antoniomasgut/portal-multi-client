'use client'
import { useState } from 'react'
import {
  useAutomationTemplatesWithUsage,
  useToggleTemplate,
  useTestTemplate,
  useCreateTemplate,
  useUpdateTemplate,
  AutomationTemplateWithUsage,
  TemplateInput,
} from '../../../../hooks/useAutomations'
import { useTranslation } from '../../../../hooks/useTranslation'

const CATEGORIES = [
  'cites', 'leads', 'ressenyes', 'comunicacio', 'facturacio', 'ecommerce', 'estoc',
]

const EMPTY_WORKFLOW = {
  name: '',
  nodes: [],
  connections: {},
  active: false,
  settings: {},
}

// ── Template form modal ────────────────────────────────────────────────

function TemplateModal({
  initial,
  onClose,
}: {
  initial?: AutomationTemplateWithUsage | null
  onClose: () => void
}) {
  const { t } = useTranslation('admin')
  const create = useCreateTemplate()
  const update = useUpdateTemplate()

  const [name,        setName]        = useState(initial?.name ?? '')
  const [slug,        setSlug]        = useState(initial?.slug ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [category,    setCategory]    = useState(initial?.category ?? 'leads')
  const [isActive,    setIsActive]    = useState(initial?.isActive ?? true)
  const [jsonText,    setJsonText]    = useState(
    JSON.stringify(initial?.workflowJson ?? EMPTY_WORKFLOW, null, 2)
  )
  const [jsonError,   setJsonError]   = useState<string | null>(null)
  const [saved,       setSaved]       = useState(false)

  function autoSlug(v: string) {
    return v.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  function handleNameChange(v: string) {
    setName(v)
    if (!initial) setSlug(autoSlug(v))
  }

  function validateJson(): Record<string, unknown> | null {
    try {
      const parsed = JSON.parse(jsonText)
      setJsonError(null)
      return parsed
    } catch (e: any) {
      setJsonError(e.message)
      return null
    }
  }

  async function handleSave() {
    const workflowJson = validateJson()
    if (!workflowJson) return
    const body: TemplateInput = { name, slug, description: description || undefined, category, workflowJson, isActive }
    if (initial) {
      await update.mutateAsync({ id: initial.id, ...body })
    } else {
      await create.mutateAsync(body)
    }
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1000)
  }

  const isPending = create.isPending || update.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="bg-[#0d0d1a] border border-orange-900/40 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded">
        <div className="flex items-center justify-between px-6 py-4 border-b border-orange-900/30">
          <h2 className="font-mono text-sm tracking-widest uppercase text-orange-400">
            {initial ? t('automations.modal_title_edit') : t('automations.modal_title_new')}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl">×</button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t('automations.form_label_name')}</label>
              <input
                className="form-input"
                value={name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder={t('automations.form_name_placeholder')}
              />
            </div>
            <div>
              <label className="form-label">{t('automations.form_label_slug')}</label>
              <input
                className="form-input font-mono text-sm"
                value={slug}
                onChange={e => setSlug(e.target.value)}
                placeholder="gestio-cites"
              />
            </div>
          </div>

          <div>
            <label className="form-label">{t('automations.form_label_description')}</label>
            <textarea
              className="form-input"
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={t('automations.form_desc_placeholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">{t('automations.form_label_category')}</label>
              <select className="form-input" value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{t(`automations.category_${c}`)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-3">
              <label className="form-label">{t('automations.form_label_active')}</label>
              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors mb-1 ${isActive ? 'bg-orange-500' : 'bg-gray-600'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* JSON editor */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="form-label">{t('automations.form_label_workflow_json')}</label>
              <button
                className="text-xs text-gray-500 hover:text-gray-300 font-mono"
                onClick={() => setJsonText(JSON.stringify(EMPTY_WORKFLOW, null, 2))}
              >
                {t('automations.form_json_reset')}
              </button>
            </div>
            <textarea
              className={`form-input font-mono text-xs leading-relaxed ${jsonError ? 'border-red-500' : ''}`}
              rows={16}
              value={jsonText}
              onChange={e => { setJsonText(e.target.value); setJsonError(null) }}
              spellCheck={false}
            />
            {jsonError && (
              <p className="text-red-400 text-xs mt-1 font-mono">{t('automations.form_json_invalid', { error: jsonError ?? '' })}</p>
            )}
            <p className="text-gray-600 text-xs mt-1">
              {t('automations.form_json_export_hint')}
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button className="btn-outline" onClick={onClose}>{t('automations.form_btn_cancel')}</button>
            {saved ? (
              <span className="text-green-400 text-sm self-center font-mono">{t('automations.form_saved')}</span>
            ) : (
              <button className="btn-primary" onClick={handleSave} disabled={isPending}>
                {isPending ? t('automations.form_btn_saving') : initial ? t('automations.form_btn_update') : t('automations.form_btn_create')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Template row ───────────────────────────────────────────────────────

function TemplateRow({
  tmpl,
  onEdit,
}: {
  tmpl: AutomationTemplateWithUsage
  onEdit: (tmpl: AutomationTemplateWithUsage) => void
}) {
  const { t } = useTranslation('admin')
  const toggle  = useToggleTemplate()
  const testMut = useTestTemplate()
  const [testMsg, setTestMsg] = useState<{ ok: boolean; msg: string } | null>(null)

  const handleTest = async () => {
    setTestMsg(null)
    const res = await testMut.mutateAsync(tmpl.id)
    setTestMsg({ ok: res.success, msg: res.message })
    setTimeout(() => setTestMsg(null), 5000)
  }

  return (
    <tr className="border-b border-orange-900/20 hover:bg-white/5 transition-colors">
      <td className="px-4 py-3">
        <p className="text-sm font-semibold text-gray-100">{tmpl.name}</p>
        <p className="text-xs text-gray-500 font-mono">{tmpl.slug}</p>
        {tmpl.description && <p className="text-xs text-gray-600 mt-0.5">{tmpl.description}</p>}
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-xs font-mono px-2 py-0.5 bg-[#1a1a2e] text-gray-400 rounded">
          {t(`automations.category_${tmpl.category}`) !== `automations.category_${tmpl.category}` ? t(`automations.category_${tmpl.category}`) : tmpl.category}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm font-mono font-bold text-orange-400">{tmpl.clientCount}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => toggle.mutate({ id: tmpl.id, isActive: !tmpl.isActive })}
          disabled={toggle.isPending}
          className={`text-xs font-mono px-3 py-1 rounded transition-colors ${
            tmpl.isActive
              ? 'bg-green-900/40 text-green-400 hover:bg-red-900/40 hover:text-red-400'
              : 'bg-gray-800 text-gray-500 hover:bg-green-900/40 hover:text-green-400'
          }`}
        >
          {tmpl.isActive ? t('automations.status_active') : t('automations.status_inactive')}
        </button>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <div className="flex gap-1">
            <button
              onClick={() => onEdit(tmpl)}
              className="btn-outline text-[10px] px-2 py-1"
            >
              {t('automations.btn_edit')}
            </button>
            <button
              onClick={handleTest}
              disabled={testMut.isPending}
              className="btn-outline text-[10px] px-2 py-1"
            >
              {testMut.isPending ? t('automations.btn_testing') : t('automations.btn_test')}
            </button>
          </div>
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

// ── Pàgina principal ───────────────────────────────────────────────────

export default function AutomationsPage() {
  const { t } = useTranslation('admin')
  const { data: templates, isLoading } = useAutomationTemplatesWithUsage()
  const [modal, setModal] = useState<AutomationTemplateWithUsage | null | 'new'>()

  const categoriesSet = new Set((templates ?? []).map(tmpl => tmpl.category))
  const categories    = Array.from(categoriesSet).sort()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-widest uppercase text-gray-100 font-mono">
            {t('automations.title')}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {t('automations.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2 text-xs font-mono text-gray-500">
            <span>{templates?.filter(tmpl => tmpl.isActive).length ?? 0} {t('automations.active_count')}</span>
            <span>/</span>
            <span>{templates?.length ?? 0} {t('automations.total')}</span>
          </div>
          <button className="btn-primary text-sm" onClick={() => setModal('new')}>
            {t('automations.new_template')}
          </button>
        </div>
      </div>

      {/* Stats per categoria */}
      {templates && templates.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => {
            const count = templates.filter(tmpl => tmpl.category === cat).length
            return (
              <span key={cat} className="badge text-[10px]">
                {t(`automations.category_${cat}`)} ({count})
              </span>
            )
          })}
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 text-sm font-mono">{t('automations.loading')}</div>
        ) : !templates?.length ? (
          <div className="p-8 text-center space-y-3">
            <p className="text-gray-500 text-sm font-mono">{t('automations.no_templates')}</p>
            <button className="btn-primary text-sm" onClick={() => setModal('new')}>
              {t('automations.no_templates_btn')}
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-orange-900/30">
                <th className="px-4 py-3 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">{t('automations.col_template')}</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">{t('automations.col_category')}</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">{t('automations.col_clients')}</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">{t('automations.col_status')}</th>
                <th className="px-4 py-3 text-center text-xs font-mono text-gray-500 uppercase tracking-widest">{t('automations.col_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {templates.map(tmpl => (
                <TemplateRow
                  key={tmpl.id}
                  tmpl={tmpl}
                  onEdit={item => setModal(item)}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="text-xs text-gray-600 font-mono space-y-1">
        <p>● <strong>{t('automations.new_template')}</strong> {t('automations.hint_new_template')}</p>
        <p>● <strong>{t('automations.btn_edit')}</strong> {t('automations.hint_edit')}</p>
        <p>● {t('automations.hint_toggle')}</p>
        <p>● <strong>{t('automations.btn_test')}</strong> {t('automations.hint_test')}</p>
      </div>

      {/* Modal */}
      {modal !== undefined && (
        <TemplateModal
          initial={modal === 'new' ? null : modal}
          onClose={() => setModal(undefined)}
        />
      )}
    </div>
  )
}
