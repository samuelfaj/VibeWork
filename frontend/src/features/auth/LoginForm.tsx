import { MailOutlined, LockOutlined } from '@ant-design/icons'
import { Form, Input, Button, Alert, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from './hooks'

const { Text } = Typography

interface LoginFormValues {
  email: string
  password: string
}

export function LoginForm() {
  const { t } = useTranslation()
  const login = useLogin()
  const navigate = useNavigate()

  const handleSubmit = (values: LoginFormValues) => {
    login.mutate(values, {
      onSuccess: () => {
        void navigate('/notifications')
      },
    })
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
        <Input prefix={<MailOutlined />} placeholder={t('auth.email')} data-testid="login-email" />
      </Form.Item>

      <Form.Item
        name="password"
        label={t('auth.password')}
        rules={[{ required: true, message: t('auth.errors.passwordRequired') }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t('auth.password')}
          data-testid="login-password"
        />
      </Form.Item>

      {login.isError && (
        <Form.Item>
          <Alert message={t('auth.errors.loginFailed')} type="error" showIcon />
        </Form.Item>
      )}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={login.isPending}
          block
          data-testid="login-submit"
        >
          {t('auth.submit')}
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        <Text>{t('auth.noAccount')} </Text>
        <Link to="/signup">{t('auth.signup')}</Link>
      </div>
    </Form>
  )
}
