import { PrismaClient, ServiceCategory } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const SERVICES: { slug: string; name: string; description: string; category: ServiceCategory; setupPrice: number; monthlyPrice: number }[] = [
  // ── PRODUCTE ─────────────────────────────────────────────────────────
  // Bàsic(49€): WhatsApp(35)+LandingIA(25)+SuportEmail(12) = 72€ → estalvi 32%
  // Pro(99€):   +Gestió(8)+InfMensuals(15)+SuportPrio(35)  = 130€ → estalvi 24%
  // Premium(199€): +InfSetm(25)+Autom(45)+SuportTel(50)    = 250€ → estalvi 20%
  // Empresarial(499€): +API(30)+AccMgr(200)+SLA(100)       = 580€ → estalvi 14%
  { slug: 'whatsapp-bot',        category: 'PRODUCTE',        name: 'WhatsApp bot 24/7',        description: 'Bot de WhatsApp amb IA per atendre clients les 24h',                        setupPrice: 200, monthlyPrice:  35 },
  { slug: 'landing-page-basic', category: 'PRODUCTE',        name: 'Landing page bàsica',       description: 'Pàgina de presència web simple amb informació del negoci i formulari de contacte', setupPrice: 150, monthlyPrice:  10 },
  { slug: 'landing-page-ia',    category: 'PRODUCTE',        name: 'Landing page IA',           description: 'Pàgina de presentació generada amb intel·ligència artificial i optimitzada per conversió', setupPrice: 300, monthlyPrice:  25 },
  { slug: 'landing-page-pro',   category: 'PRODUCTE',        name: 'Landing page Pro',          description: 'Editor visual avançat amb A/B testing i domini personalitzat',              setupPrice: 500, monthlyPrice:  40 },
  { slug: 'gestio-domini',      category: 'PRODUCTE',        name: 'Gestió de domini',          description: 'Alta i gestió del nom de domini del client',                               setupPrice:  20, monthlyPrice:   8 },
  { slug: 'acces-api',          category: 'PRODUCTE',        name: 'Accés API',                 description: 'Accés a l\'API per integrar amb sistemes externs',                         setupPrice: 100, monthlyPrice:  30 },
  { slug: 'multiidioma',        category: 'PRODUCTE',        name: 'Multiidioma (ca/es/en)',     description: 'Landing page i bot en català, castellà i anglès',                          setupPrice:   0, monthlyPrice:  20 },
  // ── IA ────────────────────────────────────────────────────────────────
  { slug: 'agent-rag',          category: 'IA',              name: 'Agent IA RAG (Alf)',        description: 'Agent intel·ligent que respon preguntes amb els documents del client',      setupPrice: 200, monthlyPrice:  45 },
  { slug: 'crm-integrat',       category: 'IA',              name: 'CRM bàsic integrat',        description: 'Gestió de leads i clients amb puntuació automàtica per IA',                 setupPrice: 100, monthlyPrice:  25 },
  // ── AUTOMATITZACIONS ──────────────────────────────────────────────────
  { slug: 'automatitzacions',   category: 'AUTOMATITZACIONS', name: 'Automatitzacions (n8n)',   description: 'Fluxos d\'automatització personalitzats amb n8n',                          setupPrice: 150, monthlyPrice:  45 },
  { slug: 'int-google',         category: 'AUTOMATITZACIONS', name: 'Integració Google',        description: 'Connexió amb Google Sheets, Drive i Forms',                                setupPrice:  50, monthlyPrice:  12 },
  { slug: 'int-calendari',      category: 'AUTOMATITZACIONS', name: 'Calendari i booking',      description: 'Reserves automàtiques via WhatsApp o web amb Google Calendar',             setupPrice:  50, monthlyPrice:  18 },
  { slug: 'int-facturacio',     category: 'AUTOMATITZACIONS', name: 'Facturació (Holded)',      description: 'Generació automàtica de factures i enviament al client via Holded',        setupPrice: 100, monthlyPrice:  25 },
  { slug: 'int-email-marketing',category: 'AUTOMATITZACIONS', name: 'Email màrqueting (Brevo)', description: 'Campanyes automàtiques amb Brevo o Mailchimp connectades al bot',          setupPrice:  50, monthlyPrice:  18 },
  // ── COMUNICACIÓ ───────────────────────────────────────────────────────
  { slug: 'bot-instagram',      category: 'COMUNICACIO',     name: 'Bot Instagram / Facebook',  description: 'Bot de resposta automàtica per Instagram DMs i Facebook Messenger',        setupPrice: 150, monthlyPrice:  25 },
  { slug: 'bot-telegram',       category: 'COMUNICACIO',     name: 'Bot Telegram',              description: 'Agent de Telegram amb les mateixes capacitats que el bot de WhatsApp',     setupPrice: 100, monthlyPrice:  18 },
  { slug: 'bot-sms',            category: 'COMUNICACIO',     name: 'Bot SMS',                   description: 'Respostes automàtiques per SMS amb qualificació de leads',                 setupPrice: 100, monthlyPrice:  25 },
  // ── INFORMES ──────────────────────────────────────────────────────────
  { slug: 'informes-mensuals',  category: 'INFORMES',        name: 'Informes mensuals',         description: 'Informe de rendiment i estadístiques cada mes',                            setupPrice:   0, monthlyPrice:  15 },
  { slug: 'informes-setmanals', category: 'INFORMES',        name: 'Informes setmanals',        description: 'Informe de rendiment i estadístiques cada setmana',                        setupPrice:   0, monthlyPrice:  25 },
  // ── SUPORT ────────────────────────────────────────────────────────────
  { slug: 'suport-email',       category: 'SUPORT',          name: 'Suport per email',          description: 'Suport tècnic per correu electrònic',                                      setupPrice:   0, monthlyPrice:  12 },
  { slug: 'suport-prioritari',  category: 'SUPORT',          name: 'Suport prioritari',         description: 'Suport tècnic amb temps de resposta garantit de 4h',                       setupPrice:   0, monthlyPrice:  35 },
  { slug: 'suport-telefonic',   category: 'SUPORT',          name: 'Suport telefònic',          description: 'Suport tècnic per telèfon en horari laboral',                              setupPrice:   0, monthlyPrice:  50 },
  { slug: 'account-manager',    category: 'SUPORT',          name: 'Account manager dedicat',   description: 'Responsable de compte dedicat exclusivament al client',                    setupPrice:   0, monthlyPrice: 200 },
  { slug: 'sla-99',             category: 'SUPORT',          name: 'SLA 99.9%',                 description: 'Acord de nivell de servei amb disponibilitat garantida del 99.9%',         setupPrice:   0, monthlyPrice: 100 },
  // ── OPERACIONAL ───────────────────────────────────────────────────────
  { slug: 'onboarding',         category: 'OPERACIONAL',     name: 'Formació i onboarding',     description: 'Sessió de formació per a l\'equip del client (fins a 2h)',                 setupPrice: 350, monthlyPrice:   0 },
  { slug: 'migracio-dades',     category: 'OPERACIONAL',     name: 'Migració de dades',         description: 'Importació de contactes, historial i configuració des d\'una altra eina',  setupPrice: 250, monthlyPrice:   0 },
  { slug: 'backup-restauracio', category: 'OPERACIONAL',     name: 'Backup i restauració',      description: 'Còpies de seguretat diàries i restauració garantida en 4h',                setupPrice:  50, monthlyPrice:  12 },
]

