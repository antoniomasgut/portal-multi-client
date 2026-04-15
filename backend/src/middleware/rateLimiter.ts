import rateLimit from 'express-rate-limit'

// Rate limiter global (ja aplicat a index.ts)
export const globalLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000,
  max:      Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Massa peticions. Torna-ho a provar en un minut.' },
})

// Rate limiter estricte per al login
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      Number(process.env.RATE_LIMIT_LOGIN_MAX) || 5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Massa intents de login. Torna-ho a provar en 15 minuts.' },
  skipSuccessfulRequests: true,
})

// Rate limiter per a magic links
export const magicLinkLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max:      5,
  message: { success: false, message: 'Massa sol·licituds de link màgic. Torna-ho a provar en 1 hora.' },
})
