import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { Prisma } from '@prisma/client'

const PRISMA_FIELD_LABELS: Record<string, string> = {
  contactEmail: 'email de contacte',
  email:        'email',
  slug:         'slug',
  domain:       'domini',
  token:        'token',
}

export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Errors de validació Zod → 400
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Dades invàlides',
      data: err.flatten().fieldErrors,
    })
  }

  // Errors Prisma coneguts → missatges llegibles
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[]) ?? []
      const label  = fields.map(f => PRISMA_FIELD_LABELS[f] ?? f).join(', ')
      return res.status(409).json({
        success: false,
        message: `Ja existeix un registre amb aquest ${label}`,
        data: null,
      })
    }
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Registre no trobat',
        data: null,
      })
    }
    // Altres errors Prisma coneguts
    console.error('[PRISMA]', err.code, err.message)
    return res.status(400).json({
      success: false,
      message: `Error de base de dades (${err.code})`,
      data: null,
    })
  }

  // Errors coneguts amb statusCode
  const status = err.status || err.statusCode || 500
  // 503 = servei no disponible (IA no conf.) → mostrar missatge; 500 = bug → ocultar
  const message = (status < 500 || status === 503) ? err.message : 'Error intern del servidor'

  if (status >= 500 && status !== 503) {
    console.error('[ERROR]', err)
  }

  res.status(status).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV === 'development' && status >= 500 && { stack: err.stack }),
  })
}
