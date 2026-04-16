'use client'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLanding, useUpsertLanding, usePublishLanding } from '../../../../hooks/useLanding'

const schema = z.object({
  title:        z.string().min(2, 'Mínim 2 caràcters'),
  subtitle:     z.string().optional(),
  description:  z.string().optional(),
  ctaText:      z.string().optional(),
  ctaUrl:       z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional().or(z.literal('')),
})
type FormData = z.infer<typeof schema>

interface Props { clientId: string; companyName: string }

export default function LandingEditor({ clientId, companyName }: Props) {
  const { data: landing, isLoading } = useLanding(clientId)
  const upsert  = useUpsertLanding(clientId)
  const publish = usePublishLanding(clientId)

  const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting, isDirty } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:        companyName,
      subtitle:     '',
      description:  '',
      ctaText:      "Contacta'ns",
      ctaUrl:       '',
      primaryColor: '#FF6B00',
    },
  })

  useEffect(() => {
    if (landing) {
      reset({
        title:        landing.title,
        subtitle:     landing.subtitle ?? '',
        description:  landing.description ?? '',
        ctaText:      landing.ctaText,
        ctaUrl:       landing.ctaUrl ?? '',
        primaryColor: landing.primaryColor,
      })
    }
  }, [landing, reset])

  const primaryColor = watch('primaryColor') || '#FF6B00'

  const onSubmit = async (data: FormData) => {
    await upsert.mutateAsync(data)
  }

  if (isLoading) {
    return <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest animate-pulse">CARREGANT...</p>
  }

  return (
    <div className="space-y-6">

      {/* Estat de publicació */}
      <div className="flex items-center justify-between p-4 border border-[var(--border)] bg-[var(--bg-1)]">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${landing?.published ? 'bg-[#4ade80]' : 'bg-[var(--text-muted)]'}`} />
          <p className="font-mono text-[10px] text-[var(--text-muted)] tracking-wider">
            {landing?.published
              ? `Publicada · /l/${landing.slug}`
              : 'No publicada'}
          </p>
        </div>
        {landing && (
          <div className="flex gap-2">
            {landing.published ? (
              <button
                type="button"
                className="font-mono text-[9px] text-[#ff4444] border border-[#ff4444]/30 px-3 py-1 hover:bg-[#ff4444]/10 transition-colors"
                onClick={() => publish.mutate(false)}
              >DESPUBLICAR</button>
            ) : (
              <button
                type="button"
                className="font-mono text-[9px] text-[#4ade80] border border-[#4ade80]/30 px-3 py-1 hover:bg-[#4ade80]/10 transition-colors"
                onClick={() => publish.mutate(true)}
              >PUBLICAR</button>
            )}
          </div>
        )}
      </div>

      {/* Formulari */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="form-label">Títol principal *</label>
          <input className="form-input" {...register('title')} />
          {errors.title && <p className="font-mono text-[10px] text-[#ff4444] mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="form-label">Subtítol</label>
          <input className="form-input" placeholder="La teva empresa de confiança..." {...register('subtitle')} />
        </div>
        <div>
          <label className="form-label">Descripció</label>
          <textarea className="form-input h-24 resize-none" placeholder="Descriu els teus serveis..." {...register('description')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="form-label">Text del botó CTA</label>
            <input className="form-input" {...register('ctaText')} />
          </div>
          <div>
            <label className="form-label">URL del botó CTA</label>
            <input className="form-input" placeholder="https://..." {...register('ctaUrl')} />
          </div>
        </div>
        <div>
          <label className="form-label">Color principal</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              className="w-10 h-10 border border-[var(--border)] bg-transparent cursor-pointer"
              value={primaryColor}
              onChange={e => reset({ ...watch(), primaryColor: e.target.value })}
            />
            <input className="form-input font-mono w-32" {...register('primaryColor')} placeholder="#FF6B00" />
            <div className="flex-1 h-8 border border-[var(--border)]" style={{ background: primaryColor }} />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="btn-primary text-xs" disabled={isSubmitting || !isDirty}>
            {isSubmitting ? 'DESANT...' : landing ? 'DESAR CANVIS' : 'CREAR LANDING'}
          </button>
          {landing?.slug && (
            <a
              href={`/l/${landing.slug}`}
              target="_blank"
              rel="noreferrer"
              className="btn-outline text-xs inline-flex items-center"
            >
              PREVISUALITZAR →
            </a>
          )}
        </div>
      </form>
    </div>
  )
}
