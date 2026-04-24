import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import authRouter        from './routes/auth'
import clientsRouter     from './routes/clients'
import servicesRouter    from './routes/services'
import plansRouter       from './routes/plans'
import settingsRouter    from './routes/settings'
import oauthRouter       from './routes/oauth'
import invoicesRouter    from './routes/invoices'
import landingRouter     from './routes/landing'
import portalRouter      from './routes/portal'
import automationsRouter from './routes/automations'
import onboardingRouter  from './routes/onboarding'
import reportingRouter   from './routes/reporting'
import rgpdRouter        from './routes/rgpd'
import { errorHandler }  from './middleware/errorHandler'

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware de seguretat ──────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true)
    const isLocalhost = /^https?:\/\/localhost(:\d+)?$/.test(origin)
    const isAllowed   = isLocalhost || origin === process.env.BASE_URL
    if (isAllowed) cb(null, true)
    else cb(new Error(`CORS: origin no permès: ${origin}`))
  },
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Rate limiting global
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max:      Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Massa peticions. Torna-ho a provar en un minut.', data: null },
}))

// ── Health check ────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Rutes de l'API ──────────────────────────────────────────────────
app.use('/api/auth',     authRouter)
app.use('/api/clients',  clientsRouter)
app.use('/api/services', servicesRouter)
app.use('/api/plans',    plansRouter)
app.use('/api/settings', settingsRouter)
app.use('/api/oauth',    oauthRouter)
app.use('/api/invoices', invoicesRouter)
app.use('/api/landing',  landingRouter)
app.use('/api/portal',       portalRouter)
app.use('/api/clients',      automationsRouter)
app.use('/api/automations',  automationsRouter)
app.use('/api/onboarding',   onboardingRouter)
app.use('/api/reports',      reportingRouter)
app.use('/api/clients',      rgpdRouter)

// ── Middleware d'errors centralitzat ────────────────────────────────
app.use(errorHandler)

// ── Arrencada ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[backend] Port ${PORT} — ${process.env.NODE_ENV || 'development'}`)
})

export default app
