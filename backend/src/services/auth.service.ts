import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { prisma } from '../db'
import { signAccess, signRefresh, verifyRefresh } from '../utils/jwt'
import type { LoginDTO } from '../schemas/auth'

const MAGIC_LINK_EXPIRY_HOURS = 24

// ── Login amb email + password ────────────────────────────────────────
export const login = async (dto: LoginDTO, ip: string) => {
  const user = await prisma.user.findFirst({
    where: { email: dto.email, deletedAt: null },
  })

  if (!user || !(await bcrypt.compare(dto.password, user.password))) {
    // Registrar intent fallit
    await prisma.auditLog.create({
      data: { userId: user?.id ?? 'unknown', action: 'LOGIN_FAILED', details: { email: dto.email }, ip },
    }).catch(() => {})
    const err: any = new Error('Credencials incorrectes')
    err.status = 401
    throw err
  }

  // Actualitzar lastLogin
  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })

  // Registrar login exitós
  await prisma.auditLog.create({
    data: { userId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id, ip },
  }).catch(() => {})

  const payload = { userId: user.id, role: user.role, clientId: user.clientId }
  return {
    accessToken:  signAccess(payload),
    refreshToken: signRefresh(payload),
    user: { id: user.id, email: user.email, role: user.role, clientId: user.clientId },
  }
}

// ── Refresh token ─────────────────────────────────────────────────────
export const refresh = async (refreshToken: string) => {
  let payload
  try {
    payload = verifyRefresh(refreshToken)
  } catch {
    const err: any = new Error('Refresh token invàlid o expirat')
    err.status = 401
    throw err
  }

  const user = await prisma.user.findFirst({
    where: { id: payload.userId, deletedAt: null },
  })
  if (!user) {
    const err: any = new Error('Usuari no trobat')
    err.status = 401
    throw err
  }

  const newPayload = { userId: user.id, role: user.role, clientId: user.clientId }
  return {
    accessToken:  signAccess(newPayload),
    refreshToken: signRefresh(newPayload),
  }
}

// ── Magic link: sol·licitar ───────────────────────────────────────────
export const requestMagicLink = async (email: string) => {
  const user = await prisma.user.findFirst({
    where: { email, deletedAt: null },
  })
  // No revelar si l'email existeix o no (seguretat)
  if (!user) return

  const token     = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_HOURS * 60 * 60 * 1000)

  await prisma.magicLinkToken.create({ data: { email, token, expiresAt } })

  // TODO Mòdul 13: enviar email amb el link
  const magicUrl = `${process.env.BASE_URL}/magic-link/${token}`
  console.log(`[magic-link] ${email} → ${magicUrl}`)

  return token
}

// ── Magic link: verificar i bescanviar per JWT ─────────────────────────
export const verifyMagicLink = async (token: string, ip: string) => {
  const record = await prisma.magicLinkToken.findUnique({ where: { token } })

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    const err: any = new Error('Link màgic invàlid o expirat')
    err.status = 401
    throw err
  }

  // Marcar com usat (un sol ús)
  await prisma.magicLinkToken.update({
    where: { id: record.id },
    data:  { usedAt: new Date() },
  })

  const user = await prisma.user.findFirst({
    where: { email: record.email, deletedAt: null },
  })
  if (!user) {
    const err: any = new Error('Usuari no trobat')
    err.status = 404
    throw err
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } })
  await prisma.auditLog.create({
    data: { userId: user.id, action: 'LOGIN_MAGIC_LINK', entityType: 'User', entityId: user.id, ip },
  }).catch(() => {})

  const payload = { userId: user.id, role: user.role, clientId: user.clientId }
  return {
    accessToken:  signAccess(payload),
    refreshToken: signRefresh(payload),
    user: { id: user.id, email: user.email, role: user.role, clientId: user.clientId },
  }
}

// ── Me (usuari autenticat) ────────────────────────────────────────────
export const getMe = async (userId: string) => {
  const user = await prisma.user.findFirst({
    where: { id: userId, deletedAt: null },
    select: { id: true, email: true, role: true, clientId: true, lastLogin: true, createdAt: true },
  })
  if (!user) {
    const err: any = new Error('Usuari no trobat')
    err.status = 404
    throw err
  }
  return user
}

// ── Logout ────────────────────────────────────────────────────────────
export const logout = async (userId: string, ip: string) => {
  await prisma.auditLog.create({
    data: { userId, action: 'LOGOUT', entityType: 'User', entityId: userId, ip },
  }).catch(() => {})
}
