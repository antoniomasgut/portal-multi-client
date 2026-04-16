import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import * as ctrl from '../controllers/invoice.controller'

const router = Router()

router.get('/stats',          requireAuth, requireRole('ADMIN'), ctrl.getStats)
router.get('/',               requireAuth, requireRole('ADMIN'), ctrl.listInvoices)
router.get('/:id',            requireAuth, requireRole('ADMIN'), ctrl.getInvoice)
router.post('/generate',      requireAuth, requireRole('ADMIN'), ctrl.generateInvoice)
router.patch('/:id/pay',      requireAuth, requireRole('ADMIN'), ctrl.markPaid)
router.patch('/:id/overdue',  requireAuth, requireRole('ADMIN'), ctrl.markOverdue)
router.patch('/:id/cancel',   requireAuth, requireRole('ADMIN'), ctrl.cancelInvoice)
router.post('/batch-overdue', requireAuth, requireRole('ADMIN'), ctrl.batchOverdue)
router.delete('/:id',         requireAuth, requireRole('ADMIN'), ctrl.deleteInvoice)

export default router
