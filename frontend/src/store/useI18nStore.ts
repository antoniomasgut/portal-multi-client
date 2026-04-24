'use client'
import { create } from 'zustand'

export type Lang = 'ca' | 'es' | 'en'

interface I18nState {
  lang: Lang
  setLang: (lang: Lang) => void
}

export const useI18nStore = create<I18nState>(set => ({
  lang: (typeof window !== 'undefined'
    ? (localStorage.getItem('lang') as Lang | null) ?? 'ca'
    : 'ca'),

  setLang: lang => {
    set({ lang })
    if (typeof window !== 'undefined') localStorage.setItem('lang', lang)
  },
}))
