import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as automationService from '../services/automation.service'

const createSchema = z.object({ templateId: z.string().uuid() })
const toggleSchema = z.object({ active: z.boolean() })
const createTemplateSchema = z.object({
  name:         z.string().min(1).max(120),
  slug:         z.string().min(1).max(80),
  description:  z.string().max(500).default(''),
  category:     z.string().min(1).max(80),
  workflowJson: z.record(z.unknown()),
})
const updateTemplateSchema = z.object({
  name:        z.string().min(1).max(120).optional(),
  description: z.string().max(500).optional(),
  category:    z.string().max(80).optional(),
})
const webhookSchema = z.object({
  automationId:   z.string().uuid(),
  n8nExecutionId: z.string(),
  status:         z.enum(['SUCCESS', 'FAILED']),
  tokensUsed:     z.number().int().min(0).default(0),
  durationMs:     z.number().int().min(0).default(0),
  error:          z.string().optional(),
  secret:         z.string(),
})

// ── Templates ──────────────────────────────────────────────────────────

export const listTemplates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await automationService.listTemplates()
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const listAllTemplates = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await automationService.listAllTemplates()
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const listTemplatesWithUsage = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await automationService.listTemplatesWithUsage()
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const createTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createTemplateSchema.parse(req.body)
    const data = await automationService.createTemplate(body)
    res.status(201).json({ success: true, message: 'Template creat', data })
  } catch (err) { next(err) }
}

export const updateTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateTemplateSchema.parse(req.body)
    const data = await automationService.updateTemplate(req.params.templateId, body)
    res.json({ success: true, message: 'Template actualitzat', data })
  } catch (err) { next(err) }
}

export const toggleTemplateActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive } = z.object({ isActive: z.boolean() }).parse(req.body)
    const data = await automationService.toggleTemplate(req.params.templateId, isActive)
    res.json({ success: true, message: isActive ? 'Template activat' : 'Template desactivat', data })
  } catch (err) { next(err) }
}

export const testTemplateN8n = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await automationService.testTemplate(req.params.templateId)
    res.json({ success: result.ok, message: result.message, data: result })
  } catch (err) { next(err) }
}

// ── Automatitzacions per client ────────────────────────────────────────

export const listClientAutomations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await automationService.listByClient(req.params.id)
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const createClientAutomation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { templateId } = createSchema.parse(req.body)
    const data = await automationService.createAutomation(req.params.id, templateId, req.user!.userId)
    res.status(201).json({ success: true, message: 'Automatització creada', data })
  } catch (err) { next(err) }
}

export const toggleClientAutomation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { active } = toggleSchema.parse(req.body)
    const data = await automationService.toggleAutomation(req.params.autoId, active, req.user!.userId)
    res.json({ success: true, message: active ? 'Automatització activada' : 'Automatització pausada', data })
  } catch (err) { next(err) }
}

export const deleteClientAutomation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await automationService.deleteAutomation(req.params.autoId, req.user!.userId)
    res.json({ success: true, message: 'Automatització eliminada', data: null })
  } catch (err) { next(err) }
}

export const listAutomationExecutions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await automationService.listExecutions(req.params.autoId)
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

// ── Webhook des de n8n (registrar execució) ────────────────────────────

export const n8nWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = webhookSchema.parse(req.body)
    if (body.secret !== process.env.N8N_WEBHOOK_SECRET) {
      return res.status(401).json({ success: false, message: 'Secret invàlid', data: null })
    }
    await automationService.recordExecution(
      body.automationId,
      body.n8nExecutionId,
      body.status,
      body.tokensUsed,
      body.durationMs,
      body.error
    )
    res.json({ success: true, message: 'Execució registrada', data: null })
  } catch (err) { next(err) }
}
