import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import * as ctrl from '../controllers/plan.controller'

const router = Router()

// Lectura pública (autenticats)
router.get('/', requireAuth, ctrl.listPlans)
router.get('/:id', requireAuth, ctrl.getPlan)

// Gestió de plans (només admin)
router.post  ('/',    requireAuth, requireRole('ADMIN'), ctrl.createPlan)
router.put   ('/:id', requireAuth, requireRole('ADMIN'), ctrl.updatePlan)
router.delete('/:id', requireAuth, requireRole('ADMIN'), ctrl.deletePlan)

export default router
