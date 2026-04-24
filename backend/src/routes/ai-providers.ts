import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  listProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  getClientConfig,
  listAllProviders,
  getProviderModels,
} from '../controllers/ai-provider.controller'

const router = Router()

// Metadades (models disponibles per proveïdor) — públic per al frontend admin
router.get('/ai-providers/models', requireAuth, requireRole('ADMIN'), getProviderModels)

// Vista global admin
router.get('/ai-providers',        requireAuth, requireRole('ADMIN'), listAllProviders)

// Per client
router.get('/:id/ai-providers',              requireAuth, requireRole('ADMIN'), listProviders)
router.post('/:id/ai-providers',             requireAuth, requireRole('ADMIN'), createProvider)
router.patch('/:id/ai-providers/:providerId',requireAuth, requireRole('ADMIN'), updateProvider)
router.delete('/:id/ai-providers/:providerId',requireAuth, requireRole('ADMIN'), deleteProvider)

// Intern per al servei AI (no requereix JWT, protegit per X-Internal-Secret)
router.get('/:id/ai-providers/config',       getClientConfig)

export default router
