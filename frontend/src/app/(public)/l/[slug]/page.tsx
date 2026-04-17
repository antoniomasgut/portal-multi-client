import { notFound } from 'next/navigation'

interface Landing {
  id:           string
  slug:         string
  title:        string
  subtitle?:    string
  description?: string
  ctaText:      string
  ctaUrl?:      string
  primaryColor: string
  publishedAt?: string
  client: {
    companyName: string
    domain?:     string
  }
}

async function getLanding(slug: string): Promise<Landing | null> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
    const res    = await fetch(`${apiUrl}/api/landing/public/${slug}`, { next: { revalidate: 60 } })
    if (!res.ok) return null
    const json = await res.json()
    return json.data
  } catch {
    return null
  }
}

export default async function LandingPage({ params }: { params: { slug: string } }) {
  const landing = await getLanding(params.slug)
  if (!landing) notFound()

  const color = landing.primaryColor || '#FF6B00'

  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col grid-bg">

      {/* ── Nav ──────────────────────────────────────────────── */}
      <nav className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: `${color}25`, background: 'rgba(13,13,26,0.92)', backdropFilter: 'blur(12px)' }}>
        <p className="font-orbitron font-bold text-white tracking-widest text-sm"
          style={{ color }}>
          {landing.client.companyName}
        </p>
        {landing.ctaUrl && (
          <a href={landing.ctaUrl} className="font-mono text-[10px] tracking-widest px-4 py-2 border transition-all hover:opacity-80"
            style={{ borderColor: `${color}60`, color }}>
            {landing.ctaText}
          </a>
        )}
      </nav>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative z-10 animate-fade-in-up">

        <div className="w-16 h-0.5 mb-10" style={{ background: color }} />

        <p className="font-mono text-[10px] tracking-[6px] text-white/40 uppercase mb-4">
          {landing.client.domain || landing.client.companyName}
        </p>

        <h1 className="font-orbitron font-black text-4xl md:text-6xl text-white leading-tight mb-6 max-w-3xl"
          style={{ textShadow: `0 0 60px ${color}40` }}>
          {landing.title}
        </h1>

        {landing.subtitle && (
          <p className="font-rajdhani text-xl text-white/60 mb-4 max-w-xl">{landing.subtitle}</p>
        )}

        {landing.description && (
          <p className="font-rajdhani text-base text-white/40 max-w-lg leading-relaxed mb-10">
            {landing.description}
          </p>
        )}

        {landing.ctaUrl && (
          <a
            href={landing.ctaUrl}
            className="font-mono text-sm tracking-[3px] px-8 py-4 border-2 transition-all hover:opacity-80 uppercase mt-4"
            style={{ borderColor: color, color, background: `${color}15` }}
          >
            {landing.ctaText} →
          </a>
        )}

        <div className="w-16 h-0.5 mt-16" style={{ background: color }} />
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t px-6 py-4 text-center" style={{ borderColor: `${color}15` }}>
        <p className="font-mono text-[9px] text-white/20 tracking-[3px]">
          POWERED BY AMG ENGINYERIA DIGITAL
        </p>
      </footer>

    </div>
  )
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const landing = await getLanding(params.slug)
  if (!landing) return {}
  return {
    title:       landing.title,
    description: landing.description || landing.subtitle,
  }
}
