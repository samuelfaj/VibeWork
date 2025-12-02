import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLogin } from './hooks'

interface LoginFormProps {
  onSwitchToSignup?: () => void
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
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
      <h2>{t('auth.login')}</h2>

      <div>
        <label htmlFor="login-email">{t('auth.email')}</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="login-password">{t('auth.password')}</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {login.isError && <div role="alert">{t('auth.errors.loginFailed')}</div>}

      <button type="submit" disabled={login.isPending}>
        {login.isPending ? t('common.loading') : t('auth.submit')}
      </button>

      {onSwitchToSignup && (
        <p>
          {t('auth.noAccount')}{' '}
          <button type="button" onClick={onSwitchToSignup}>
            {t('auth.signup')}
          </button>
        </p>
      )}
    </form>
  )
}
