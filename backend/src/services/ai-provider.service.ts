import { prisma } from '../db'
import { encrypt, decrypt } from '../utils/encrypt'

// Models disponibles per proveïdor
export const PROVIDER_MODELS: Record<string, string[]> = {
  GROQ:      ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma2-9b-it'],
  OLLAMA:    ['llama3.2:3b', 'llama3.2:1b', 'gemma3:4b', 'gemma3:12b', 'mistral:7b'],
  OPENAI:    ['gpt-4o-mini', 'gpt-4o', 'gpt-4-turbo'],
  ANTHROPIC: ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-7'],
}

// Proveïdors que requereixen URL base (Ollama local)
export const NEEDS_BASE_URL = new Set(['OLLAMA'])

// Proveïdors que requereixen API key
export const NEEDS_API_KEY = new Set(['GROQ', 'OPENAI', 'ANTHROPIC'])

function encryptKey(apiKey: string) {
  const { encryptedVal, iv, tag } = encrypt(apiKey)
  return { apiKeyEnc: encryptedVal, apiKeyIv: iv, apiKeyTag: tag }
}

function decryptKey(row: { apiKeyEnc: string | null; apiKeyIv: string | null; apiKeyTag: string | null }): string | null {
  if (!row.apiKeyEnc || !row.apiKeyIv || !row.apiKeyTag) return null
  try {
    return decrypt({ encryptedVal: row.apiKeyEnc, iv: row.apiKeyIv, tag: row.apiKeyTag })
  } catch {
    return null
  }
}

// ── Llista (sense exposar la clau) ────────────────────────────────────────

export async function listByClient(clientId: string) {
  const rows = await prisma.aIProvider.findMany({
    where:   { clientId },
    orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true, clientId: true, provider: true, model: true,
      baseUrl: true, isActive: true, priority: true,
      createdAt: true, updatedAt: true,
      // indiquem si té clau però no la retornem
      apiKeyEnc: true,
    },
  })
  return rows.map(r => ({ ...r, hasApiKey: !!r.apiKeyEnc, apiKeyEnc: undefined }))
}

// ── Crear ─────────────────────────────────────────────────────────────────

export async function create(clientId: string, data: {
  provider: string
  model:    string
  apiKey?:  string
  baseUrl?: string
  priority?: number
}) {
  const encFields = data.apiKey ? encryptKey(data.apiKey) : {}

  return prisma.aIProvider.create({
    data: {
      clientId,
      provider: data.provider as any,
      model:    data.model,
      baseUrl:  data.baseUrl ?? null,
      priority: data.priority ?? 0,
      isActive: true,
      ...encFields,
    },
  })
}

// ── Actualitzar ───────────────────────────────────────────────────────────

export async function update(id: string, clientId: string, data: {
  model?:    string
  apiKey?:   string
  baseUrl?:  string | null
  isActive?: boolean
  priority?: number
}) {
  const existing = await prisma.aIProvider.findFirst({ where: { id, clientId } })
  if (!existing) throw Object.assign(new Error('Proveïdor no trobat'), { status: 404 })

  const encFields = data.apiKey ? encryptKey(data.apiKey) : {}

  return prisma.aIProvider.update({
    where: { id },
    data:  {
      model:    data.model,
      baseUrl:  data.baseUrl,
      isActive: data.isActive,
      priority: data.priority,
      ...encFields,
    },
  })
}

// ── Eliminar ──────────────────────────────────────────────────────────────

export async function remove(id: string, clientId: string) {
  const existing = await prisma.aIProvider.findFirst({ where: { id, clientId } })
  if (!existing) throw Object.assign(new Error('Proveïdor no trobat'), { status: 404 })
  await prisma.aIProvider.delete({ where: { id } })
}

// ── Config per al servei AI intern (retorna claus desencriptades) ─────────

export async function getClientConfig(clientId: string) {
  const rows = await prisma.aIProvider.findMany({
    where:   { clientId, isActive: true },
    orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
  })

  return rows.map(r => ({
    id:       r.id,
    provider: r.provider,
    model:    r.model,
    baseUrl:  r.baseUrl,
    apiKey:   decryptKey(r),
  }))
}

// ── Llista global per admin ───────────────────────────────────────────────

export async function listAll() {
  const rows = await prisma.aIProvider.findMany({
    include: { client: { select: { id: true, companyName: true } } },
    orderBy: [{ clientId: 'asc' }, { priority: 'asc' }],
  })
  return rows.map(r => ({
    id: r.id, provider: r.provider, model: r.model, isActive: r.isActive,
    priority: r.priority, baseUrl: r.baseUrl, hasApiKey: !!r.apiKeyEnc,
    client: r.client,
  }))
}
