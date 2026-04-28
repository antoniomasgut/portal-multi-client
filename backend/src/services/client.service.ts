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
  async list(params: { search?: string; sortBy?: string; sortDir?: 'asc' | 'desc' } = {}) {
    const { search, sortBy = 'createdAt', sortDir = 'desc' } = params
    
    return prisma.client.findMany({
      where: {
        deletedAt: null,
        ...(search && {
          OR: [
            { companyName:  { contains: search, mode: 'insensitive' } },
            { contactName:  { contains: search, mode: 'insensitive' } },
            { contactEmail: { contains: search, mode: 'insensitive' } },
            { domain:       { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        subscriptions: {
          where:   { status: 'ACTIVE' },
          include: SUBSCRIPTION_INCLUDE,
          take:    1,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { users: true } },
      },
      orderBy: (sortBy === 'users' 
        ? { users: { _count: sortDir } } 
        : { [sortBy]: sortDir }) as any,
    })
  },

  async findById(id: string) {
    return prisma.client.findFirst({
      where:   { id, deletedAt: null },
      include: {
        subscriptions: {
          include: SUBSCRIPTION_INCLUDE,
          orderBy: { createdAt: 'desc' },
          take:    10,
        },
        users: {
          where:  { deletedAt: null },
          select: { id: true, email: true, role: true, lastLogin: true },
          take:   50,
        },
      },
    })
  },

  async create(data: {
    companyName:     string
    contactName:     string
    contactEmail:    string
    contactPhone?:   string
    nif?:            string
    address?:        string
    domain?:         string
    notes?:          string
    isTest?:         boolean
    planId?:         string
    isCustom?:       boolean
    priceMonthly?:   number
    priceSetup?:     number
    serviceIds?:     string[]
    extraServiceIds?: string[]
  }) {
    const { planId, isCustom, priceMonthly, priceSetup, serviceIds, extraServiceIds, ...rawData } = data
    const clientData = { ...rawData, domain: rawData.domain?.trim() || null }
    const hasPlan  = planId || isCustom
    const renewsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    return prisma.client.create({
      data: {
        ...clientData,
        ...(hasPlan && {
          subscriptions: {
            create: await buildSubscriptionData({
              planId, isCustom, priceMonthly, priceSetup,
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
    isCustom:        boolean
    priceMonthly:    number
    priceSetup:      number
    serviceIds:      string[]
    extraServiceIds: string[]
  }>) {
    const { planId, isCustom, priceMonthly, priceSetup, serviceIds, extraServiceIds, ...rawData } = data
    const clientData   = { ...rawData, domain: rawData.domain !== undefined ? (rawData.domain.trim() || null) : undefined }
    const changingPlan = planId || isCustom !== undefined
    if (changingPlan) {
      await clientService.assignPlan(id, { planId, isCustom, priceMonthly, priceSetup, serviceIds, extraServiceIds })
    }
    return prisma.client.update({
      where:   { id },
      data:    clientData,
      include: { subscriptions: { where: { status: 'ACTIVE' }, include: SUBSCRIPTION_INCLUDE } },
    })
  },

  async softDelete(id: string) {
    const now = new Date()
    await prisma.$transaction([
      prisma.subscription.updateMany({
        where: { clientId: id, status: 'ACTIVE' },
        data:  { status: 'CANCELLED', cancelledAt: now },
      }),
      prisma.user.updateMany({
        where: { clientId: id, deletedAt: null },
        data:  { deletedAt: now },
      }),
      prisma.clientAutomation.updateMany({
        where: { clientId: id, deletedAt: null },
        data:  { deletedAt: now, status: 'INACTIVE' },
      }),
      prisma.client.update({
        where: { id },
        data:  { deletedAt: now },
      }),
    ])
  },

  async assignPlan(clientId: string, opts: {
    planId?:         string
    isCustom?:       boolean
    priceMonthly?:   number
    priceSetup?:     number
    serviceIds?:     string[]
    extraServiceIds?: string[]
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
  planId?:         string
  isCustom?:       boolean
  priceMonthly?:   number   // preu final mensual (pot ser override)
  priceSetup?:     number   // preu final setup (pot ser override)
  serviceIds?:     string[]
  extraServiceIds?: string[]
  renewsAt:        Date
}) {
  const { planId, isCustom, serviceIds, extraServiceIds, renewsAt } = opts

  let subServices: { serviceId: string; isExtra: boolean }[] = []
  let calcMonthly = 0
  let calcSetup   = 0

  if (isCustom) {
    // Pla personalitzat: tots els serveis seleccionats
    const ids = serviceIds ?? []
    subServices = ids.map(serviceId => ({ serviceId, isExtra: false }))
    if (ids.length > 0) {
      const svcs = await prisma.service.findMany({ where: { id: { in: ids } } })
      calcMonthly = svcs.reduce((a, s) => a + Number(s.monthlyPrice), 0)
      calcSetup   = svcs.reduce((a, s) => a + Number(s.setupPrice),   0)
    }
  } else if (planId) {
    // Pla base: copiar serveis del pla
    const planServices = await prisma.planService.findMany({
      where:   { planId },
      include: { service: true },
    })
    subServices = planServices.map(ps => ({ serviceId: ps.serviceId, isExtra: false }))

    // Preu mensual base del pla
    const plan = await prisma.plan.findUnique({ where: { id: planId } })
    calcMonthly = Number(plan?.priceMonthly ?? 0)

    // Afegir serveis extra
    const extraIds = (extraServiceIds ?? []).filter(
      id => !subServices.some(s => s.serviceId === id)
    )
    if (extraIds.length > 0) {
      const extras = await prisma.service.findMany({ where: { id: { in: extraIds } } })
      calcMonthly += extras.reduce((a, s) => a + Number(s.monthlyPrice), 0)
      calcSetup    = extras.reduce((a, s) => a + Number(s.setupPrice),   0)
      subServices  = [...subServices, ...extraIds.map(serviceId => ({ serviceId, isExtra: true }))]
    }
  }

  return {
    planId:      isCustom ? null : planId,
    status:      'ACTIVE' as const,
    renewsAt,
    isCustom:    isCustom ?? false,
    // Usar preu de l'admin si l'ha modificat, si no el calculat
    priceMonthly: opts.priceMonthly ?? calcMonthly,
    priceSetup:   opts.priceSetup   ?? calcSetup,
    services:    { create: subServices },
  }
}

export const planService = {
  async list(params: { search?: string; sortBy?: string; sortDir?: 'asc' | 'desc' } = {}) {
    const { search, sortBy = 'priceMonthly', sortDir = 'asc' } = params

    return prisma.plan.findMany({
      where: {
        isActive: true,
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { slug: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        services: {
          include: { service: true },
          orderBy: { service: { name: 'asc' } } as any,
        },
      },
      orderBy: { [sortBy]: sortDir },
    })
  },

  async findById(id: string) {
    return prisma.plan.findUnique({
      where:   { id },
      include: {
        services: { include: { service: true } },
        _count:   { select: { subscriptions: true } },
      },
    })
  },

  async create(data: any) {
    return prisma.plan.create({
      data,
      include: { services: { include: { service: true } } },
    })
  },

  async update(id: string, data: any) {
    return prisma.plan.update({
      where:   { id },
      data,
      include: { services: { include: { service: true } } },
    })
  },

  async delete(id: string) {
    const plan = await this.findById(id)
    if (!plan) return
    if (plan._count.subscriptions > 0) {
      return prisma.plan.update({ where: { id }, data: { isActive: false } })
    }
    return prisma.plan.delete({ where: { id } })
  }
}

// ── ClientUsage ──────────────────────────────────────────────────────────
export const usageService = {
  async getOrCreate(clientId: string) {
    const existing = await prisma.clientUsage.findUnique({ where: { clientId } })
    if (existing) return existing
    const periodStart = new Date()
    const periodEnd   = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1)
    return prisma.clientUsage.create({
      data: { clientId, periodStart, periodEnd },
    })
  },

  async update(clientId: string, data: Partial<{
    conversationsUsed: number
    tokensUsed:        number
    automationsUsed:   number
    ragDocsUsed:       number
  }>) {
    return prisma.clientUsage.upsert({
      where:  { clientId },
      update: data,
      create: {
        clientId,
        periodStart: new Date(),
        periodEnd:   new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
        ...data,
      },
    })
  },

  async resetAll() {
    const periodStart = new Date()
    const periodEnd   = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 1)
    return prisma.clientUsage.updateMany({
      data: { conversationsUsed: 0, tokensUsed: 0, automationsUsed: 0, ragDocsUsed: 0, periodStart, periodEnd },
    })
  },
}

// ── Historial de plans ───────────────────────────────────────────────────
export async function getPlanHistory(clientId: string) {
  return prisma.planHistory.findMany({
    where:   { clientId },
    orderBy: { changedAt: 'desc' },
  })
}
