// Component sense 'use client' — compatible amb server i client components
export interface LandingData {
  slug:         string
  title?:       string | null
  subtitle?:    string | null
  description?: string | null
  ctaText:      string
  ctaUrl?:      string | null
  primaryColor: string
  style:        string
  fontPair?:    string | null
  logoUrl?:     string | null
  published?:   boolean
  client: {
    companyName: string
    domain?:     string | null
  }
}

// ── Mapeig de parells de lletra ───────────────────────────────────────────────
const FONT_MAP: Record<string, { title: string; body: string }> = {
  'orbitron-rajdhani':     { title: 'font-orbitron',     body: 'font-rajdhani'     },
  'poppins-poppins':       { title: 'font-poppins',      body: 'font-poppins'      },
  'playfair-merriweather': { title: 'font-playfair',     body: 'font-merriweather' },
  'merriweather-poppins':  { title: 'font-merriweather', body: 'font-poppins'      },
  'mono-rajdhani':         { title: 'font-mono',         body: 'font-rajdhani'     },
}

function getFonts(fontPair?: string | null) {
  return FONT_MAP[fontPair ?? 'orbitron-rajdhani'] ?? FONT_MAP['orbitron-rajdhani']
}

export default function LandingRenderer({ landing }: { landing: LandingData }) {
  const color = landing.primaryColor || '#FF6B00'
  const style = landing.style || 'dark-tech'
  const fonts = getFonts(landing.fontPair)

  if (style === 'minimal-light') return <MinimalLight  landing={landing} color={color} fonts={fonts} />
  if (style === 'gradient-hero') return <GradientHero  landing={landing} color={color} fonts={fonts} />
  if (style === 'split-layout')  return <SplitLayout   landing={landing} color={color} fonts={fonts} />
  return <DarkTech landing={landing} color={color} fonts={fonts} />
}

// ── Helpers comuns ────────────────────────────────────────────────────────────

type Fonts = { title: string; body: string }

function NavLogo({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-9 w-auto object-contain max-w-[160px]" />
  )
}

function HeroLogo({ src, alt }: { src: string; alt: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src} alt={alt}
      className="h-24 md:h-36 w-auto object-contain max-w-[320px] mx-auto mb-8 drop-shadow-2xl"
    />
  )
}

// ── 1. DARK TECH ─────────────────────────────────────────────────────────────

function DarkTech({ landing, color, fonts }: { landing: LandingData; color: string; fonts: Fonts }) {
  const hasTitle = !!landing.title
  return (
    <div className="min-h-screen bg-[#0d0d1a] flex flex-col grid-bg">

      <nav className="border-b px-6 py-4 flex items-center justify-between"
        style={{ borderColor: `${color}25`, background: 'rgba(13,13,26,0.92)', backdropFilter: 'blur(12px)' }}>
        {landing.logoUrl
          ? <NavLogo src={landing.logoUrl} alt={landing.client.companyName} />
          : <p className={`${fonts.title} font-bold tracking-widest text-sm`} style={{ color }}>{landing.client.companyName}</p>
        }
        {landing.ctaUrl && (
          <a href={landing.ctaUrl}
            className="font-mono text-[10px] tracking-widest px-4 py-2 border transition-all hover:opacity-80"
            style={{ borderColor: `${color}60`, color }}>
            {landing.ctaText}
          </a>
        )}
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center relative z-10">
        <div className="w-16 h-0.5 mb-10" style={{ background: color }} />
        <p className="font-mono text-[10px] tracking-[6px] text-white/40 uppercase mb-4">
          {landing.client.domain || landing.client.companyName}
        </p>

        {!hasTitle && landing.logoUrl
          ? <HeroLogo src={landing.logoUrl} alt={landing.client.companyName} />
          : hasTitle && (
            <h1 className={`${fonts.title} font-black text-4xl md:text-6xl text-white leading-tight mb-6 max-w-3xl`}
              style={{ textShadow: `0 0 60px ${color}40` }}>
              {landing.title}
            </h1>
          )
        }

        {landing.subtitle && (
          <p className={`${fonts.body} text-xl text-white/70 mb-4 max-w-xl`}>{landing.subtitle}</p>
        )}
        {landing.description && (
          <p className={`${fonts.body} text-base text-white/60 max-w-lg leading-relaxed mb-10 whitespace-pre-line text-left`}>
            {landing.description}
          </p>
        )}
        {landing.ctaUrl && (
          <a href={landing.ctaUrl}
            className="font-mono text-sm tracking-[3px] px-8 py-4 border-2 transition-all hover:opacity-80 uppercase mt-4 inline-block"
            style={{ borderColor: color, color, background: `${color}15` }}>
            {landing.ctaText} →
          </a>
        )}
        <div className="w-16 h-0.5 mt-16" style={{ background: color }} />
      </main>

      <footer className="border-t px-6 py-4 text-center" style={{ borderColor: `${color}15` }}>
        <p className="font-mono text-[9px] text-white/20 tracking-[3px]">POWERED BY AMG ENGINYERIA DIGITAL</p>
      </footer>
    </div>
  )
}

