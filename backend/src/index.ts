import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

// ── Middleware de seguretat ──────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin: process.env.BASE_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Rate limiting global
app.use(rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max:      Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Massa peticions. Torna a provar en un minut.' },
}))

// ── Health check ────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── Rutes de l'API ─────────────────────────────────────────────────
// Les rutes s'afegiran mòdul a mòdul:
// app.use('/api/auth',    authRouter)    // Mòdul 1
// app.use('/api/clients', clientsRouter) // Mòdul 2
// ...

// ── Middleware d'errors centralitzat ────────────────────────────────
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  // No exposar errors interns en producció
  const isDev = process.env.NODE_ENV === 'development'
  const status  = err.status || err.statusCode || 500
  const message = status < 500 ? err.message : 'Error intern del servidor'

  if (status >= 500) {
    console.error('[ERROR]', err)
  }

  res.status(status).json({
    success: false,
    message,
    ...(isDev && status >= 500 && { stack: err.stack }),
  })
})

// ── Arrencada del servidor ───────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[backend] Servidor arrencant al port ${PORT} (${process.env.NODE_ENV || 'development'})`)
})

export default app
