import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { credentialService } from '../services/credential.service'

const setSchema = z.object({
  service: z.string().min(1).max(50).regex(/^[a-z0-9_-]+$/, 'Només minúscules, números, guions i guions baixos'),
  key:     z.string().min(1).max(100).regex(/^[A-Z0-9_]+$/, 'Majúscules, números i guions baixos'),
  value:   z.string().min(1),
})

export const listCredentials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const creds = await credentialService.list(req.params.id)
    res.json({ success: true, message: 'OK', data: creds })
  } catch (err) { next(err) }
}

export const setCredential = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { service, key, value } = setSchema.parse(req.body)
    const cred = await credentialService.set(req.params.id, service, key, value)
    res.json({ success: true, message: 'Credencial desada', data: cred })
  } catch (err) { next(err) }
}

export const deleteCredential = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await credentialService.delete(req.params.credId)
    res.json({ success: true, message: 'Credencial eliminada', data: null })
  } catch (err) { next(err) }
}
