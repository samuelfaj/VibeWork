# Guia de Componentes do Frontend

Guia para componentes do frontend, padrões e melhores práticas.

## Organização de Componentes

Componentes são organizados por feature:

```
src/
├── features/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── hooks.ts
│   │   └── index.ts
│   └── [other-features]/
└── lib/
    ├── AntdProvider.tsx      # Configuração de tema
    └── [utilities]/
```

## Componentes de Auth

### LoginForm

Componente de login com campos email/password.

**Localização:** `src/features/auth/LoginForm.tsx`

**Props:**

```typescript
interface LoginFormProps {
  onSuccess?: () => void
  loading?: boolean
}
```

**Uso:**

```typescript
import { LoginForm } from '@/features/auth'

export const LoginPage = () => {
  return (
    <LoginForm onSuccess={() => navigate('/dashboard')} />
  )
}
```

**Features:**

- Validação de formulário
- Tratamento de erro
- Estado de carregamento
- Labels de i18n
- Toggle de visibilidade de senha

**Implementação:**

```typescript
import { Form, Input, Button, message } from 'antd'
import { useLogin } from './hooks'
import { useTranslation } from 'react-i18next'

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { t } = useTranslation()
  const { mutate: login, isPending } = useLogin()

  const onFinish = (values: any) => {
    login(values, {
      onSuccess: () => {
        message.success(t('auth.login_success'))
        onSuccess?.()
      },
      onError: (error) => {
        message.error(t('auth.login_error'))
      }
    })
  }

  return (
    <Form onFinish={onFinish} layout="vertical">
      <Form.Item
        name="email"
        label={t('auth.email')}
        rules={[
          { required: true, message: t('auth.email_required') },
          { type: 'email', message: t('auth.email_invalid') }
        ]}
      >
        <Input placeholder="user@example.com" />
      </Form.Item>

      <Form.Item
        name="password"
        label={t('auth.password')}
        rules={[{ required: true, message: t('auth.password_required') }]}
      >
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={isPending}>
          {t('auth.login')}
        </Button>
      </Form.Item>
    </Form>
  )
}
```

### SignupForm

Componente de signup com validação.

**Localização:** `src/features/auth/SignupForm.tsx`

**Props:**

```typescript
interface SignupFormProps {
  onSuccess?: () => void
  loading?: boolean
}
```

**Uso:**

```typescript
import { SignupForm } from '@/features/auth'

export const SignupPage = () => {
  return (
    <SignupForm onSuccess={() => navigate('/dashboard')} />
  )
}
```

**Features:**

- Validação de email
- Verificação de força de senha
- Confirmação de senha
- Aceitação de termos
- Labels de i18n
- Feedback de validação em tempo real

**Regras de Validação:**

- Email: Formato de email válido
- Password: Min 8 chars, maiúscula, minúscula, número
- Confirm: Deve corresponder à senha
- Terms: Deve ser aceito

## Integração Ant Design

### Configuração de Tema

**Localização:** `src/lib/AntdProvider.tsx`

```typescript
import { ConfigProvider } from 'antd'
import type { ThemeConfig } from 'antd'

const themeConfig: ThemeConfig = {
  token: {
    colorPrimary: '#1890ff',
    fontSize: 14,
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto'
  },
  components: {
    Button: {
      controlHeight: 40,
      primaryColor: '#1890ff'
    },
    Input: {
      controlHeight: 40
    },
    Form: {
      labelFontSize: 14
    }
  }
}

export const AntdProvider = ({ children }) => (
  <ConfigProvider theme={themeConfig}>
    {children}
  </ConfigProvider>
)
```

### Componentes Comuns

**Campos de Formulário:**

```typescript
import { Form, Input, Select, Checkbox, Radio } from 'antd'

<Form.Item name="email" label="Email">
  <Input type="email" />
</Form.Item>

<Form.Item name="country" label="Country">
  <Select
    options={[
      { label: 'USA', value: 'us' },
      { label: 'Brazil', value: 'br' }
    ]}
  />
</Form.Item>

<Form.Item name="agree" valuePropName="checked">
  <Checkbox>I agree to terms</Checkbox>
</Form.Item>
```

**Botões:**

```typescript
import { Button, Space } from 'antd'

<Space>
  <Button type="primary">Submit</Button>
  <Button>Cancel</Button>
  <Button danger>Delete</Button>
</Space>
```

**Mensagens & Notificações:**

```typescript
import { message, notification } from 'antd'

// Mensagem rápida
message.success('Saved successfully')
message.error('An error occurred')

// Notificação detalhada
notification.success({
  message: 'Success',
  description: 'Your action completed successfully',
})
```

**Carregamento & Feedback:**

```typescript
import { Spin, Skeleton, Progress } from 'antd'

<Spin spinning={isLoading} tip="Loading...">
  <Content />
</Spin>

<Skeleton loading={isLoading} active>
  <Content />
</Skeleton>

<Progress percent={75} />
```

## Padrões de Componente

### Padrão de Custom Hooks

```typescript
// hooks.ts - Lógica customizada em hooks
import { useMutation, useQuery } from '@tanstack/react-query'
import { client } from '@/lib/api'

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials) => {
      const response = await client.api.auth['sign-in'].email.post(
        credentials
      )
      return response
    }
  })
}

// Componente - Apenas UI
import { useLogin } from './hooks'

export const LoginForm = () => {
  const { mutate: login, isPending } = useLogin()

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      login(formData)
    }}>
      {/* Campos do formulário */}
    </form>
  )
}
```

