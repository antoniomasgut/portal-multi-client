/**
 * M11 — Google Cloud Storage
 * Requereix GCS_KEY_FILE, GCS_BUCKET_NAME i GCS_PROJECT_ID al .env.
 * Fins que no s'afegeixen les credencials reals, les funcions llencen un error clar.
 */
import { Storage } from '@google-cloud/storage'
import path from 'path'

let _storage: Storage | null = null

function getStorage(): Storage {
  if (_storage) return _storage
  const keyFile = process.env.GCS_KEY_FILE
  if (!keyFile) throw Object.assign(new Error('GCS_KEY_FILE no configurat'), { status: 503 })
  _storage = new Storage({ keyFilename: path.resolve(keyFile), projectId: process.env.GCS_PROJECT_ID })
  return _storage
}

function getBucket() {
  const name = process.env.GCS_BUCKET_NAME
  if (!name) throw Object.assign(new Error('GCS_BUCKET_NAME no configurat'), { status: 503 })
  return getStorage().bucket(name)
}

export const gcs = {
  /** Puja un buffer a GCS i retorna el gcsPath (no la URL completa) */
  async upload(gcsPath: string, buffer: Buffer, mimeType: string): Promise<string> {
    const file = getBucket().file(gcsPath)
    await file.save(buffer, { contentType: mimeType, resumable: false })
    return gcsPath
  },

  /** URL pública (per a landings / imatges públiques) */
  publicUrl(gcsPath: string): string {
    const bucket = process.env.GCS_BUCKET_NAME
    return `https://storage.googleapis.com/${bucket}/${gcsPath}`
  },

  /** URL signada amb expiració (per a PDFs i docs privats) */
  async signedUrl(gcsPath: string, expiresInSeconds = 3600): Promise<string> {
    const [url] = await getBucket().file(gcsPath).getSignedUrl({
      version: 'v4',
      action:  'read',
      expires: Date.now() + expiresInSeconds * 1000,
    })
    return url
  },

  async delete(gcsPath: string): Promise<void> {
    await getBucket().file(gcsPath).delete({ ignoreNotFound: true })
  },

  /** Comprova si el bucket és accessible (health check) */
  async ping(): Promise<boolean> {
    try {
      await getBucket().exists()
      return true
    } catch {
      return false
    }
  },
}
