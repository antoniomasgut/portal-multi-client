/**
 * M5 — Portal del client
 * Endpoints per al dashboard client-facing (rol CLIENT)
 */
import { Router, Request, Response, NextFunction } from 'express'
import { requireAuth, requireOwnClient } from '../middleware/auth'
import { prisma } from '../db'
import { usageService } from '../services/client.service'

const router = Router()

/** Dashboard: subscripció activa + serveis + ús */
router.get('/dashboard', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId
    if (!clientId) return res.status(403).json({ success: false, message: 'No ets un client', data: null })

    const [client, usage] = await Promise.all([
      prisma.client.findFirst({
        where:   { id: clientId, deletedAt: null },
        include: {
          subscriptions: {
            where:   { status: 'ACTIVE' },
            include: {
              plan:     { select: { name: true, slug: true, maxConversations: true, maxTokens: true, maxAutomations: true } },
              services: { include: { service: { select: { name: true, slug: true } } } },
            },
            take: 1,
          },
        },
      }),
      usageService.getOrCreate(clientId),
    ])

    if (!client) return res.status(404).json({ success: false, message: 'Client no trobat', data: null })

    const sub = client.subscriptions[0] ?? null

    res.json({
      success: true,
      message: 'OK',
      data: {
        client: {
          id:           client.id,
          companyName:  client.companyName,
          domain:       client.domain,
          isTest:       client.isTest,
        },
        subscription: sub ? {
          status:       sub.status,
          planName:     sub.isCustom ? 'Personalitzat' : sub.plan?.name,
          planSlug:     sub.plan?.slug ?? 'custom',
          priceMonthly: sub.priceMonthly,
          renewsAt:     sub.renewsAt,
          services:     sub.services.map(ss => ({ name: ss.service.name, slug: ss.service.slug, isExtra: ss.isExtra })),
          limits: sub.plan ? {
            maxConversations: sub.plan.maxConversations,
            maxTokens:        sub.plan.maxTokens,
            maxAutomations:   sub.plan.maxAutomations,
          } : null,
        } : null,
        usage: {
          conversationsUsed: usage.conversationsUsed,
          tokensUsed:        usage.tokensUsed,
          automationsUsed:   usage.automationsUsed,
          periodStart:       usage.periodStart,
          periodEnd:         usage.periodEnd,
        },
      },
    })
  } catch (err) { next(err) }
})

/** Factures del client */
router.get('/invoices', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clientId = req.user!.clientId
    if (!clientId) return res.status(403).json({ success: false, message: 'No ets un client', data: null })

    const invoices = await prisma.invoice.findMany({
      where:   { clientId, deletedAt: null },
      select:  { id: true, number: true, status: true, issueDate: true, dueDate: true, total: true, paidAt: true },
      orderBy: { issueDate: 'desc' },
    })
    res.json({ success: true, message: 'OK', data: invoices })
  } catch (err) { next(err) }
})

export default router