### Padrão de Compound Components

```typescript
// Crie componentes flexíveis e compostos
export const Card = ({ children }) => (
  <div className="card">{children}</div>
)

export const Card.Header = ({ title }) => (
  <div className="card-header">{title}</div>
)

export const Card.Body = ({ children }) => (
  <div className="card-body">{children}</div>
)

// Uso
<Card>
  <Card.Header title="User Info" />
  <Card.Body>
    {/* content */}
  </Card.Body>
</Card>
```

### Padrão de Render Props

```typescript
interface DataFetcherProps {
  children: (data: any, isLoading: boolean) => ReactNode
}

export const DataFetcher = ({ children }: DataFetcherProps) => {
  const { data, isLoading } = useQuery(...)
  return children(data, isLoading)
}

// Uso
<DataFetcher>
  {(data, isLoading) => (
    isLoading ? <Spin /> : <div>{data}</div>
  )}
</DataFetcher>
```

## Styling

### CSS Modules

```typescript
// Button.module.css
.button {
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.primary {
  background-color: #1890ff;
  color: white;
}

// Button.tsx
import styles from './Button.module.css'

export const Button = ({ variant = 'primary', children }) => (
  <button className={`${styles.button} ${styles[variant]}`}>
    {children}
  </button>
)
```

### Tailwind CSS (Opcional)

```typescript
// Com classes de utilidade Tailwind
export const Card = ({ children }) => (
  <div className="p-4 rounded-lg border border-gray-200 shadow-md">
    {children}
  </div>
)
```

### Inline Styles

```typescript
export const Container = ({ children }) => {
  const styles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh'
  }
  return <div style={styles}>{children}</div>
}
```

## Design Responsivo

### Abordagem Mobile-First

```typescript
import { useMediaQuery } from 'react-responsive'

export const ResponsiveLayout = () => {
  const isMobile = useMediaQuery({ maxWidth: 600 })
  const isTablet = useMediaQuery({ minWidth: 601, maxWidth: 1024 })

  return (
    <div>
      {isMobile && <MobileMenu />}
      {isTablet && <TabletLayout />}
      {!isMobile && !isTablet && <DesktopLayout />}
    </div>
  )
}
```

### CSS Media Queries

```css
/* Mobile */
@media (max-width: 600px) {
  .container {
    flex-direction: column;
  }
}

/* Tablet */
@media (min-width: 601px) and (max-width: 1024px) {
  .container {
    grid-template-columns: 2fr 1fr;
  }
}

/* Desktop */
@media (min-width: 1025px) {
  .container {
    grid-template-columns: 3fr 1fr;
  }
}
```

## Acessibilidade

### Labels ARIA

```typescript
// Botão com label acessível
<button aria-label="Close menu">
  <CloseIcon />
</button>

// Descreva uma região
<nav aria-label="Main navigation">
  {/* nav content */}
</nav>

// Marque regiões ao vivo
<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

### HTML Semântico

```typescript
// Bom
<button onClick={handleSubmit}>Submit</button>
<nav>{navigationLinks}</nav>
<article>{content}</article>

// Evite
<div onClick={handleSubmit} role="button">Submit</div>
<div>{navigationLinks}</div>
<div>{content}</div>
```

### Navegação de Teclado

```typescript
export const Menu = () => {
  const [focusedIndex, setFocusedIndex] = useState(0)

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      setFocusedIndex(prev => (prev + 1) % items.length)
    }
    if (e.key === 'ArrowUp') {
      setFocusedIndex(prev => (prev - 1 + items.length) % items.length)
    }
  }

  return (
    <ul onKeyDown={handleKeyDown}>
      {items.map((item, i) => (
        <li
          key={i}
          tabIndex={focusedIndex === i ? 0 : -1}
          className={focusedIndex === i ? 'focused' : ''}
        >
          {item}
        </li>
      ))}
    </ul>
  )
}
```

## Error Boundaries

```typescript
import { Component, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>{this.state.error?.message}</p>
        </div>
      )
    }

    return this.props.children
  }
}
```

## Melhores Práticas

### Do's ✅

- Mantenha componentes focados (single responsibility)
- Use TypeScript para tipos de props
- Memoize computações caras
- Extraia lógica para custom hooks
- Use componentes Ant Design
- Siga convenções de nomes
- Adicione atributos de acessibilidade
- Trate estados de carregamento/erro

### Don'ts ❌

- Evite prop drilling (use context se necessário)
- Não crie componentes dentro de componentes
- Evite definições de função inline em render
- Não mute state diretamente
- Evite promises não tratadas
- Não hardcode strings (use i18n)
- Não pule error boundaries
- Evite componentes grandes (200+ linhas)

## Testando Componentes

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('should submit form with valid data', () => {
    render(<LoginForm />)

    const emailInput = screen.getByLabelText('Email')
    const passwordInput = screen.getByLabelText('Password')
    const submitButton = screen.getByRole('button', { name: 'Login' })

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } })
    fireEvent.change(passwordInput, { target: { value: 'password123' } })
    fireEvent.click(submitButton)

    expect(screen.queryByText('Loading...')).toBeInTheDocument()
  })
})
```

## Próximos Passos

- [Guia de Gerenciamento de Estado](./state-management.md) - Padrões de busca de dados
- [Guia de Internacionalização](./internationalization.md) - Setup multi-idioma
- [Guia de Testes](./testing.md) - Testes de componentes
- [Ant Design Docs](https://ant.design) - Referência de biblioteca de componentes

---

**Última Atualização**: Dezembro 2024
