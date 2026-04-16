import { randomBytes } from 'crypto'
import { prisma } from '../db'
import { credentialService } from './credential.service'

// ── Configuració de proveïdors ────────────────────────────────────────

interface ProviderConfig {
  authUrl:      string
  tokenUrl:     string
  clientId:     string
  clientSecret: string
  scope:        string
  redirectUri:  string
}

function getProvider(provider: string): ProviderConfig {
  const base = process.env.BASE_URL || 'http://localhost:4000'

  if (provider === 'whatsapp') {
    return {
      authUrl:      'https://www.facebook.com/v19.0/dialog/oauth',
      tokenUrl:     'https://graph.facebook.com/v19.0/oauth/access_token',
      clientId:     process.env.META_APP_ID     || '',
      clientSecret: process.env.META_APP_SECRET || '',
      scope:        'whatsapp_business_management,whatsapp_business_messaging',
      redirectUri:  `${base}/api/oauth/whatsapp/callback`,
    }
  }

  throw new Error(`Proveïdor OAuth no suportat: ${provider}`)
}

// ── Servei ────────────────────────────────────────────────────────────

export const oauthService = {
  /** Genera una URL d'autorització i desa l'estat CSRF */
  async startFlow(clientId: string, provider: string): Promise<string> {
    // Netejar estats expirats del client
    await prisma.oAuthState.deleteMany({
      where: { clientId, provider, expiresAt: { lt: new Date() } },
    })

    const state     = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minuts

    await prisma.oAuthState.create({
      data: { state, clientId, provider, expiresAt },
    })

    const cfg = getProvider(provider)
    const params = new URLSearchParams({
      client_id:     cfg.clientId,
      redirect_uri:  cfg.redirectUri,
      response_type: 'code',
      state,
      scope:         cfg.scope,
    })
    return `${cfg.authUrl}?${params.toString()}`
  },

  /** Processa el callback OAuth: intercanvia el codi per un token i el desa */
  async handleCallback(provider: string, code: string, state: string): Promise<{ clientId: string }> {
    const stateRow = await prisma.oAuthState.findUnique({ where: { state } })
    if (!stateRow || stateRow.expiresAt < new Date() || stateRow.provider !== provider) {
      throw Object.assign(new Error('Estat OAuth invàlid o expirat'), { status: 400 })
    }

    await prisma.oAuthState.delete({ where: { state } })

    const cfg = getProvider(provider)
    const tokenRes = await fetch(cfg.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id:     cfg.clientId,
        client_secret: cfg.clientSecret,
        redirect_uri:  cfg.redirectUri,
        code,
      }).toString(),
    })
    if (!tokenRes.ok) {
      const err = await tokenRes.text()
      throw Object.assign(new Error(`Error del proveïdor OAuth: ${err}`), { status: 502 })
    }
    const tokenData = await tokenRes.json() as { access_token: string; token_type: string }

    // Desar el token via credential service
    await credentialService.set(stateRow.clientId, provider, 'ACCESS_TOKEN', tokenData.access_token)

    // Per WhatsApp: obtenir phone_number_id
    if (provider === 'whatsapp') {
      try {
        const wabaRes = await fetch(
          `https://graph.facebook.com/v19.0/me/phone_numbers?access_token=${tokenData.access_token}`
        )
        if (wabaRes.ok) {
          const wabaData = await wabaRes.json() as { data?: { id: string; display_phone_number: string }[] }
          const phone = wabaData.data?.[0]
          if (phone) {
            await credentialService.set(stateRow.clientId, provider, 'PHONE_ID', phone.id)
            await credentialService.set(stateRow.clientId, provider, 'PHONE_NUMBER', phone.display_phone_number)
          }
        }
      } catch { /* no crític */ }
    }

    return { clientId: stateRow.clientId }
  },

  /** Retorna l'estat de connexió d'un client (quins serveis té connectats) */
  async getConnectionStatus(clientId: string): Promise<Record<string, boolean>> {
    const creds = await prisma.clientCredential.findMany({
      where:  { clientId },
      select: { service: true, key: true },
    })
    const services = [...new Set(creds.map(c => c.service))]
    const result: Record<string, boolean> = {}
    for (const svc of services) {
      const hasToken = creds.some(c => c.service === svc && c.key === 'ACCESS_TOKEN')
      const hasKey   = creds.some(c => c.service === svc && c.key === 'API_KEY')
      result[svc] = hasToken || hasKey
    }
    return result
  },

  /** Desconnecta un servei (elimina totes les seves credencials) */
  async disconnect(clientId: string, provider: string): Promise<void> {
    await prisma.clientCredential.deleteMany({ where: { clientId, service: provider } })
  },
}
