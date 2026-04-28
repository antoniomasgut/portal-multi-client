'use client'
import { useState, useEffect } from 'react'
import { useWhatsAppBot, useSaveWhatsAppBot, useGenerateWhatsAppBot, FAQ, WhatsAppBotConfig } from '../../../../hooks/useWhatsAppBot'

const TONES = [
  { value: 'professional', label: 'Professional' },
  { value: 'amable',       label: 'Amable' },
  { value: 'informal',     label: 'Informal' },
] as const

function FAQEditor({ faqs, onChange }: { faqs: FAQ[]; onChange: (v: FAQ[]) => void }) {
  function update(i: number, field: keyof FAQ, val: string) {
    const next = faqs.map((f, idx) => idx === i ? { ...f, [field]: val } : f)
    onChange(next)
  }
  function add() { onChange([...faqs, { q: '', a: '' }]) }
  function remove(i: number) { onChange(faqs.filter((_, idx) => idx !== i)) }

  return (
    <div className="space-y-3">
      {faqs.map((faq, i) => (
        <div key={i} className="card space-y-2">
          <div className="flex gap-2 items-start">
            <span className="text-gray-500 text-xs mt-2 flex-shrink-0">P{i + 1}</span>
            <input
              className="form-input flex-1 text-sm"
              placeholder="Pregunta freqüent"
              value={faq.q}
              onChange={e => update(i, 'q', e.target.value)}
            />
            <button
              className="text-red-400 hover:text-red-300 text-sm px-2 mt-1"
              onClick={() => remove(i)}
            >✕</button>
          </div>
          <div className="flex gap-2 items-start">
            <span className="text-gray-500 text-xs mt-2 flex-shrink-0">R</span>
            <textarea
              className="form-input flex-1 text-sm"
              placeholder="Resposta"
              rows={2}
              value={faq.a}
              onChange={e => update(i, 'a', e.target.value)}
            />
          </div>
        </div>
      ))}
      {faqs.length < 20 && (
        <button className="btn-outline text-sm w-full" onClick={add}>
          + Afegir pregunta freqüent
        </button>
      )}
    </div>
  )
}

export default function WhatsAppBotPanel({ clientId, companyName }: { clientId: string; companyName: string }) {
  const { data, isLoading } = useWhatsAppBot(clientId)
  const save     = useSaveWhatsAppBot(clientId)
  const generate = useGenerateWhatsAppBot(clientId)

  const [botName,       setBotName]       = useState('')
  const [greeting,      setGreeting]      = useState('')
  const [tone,          setTone]          = useState<'professional' | 'amable' | 'informal'>('professional')
  const [businessHours, setBusinessHours] = useState('')
  const [faqs,          setFaqs]          = useState<FAQ[]>([])
  const [isActive,      setIsActive]      = useState(false)
  const [aiSector,      setAiSector]      = useState('')
  const [aiLang,        setAiLang]        = useState('ca')
  const [saved,         setSaved]         = useState(false)
  const [saveError,     setSaveError]     = useState('')

  const cfg = data?.data as WhatsAppBotConfig | null

  useEffect(() => {
    if (!cfg) return
    setBotName(cfg.botName ?? '')
    setGreeting(cfg.greeting ?? '')
    setTone(cfg.tone ?? 'professional')
    setBusinessHours(cfg.businessHours ?? '')
    setFaqs(Array.isArray(cfg.faqs) ? cfg.faqs : [])
    setIsActive(cfg.isActive ?? false)
  }, [cfg])

  async function handleSave() {
    setSaveError('')
    try {
      await save.mutateAsync({ botName, greeting, tone, businessHours: businessHours || null, faqs, isActive })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      setSaveError('Error en desar la configuració. Intenta-ho de nou.')
    }
  }

  async function handleGenerate() {
    if (!aiSector.trim()) return
    const res = await generate.mutateAsync({ companyName, sector: aiSector, lang: aiLang }).catch(() => null)
    if (res?.data) {
      const d = res.data
      if (d.botName)       setBotName(d.botName)
      if (d.greeting)      setGreeting(d.greeting)
      if (d.tone)          setTone(d.tone)
      if (d.businessHours) setBusinessHours(d.businessHours)
      if (Array.isArray(d.faqs)) setFaqs(d.faqs)
    }
  }

  if (isLoading) return <p className="text-gray-500 text-sm">Carregant…</p>

  return (
    <div className="space-y-6">
      {/* AI generator */}
      <div className="card border border-orange-500/30 space-y-3">
        <h3 className="font-semibold text-orange-400 text-sm">✨ Generar configuració amb IA</h3>
        <div className="flex gap-2">
          <input
            className="form-input flex-1 text-sm"
            placeholder="Sector (p.ex. immobiliàries, clínica dental…)"
            value={aiSector}
            onChange={e => setAiSector(e.target.value)}
          />
          <select className="form-input text-sm w-24" value={aiLang} onChange={e => setAiLang(e.target.value)}>
            <option value="ca">CA</option>
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
          <button
            className="btn-primary text-sm px-4"
            onClick={handleGenerate}
            disabled={generate.isPending || !aiSector.trim()}
          >
            {generate.isPending ? 'Generant…' : 'Generar'}
          </button>
        </div>
        <p className="text-gray-500 text-xs">La IA crearà una benvinguda i les preguntes freqüents típiques del sector.</p>
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between card">
        <div>
          <p className="font-medium text-sm">Bot actiu</p>
          <p className="text-gray-500 text-xs">El bot respondrà als missatges de WhatsApp</p>
        </div>
        <button
          onClick={() => setIsActive(!isActive)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isActive ? 'bg-orange-500' : 'bg-gray-600'}`}
        >
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isActive ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>

      {/* Fields */}
      <div className="space-y-4">
        <div>
          <label className="form-label">Nom del bot</label>
          <input className="form-input" value={botName} onChange={e => setBotName(e.target.value)} placeholder="AMG Assistant" />
        </div>

        <div>
          <label className="form-label">Missatge de benvinguda</label>
          <textarea className="form-input" rows={3} value={greeting} onChange={e => setGreeting(e.target.value)} placeholder="Hola! Sóc el teu assistent virtual…" />
        </div>

        <div>
          <label className="form-label">To de comunicació</label>
          <div className="flex gap-2">
            {TONES.map(t => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={`flex-1 py-2 text-sm rounded border transition-colors ${tone === t.value ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-gray-600 text-gray-400 hover:border-gray-500'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="form-label">Horari d'atenció (opcional)</label>
          <input className="form-input" value={businessHours} onChange={e => setBusinessHours(e.target.value)} placeholder="Dl-Dv 9:00–18:00" />
        </div>

        <div>
          <label className="form-label">Preguntes freqüents ({faqs.length}/20)</label>
          <FAQEditor faqs={faqs} onChange={setFaqs} />
        </div>
      </div>

      {saveError && <p className="text-red-400 text-sm">{saveError}</p>}
      <div className="flex justify-end gap-3">
        {saved && <span className="text-green-400 text-sm self-center">✓ Desat</span>}
        <button className="btn-primary" onClick={handleSave} disabled={save.isPending}>
          {save.isPending ? 'Desant…' : 'Desar configuració'}
        </button>
      </div>
    </div>
  )
}
