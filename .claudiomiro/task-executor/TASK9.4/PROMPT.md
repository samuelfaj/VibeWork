## PROMPT
Create authentication UI components including Login and Signup forms with TanStack Query hooks, using i18n for all text.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Full tech stack, architecture

**You MUST read AI_PROMPT.md before executing this task.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/frontend/src/features/auth/hooks.ts`
- `/frontend/src/features/auth/LoginForm.tsx`
- `/frontend/src/features/auth/SignupForm.tsx`
- `/frontend/src/features/auth/index.ts`

### Files This Task Will Modify
- `/frontend/src/App.tsx` - Import and render auth components

### Patterns to Follow

**Auth hooks:**
```typescript
import { useMutation, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useSignup() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.signup.post(data)
  })
}

export function useLogin() {
  return useMutation({
    mutationFn: (data: { email: string; password: string }) =>
      api.login.post(data)
  })
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => api.users.me.get(),
    retry: false
  })
}
```

**Form component pattern:**
```typescript
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLogin } from './hooks'

export function LoginForm() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const login = useLogin()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login.mutate({ email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>{t('auth.email')}</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} />

      <label>{t('auth.password')}</label>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} />

      {login.error && <p>{t('auth.errors.loginFailed')}</p>}

      <button type="submit" disabled={login.isPending}>
        {login.isPending ? t('common.loading') : t('auth.submit')}
      </button>
    </form>
  )
}
```

### Integration Points
- Uses api client from TASK9.3
- Uses i18n translations from TASK9.2
- Backend routes: POST /signup, POST /login, GET /users/me (TASK6)

## LAYER
4

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push
- All strings must use useTranslation (no hardcoded text)
- Password fields must use type="password"
- Forms must prevent double submission
