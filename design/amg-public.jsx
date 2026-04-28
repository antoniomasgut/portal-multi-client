// amg-public.jsx — Public landing + Micro-landings (4 styles)

function AMGPublicLanding() {
  return (
    <div className="amg w-full h-full bg-[#0d0d1a] overflow-auto">
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur bg-[#0d0d1a]/80 border-b border-[rgba(255,107,0,0.12)]">
        <div className="max-w-[1200px] mx-auto px-10 h-16 flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FF6B00] btn-clip flex items-center justify-center">
              <span className="f-display font-black text-black text-xs">A</span>
            </div>
            <div className="f-display font-black text-sm tracking-[0.15em]">AMG</div>
            <span className="f-mono text-[9px] text-[#FF9A3C] tracking-[0.25em]">ENGINYERIA DIGITAL</span>
          </div>
          <nav className="flex gap-6 f-mono text-[11px] uppercase tracking-wider">
            <a className="text-[#e2e8f0] hover:text-[#FF9A3C]">Servicios</a>
            <a className="text-[#e2e8f0] hover:text-[#FF9A3C]">Planes</a>
            <a className="text-[#e2e8f0] hover:text-[#FF9A3C]">Clientes</a>
            <a className="text-[#e2e8f0] hover:text-[#FF9A3C]">Contacto</a>
          </nav>
          <div className="flex-1"></div>
          <AMGButton variant="ghost" size="sm">LOGIN</AMGButton>
          <AMGButton size="sm" icon={I.ArrowRight}>EMPEZAR</AMGButton>
        </div>
      </header>

      {/* Hero */}
      <section className="relative amg-grid overflow-hidden">
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at 70% 40%, rgba(255,107,0,0.18), transparent 50%)'}}></div>
        <div className="relative max-w-[1200px] mx-auto px-10 py-24 grid grid-cols-[1.2fr_1fr] gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 bg-[#FF6B00] amg-blink"></span>
              <span className="f-mono text-[11px] uppercase tracking-[0.2em] text-[#FF9A3C]">v2.14.0 · PORTAL operativo</span>
            </div>
            <h1 className="f-display font-black text-[64px] leading-[0.98] tracking-tight">
              LA INFRAESTRUCTURA<br/>
              DIGITAL DE TU <span className="text-[#FF9A3C]">PYME,</span><br/>
              EN <span className="underline decoration-[#FF6B00] decoration-4 underline-offset-4">48 HORAS.</span>
            </h1>
            <p className="text-lg text-[#94a3b8] mt-5 max-w-xl">
              Bot de WhatsApp con IA, landing generada, workflows y facturación — un solo portal, un solo equipo, un solo precio.
            </p>
            <div className="flex items-center gap-3 mt-7">
              <AMGButton size="lg" icon={I.ArrowRight}>AGENDAR DEMO</AMGButton>
              <AMGButton variant="outline" size="lg" icon={I.Play}>VER CÓMO FUNCIONA · 2 min</AMGButton>
            </div>
            <div className="flex items-center gap-6 mt-8 f-mono text-[11px] uppercase text-[#64748b]">
              <span className="flex items-center gap-2"><I.Check size={12} stroke="#39d353"/>SIN PERMANENCIA</span>
              <span className="flex items-center gap-2"><I.Check size={12} stroke="#39d353"/>SOPORTE HUMANO</span>
              <span className="flex items-center gap-2"><I.Check size={12} stroke="#39d353"/>CANCELA CUANDO QUIERAS</span>
            </div>
          </div>

          {/* Mock terminal */}
          <div className="amg-card card-clip p-0 overflow-hidden">
            <div className="h-9 bg-[#13132a] border-b border-[rgba(255,107,0,0.15)] flex items-center gap-2 px-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#ff4444]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#f0b429]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#39d353]"></div>
              </div>
              <div className="flex-1 text-center f-mono text-[10px] text-[#64748b]">portal.amg.cat — onboarding</div>
            </div>
            <div className="p-5 f-mono text-[12px] space-y-1.5">
              <div><span className="text-[#64748b]">$</span> <span className="text-[#e2e8f0]">amg init cliente</span></div>
              <div className="text-[#94a3b8]">→ Creando workspace…</div>
              <div className="text-[#39d353]">✓ Workspace listo (2s)</div>
              <div className="text-[#94a3b8]">→ Conectando WhatsApp Business API…</div>
              <div className="text-[#39d353]">✓ Bot activo · 0 mensajes en cola</div>
              <div className="text-[#94a3b8]">→ Generando landing con IA…</div>
              <div className="text-[#39d353]">✓ cliente.amg.cat/l/empresa publicada</div>
              <div className="text-[#94a3b8]">→ Configurando Stripe + facturación…</div>
              <div className="text-[#39d353]">✓ Primer cobro programado · 12 May</div>
              <div className="text-[#FF9A3C]">◆ 00:47 · Infraestructura lista</div>
              <div className="h-2"></div>
              <div><span className="text-[#64748b]">$</span> <span className="text-[#FF9A3C]">_</span><span className="inline-block w-2 h-4 bg-[#FF9A3C] ml-0.5 amg-blink align-middle"></span></div>
            </div>
          </div>
        </div>

        {/* Trust strip */}
        <div className="relative border-y border-[rgba(255,107,0,0.12)] bg-[#0d0d1a]/60">
          <div className="max-w-[1200px] mx-auto px-10 py-5 flex items-center justify-between gap-10">
            <span className="f-mono text-[10px] uppercase tracking-[0.2em] text-[#64748b]">48 pymes ya lo usan ·</span>
            {['NEBULA','CAL ROVIRA','FUSTA VIVES','CODI BLAU','MANGO DIG.','TORRENT ARQ.'].map(n => (
              <span key={n} className="f-display font-bold text-sm text-[#94a3b8] tracking-[0.1em] hover:text-[#FF9A3C]">{n}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="f-mono text-[11px] uppercase tracking-[0.2em] text-[#FF9A3C]">01 · Qué hacemos</span>
              <h2 className="f-display font-black text-4xl mt-2">TODO LO QUE NECESITA<br/>UNA PYME <span className="text-[#FF9A3C]">MODERNA.</span></h2>
            </div>
            <a className="f-mono text-[11px] uppercase text-[#FF9A3C] tracking-wider hover:underline flex items-center gap-1.5">VER CATÁLOGO COMPLETO<I.ArrowRight size={12}/></a>
          </div>
          <div className="grid grid-cols-4 gap-4">
            {[
              ['Bot','WHATSAPP BOT AI','Responde el 78% de las consultas sin intervención humana. Aprende de tu documentación.'],
              ['Globe','LANDING AUTO','Página lista en 60 segundos a partir de un brief. 4 estilos visuales, tu dominio.'],
              ['Zap','WORKFLOW ENGINE','Conecta Calendar, Stripe, Drive, Notion. Automatiza lo repetitivo sin código.'],
              ['Receipt','FACTURACIÓN','Emisión automática, Stripe integrado, PDFs, envíos por email, recordatorios.'],
            ].map(([ic,t,d],i) => {
              const Ic = I[ic];
              return (
                <div key={i} className="amg-card card-clip p-6 group hover:border-l-2 hover:border-l-[#FF6B00] transition">
                  <div className="w-12 h-12 bg-[rgba(255,107,0,0.12)] border border-[rgba(255,107,0,0.35)] flex items-center justify-center mb-4">
                    <Ic size={20} stroke="#FF9A3C"/>
                  </div>
                  <div className="f-mono text-[10px] uppercase tracking-[0.2em] text-[#64748b] mb-1">0{i+1}</div>
                  <div className="f-display font-bold text-base">{t}</div>
                  <div className="text-[13px] text-[#94a3b8] mt-2 leading-relaxed">{d}</div>
                  <div className="mt-5 flex items-center gap-1.5 f-mono text-[10px] uppercase text-[#FF9A3C] tracking-wider opacity-0 group-hover:opacity-100 transition">
                    MÁS INFO <I.ArrowRight size={10}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="relative py-24 amg-grid border-y border-[rgba(255,107,0,0.12)]">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="text-center mb-12">
            <span className="f-mono text-[11px] uppercase tracking-[0.2em] text-[#FF9A3C]">02 · Planes</span>
            <h2 className="f-display font-black text-4xl mt-2">UN PRECIO TRANSPARENTE.<br/>SIN LETRA PEQUEÑA.</h2>
          </div>
          <div className="grid grid-cols-3 gap-5 max-w-[960px] mx-auto">
            {[
              { n:'STARTER', p:'29', d:'/ mes', sub:'+ €79 setup único', feat:['1 servicio activo','500 mensajes WhatsApp','1 landing','Soporte por email','Portal cliente'], cta:'EMPEZAR' },
              { n:'GROWTH', p:'79', d:'/ mes', sub:'+ €149 setup único', feat:['5 servicios activos','2.000 mensajes WhatsApp','1 landing + dominio custom','Soporte prioritario','Workflows ilimitados','Analytics avanzado'], cta:'ELEGIR PLAN', featured:true },
              { n:'SCALE', p:'149', d:'/ mes', sub:'+ €299 setup único', feat:['Servicios ilimitados','10.000 mensajes WhatsApp','Landings ilimitadas','Asesor técnico dedicado','SLA 99.9%','Custom integrations'], cta:'HABLAR CON VENTAS' },
            ].map((p,i) => (
              <div key={i} className={`card-clip p-7 flex flex-col ${p.featured ? 'bg-gradient-to-b from-[rgba(255,107,0,0.12)] to-[rgba(255,107,0,0.02)] border-2 border-[#FF6B00]' : 'amg-card'}`}>
                {p.featured && <div className="absolute -mt-12 self-center"><AMGBadge tone="accent">MÁS POPULAR</AMGBadge></div>}
                <div className="f-mono text-[11px] uppercase tracking-[0.2em] text-[#FF9A3C]">{p.n}</div>
                <div className="flex items-baseline gap-1 mt-3">
                  <span className="f-display text-[#FF9A3C] text-xl">€</span>
                  <span className="f-display font-black text-5xl">{p.p}</span>
                  <span className="f-mono text-xs text-[#64748b] uppercase ml-1">{p.d}</span>
                </div>
                <div className="f-mono text-[11px] text-[#64748b] mt-1">{p.sub}</div>
                <div className="h-[1px] bg-[rgba(226,232,240,0.08)] my-5"></div>
                <ul className="space-y-2.5 flex-1">
                  {p.feat.map((f,j) => (
                    <li key={j} className="flex items-start gap-2.5 text-sm">
                      <I.Check size={14} stroke="#FF9A3C" className="mt-0.5 shrink-0"/>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <AMGButton variant={p.featured ? 'primary' : 'secondary'} className="w-full justify-center mt-6" icon={I.ArrowRight}>{p.cta}</AMGButton>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="relative py-24">
        <div className="max-w-[1200px] mx-auto px-10">
          <div className="grid grid-cols-3 gap-5">
            {[
              ['"El bot cerró 14 ventas el primer fin de semana sin que yo tocara nada."','Marta Ruiz','CEO · Nebula Studio','N','#FF6B00'],
              ['"Pasamos de facturar en Excel a emitir 80 facturas/mes automáticas."','Jordi Planes','Admin · Cal Rovira','J','#58a6ff'],
              ['"Nuestra landing aparece en la primera página de Google en 3 semanas."','Lídia Vives','Fundadora · Fusta Vives','L','#39d353'],
            ].map(([q,n,r,ini,col],i) => (
              <div key={i} className="amg-card card-clip p-6">
                <div className="f-display text-3xl text-[#FF6B00] mb-2">“</div>
                <p className="text-[#e2e8f0] leading-relaxed">{q.replace(/^"|"$/g,'')}</p>
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-[rgba(226,232,240,0.05)]">
                  <div className="w-9 h-9 flex items-center justify-center f-display font-bold text-sm text-black" style={{background: col}}>{ini}</div>
                  <div>
                    <div className="text-sm font-semibold">{n}</div>
                    <div className="f-mono text-[10px] text-[#64748b] uppercase">{r}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-20 amg-grid border-t border-[rgba(255,107,0,0.15)]">
        <div className="max-w-[960px] mx-auto px-10 text-center">
          <h2 className="f-display font-black text-5xl leading-tight">¿LISTO PARA <span className="text-[#FF9A3C]">AUTOMATIZAR</span><br/>LO QUE IMPORTA?</h2>
          <p className="text-lg text-[#94a3b8] mt-4">30 minutos de demo. Te dejamos el portal configurado y puedes probarlo 14 días.</p>
          <div className="flex items-center justify-center gap-3 mt-8">
            <AMGButton size="lg" icon={I.Calendar}>AGENDAR DEMO GRATUITA</AMGButton>
            <AMGButton variant="outline" size="lg" icon={I.Mail}>hola@amg.cat</AMGButton>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(255,107,0,0.15)] bg-[#0d0d1a]">
        <div className="max-w-[1200px] mx-auto px-10 py-12 grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-[#FF6B00] btn-clip flex items-center justify-center"><span className="f-display font-black text-black text-xs">A</span></div>
              <span className="f-display font-black text-sm tracking-[0.15em]">AMG ENGINYERIA DIGITAL</span>
            </div>
            <p className="text-sm text-[#94a3b8] max-w-xs">Infraestructura digital para pymes mediterráneas. Fundada en Llevant, Catalunya.</p>
            <p className="f-mono text-[10px] text-[#64748b] mt-4">© 2026 AMG Enginyeria Digital · B-00 000 000</p>
          </div>
          {[
            ['PRODUCTO',['Servicios','Planes','Roadmap','Status']],
            ['RECURSOS',['Documentación','API','Guías','Changelog']],
            ['LEGAL',['Términos','Privacidad','Cookies','DPA']],
          ].map(([t,links]) => (
            <div key={t}>
              <div className="f-mono text-[10px] uppercase tracking-[0.2em] text-[#FF9A3C] mb-3">{t}</div>
              <ul className="space-y-2 text-sm text-[#94a3b8]">
                {links.map(l => <li key={l}><a className="hover:text-[#FF9A3C]">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

// ─────────── Micro-landings — 4 styles ───────────
function AMGMicroLanding({ style = 'tech' }) {
  if (style === 'tech') return <MLTech/>;
  if (style === 'modern') return <MLModern/>;
  if (style === 'classic') return <MLClassic/>;
  return <MLMinimal/>;
}

function MLTech() {
  return (
    <div className="amg w-full h-full bg-[#0d0d1a] overflow-auto amg-grid">
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#FF6B00] btn-clip flex items-center justify-center"><span className="f-display font-black text-black text-[10px]">N</span></div>
            <span className="f-display font-black text-sm tracking-[0.1em]">NEBULA</span>
          </div>
          <span className="f-mono text-[9px] uppercase text-[#FF9A3C] tracking-wider">nebula.cat</span>
        </div>
        <span className="f-mono text-[10px] uppercase tracking-[0.2em] text-[#FF9A3C]">Estudio creativo</span>
        <h1 className="f-display font-black text-[40px] leading-[1.05] mt-2">BRANDING,<br/>WEB Y <span className="text-[#FF9A3C]">MOTION.</span></h1>
        <p className="text-sm text-[#94a3b8] mt-3">Diseño digital para marcas que no quieren pasar desapercibidas.</p>
        <AMGButton size="lg" className="mt-5" icon={I.ArrowRight}>RESERVAR LLAMADA</AMGButton>

        <div className="amg-ph h-40 mt-6 flex items-center justify-center f-mono text-[10px] text-[#64748b] uppercase">hero image · 520×300</div>

        <div className="mt-6 grid grid-cols-3 gap-2">
          {['Branding','Web','Motion'].map((s,i) => (
            <div key={s} className="amg-card card-clip p-3">
              <div className="f-mono text-[9px] text-[#FF9A3C]">0{i+1}</div>
              <div className="f-display font-bold text-sm mt-1">{s.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <div className="amg-card card-clip p-5 mt-6">
          <div className="f-mono text-[10px] uppercase tracking-[0.2em] text-[#FF9A3C] mb-3">Contacto directo</div>
          <div className="space-y-2">
            <AMGInput placeholder="Email" icon={I.Mail}/>
            <AMGInput placeholder="Empresa / proyecto" icon={I.Building}/>
            <textarea rows="3" placeholder="Cuéntanos en 2 líneas…" className="w-full bg-[#1a1a2e]/80 border border-[rgba(255,107,0,0.14)] p-3 text-sm outline-none resize-none"/>
            <AMGButton className="w-full justify-center" icon={I.ArrowRight}>ENVIAR</AMGButton>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-[rgba(255,107,0,0.12)] flex items-center justify-between">
          <span className="f-mono text-[9px] uppercase text-[#64748b]">© Nebula · Potenciado por AMG</span>
          <div className="flex gap-2 text-[#64748b]"><I.Mail size={12}/><I.Link size={12}/></div>
        </div>
      </div>
    </div>
  );
}

function MLModern() {
  return (
    <div className="w-full h-full bg-[#f5f2ec] text-[#1a1a2e] overflow-auto" style={{fontFamily:'"Rajdhani",sans-serif'}}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-10">
          <span style={{fontFamily:'"Orbitron"'}} className="font-black text-sm">NEBULA</span>
          <span className="text-[11px] text-[#64748b]">Estudio creativo</span>
        </div>
        <h1 style={{fontFamily:'"Orbitron"'}} className="font-black text-[44px] leading-[1.02]">Diseño que<br/><span className="text-[#FF6B00]">funciona</span> bonito.</h1>
        <p className="mt-4 text-[#4a4a5e]">Branding, web y motion para marcas que crecen rápido — o quieren hacerlo.</p>
        <button className="mt-5 h-11 px-6 bg-[#1a1a2e] text-white rounded-full text-sm font-semibold inline-flex items-center gap-2">Reservar llamada →</button>

        <div className="mt-7 h-44 bg-gradient-to-br from-[#FF6B00] to-[#FF9A3C] rounded-3xl flex items-center justify-center text-white font-bold text-2xl">Nebula</div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          {[['Branding','12 casos'],['Web','34 casos'],['Motion','8 casos'],['Consultoría','continua']].map(([a,b]) => (
            <div key={a} className="p-4 bg-white rounded-2xl shadow-sm border border-black/5">
              <div style={{fontFamily:'"Orbitron"'}} className="font-bold text-sm">{a}</div>
              <div className="text-xs text-[#64748b] mt-1">{b}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-5 bg-white rounded-3xl shadow-sm border border-black/5">
          <div className="text-xs text-[#64748b] mb-3 uppercase tracking-wider">Hablemos</div>
          <input className="w-full h-10 px-3 bg-[#f5f2ec] rounded-xl mb-2 outline-none text-sm" placeholder="tu@email.com"/>
          <textarea rows="2" className="w-full p-3 bg-[#f5f2ec] rounded-xl mb-2 outline-none text-sm resize-none" placeholder="Tu proyecto…"/>
          <button className="w-full h-11 bg-[#FF6B00] text-white rounded-xl font-semibold">Enviar →</button>
        </div>
        <div className="mt-6 text-center text-[10px] text-[#94a3b8]">Powered by AMG</div>
      </div>
    </div>
  );
}

function MLClassic() {
  return (
    <div className="w-full h-full bg-[#faf7f0] text-[#1a1a2e] overflow-auto" style={{fontFamily:'Georgia, "Times New Roman", serif'}}>
      <div className="p-6">
        <div className="text-center border-b-2 border-double border-[#FF6B00] pb-4 mb-6">
          <div className="text-[10px] uppercase tracking-[0.3em] text-[#94a3b8]">Estudio · Est. 2019</div>
          <h1 className="text-3xl font-bold mt-2" style={{fontFamily:'Georgia'}}>Nebula Studio</h1>
          <div className="italic text-[#94a3b8] text-sm mt-1">— Branding & Diseño Digital —</div>
        </div>
        <p className="text-[15px] leading-relaxed text-[#2a2a3e] first-letter:f-display first-letter:text-5xl first-letter:float-left first-letter:mr-2 first-letter:leading-none first-letter:text-[#FF6B00] first-letter:font-black" style={{fontFamily:'Orbitron'}}>
          <span style={{fontFamily:'Georgia'}}>Llevamos casi una década diseñando marcas e interfaces para empresas catalanas. Trabajamos sin prisa pero sin pausa — cada proyecto merece tiempo, contexto y carácter.</span>
        </p>

        <h2 className="text-xl font-bold mt-8 mb-3 border-b border-black/10 pb-2">Servicios</h2>
        <ul className="space-y-3 text-[15px]">
          {[
            ['Identidad visual','Desde logo hasta sistema completo.'],
            ['Diseño web','Presencia cuidada, rendimiento impecable.'],
            ['Motion graphics','Video corporativo y animación.'],
          ].map(([a,b]) => (
            <li key={a} className="flex gap-3"><span className="text-[#FF6B00] text-xl leading-5">§</span><div><b>{a}</b> — <span className="text-[#64748b]">{b}</span></div></li>
          ))}
        </ul>

        <div className="mt-8 p-5 border border-[#FF6B00]/40 bg-white">
          <div className="text-xs uppercase tracking-[0.2em] text-[#FF6B00] mb-3 text-center">Solicitar presupuesto</div>
          <input className="w-full h-10 px-3 border border-black/15 mb-2 outline-none text-sm bg-white" placeholder="Nombre y apellido"/>
          <input className="w-full h-10 px-3 border border-black/15 mb-2 outline-none text-sm bg-white" placeholder="Correo electrónico"/>
          <textarea rows="3" className="w-full p-3 border border-black/15 mb-2 outline-none text-sm bg-white resize-none" placeholder="Describa su proyecto…"/>
          <button className="w-full h-10 bg-[#1a1a2e] text-white text-sm tracking-wider uppercase">Enviar solicitud</button>
        </div>

        <div className="mt-8 pt-4 border-t border-black/10 text-center text-[10px] uppercase tracking-[0.2em] text-[#94a3b8]">
          Carrer Major 24 · Llevant · Powered by AMG
        </div>
      </div>
    </div>
  );
}

function MLMinimal() {
  return (
    <div className="w-full h-full bg-white text-black overflow-auto" style={{fontFamily:'Helvetica, "Helvetica Neue", Arial, sans-serif'}}>
      <div className="p-8">
        <div className="flex items-center justify-between mb-20">
          <span className="font-bold text-sm">Nebula</span>
          <span className="text-[11px] text-[#94a3b8]">— 2019</span>
        </div>
        <div className="text-[11px] tracking-[0.3em] uppercase text-[#94a3b8] mb-4">Estudio creativo</div>
        <h1 className="text-[52px] font-bold leading-[0.95] tracking-tight">Diseño,<br/>sin ruido.</h1>
        <p className="text-sm text-[#4a4a5e] mt-6 max-w-[380px] leading-relaxed">
          Hacemos marcas limpias para empresas que prefieren decir menos — mejor.
        </p>
        <div className="mt-10 w-16 h-[2px] bg-black"></div>
        <div className="mt-10 space-y-3 text-sm">
          {['Branding','Web','Motion','Arte dirección'].map((s,i) => (
            <div key={s} className="flex justify-between border-b border-black/10 pb-2">
              <span>{s}</span><span className="text-[#94a3b8]">0{i+1}</span>
            </div>
          ))}
        </div>
        <div className="mt-12">
          <div className="text-[11px] tracking-[0.3em] uppercase text-[#94a3b8] mb-3">Contacto</div>
          <input className="w-full h-10 px-0 border-b border-black/20 mb-3 outline-none text-sm bg-transparent focus:border-black" placeholder="email@dominio.com"/>
          <textarea rows="2" className="w-full p-0 border-b border-black/20 mb-5 outline-none text-sm bg-transparent resize-none focus:border-black" placeholder="Mensaje"/>
          <button className="text-sm font-semibold underline underline-offset-4">Enviar →</button>
        </div>
        <div className="mt-16 text-[10px] text-[#94a3b8]">Powered by AMG</div>
      </div>
    </div>
  );
}

Object.assign(window, { AMGPublicLanding, AMGMicroLanding });
