import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import {
  listTemplates,
  listAllTemplates,
  listTemplatesWithUsage,
  createTemplate,
  updateTemplate,
  toggleTemplateActive,
  testTemplateN8n,
  listClientAutomations,
  createClientAutomation,
  toggleClientAutomation,
  deleteClientAutomation,
  listAutomationExecutions,
  n8nWebhook,
} from '../controllers/automation.controller'

const router = Router()

// ── Templates (admin) ──────────────────────────────────────────────────
router.get('/templates',                        requireAuth, requireRole('ADMIN'), listTemplates)
router.get('/templates/all',                    requireAuth, requireRole('ADMIN'), listAllTemplates)
router.get('/templates/usage',                  requireAuth, requireRole('ADMIN'), listTemplatesWithUsage)
router.post('/templates',                       requireAuth, requireRole('ADMIN'), createTemplate)
router.patch('/templates/:templateId',          requireAuth, requireRole('ADMIN'), updateTemplate)
router.patch('/templates/:templateId/active',   requireAuth, requireRole('ADMIN'), toggleTemplateActive)
router.post('/templates/:templateId/test',      requireAuth, requireRole('ADMIN'), testTemplateN8n)

// ── Per client (admin veu tots, client veu els seus) ───────────────────
router.get('/:id/automations',
  requireAuth,
  listClientAutomations
)

router.post('/:id/automations',
  requireAuth, requireRole('ADMIN'),
  createClientAutomation
)

router.patch('/:id/automations/:autoId/toggle',
  requireAuth,
  toggleClientAutomation
)

router.delete('/:id/automations/:autoId',
  requireAuth, requireRole('ADMIN'),
  deleteClientAutomation
)

router.get('/:id/automations/:autoId/executions',
  requireAuth,
  listAutomationExecutions
)

// ── Webhook n8n (sense auth, protegit per secret) ─────────────────────
router.post('/webhook/execution', n8nWebhook)

export default router
