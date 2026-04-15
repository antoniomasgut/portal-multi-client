import { Request, Response } from 'express'
import { z } from 'zod'
import * as svc from '../services/settings.service'

// ── Polítiques de descompte ──────────────────────────────────────────────
export async function listDiscountPolicies(req: Request, res: Response) {
  const data = await svc.getDiscountPolicies()
  res.json({ success: true, message: 'OK', data })
}

const updateDiscountSchema = z.object({
  isActive:       z.boolean().optional(),
  percentage:     z.number().min(0).max(100).nullable().optional(),
  monthsFree:     z.number().int().min(0).nullable().optional(),
  durationMonths: z.number().int().min(0).nullable().optional(),
  description:    z.string().nullable().optional(),
})

export async function updateDiscountPolicy(req: Request, res: Response) {
  const parsed = updateDiscountSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Dades invàlides', data: parsed.error.flatten() })
    return
  }
  const data = await svc.updateDiscountPolicy(req.params.id, parsed.data)
  res.json({ success: true, message: 'Política actualitzada', data })
}

export async function toggleDiscountPolicy(req: Request, res: Response) {
  const data = await svc.toggleDiscountPolicy(req.params.id)
  res.json({ success: true, message: `Política ${data.isActive ? 'activada' : 'desactivada'}`, data })
}

// ── Descompte manual ─────────────────────────────────────────────────────
const manualDiscountSchema = z.object({
  percentage: z.number().min(0).max(100).optional(),
  monthsFree: z.number().int().min(1).optional(),
  expiresAt:  z.string().datetime().optional(),
  reason:     z.string().optional(),
})

export async function applyManualDiscount(req: Request, res: Response) {
  const parsed = manualDiscountSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Dades invàlides', data: parsed.error.flatten() })
    return
  }
  const { clientId } = req.params
  const data = await svc.applyManualDiscount(clientId, {
    ...parsed.data,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
    appliedBy: req.user!.userId,
  })
  res.status(201).json({ success: true, message: 'Descompte aplicat', data })
}

export async function listClientDiscounts(req: Request, res: Response) {
  const data = await svc.listClientDiscounts(req.params.clientId)
  res.json({ success: true, message: 'OK', data })
}

// ── Política de preus ────────────────────────────────────────────────────
export async function getPricingPolicy(req: Request, res: Response) {
  const data = await svc.getPricingPolicy()
  res.json({ success: true, message: 'OK', data })
}

const pricingPolicySchema = z.object({
  minNoticeDays:         z.number().int().min(0).optional(),
  allowImmediateChange:  z.boolean().optional(),
  notifyClientsOnChange: z.boolean().optional(),
})

export async function updatePricingPolicy(req: Request, res: Response) {
  const parsed = pricingPolicySchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Dades invàlides', data: parsed.error.flatten() })
    return
  }
  const data = await svc.updatePricingPolicy({ ...parsed.data, updatedBy: req.user!.userId })
  res.json({ success: true, message: 'Política actualitzada', data })
}
