import { useTranslation } from 'react-i18next'
import { Form, Input, Button, Alert, Typography } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useSignup } from './hooks'

const { Text, Link } = Typography

interface SignupFormProps {
  onSwitchToLogin?: () => void
}

interface SignupFormValues {
  email: string
  password: string
  confirmPassword: string
}

export function SignupForm({ onSwitchToLogin }: SignupFormProps) {
  const { t } = useTranslation()
  const signup = useSignup()

  const handleSubmit = (values: SignupFormValues) => {
    signup.mutate({ email: values.email, password: values.password })
  }

  return (
    <Form<SignupFormValues>
      name="signup"
      onFinish={handleSubmit}
      layout="vertical"
      requiredMark={false}
    >
      <Form.Item
        name="email"
        label={t('auth.email')}
        rules={[
          { required: true, message: t('auth.errors.emailRequired') },
          { type: 'email', message: t('auth.errors.emailInvalid') },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder={t('auth.email')} />
      </Form.Item>

      <Form.Item
        name="password"
        label={t('auth.password')}
        rules={[
          { required: true, message: t('auth.errors.passwordRequired') },
          { min: 8, message: t('auth.errors.passwordTooShort') },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder={t('auth.password')} />
      </Form.Item>

      <Form.Item
        name="confirmPassword"
        label={t('auth.confirmPassword')}
        dependencies={['password']}
        rules={[
          { required: true, message: t('auth.errors.confirmPasswordRequired') },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error(t('auth.errors.passwordMismatch')))
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder={t('auth.confirmPassword')} />
      </Form.Item>

      {signup.isError && (
        <Form.Item>
          <Alert message={t('auth.errors.signupFailed')} type="error" showIcon />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={signup.isPending} block>
          {t('auth.submit')}
        </Button>
      </Form.Item>

      {onSwitchToLogin && (
        <div style={{ textAlign: 'center' }}>
          <Text>{t('auth.hasAccount')} </Text>
          <Link onClick={onSwitchToLogin}>{t('auth.login')}</Link>
        </div>
      )}
    </Form>
  )
}
