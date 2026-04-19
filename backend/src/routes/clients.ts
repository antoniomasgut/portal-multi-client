import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import * as ctrl from '../controllers/client.controller'
import { toggleServiceActive } from '../controllers/serviceActivation.controller'
import credentialsRouter from './credentials'

const router = Router()

// Plans (públic per a usuaris autenticats)
router.get('/plans', requireAuth, ctrl.listPlans)

// Clients (ADMIN only)
router.get('/',                    requireAuth, requireRole('ADMIN'), ctrl.listClients)
router.get('/:id',                 requireAuth, requireRole('ADMIN'), ctrl.getClient)
router.post('/',                   requireAuth, requireRole('ADMIN'), ctrl.createClient)
router.patch('/:id',               requireAuth, requireRole('ADMIN'), ctrl.updateClient)
router.delete('/:id',              requireAuth, requireRole('ADMIN'), ctrl.deleteClient)
router.post('/:id/plan',           requireAuth, requireRole('ADMIN'), ctrl.assignPlan)

// Ús i historial
router.get('/:id/usage',           requireAuth, requireRole('ADMIN'), ctrl.getClientUsage)
router.patch('/:id/usage',         requireAuth, requireRole('ADMIN'), ctrl.updateClientUsage)
router.get('/:id/plan-history',    requireAuth, requireRole('ADMIN'), ctrl.getPlanHistoryCtrl)

// Impersonació (ADMIN accedeix com a client)
router.post('/:id/impersonate',    requireAuth, requireRole('ADMIN'), ctrl.impersonateClient)

// Activació de serveis
router.patch('/:clientId/services/:serviceId/active', requireAuth, requireRole('ADMIN'), toggleServiceActive)

// Credencials encriptades
router.use('/:id/credentials', credentialsRouter)

export default router
