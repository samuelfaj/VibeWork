import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSignup } from './hooks'

interface SignupFormProps {
  onSwitchToLogin?: () => void
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)
  const signup = useSignup()

  const validate = (): boolean => {
    if (password.length < 8) {
      setValidationError(t('auth.errors.passwordTooShort'))
      return false
    }
    if (password !== confirmPassword) {
      setValidationError(t('auth.errors.passwordMismatch'))
      return false
    }
    setValidationError(null)
    return true
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    signup.mutate({ email, password })
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{t('auth.signup')}</h2>

      <div>
        <label htmlFor="signup-email">{t('auth.email')}</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div>
        <label htmlFor="signup-password">{t('auth.password')}</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />
      </div>

      <div>
        <label htmlFor="signup-confirm-password">{t('auth.confirmPassword')}</label>
        <input
          id="signup-confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>

      {(validationError || signup.isError) && (
        <div role="alert">{validationError || t('auth.errors.signupFailed')}</div>
      )}

      <button type="submit" disabled={signup.isPending}>
        {signup.isPending ? t('common.loading') : t('auth.submit')}
      </button>

      {onSwitchToLogin && (
        <p>
          {t('auth.hasAccount')}{' '}
          <button type="button" onClick={onSwitchToLogin}>
            {t('auth.login')}
          </button>
        </p>
      )}
    </form>
  )
}
