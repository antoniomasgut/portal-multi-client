import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { prisma } from '../db'

const toggleSchema = z.object({
  active: z.boolean(),
})

/** PATCH /api/clients/:clientId/services/:serviceId/active */
export const toggleServiceActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId, serviceId } = req.params
    const { active } = toggleSchema.parse(req.body)

    // Trobar la subscripció activa del client
    const subscription = await prisma.subscription.findFirst({
      where:   { clientId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscripció no trobada', data: null })
    }

    // Verificar que el servei pertany a la subscripció
    const existing = await prisma.subscriptionService.findUnique({
      where: { subscriptionId_serviceId: { subscriptionId: subscription.id, serviceId } },
    })

    if (!existing) {
      return res.status(404).json({ success: false, message: 'Servei no contractat', data: null })
    }

    const updated = await prisma.subscriptionService.update({
      where: { subscriptionId_serviceId: { subscriptionId: subscription.id, serviceId } },
      data:  {
        active,
        activatedAt: active && !existing.activatedAt ? new Date() : existing.activatedAt,
      },
      include: { service: true },
    })

    res.json({
      success: true,
      message: active ? 'Servei activat' : 'Servei desactivat',
      data:    updated,
    })
  } catch (err) { next(err) }
}
