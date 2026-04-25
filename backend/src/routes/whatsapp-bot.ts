import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import { z } from 'zod'
import { prisma } from '../db'
import { generateWhatsAppBotContent } from '../services/ai-generate.service'

const router  = Router()

const faqSchema = z.object({ q: z.string(), a: z.string() })
const schema    = z.object({
  botName:       z.string().min(1).max(80).optional(),
  greeting:      z.string().max(500).optional(),
  tone:          z.enum(['professional', 'amable', 'informal']).optional(),
  businessHours: z.string().max(200).optional().nullable(),
  faqs:          z.array(faqSchema).max(20).optional(),
  isActive:      z.boolean().optional(),
})

router.get('/:id/whatsapp-bot', requireAuth, async (req, res, next) => {
  try {
    const cfg = await prisma.whatsAppBotConfig.findUnique({ where: { clientId: req.params.id } })
    res.json({ success: true, message: 'OK', data: cfg })
  } catch (err) { next(err) }
})

router.put('/:id/whatsapp-bot', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const body = schema.parse(req.body)
    const cfg  = await prisma.whatsAppBotConfig.upsert({
      where:  { clientId: req.params.id },
      update: body as any,
      create: { clientId: req.params.id, greeting: '', ...body } as any,
    })
    res.json({ success: true, message: 'Config desada', data: cfg })
  } catch (err) { next(err) }
})

router.post('/:id/whatsapp-bot/generate', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const { companyName, sector, lang } = z.object({
      companyName: z.string(), sector: z.string(), lang: z.string().default('ca'),
    }).parse(req.body)
    const data = await generateWhatsAppBotContent(req.params.id, companyName, sector, lang)
    res.json({ success: true, message: 'Config generada', data })
  } catch (err) { next(err) }
})

export default router
