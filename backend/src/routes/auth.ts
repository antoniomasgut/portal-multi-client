import { Router } from 'express'
import { requireAuth } from '../middleware/auth'
import { loginLimiter, magicLinkLimiter } from '../middleware/rateLimiter'
import * as ctrl from '../controllers/auth.controller'

const router = Router()

router.post('/login',              loginLimiter,      ctrl.login)
router.post('/refresh',                               ctrl.refresh)
router.post('/logout',             requireAuth,       ctrl.logout)
router.get('/me',                  requireAuth,       ctrl.me)
router.post('/magic-link',         magicLinkLimiter,  ctrl.requestMagicLink)
router.get('/magic-link/:token',                      ctrl.verifyMagicLink)

export default router
