'use client'
import { create } from 'zustand'

interface AuthUser {
  id:       string
  email:    string
  role:     'ADMIN' | 'CLIENT' | 'VISITOR'
  clientId: string | null
}

interface AuthState {
  user:             AuthUser | null
  accessToken:      string | null
  adminToken:       string | null   // token original de l'admin durant impersonació
  adminUser:        AuthUser | null // usuari original de l'admin
  isInitialized:    boolean         // true quan la sessió ja s'ha intentat recuperar
  setAuth:          (user: AuthUser, token: string) => void
  clearAuth:        () => void
  startImpersonate: (clientUser: AuthUser, clientToken: string) => void
  stopImpersonate:  () => void
  setInitialized:   () => void
  isAdmin:          () => boolean
  isClient:         () => boolean
  isImpersonating:  () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:          null,
  accessToken:   null,
  adminToken:    null,
  adminUser:     null,
  isInitialized: false,

  setAuth: (user, accessToken) => {
    set({ user, accessToken, isInitialized: true })
    localStorage.setItem('accessToken', accessToken)
    document.cookie = `accessToken=${accessToken}; path=/; max-age=3600; SameSite=Lax`
  },

  clearAuth: () => {
    set({ user: null, accessToken: null, adminToken: null, adminUser: null, isInitialized: true })
    localStorage.removeItem('accessToken')
    localStorage.removeItem('adminToken')
    document.cookie = 'accessToken=; path=/; max-age=0'
  },

  startImpersonate: (clientUser, clientToken) => {
    const { user, accessToken } = get()
    set({ adminUser: user, adminToken: accessToken, user: clientUser, accessToken: clientToken })
    localStorage.setItem('adminToken', accessToken ?? '')
    localStorage.setItem('accessToken', clientToken)
    document.cookie = `accessToken=${clientToken}; path=/; max-age=3600; SameSite=Lax`
  },

  stopImpersonate: () => {
    const { adminUser, adminToken } = get()
    if (!adminUser || !adminToken) return
    set({ user: adminUser, accessToken: adminToken, adminUser: null, adminToken: null })
    localStorage.setItem('accessToken', adminToken)
    localStorage.removeItem('adminToken')
    document.cookie = `accessToken=${adminToken}; path=/; max-age=3600; SameSite=Lax`
  },

  setInitialized: () => set({ isInitialized: true }),

  isAdmin:         () => get().user?.role === 'ADMIN',
  isClient:        () => get().user?.role === 'CLIENT',
  isImpersonating: () => get().adminToken !== null,
}))
