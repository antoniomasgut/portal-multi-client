import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { clientService, planService, usageService, getPlanHistory as fetchPlanHistory } from '../services/client.service'
import { createClientSchema, updateClientSchema, assignPlanSchema } from '../schemas/client'
import { prisma } from '../db'
import { signAccess } from '../utils/jwt'
import { sendNotification } from '../services/notifications'
import { startOnboarding } from '../services/onboarding.service'

// ── Plans ────────────────────────────────────────────────────────────────

export const listPlans = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await planService.list()
    res.json({ success: true, message: 'OK', data: plans })
  } catch (err) { next(err) }
}

// ── Clients ──────────────────────────────────────────────────────────────

export const listClients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { search, sortBy, sortDir } = req.query
    const clients = await clientService.list({ 
      search:  search  as string, 
      sortBy:  sortBy  as string, 
      sortDir: sortDir as 'asc' | 'desc'
    })
    res.json({ success: true, message: 'OK', data: clients })
  } catch (err) { next(err) }
}

export const getClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const client = await clientService.findById(req.params.id)
    if (!client) return res.status(404).json({ success: false, message: 'Client no trobat', data: null })
    res.json({ success: true, message: 'OK', data: client })
  } catch (err) { next(err) }
}

export const createClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body   = createClientSchema.parse(req.body)
    const client = await clientService.create(body)

    await prisma.auditLog.create({
      data: {
        userId:     req.user!.userId,
        clientId:   client.id,
        action:     'CLIENT_CREATED',
        entityType: 'Client',
        entityId:   client.id,
        ip:         req.ip,
        isTest:     client.isTest,
        details:    { companyName: client.companyName },
      },
    })

    // Email de benvinguda + inici onboarding (no bloquejar la resposta si falla)
    if (!client.isTest) {
      const activeSub = (client.subscriptions as any[])?.[0]
      const planName  = activeSub?.plan?.name ?? 'Bàsic'
      sendNotification({
        to:    client.contactEmail,
        event: 'WELCOME',
        lang:  client.language,
        data:  {
          name:      client.contactName,
          plan:      planName,
          portalUrl: process.env.PORTAL_URL ?? process.env.BASE_URL ?? '',
        },
      }).catch(err => console.error('[client] welcome email error:', err))

      startOnboarding(client.id, planName)
        .catch(err => console.error('[client] onboarding start error:', err))
    }

    res.status(201).json({ success: true, message: 'Client creat', data: client })
  } catch (err) { next(err) }
}

export const updateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body   = updateClientSchema.parse(req.body)
    const client = await clientService.update(req.params.id, body)

    await prisma.auditLog.create({
      data: {
        userId:     req.user!.userId,
        clientId:   req.params.id,
        action:     'CLIENT_UPDATED',
        entityType: 'Client',
        entityId:   req.params.id,
        ip:         req.ip,
        isTest:     client.isTest,
        details:    body as any,
      },
    })

    res.json({ success: true, message: 'Client actualitzat', data: client })
  } catch (err) { next(err) }
}

export const deleteClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const existing = await clientService.findById(req.params.id)
    await clientService.softDelete(req.params.id)

    await prisma.auditLog.create({
      data: {
        userId:     req.user!.userId,
        action:     'CLIENT_DELETED',
        entityType: 'Client',
        entityId:   req.params.id,
        ip:         req.ip,
        isTest:     existing?.isTest ?? false,
      },
    })

    res.json({ success: true, message: 'Client eliminat', data: null })
  } catch (err) { next(err) }
}

export const assignPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed       = assignPlanSchema.parse(req.body)
    const existing     = await clientService.findById(req.params.id)
    const subscription = await clientService.assignPlan(req.params.id, parsed)

    await prisma.auditLog.create({
      data: {
        userId:     req.user!.userId,
        clientId:   req.params.id,
        action:     'PLAN_ASSIGNED',
        entityType: 'Subscription',
        entityId:   subscription.id,
        ip:         req.ip,
        isTest:     existing?.isTest ?? false,
        details:    parsed as any,
      },
    })

    res.json({ success: true, message: 'Pla assignat', data: subscription })
  } catch (err) { next(err) }
}

// ── Ús del client ────────────────────────────────────────────────────────
export const getClientUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const usage = await usageService.getOrCreate(req.params.id)
    res.json({ success: true, message: 'OK', data: usage })
  } catch (err) { next(err) }
}

const updateUsageSchema = z.object({
  conversationsUsed: z.number().int().min(0).optional(),
  tokensUsed:        z.number().int().min(0).optional(),
  automationsUsed:   z.number().int().min(0).optional(),
  ragDocsUsed:       z.number().int().min(0).optional(),
})

export const updateClientUsage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsed = updateUsageSchema.safeParse(req.body)
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Dades invàlides', data: parsed.error.flatten() })
      return
    }
    const usage = await usageService.update(req.params.id, parsed.data)
    res.json({ success: true, message: 'Ús actualitzat', data: usage })
  } catch (err) { next(err) }
}

// ── Historial de plans ───────────────────────────────────────────────────
export const getPlanHistoryCtrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const history = await fetchPlanHistory(req.params.id)
    res.json({ success: true, message: 'OK', data: history })
  } catch (err) { next(err) }
}

// ── Impersonació ─────────────────────────────────────────────────────────
export const impersonateClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = req.params.id
    const user = await prisma.user.findFirst({
      where: { clientId, role: 'CLIENT', deletedAt: null },
    })
    if (!user) {
      const err: any = new Error('Aquest client no té cap usuari associat')
      err.status = 404
      throw err
    }
    const token = signAccess({ userId: user.id, role: user.role, clientId: user.clientId })
    res.json({ success: true, message: 'Token d\'impersonació generat', data: { accessToken: token, user: { id: user.id, email: user.email, role: user.role, clientId: user.clientId } } })
  } catch (err) { next(err) }
}
