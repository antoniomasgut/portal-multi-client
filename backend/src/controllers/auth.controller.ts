import { Request, Response, NextFunction } from 'express'
import { LoginSchema, MagicLinkRequestSchema, MagicLinkVerifySchema } from '../schemas/auth'
import * as authService from '../services/auth.service'

const REFRESH_COOKIE = 'refreshToken'
const COOKIE_OPTS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 dies
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dto  = LoginSchema.parse(req.body)
    const data = await authService.login(dto, req.ip ?? '')
    res.cookie(REFRESH_COOKIE, data.refreshToken, COOKIE_OPTS)
    res.json({ success: true, message: 'Login correcte', data: { accessToken: data.accessToken, user: data.user } })
  } catch (err) { next(err) }
}

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE]
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'Refresh token no trobat', data: null })
    }
    const data = await authService.refresh(refreshToken)
    res.cookie(REFRESH_COOKIE, data.refreshToken, COOKIE_OPTS)
    res.json({ success: true, message: 'Token renovat', data: { accessToken: data.accessToken } })
  } catch (err) { next(err) }
}

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.user!.userId, req.ip ?? '')
    res.clearCookie(REFRESH_COOKIE)
    res.json({ success: true, message: 'Sessió tancada', data: null })
  } catch (err) { next(err) }
}

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await authService.getMe(req.user!.userId)
    res.json({ success: true, message: 'OK', data })
  } catch (err) { next(err) }
}

export const requestMagicLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = MagicLinkRequestSchema.parse(req.body)
    await authService.requestMagicLink(email)
    // Sempre resposta positiva (no revelar si l'email existeix)
    res.json({ success: true, message: 'Si el correu existeix, rebràs un link en breus.', data: null })
  } catch (err) { next(err) }
}

export const verifyMagicLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = MagicLinkVerifySchema.parse(req.params)
    const data = await authService.verifyMagicLink(token, req.ip ?? '')
    res.cookie(REFRESH_COOKIE, data.refreshToken, COOKIE_OPTS)
    res.json({ success: true, message: 'Autenticació correcta', data: { accessToken: data.accessToken, user: data.user } })
  } catch (err) { next(err) }
}
