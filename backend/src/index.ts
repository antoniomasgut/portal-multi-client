import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'
import dotenv from 'dotenv'

import authRouter    from './routes/auth'
import clientsRouter from './routes/clients'
import { errorHandler } from './middleware/errorHandler'

dotenv.config()

const app  = express()
const PORT = process.env.PORT || 4000

// ── Middleware de seguretat ──────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin:      process.env.BASE_URL || 'http://localhost:3000',
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
app.use('/api/auth',    authRouter)
app.use('/api/clients', clientsRouter)
// Pròxims mòduls:
// app.use('/api/billing',  billingRouter)    // Mòdul 4

// ── Middleware d'errors centralitzat ────────────────────────────────
app.use(errorHandler)

// ── Arrencada ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`[backend] Port ${PORT} — ${process.env.NODE_ENV || 'development'}`)
})

export default app
