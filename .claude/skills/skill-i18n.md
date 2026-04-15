# Skill: Multiidioma (i18n)

## Ús
Implementar multiidioma (ca, es, en) al frontend i als emails/PDFs del backend.

## Stack
- Frontend: `next-i18next` (Next.js 14 App Router)
- Backend: fitxers JSON per idioma, traduïts via funció `t(key, lang)`

## Frontend

### Estructura de fitxers
```
src/i18n/
  ca/
    common.json    → traduccions generals
    dashboard.json → traduccions del dashboard
    clients.json
    billing.json
  es/
    common.json
    ...
  en/
    common.json
    ...
```

### Format de les traduccions
```json
// ca/common.json
{
  "nav": {
    "dashboard": "Tauler",
    "clients": "Clients",
    "billing": "Facturació"
  },
  "status": {
    "active":    "Actiu",
    "suspended": "Suspès",
    "cancelled": "Cancel·lat"
  },
  "actions": {
    "save":   "DESAR",
    "cancel": "CANCEL·LAR",
    "delete": "ELIMINAR",
    "create": "CREAR"
  },
  "errors": {
    "required":     "Camp obligatori",
    "invalidEmail": "Email no vàlid",
    "minLength":    "Mínim {{min}} caràcters"
  }
}
```

### Ús als components
```tsx
'use client'
import { useTranslation } from 'next-i18next'

export const ClientCard = ({ client }) => {
  const { t } = useTranslation('clients')
  return (
    <div className="card">
      <h3 className="font-orbitron">{client.name}</h3>
      <span className="badge">{t(`status.${client.status.toLowerCase()}`)}</span>
      <button className="btn-outline">{t('actions.edit')}</button>
    </div>
  )
}
```

### Canvi d'idioma (Zustand)
```typescript
// store/useI18nStore.ts
interface I18nState {
  lang: 'ca' | 'es' | 'en'
  setLang: (lang: 'ca' | 'es' | 'en') => void
}
export const useI18nStore = create<I18nState>(set => ({
  lang: 'ca',
  setLang: lang => {
    set({ lang })
    localStorage.setItem('lang', lang)
    // Desar al perfil si l'usuari és autenticat
  }
}))
```

## Backend (emails i PDFs)

### Fitxer de traduccions backend
```typescript
// utils/i18n.ts
const translations: Record<string, Record<string, Record<string, string>>> = {
  ca: {
    email: {
      welcome_subject:   'Benvingut/da a AMG Enginyeria Digital',
      invoice_subject:   'La teva factura de {{month}}',
      usage_80_subject:  'Has consumit el 80% del teu pla',
      greeting:          'Hola, {{name}}!',
      invoice_ready:     'La teva factura del mes de {{month}} ja està disponible.',
    },
    pdf: {
      invoice_title: 'FACTURA',
      client:        'CLIENT',
      concept:       'CONCEPTE',
      amount:        'IMPORT',
      total:         'TOTAL',
      vat_included:  'IVA inclòs',
    }
  },
  es: {
    email: {
      welcome_subject:   'Bienvenido/a a AMG Enginyeria Digital',
      invoice_subject:   'Tu factura de {{month}}',
      usage_80_subject:  'Has consumido el 80% de tu plan',
      greeting:          '¡Hola, {{name}}!',
      invoice_ready:     'Tu factura del mes de {{month}} ya está disponible.',
    },
    pdf: {
      invoice_title: 'FACTURA',
      client:        'CLIENTE',
      concept:       'CONCEPTO',
      amount:        'IMPORTE',
      total:         'TOTAL',
      vat_included:  'IVA incluido',
    }
  },
  en: {
    email: {
      welcome_subject:  'Welcome to AMG Enginyeria Digital',
      invoice_subject:  'Your invoice for {{month}}',
      usage_80_subject: "You've used 80% of your plan",
      greeting:         'Hello, {{name}}!',
      invoice_ready:    'Your invoice for {{month}} is now available.',
    },
    pdf: {
      invoice_title: 'INVOICE',
      client:        'CLIENT',
      concept:       'CONCEPT',
      amount:        'AMOUNT',
      total:         'TOTAL',
      vat_included:  'VAT included',
    }
  }
}

export const t = (key: string, lang = 'ca', vars: Record<string, string> = {}): string => {
  const [namespace, ...rest] = key.split('.')
  const langKey = ['ca', 'es', 'en'].includes(lang) ? lang : 'ca'
  let text = translations[langKey]?.[namespace]?.[rest.join('.')] ?? key
  for (const [k, v] of Object.entries(vars)) {
    text = text.replaceAll(`{{${k}}}`, v)
  }
  return text
}
```

### Ús al backend
```typescript
// Subjecte de l'email en l'idioma del client
const subject = t('email.invoice_subject', client.language, { month: 'Abril 2026' })

// Text del PDF en l'idioma del client
const totalLabel = t('pdf.total', client.language)
```

## Regla
Cap text hardcodat ni al frontend ni als emails/PDFs. Tot via `t()` o `useTranslation()`.
