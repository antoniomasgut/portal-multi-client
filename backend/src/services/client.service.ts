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
    companyName:        string
    contactName:        string
    contactEmail:       string
    contactPhone?:      string
    nif?:               string
    address?:           string
    domain?:            string
    notes?:             string
    planId?:            string
    isCustom?:          boolean
    customPriceMonthly?: number
    customFeatures?:    string[]
  }) {
    const { planId, isCustom, customPriceMonthly, customFeatures, ...clientData } = data
    const hasPlan = planId || isCustom
    const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return prisma.client.create({
      data: {
        ...clientData,
        ...(hasPlan && {
          subscriptions: {
            create: {
              planId:             isCustom ? null : planId,
              status:             'ACTIVE',
              renewsAt,
              isCustom:           isCustom ?? false,
              customPriceMonthly: customPriceMonthly,
              customFeatures:     customFeatures ?? [],
            },
          },
        }),
      },
      include: { subscriptions: { include: { plan: true } } },
    })
  },

  async update(id: string, data: Partial<{
    companyName:        string
    contactName:        string
    contactEmail:       string
    contactPhone:       string
    nif:                string
    address:            string
    domain:             string
    notes:              string
    planId:             string
    isCustom:           boolean
    customPriceMonthly: number
    customFeatures:     string[]
  }>) {
    const { planId, isCustom, customPriceMonthly, customFeatures, ...clientData } = data
    const changingPlan = planId || isCustom
    if (changingPlan) {
      await clientService.assignPlan(id, { planId, isCustom, customPriceMonthly, customFeatures })
    }
    return prisma.client.update({
      where:   { id },
      data:    clientData,
      include: { subscriptions: { where: { status: 'ACTIVE' }, include: { plan: true } } },
    })
  },

  async softDelete(id: string) {
    return prisma.client.update({
      where: { id },
      data:  { deletedAt: new Date() },
    })
  },

  async assignPlan(clientId: string, opts: {
    planId?:             string
    isCustom?:           boolean
    customPriceMonthly?: number
    customFeatures?:     string[]
  }) {
    // Cancel·lar subscripció activa anterior
    await prisma.subscription.updateMany({
      where: { clientId, status: 'ACTIVE' },
      data:  { status: 'CANCELLED', cancelledAt: new Date() },
    })
    const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    return prisma.subscription.create({
      data: {
        clientId,
        planId:             opts.isCustom ? null : opts.planId,
        status:             'ACTIVE',
        renewsAt,
        isCustom:           opts.isCustom ?? false,
        customPriceMonthly: opts.customPriceMonthly,
        customFeatures:     opts.customFeatures ?? [],
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
