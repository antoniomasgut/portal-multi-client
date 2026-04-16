import { prisma } from '../db'
import { encrypt, decrypt } from '../utils/encrypt'

export const credentialService = {
  /** Llista les credencials d'un client (sense els valors desencriptats) */
  async list(clientId: string) {
    const rows = await prisma.clientCredential.findMany({
      where:   { clientId },
      orderBy: [{ service: 'asc' }, { key: 'asc' }],
      select:  { id: true, service: true, key: true, updatedAt: true },
    })
    return rows
  },

  /** Desa o actualitza una credencial (encripta el valor) */
  async set(clientId: string, service: string, key: string, value: string) {
    const { encryptedVal, iv, tag } = encrypt(value)
    return prisma.clientCredential.upsert({
      where:  { clientId_service_key: { clientId, service, key } },
      update: { encryptedVal, iv, tag },
      create: { clientId, service, key, encryptedVal, iv, tag },
      select: { id: true, service: true, key: true, updatedAt: true },
    })
  },

  /** Retorna el valor desencriptat d'una credencial concreta */
  async get(clientId: string, service: string, key: string): Promise<string | null> {
    const row = await prisma.clientCredential.findUnique({
      where: { clientId_service_key: { clientId, service, key } },
    })
    if (!row) return null
    return decrypt(row)
  },

  /** Retorna totes les credencials d'un servei (desencriptades) — per a ús intern (n8n, AI...) */
  async getForService(clientId: string, service: string): Promise<Record<string, string>> {
    const rows = await prisma.clientCredential.findMany({
      where: { clientId, service },
    })
    return Object.fromEntries(rows.map(r => [r.key, decrypt(r)]))
  },

  async delete(id: string) {
    return prisma.clientCredential.delete({ where: { id } })
  },
}
