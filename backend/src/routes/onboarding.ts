import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  getOnboardingProgress,
  listOnboardingProgress,
  triggerProcessPending,
} from '../controllers/onboarding.controller'

const router = Router()

router.use(requireAuth, requireRole('ADMIN'))

router.get('/',           listOnboardingProgress)
router.get('/process',    triggerProcessPending)
router.get('/:id',        getOnboardingProgress)

export default router
