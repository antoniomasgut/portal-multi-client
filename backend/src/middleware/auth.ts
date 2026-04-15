import { Request, Response, NextFunction } from 'express'
import { verifyAccess } from '../utils/jwt'

// Extenem el tipus Request per incloure l'usuari autenticat
declare global {
  namespace Express {
    interface Request {
      user?: { userId: string; role: string; clientId: string | null }
    }
  }
}

/** Verifica el JWT i afegeix req.user */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Token no proporcionat', data: null })
  }
  try {
    const token = authHeader.split(' ')[1]
    req.user = verifyAccess(token)
    next()
  } catch {
    return res.status(401).json({ success: false, message: 'Token invàlid o expirat', data: null })
  }
}

/** Verifica que l'usuari té el rol requerit */
export const requireRole = (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Accés no autoritzat', data: null })
    }
    next()
  }

/** CLIENT només pot accedir als seus propis recursos */
export const requireOwnClient = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'No autenticat', data: null })
  }
  if (req.user.role === 'ADMIN') return next()

  const resourceClientId = req.params.clientId || req.params.id
  if (req.user.clientId !== resourceClientId) {
    return res.status(403).json({ success: false, message: 'Accés no autoritzat', data: null })
  }
  next()
}
