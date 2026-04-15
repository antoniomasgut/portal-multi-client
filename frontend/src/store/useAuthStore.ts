'use client'
import { create } from 'zustand'

interface AuthUser {
  id:       string
  email:    string
  role:     'ADMIN' | 'CLIENT' | 'VISITOR'
  clientId: string | null
}

interface AuthState {
  user:        AuthUser | null
  accessToken: string | null
  setAuth:     (user: AuthUser, token: string) => void
  clearAuth:   () => void
  isAdmin:     () => boolean
  isClient:    () => boolean
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:        null,
  accessToken: null,

  setAuth: (user, accessToken) => {
    set({ user, accessToken })
    localStorage.setItem('accessToken', accessToken)
  },

  clearAuth: () => {
    set({ user: null, accessToken: null })
    localStorage.removeItem('accessToken')
  },

  isAdmin:  () => get().user?.role === 'ADMIN',
  isClient: () => get().user?.role === 'CLIENT',
}))
