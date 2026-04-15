import { prisma } from '../db'

// ── Polítiques de descompte ──────────────────────────────────────────────
export async function getDiscountPolicies() {
  return prisma.discountPolicy.findMany({ orderBy: { type: 'asc' } })
}

export async function updateDiscountPolicy(id: string, data: {
  isActive?:       boolean
  percentage?:     number | null
  monthsFree?:     number | null
  durationMonths?: number | null
  description?:    string | null
}) {
  return prisma.discountPolicy.update({ where: { id }, data })
}

export async function toggleDiscountPolicy(id: string) {
  const current = await prisma.discountPolicy.findUniqueOrThrow({ where: { id } })
  return prisma.discountPolicy.update({
    where: { id },
    data:  { isActive: !current.isActive },
  })
}

// ── Descompte manual per client ──────────────────────────────────────────
export async function applyManualDiscount(clientId: string, data: {
  percentage?:  number
  monthsFree?:  number
  expiresAt?:   Date
  reason?:      string
  appliedBy?:   string
}) {
  return prisma.clientDiscount.create({
    data: {
      clientId,
      type: 'MANUAL',
      percentage:  data.percentage  ?? null,
      monthsFree:  data.monthsFree  ?? null,
      expiresAt:   data.expiresAt   ?? null,
      reason:      data.reason      ?? null,
      appliedBy:   data.appliedBy   ?? null,
    },
  })
}

export async function listClientDiscounts(clientId: string) {
  return prisma.clientDiscount.findMany({
    where:   { clientId },
    orderBy: { appliedAt: 'desc' },
  })
}

// ── Política de preus ────────────────────────────────────────────────────
export async function getPricingPolicy() {
  const policy = await prisma.pricingPolicy.findFirst()
  if (!policy) {
    return prisma.pricingPolicy.create({
      data: { minNoticeDays: 30, allowImmediateChange: false, notifyClientsOnChange: true },
    })
  }
  return policy
}

export async function updatePricingPolicy(data: {
  minNoticeDays?:         number
  allowImmediateChange?:  boolean
  notifyClientsOnChange?: boolean
  updatedBy?:             string
}) {
  const policy = await getPricingPolicy()
  return prisma.pricingPolicy.update({ where: { id: policy.id }, data })
}
