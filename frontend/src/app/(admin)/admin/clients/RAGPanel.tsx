'use client'
import { useRef, useState } from 'react'
import { useRagDocuments, useUploadRagDocument, useDeleteRagDocument, useReindexRagDocument, RAGDocument } from '../../../../hooks/useRag'

const STATUS_LABEL: Record<RAGDocument['status'], string> = {
  PENDING:  'Pendent',
  INDEXING: 'Indexant…',
  INDEXED:  'Indexat',
  FAILED:   'Error',
}

const STATUS_COLOR: Record<RAGDocument['status'], string> = {
  PENDING:  'bg-yellow-500/20 text-yellow-300',
  INDEXING: 'bg-blue-500/20 text-blue-300',
  INDEXED:  'bg-green-500/20 text-green-300',
  FAILED:   'bg-red-500/20 text-red-300',
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(1)} MB`
}

export default function RAGPanel({ clientId }: { clientId: string }) {
  const { data, isLoading } = useRagDocuments(clientId)
  const upload  = useUploadRagDocument(clientId)
  const remove  = useDeleteRagDocument(clientId)
  const reindex = useReindexRagDocument(clientId)
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)

  const docs = data?.data ?? []

  function handleFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach(f => upload.mutate(f))
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        className={`border-2 border-dashed rounded p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-orange-500 bg-orange-500/10' : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          className="hidden"
          multiple
          accept=".pdf,.txt,.md,.docx,.csv"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="text-4xl mb-2">📄</div>
        <p className="text-gray-300 font-medium">Arrossega fitxers o fes clic per pujar</p>
        <p className="text-gray-500 text-sm mt-1">PDF, TXT, MD, DOCX, CSV — màx 20 MB per fitxer</p>
        {upload.isPending && (
          <p className="text-orange-400 text-sm mt-2 animate-pulse">Pujant…</p>
        )}
      </div>

      {/* Document list */}
      {isLoading ? (
        <p className="text-gray-500 text-sm">Carregant documents…</p>
      ) : docs.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">Encara no hi ha documents. Puja el primer per activar el RAG.</p>
      ) : (
        <div className="space-y-2">
          {docs.map(doc => (
            <div key={doc.id} className="card flex items-center gap-3">
              <div className="text-2xl flex-shrink-0">
                {doc.mimeType === 'application/pdf' ? '📕' :
                 doc.mimeType === 'text/csv' ? '📊' : '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{doc.filename}</p>
                <p className="text-gray-500 text-xs">
                  {formatBytes(doc.sizeBytes)}
                  {doc.chunkCount ? ` · ${doc.chunkCount} chunks` : ''}
                  {doc.indexedAt ? ` · indexat ${new Date(doc.indexedAt).toLocaleDateString()}` : ''}
                </p>
                {doc.error && (
                  <p className="text-red-400 text-xs mt-1 truncate" title={doc.error}>{doc.error}</p>
                )}
              </div>
              <span className={`badge text-xs px-2 py-1 rounded ${STATUS_COLOR[doc.status]}`}>
                {STATUS_LABEL[doc.status]}
              </span>
              <div className="flex gap-2 flex-shrink-0">
                {(doc.status === 'FAILED' || doc.status === 'INDEXED') && (
                  <button
                    className="btn-outline text-xs px-2 py-1"
                    onClick={() => reindex.mutate(doc.id)}
                    disabled={reindex.isPending}
                    title="Re-indexar"
                  >
                    ↺
                  </button>
                )}
                <button
                  className="text-red-400 hover:text-red-300 text-xs px-2 py-1 transition-colors"
                  onClick={() => { if (confirm('Eliminar document?')) remove.mutate(doc.id) }}
                  disabled={remove.isPending}
                  title="Eliminar"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-600 border-t border-gray-700 pt-4">
        Els documents indexats s'utilitzen per respondre preguntes del bot de WhatsApp amb context específic de l'empresa.
      </div>
    </div>
  )
}
