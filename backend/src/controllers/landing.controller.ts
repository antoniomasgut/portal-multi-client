import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { landingService } from '../services/landing.service'

const upsertSchema = z.object({
  title:        z.string().max(100).optional().or(z.literal('')),
  subtitle:     z.string().max(200).optional(),
  description:  z.string().max(5000).optional(),
  ctaText:      z.string().max(50).optional(),
  ctaUrl:       z.string().url().optional().or(z.literal('')),
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  style:        z.enum(['dark-tech', 'minimal-light', 'gradient-hero', 'split-layout']).optional(),
  fontPair:     z.enum(['orbitron-rajdhani', 'poppins-poppins', 'playfair-merriweather', 'merriweather-poppins', 'mono-rajdhani']).optional(),
  logoUrl:      z.string().max(2_000_000).optional().or(z.literal('')), // URL, base64 o buit
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
    console.log('[upsertLanding] fontPair:', req.body.fontPair, '| subtitle:', req.body.subtitle?.slice?.(0,30))
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

/** Ruta pública: /api/landing/public/:slug — només published */
export const getPublicLanding = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landing = await landingService.getBySlug(req.params.slug)
    if (!landing) return res.status(404).json({ success: false, message: 'Landing no trobada', data: null })
    res.json({ success: true, message: 'OK', data: landing })
  } catch (err) { next(err) }
}

/** Ruta admin: /api/landing/preview/:slug — qualsevol estat (per a previsualització) */
export const getAdminPreview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const landing = await landingService.getBySlugAny(req.params.slug)
    if (!landing) return res.status(404).json({ success: false, message: 'Landing no trobada', data: null })
    res.json({ success: true, message: 'OK', data: landing })
  } catch (err) { next(err) }
}
