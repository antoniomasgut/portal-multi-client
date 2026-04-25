import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { z } from 'zod'
import { generateLandingContent, generateWhatsAppBotContent } from '../services/ai-generate.service'

const router = Router()
const schema = z.object({
  companyName: z.string().min(1).max(120),
  sector:      z.string().min(1).max(120),
  lang:        z.string().default('ca'),
})

router.post('/:id/generate-landing', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { companyName, sector, lang } = schema.parse(req.body)
    const data = await generateLandingContent(req.params.id, companyName, sector, lang)
    res.json({ success: true, message: 'Contingut generat', data })
  } catch (err) { next(err) }
})

router.post('/:id/generate-whatsapp', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { companyName, sector, lang } = schema.parse(req.body)
    const data = await generateWhatsAppBotContent(req.params.id, companyName, sector, lang)
    res.json({ success: true, message: 'Config generada', data })
  } catch (err) { next(err) }
})

export default router
