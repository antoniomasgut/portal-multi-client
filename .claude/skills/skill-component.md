# Skill: Component React (Design System AMG)

## Ús
Crear components React seguint el design system AMG: dark mode, taronja #FF6B00, tipografia Orbitron/Rajdhani/Share Tech Mono, estètica angular.

## Patró base de component
```tsx
// components/ui/StatCard.tsx
interface StatCardProps {
  label:    string
  value:    string | number
  unit?:    string
  trend?:   'up' | 'down' | 'neutral'
  variant?: 'default' | 'warning' | 'danger' | 'success'
}

export const StatCard = ({ label, value, unit, trend, variant = 'default' }: StatCardProps) => {
  const borderColor = {
    default: 'border-l-[#FF6B00]',
    warning: 'border-l-[#FF6B00]',
    danger:  'border-l-[#ff4444]',
    success: 'border-l-[#39d353]',
  }[variant]

  return (
    <div className={`bg-[var(--bg-2)] border border-[var(--border)] border-l-2 ${borderColor} rounded p-4`}>
      <p className="font-mono text-[11px] tracking-[4px] text-[var(--orange)] uppercase mb-2">
        {label}
      </p>
      <p className="font-orbitron text-3xl font-bold text-[var(--text)]">
        {value}
        {unit && <span className="text-base font-mono text-[var(--text-muted)] ml-1">{unit}</span>}
      </p>
      {trend && (
        <span className={`font-mono text-[10px] tracking-wider mt-1 block
          ${trend === 'up'   ? 'text-[#39d353]' : ''}
          ${trend === 'down' ? 'text-[#ff4444]' : ''}
          ${trend === 'neutral' ? 'text-[var(--text-muted)]' : ''}`}>
          {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'}
        </span>
      )}
    </div>
  )
}
```

## Components base del design system

### Badge d'estat
```tsx
type StatusBadgeProps = { status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED' | 'TEST' }

const statusConfig = {
  ACTIVE:    { color: '#39d353', label: { ca: 'ACTIU', es: 'ACTIVO', en: 'ACTIVE' } },
  SUSPENDED: { color: '#FF6B00', label: { ca: 'SUSPÈS', es: 'SUSPENDIDO', en: 'SUSPENDED' } },
  CANCELLED: { color: '#ff4444', label: { ca: 'CANCEL·LAT', es: 'CANCELADO', en: 'CANCELLED' } },
  TEST:      { color: '#58a6ff', label: { ca: 'TEST', es: 'TEST', en: 'TEST' } },
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const cfg = statusConfig[status]
  return (
    <span className="font-mono text-[10px] tracking-[1px] px-2 py-0.5 rounded-sm border"
      style={{ color: cfg.color, borderColor: cfg.color }}>
      {cfg.label.ca}
    </span>
  )
}
```

### Barra de progrés d'ús
```tsx
interface UsageBarProps { used: number; max: number; label: string }

export const UsageBar = ({ used, max, label }: UsageBarProps) => {
  const pct = max ? Math.min((used / max) * 100, 100) : 0
  const color = pct >= 100 ? '#ff4444' : pct >= 80 ? '#FF6B00' : '#39d353'

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="font-mono text-[11px] tracking-[2px] text-[var(--orange)] uppercase">{label}</span>
        <span className="font-mono text-[11px] text-[var(--text-muted)]">
          {used.toLocaleString()} / {max ? max.toLocaleString() : '∞'}
        </span>
      </div>
      <div className="h-1.5 bg-[var(--bg-0)] rounded-full overflow-hidden">
        <div className="h-full transition-all duration-500 rounded-full"
          style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
```

### Modal
```tsx
interface ModalProps { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[var(--bg-1)] border border-[var(--border)] p-8 w-full max-w-lg mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-orbitron font-bold tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--orange)]">✕</button>
        </div>
        {children}
      </div>
    </div>
  )
}
```

## Regles del design system
- `font-orbitron` per títols i números importants
- `font-rajdhani` per text de cos
- `font-mono` (Share Tech Mono) per labels, badges, botons
- Colors via variables CSS (`var(--orange)`, `var(--bg-2)`, etc.) mai hardcodats
- `border-radius` màxim: `4px` (classe `rounded` o `rounded-sm`)
- Botons amb `clip-path` angular (classe `btn-primary` o `btn-outline`)
