import { prisma } from '../db'
import { Decimal } from '@prisma/client/runtime/library'

// ── Número de factura ─────────────────────────────────────────────────
async function nextInvoiceNumber(): Promise<string> {
  const year  = new Date().getFullYear()
  const count = await prisma.invoice.count({
    where: { number: { startsWith: `${year}-` } },
  })
  return `${year}-${String(count + 1).padStart(4, '0')}`
}

// ── Càlcul de descompte ───────────────────────────────────────────────
async function calcDiscount(clientId: string, subtotal: number): Promise<number> {
  const now = new Date()
  const activeDiscounts = await prisma.clientDiscount.findMany({
    where: {
      clientId,
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    },
  })
  if (activeDiscounts.length === 0) return 0

  // Agafar el major descompte (no acumular)
  const maxPct = Math.max(...activeDiscounts.map(d => Number(d.percentage ?? 0)))
  return Math.round(subtotal * (maxPct / 100) * 100) / 100
}

// ── Servei ────────────────────────────────────────────────────────────
export const invoiceService = {
  async list(filters?: { clientId?: string; status?: string }) {
    return prisma.invoice.findMany({
      where: {
        deletedAt: null,
        ...(filters?.clientId && { clientId: filters.clientId }),
        ...(filters?.status   && { status: filters.status as any }),
      },
      include: { client: { select: { companyName: true, contactEmail: true, nif: true, address: true } } },
      orderBy: { issueDate: 'desc' },
    })
  },

  async findById(id: string) {
    return prisma.invoice.findFirst({
      where:   { id, deletedAt: null },
      include: {
        client: { select: { companyName: true, contactEmail: true, contactName: true, nif: true, address: true, language: true, isTest: true } },
        items:  true,
      },
    })
  },

  /** Genera una factura a partir de la subscripció activa del client */
  async generate(clientId: string, opts?: { dueInDays?: number; notes?: string; taxRate?: number }) {
    const client = await prisma.client.findFirstOrThrow({
      where:   { id: clientId, deletedAt: null },
      include: {
        subscriptions: {
          where:   { status: 'ACTIVE' },
          include: { plan: true, services: { include: { service: true } } },
          take: 1,
        },
      },
    })

    const sub = client.subscriptions[0]
    if (!sub) throw Object.assign(new Error('El client no té cap subscripció activa'), { status: 400 })

    // Construir ítems
    const items: { description: string; quantity: number; unitPrice: number }[] = []

    if (sub.isCustom) {
      for (const ss of sub.services) {
        items.push({
          description: ss.service.name,
          quantity:    1,
          unitPrice:   Number(ss.service.monthlyPrice),
        })
      }
    } else if (sub.plan) {
      items.push({
        description: `Pla ${sub.plan.name} — quota mensual`,
        quantity:    1,
        unitPrice:   Number(sub.priceMonthly),
      })
      const extras = sub.services.filter(ss => ss.isExtra)
      for (const ss of extras) {
        items.push({
          description: `${ss.service.name} (addicional)`,
          quantity:    1,
          unitPrice:   Number(ss.service.monthlyPrice),
        })
      }
    }

    if (items.length === 0) throw Object.assign(new Error('No s\'han pogut generar ítems per a la factura'), { status: 400 })

    const subtotal    = items.reduce((a, i) => a + i.quantity * i.unitPrice, 0)
    const discountAmt = await calcDiscount(clientId, subtotal)
    const taxRate     = opts?.taxRate ?? 21
    const taxBase     = subtotal - discountAmt
    const taxAmt      = Math.round(taxBase * (taxRate / 100) * 100) / 100
    const total       = taxBase + taxAmt

    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + (opts?.dueInDays ?? 30))

    return prisma.invoice.create({
      data: {
        clientId,
        number:      await nextInvoiceNumber(),
        dueDate,
        subtotal:    new Decimal(subtotal),
        discountAmt: new Decimal(discountAmt),
        taxRate:     new Decimal(taxRate),
        taxAmt:      new Decimal(taxAmt),
        total:       new Decimal(total),
        notes:       opts?.notes,
        items: {
          create: items.map(i => ({
            description: i.description,
            quantity:    i.quantity,
            unitPrice:   new Decimal(i.unitPrice),
            total:       new Decimal(i.quantity * i.unitPrice),
          })),
        },
      },
      include: { items: true, client: { select: { contactEmail: true, contactName: true, language: true, isTest: true } } },
    })
  },

  async markPaid(id: string) {
    return prisma.invoice.update({
      where: { id, deletedAt: null },
      data:  { status: 'PAID', paidAt: new Date() },
    })
  },

  async markOverdue(id: string) {
    return prisma.invoice.update({
      where: { id, deletedAt: null },
      data:  { status: 'OVERDUE' },
    })
  },

  async cancel(id: string) {
    return prisma.invoice.update({
      where: { id, deletedAt: null },
      data:  { status: 'CANCELLED' },
    })
  },

  /** Marca com a vençudes les factures pendents amb dueDate anterior a ara */
  async batchMarkOverdue() {
    return prisma.invoice.updateMany({
      where:  { status: 'PENDING', dueDate: { lt: new Date() }, deletedAt: null },
      data:   { status: 'OVERDUE' },
    })
  },

  async softDelete(id: string) {
    return prisma.invoice.update({
      where: { id },
      data:  { deletedAt: new Date(), status: 'CANCELLED' },
    })
  },

  /** Estadístiques de facturació per al dashboard */
  async stats() {
    const now    = new Date()
    const y      = now.getFullYear()
    const m      = now.getMonth()
    const start  = new Date(y, m, 1)
    const end    = new Date(y, m + 1, 1)

    const [totalPaid, pendingCount, overdueCount, thisMonth] = await Promise.all([
      prisma.invoice.aggregate({
        where:  { status: 'PAID', deletedAt: null },
        _sum:   { total: true },
      }),
      prisma.invoice.count({ where: { status: 'PENDING', deletedAt: null } }),
      prisma.invoice.count({ where: { status: 'OVERDUE', deletedAt: null } }),
      prisma.invoice.aggregate({
        where:  { status: 'PAID', paidAt: { gte: start, lt: end }, deletedAt: null },
        _sum:   { total: true },
      }),
    ])

    return {
      totalPaid:    Number(totalPaid._sum.total ?? 0),
      pendingCount,
      overdueCount,
      thisMonth:    Number(thisMonth._sum.total ?? 0),
    }
  },
}
