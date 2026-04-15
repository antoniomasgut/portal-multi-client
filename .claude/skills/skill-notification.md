# Skill: Notificacions per Email

## Ús
Enviar emails transaccionals (benvinguda, factures, avisos d'ús, recordatoris) amb plantilles multiidioma.

## Stack
- Nodemailer (transport SMTP)
- Plantilles HTML inline (sense dependències de template engine)
- Variables d'entorn per credencials SMTP

## Variables d'entorn necessàries
```
SMTP_HOST=smtp.mailtrap.io       # Mailtrap per proves / SMTP real en prod
SMTP_PORT=587
SMTP_USER=xxxx
SMTP_PASS=xxxx
SMTP_FROM="AMG Enginyeria Digital <noreply@amgdigital.es>"
```

## Servei de notificacions (`src/services/notifications.ts`)
```typescript
import nodemailer from 'nodemailer'
import { prisma } from '../db'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
})

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
  | 'ONBOARDING_DAY7'
  | 'ONBOARDING_DAY15'
  | 'ONBOARDING_DAY30'

interface SendOptions {
  to:      string
  event:   NotificationEvent
  lang:    string           // 'ca' | 'es' | 'en'
  data:    Record<string, string | number>
  attachments?: { filename: string; path: string }[]
}

export const sendNotification = async (opts: SendOptions): Promise<void> => {
  const { subject, html } = buildTemplate(opts.event, opts.lang, opts.data)

  let attempts = 0
  while (attempts < 3) {
    try {
      await transporter.sendMail({
        from:        process.env.SMTP_FROM,
        to:          opts.to,
        subject,
        html,
        attachments: opts.attachments,
      })
      // Registrar a la BD
      await prisma.notification.create({
        data: {
          type:      opts.event,
          recipient: opts.to,
          subject,
          status:    'SENT',
          sentAt:    new Date(),
        }
      }).catch(() => {})
      return
    } catch (err) {
      attempts++
      if (attempts >= 3) {
        await prisma.notification.create({
          data: { type: opts.event, recipient: opts.to, subject, status: 'FAILED' }
        }).catch(() => {})
        throw err
      }
    }
  }
}
```

## Plantilles per event (`src/services/emailTemplates.ts`)
```typescript
const SUBJECTS: Record<string, Record<string, string>> = {
  WELCOME: {
    ca: 'Benvingut/da a AMG Enginyeria Digital',
    es: 'Bienvenido/a a AMG Enginyeria Digital',
    en: 'Welcome to AMG Enginyeria Digital',
  },
  INVOICE_GENERATED: {
    ca: 'La teva factura del mes de {{month}}',
    es: 'Tu factura del mes de {{month}}',
    en: 'Your invoice for {{month}}',
  },
  USAGE_WARNING_80: {
    ca: 'Has consumit el 80% del teu pla',
    es: 'Has consumido el 80% de tu plan',
    en: "You've used 80% of your plan",
  },
  // ... altres events
}

export const buildTemplate = (
  event: string,
  lang: string,
  data: Record<string, string | number>
): { subject: string; html: string } => {
  const langKey = ['ca', 'es', 'en'].includes(lang) ? lang : 'ca'
  let subject = SUBJECTS[event]?.[langKey] ?? event
  // Substituir variables al subject
  for (const [k, v] of Object.entries(data)) {
    subject = subject.replaceAll(`{{${k}}}`, String(v))
  }
  const html = buildHtml(event, langKey, data)
  return { subject, html }
}

const buildHtml = (event: string, lang: string, data: Record<string, string | number>): string => `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="background:#0d0d1a;color:#e0e0f0;font-family:Arial,sans-serif;padding:40px;">
  <div style="max-width:600px;margin:0 auto;background:#13132a;padding:32px;border:1px solid rgba(255,107,0,0.2);">
    <h1 style="color:#FF6B00;font-size:24px;margin:0 0 24px;">AMG Enginyeria Digital</h1>
    <div style="border-left:3px solid #FF6B00;padding-left:16px;">
      ${getEventContent(event, lang, data)}
    </div>
    <hr style="border-color:rgba(255,107,0,0.15);margin:24px 0;">
    <p style="color:#8888aa;font-size:12px;">
      AMG Enginyeria Digital | <a href="mailto:info@amgdigital.es" style="color:#FF6B00;">info@amgdigital.es</a>
    </p>
  </div>
</body>
</html>
`
```

## Exemple d'ús
```typescript
// Benvinguda en crear un client nou
await sendNotification({
  to:    client.email,
  event: 'WELCOME',
  lang:  client.language,
  data:  { name: client.name, plan: plan.name, portalUrl: process.env.PORTAL_URL! }
})

// Factura amb adjunt PDF
const signedUrl = await getSignedUrl(invoice.pdfPath, 60)
await sendNotification({
  to:    client.email,
  event: 'INVOICE_GENERATED',
  lang:  client.language,
  data:  { month: 'Abril 2026', amount: '99.00', invoiceNumber: invoice.number }
})
```
