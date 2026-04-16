import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import * as ctrl from '../controllers/credential.controller'

const router = Router({ mergeParams: true })

router.get('/',              requireAuth, requireRole('ADMIN'), ctrl.listCredentials)
router.post('/',             requireAuth, requireRole('ADMIN'), ctrl.setCredential)
router.delete('/:credId',   requireAuth, requireRole('ADMIN'), ctrl.deleteCredential)

export default router
