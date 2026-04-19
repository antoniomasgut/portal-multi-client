'use client'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLanding, useUpsertLanding, usePublishLanding, type LandingStyle, type LandingFontPair } from '../../../../hooks/useLanding'

// ── Parells de lletra ─────────────────────────────────────────────────────────

const FONT_PAIRS: {
  id:         LandingFontPair
  name:       string
  sector:     string
  titleClass: string
  bodyClass:  string
}[] = [
  {
    id: 'orbitron-rajdhani',
    name: 'Tech / Digital',
    sector: 'Tecnologia · Start-ups · IT',
    titleClass: 'font-orbitron',
    bodyClass:  'font-rajdhani',
  },
  {
    id: 'poppins-poppins',
    name: 'Modern / Clean',
    sector: 'Comerç · Serveis · E-commerce',
    titleClass: 'font-poppins',
    bodyClass:  'font-poppins',
  },
  {
    id: 'playfair-merriweather',
    name: 'Tradicional / Elegant',
    sector: 'Dret · Finances · Luxury',
    titleClass: 'font-playfair',
    bodyClass:  'font-merriweather',
  },
  {
    id: 'merriweather-poppins',
    name: 'Educació / Editorial',
    sector: 'Escoles · Formació · Consultoria',
    titleClass: 'font-merriweather',
    bodyClass:  'font-poppins',
  },
  {
    id: 'mono-rajdhani',
    name: 'Dev / Industrial',
    sector: 'Programari · Enginyeria · Indústria',
    titleClass: 'font-mono',
    bodyClass:  'font-rajdhani',
  },
]

// ── Estils de pàgina ──────────────────────────────────────────────────────────

const STYLES: { id: LandingStyle; label: string; desc: string; preview: React.ReactNode }[] = [
  {
    id: 'dark-tech',
    label: 'Dark Tech',
    desc: 'Fosc · Grid',
    preview: (
      <div className="w-full h-14 bg-[#0d0d1a] relative overflow-hidden flex flex-col">
        <div className="h-3 border-b border-[#FF6B00]/20 flex items-center px-1.5">
          <div className="w-5 h-1 bg-[#FF6B00]/70 rounded" />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 px-2">
          <div className="w-10 h-0.5 bg-current opacity-30" />
          <div className="w-14 h-1.5 bg-white/60 rounded" />
          <div className="w-10 h-1 bg-white/30 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'minimal-light',
    label: 'Minimal Light',
    desc: 'Blanc · Net',
    preview: (
      <div className="w-full h-14 bg-white relative overflow-hidden flex flex-col">
        <div className="h-3 border-b border-gray-200 flex items-center px-1.5">
          <div className="w-5 h-1 rounded" style={{ background: 'var(--preview-color, #FF6B00)', opacity: 0.8 }} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 px-2">
          <div className="w-14 h-1.5 bg-gray-800 rounded" />
          <div className="w-10 h-1 bg-gray-400 rounded" />
          <div className="w-8 h-1 bg-gray-300 rounded" />
        </div>
      </div>
    ),
  },
  {
    id: 'gradient-hero',
    label: 'Gradient Hero',
    desc: 'Gradient · Vibrant',
    preview: (
      <div className="w-full h-14 relative overflow-hidden flex flex-col"
        style={{ background: 'linear-gradient(135deg, #FF6B00 0%, #FF6B00cc 35%, #1a1a2e 100%)' }}>
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 px-2">
          <div className="w-14 h-1.5 bg-white/90 rounded" />
          <div className="w-10 h-1 bg-white/60 rounded" />
          <div className="w-8 h-1 bg-white/40 rounded mt-0.5" />
        </div>
      </div>
    ),
  },
  {
    id: 'split-layout',
    label: 'Split Layout',
    desc: 'Columnes · Editorial',
    preview: (
      <div className="w-full h-14 flex overflow-hidden">
        <div className="w-1/2 flex flex-col justify-center px-2 gap-0.5" style={{ background: '#FF6B00' }}>
          <div className="w-8 h-1.5 bg-white/90 rounded" />
          <div className="w-6 h-1 bg-white/60 rounded" />
        </div>
        <div className="w-1/2 bg-[#0d0d1a] flex flex-col justify-center px-2 gap-0.5">
          <div className="w-8 h-1 bg-white/50 rounded" />
          <div className="w-6 h-1 bg-white/30 rounded" />
        </div>
      </div>
    ),
  },
]

// ── Helpers d'anàlisi de color ────────────────────────────────────────────────

function extractDominantColor(canvas: HTMLCanvasElement): string {
  const ctx  = canvas.getContext('2d')!
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
  const freq = new Map<string, number>()

  for (let i = 0; i < data.length; i += 16) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3]
    if (a < 128) continue
    const brightness = (r + g + b) / 3
    if (brightness > 225 || brightness < 20) continue
    const key = `${Math.round(r / 24) * 24},${Math.round(g / 24) * 24},${Math.round(b / 24) * 24}`
    freq.set(key, (freq.get(key) ?? 0) + 1)
  }

  if (freq.size === 0) return '#FF6B00'
  const [top] = Array.from(freq.entries()).sort((a, b) => b[1] - a[1])
  const [r, g, b] = top[0].split(',').map(Number)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