const PLAN_SERVICES: Record<string, string[]> = {
  basic:       ['whatsapp-bot', 'landing-page-basic', 'suport-email'],
  pro:         ['whatsapp-bot', 'landing-page-ia',    'gestio-domini', 'informes-mensuals', 'suport-email', 'suport-prioritari'],
  premium:     ['whatsapp-bot', 'landing-page-ia',    'gestio-domini', 'informes-mensuals', 'informes-setmanals', 'automatitzacions', 'suport-email', 'suport-prioritari', 'suport-telefonic'],
  empresarial: ['whatsapp-bot', 'landing-page-ia',    'gestio-domini', 'informes-mensuals', 'informes-setmanals', 'automatitzacions', 'acces-api', 'suport-email', 'suport-prioritari', 'suport-telefonic', 'account-manager', 'sla-99'],
}

const PLANS = [
  {
    name: 'Bàsic', slug: 'basic', priceMonthly: 49, maxDomains: 1, maxUsers: 1,
    maxConversations: 1000, maxTokens: 1000000, maxAutomations: 3, maxIntegrations: 1, maxRagDocuments: null,
    hasLandingPro: false, hasCustomDomain: false, hasRag: false, hasTelegram: false,
    extraConversationPrice: 0.005, extraTokenPrice: 0.0001,
  },
  {
    name: 'Pro', slug: 'pro', priceMonthly: 99, maxDomains: 3, maxUsers: 3,
    maxConversations: 3000, maxTokens: 5000000, maxAutomations: 10, maxIntegrations: 5, maxRagDocuments: 10,
    hasLandingPro: true, hasCustomDomain: false, hasRag: true, hasTelegram: true,
    extraConversationPrice: 0.005, extraTokenPrice: 0.0001,
  },
  {
    name: 'Premium', slug: 'premium', priceMonthly: 199, maxDomains: 10, maxUsers: 10,
    maxConversations: 10000, maxTokens: 20000000, maxAutomations: 50, maxIntegrations: 15, maxRagDocuments: 50,
    hasLandingPro: true, hasCustomDomain: true, hasRag: true, hasTelegram: true,
    extraConversationPrice: 0.005, extraTokenPrice: 0.0001,
  },
  {
    name: 'Empresarial', slug: 'empresarial', priceMonthly: 499, maxDomains: -1, maxUsers: -1,
    maxConversations: null, maxTokens: null, maxAutomations: null, maxIntegrations: null, maxRagDocuments: 200,
    hasLandingPro: true, hasCustomDomain: true, hasRag: true, hasTelegram: true,
    extraConversationPrice: 0, extraTokenPrice: 0,
  },
]

