import Link from 'next/link'

const PLANS = [
  {
    name: 'Bàsic',
    price: 49,
    color: '#4ade80',
    desc: 'Ideal per arrencar',
    features: [
      'Bot WhatsApp 24/7',
      'Landing page IA',
      '500 converses/mes',
      '4 automatitzacions',
      'Panel de gestió web',
      'Suport per email',
    ],
    cta: 'Començar ara',
  },
  {
    name: 'Pro',
    price: 99,
    color: '#60a5fa',
    desc: 'Per a negocis en creixement',
    features: [
      'Tot el Bàsic inclòs',
      '2.000 converses/mes',
      '15 automatitzacions',
      'Landing page personalitzada',
      'CRM integrat',
      'Suport prioritari',
    ],
    cta: 'Escalar ara',
    highlight: true,
  },
  {
    name: 'Premium',
    price: 199,
    color: '#c084fc',
    desc: 'Automatització avançada',
    features: [
      'Tot el Pro inclòs',
      '10.000 converses/mes',
      'Automatitzacions il·limitades',
      'Agent IA RAG',
      'Domini personalitzat',
      'Account manager',
    ],
    cta: 'Accelerar',
  },
  {
    name: 'Empresarial',
    price: 499,
    color: '#FF6B00',
    desc: 'Solució a mida',
    features: [
      'Tot el Premium inclòs',
      'Converses il·limitades',
      'Multi-agent WhatsApp',
      'Integracions custom',
      'SLA 99.9%',
      'Suport 24/7 telefònic',
    ],
    cta: 'Parlar amb nosaltres',
  },
]

const FEATURES = [
  {
    tag: 'WHATSAPP IA',
    title: 'Bot 24/7 que treballa mentre dorms',
    desc: 'El teu agent virtual respon, qualifica leads i tanca vendes a qualsevol hora. Integrat amb WhatsApp Business API oficial de Meta.',
    stat: '67%',
    statLabel: 'de consultes resoltes automàticament',
    color: '#4ade80',
  },
  {
    tag: 'LANDING PAGE IA',
    title: 'La teva web professional en 5 minuts',
    desc: 'Genera una landing page optimitzada per conversió amb el teu branding, textos i CTA. Publicada al teu domini en instants.',
    stat: '3×',
    statLabel: 'més conversions vs webs estàtiques',
    color: '#60a5fa',
  },
  {
    tag: 'AUTOMATITZACIONS',
    title: 'Flujos automàtics sense codi',
    desc: 'Connects les teves apps (CRM, email, facturació, Google Sheets) amb workflows visuals basats en n8n. Zero programació.',
    stat: '12h',
    statLabel: 'estalviades per setmana de mitjana',
    color: '#c084fc',
  },
  {
    tag: 'PANEL DE GESTIÓ',
    title: 'Tot el teu negoci en un sol lloc',
    desc: 'Visualitza converses, leads, facturació i rendiment en temps real. Accedeix des de qualsevol dispositiu, sempre actualitzat.',
    stat: '100%',
    statLabel: 'visibilitat del teu negoci',
    color: '#FF6B00',
  },
]

const STEPS = [
  { n: '01', title: 'Configura el teu negoci', desc: 'Ens dones les dades de l\'empresa i connectem el teu WhatsApp Business en menys de 24 hores.' },
  { n: '02', title: 'IA genera el teu perfil', desc: 'L\'agent crea la landing page, configura els workflows i entrena el bot amb la informació del teu negoci.' },
  { n: '03', title: 'Funciona sol', desc: 'El sistema treballa 24/7 captant leads, responent clients i enviant-te informes setmanals automàtics.' },
]

