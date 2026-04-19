'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '../../../../../utils/api'
import LandingRenderer, { type LandingData } from '../../../../../components/LandingRenderer'

export default function LandingPreviewPage() {
  const params                 = useParams() ?? {}
  const slug                   = (params.slug ?? '') as string
  const router                 = useRouter()
  const [landing, setLanding]  = useState<LandingData | null>(null)
  const [loading, setLoading]  = useState(true)

  useEffect(() => {
    if (!slug) return
    api.get(`/api/landing/preview/${slug}`)
      .then(r => setLanding(r.data.data))
      .catch(() => setLanding(null))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex items-center justify-center">
        <p className="font-mono text-[10px] text-white/40 tracking-[4px] animate-pulse">CARREGANT...</p>
      </div>
    )
  }

  if (!landing) {
    return (
      <div className="min-h-screen bg-[#0d0d1a] flex flex-col items-center justify-center gap-4">
        <p className="font-mono text-[10px] text-white/40 tracking-[4px]">LANDING NO TROBADA</p>
        <button onClick={() => router.back()}
          className="font-mono text-[10px] text-[#FF6B00] border border-[#FF6B00]/30 px-4 py-2 hover:bg-[#FF6B00]/10 transition-colors">
          ← TORNAR
        </button>
      </div>
    )
  }

  return (
    <div className="relative">
      {/* ── Barra de preview ──────────────────────────────── */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-6 py-2 bg-[#1a1a2e]/95 border-b border-[#FF6B00]/20 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="font-mono text-[9px] tracking-widest px-2 py-0.5 border border-[#FF6B00]/40 text-[#FF6B00] bg-[#FF6B00]/10">
            PREVIEW
          </span>
          <p className="font-mono text-[9px] text-white/40 tracking-wider">
            {landing.published
              ? <span className="text-[#4ade80]">● Publicada</span>
              : <span className="text-white/30">○ Esborrany</span>
            }
            {' · '}/l/{landing.slug}
            {' · '}
            <span className="text-[#FF6B00]">{landing.style}</span>
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="font-mono text-[9px] text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-3 py-1 transition-all"
        >
          ← TORNAR
        </button>
      </div>

      {/* ── Landing renderitzada ───────────────────────────── */}
      <LandingRenderer landing={landing} />
    </div>
  )
}
