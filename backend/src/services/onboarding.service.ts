import { prisma } from '../db'
import { sendNotification } from './notifications'
import type { NotificationEvent } from './notifications'

// ── Continguts per dia i idioma ────────────────────────────────────────

const DAY_EVENTS: Record<number, { accessed: NotificationEvent; notAccessed: NotificationEvent }> = {
  0:  { accessed: 'WELCOME',          notAccessed: 'WELCOME' },
  1:  { accessed: 'ONBOARDING_DAY1',  notAccessed: 'ONBOARDING_DAY1' },
  7:  { accessed: 'ONBOARDING_DAY7_ACTIVE', notAccessed: 'ONBOARDING_DAY7_INACTIVE' },
  15: { accessed: 'ONBOARDING_DAY15', notAccessed: 'ONBOARDING_DAY15' },
  30: { accessed: 'ONBOARDING_DAY30', notAccessed: 'ONBOARDING_DAY30' },
}

// ── Iniciar onboarding en crear client ─────────────────────────────────

export async function startOnboarding(clientId: string, planName: string) {
  const client = await prisma.client.findFirst({
    where:  { id: clientId, deletedAt: null, isTest: false },
    select: { contactEmail: true, contactName: true, language: true },
  })
  if (!client) return

  await prisma.onboardingProgress.upsert({
    where:  { clientId },
    update: {},
    create: { clientId },
  })

  // Email dia 0 — immediat
  await sendDay(clientId, 0, planName)
}

// ── Marcar que el client ha accedit al portal ─────────────────────────

export async function markAccessed(clientId: string) {
  await prisma.onboardingProgress.updateMany({
    where: { clientId },
    data:  { hasAccessed: true },
  })
}

// ── Processar tots els pendents (cridat per cron o endpoint) ──────────

export async function processAllPending(): Promise<number> {
  const all = await prisma.onboardingProgress.findMany({
    where:   { completedAt: null },
    include: { client: { select: { id: true, isTest: true, contactEmail: true, contactName: true, language: true,
      subscriptions: { where: { status: 'ACTIVE' }, include: { plan: { select: { name: true } } }, take: 1 } } } },
  })

  let processed = 0
  const now = new Date()

  for (const op of all) {
    if (op.client.isTest) continue
    const created = op.createdAt
    const daysSince = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
    const planName = op.client.subscriptions[0]?.plan?.name ?? 'Bàsic'

    if (daysSince >= 1  && !op.day1SentAt)  { await sendDay(op.clientId, 1,  planName); processed++ }
    if (daysSince >= 7  && !op.day7SentAt)  { await sendDay(op.clientId, 7,  planName); processed++ }
    if (daysSince >= 15 && !op.day15SentAt) { await sendDay(op.clientId, 15, planName); processed++ }
    if (daysSince >= 30 && !op.day30SentAt) {
      await sendDay(op.clientId, 30, planName)
      await prisma.onboardingProgress.update({ where: { clientId: op.clientId }, data: { completedAt: now } })
      processed++
    }
  }
  return processed
}

// ── Enviar email d'un dia concret ──────────────────────────────────────

async function sendDay(clientId: string, day: number, planName: string) {
  const [client, progress] = await Promise.all([
    prisma.client.findFirst({
      where:  { id: clientId, deletedAt: null },
      select: { contactEmail: true, contactName: true, language: true },
    }),
    prisma.onboardingProgress.findUnique({ where: { clientId } }),
  ])
  if (!client) return

  const dayDef   = DAY_EVENTS[day]
  const accessed = progress?.hasAccessed ?? false
  const event    = (accessed ? dayDef?.accessed : dayDef?.notAccessed) as NotificationEvent | undefined
  if (!event) return

  await sendNotification({
    to:    client.contactEmail,
    event,
    lang:  client.language,
    data:  {
      name:      client.contactName,
      plan:      planName,
      day:       String(day),
      portalUrl: `${process.env.PORTAL_URL ?? process.env.BASE_URL ?? ''}/client/dashboard`,
    },
  }).catch(err => console.error(`[onboarding] day${day} email error:`, err))

  const field = `day${day}SentAt` as keyof {
    day0SentAt: Date; day1SentAt: Date; day7SentAt: Date; day15SentAt: Date; day30SentAt: Date
  }
  await prisma.onboardingProgress.update({
    where: { clientId },
    data:  { [field]: new Date() },
  })
}

// ── Estat d'onboarding d'un client ─────────────────────────────────────

export async function getProgress(clientId: string) {
  return prisma.onboardingProgress.findUnique({ where: { clientId } })
}

export async function listAllProgress() {
  return prisma.onboardingProgress.findMany({
    include: { client: { select: { id: true, companyName: true, contactEmail: true, language: true, isTest: true } } },
    orderBy: { createdAt: 'desc' },
  })
}
