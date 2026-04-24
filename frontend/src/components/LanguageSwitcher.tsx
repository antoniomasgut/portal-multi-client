'use client'
import { useI18nStore, type Lang } from '../store/useI18nStore'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ca', label: 'CA' },
  { code: 'es', label: 'ES' },
  { code: 'en', label: 'EN' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useI18nStore()

  return (
    <div className="flex items-center gap-1">
      {LANGS.map(({ code, label }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          className={[
            'font-mono text-[9px] tracking-[2px] px-2 py-1 transition-all border',
            lang === code
              ? 'border-[#FF6B00] text-[#FF6B00] bg-[rgba(255,107,0,0.08)]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text)] hover:border-[var(--border)]',
          ].join(' ')}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
