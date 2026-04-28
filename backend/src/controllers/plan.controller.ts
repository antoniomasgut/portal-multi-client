import { Request, Response, NextFunction } from 'express'
import { planSchema } from '../schemas/plan'
import { planService } from '../services/client.service'

export async function listPlans(req: Request, res: Response, next: NextFunction) {
  try {
    const plans = await planService.list()
    res.json({ success: true, message: 'OK', data: plans })
  } catch (err) { next(err) }
}

export async function getPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const plan = await planService.findById(req.params.id)
    if (!plan) {
      return res.status(404).json({ success: false, message: 'Pla no trobat', data: null })
    }
    res.json({ success: true, message: 'OK', data: plan })
  } catch (err) { next(err) }
}

export async function createPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const data = planSchema.parse(req.body)
    const plan = await planService.create(data)
    res.status(201).json({ success: true, message: 'Pla creat', data: plan })
  } catch (err) { next(err) }
}

export async function updatePlan(req: Request, res: Response, next: NextFunction) {
  try {
    const data = planSchema.partial().parse(req.body)
    const plan = await planService.update(req.params.id, data)
    res.json({ success: true, message: 'Pla actualitzat', data: plan })
  } catch (err) { next(err) }
}

export async function deletePlan(req: Request, res: Response, next: NextFunction) {
  try {
    await planService.delete(req.params.id)
    res.json({ success: true, message: 'Pla processat', data: null })
  } catch (err) { next(err) }
}