function analyzeColor(hex: string): { style: LandingStyle; fontPair: LandingFontPair } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l   = (max + min) / 2
  const s   = max === min ? 0 : (max - min) / (l > 0.5 ? 2 - max - min : max + min)

  let style: LandingStyle
  let fontPair: LandingFontPair

  if      (l < 0.25)  { style = 'dark-tech';     fontPair = 'orbitron-rajdhani'     }
  else if (s < 0.15)  { style = 'minimal-light';  fontPair = 'poppins-poppins'       }
  else if (s > 0.55)  { style = 'gradient-hero';  fontPair = 'orbitron-rajdhani'     }
  else                { style = 'split-layout';   fontPair = 'merriweather-poppins'  }

  return { style, fontPair }
}

interface CompressResult {
  base64:      string
  dominantColor: string
  suggestedStyle: LandingStyle
  suggestedFont:  LandingFontPair
}

function compressImage(file: File): Promise<CompressResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload  = (e) => {
      const img = new Image()
      img.onerror = reject
      img.onload  = () => {
        const MAX_W = 400, MAX_H = 200
        const ratio  = Math.min(MAX_W / img.width, MAX_H / img.height, 1)
        const w = Math.round(img.width * ratio), h = Math.round(img.height * ratio)
        const canvas = document.createElement('canvas')
        canvas.width = w; canvas.height = h
        canvas.getContext('2d')!.drawImage(img, 0, 0, w, h)
        const base64        = canvas.toDataURL('image/webp', 0.8)
        const dominantColor = extractDominantColor(canvas)
        const { style: suggestedStyle, fontPair: suggestedFont } = analyzeColor(dominantColor)
        resolve({ base64, dominantColor, suggestedStyle, suggestedFont })
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

// ── Schema ────────────────────────────────────────────────────────────────────

const schema = z.object({
  title:        z.string().optional(),
  subtitle:     z.string().optional(),
  description:  z.string().optional(),
  ctaText:      z.string().optional(),
  ctaUrl:       z.string()
                  .optional()
                  .refine(v => !v || v === '' || /^https?:\/\/.+/.test(v), {
                    message: 'Introdueix una URL vàlida (ha de començar per https://)',
                  }),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal('')),
  style:        z.enum(['dark-tech', 'minimal-light', 'gradient-hero', 'split-layout']).optional(),
  fontPair:     z.enum(['orbitron-rajdhani', 'poppins-poppins', 'playfair-merriweather', 'merriweather-poppins', 'mono-rajdhani']).optional(),
  logoUrl:      z.string().optional(),
})
type FormData = z.infer<typeof schema>

interface Props { clientId: string; companyName: string }

// ── Component principal ───────────────────────────────────────────────────────

export default function LandingEditor({ clientId, companyName }: Props) {
  const { data: landing, isLoading } = useLanding(clientId)
  const upsert  = useUpsertLanding(clientId)
  const publish = usePublishLanding(clientId)

  const [saveError,      setSaveError]      = useState('')
  const [saveOk,         setSaveOk]         = useState(false)
  const [logoPreview,    setLogoPreview]     = useState<string>('')
  const [logoLoading,    setLogoLoading]     = useState(false)
  const [logoSuggestion, setLogoSuggestion] = useState<{
    color:    string
    style:    LandingStyle
    fontPair: LandingFontPair
  } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { register, handleSubmit, reset, watch, setValue,
          formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: companyName, subtitle: '', description: '',
      ctaText: "Contacta'ns", ctaUrl: '',
      primaryColor: '#FF6B00', style: 'dark-tech',
      fontPair: 'orbitron-rajdhani' as LandingFontPair, logoUrl: '',
    },
  })

  useEffect(() => {
    if (landing) {
      const logo   = landing.logoUrl ?? ''
      const values = {
        title:        landing.title        ?? '',
        subtitle:     landing.subtitle    ?? '',
        description:  landing.description ?? '',
        ctaText:      landing.ctaText     || "Contacta'ns",
        ctaUrl:       landing.ctaUrl      ?? '',
        primaryColor: landing.primaryColor || '#FF6B00',
        style:        landing.style       || 'dark-tech',
        fontPair:     (landing.fontPair   || 'orbitron-rajdhani') as LandingFontPair,
        logoUrl:      logo,
      }
      // keepDirtyValues: no sobreescriu els camps que l'usuari ja ha editat
      // (evita perdre canvis si React Query refetcha en segon pla)
      reset(values, { keepDirtyValues: true })
      setLogoPreview(logo)
    }
  }, [landing, reset])

  const primaryColor   = watch('primaryColor') || '#FF6B00'
  const selectedStyle  = watch('style')    || 'dark-tech'
  const selectedFont   = watch('fontPair') || 'orbitron-rajdhani'

  const doSave = async (data: FormData) => {
    setSaveError(''); setSaveOk(false)
    console.log('[LandingEditor] saving — fontPair:', data.fontPair, '| title:', data.title, '| subtitle:', data.subtitle?.slice(0, 30))
    await upsert.mutateAsync(data)
    setSaveOk(true)
    setTimeout(() => setSaveOk(false), 3000)
  }

  const onSubmit = async (data: FormData) => {
    console.log('[LandingEditor] onSubmit called, data:', data)
    try {
      await doSave(data)
    } catch (err: any) {
      const fieldErrors = err.response?.data?.data as Record<string, string[]> | undefined
      if (fieldErrors) {
        const msgs = Object.entries(fieldErrors).map(([f, e]) => `${f}: ${e[0]}`).join(' · ')
        setSaveError(`Dades invàlides — ${msgs}`)
      } else {
        setSaveError(err.response?.data?.message || 'Error en desar la landing')
      }
    }
  }

  const onValidationError = (errs: object) => {
    console.error('[LandingEditor] Validation errors (save blocked):', errs)
    setSaveError(`Error de validació: ${Object.keys(errs).join(', ')}`)
  }

  const handleLogoFile = async (file: File) => {
    setLogoLoading(true); setSaveError('')
    try {
      const { base64, dominantColor, suggestedStyle, suggestedFont } = await compressImage(file)
      setLogoPreview(base64)
      setValue('logoUrl', base64, { shouldDirty: true })
      setLogoSuggestion({ color: dominantColor, style: suggestedStyle, fontPair: suggestedFont })
    } catch {
      setSaveError('Error en processar la imatge')
    } finally {
      setLogoLoading(false)
    }
  }

  const applySuggestion = async () => {
    if (!logoSuggestion) return
    setValue('primaryColor', logoSuggestion.color,    { shouldDirty: true })
    setValue('style',        logoSuggestion.style,    { shouldDirty: true })
    setValue('fontPair',     logoSuggestion.fontPair, { shouldDirty: true })
    setLogoSuggestion(null)
    // Auto-desar perquè la previsualització reflecteixi els canvis immediatament
    await handleSubmit(async (data) => {
      try { await doSave(data) } catch { /* l'error ja es mostra via setSaveError */ }
    }, onValidationError)()
  }

  if (isLoading) {
    return <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest animate-pulse">CARREGANT...</p>
  }

  return (
    <div className="space-y-5">

      {/* ── Estat publicació ─────────────────────────────── */}
      <div className="flex items-center justify-between p-3 border border-[var(--border)] bg-[var(--bg-1)]">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${landing?.published ? 'bg-[#4ade80]' : 'bg-[var(--text-muted)]'}`} />
          <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
            {landing?.published ? `Publicada · /l/${landing.slug}` : 'No publicada · Esborrany'}
          </p>
        </div>
        {landing && (
          <button type="button" onClick={() => publish.mutate(!landing.published)}
            className={`font-mono text-[9px] px-3 py-1 border transition-colors ${
              landing.published
                ? 'text-[#ff4444] border-[#ff4444]/30 hover:bg-[#ff4444]/10'
                : 'text-[#4ade80] border-[#4ade80]/30 hover:bg-[#4ade80]/10'
            }`}>
            {landing.published ? 'DESPUBLICAR' : 'PUBLICAR'}
          </button>
        )}
      </div>

      {/* ── Feedback ─────────────────────────────────────── */}
      {saveError && (
        <div className="p-3 border border-[#ff4444]/30 bg-[#ff4444]/5">
          <p className="font-mono text-[10px] text-[#ff4444]">{saveError}</p>
        </div>
      )}
      {saveOk && (
        <div className="p-3 border border-[#4ade80]/30 bg-[#4ade80]/5">
          <p className="font-mono text-[10px] text-[#4ade80]">Landing desada correctament</p>
        </div>
      )}

      {/* ── Formulari ────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-4">

        {/* ── 1. Logo ──────────────────────────────────────── */}
        <div>
          <label className="form-label">Logo de l'empresa (opcional)</label>
          <div className="flex items-start gap-4 mt-1">

            <div
              className="w-36 h-20 border border-[var(--border)] bg-[var(--bg-1)] flex items-center justify-center flex-shrink-0 overflow-hidden cursor-pointer hover:border-[var(--text-muted)] transition-colors"
              onClick={() => fileInputRef.current?.click()}
              title="Fes clic per seleccionar un logo"
            >
              {logoLoading ? (
                <p className="font-mono text-[9px] text-[var(--text-muted)] animate-pulse">PROCESSANT...</p>
              ) : logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoPreview} alt="Logo" className="max-h-16 max-w-[128px] w-auto object-contain" />
              ) : (
                <p className="font-mono text-[9px] text-[var(--text-muted)] text-center leading-relaxed px-2">
                  SENSE LOGO<br/>Fes clic per<br/>seleccionar
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2 justify-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) await handleLogoFile(file)
                  e.target.value = ''
                }}
              />
              <button type="button" onClick={() => fileInputRef.current?.click()}
                className="btn-outline text-[9px] px-3 py-1.5" disabled={logoLoading}>
                {logoLoading ? 'PROCESSANT...' : logoPreview ? 'CANVIAR LOGO' : 'SELECCIONAR IMATGE'}
              </button>
              {logoPreview && (
                <button type="button"
                  className="font-mono text-[9px] tracking-widest text-[#ff4444] border border-[#ff4444]/30 px-3 py-1.5 hover:bg-[#ff4444]/10 transition-colors"
                  onClick={() => { setLogoPreview(''); setLogoSuggestion(null); setValue('logoUrl', '', { shouldDirty: true }) }}>
                  ELIMINAR LOGO
                </button>
              )}
              <p className="font-mono text-[9px] text-[var(--text-muted)]">PNG · JPG · SVG · WEBP</p>
            </div>
          </div>

          {/* Suggeriment automàtic */}
          {logoSuggestion && (
            <div className="mt-3 p-3 border border-[#60a5fa]/30 bg-[#60a5fa]/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border border-white/20 flex-shrink-0" style={{ background: logoSuggestion.color }} />
                <div>
                  <p className="font-mono text-[9px] text-[#60a5fa] tracking-wider uppercase mb-0.5">
                    Suggeriment basat en el logo
                  </p>
                  <p className="font-rajdhani text-sm text-[var(--text)]">
                    Color{' '}
                    <span className="font-mono font-bold" style={{ color: logoSuggestion.color }}>
                      {logoSuggestion.color.toUpperCase()}
                    </span>
                    {' · '}
                    Estil{' '}
                    <span className="font-semibold">{STYLES.find(s => s.id === logoSuggestion.style)?.label}</span>
                    {' · '}
                    Lletra{' '}
                    <span className="font-semibold">{FONT_PAIRS.find(f => f.id === logoSuggestion.fontPair)?.name}</span>
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={applySuggestion}
                  className="font-mono text-[9px] tracking-widest text-[#60a5fa] border border-[#60a5fa]/40 px-3 py-1.5 hover:bg-[#60a5fa]/10 transition-colors">
                  APLICAR I DESAR
                </button>
                <button type="button" onClick={() => setLogoSuggestion(null)}
                  className="font-mono text-[9px] tracking-widest text-[var(--text-muted)] border border-[var(--border)] px-3 py-1.5 hover:border-[var(--text-muted)] transition-colors">
                  DESCARTAR
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── 2. Contingut ─────────────────────────────────── */}
        <div>
          <label className="form-label">Títol principal <span className="text-[var(--text-muted)]">(opcional si hi ha logo)</span></label>
          <input className="form-input" placeholder="Nom de l'empresa o eslògan" {...register('title')} />
        </div>

        <div>
          <label className="form-label">Subtítol</label>
          <input className="form-input" placeholder="Una frase breu que descriu el negoci" {...register('subtitle')} />
        </div>

        <div>
          <label className="form-label">Descripció dels serveis</label>
          <textarea
            className="form-input h-32 resize-y"
            placeholder={'Descriu els serveis que ofereixes...\nPots usar salts de línia per estructurar el text.'}
            {...register('description')}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Text del botó</label>
            <input className="form-input" placeholder="Contacta'ns" {...register('ctaText')} />
          </div>
          <div>
            <label className="form-label">URL del botó (opcional)</label>
            <input className="form-input" placeholder="https://..." {...register('ctaUrl')} />
            {errors.ctaUrl && <p className="font-mono text-[10px] text-[#ff4444] mt-1">{errors.ctaUrl.message}</p>}
          </div>
        </div>

        {/* ── 3. Color ─────────────────────────────────────── */}
        <div>
          <label className="form-label">Color principal</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="w-10 h-10 border border-[var(--border)] bg-transparent cursor-pointer"
              value={primaryColor}
              onChange={e => setValue('primaryColor', e.target.value, { shouldDirty: true })}
            />
            <input className="form-input font-mono w-32" {...register('primaryColor')} placeholder="#FF6B00" />
            <div className="flex-1 h-8 border border-[var(--border)]" style={{ background: primaryColor }} />
          </div>
        </div>

        {/* ── 4. Estil ─────────────────────────────────────── */}
        <div>
          <label className="form-label">Estil de la pàgina</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {STYLES.map(s => {
              const isSelected = selectedStyle === s.id
              return (
                <button key={s.id} type="button"
                  onClick={() => setValue('style', s.id, { shouldDirty: true })}
                  className={`text-left border transition-all overflow-hidden ${
                    isSelected ? 'border-[#FF6B00] bg-[#FF6B00]/5' : 'border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--bg-1)]'
                  }`}>
                  <div className="border-b border-[var(--border)]"
                    style={{ '--preview-color': primaryColor } as React.CSSProperties}>
                    {s.preview}
                  </div>
                  <div className="px-3 py-2">
                    <p className={`font-mono text-[10px] tracking-wider ${isSelected ? 'text-[#FF6B00]' : 'text-[var(--text)]'}`}>
                      {s.label}
                    </p>
                    <p className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5">{s.desc}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── 5. Tipus de lletra ───────────────────────────── */}
        <div>
          <label className="form-label">Tipus de lletra</label>
          <div className="grid grid-cols-1 gap-2 mt-1">
            {FONT_PAIRS.map(fp => {
              const isSelected = selectedFont === fp.id
              return (
                <button key={fp.id} type="button"
                  onClick={() => setValue('fontPair', fp.id, { shouldDirty: true })}
                  className={`text-left p-3 border transition-all flex items-center gap-4 ${
                    isSelected ? 'border-[#FF6B00] bg-[#FF6B00]/5' : 'border-[var(--border)] hover:border-[var(--text-muted)] bg-[var(--bg-1)]'
                  }`}>
                  {/* Mostra les dues lletres en context */}
                  <div className="flex-1 min-w-0">
                    <p className={`${fp.titleClass} text-lg leading-tight ${isSelected ? 'text-[#FF6B00]' : 'text-[var(--text)]'}`}>
                      {fp.name}
                    </p>
                    <p className={`${fp.bodyClass} text-xs text-[var(--text-muted)] leading-snug mt-0.5`}>
                      {fp.sector}
                    </p>
                  </div>
                  {/* Mostra títol + cos amb les fonts reals */}
                  <div className="shrink-0 text-right hidden sm:block">
                    <span className={`${fp.titleClass} text-[10px] tracking-widest text-[var(--text-muted)] uppercase`}>
                      TÍTOL
                    </span>
                    <span className="text-[var(--text-muted)] mx-1 text-[10px]">/</span>
                    <span className={`${fp.bodyClass} text-[10px] text-[var(--text-muted)]`}>
                      cos
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Botons ───────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 pt-2">
          <button type="submit" className="btn-primary text-xs" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'DESANT...' : landing ? 'DESAR CANVIS' : 'CREAR LANDING'}
          </button>
          {landing?.slug && (
            <>
              <a href={`/admin/landing-preview/${landing.slug}`}
                target="_blank" rel="noreferrer"
                className="btn-outline text-xs inline-flex items-center">
                PREVISUALITZAR →
              </a>
              {landing.published && (
                <a href={`/l/${landing.slug}`}
                  target="_blank" rel="noreferrer"
                  className="font-mono text-[9px] tracking-widest text-[#4ade80] border border-[#4ade80]/30 px-3 py-1.5 hover:bg-[#4ade80]/10 transition-colors inline-flex items-center">
                  PÀGINA PÚBLICA ↗
                </a>
              )}
            </>
          )}
        </div>

      </form>
    </div>
  )
}
