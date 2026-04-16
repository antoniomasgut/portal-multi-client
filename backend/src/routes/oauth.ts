import { Router, Request, Response, NextFunction } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { oauthService } from '../services/oauth.service'

const router = Router()

/** Inicia el flux OAuth → retorna la URL d'autorització */
router.post('/:provider/start', requireAuth, requireRole('ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { clientId } = req.body
      if (!clientId) return res.status(400).json({ success: false, message: 'clientId requerit', data: null })
      const url = await oauthService.startFlow(clientId, req.params.provider)
      res.json({ success: true, message: 'URL generada', data: { url } })
    } catch (err) { next(err) }
  }
)

/** Callback del proveïdor OAuth (ha d'estar registrat a la consola del proveïdor) */
router.get('/:provider/callback',
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code, state, error } = req.query as Record<string, string>
      const frontendBase = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'

      if (error || !code || !state) {
        return res.redirect(`${frontendBase}/admin/clients?oauth=error&reason=${error || 'missing_params'}`)
      }

      const { clientId } = await oauthService.handleCallback(req.params.provider, code, state)
      res.redirect(`${frontendBase}/admin/clients?oauth=success&provider=${req.params.provider}&clientId=${clientId}`)
    } catch (err) { next(err) }
  }
)

/** Estat de connexió dels serveis d'un client */
router.get('/status/:clientId', requireAuth, requireRole('ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = await oauthService.getConnectionStatus(req.params.clientId)
      res.json({ success: true, message: 'OK', data: status })
    } catch (err) { next(err) }
  }
)

/** Desconnectar un servei */
router.delete('/:provider/disconnect/:clientId', requireAuth, requireRole('ADMIN'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await oauthService.disconnect(req.params.clientId, req.params.provider)
      res.json({ success: true, message: 'Servei desconnectat', data: null })
    } catch (err) { next(err) }
  }
)

export default router
