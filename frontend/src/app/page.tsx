export default function Home() {
  return (
    <main className="grid-bg min-h-screen flex items-center justify-center relative">
      <div className="relative z-10 text-center">
        <p className="section-tag">SISTEMA OPERATIU</p>
        <h1 className="font-orbitron font-black text-4xl text-[#FF6B00] mb-4">
          AMG Enginyeria Digital
        </h1>
        <p className="font-rajdhani text-[var(--text-muted)] text-lg">
          Portal Multi-Client — Infraestructura OK
        </p>
        <div className="mt-8 stat-card inline-block text-left">
          <p className="font-mono text-[11px] tracking-[2px] text-[#FF6B00] uppercase mb-1">
            ESTAT
          </p>
          <p className="font-orbitron text-xl text-[#39d353]">OPERATIU</p>
        </div>
      </div>
    </main>
  )
}
