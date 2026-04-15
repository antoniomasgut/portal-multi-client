import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import * as ctrl from '../controllers/service.controller'

const router = Router()

router.get('/',      requireAuth,                       ctrl.listServices)
router.post('/',     requireAuth, requireRole('ADMIN'), ctrl.createService)
router.patch('/:id', requireAuth, requireRole('ADMIN'), ctrl.updateService)
router.delete('/:id',requireAuth, requireRole('ADMIN'), ctrl.deleteService)

export default router
