import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as rgpdService from '../services/rgpd.service'

const consentSchema = z.object({
  type:    z.enum(['COOKIES_NECESSARY', 'COOKIES_ANALYTICS', 'COOKIES_MARKETING', 'DATA_PROCESSING', 'COMMUNICATIONS']),
  granted: z.boolean(),
})

export const logConsent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, granted } = consentSchema.parse(req.body)
    await rgpdService.logConsent(
      req.params.id,
      type,
      granted,
      req.ip,
      req.headers['user-agent']
    )
    res.json({ success: true, message: 'Consentiment registrat', data: null })
  } catch (err) { next(err) }
}

export const getConsents = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await rgpdService.getActiveConsents(req.params.id)
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const requestExport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const requestId = await rgpdService.requestDataExport(req.params.id)
    res.status(202).json({ success: true, message: 'Exportació en procés', data: { requestId } })
  } catch (err) { next(err) }
}

export const getExportStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await rgpdService.listExportRequests(req.params.id)
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const downloadExport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const url = await rgpdService.getExportDownloadUrl(req.params.exportId, req.params.id)
    if (!url) return res.status(404).json({ success: false, message: 'Exportació no disponible', data: null })
    res.json({ success: true, message: 'OK', data: { url } })
  } catch (err) { next(err) }
}

export const anonymizeClient = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rgpdService.anonymizeClient(req.params.id, req.user!.userId)
    res.json({ success: true, message: 'Client anonimitzat', data: null })
  } catch (err) { next(err) }
}
