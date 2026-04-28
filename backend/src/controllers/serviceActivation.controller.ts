import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { serviceActivationService } from '../services/serviceActivation.service'

const toggleSchema = z.object({
  active: z.boolean(),
})

/** PATCH /api/clients/:clientId/services/:serviceId/active */
export const toggleServiceActive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { clientId, serviceId } = req.params
    const { active } = toggleSchema.parse(req.body)

    const updated = await serviceActivationService.toggleActive(clientId, serviceId, active)

    res.json({
      success: true,
      message: active ? 'Servei activat' : 'Servei desactivat',
      data:    updated,
    })
  } catch (err) { next(err) }
}
