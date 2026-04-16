import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { invoiceService } from '../services/invoice.service'

const generateSchema = z.object({
  clientId:   z.string().uuid(),
  dueInDays:  z.number().int().min(1).max(365).optional(),
  notes:      z.string().optional(),
  taxRate:    z.number().min(0).max(100).optional(),
})

export const listInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId, status } = req.query as Record<string, string>
    const invoices = await invoiceService.list({ clientId, status })
    res.json({ success: true, message: 'OK', data: invoices })
  } catch (err) { next(err) }
}

export const getInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.findById(req.params.id)
    if (!invoice) return res.status(404).json({ success: false, message: 'Factura no trobada', data: null })
    res.json({ success: true, message: 'OK', data: invoice })
  } catch (err) { next(err) }
}

export const generateInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body    = generateSchema.parse(req.body)
    const invoice = await invoiceService.generate(body.clientId, body)
    res.status(201).json({ success: true, message: 'Factura generada', data: invoice })
  } catch (err) { next(err) }
}

export const markPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.markPaid(req.params.id)
    res.json({ success: true, message: 'Factura marcada com a pagada', data: invoice })
  } catch (err) { next(err) }
}

export const markOverdue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.markOverdue(req.params.id)
    res.json({ success: true, message: 'Factura marcada com a vençuda', data: invoice })
  } catch (err) { next(err) }
}

export const cancelInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const invoice = await invoiceService.cancel(req.params.id)
    res.json({ success: true, message: 'Factura cancel·lada', data: invoice })
  } catch (err) { next(err) }
}

export const deleteInvoice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await invoiceService.softDelete(req.params.id)
    res.json({ success: true, message: 'Factura eliminada', data: null })
  } catch (err) { next(err) }
}

export const getStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await invoiceService.stats()
    res.json({ success: true, message: 'OK', data: stats })
  } catch (err) { next(err) }
}

export const batchOverdue = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await invoiceService.batchMarkOverdue()
    res.json({ success: true, message: `${result.count} factures marcades com a vençudes`, data: result })
  } catch (err) { next(err) }
}
