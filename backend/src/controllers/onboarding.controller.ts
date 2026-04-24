import { Request, Response, NextFunction } from 'express'
import * as onboardingService from '../services/onboarding.service'

export const getOnboardingProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const progress = await onboardingService.getProgress(req.params.id)
    res.json({ success: true, message: 'OK', data: progress })
  } catch (err) { next(err) }
}

export const listOnboardingProgress = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const all = await onboardingService.listAllProgress()
    res.json({ success: true, message: 'OK', data: all })
  } catch (err) { next(err) }
}

export const triggerProcessPending = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const processed = await onboardingService.processAllPending()
    res.json({ success: true, message: `${processed} emails enviats`, data: { processed } })
  } catch (err) { next(err) }
}
