# Skill: Storage GCS

## Ús
Pujar, servir i eliminar fitxers a Google Cloud Storage seguint les convencions del projecte.

## Regla fonamental
**Cap fitxer es guarda mai al disc.** Sempre GCS directament des de memòria.

## Servei centralitzat (`src/services/storage.ts`)
```typescript
import { Storage } from '@google-cloud/storage'

const storage = new Storage({
  keyFilename: process.env.GCS_KEY_FILE,
  projectId:   process.env.GCS_PROJECT_ID,
})
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!)

/** Puja un fitxer a GCS. Retorna la URL pública o el path GCS. */
export const uploadFile = async (
  gcsPath:     string,
  content:     Buffer | string,
  contentType: string,
  isPublic =   false
): Promise<string> => {
  const file = bucket.file(gcsPath)
  await file.save(content, {
    contentType,
    resumable: false,
    metadata: { cacheControl: isPublic ? 'public, max-age=3600' : 'no-store' }
  })
  if (isPublic) await file.makePublic()
  return isPublic
    ? `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${gcsPath}`
    : gcsPath
}

/** URL signada per fitxers privats (PDF, docs RAG). Per defecte 60 minuts. */
export const getSignedUrl = async (
  gcsPath:           string,
  expiresInMinutes = 60
): Promise<string> => {
  const [url] = await bucket.file(gcsPath).getSignedUrl({
    action:  'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  })
  return url
}

/** Elimina un fitxer de GCS. Silencia l'error si no existia. */
export const deleteFile = async (gcsPath: string): Promise<void> => {
  await bucket.file(gcsPath).delete({ ignoreNotFound: true })
}

/** Comprova si un fitxer existeix a GCS. */
export const fileExists = async (gcsPath: string): Promise<boolean> => {
  const [exists] = await bucket.file(gcsPath).exists()
  return exists
}
```

## Paths convencionals
```typescript
// Helpers per generar paths consistents
export const paths = {
  landing: (clientId: string, slug: string, version: number) =>
    `landings/${clientId}/${slug}-v${version}.html`,

  landingPreview: (clientId: string, slug: string) =>
    `landings/${clientId}/${slug}-preview.html`,

  invoice: (clientId: string, year: number, invoiceNumber: string) =>
    `invoices/${clientId}/${year}/${invoiceNumber}.pdf`,

  ragDocument: (clientId: string, filename: string) =>
    `rag/${clientId}/documents/${filename}`,

  backup: (date: string, timestamp: string) =>
    `backups/${date}/db-${timestamp}.sql.gz`,
}
```

## Exemple d'ús (generar PDF i pujar)
```typescript
import PDFDocument from 'pdfkit'
import { uploadFile, paths } from './storage'

export const generateAndUploadInvoice = async (invoice: Invoice): Promise<string> => {
  // Generar PDF en memòria (stream → Buffer)
  const buffer = await new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument()
    const chunks: Buffer[] = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)
    // ... generar contingut del PDF ...
    doc.end()
  })

  const gcsPath = paths.invoice(invoice.clientId, new Date().getFullYear(), invoice.number)
  await uploadFile(gcsPath, buffer, 'application/pdf', false) // privat
  return gcsPath // guardar a la BD, NO la URL signada
}
```
