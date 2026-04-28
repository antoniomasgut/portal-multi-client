import { prisma } from '../db'

export const serviceActivationService = {
  async toggleActive(clientId: string, serviceId: string, active: boolean) {
    const subscription = await prisma.subscription.findFirst({
      where:   { clientId, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      const err: any = new Error('Subscripció no trobada')
      err.status = 404
      throw err
    }

    const existing = await prisma.subscriptionService.findUnique({
      where: { subscriptionId_serviceId: { subscriptionId: subscription.id, serviceId } },
    })

    if (!existing) {
      const err: any = new Error('Servei no contractat')
      err.status = 404
      throw err
    }

    return prisma.subscriptionService.update({
      where: { subscriptionId_serviceId: { subscriptionId: subscription.id, serviceId } },
      data:  {
        active,
        activatedAt: active && !existing.activatedAt ? new Date() : existing.activatedAt,
      },
      include: { service: true },
    })
  }
}
