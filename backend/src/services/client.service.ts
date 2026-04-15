import { prisma } from '../db'

const SUBSCRIPTION_INCLUDE = {
  plan: {
    include: {
      services: { include: { service: true } },
    },
  },
  services: {
    include: { service: true },
    orderBy: { service: { name: 'asc' } } as any,
  },
} as const

export const clientService = {
  async list() {
    return prisma.client.findMany({
      where:   { deletedAt: null },
      include: {
        subscriptions: {
          where:   { status: 'ACTIVE' },
          include: SUBSCRIPTION_INCLUDE,
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
        subscriptions: {
          include: SUBSCRIPTION_INCLUDE,
          orderBy: { createdAt: 'desc' },
        },
        users: {
          where:  { deletedAt: null },
          select: { id: true, email: true, role: true, lastLogin: true },
        },
      },
    })
  },

  async create(data: {
    companyName:         string
    contactName:         string
    contactEmail:        string
    contactPhone?:       string
    nif?:                string
    address?:            string
    domain?:             string
    notes?:              string
    planId?:             string
    isCustom?:           boolean
    customPriceMonthly?: number
    serviceIds?:         string[]
    extraServiceIds?:    string[]
  }) {
    const { planId, isCustom, customPriceMonthly, serviceIds, extraServiceIds, ...clientData } = data
    const hasPlan  = planId || isCustom
    const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    return prisma.client.create({
      data: {
        ...clientData,
        ...(hasPlan && {
          subscriptions: {
            create: await buildSubscriptionData({
              planId, isCustom, customPriceMonthly,
              serviceIds, extraServiceIds, renewsAt,
            }),
          },
        }),
      },
      include: { subscriptions: { include: SUBSCRIPTION_INCLUDE } },
    })
  },

  async update(id: string, data: Partial<{
    companyName:         string
    contactName:         string
    contactEmail:        string
    contactPhone:        string
    nif:                 string
    address:             string
    domain:              string
    notes:               string
    planId:              string
    isCustom:            boolean
    customPriceMonthly:  number
    serviceIds:          string[]
    extraServiceIds:     string[]
  }>) {
    const { planId, isCustom, customPriceMonthly, serviceIds, extraServiceIds, ...clientData } = data
    const changingPlan = planId || isCustom !== undefined
    if (changingPlan) {
      await clientService.assignPlan(id, { planId, isCustom, customPriceMonthly, serviceIds, extraServiceIds })
    }
    return prisma.client.update({
      where:   { id },
      data:    clientData,
      include: { subscriptions: { where: { status: 'ACTIVE' }, include: SUBSCRIPTION_INCLUDE } },
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
    serviceIds?:         string[]  // per pla personalitzat
    extraServiceIds?:    string[]  // serveis extra sobre pla base
  }) {
    await prisma.subscription.updateMany({
      where: { clientId, status: 'ACTIVE' },
      data:  { status: 'CANCELLED', cancelledAt: new Date() },
    })
    const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    const subData  = await buildSubscriptionData({ ...opts, renewsAt })

    return prisma.subscription.create({
      data:    { clientId, ...subData },
      include: SUBSCRIPTION_INCLUDE,
    })
  },
}

// ── Helper: construir dades de subscripció + SubscriptionService ──────
async function buildSubscriptionData(opts: {
  planId?:             string
  isCustom?:           boolean
  customPriceMonthly?: number
  serviceIds?:         string[]
  extraServiceIds?:    string[]
  renewsAt:            Date
}) {
  const { planId, isCustom, customPriceMonthly, serviceIds, extraServiceIds, renewsAt } = opts

  let subServices: { serviceId: string; isExtra: boolean }[] = []

  if (isCustom) {
    // Pla personalitzat: tots els serveis seleccionats
    subServices = (serviceIds ?? []).map(serviceId => ({ serviceId, isExtra: false }))
  } else if (planId) {
    // Pla base: copiar serveis del pla
    const planServices = await prisma.planService.findMany({ where: { planId } })
    subServices = planServices.map(ps => ({ serviceId: ps.serviceId, isExtra: false }))
    // Afegir serveis extra
    const extras = (extraServiceIds ?? []).filter(
      id => !subServices.some(s => s.serviceId === id)
    )
    subServices = [...subServices, ...extras.map(serviceId => ({ serviceId, isExtra: true }))]
  }

  return {
    planId:             isCustom ? null : planId,
    status:             'ACTIVE' as const,
    renewsAt,
    isCustom:           isCustom ?? false,
    customPriceMonthly: customPriceMonthly ?? null,
    services:           { create: subServices },
  }
}

export const planService = {
  async list() {
    return prisma.plan.findMany({
      where:   { isActive: true },
      include: {
        services: {
          include: { service: true },
          orderBy: { service: { name: 'asc' } } as any,
        },
      },
      orderBy: { priceMonthly: 'asc' },
    })
  },
}
