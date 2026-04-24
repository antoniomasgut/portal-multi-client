import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  triggerAdminWeekly,
  triggerClientMonthly,
  triggerAllClientMonthly,
} from '../controllers/reporting.controller'

const router = Router()

router.use(requireAuth, requireRole('ADMIN'))

router.post('/admin/weekly',           triggerAdminWeekly)
router.post('/clients/monthly',        triggerAllClientMonthly)
router.post('/clients/:id/monthly',    triggerClientMonthly)

export default router
