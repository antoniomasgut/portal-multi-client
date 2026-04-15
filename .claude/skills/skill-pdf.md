# Skill: Generació de PDF

## Ús
Generar PDFs (factures, informes) en memòria amb PDFKit i pujar-los a GCS.

## Stack
- PDFKit (Node.js)
- Generació en memòria (Buffer), mai al disc
- Pujada a GCS via `skill-storage.md`

## Instal·lació
```bash
npm install pdfkit
npm install -D @types/pdfkit
```

## Patró base — Factura
```typescript
import PDFDocument from 'pdfkit'
import { uploadFile, paths } from './storage'
import { Invoice, Client, Plan } from '@prisma/client'

type InvoiceWithRelations = Invoice & { client: Client; plan: Plan }

export const generateInvoicePdf = async (invoice: InvoiceWithRelations): Promise<string> => {
  const buffer = await buildPdf(invoice)
  const gcsPath = paths.invoice(
    invoice.clientId,
    new Date(invoice.createdAt).getFullYear(),
    invoice.number
  )
  await uploadFile(gcsPath, buffer, 'application/pdf', false)
  return gcsPath
}

const buildPdf = (invoice: InvoiceWithRelations): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' })
    const chunks: Buffer[] = []
    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    // Capçalera
    doc.fontSize(20).font('Helvetica-Bold').text('AMG Enginyeria Digital', 50, 50)
    doc.fontSize(10).font('Helvetica').fillColor('#666')
       .text('NIF: XXXXXXXXX | email@amg.com', 50, 75)

    // Número factura
    doc.fontSize(16).fillColor('#FF6B00').font('Helvetica-Bold')
       .text(`FACTURA ${invoice.number}`, 350, 50, { align: 'right' })
    doc.fontSize(10).fillColor('#333').font('Helvetica')
       .text(new Date(invoice.createdAt).toLocaleDateString('ca'), 350, 72, { align: 'right' })

    // Dades client
    doc.moveTo(50, 110).lineTo(550, 110).strokeColor('#FF6B00').stroke()
    doc.fontSize(11).fillColor('#333').font('Helvetica-Bold').text('CLIENT:', 50, 120)
    doc.font('Helvetica').text(invoice.client.name, 50, 135)
    doc.text(invoice.client.email, 50, 150)
    if (invoice.client.taxId) doc.text(`NIF/CIF: ${invoice.client.taxId}`, 50, 165)

    // Taula conceptes
    const tableTop = 210
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#333')
    doc.text('CONCEPTE', 50, tableTop)
    doc.text('IMPORT', 470, tableTop, { align: 'right' })
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor('#ddd').stroke()

    let y = tableTop + 25
    doc.font('Helvetica')
    doc.text(`Pla ${invoice.plan.name} — ${new Date(invoice.periodStart).toLocaleDateString('ca')} / ${new Date(invoice.periodEnd).toLocaleDateString('ca')}`, 50, y)
    doc.text(`${invoice.baseAmount.toFixed(2)}€`, 470, y, { align: 'right' })
    y += 20

    if (invoice.discountAmount > 0) {
      doc.fillColor('#39d353')
      doc.text(`Descompte aplicat`, 50, y)
      doc.text(`-${invoice.discountAmount.toFixed(2)}€`, 470, y, { align: 'right' })
      doc.fillColor('#333')
      y += 20
    }

    if (invoice.overageAmount > 0) {
      doc.text('Excedents d\'ús', 50, y)
      doc.text(`${invoice.overageAmount.toFixed(2)}€`, 470, y, { align: 'right' })
      y += 20
    }

    // Total
    doc.moveTo(50, y + 5).lineTo(550, y + 5).strokeColor('#FF6B00').stroke()
    y += 15
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#FF6B00')
    doc.text('TOTAL (IVA inclòs)', 50, y)
    doc.text(`${invoice.totalAmount.toFixed(2)}€`, 470, y, { align: 'right' })

    // IVA breakdown
    const baseIva = invoice.totalAmount / 1.21
    const iva = invoice.totalAmount - baseIva
    doc.fontSize(9).font('Helvetica').fillColor('#666')
    doc.text(`Base imposable: ${baseIva.toFixed(2)}€  |  IVA 21%: ${iva.toFixed(2)}€`, 50, y + 20)

    // Peu
    doc.fontSize(8).fillColor('#999')
       .text('Gràcies per confiar en AMG Enginyeria Digital.', 50, 750, { align: 'center' })

    doc.end()
  })
```

## Exemple d'ús des d'un servei
```typescript
// Al generar una factura mensual:
const gcsPath = await generateInvoicePdf(invoiceWithRelations)
await prisma.invoice.update({
  where: { id: invoice.id },
  data: { pdfPath: gcsPath }
})
```
