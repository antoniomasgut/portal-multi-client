'use client'
import { useI18nStore } from '../store/useI18nStore'
import type { Lang } from '../store/useI18nStore'

// Static imports — bundled at build time, zero runtime fetch
import caCommon from '../i18n/ca/common.json'
import caAuth   from '../i18n/ca/auth.json'
import caAdmin  from '../i18n/ca/admin.json'
import caClient from '../i18n/ca/client.json'

import esCommon from '../i18n/es/common.json'
import esAuth   from '../i18n/es/auth.json'
import esAdmin  from '../i18n/es/admin.json'
import esClient from '../i18n/es/client.json'

import enCommon from '../i18n/en/common.json'
import enAuth   from '../i18n/en/auth.json'
import enAdmin  from '../i18n/en/admin.json'
import enClient from '../i18n/en/client.json'

type Namespace = 'common' | 'auth' | 'admin' | 'client'

const TRANSLATIONS: Record<Lang, Record<Namespace, Record<string, unknown>>> = {
  ca: { common: caCommon, auth: caAuth, admin: caAdmin, client: caClient },
  es: { common: esCommon, auth: esAuth, admin: esAdmin, client: esClient },
  en: { common: enCommon, auth: enAuth, admin: enAdmin, client: enClient },
}

function resolve(obj: Record<string, unknown>, path: string): string {
  const parts = path.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (current == null || typeof current !== 'object') return path
    current = (current as Record<string, unknown>)[part]
  }
  return typeof current === 'string' ? current : path
}

export function useTranslation(ns: Namespace = 'common') {
  const lang = useI18nStore(s => s.lang)
  const dict = TRANSLATIONS[lang]?.[ns] ?? TRANSLATIONS['ca'][ns]

  const t = (key: string, vars?: Record<string, string | number>): string => {
    let text = resolve(dict as Record<string, unknown>, key)
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        text = text.replaceAll(`{{${k}}}`, String(v))
      }
    }
    return text
  }

  return { t, lang }
}
