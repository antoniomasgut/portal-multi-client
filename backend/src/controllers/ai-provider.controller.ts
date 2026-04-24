import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as aiProviderService from '../services/ai-provider.service'

const createSchema = z.object({
  provider: z.enum(['GROQ', 'OLLAMA', 'OPENAI', 'ANTHROPIC']),
  model:    z.string().min(1).max(120),
  apiKey:   z.string().min(1).max(500).optional(),
  baseUrl:  z.string().url().optional(),
  priority: z.number().int().min(0).max(100).default(0),
})

const updateSchema = z.object({
  model:    z.string().min(1).max(120).optional(),
  apiKey:   z.string().min(1).max(500).optional(),
  baseUrl:  z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
  priority: z.number().int().min(0).max(100).optional(),
})

export const listProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await aiProviderService.listByClient(req.params.id)
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const createProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = createSchema.parse(req.body)
    const data = await aiProviderService.create(req.params.id, body)
    res.status(201).json({ success: true, message: 'Proveïdor afegit', data })
  } catch (err) { next(err) }
}

export const updateProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const body = updateSchema.parse(req.body)
    const data = await aiProviderService.update(req.params.providerId, req.params.id, body)
    res.json({ success: true, message: 'Proveïdor actualitzat', data })
  } catch (err) { next(err) }
}

export const deleteProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await aiProviderService.remove(req.params.providerId, req.params.id)
    res.json({ success: true, message: 'Proveïdor eliminat', data: null })
  } catch (err) { next(err) }
}

// Endpoint intern per al servei FastAPI — retorna claus desencriptades
export const getClientConfig = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const secret = req.headers['x-internal-secret']
    if (secret !== process.env.INTERNAL_API_SECRET) {
      return res.status(401).json({ success: false, message: 'No autoritzat', data: null })
    }
    const data = await aiProviderService.getClientConfig(req.params.id)
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const listAllProviders = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await aiProviderService.listAll()
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const getProviderModels = async (_req: Request, res: Response, next: NextFunction) => {
  res.json({ success: true, message: 'OK', data: aiProviderService.PROVIDER_MODELS })
}
