import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import * as ctrl from '../controllers/landing.controller'

const router = Router()

// Ruta pública — sense auth
router.get('/public/:slug', ctrl.getPublicLanding)

// Rutes admin
router.get('/:id',            requireAuth, requireRole('ADMIN'), ctrl.getLanding)
router.put('/:id',            requireAuth, requireRole('ADMIN'), ctrl.upsertLanding)
router.patch('/:id/publish',  requireAuth, requireRole('ADMIN'), ctrl.publishLanding)
router.patch('/:id/unpublish',requireAuth, requireRole('ADMIN'), ctrl.unpublishLanding)

export default router
