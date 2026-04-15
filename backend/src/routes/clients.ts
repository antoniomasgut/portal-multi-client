import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import * as ctrl from '../controllers/client.controller'

const router = Router()

// Plans (públic per a usuaris autenticats)
router.get('/plans', requireAuth, ctrl.listPlans)

// Clients (ADMIN only)
router.get('/',            requireAuth, requireRole('ADMIN'), ctrl.listClients)
router.get('/:id',         requireAuth, requireRole('ADMIN'), ctrl.getClient)
router.post('/',           requireAuth, requireRole('ADMIN'), ctrl.createClient)
router.patch('/:id',       requireAuth, requireRole('ADMIN'), ctrl.updateClient)
router.delete('/:id',      requireAuth, requireRole('ADMIN'), ctrl.deleteClient)
router.post('/:id/plan',   requireAuth, requireRole('ADMIN'), ctrl.assignPlan)

export default router
