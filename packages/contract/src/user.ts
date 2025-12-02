import { t } from 'elysia'
import type { Static } from 'elysia'

export const SignupSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
})

export const LoginSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String(),
})

export const UserResponseSchema = t.Object({
  id: t.String(),
  email: t.String({ format: 'email' }),
  createdAt: t.String(),
})

export type SignupInput = Static<typeof SignupSchema>
export type LoginInput = Static<typeof LoginSchema>
export type UserResponse = Static<typeof UserResponseSchema>