// ── 2. MINIMAL LIGHT ─────────────────────────────────────────────────────────

function MinimalLight({ landing, color, fonts }: { landing: LandingData; color: string; fonts: Fonts }) {
  const hasTitle = !!landing.title
  return (
    <div className="min-h-screen bg-white flex flex-col">

      <nav className="border-b border-gray-200 px-8 py-5 flex items-center justify-between">
        {landing.logoUrl
          ? <NavLogo src={landing.logoUrl} alt={landing.client.companyName} />
          : <p className={`${fonts.title} font-bold text-gray-900 text-lg tracking-wide`} style={{ color }}>{landing.client.companyName}</p>
        }
        {landing.ctaUrl && (
          <a href={landing.ctaUrl}
            className="font-mono text-[11px] tracking-widest px-5 py-2 border-2 transition-all hover:opacity-80"
            style={{ borderColor: color, color }}>
            {landing.ctaText}
          </a>
        )}
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-24 text-center max-w-3xl mx-auto w-full">
        <div className="w-12 h-1 mb-10 rounded-full" style={{ background: color }} />

        {!hasTitle && landing.logoUrl
          ? <HeroLogo src={landing.logoUrl} alt={landing.client.companyName} />
          : hasTitle && (
            <h1 className={`${fonts.title} font-black text-4xl md:text-6xl text-gray-900 leading-tight mb-6`}>
              {landing.title}
            </h1>
          )
        }

        {landing.subtitle && (
          <p className={`${fonts.body} text-xl text-gray-500 mb-5`}>{landing.subtitle}</p>
        )}
        {landing.description && (
          <p className={`${fonts.body} text-base text-gray-600 max-w-lg leading-relaxed mb-10 whitespace-pre-line text-left`}>
            {landing.description}
          </p>
        )}
        {landing.ctaUrl && (
          <a href={landing.ctaUrl}
            className="font-mono text-sm tracking-[3px] px-8 py-4 border-2 uppercase inline-block mt-2 transition-all hover:opacity-80"
            style={{ borderColor: color, color }}>
            {landing.ctaText} →
          </a>
        )}
        <div className="w-12 h-1 mt-16 rounded-full" style={{ background: color }} />
      </main>

      <footer className="border-t border-gray-100 px-8 py-4 text-center">
        <p className="font-mono text-[9px] text-gray-300 tracking-[3px]">POWERED BY AMG ENGINYERIA DIGITAL</p>
      </footer>
    </div>
  )
}

// ── 3. GRADIENT HERO ─────────────────────────────────────────────────────────

