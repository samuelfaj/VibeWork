# Frontend Components Guide

Guide to frontend components, patterns, and best practices.

## Component Organization

Components are organized by feature:

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
    ├── AntdProvider.tsx      # Theme configuration
    └── [utilities]/
```

## Auth Components

### LoginForm

Login component with email/password fields.

**Location:** `src/features/auth/LoginForm.tsx`

**Props:**

```typescript
interface LoginFormProps {
  onSuccess?: () => void
  loading?: boolean
}
```

**Usage:**

```typescript
import { LoginForm } from '@/features/auth'

export const LoginPage = () => {
  return (
    <LoginForm onSuccess={() => navigate('/dashboard')} />
  )
}
```

**Features:**

- Form validation
- Error handling
- Loading state
- i18n labels
- Password visibility toggle

**Implementation:**

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

Sign up component with validation.

**Location:** `src/features/auth/SignupForm.tsx`

**Props:**

```typescript
interface SignupFormProps {
  onSuccess?: () => void
  loading?: boolean
}
```

**Usage:**

```typescript
import { SignupForm } from '@/features/auth'

export const SignupPage = () => {
  return (
    <SignupForm onSuccess={() => navigate('/dashboard')} />
  )
}
```

**Features:**

- Email validation
- Password strength check
- Password confirmation
- Terms acceptance
- i18n labels
- Real-time validation feedback

**Validation Rules:**

- Email: Valid email format
- Password: Min 8 chars, uppercase, lowercase, number
- Confirm: Must match password
- Terms: Must be accepted

## Ant Design Integration

### Theme Configuration

**Location:** `src/lib/AntdProvider.tsx`

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

### Common Components

**Form Fields:**

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

**Buttons:**

```typescript
import { Button, Space } from 'antd'

<Space>
  <Button type="primary">Submit</Button>
  <Button>Cancel</Button>
  <Button danger>Delete</Button>
</Space>
```

**Messages & Notifications:**

```typescript
import { message, notification } from 'antd'

// Quick message
message.success('Saved successfully')
message.error('An error occurred')

// Detailed notification
notification.success({
  message: 'Success',
  description: 'Your action completed successfully',
})
```

**Loading & Feedback:**

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

## Component Patterns

### Custom Hooks Pattern

```typescript
// hooks.ts - Custom logic in hooks
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

// Component - Just UI
import { useLogin } from './hooks'

export const LoginForm = () => {
  const { mutate: login, isPending } = useLogin()

  return (
    <form onSubmit={(e) => {
      e.preventDefault()
      login(formData)
    }}>
      {/* Form fields */}
    </form>
  )
}
```

### Compound Components Pattern

```typescript
// Create flexible, composable components
export const Card = ({ children }) => (
  <div className="card">{children}</div>
)

export const Card.Header = ({ title }) => (
  <div className="card-header">{title}</div>
)

export const Card.Body = ({ children }) => (
  <div className="card-body">{children}</div>
)

// Usage
<Card>
  <Card.Header title="User Info" />
  <Card.Body>
    {/* content */}
  </Card.Body>
</Card>
```

### Render Props Pattern

```typescript
interface DataFetcherProps {
  children: (data: any, isLoading: boolean) => ReactNode
}

export const DataFetcher = ({ children }: DataFetcherProps) => {
  const { data, isLoading } = useQuery(...)
  return children(data, isLoading)
}

// Usage
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

### Tailwind CSS (Optional)

```typescript
// With Tailwind utility classes
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

## Responsive Design

### Mobile-First Approach

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

## Accessibility

### ARIA Labels

```typescript
// Button with accessible label
<button aria-label="Close menu">
  <CloseIcon />
</button>

// Describe a region
<nav aria-label="Main navigation">
  {/* nav content */}
</nav>

// Mark live regions
<div aria-live="polite" aria-atomic="true">
  {message}
</div>
```

### Semantic HTML

```typescript
// Good
<button onClick={handleSubmit}>Submit</button>
<nav>{navigationLinks}</nav>
<article>{content}</article>

// Avoid
<div onClick={handleSubmit} role="button">Submit</div>
<div>{navigationLinks}</div>
<div>{content}</div>
```

### Keyboard Navigation

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

## Best Practices

### Do's ✅

- Keep components focused (single responsibility)
- Use TypeScript for prop types
- Memoize expensive computations
- Extract logic to custom hooks
- Use Ant Design components
- Follow naming conventions
- Add accessibility attributes
- Handle loading/error states

### Don'ts ❌

- Avoid prop drilling (use context if needed)
- Don't create components inside components
- Avoid inline function definitions in render
- Don't mutate state directly
- Avoid unhandled promises
- Don't hardcode strings (use i18n)
- Don't skip error boundaries
- Avoid large components (200+ lines)

## Testing Components

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

## Next Steps

- [State Management Guide](./state-management.md) - Data fetching patterns
- [Internationalization Guide](./internationalization.md) - Multi-language setup
- [Testing Guide](./testing.md) - Component testing
- [Ant Design Docs](https://ant.design) - Component library reference

---

**Last Updated**: December 2024
