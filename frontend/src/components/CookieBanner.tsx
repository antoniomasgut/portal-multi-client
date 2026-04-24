'use client'
import { useState, useEffect } from 'react'

const STORAGE_KEY = 'amg_cookie_consent'

interface CookiePrefs {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  decided:   boolean
}

function loadPrefs(): CookiePrefs | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function savePrefs(prefs: Omit<CookiePrefs, 'decided'>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...prefs, decided: true }))
}

interface CookieBannerProps {
  onConsent?: (prefs: Omit<CookiePrefs, 'decided'>) => void
}

export function CookieBanner({ onConsent }: CookieBannerProps) {
  const [visible,    setVisible]    = useState(false)
  const [showDetail, setShowDetail] = useState(false)
  const [analytics,  setAnalytics]  = useState(false)
  const [marketing,  setMarketing]  = useState(false)

  useEffect(() => {
    const prefs = loadPrefs()
    if (!prefs?.decided) setVisible(true)
  }, [])

  const accept = (prefs: Omit<CookiePrefs, 'decided'>) => {
    savePrefs(prefs)
    onConsent?.(prefs)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div
        style={{ background: '#13132a', border: '1px solid rgba(255,107,0,0.3)', maxWidth: 640, margin: '0 auto' }}
        className="rounded p-5"
      >
        {!showDetail ? (
          <>
            <p style={{ fontSize: 13, color: '#e0e0f0', lineHeight: 1.6, margin: '0 0 16px' }}>
              Usem galetes pròpies per al funcionament del portal. Pots acceptar-les totes o gestionar les teves preferències.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => accept({ necessary: true, analytics: true, marketing: true })}
                style={{
                  background: '#FF6B00', color: '#0d0d1a', border: 'none', padding: '8px 20px',
                  fontSize: 11, fontWeight: 'bold', letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase',
                }}
              >
                ACCEPTAR-LES TOTES
              </button>
              <button
                onClick={() => accept({ necessary: true, analytics: false, marketing: false })}
                style={{
                  background: 'transparent', color: '#8888aa', border: '1px solid rgba(255,107,0,0.3)',
                  padding: '8px 20px', fontSize: 11, letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase',
                }}
              >
                NOMÉS NECESSÀRIES
              </button>
              <button
                onClick={() => setShowDetail(true)}
                style={{
                  background: 'transparent', color: '#FF6B00', border: 'none',
                  padding: '8px 12px', fontSize: 11, letterSpacing: 1, cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Gestionar
              </button>
            </div>
          </>
        ) : (
          <>
            <p style={{ fontSize: 12, fontWeight: 'bold', letterSpacing: 2, color: '#FF6B00', marginBottom: 16, textTransform: 'uppercase' }}>
              Preferències de galetes
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {[
                { key: 'necessary', label: 'Necessàries', desc: 'Requerides per al funcionament del portal. No es poden desactivar.', forced: true, value: true },
                { key: 'analytics', label: 'Analítiques', desc: 'Ens ajuden a millorar el servei.', forced: false, value: analytics },
                { key: 'marketing', label: 'Màrqueting', desc: 'Per oferir contingut personalitzat.', forced: false, value: marketing },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: 12, color: '#e0e0f0', fontWeight: 'bold' }}>{item.label}</p>
                    <p style={{ margin: '2px 0 0', fontSize: 11, color: '#8888aa' }}>{item.desc}</p>
                  </div>
                  <div
                    onClick={() => {
                      if (item.forced) return
                      if (item.key === 'analytics') setAnalytics(!analytics)
                      if (item.key === 'marketing') setMarketing(!marketing)
                    }}
                    style={{
                      width: 36, height: 20, borderRadius: 10, cursor: item.forced ? 'default' : 'pointer',
                      background: item.value ? '#FF6B00' : '#333355', transition: 'background 0.2s',
                      position: 'relative', flexShrink: 0, marginLeft: 16,
                    }}
                  >
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%', background: '#fff',
                      position: 'absolute', top: 3, left: item.value ? 19 : 3, transition: 'left 0.2s',
                    }} />
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => accept({ necessary: true, analytics, marketing })}
              style={{
                background: '#FF6B00', color: '#0d0d1a', border: 'none', padding: '8px 20px',
                fontSize: 11, fontWeight: 'bold', letterSpacing: 2, cursor: 'pointer', textTransform: 'uppercase',
              }}
            >
              DESAR PREFERÈNCIES
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export function useCookieConsent() {
  return {
    getPrefs: () => loadPrefs(),
    hasConsented: (type: 'analytics' | 'marketing' | 'necessary') => {
      const prefs = loadPrefs()
      if (!prefs?.decided) return false
      return prefs[type] ?? false
    },
  }
}
