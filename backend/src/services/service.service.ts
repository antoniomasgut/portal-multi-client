import { prisma } from '../db'
import { ServiceCategory } from '@prisma/client'

const WITH_PLANS = {
  planServices: {
    include: { plan: { select: { id: true, name: true, slug: true } } },
  },
} as const

export const serviceService = {
  /** Llista serveis actius — per a clients i selectors de plans */
  async list() {
    return prisma.service.findMany({
      where:   { isActive: true },
      include: WITH_PLANS,
      orderBy: { name: 'asc' },
    })
  },

  /** Llista tots els serveis (actius + inactius) — per a la pàgina d'admin */
  async listAll() {
    return prisma.service.findMany({
      include: WITH_PLANS,
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
  },

  async create(data: {
    name:          string
    slug:          string
    description?:  string
    category?:     ServiceCategory
    setupPrice?:   number
    monthlyPrice?: number
  }) {
    return prisma.service.create({ data, include: WITH_PLANS })
  },

  async update(id: string, data: Partial<{
    name:         string
    slug:         string
    description:  string
    category:     ServiceCategory
    setupPrice:   number
    monthlyPrice: number
    isActive:     boolean
  }>) {
    return prisma.service.update({ where: { id }, data, include: WITH_PLANS })
  },

  /** Soft-delete: desactiva el servei. Si té subscripcions actives no el pot eliminar físicament. */
  async delete(id: string) {
    const inUse = await prisma.subscriptionService.count({
      where: {
        serviceId: id,
        subscription: { status: 'ACTIVE' },
      },
    })
    if (inUse > 0) {
      return prisma.service.update({ where: { id }, data: { isActive: false } })
    }
    return prisma.service.delete({ where: { id } })
  },

  async toggle(id: string) {
    const svc = await prisma.service.findUniqueOrThrow({ where: { id }, select: { isActive: true } })
    return prisma.service.update({
      where:   { id },
      data:    { isActive: !svc.isActive },
      include: WITH_PLANS,
    })
  },
}
