import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

// ── Definició de serveis ───────────────────────────────────────────────
const SERVICES = [
  { slug: 'whatsapp-bot',        name: 'WhatsApp bot 24/7',         description: 'Bot de WhatsApp amb IA per atendre clients les 24h' },
  { slug: 'landing-page-ia',     name: 'Landing page IA',           description: 'Pàgina de presentació generada amb intel·ligència artificial' },
  { slug: 'gestio-domini',       name: 'Gestió de domini',          description: 'Alta i gestió del nom de domini del client' },
  { slug: 'informes-mensuals',   name: 'Informes mensuals',         description: 'Informe de rendiment i estadístiques cada mes' },
  { slug: 'informes-setmanals',  name: 'Informes setmanals',        description: 'Informe de rendiment i estadístiques cada setmana' },
  { slug: 'automatitzacions',    name: 'Automatitzacions (n8n)',     description: 'Fluxos d\'automatització personalitzats amb n8n' },
  { slug: 'acces-api',           name: 'Accés API',                 description: 'Accés a l\'API per integrar amb sistemes externs' },
  { slug: 'suport-email',        name: 'Suport per email',          description: 'Suport tècnic per correu electrònic' },
  { slug: 'suport-prioritari',   name: 'Suport prioritari',         description: 'Suport tècnic amb temps de resposta garantit de 4h' },
  { slug: 'suport-telefonic',    name: 'Suport telefònic',          description: 'Suport tècnic per telèfon en horari laboral' },
  { slug: 'account-manager',     name: 'Account manager dedicat',   description: 'Responsable de compte dedicat exclusivament al client' },
  { slug: 'sla-99',              name: 'SLA 99.9%',                 description: 'Acord de nivell de servei amb disponibilitat garantida del 99.9%' },
]

// Serveis per pla (acumulatius: cada pla inclou els del pla anterior)
const PLAN_SERVICES: Record<string, string[]> = {
  basic: [
    'whatsapp-bot', 'landing-page-ia', 'suport-email',
  ],
  pro: [
    'whatsapp-bot', 'landing-page-ia', 'gestio-domini',
    'informes-mensuals', 'suport-email', 'suport-prioritari',
  ],
  premium: [
    'whatsapp-bot', 'landing-page-ia', 'gestio-domini',
    'informes-mensuals', 'informes-setmanals',
    'automatitzacions', 'suport-email', 'suport-prioritari', 'suport-telefonic',
  ],
  empresarial: [
    'whatsapp-bot', 'landing-page-ia', 'gestio-domini',
    'informes-mensuals', 'informes-setmanals', 'automatitzacions',
    'acces-api', 'suport-email', 'suport-prioritari', 'suport-telefonic',
    'account-manager', 'sla-99',
  ],
}

const PLANS = [
  { name: 'Bàsic',       slug: 'basic',        priceMonthly: 49,  maxDomains: 1,  maxUsers: 1  },
  { name: 'Pro',         slug: 'pro',          priceMonthly: 99,  maxDomains: 3,  maxUsers: 3  },
  { name: 'Premium',     slug: 'premium',      priceMonthly: 199, maxDomains: 10, maxUsers: 10 },
  { name: 'Empresarial', slug: 'empresarial',  priceMonthly: 499, maxDomains: -1, maxUsers: -1 },
]

async function main() {
  console.log('Seeding database...')

  // ── Serveis ────────────────────────────────────────────────────────
  const serviceMap: Record<string, string> = {}
  for (const s of SERVICES) {
    const service = await prisma.service.upsert({
      where:  { slug: s.slug },
      update: { name: s.name, description: s.description },
      create: s,
    })
    serviceMap[s.slug] = service.id
    console.log(`  Servei: ${s.name}`)
  }

  // ── Plans + serveis ────────────────────────────────────────────────
  for (const p of PLANS) {
    const plan = await prisma.plan.upsert({
      where:  { slug: p.slug },
      update: { priceMonthly: p.priceMonthly, maxDomains: p.maxDomains, maxUsers: p.maxUsers },
      create: p,
    })
    console.log(`  Pla: ${p.name}`)

    // Sincronitzar serveis del pla
    await prisma.planService.deleteMany({ where: { planId: plan.id } })
    for (const slug of PLAN_SERVICES[p.slug]) {
      await prisma.planService.create({
        data: { planId: plan.id, serviceId: serviceMap[slug] },
      })
    }
  }

  // ── Admin per defecte ──────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@portal.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12)
    await prisma.user.create({
      data: { email: adminEmail, password: hashed, role: 'ADMIN' },
    })
    console.log(`Admin creat: ${adminEmail}`)
  } else {
    console.log(`Admin ja existeix: ${adminEmail}`)
  }

  console.log('Seed completat.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
