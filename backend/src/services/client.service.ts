import { prisma } from '../db'

export const clientService = {
  async list() {
    return prisma.client.findMany({
      where:   { deletedAt: null },
      include: {
        subscriptions: {
          where:   { status: 'ACTIVE' },
          include: { plan: true },
          take:    1,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { users: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
  },

  async findById(id: string) {
    return prisma.client.findFirst({
      where:   { id, deletedAt: null },
      include: {
        subscriptions: { include: { plan: true }, orderBy: { createdAt: 'desc' } },
        users: {
          where:  { deletedAt: null },
          select: { id: true, email: true, role: true, lastLogin: true },
        },
      },
    })
  },

  async create(data: {
    companyName: string
    contactName: string
    contactEmail: string
    contactPhone?: string
    nif?: string
    address?: string
    domain?: string
    notes?: string
    planId: string
  }) {
    const { planId, ...clientData } = data
    return prisma.client.create({
      data: {
        ...clientData,
        subscriptions: {
          create: {
            planId,
            status:   'ACTIVE',
            renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
      include: {
        subscriptions: { include: { plan: true } },
      },
    })
  },

  async update(id: string, data: Partial<{
    companyName: string
    contactName: string
    contactEmail: string
    contactPhone: string
    nif: string
    address: string
    domain: string
    notes: string
  }>) {
    return prisma.client.update({
      where: { id },
      data,
    })
  },

  async softDelete(id: string) {
    return prisma.client.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  },

  async assignPlan(clientId: string, planId: string) {
    // Cancel·lar subscripció activa anterior
    await prisma.subscription.updateMany({
      where: { clientId, status: 'ACTIVE' },
      data:  { status: 'CANCELLED', cancelledAt: new Date() },
    })
    // Crear nova subscripció
    return prisma.subscription.create({
      data: {
        clientId,
        planId,
        status:   'ACTIVE',
        renewsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      include: { plan: true },
    })
  },
}

export const planService = {
  async list() {
    return prisma.plan.findMany({
      where:   { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    })
  },
}
