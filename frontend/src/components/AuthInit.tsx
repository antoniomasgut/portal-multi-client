'use client'
import { useEffect } from 'react'
import { useAuthStore } from '../store/useAuthStore'
import { api } from '../utils/api'

/**
 * Recupera la sessió des de localStorage quan es carrega una nova pestanya o es refresca.
 * Ha d'estar al nivell arrel (Providers) perquè s'executi a totes les pàgines.
 */
export function AuthInit() {
  const { setAuth, setInitialized, isInitialized } = useAuthStore()

  useEffect(() => {
    if (isInitialized) return

    const token     = localStorage.getItem('accessToken')
    const adminToken = localStorage.getItem('adminToken')

    if (!token) {
      setInitialized()
      return
    }

    // Verificar el token amb el backend i recuperar les dades de l'usuari
    api.get('/api/auth/me')
      .then(res => {
        const user = res.data.data
        if (user) {
          setAuth(user, token)

          // Si hi havia impersonació activa, restaurar l'estat
          if (adminToken) {
            const { startImpersonate } = useAuthStore.getState()
            // adminUser no es pot recuperar sense fer una altra crida — simplement netejem l'adminToken
            // per evitar un estat inconsistent. L'admin haurà de tornar a impersonar si cal.
            localStorage.removeItem('adminToken')
          }
        } else {
          setInitialized()
        }
      })
      .catch(() => {
        // Token invàlid o expirat — netejar i marcar com inicialitzat
        localStorage.removeItem('accessToken')
        localStorage.removeItem('adminToken')
        document.cookie = 'accessToken=; path=/; max-age=0'
        setInitialized()
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