// Polítiques de descompte inicials
const DISCOUNT_POLICIES = [
  { type: 'NEW_CLIENT'       as const, isActive: true,  percentage: 10, monthsFree: null, durationMonths: 3,    description: '10% de descompte durant els 3 primers mesos per a nous clients' },
  { type: 'ANNUAL_PAYMENT'   as const, isActive: true,  percentage: 15, monthsFree: null, durationMonths: null, description: '15% de descompte per pagament anual anticipat' },
  { type: 'REFERRAL_REFERRER'as const, isActive: true,  percentage: 10, monthsFree: null, durationMonths: 1,    description: '10% de descompte un mes per referir un nou client' },
  { type: 'REFERRAL_NEW'     as const, isActive: true,  percentage: 10, monthsFree: null, durationMonths: 3,    description: '10% de descompte 3 mesos per als clients referits' },
  { type: 'MANUAL'           as const, isActive: true,  percentage: null, monthsFree: null, durationMonths: null, description: 'Descompte manual aplicat cas per cas per l\'administrador' },
]

async function main() {
  console.log('Seeding database...')

  // ── Serveis ──────────────────────────────────────────────────────────
  const serviceMap: Record<string, string> = {}
  for (const s of SERVICES) {
    const service = await prisma.service.upsert({
      where:  { slug: s.slug },
      update: { name: s.name, description: s.description, category: s.category, setupPrice: s.setupPrice, monthlyPrice: s.monthlyPrice },
      create: s,
    })
    serviceMap[s.slug] = service.id
    console.log(`  Servei: ${s.name}`)
  }

  // ── Plans ────────────────────────────────────────────────────────────
  for (const p of PLANS) {
    const plan = await prisma.plan.upsert({
      where:  { slug: p.slug },
      update: {
        priceMonthly: p.priceMonthly, maxDomains: p.maxDomains, maxUsers: p.maxUsers,
        maxConversations: p.maxConversations, maxTokens: p.maxTokens,
        maxAutomations: p.maxAutomations, maxIntegrations: p.maxIntegrations,
        maxRagDocuments: p.maxRagDocuments,
        hasLandingPro: p.hasLandingPro, hasCustomDomain: p.hasCustomDomain,
        hasRag: p.hasRag, hasTelegram: p.hasTelegram,
        extraConversationPrice: p.extraConversationPrice, extraTokenPrice: p.extraTokenPrice,
      },
      create: p,
    })
    console.log(`  Pla: ${p.name}`)

    await prisma.planService.deleteMany({ where: { planId: plan.id } })
    for (const slug of PLAN_SERVICES[p.slug]) {
      await prisma.planService.create({
        data: { planId: plan.id, serviceId: serviceMap[slug] },
      })
    }
  }

  // ── Polítiques de descompte ──────────────────────────────────────────
  for (const dp of DISCOUNT_POLICIES) {
    await prisma.discountPolicy.upsert({
      where:  { type: dp.type },
      update: { isActive: dp.isActive, percentage: dp.percentage, monthsFree: dp.monthsFree, durationMonths: dp.durationMonths, description: dp.description },
      create: dp,
    })
    console.log(`  Política: ${dp.type}`)
  }

  // ── Política de preus (singleton) ───────────────────────────────────
  const pricingCount = await prisma.pricingPolicy.count()
  if (pricingCount === 0) {
    await prisma.pricingPolicy.create({
      data: { minNoticeDays: 30, allowImmediateChange: false, notifyClientsOnChange: true },
    })
    console.log('  Política de preus creada')
  }

  // ── Admin per defecte ────────────────────────────────────────────────
  const adminEmail    = process.env.ADMIN_EMAIL    || 'admin@portal.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin1234!'
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } })
  if (!existing) {
    const hashed = await bcrypt.hash(adminPassword, 12)
    await prisma.user.create({ data: { email: adminEmail, password: hashed, role: 'ADMIN' } })
    console.log(`  Admin creat: ${adminEmail}`)
  } else {
    console.log(`  Admin ja existeix: ${adminEmail}`)
  }

  // ── Client de prova ──────────────────────────────────────────────────
  const testClientEmail = 'test@portal.com'
  const existingTest = await prisma.client.findUnique({ where: { contactEmail: testClientEmail } })
  if (!existingTest) {
    const testClient = await prisma.client.create({
      data: {
        companyName:  'Client de Prova AMG',
        contactName:  'Test User',
        contactEmail: testClientEmail,
        domain:       'test.portal.local',
        notes:        'Client especial per testar workflows. No genera factures ni compta per als límits.',
        isTest:       true,
        status:       'ACTIVE',
      },
    })
    // Usuari associat al client de prova
    const testPassword = process.env.TEST_CLIENT_PASSWORD || 'Test1234!'
    const hashedTest   = await bcrypt.hash(testPassword, 12)
    await prisma.user.create({
      data: {
        email:    testClientEmail,
        password: hashedTest,
        role:     'CLIENT',
        clientId: testClient.id,
      },
    })
    console.log(`  Client de prova creat: ${testClientEmail}`)
  } else {
    console.log(`  Client de prova ja existeix: ${testClientEmail}`)
  }

  console.log('Seed completat.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
