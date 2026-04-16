import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { landingService } from '../services/landing.service'

const upsertSchema = z.object({
  title:        z.string().min(2).max(100),
  subtitle:     z.string().max(200).optional(),
  description:  z.string().max(1000).optional(),
  ctaText:      z.string().max(50).optional(),
  ctaUrl:       z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  published:    z.boolean().optional(),
})

export const getLanding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landing = await landingService.getByClientId(req.params.id)
    res.json({ success: true, message: 'OK', data: landing })
  } catch (err) { next(err) }
}

export const upsertLanding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body    = upsertSchema.parse(req.body)
    const landing = await landingService.upsert(req.params.id, body)
    res.json({ success: true, message: 'Landing desada', data: landing })
  } catch (err) { next(err) }
}

export const publishLanding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landing = await landingService.publish(req.params.id)
    res.json({ success: true, message: 'Landing publicada', data: landing })
  } catch (err) { next(err) }
}

export const unpublishLanding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landing = await landingService.unpublish(req.params.id)
    res.json({ success: true, message: 'Landing despublicada', data: landing })
  } catch (err) { next(err) }
}

/** Ruta pública: /api/landing/:slug */
export const getPublicLanding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landing = await landingService.getBySlug(req.params.slug)
    if (!landing) return res.status(404).json({ success: false, message: 'Landing no trobada', data: null })
    res.json({ success: true, message: 'OK', data: landing })
  } catch (err) { next(err) }
}
