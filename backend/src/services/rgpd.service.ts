import { prisma } from '../db'
import { gcs } from '../utils/gcs'

// ── Consentiments ──────────────────────────────────────────────────────────

export async function logConsent(
  clientId:  string,
  type:      string,
  granted:   boolean,
  ip?:       string,
  userAgent?: string
) {
  if (granted) {
    await prisma.consentLog.create({
      data: { clientId, type: type as any, granted: true, ip, userAgent },
    })
  } else {
    await prisma.consentLog.updateMany({
      where: { clientId, type: type as any, revokedAt: null },
      data:  { revokedAt: new Date(), granted: false },
    })
    await prisma.consentLog.create({
      data: { clientId, type: type as any, granted: false, ip, userAgent, revokedAt: new Date() },
    })
  }
}

export async function getActiveConsents(clientId: string) {
  const logs = await prisma.consentLog.findMany({
    where:   { clientId },
    orderBy: { grantedAt: 'desc' },
  })
  // Per a cada tipus retorna l'últim registre
  const latest: Record<string, typeof logs[0]> = {}
  for (const log of logs) {
    if (!latest[log.type]) latest[log.type] = log
  }
  return Object.values(latest).filter(l => l.granted)
}

// ── Exportació de dades (Dret d'accés) ────────────────────────────────────

export async function requestDataExport(clientId: string): Promise<string> {
  const existing = await prisma.dataExportRequest.findFirst({
    where:   { clientId, status: { in: ['PENDING', 'PROCESSING'] } },
  })
  if (existing) return existing.id

  const req = await prisma.dataExportRequest.create({
    data: { clientId, status: 'PROCESSING' },
  })

  // Generar JSON en background
  processExport(req.id, clientId).catch(err => {
    console.error('[rgpd] export error:', err)
    prisma.dataExportRequest.update({
      where: { id: req.id },
      data:  { status: 'FAILED', error: err instanceof Error ? err.message : String(err) },
    }).catch(() => {})
  })

  return req.id
}

async function processExport(requestId: string, clientId: string) {
  const [client, consents, invoices, automations, auditLogs] = await Promise.all([
    prisma.client.findUnique({
      where:   { id: clientId },
      include: {
        subscriptions: { include: { plan: true, services: { include: { service: true } } } },
        usage:         true,
        landing:       { select: { slug: true, publishedAt: true, title: true } },
      },
    }),
    prisma.consentLog.findMany({ where: { clientId }, orderBy: { grantedAt: 'desc' } }),
    prisma.invoice.findMany({ where: { clientId }, orderBy: { createdAt: 'desc' } }),
    prisma.clientAutomation.findMany({ where: { clientId }, include: { template: { select: { name: true } } } }),
    prisma.auditLog.findMany({ where: { clientId }, orderBy: { createdAt: 'desc' }, take: 200 }),
  ])

  const exportData = {
    exportedAt: new Date().toISOString(),
    client: {
      id:           client?.id,
      companyName:  client?.companyName,
      contactName:  client?.contactName,
      contactEmail: client?.contactEmail,
      contactPhone: client?.contactPhone,
      nif:          client?.nif,
      address:      client?.address,
      language:     client?.language,
      createdAt:    client?.createdAt,
    },
    subscriptions: client?.subscriptions ?? [],
    invoices:      invoices.map(inv => ({
      number: inv.number, total: inv.total, status: inv.status, issueDate: inv.issueDate,
    })),
    automations: automations.map(a => ({
      name: a.name, status: a.status, template: a.template.name, createdAt: a.createdAt,
    })),
    consents: consents.map(c => ({
      type: c.type, granted: c.granted, grantedAt: c.grantedAt, revokedAt: c.revokedAt,
    })),
    auditLog: auditLogs.map(l => ({
      action: l.action, entityType: l.entityType, createdAt: l.createdAt,
    })),
    landing: client?.landing ?? null,
    usage:   client?.usage ?? null,
  }

  const buffer  = Buffer.from(JSON.stringify(exportData, null, 2), 'utf-8')
  const gcsPath = `rgpd/exports/${clientId}/${requestId}.json`

  let path: string | undefined
  try {
    await gcs.upload(gcsPath, buffer, 'application/json')
    path = gcsPath
  } catch {
    // GCS no disponible — guardem sense path
  }

  await prisma.dataExportRequest.update({
    where: { id: requestId },
    data:  { status: 'COMPLETED', completedAt: new Date(), gcsPath: path },
  })
}

export async function getExportDownloadUrl(requestId: string, clientId: string): Promise<string | null> {
  const req = await prisma.dataExportRequest.findFirst({
    where: { id: requestId, clientId, status: 'COMPLETED' },
  })
  if (!req?.gcsPath) return null
  try {
    return await gcs.signedUrl(req.gcsPath, 3600)
  } catch {
    return null
  }
}

export async function listExportRequests(clientId: string) {
  return prisma.dataExportRequest.findMany({
    where:   { clientId },
    orderBy: { requestedAt: 'desc' },
    take:    10,
  })
}

// ── Dret d'oblit (anonimitzar dades personals) ────────────────────────────

export async function anonymizeClient(clientId: string, adminUserId: string): Promise<void> {
  const client = await prisma.client.findFirst({ where: { id: clientId, deletedAt: null } })
  if (!client) throw Object.assign(new Error('Client no trobat'), { status: 404 })

  const anonEmail = `deleted_${clientId.slice(0, 8)}@anon.rgpd`
  const now       = new Date()

  await prisma.$transaction([
    // Anonimitzar dades del client
    prisma.client.update({
      where: { id: clientId },
      data: {
        contactName:  'ELIMINAT',
        contactEmail: anonEmail,
        contactPhone: null,
        nif:          null,
        address:      null,
        notes:        null,
        deletedAt:    now,
      },
    }),
    // Anonimitzar usuaris
    prisma.user.updateMany({
      where: { clientId },
      data:  { email: anonEmail, password: 'ANONYMIZED', deletedAt: now },
    }),
    // Revocar tots els consentiments
    prisma.consentLog.updateMany({
      where: { clientId, revokedAt: null },
      data:  { revokedAt: now, granted: false },
    }),
    // Audit log
    prisma.auditLog.create({
      data: {
        userId:     adminUserId,
        clientId,
        action:     'CLIENT_ANONYMIZED',
        entityType: 'Client',
        entityId:   clientId,
        details:    { reason: 'RGPD - Dret d\'oblit' },
      },
    }),
  ])
}
