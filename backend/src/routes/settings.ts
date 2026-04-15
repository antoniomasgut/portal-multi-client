import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import * as ctrl from '../controllers/settings.controller'

const router = Router()

router.use(requireAuth, requireRole('ADMIN'))

// ── Polítiques de descompte ──────────────────────────────────────────
router.get ('/discount-policies',            ctrl.listDiscountPolicies)
router.put ('/discount-policies/:id',        ctrl.updateDiscountPolicy)
router.patch('/discount-policies/:id/toggle', ctrl.toggleDiscountPolicy)

// ── Descompte manual per client ──────────────────────────────────────
router.post('/discount-policies/:clientId/manual', ctrl.applyManualDiscount)
router.get ('/clients/:clientId/discounts',         ctrl.listClientDiscounts)

// ── Política de preus ────────────────────────────────────────────────
router.get('/pricing-policy', ctrl.getPricingPolicy)
router.put('/pricing-policy', ctrl.updatePricingPolicy)

export default router
