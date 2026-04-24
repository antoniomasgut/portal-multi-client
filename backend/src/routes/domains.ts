import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  listDomains,
  addDomain,
  verifyDomain,
  removeDomain,
  getDomainInstructions,
  listAllDomains,
} from '../controllers/domain.controller'

const router = Router()

// Vista global admin
router.get('/domains', requireAuth, requireRole('ADMIN'), listAllDomains)

// Per client
router.get('/:id/domains',                          requireAuth, listDomains)
router.post('/:id/domains',                         requireAuth, requireRole('ADMIN'), addDomain)
router.post('/:id/domains/:domainId/verify',        requireAuth, requireRole('ADMIN'), verifyDomain)
router.get('/:id/domains/:domainId/instructions',   requireAuth, getDomainInstructions)
router.delete('/:id/domains/:domainId',             requireAuth, requireRole('ADMIN'), removeDomain)

export default router
