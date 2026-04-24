import { Request, Response, NextFunction } from 'express'
import {
  generateAdminWeeklyReport,
  generateClientMonthlyReport,
  processAllClientReports,
} from '../services/reporting.service'

export const triggerAdminWeekly = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await generateAdminWeeklyReport()
    res.json({ success: true, message: 'Informe setmanal generat', data: result })
  } catch (err) { next(err) }
}

export const triggerClientMonthly = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await generateClientMonthlyReport(req.params.id)
    if (!result) return res.status(404).json({ success: false, message: 'Client no trobat', data: null })
    res.json({ success: true, message: 'Informe mensual generat', data: result })
  } catch (err) { next(err) }
}

export const triggerAllClientMonthly = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sent = await processAllClientReports()
    res.json({ success: true, message: `${sent} informes enviats`, data: { sent } })
  } catch (err) { next(err) }
}
