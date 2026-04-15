import jwt from 'jsonwebtoken'

const ACCESS_SECRET  = process.env.JWT_SECRET!
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

export interface JwtPayload {
  userId:   string
  role:     string
  clientId: string | null
}

export const signAccess = (payload: JwtPayload): string =>
  jwt.sign(payload, ACCESS_SECRET, { expiresIn: '1h' })

export const signRefresh = (payload: JwtPayload): string =>
  jwt.sign(payload, REFRESH_SECRET, { expiresIn: '7d' })

export const verifyAccess = (token: string): JwtPayload =>
  jwt.verify(token, ACCESS_SECRET) as JwtPayload

export const verifyRefresh = (token: string): JwtPayload =>
  jwt.verify(token, REFRESH_SECRET) as JwtPayload
