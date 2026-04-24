import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  logConsent,
  getConsents,
  requestExport,
  getExportStatus,
  downloadExport,
  anonymizeClient,
} from '../controllers/rgpd.controller'

const router = Router()

// Consentiments — el client pot gestionar els seus propis
router.post('/:id/consent',            requireAuth, logConsent)
router.get('/:id/consent',             requireAuth, getConsents)

// Exportació de dades — el client pot sol·licitar les seves dades
router.post('/:id/data-export',        requireAuth, requestExport)
router.get('/:id/data-export',         requireAuth, getExportStatus)
router.get('/:id/data-export/:exportId/download', requireAuth, downloadExport)

// Dret d'oblit — només admin
router.delete('/:id/anonymize',        requireAuth, requireRole('ADMIN'), anonymizeClient)

export default router
