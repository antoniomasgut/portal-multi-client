import nodemailer from 'nodemailer'
import type Mail from 'nodemailer/lib/mailer'
import { prisma } from '../db'
import { buildTemplate } from './emailTemplates'

export type NotificationEvent =
  | 'WELCOME'
  | 'INVOICE_GENERATED'
  | 'PAYMENT_REMINDER_7'
  | 'PAYMENT_REMINDER_30'
  | 'USAGE_WARNING_80'
  | 'USAGE_LIMIT_100'
  | 'MAGIC_LINK'
  | 'OAUTH_CONNECTED'
  | 'PLAN_CHANGED'
  | 'ONBOARDING_DAY1'
  | 'ONBOARDING_DAY7_ACTIVE'
  | 'ONBOARDING_DAY7_INACTIVE'
  | 'ONBOARDING_DAY15'
  | 'ONBOARDING_DAY30'
  | 'REPORT_ADMIN_WEEKLY'
  | 'REPORT_CLIENT_MONTHLY'

interface SendOptions {
  to:          string
  event:       NotificationEvent
  lang?:       string
  data?:       Record<string, string | number>
  attachments?: Mail.Attachment[]
}

function createTransporter() {
  return nodemailer.createTransport({
    host:   process.env.SMTP_HOST,
    port:   Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendNotification(opts: SendOptions): Promise<void> {
  const lang  = opts.lang ?? 'ca'
  const data  = opts.data ?? {}
  const { subject, html } = buildTemplate(opts.event, lang, data)

  let lastError: unknown
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const transporter = createTransporter()
      await transporter.sendMail({
        from:        process.env.SMTP_FROM ?? 'AMG Enginyeria Digital <noreply@amgdigital.es>',
        to:          opts.to,
        subject,
        html,
        attachments: opts.attachments,
      })

      await prisma.notification.create({
        data: {
          type:      opts.event as any,
          recipient: opts.to,
          subject,
          status:    'SENT',
          attempts:  attempt,
          sentAt:    new Date(),
        },
      }).catch(() => {})

      return
    } catch (err) {
      lastError = err
      if (attempt < 3) await new Promise(r => setTimeout(r, attempt * 1000))
    }
  }

  await prisma.notification.create({
    data: {
      type:      opts.event as any,
      recipient: opts.to,
      subject,
      status:    'FAILED',
      attempts:  3,
      error:     lastError instanceof Error ? lastError.message : String(lastError),
    },
  }).catch(() => {})

  console.error(`[notifications] Failed to send ${opts.event} to ${opts.to}:`, lastError)
}
