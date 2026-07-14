import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons'
import { Form, Input, Button, Alert, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router-dom'
import { useSignup } from './hooks'

const { Text } = Typography

interface SignupFormValues {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export function SignupForm() {
  const { t } = useTranslation()
  const signup = useSignup()
  const navigate = useNavigate()

  const handleSubmit = (values: SignupFormValues) => {
    signup.mutate(
      { email: values.email, password: values.password, name: values.name },
      {
        onSuccess: () => {
          void navigate('/notifications')
        },
      }
    )
  }

  return (
    <Form<SignupFormValues>
      name="signup"
      onFinish={handleSubmit}
      layout="vertical"
      requiredMark={false}
    >
      <Form.Item
        name="name"
        label={t('auth.name')}
        rules={[{ required: true, message: t('auth.errors.nameRequired') }]}
      >
        <Input prefix={<UserOutlined />} placeholder={t('auth.name')} data-testid="signup-name" />
      </Form.Item>

      <Form.Item
        name="email"
        label={t('auth.email')}
        rules={[
          { required: true, message: t('auth.errors.emailRequired') },
          { type: 'email', message: t('auth.errors.emailInvalid') },
        ]}
      >
        <Input prefix={<MailOutlined />} placeholder={t('auth.email')} data-testid="signup-email" />
      </Form.Item>

      <Form.Item
        name="password"
        label={t('auth.password')}
        rules={[
          { required: true, message: t('auth.errors.passwordRequired') },
          { min: 8, message: t('auth.errors.passwordTooShort') },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t('auth.password')}
          data-testid="signup-password"
        />
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
        <Input.Password
          prefix={<LockOutlined />}
          placeholder={t('auth.confirmPassword')}
          data-testid="signup-confirm-password"
        />
      </Form.Item>

      {signup.isError && (
        <Form.Item>
          <Alert message={t('auth.errors.signupFailed')} type="error" showIcon />
        </Form.Item>
      )}

      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          loading={signup.isPending}
          block
          data-testid="signup-submit"
        >
          {t('auth.submit')}
        </Button>
      </Form.Item>

      <div style={{ textAlign: 'center' }}>
        <Text>{t('auth.hasAccount')} </Text>
        <Link to="/login">{t('auth.login')}</Link>
      </div>
    </Form>
  )
}