function GradientHero({ landing, color, fonts }: { landing: LandingData; color: string; fonts: Fonts }) {
  const grad = `linear-gradient(135deg, ${color} 0%, ${color}cc 35%, #1a1a2e 100%)`
  const hasTitle = !!landing.title

  return (
    <div className="min-h-screen flex flex-col" style={{ background: grad }}>

      <nav className="px-8 py-5 flex items-center justify-between">
        {landing.logoUrl
          ? <NavLogo src={landing.logoUrl} alt={landing.client.companyName} />
          : <p className={`${fonts.title} font-bold text-white tracking-widest text-sm`}>{landing.client.companyName}</p>
        }
        {landing.ctaUrl && (
          <a href={landing.ctaUrl}
            className="font-mono text-[11px] tracking-widest px-5 py-2 border border-white/40 text-white transition-all hover:bg-white/10">
            {landing.ctaText}
          </a>
        )}
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-8 py-20 text-center">
        <p className="font-mono text-[10px] tracking-[6px] text-white/50 uppercase mb-6">
          {landing.client.domain || landing.client.companyName}
        </p>

        {!hasTitle && landing.logoUrl
          ? <HeroLogo src={landing.logoUrl} alt={landing.client.companyName} />
          : hasTitle && (
            <h1 className={`${fonts.title} font-black text-4xl md:text-6xl text-white leading-tight mb-8 max-w-3xl drop-shadow-lg`}>
              {landing.title}
            </h1>
          )
        }

        {landing.subtitle && (
          <p className={`${fonts.body} text-xl text-white/80 mb-5 max-w-xl`}>{landing.subtitle}</p>
        )}
        {landing.description && (
          <p className={`${fonts.body} text-base text-white/70 max-w-lg leading-relaxed mb-12 whitespace-pre-line text-left`}>
            {landing.description}
          </p>
        )}
        {landing.ctaUrl && (
          <a href={landing.ctaUrl}
            className="font-mono text-sm tracking-[3px] px-8 py-4 uppercase inline-block transition-all hover:opacity-90 bg-white font-bold"
            style={{ color }}>
            {landing.ctaText} →
          </a>
        )}
      </main>

      <footer className="px-8 py-4 text-center border-t border-white/10">
        <p className="font-mono text-[9px] text-white/20 tracking-[3px]">POWERED BY AMG ENGINYERIA DIGITAL</p>
      </footer>
    </div>
  )
}

// ── 4. SPLIT LAYOUT ──────────────────────────────────────────────────────────

function SplitLayout({ landing, color, fonts }: { landing: LandingData; color: string; fonts: Fonts }) {
  const hasTitle = !!landing.title
  return (
    <div className="min-h-screen flex flex-col">

      <div className="flex flex-col md:flex-row flex-1">

        {/* Panell esquerre — color + títol/logo + CTA */}
        <div className="md:w-1/2 flex flex-col justify-center items-center px-10 py-16 md:min-h-screen text-center"
          style={{ background: color }}>

          {!hasTitle && landing.logoUrl
            ? <HeroLogo src={landing.logoUrl} alt={landing.client.companyName} />
            : landing.logoUrl
              ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={landing.logoUrl} alt={landing.client.companyName}
                    className="h-9 w-auto object-contain max-w-[160px] mb-6 brightness-0 invert self-start" />
                  <h1 className={`${fonts.title} font-black text-3xl md:text-5xl text-white leading-tight mb-8 text-left w-full`}>
                    {landing.title}
                  </h1>
                </>
              ) : (
                <>
                  <p className="font-mono text-[10px] tracking-[4px] text-white/60 uppercase mb-6 self-start">{landing.client.companyName}</p>
                  <h1 className={`${fonts.title} font-black text-3xl md:text-5xl text-white leading-tight mb-8 text-left w-full`}>
                    {landing.title}
                  </h1>
                </>
              )
          }

          {landing.ctaUrl ? (
            <a href={landing.ctaUrl}
              className="font-mono text-sm tracking-[3px] px-8 py-4 border-2 border-white text-white uppercase inline-block w-fit transition-all hover:bg-white/10">
              {landing.ctaText} →
            </a>
          ) : (
            <p className="font-mono text-[11px] tracking-widest text-white/70 mt-2">{landing.ctaText}</p>
          )}
        </div>

        {/* Panell dret — fosc + subtítol + descripció */}
        <div className="md:w-1/2 flex flex-col justify-center px-10 py-16 bg-[#0d0d1a] md:min-h-screen">
          {landing.subtitle && (
            <p className={`${fonts.body} text-2xl text-white/80 font-semibold mb-6 leading-snug`}>
              {landing.subtitle}
            </p>
          )}
          {landing.description && (
            <p className={`${fonts.body} text-base text-white/60 leading-relaxed whitespace-pre-line`}>
              {landing.description}
            </p>
          )}
          <div className="w-12 h-0.5 mt-10" style={{ background: color }} />
        </div>
      </div>

      <footer className="bg-[#0d0d1a] border-t border-white/5 px-8 py-4 text-center">
        <p className="font-mono text-[9px] text-white/20 tracking-[3px]">POWERED BY AMG ENGINYERIA DIGITAL</p>
      </footer>
    </div>
  )
}
