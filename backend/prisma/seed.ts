import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // ── Plans ──────────────────────────────────────────────────────────────
  const plans = [
    {
      name: 'Bàsic',
      slug: 'basic',
      priceMonthly: 49,
      maxDomains: 1,
      maxUsers: 1,
      features: ['WhatsApp bot 24/7', 'Landing page IA', '1 domini', 'Suport per email'],
    },
    {
      name: 'Pro',
      slug: 'pro',
      priceMonthly: 99,
      maxDomains: 3,
      maxUsers: 3,
      features: ['WhatsApp bot 24/7', 'Landing page IA', '3 dominis', 'Informes mensuals', 'Suport prioritari'],
    },
    {
      name: 'Premium',
      slug: 'premium',
      priceMonthly: 199,
      maxDomains: 10,
      maxUsers: 10,
      features: ['WhatsApp bot 24/7', 'Landing page IA', '10 dominis', 'Informes setmanals', 'Automatitzacions avançades', 'Suport telefònic'],
    },
    {
      name: 'Empresarial',
      slug: 'empresarial',
      priceMonthly: 499,
      maxDomains: -1, // il·limitat
      maxUsers: -1,
      features: ['Tot el de Premium', 'Dominis il·limitats', 'API access', 'SLA 99.9%', 'Account manager dedicat'],
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where:  { slug: plan.slug },
      update: { priceMonthly: plan.priceMonthly, features: plan.features },
      create: { ...plan, features: plan.features },
    })
    console.log(`Pla upsert: ${plan.name}`)
  }

  // ── Admin per defecte ──────────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@portal.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!'

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12)
    await prisma.user.create({
      data: {
        email:    adminEmail,
        password: hashed,
        role:     'ADMIN',
      },
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
