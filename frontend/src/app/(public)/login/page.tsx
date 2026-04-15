'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../../utils/api'
import { useAuthStore } from '../../../store/useAuthStore'

const schema = z.object({
  email:    z.string().email('Email no vàlid'),
  password: z.string().min(1, 'La contrasenya és obligatòria'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router   = useRouter()
  const setAuth  = useAuthStore(s => s.setAuth)
  const [error, setError]       = useState('')
  const [magicSent, setMagicSent] = useState(false)
  const [magicEmail, setMagicEmail] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data: FormData) => {
    setError('')
    try {
      const res = await api.post('/api/auth/login', data)
      const { accessToken, user } = res.data.data
      setAuth(user, accessToken)
      router.push(user.role === 'ADMIN' ? '/admin/dashboard' : '/client/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error en el login')
    }
  }

  const handleMagicLink = async () => {
    if (!magicEmail) return
    try {
      await api.post('/api/auth/magic-link', { email: magicEmail })
      setMagicSent(true)
    } catch {
      setMagicSent(true) // no revelar si existeix
    }
  }

  return (
    <main className="grid-bg min-h-screen flex items-center justify-center relative">
      <div className="relative z-10 w-full max-w-md px-4">

        {/* Logo */}
        <div className="text-center mb-10">
          <p className="section-tag text-center">PORTAL DE GESTIÓ</p>
          <h1 className="font-orbitron font-black text-3xl text-[#FF6B00]">
            AMG Enginyeria Digital
          </h1>
        </div>

        {/* Card login */}
        <div className="bg-[var(--bg-1)] border border-[var(--border)] p-8">

          <h2 className="font-orbitron text-sm tracking-widest text-[var(--text)] mb-6 uppercase">
            Accés
          </h2>

          {error && (
            <div className="alert-danger mb-6">
              <p className="font-rajdhani text-[#ff4444] text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="admin@portal.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="font-mono text-[11px] text-[#ff4444] mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="form-label">Contrasenya</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="font-mono text-[11px] text-[#ff4444] mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'VALIDANT...' : 'ENTRAR'}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="font-mono text-[10px] text-[var(--text-muted)] tracking-widest">O</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          {/* Magic link */}
          {!magicSent ? (
            <div className="space-y-3">
              <p className="font-mono text-[11px] text-[var(--text-muted)] tracking-widest uppercase">
                Accés via link màgic
              </p>
              <input
                className="form-input"
                type="email"
                placeholder="el-teu@email.com"
                value={magicEmail}
                onChange={e => setMagicEmail(e.target.value)}
              />
              <button
                type="button"
                className="btn-outline w-full"
                onClick={handleMagicLink}
                disabled={!magicEmail}
              >
                ENVIAR LINK
              </button>
            </div>
          ) : (
            <div className="alert-success">
              <p className="font-rajdhani text-[#39d353] text-sm">
                Si el correu existeix, rebràs un link en breus. Comprova el teu email.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
