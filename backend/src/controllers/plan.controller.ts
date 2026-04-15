import { Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../db'

const planSchema = z.object({
  name:         z.string().min(2),
  slug:         z.string().regex(/^[a-z0-9-]+$/),
  priceMonthly: z.number().min(0),
  maxDomains:   z.number().int().default(1),
  maxUsers:     z.number().int().default(1),
  maxConversations: z.number().int().nullable().optional(),
  maxTokens:        z.number().int().nullable().optional(),
  maxAutomations:   z.number().int().nullable().optional(),
  maxIntegrations:  z.number().int().nullable().optional(),
  maxRagDocuments:  z.number().int().nullable().optional(),
  hasLandingPro:   z.boolean().default(false),
  hasCustomDomain: z.boolean().default(false),
  hasRag:          z.boolean().default(false),
  hasTelegram:     z.boolean().default(false),
  extraConversationPrice: z.number().min(0).default(0.005),
  extraTokenPrice:        z.number().min(0).default(0.0001),
  isActive: z.boolean().default(true),
})

const PLAN_INCLUDE = {
  services: { include: { service: true } },
  _count:   { select: { subscriptions: true } },
}

export async function listPlans(req: Request, res: Response) {
  const plans = await prisma.plan.findMany({
    where:   { isActive: true },
    include: PLAN_INCLUDE,
    orderBy: { priceMonthly: 'asc' },
  })
  res.json({ success: true, message: 'OK', data: plans })
}

export async function getPlan(req: Request, res: Response) {
  const plan = await prisma.plan.findUnique({
    where:   { id: req.params.id },
    include: PLAN_INCLUDE,
  })
  if (!plan) { res.status(404).json({ success: false, message: 'Pla no trobat', data: null }); return }
  res.json({ success: true, message: 'OK', data: plan })
}

export async function createPlan(req: Request, res: Response) {
  const parsed = planSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Dades invàlides', data: parsed.error.flatten() })
    return
  }
  const plan = await prisma.plan.create({ data: parsed.data, include: PLAN_INCLUDE })
  res.status(201).json({ success: true, message: 'Pla creat', data: plan })
}

export async function updatePlan(req: Request, res: Response) {
  const parsed = planSchema.partial().safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ success: false, message: 'Dades invàlides', data: parsed.error.flatten() })
    return
  }
  const plan = await prisma.plan.update({
    where:   { id: req.params.id },
    data:    parsed.data,
    include: PLAN_INCLUDE,
  })
  res.json({ success: true, message: 'Pla actualitzat', data: plan })
}

export async function deletePlan(req: Request, res: Response) {
  const plan = await prisma.plan.findUnique({
    where:   { id: req.params.id },
    include: { _count: { select: { subscriptions: true } } },
  })
  if (!plan) { res.status(404).json({ success: false, message: 'Pla no trobat', data: null }); return }
  if (plan._count.subscriptions > 0) {
    // Soft-delete: desactivar en lloc d'eliminar si té subscripcions
    await prisma.plan.update({ where: { id: req.params.id }, data: { isActive: false } })
    res.json({ success: true, message: 'Pla desactivat (té subscripcions actives)', data: null })
    return
  }
  await prisma.plan.delete({ where: { id: req.params.id } })
  res.json({ success: true, message: 'Pla eliminat', data: null })
}
