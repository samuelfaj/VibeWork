import { t } from 'elysia'
import type { Static } from 'elysia'

export const UserRoleSchema = t.Union([
  t.Literal('client'),
  t.Literal('manager'),
  t.Literal('admin'),
])

export const SignupSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 8 }),
  name: t.Optional(t.String({ minLength: 1 })),
})

export const LoginSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String(),
})

export const UserResponseSchema = t.Object({
  id: t.String(),
  email: t.String({ format: 'email' }),
  name: t.String(),
  role: UserRoleSchema,
  emailVerified: t.Boolean(),
  image: t.Union([t.String(), t.Null()]),
  createdAt: t.String(),
  updatedAt: t.String(),
})

export const ErrorBodySchema = t.Object({
  error: t.Object({
    code: t.String(),
    message: t.String(),
  }),
})

export type UserRole = Static<typeof UserRoleSchema>
export type SignupInput = Static<typeof SignupSchema>
export type LoginInput = Static<typeof LoginSchema>
export type UserResponse = Static<typeof UserResponseSchema>
export type ErrorBody = Static<typeof ErrorBodySchema>
