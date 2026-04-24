import PDFDocument from 'pdfkit'
import { prisma } from '../db'
import { gcs } from '../utils/gcs'
import { sendNotification } from './notifications'

// ── Helpers PDF ────────────────────────────────────────────────────────────

function buildPdfBuffer(draw: (doc: InstanceType<typeof PDFDocument>) => void): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc    = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []
    doc.on('data',  chunk => chunks.push(chunk))
    doc.on('end',   () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    draw(doc)
    doc.end()
  })
}

function pdfHeader(doc: InstanceType<typeof PDFDocument>, title: string) {
  doc.fontSize(8).fillColor('#888888').text('AMG ENGINYERIA DIGITAL', { align: 'right' })
  doc.moveDown(0.5)
  doc.fontSize(20).fillColor('#FF6B00').text('AMG', { align: 'right' })
  doc.moveDown(1)
  doc.fontSize(14).fillColor('#111111').text(title, { align: 'left' })
  doc.moveTo(50, doc.y + 6).lineTo(545, doc.y + 6).strokeColor('#FF6B00').lineWidth(1).stroke()
  doc.moveDown(1)
}

function pdfRow(doc: InstanceType<typeof PDFDocument>, label: string, value: string) {
  doc.fontSize(9).fillColor('#666666').text(label, { continued: true, width: 250 })
  doc.fillColor('#111111').text(value, { align: 'right' })
  doc.moveDown(0.4)
}

function pdfFooter(doc: InstanceType<typeof PDFDocument>) {
  doc.fontSize(7).fillColor('#aaaaaa')
     .text('AMG Enginyeria Digital  ·  info@amgdigital.es', 50, 780, { align: 'center', width: 495 })
}

// ── Informe setmanal d'admin ───────────────────────────────────────────────

export async function generateAdminWeeklyReport(): Promise<{ gcsPath: string; signedUrl: string }> {
  const now  = new Date()
  const from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  const [activeClients, newClients, invoicesThisMonth, executions] = await Promise.all([
    prisma.client.count({ where: { deletedAt: null, isTest: false,
      subscriptions: { some: { status: 'ACTIVE' } } } }),
    prisma.client.count({ where: { deletedAt: null, isTest: false, createdAt: { gte: from } } }),
    prisma.invoice.findMany({ where: { createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) } } }),
    prisma.automationExecution.count({ where: { startedAt: { gte: from } } }),
  ])

  const billingMonth = invoicesThisMonth.reduce((sum, inv) => sum + Number(inv.total ?? 0), 0)

  const weekLabel = `${from.toLocaleDateString('ca-ES')} – ${now.toLocaleDateString('ca-ES')}`

  const buffer = await buildPdfBuffer(doc => {
    pdfHeader(doc, `Informe setmanal — ${weekLabel}`)
    doc.fontSize(10).fillColor('#333333').text('Resum de la setmana', { underline: true })
    doc.moveDown(0.5)
    pdfRow(doc, 'Clients actius',              String(activeClients))
    pdfRow(doc, 'Nous clients (7 dies)',        String(newClients))
    pdfRow(doc, 'Automatitzacions executades',  String(executions))
    pdfRow(doc, 'Facturació del mes (acum.)',   `${(billingMonth / 100).toFixed(2)} €`)
    pdfFooter(doc)
  })

  const gcsPath  = `reports/admin/weekly-${now.toISOString().slice(0, 10)}.pdf`
  const signedUrl = await uploadAndSign(gcsPath, buffer)

  // Email a l'admin
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@amgdigital.es'
  await sendNotification({
    to:    adminEmail,
    event: 'REPORT_ADMIN_WEEKLY',
    lang:  'ca',
    data:  { weekLabel, activeClients, newClients, executions, billingMonth: (billingMonth / 100).toFixed(2), reportUrl: signedUrl },
  }).catch(err => console.error('[reporting] admin weekly email error:', err))

  return { gcsPath, signedUrl }
}

