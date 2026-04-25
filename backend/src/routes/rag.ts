import { Router } from 'express'
import { requireAuth, requireRole } from '../middleware/auth'
import multer from 'multer'
import { z } from 'zod'
import { prisma } from '../db'
import { gcs } from '../utils/gcs'

const router  = Router()
const upload  = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } })

const AI_SERVICE_URL = process.env.AI_SERVICE_URL ?? 'http://ai:8000'

// ── Llistar documents ──────────────────────────────────────────────────────

router.get('/:id/rag', requireAuth, async (req, res, next) => {
  try {
    const docs = await prisma.rAGDocument.findMany({
      where:   { clientId: req.params.id },
      orderBy: { createdAt: 'desc' },
    })
    res.json({ success: true, message: 'OK', data: docs })
  } catch (err) { next(err) }
})

// ── Pujar document ─────────────────────────────────────────────────────────

router.post('/:id/rag', requireAuth, requireRole('ADMIN'), upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'Cal un fitxer', data: null })

    const clientId = req.params.id
    const gcsPath  = `rag/${clientId}/${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`

    await gcs.upload(gcsPath, req.file.buffer, req.file.mimetype).catch(() => {})

    const doc = await prisma.rAGDocument.create({
      data: {
        clientId,
        filename:  req.file.originalname,
        gcsPath,
        mimeType:  req.file.mimetype,
        sizeBytes: req.file.size,
        status:    'PENDING',
      },
    })

    // Cridar servei AI per indexar (non-blocking)
    indexDocument(doc.id, clientId, gcsPath, req.file.buffer, req.file.mimetype).catch(err =>
      console.error('[rag] index error:', err)
    )

    res.status(201).json({ success: true, message: 'Document pujat. Indexació en procés.', data: doc })
  } catch (err) { next(err) }
})

// ── Eliminar document ──────────────────────────────────────────────────────

router.delete('/:id/rag/:docId', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const doc = await prisma.rAGDocument.findFirst({
      where: { id: req.params.docId, clientId: req.params.id },
    })
    if (!doc) return res.status(404).json({ success: false, message: 'Document no trobat', data: null })

    await gcs.delete(doc.gcsPath).catch(() => {})

    // Notificar servei AI per eliminar chunks (best-effort)
    fetch(`${AI_SERVICE_URL}/rag/${req.params.id}/delete/${req.params.docId}`, { method: 'DELETE' }).catch(() => {})

    await prisma.rAGDocument.delete({ where: { id: req.params.docId } })
    res.json({ success: true, message: 'Document eliminat', data: null })
  } catch (err) { next(err) }
})

// ── Re-indexar ─────────────────────────────────────────────────────────────

router.post('/:id/rag/:docId/reindex', requireAuth, requireRole('ADMIN'), async (req, res, next) => {
  try {
    const doc = await prisma.rAGDocument.findFirst({
      where: { id: req.params.docId, clientId: req.params.id },
    })
    if (!doc) return res.status(404).json({ success: false, message: 'Document no trobat', data: null })

    await prisma.rAGDocument.update({ where: { id: doc.id }, data: { status: 'PENDING', error: null } })

    // Baixar de GCS i re-indexar
    reindexFromGCS(doc.id, req.params.id, doc.gcsPath, doc.mimeType).catch(() => {})

    res.json({ success: true, message: 'Re-indexació iniciada', data: null })
  } catch (err) { next(err) }
})

// ── Query RAG (per al bot) ─────────────────────────────────────────────────

router.post('/:id/rag/query', requireAuth, async (req, res, next) => {
  try {
    const { query } = z.object({ query: z.string().min(1).max(500) }).parse(req.body)
    const result    = await fetch(`${AI_SERVICE_URL}/rag/${req.params.id}/query`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ query }),
    })
    if (!result.ok) return res.json({ success: true, message: 'OK', data: { answer: '', sources: [] } })
    const json = await result.json()
    res.json({ success: true, message: 'OK', data: json })
  } catch (err) { next(err) }
})

// ── Helpers privats ────────────────────────────────────────────────────────

async function indexDocument(docId: string, clientId: string, gcsPath: string, buffer: Buffer, mimeType: string) {
  await prisma.rAGDocument.update({ where: { id: docId }, data: { status: 'INDEXING' } })
  try {
    const form = new FormData()
    form.append('file', new Blob([buffer], { type: mimeType }), gcsPath.split('/').pop())
    form.append('client_id', clientId)
    form.append('doc_id',    docId)

    const res = await fetch(`${AI_SERVICE_URL}/rag/index`, { method: 'POST', body: form })
    if (!res.ok) throw new Error(`AI service error ${res.status}`)
    const json: any = await res.json()
    await prisma.rAGDocument.update({
      where: { id: docId },
      data:  { status: 'INDEXED', chunkCount: json.chunks ?? 0, indexedAt: new Date() },
    })
  } catch (err) {
    await prisma.rAGDocument.update({
      where: { id: docId },
      data:  { status: 'FAILED', error: err instanceof Error ? err.message : String(err) },
    })
  }
}

async function reindexFromGCS(docId: string, clientId: string, gcsPath: string, mimeType: string) {
  try {
    const { Storage } = await import('@google-cloud/storage')
    const keyFile = process.env.GCS_KEY_FILE
    if (!keyFile) throw new Error('GCS no configurat')
    const storage = new Storage({ keyFilename: keyFile, projectId: process.env.GCS_PROJECT_ID })
    const [buffer] = await storage.bucket(process.env.GCS_BUCKET_NAME!).file(gcsPath).download()
    await indexDocument(docId, clientId, gcsPath, buffer, mimeType)
  } catch (err) {
    await prisma.rAGDocument.update({
      where: { id: docId },
      data:  { status: 'FAILED', error: err instanceof Error ? err.message : String(err) },
    })
  }
}

export default router
