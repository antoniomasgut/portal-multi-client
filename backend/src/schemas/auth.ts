import { z } from 'zod'

export const LoginSchema = z.object({
  email:    z.string().email('Email invàlid'),
  password: z.string().min(1, 'La contrasenya és obligatòria'),
})

export const MagicLinkRequestSchema = z.object({
  email: z.string().email('Email invàlid'),
})

export const MagicLinkVerifySchema = z.object({
  token: z.string().min(1, 'Token obligatori'),
})

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z
    .string()
    .min(8, 'Mínim 8 caràcters')
    .regex(/[A-Z]/, 'Ha de contenir una majúscula')
    .regex(/[0-9]/, 'Ha de contenir un número')
    .regex(/[^A-Za-z0-9]/, 'Ha de contenir un símbol'),
})

export type LoginDTO           = z.infer<typeof LoginSchema>
export type MagicLinkRequestDTO = z.infer<typeof MagicLinkRequestSchema>
export type ChangePasswordDTO  = z.infer<typeof ChangePasswordSchema>
