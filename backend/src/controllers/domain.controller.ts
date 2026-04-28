import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as domainService from '../services/domain.service'
import { prisma } from '../db'

const addSchema = z.object({
  domain: z.string().min(4).max(253).regex(/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)+$/i, {
    message: 'Format de domini no vàlid',
  }),
})

export const listDomains = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await domainService.listByClient(req.params.id)
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const addDomain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { domain } = addSchema.parse(req.body)
    const data       = await domainService.addDomain(req.params.id, domain)

    await prisma.auditLog.create({
      data: { userId: req.user!.userId, clientId: req.params.id, action: 'DOMAIN_ADDED', entityType: 'ClientDomain', entityId: data.id, details: { domain } },
    }).catch(() => {})

    res.status(201).json({ success: true, message: 'Domini afegit', data })
  } catch (err) { next(err) }
}

export const verifyDomain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await domainService.verifyDomain(req.params.domainId, req.params.id)
    const msg  = data.status === 'VERIFIED' ? 'Domini verificat correctament' : `Verificació fallida: ${data.errorMessage}`
    res.json({ success: data.status === 'VERIFIED', message: msg, data })
  } catch (err) { next(err) }
}

export const removeDomain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await domainService.removeDomain(req.params.domainId, req.params.id)
    res.json({ success: true, message: 'Domini eliminat', data: null })
  } catch (err) { next(err) }
}

export const getDomainInstructions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dom = await domainService.findById(req.params.domainId, req.params.id)
    if (!dom) return res.status(404).json({ success: false, message: 'Domini no trobat', data: null })
    const instructions = domainService.getVerificationInstructions(dom.domain, dom.dnsToken)
    res.json({ success: true, message: 'OK', data: instructions })
  } catch (err) { next(err) }
}

export const listAllDomains = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await domainService.listAllDomains()
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}
