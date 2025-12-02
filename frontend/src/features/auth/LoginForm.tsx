import { useTranslation } from 'react-i18next'
import { Form, Input, Button, Alert, Typography } from 'antd'
import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { useLogin } from './hooks'

const { Text, Link } = Typography

interface LoginFormProps {
  onSwitchToSignup?: () => void
}

interface LoginFormValues {
  email: string
  password: string
}

export function LoginForm({ onSwitchToSignup }: LoginFormProps) {
  const { t } = useTranslation()
  const login = useLogin()

  const handleSubmit = (values: LoginFormValues) => {
    login.mutate(values)
  }

  return (
    <Form<LoginFormValues>
      name="login"
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
        rules={[{ required: true, message: t('auth.errors.passwordRequired') }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder={t('auth.password')} />
      </Form.Item>

      {login.isError && (
        <Form.Item>
          <Alert message={t('auth.errors.loginFailed')} type="error" showIcon />
        </Form.Item>
      )}

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={login.isPending} block>
          {t('auth.submit')}
        </Button>
      </Form.Item>

      {onSwitchToSignup && (
        <div style={{ textAlign: 'center' }}>
          <Text>{t('auth.noAccount')} </Text>
          <Link onClick={onSwitchToSignup}>{t('auth.signup')}</Link>
        </div>
      )}
    </Form>
  )
}
