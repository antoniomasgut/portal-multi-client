import { Request, Response, NextFunction } from 'express'
import { clientService, planService } from '../services/client.service'
import { createClientSchema, updateClientSchema, assignPlanSchema } from '../schemas/client'
import { prisma } from '../db'

// ── Plans ────────────────────────────────────────────────────────────────

export const listPlans = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = await planService.list()
    res.json({ success: true, message: 'OK', data: plans })
  } catch (err) { next(err) }
}

// ── Clients ──────────────────────────────────────────────────────────────

export const listClients = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clients = await clientService.list()
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
        details:    { companyName: client.companyName },
      },
    })

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
        details:    body as any,
      },
    })

    res.json({ success: true, message: 'Client actualitzat', data: client })
  } catch (err) { next(err) }
}

export const deleteClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await clientService.softDelete(req.params.id)

    await prisma.auditLog.create({
      data: {
        userId:     req.user!.userId,
        action:     'CLIENT_DELETED',
        entityType: 'Client',
        entityId:   req.params.id,
        ip:         req.ip,
      },
    })

    res.json({ success: true, message: 'Client eliminat', data: null })
  } catch (err) { next(err) }
}

export const assignPlan = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { planId }      = assignPlanSchema.parse(req.body)
    const subscription    = await clientService.assignPlan(req.params.id, planId)

    await prisma.auditLog.create({
      data: {
        userId:     req.user!.userId,
        clientId:   req.params.id,
        action:     'PLAN_ASSIGNED',
        entityType: 'Subscription',
        entityId:   subscription.id,
        ip:         req.ip,
        details:    { planId },
      },
    })

    res.json({ success: true, message: 'Pla assignat', data: subscription })
  } catch (err) { next(err) }
}
