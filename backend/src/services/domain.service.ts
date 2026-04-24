import dns from 'node:dns/promises'
import crypto from 'node:crypto'
import { prisma } from '../db'

// El CNAME destí que el client ha d'apuntar al seu DNS
const TARGET_CNAME = process.env.PORTAL_CNAME ?? process.env.PORTAL_URL?.replace(/^https?:\/\//, '') ?? 'portal.amgdigital.es'

export async function listByClient(clientId: string) {
  return prisma.clientDomain.findMany({
    where:   { clientId },
    orderBy: { createdAt: 'desc' },
  })
}

export async function addDomain(clientId: string, domain: string) {
  const cleaned = domain.toLowerCase().replace(/^https?:\/\//, '').replace(/\/$/, '').trim()

  const existing = await prisma.clientDomain.findUnique({ where: { domain: cleaned } })
  if (existing) throw Object.assign(new Error('Domini ja registrat'), { status: 409 })

  return prisma.clientDomain.create({
    data: {
      clientId,
      domain:   cleaned,
      dnsToken: crypto.randomBytes(16).toString('hex'),
      status:   'PENDING',
    },
  })
}

export async function removeDomain(domainId: string, clientId: string) {
  const dom = await prisma.clientDomain.findFirst({ where: { id: domainId, clientId } })
  if (!dom) throw Object.assign(new Error('Domini no trobat'), { status: 404 })
  await prisma.clientDomain.delete({ where: { id: domainId } })
}

export async function verifyDomain(domainId: string, clientId: string) {
  const dom = await prisma.clientDomain.findFirst({ where: { id: domainId, clientId } })
  if (!dom) throw Object.assign(new Error('Domini no trobat'), { status: 404 })

  const now = new Date()
  let verified     = false
  let errorMessage = ''

  try {
    // Primer intentem CNAME directe
    const cnames = await dns.resolveCname(dom.domain).catch(() => [] as string[])
    const cnameOk = cnames.some(c => c.replace(/\.$/, '') === TARGET_CNAME.replace(/\.$/, ''))

    if (cnameOk) {
      verified = true
    } else {
      // Alternativa: TXT record amb el token de verificació
      const txtRecords = await dns.resolveTxt(`_amgverify.${dom.domain}`).catch(() => [] as string[][])
      const flat       = txtRecords.flat()
      const tokenOk    = flat.some(r => r.includes(dom.dnsToken))
      if (tokenOk) verified = true
      else errorMessage = cnames.length
        ? `CNAME apunta a '${cnames[0]}', esperava '${TARGET_CNAME}'`
        : `Cap registre CNAME ni TXT de verificació trobat per a '${dom.domain}'`
    }
  } catch (err) {
    errorMessage = err instanceof Error ? err.message : String(err)
  }

  return prisma.clientDomain.update({
    where: { id: domainId },
    data:  {
      status:       verified ? 'VERIFIED' : 'FAILED',
      verifiedAt:   verified ? now : null,
      lastChecked:  now,
      errorMessage: verified ? null : errorMessage,
    },
  })
}

export async function listAllDomains() {
  return prisma.clientDomain.findMany({
    include: { client: { select: { id: true, companyName: true, contactEmail: true } } },
    orderBy: { createdAt: 'desc' },
  })
}

export function getVerificationInstructions(domain: string, dnsToken: string) {
  return {
    cname: {
      type:  'CNAME',
      host:  domain,
      value: TARGET_CNAME,
      desc:  `Afegeix un registre CNAME al teu proveïdor DNS que apunti '${domain}' a '${TARGET_CNAME}'`,
    },
    txt: {
      type:  'TXT',
      host:  `_amgverify.${domain}`,
      value: dnsToken,
      desc:  `Alternativa: afegeix un registre TXT a '_amgverify.${domain}' amb el valor '${dnsToken}'`,
    },
  }
}
