'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { api } from '../../../../utils/api'
import { useAuthStore } from '../../../../store/useAuthStore'

export default function MagicLinkPage() {
  const router  = useRouter()
  const params  = useParams()
  const setAuth = useAuthStore(s => s.setAuth)
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = params?.token as string
    if (!token) { setStatus('error'); setMessage('Token no vàlid'); return }

    api.get(`/api/auth/magic-link/${token}`)
      .then(res => {
        const { accessToken, user } = res.data.data
        setAuth(user, accessToken)
        router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard')
      })
      .catch(err => {
        setStatus('error')
        setMessage(err.response?.data?.message || 'Link invàlid o expirat')
      })
  }, [])

  return (
    <main className="grid-bg min-h-screen flex items-center justify-center relative">
      <div className="relative z-10 text-center">
        {status === 'loading' ? (
          <>
            <p className="section-tag">VERIFICANT</p>
            <p className="font-orbitron text-[#FF6B00] text-xl animate-pulse">
              Validant link màgic...
            </p>
          </>
        ) : (
          <div className="alert-danger p-8 max-w-sm">
            <p className="section-tag">ERROR</p>
            <p className="font-rajdhani text-[#ff4444]">{message}</p>
            <button
              className="btn-outline mt-6"
              onClick={() => router.push('/login')}
            >
              TORNAR AL LOGIN
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
