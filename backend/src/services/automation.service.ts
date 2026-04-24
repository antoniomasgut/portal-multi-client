import { prisma } from '../db'
import * as n8n from './n8n.service'
import { sendNotification } from './notifications'

// ── Templates ─────────────────────────────────────────────────────────

export async function listTemplates() {
  return prisma.automationTemplate.findMany({
    where:   { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true, description: true, category: true, isActive: true },
  })
}

export async function listAllTemplates() {
  return prisma.automationTemplate.findMany({
    orderBy: { name: 'asc' },
  })
}

// ── Automatitzacions del client ────────────────────────────────────────

export async function listByClient(clientId: string) {
  return prisma.clientAutomation.findMany({
    where:   { clientId },
    include: {
      template: { select: { id: true, name: true, slug: true, description: true, category: true } },
      executions: {
        orderBy: { startedAt: 'desc' },
        take:    5,
        select:  { id: true, status: true, startedAt: true, finishedAt: true, durationMs: true, error: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function createAutomation(
  clientId:   string,
  templateId: string,
  adminUserId: string
) {
  const [client, template] = await Promise.all([
    prisma.client.findFirst({ where: { id: clientId, deletedAt: null } }),
    prisma.automationTemplate.findUnique({ where: { id: templateId } }),
  ])

  if (!client)   throw Object.assign(new Error('Client no trobat'),   { status: 404 })
  if (!template) throw Object.assign(new Error('Template no trobat'), { status: 404 })

  const automation = await prisma.clientAutomation.create({
    data: {
      clientId,
      templateId,
      name:   `${template.name} — ${client.companyName}`,
      status: 'INACTIVE',
    },
  })

  // Intentar crear a n8n si disponible
  if (n8n.isN8nAvailable()) {
    try {
      const vars: Record<string, string> = {
        CLIENT_ID:      client.id,
        CLIENT_EMAIL:   client.contactEmail,
        CLIENT_NAME:    client.companyName,
        CLIENT_PHONE:   client.contactPhone ?? '',
        WEBHOOK_SECRET: process.env.N8N_WEBHOOK_SECRET ?? '',
        N8N_BASE_URL:   process.env.N8N_API_URL?.replace('/api/v1', '') ?? '',
        PORTAL_API_URL: process.env.BASE_URL ?? '',
        AUTOMATION_ID:  automation.id,
      }
      const n8nId = await n8n.createWorkflow(template.workflowJson as object, vars)
      await prisma.clientAutomation.update({
        where: { id: automation.id },
        data:  { n8nWorkflowId: n8nId, status: 'ACTIVE' },
      })
      await prisma.auditLog.create({
        data: {
          userId:     adminUserId,
          clientId,
          action:     'AUTOMATION_CREATED',
          entityType: 'ClientAutomation',
          entityId:   automation.id,
          details:    { templateId, n8nWorkflowId: n8nId, templateName: template.name },
          isTest:     client.isTest,
        },
      }).catch(() => {})
    } catch (err) {
      console.error('[automation] n8n create failed:', err)
      await prisma.clientAutomation.update({
        where: { id: automation.id },
        data:  { status: 'ERROR', lastError: err instanceof Error ? err.message : String(err) },
      })
    }
  }

  return prisma.clientAutomation.findUnique({
    where:   { id: automation.id },
    include: { template: true },
  })
}

export async function toggleAutomation(
  automationId: string,
  active:       boolean,
  adminUserId:  string
) {
  const automation = await prisma.clientAutomation.findUnique({
    where:   { id: automationId },
    include: { client: true },
  })
  if (!automation) throw Object.assign(new Error('Automatització no trobada'), { status: 404 })

  const newStatus = active ? 'ACTIVE' : 'PAUSED'

  if (automation.n8nWorkflowId && n8n.isN8nAvailable()) {
    try {
      if (active) await n8n.activateWorkflow(automation.n8nWorkflowId)
      else        await n8n.deactivateWorkflow(automation.n8nWorkflowId)
    } catch (err) {
      console.error('[automation] n8n toggle failed:', err)
    }
  }

  const updated = await prisma.clientAutomation.update({
    where: { id: automationId },
    data:  { status: newStatus },
  })

  await prisma.auditLog.create({
    data: {
      userId:     adminUserId,
      clientId:   automation.clientId,
      action:     active ? 'AUTOMATION_ACTIVATED' : 'AUTOMATION_PAUSED',
      entityType: 'ClientAutomation',
      entityId:   automationId,
      isTest:     automation.client.isTest,
    },
  }).catch(() => {})

  return updated
}

export async function deleteAutomation(automationId: string, adminUserId: string) {
  const automation = await prisma.clientAutomation.findUnique({
    where:   { id: automationId },
    include: { client: true },
  })
  if (!automation) throw Object.assign(new Error('Automatització no trobada'), { status: 404 })

  if (automation.n8nWorkflowId && n8n.isN8nAvailable()) {
    await n8n.deleteWorkflow(automation.n8nWorkflowId).catch(err =>
      console.error('[automation] n8n delete failed:', err)
    )
  }

  await prisma.automationExecution.deleteMany({ where: { automationId } })
  await prisma.clientAutomation.delete({ where: { id: automationId } })

  await prisma.auditLog.create({
    data: {
      userId:     adminUserId,
      clientId:   automation.clientId,
      action:     'AUTOMATION_DELETED',
      entityType: 'ClientAutomation',
      entityId:   automationId,
      isTest:     automation.client.isTest,
    },
  }).catch(() => {})
}

// ── Registrar execució (cridat des de webhook n8n) ─────────────────────

export async function recordExecution(
  automationId:   string,
  n8nExecutionId: string,
  status:         'SUCCESS' | 'FAILED',
  tokensUsed:     number,
  durationMs:     number,
  error?:         string
) {
  const automation = await prisma.clientAutomation.findUnique({ where: { id: automationId } })
  if (!automation) return

  await prisma.automationExecution.create({
    data: {
      automationId,
      n8nExecutionId,
      status,
      tokensUsed,
      durationMs,
      error,
      finishedAt: new Date(),
    },
  })

  if (status === 'SUCCESS') {
    await prisma.clientAutomation.update({
      where: { id: automationId },
      data:  { lastRunAt: new Date(), errorCount: 0 },
    })
    if (tokensUsed > 0) {
      await prisma.clientUsage.updateMany({
        where: { clientId: automation.clientId },
        data:  { tokensUsed: { increment: tokensUsed } },
      })
    }
  } else {
    const errorCount = automation.errorCount + 1
    const newStatus  = errorCount >= 3 ? 'ERROR' : automation.status

    await prisma.clientAutomation.update({
      where: { id: automationId },
      data:  { errorCount, status: newStatus as any, lastError: error ?? null },
    })

    // Notificar admin si ERROR >= 3
    if (errorCount >= 3) {
      const client = await prisma.client.findUnique({
        where:  { id: automation.clientId },
        select: { contactEmail: true, companyName: true, language: true },
      })
      const adminEmail = process.env.ADMIN_EMAIL
      if (adminEmail && client) {
        sendNotification({
          to:    adminEmail,
          event: 'WELCOME',
          lang:  'ca',
          data:  {
            name:    'Admin',
            plan:    `ERROR automatització "${automation.name}" (client: ${client.companyName})`,
            portalUrl: `${process.env.PORTAL_URL ?? ''}/admin/clients`,
          },
        }).catch(() => {})
      }
    }
  }
}

// ── Execucions d'una automatització ────────────────────────────────────

export async function listExecutions(automationId: string) {
  return prisma.automationExecution.findMany({
    where:   { automationId },
    orderBy: { startedAt: 'desc' },
    take:    20,
  })
}

// ── CRUD de templates (Mòdul 37) ────────────────────────────────────────

export async function listTemplatesWithUsage() {
  const templates = await prisma.automationTemplate.findMany({
    orderBy: { name: 'asc' },
  })
  const counts = await prisma.clientAutomation.groupBy({
    by:    ['templateId'],
    _count: { _all: true },
  })
  const countMap = Object.fromEntries(counts.map(c => [c.templateId, c._count._all]))
  return templates.map(t => ({ ...t, clientCount: countMap[t.id] ?? 0 }))
}

export async function createTemplate(data: {
  name:        string
  slug:        string
  description: string
  category:    string
  workflowJson: object
}) {
  return prisma.automationTemplate.create({ data: { ...data, isActive: true } })
}

export async function updateTemplate(id: string, data: {
  name?:        string
  description?: string
  category?:    string
}) {
  return prisma.automationTemplate.update({ where: { id }, data })
}

export async function toggleTemplate(id: string, isActive: boolean) {
  return prisma.automationTemplate.update({ where: { id }, data: { isActive } })
}

export async function testTemplate(id: string): Promise<{ ok: boolean; message: string }> {
  const template = await prisma.automationTemplate.findUnique({ where: { id } })
  if (!template) return { ok: false, message: 'Template no trobat' }
  if (!n8n.isN8nAvailable()) return { ok: false, message: 'n8n no disponible' }
  try {
    const testId = await n8n.createWorkflow(template.workflowJson as object, {
      CLIENT_ID: 'test', CLIENT_EMAIL: 'test@test.com', CLIENT_NAME: 'TEST',
      CLIENT_PHONE: '', WEBHOOK_SECRET: '', N8N_BASE_URL: '', PORTAL_API_URL: '', AUTOMATION_ID: 'test',
    })
    await n8n.deleteWorkflow(testId)
    return { ok: true, message: 'Workflow creat i eliminat correctament a n8n' }
  } catch (err) {
    return { ok: false, message: err instanceof Error ? err.message : String(err) }
  }
}
