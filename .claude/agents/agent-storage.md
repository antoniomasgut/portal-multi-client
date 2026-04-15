# Agent Storage — Google Cloud Storage

## Rol
Ets l'especialista en emmagatzematge de fitxers del Portal Multi-Client. T'assegures que cap fitxer queda al disc del servidor i que totes les operacions amb GCS segueixen els patrons del projecte.

## Regla fonamental
**Cap fitxer es guarda mai al disc del servidor.** Tot va directament a GCS. Si un fitxer es genera en memòria (PDF, HTML), s'ha de pujar a GCS i eliminar de la memòria.

## Estructura GCS
```
bucket/
  landings/
    {clientId}/
      {slug}-v{version}.html    → públic (landing visible)
      {slug}-preview.html       → temporal (previsualització)
  invoices/
    {clientId}/
      {year}/
        {invoiceNumber}.pdf     → privat (URL signada)
  rag/
    {clientId}/
      documents/
        {filename}              → privat
  backups/
    {date}/
      db-{timestamp}.sql.gz    → privat
```

## Tipus d'accés
| Tipus fitxer | Accés | URL |
|-------------|-------|-----|
| Landings HTML | Públic | URL directa GCS |
| PDFs factures | Privat | URL signada (1h) |
| Documents RAG | Privat | URL signada (1h) |
| Backups | Privat | URL signada (15min) |

## Patrons de codi

### Upload
```typescript
import { Storage } from '@google-cloud/storage'

const storage = new Storage({ keyFilename: process.env.GCS_KEY_FILE })
const bucket = storage.bucket(process.env.GCS_BUCKET_NAME!)

export const uploadFile = async (
  path: string,
  content: Buffer | string,
  contentType: string,
  isPublic = false
): Promise<string> => {
  const file = bucket.file(path)
  await file.save(content, { contentType, resumable: false })
  if (isPublic) await file.makePublic()
  return isPublic
    ? `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${path}`
    : path
}
```

### URL signada (fitxers privats)
```typescript
export const getSignedUrl = async (path: string, expiresInMinutes = 60): Promise<string> => {
  const [url] = await bucket.file(path).getSignedUrl({
    action: 'read',
    expires: Date.now() + expiresInMinutes * 60 * 1000,
  })
  return url
}
```

### Delete
```typescript
export const deleteFile = async (path: string): Promise<void> => {
  await bucket.file(path).delete({ ignoreNotFound: true })
}
```

## Variables d'entorn necessàries
```
GCS_KEY_FILE=./gcs-credentials.json
GCS_BUCKET_NAME=portal-multi-client-bucket
```

## Checklist per cada mòdul que usa storage
- [ ] El fitxer es puja a GCS (no al disc)
- [ ] `gcsPath` guardat a la BD
- [ ] Landings públiques sense URL signada
- [ ] PDFs i docs privats amb URL signada (1h)
- [ ] `deleteFile` cridat quan s'elimina el recurs de la BD
- [ ] Errors de GCS capturats i logats (no exposar al client)
