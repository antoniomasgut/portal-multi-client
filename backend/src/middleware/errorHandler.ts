import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

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

  // Errors coneguts amb statusCode
  const status = err.status || err.statusCode || 500
  const message = status < 500 ? err.message : 'Error intern del servidor'

  if (status >= 500) {
    console.error('[ERROR]', err)
  }

  res.status(status).json({
    success: false,
    message,
    data: null,
    ...(process.env.NODE_ENV === 'development' && status >= 500 && { stack: err.stack }),
  })
}
