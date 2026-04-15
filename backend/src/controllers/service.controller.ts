import { Request, Response, NextFunction } from 'express'
import { serviceService } from '../services/service.service'
import { createServiceSchema, updateServiceSchema } from '../schemas/service'

export const listServices = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const services = await serviceService.list()
    res.json({ success: true, message: 'OK', data: services })
  } catch (err) { next(err) }
}

export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body    = createServiceSchema.parse(req.body)
    const service = await serviceService.create(body)
    res.status(201).json({ success: true, message: 'Servei creat', data: service })
  } catch (err) { next(err) }
}

export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body    = updateServiceSchema.parse(req.body)
    const service = await serviceService.update(req.params.id, body)
    res.json({ success: true, message: 'Servei actualitzat', data: service })
  } catch (err) { next(err) }
}

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await serviceService.delete(req.params.id)
    res.json({ success: true, message: 'Servei eliminat', data: null })
  } catch (err) { next(err) }
}
