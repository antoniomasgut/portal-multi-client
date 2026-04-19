import { prisma } from '../db'

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base
  let i    = 1
  while (true) {
    const existing = await prisma.clientLanding.findUnique({ where: { slug } })
    if (!existing || existing.id === excludeId) return slug
    slug = `${base}-${i++}`
  }
}

export const landingService = {
  async getByClientId(clientId: string) {
    return prisma.clientLanding.findUnique({ where: { clientId } })
  },

  async getBySlug(slug: string) {
    return prisma.clientLanding.findUnique({
      where:   { slug, published: true },
      include: { client: { select: { companyName: true, domain: true } } },
    })
  },

  /** Per a previsualització admin — retorna la landing independentment de l'estat */
  async getBySlugAny(slug: string) {
    return prisma.clientLanding.findUnique({
      where:   { slug },
      include: { client: { select: { companyName: true, domain: true } } },
    })
  },

  async upsert(clientId: string, data: {
    title?:       string
    subtitle?:    string
    description?: string
    ctaText?:     string
    ctaUrl?:      string
    primaryColor?: string
    style?:        string
    fontPair?:     string
    logoUrl?:      string
    published?:   boolean
    logoGcsPath?: string
  }) {
    const existing = await prisma.clientLanding.findUnique({ where: { clientId } })
    const slug = existing?.slug
      ?? await uniqueSlug(toSlug(data.title || clientId), undefined)

    const publishedAt = data.published && !existing?.publishedAt ? new Date() : existing?.publishedAt

    return prisma.clientLanding.upsert({
      where:  { clientId },
      update: { ...data, publishedAt: data.published ? (publishedAt ?? new Date()) : existing?.publishedAt },
      create: {
        clientId,
        slug,
        title:        data.title ?? '',
        subtitle:     data.subtitle,
        description:  data.description,
        ctaText:      data.ctaText      ?? "Contacta'ns",
        ctaUrl:       data.ctaUrl,
        primaryColor: data.primaryColor ?? '#FF6B00',
        style:        data.style        ?? 'dark-tech',
        fontPair:     data.fontPair     ?? 'orbitron-rajdhani',
        logoUrl:      data.logoUrl      ?? null,
        published:    data.published    ?? false,
        logoGcsPath:  data.logoGcsPath,
        publishedAt:  data.published ? new Date() : null,
      },
    })
  },

  async publish(clientId: string) {
    return prisma.clientLanding.update({
      where: { clientId },
      data:  { published: true, publishedAt: new Date() },
    })
  },

  async unpublish(clientId: string) {
    return prisma.clientLanding.update({
      where: { clientId },
      data:  { published: false },
    })
  },
}