const COMPARE = [
  { feature: 'Bot WhatsApp 24/7',       amg: true,  landbot: true,  respond: true,  tidio: false },
  { feature: 'Landing page IA inclosa', amg: true,  landbot: false, respond: false, tidio: false },
  { feature: 'Automatitzacions n8n',    amg: true,  landbot: false, respond: false, tidio: false },
  { feature: 'Panel multi-client',      amg: true,  landbot: false, respond: false, tidio: false },
  { feature: 'Preu des de',            amg: '49€', landbot: '80€', respond: '79$', tidio: '24€' },
  { feature: 'Suport en català',        amg: true,  landbot: false, respond: false, tidio: false },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0d0d1a] text-[#e0e0f0] font-rajdhani">

      {/* ── Nav ──────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,107,0,0.15)]"
        style={{ background: 'rgba(13,13,26,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-6 h-[70px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-[#FF6B00] rotate-45" />
            <span className="font-mono text-xs tracking-[4px] text-[#8888aa] uppercase">Portal</span>
            <span className="font-orbitron font-black text-[#FF6B00] text-lg tracking-wider">AMG</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#plans" className="font-mono text-sm tracking-[2px] text-[#8888aa] hover:text-[#FF6B00] transition-colors uppercase hidden md:block">
              Plans
            </a>
            <a href="#features" className="font-mono text-sm tracking-[2px] text-[#8888aa] hover:text-[#FF6B00] transition-colors uppercase hidden md:block">
              Serveis
            </a>
            <Link href="/login"
              className="font-mono text-sm tracking-[2px] uppercase px-5 py-2.5 bg-[#FF6B00] text-black transition-all hover:bg-[#FF9A3C]"
              style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
              ACCEDIR AL PORTAL →
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative pt-[70px] min-h-screen flex items-center overflow-hidden">
        {/* Grid bg */}
        <div className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,107,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,107,0,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }} />
        {/* Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.06) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <p className="font-mono text-xs tracking-[6px] text-[#FF6B00] uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-px bg-[#FF6B00]" />
              AMG Enginyeria Digital
            </p>
            <h1 className="font-orbitron font-black leading-tight mb-6"
              style={{ fontSize: 'clamp(2.2rem, 5vw, 4rem)' }}>
              Automatitza el teu negoci.{' '}
              <span style={{ color: '#FF6B00' }}>Creix sense límits.</span>
            </h1>
            <p className="font-rajdhani text-xl text-[#8888aa] leading-relaxed mb-10 max-w-2xl">
              Bot WhatsApp 24/7, landing page generada amb IA i automatitzacions de processos.
              Tot integrat, tot gestionat per nosaltres. Tu focuses en vendre.
            </p>

            <div className="flex flex-wrap gap-4 mb-16">
              <a href="#plans"
                className="font-mono text-sm tracking-[2px] uppercase px-8 py-4 bg-[#FF6B00] text-black font-bold transition-all hover:bg-[#FF9A3C] hover:scale-[1.03]"
                style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
                VER PLANS DES DE 49€
              </a>
              <Link href="/login"
                className="font-mono text-sm tracking-[2px] uppercase px-8 py-4 bg-transparent text-[#FF6B00] border border-[#FF6B00] transition-all hover:bg-[#FF6B00] hover:text-black"
                style={{ clipPath: 'polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%)' }}>
                ACCEDIR AL PORTAL
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 max-w-lg">
              {[
                { n: '67%',  l: 'consultes resoltes automàticament' },
                { n: '24/7', l: 'disponibilitat del bot WhatsApp' },
                { n: '5min', l: 'per tenir la landing page activa' },
              ].map(s => (
                <div key={s.n}>
                  <p className="font-orbitron font-black text-2xl text-[#FF6B00]">{s.n}</p>
                  <p className="font-mono text-xs text-[#8888aa] tracking-wider leading-relaxed mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-24 border-t border-[rgba(255,107,0,0.1)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-mono text-xs tracking-[6px] text-[#FF6B00] uppercase mb-4">Solució integral</p>
            <h2 className="font-orbitron font-black text-3xl md:text-4xl">
              Tot el que necessites, en un sol lloc
            </h2>
            <p className="font-rajdhani text-lg text-[#8888aa] mt-4 max-w-xl mx-auto">
              Mentre Landbot, Respond.io o Tidio et venen peces separades, nosaltres t'ho donem tot integrat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(f => (
              <div key={f.tag}
                className="bg-[#13132a] border border-[rgba(255,107,0,0.1)] p-8 relative overflow-hidden group hover:border-[rgba(255,107,0,0.3)] transition-all duration-300 hover:-translate-y-1">
                <div className="absolute top-0 left-0 w-1 h-0 group-hover:h-full transition-all duration-300"
                  style={{ background: f.color }} />
                <p className="font-mono text-xs tracking-[4px] uppercase mb-3" style={{ color: f.color }}>
                  {f.tag}
                </p>
                <h3 className="font-orbitron font-bold text-xl text-[#e0e0f0] mb-3 leading-snug">
                  {f.title}
                </h3>
                <p className="font-rajdhani text-[#8888aa] leading-relaxed mb-6">{f.desc}</p>
                <div className="flex items-baseline gap-2">
                  <span className="font-orbitron font-black text-3xl" style={{ color: f.color }}>{f.stat}</span>
                  <span className="font-mono text-xs text-[#8888aa] tracking-wider max-w-[160px] leading-relaxed">{f.statLabel}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Com funciona ─────────────────────────────────────────── */}
      <section className="py-24 border-t border-[rgba(255,107,0,0.1)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-mono text-xs tracking-[6px] text-[#FF6B00] uppercase mb-4">Procés</p>
            <h2 className="font-orbitron font-black text-3xl md:text-4xl">Com funciona</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-full w-full h-px z-0"
                    style={{ background: 'linear-gradient(90deg, rgba(255,107,0,0.3), transparent)' }} />
                )}
                <div className="relative z-10">
                  <p className="font-orbitron font-black text-5xl text-[rgba(255,107,0,0.15)] mb-4">{s.n}</p>
                  <h3 className="font-orbitron font-bold text-lg text-[#e0e0f0] mb-3">{s.title}</h3>
                  <p className="font-rajdhani text-[#8888aa] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ────────────────────────────────────────────────── */}
      <section id="plans" className="py-24 border-t border-[rgba(255,107,0,0.1)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="font-mono text-xs tracking-[6px] text-[#FF6B00] uppercase mb-4">Preus transparents</p>
            <h2 className="font-orbitron font-black text-3xl md:text-4xl">Tria el teu pla</h2>
            <p className="font-rajdhani text-lg text-[#8888aa] mt-4">
              Sense permanència. Canvia o cancel·la quan vulguis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map(p => (
              <div key={p.name}
                className={`relative bg-[#13132a] border p-6 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                  p.highlight
                    ? 'border-[#60a5fa] shadow-[0_0_30px_rgba(96,165,250,0.1)]'
                    : 'border-[rgba(255,107,0,0.1)] hover:border-[rgba(255,107,0,0.3)]'
                }`}>
                {p.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="font-mono text-xs tracking-[3px] px-3 py-1 bg-[#60a5fa] text-black uppercase">
                      MÉS POPULAR
                    </span>
                  </div>
                )}
                <div className="mb-5">
                  <p className="font-mono text-xs tracking-[3px] uppercase mb-1" style={{ color: p.color }}>
                    {p.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="font-orbitron font-black text-4xl" style={{ color: p.color }}>{p.price}</span>
                    <span className="font-mono text-sm text-[#8888aa]">€/mes</span>
                  </div>
                  <p className="font-rajdhani text-[#8888aa] text-base mt-1">{p.desc}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {p.features.map(f => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="font-mono text-sm mt-0.5" style={{ color: p.color }}>▸</span>
                      <span className="font-rajdhani text-base text-[#8888aa]">{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/login"
                  className="font-mono text-xs tracking-[2px] uppercase py-3 text-center transition-all hover:scale-[1.02] block"
                  style={{
                    background: p.highlight ? p.color : 'transparent',
                    color: p.highlight ? '#000' : p.color,
                    border: `1px solid ${p.color}`,
                    clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)',
                  }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Comparativa ──────────────────────────────────────────── */}
      <section className="py-24 border-t border-[rgba(255,107,0,0.1)]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="font-mono text-xs tracking-[6px] text-[#FF6B00] uppercase mb-4">Comparativa</p>
            <h2 className="font-orbitron font-black text-3xl">Per què AMG?</h2>
          </div>
          <div className="bg-[#13132a] border border-[rgba(255,107,0,0.1)] overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-5 border-b border-[rgba(255,107,0,0.1)] bg-[#0d0d1a]">
              <div className="px-5 py-3 col-span-2">
                <p className="font-mono text-xs tracking-[3px] text-[#FF6B00] uppercase">Funcionalitat</p>
              </div>
              {['AMG', 'Landbot', 'Respond.io', 'Tidio'].map((c, i) => (
                <div key={c} className="px-3 py-3 text-center">
                  <p className={`font-mono text-xs tracking-[2px] uppercase ${i === 0 ? 'text-[#FF6B00]' : 'text-[#8888aa]'}`}>
                    {c}
                  </p>
                </div>
              ))}
            </div>
            {COMPARE.map((row, i) => (
              <div key={row.feature}
                className={`grid grid-cols-5 items-center ${i < COMPARE.length - 1 ? 'border-b border-[rgba(255,107,0,0.06)]' : ''} hover:bg-[rgba(255,107,0,0.02)] transition-colors`}>
                <div className="px-5 py-4 col-span-2">
                  <p className="font-rajdhani text-sm text-[#e0e0f0]">{row.feature}</p>
                </div>
                {[row.amg, row.landbot, row.respond, row.tidio].map((v, j) => (
                  <div key={j} className="px-3 py-4 text-center">
                    {typeof v === 'boolean' ? (
                      <span className={`font-mono text-sm ${v ? 'text-[#4ade80]' : 'text-[rgba(255,255,255,0.15)]'}`}>
                        {v ? '✓' : '✕'}
                      </span>
                    ) : (
                      <span className={`font-mono text-sm font-bold ${j === 0 ? 'text-[#FF6B00]' : 'text-[#8888aa]'}`}>
                        {v}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Final ────────────────────────────────────────────── */}
      <section className="py-24 border-t border-[rgba(255,107,0,0.1)] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,107,0,0.05) 0%, transparent 70%)' }} />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <p className="font-mono text-xs tracking-[6px] text-[#FF6B00] uppercase mb-6">Comença avui</p>
          <h2 className="font-orbitron font-black leading-tight mb-6"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)' }}>
            El teu negoci mereix treballar per tu, no al revés.
          </h2>
          <p className="font-rajdhani text-xl text-[#8888aa] mb-10">
            Accedeix al portal, configura el teu perfil i deixa que la IA faci la feina.
            Setup en menys de 24 hores.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/login"
              className="font-mono text-sm tracking-[3px] uppercase px-10 py-4 bg-[#FF6B00] text-black font-bold transition-all hover:bg-[#FF9A3C] hover:scale-[1.03]"
              style={{ clipPath: 'polygon(10px 0%, 100% 0%, calc(100% - 10px) 100%, 0% 100%)' }}>
              ACCEDIR AL PORTAL →
            </Link>
          </div>
          <p className="font-mono text-xs text-[#8888aa] tracking-wider mt-6">
            Ja tens compte? <Link href="/login" className="text-[#FF6B00] hover:underline">Inicia sessió</Link>
          </p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="border-t border-[rgba(255,107,0,0.1)] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 bg-[#FF6B00] rotate-45" />
            <span className="font-orbitron font-black text-[#FF6B00] tracking-wider">AMG</span>
            <span className="font-mono text-xs text-[#8888aa] tracking-widest">Enginyeria Digital</span>
          </div>
          <div className="flex gap-6">
            <a href="#features" className="font-mono text-xs tracking-[2px] text-[#8888aa] hover:text-[#FF6B00] transition-colors uppercase">Serveis</a>
            <a href="#plans" className="font-mono text-xs tracking-[2px] text-[#8888aa] hover:text-[#FF6B00] transition-colors uppercase">Plans</a>
            <Link href="/login" className="font-mono text-xs tracking-[2px] text-[#8888aa] hover:text-[#FF6B00] transition-colors uppercase">Portal</Link>
          </div>
          <p className="font-mono text-xs text-[rgba(255,255,255,0.4)] tracking-widest">
            © 2026 AMG Enginyeria Digital
          </p>
        </div>
      </footer>

    </div>
  )
}
