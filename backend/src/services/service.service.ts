import { prisma } from '../db'

export const serviceService = {
  // Llista tots els serveis amb els plans que els inclouen
  async list() {
    return prisma.service.findMany({
      where:   { isActive: true },
      include: {
        planServices: {
          include: { plan: { select: { id: true, name: true, slug: true } } },
        },
      },
      orderBy: { name: 'asc' },
    })
  },

  async create(data: { name: string; slug: string; description?: string }) {
    return prisma.service.create({ data })
  },

  async update(id: string, data: Partial<{ name: string; slug: string; description: string }>) {
    return prisma.service.update({ where: { id }, data })
  },

  async delete(id: string) {
    return prisma.service.update({ where: { id }, data: { isActive: false } })
  },
}