// ── Informe mensual per client ─────────────────────────────────────────────

export async function generateClientMonthlyReport(clientId: string): Promise<{ gcsPath: string; signedUrl: string } | null> {
  const client = await prisma.client.findFirst({
    where:   { id: clientId, deletedAt: null, isTest: false },
    include: {
      subscriptions: { where: { status: 'ACTIVE' }, include: { plan: { select: { name: true } } }, take: 1 },
    },
  })
  if (!client) return null

  const now  = new Date()
  const from = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const to   = new Date(now.getFullYear(), now.getMonth(), 1)

  const [executions, usage] = await Promise.all([
    prisma.automationExecution.count({
      where: { automation: { clientId }, startedAt: { gte: from, lt: to } },
    }),
    prisma.clientUsage.findFirst({
      where: { clientId },
      orderBy: { updatedAt: 'desc' },
    }),
  ])

  const conversations = usage?.conversationsUsed ?? 0
  const timeSaved     = Math.round((conversations * 3 + executions * 5) / 60)

  const monthNames: Record<string, string[]> = {
    ca: ['Gener','Febrer','Març','Abril','Maig','Juny','Juliol','Agost','Setembre','Octubre','Novembre','Desembre'],
    es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  }
  const lang      = client.language ?? 'ca'
  const monthName = (monthNames[lang] ?? monthNames['ca'])[from.getMonth()]
  const planName  = client.subscriptions[0]?.plan?.name ?? 'Bàsic'

  const buffer = await buildPdfBuffer(doc => {
    pdfHeader(doc, `Informe mensual — ${monthName} ${from.getFullYear()}`)
    doc.fontSize(11).fillColor('#333333').text(client.companyName)
    doc.fontSize(9).fillColor('#666666').text(`Pla: ${planName}`)
    doc.moveDown(1)
    pdfRow(doc, 'Converses gestionades',       String(conversations))
    pdfRow(doc, 'Automatitzacions executades',  String(executions))
    pdfRow(doc, 'Temps estalviat (estimat)',    `${timeSaved}h`)
    pdfFooter(doc)
  })

  const gcsPath   = `reports/clients/${clientId}/monthly-${from.toISOString().slice(0, 7)}.pdf`
  const signedUrl = await uploadAndSign(gcsPath, buffer)

  await sendNotification({
    to:    client.contactEmail,
    event: 'REPORT_CLIENT_MONTHLY',
    lang,
    data:  {
      name:          client.contactName,
      month:         `${monthName} ${from.getFullYear()}`,
      conversations: String(conversations),
      executions:    String(executions),
      timeSaved:     String(timeSaved),
      reportUrl:     signedUrl,
      portalUrl:     `${process.env.PORTAL_URL ?? process.env.BASE_URL ?? ''}/client/dashboard`,
    },
  }).catch(err => console.error(`[reporting] monthly email error (${clientId}):`, err))

  return { gcsPath, signedUrl }
}

// ── Processar tots els clients (cridat el dia 1 de cada mes) ──────────────

export async function processAllClientReports(): Promise<number> {
  const clients = await prisma.client.findMany({
    where:   { deletedAt: null, isTest: false },
    select:  { id: true },
  })
  let sent = 0
  for (const c of clients) {
    const result = await generateClientMonthlyReport(c.id).catch(err => {
      console.error(`[reporting] error client ${c.id}:`, err)
      return null
    })
    if (result) sent++
  }
  return sent
}

// ── Helper: puja i retorna URL signada (graceful si no hi ha GCS) ─────────

async function uploadAndSign(gcsPath: string, buffer: Buffer): Promise<string> {
  try {
    await gcs.upload(gcsPath, buffer, 'application/pdf')
    return await gcs.signedUrl(gcsPath, 3600)
  } catch {
    // GCS no configurat — retorna URL buida per no bloquejar el flux
    console.warn('[reporting] GCS no disponible, informe generat però no pujat')
    return ''
  }
}
