# Shared UI Components

Documentation for reusable UI components in the UI package.

## Overview

The `@vibe/ui` package contains shared UI components used across the application.

## Location

```
packages/ui/
├── src/
│   ├── Button.tsx
│   ├── index.ts
│   └── __tests__/
├── dist/
└── package.json
```

## Existing Components

### Button

Basic button component with multiple variants.

**Location:** `src/Button.tsx`

**Props:**

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  disabled?: boolean
}
```

**Usage:**

```typescript
import { Button } from '@vibe/ui'

// Primary button
<Button>Click me</Button>

// Different variants
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>
<Button variant="ghost">Cancel</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// Loading state
<Button loading={isLoading}>Save</Button>

// Disabled
<Button disabled>Disabled</Button>
```

## Design System

### Color Tokens

```typescript
const colors = {
  primary: '#1890ff',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#f5222d',
  error: '#f5222d',

  gray: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
}
```

### Typography

```typescript
const typography = {
  heading1: {
    fontSize: '32px',
    fontWeight: 'bold',
    lineHeight: 1.2,
  },
  heading2: {
    fontSize: '24px',
    fontWeight: 'bold',
    lineHeight: 1.35,
  },
  body: {
    fontSize: '14px',
    lineHeight: 1.5,
  },
  small: {
    fontSize: '12px',
    lineHeight: 1.5,
  },
}
```

### Spacing

```typescript
const spacing = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
}
```

## Creating Components

### Component Template

```typescript
// src/MyComponent.tsx
import { CSSProperties } from 'react'

interface MyComponentProps {
  title: string
  children?: React.ReactNode
  variant?: 'default' | 'alt'
  disabled?: boolean
  className?: string
  style?: CSSProperties
}

export const MyComponent = ({
  title,
  children,
  variant = 'default',
  disabled = false,
  className,
  style
}: MyComponentProps) => {
  return (
    <div
      className={`my-component my-component--${variant} ${className}`}
      style={style}
      data-disabled={disabled}
    >
      <h3>{title}</h3>
      {children}
    </div>
  )
}
```

### Styling

Use CSS Modules:

```css
/* src/MyComponent.module.css */
.myComponent {
  padding: 16px;
  border-radius: 4px;
  background-color: white;
}

.myComponent--default {
  border: 1px solid #e0e0e0;
}

.myComponent--alt {
  border: 1px solid #1890ff;
  background-color: #f0f5ff;
}

.myComponent[data-disabled='true'] {
  opacity: 0.6;
  cursor: not-allowed;
}
```

## Adding to Package

1. Create component file in `src/`
2. Add test file in `src/__tests__/`
3. Export from `src/index.ts`
4. Document with JSDoc comments
5. Run tests: `bun run test`
6. Build: `bun run build`

### Export

**src/index.ts:**

```typescript
export { Button, type ButtonProps } from './Button'
export { MyComponent, type MyComponentProps } from './MyComponent'
```

## Using in Projects

### Frontend

```typescript
import { Button, MyComponent } from '@vibe/ui'

export const MyPage = () => {
  return (
    <div>
      <MyComponent title="Example">
        Content here
      </MyComponent>
      <Button>Submit</Button>
    </div>
  )
}
```

### Backend (if needed)

For email templates or server rendering:

```typescript
import { Button } from '@vibe/ui'
// May not work depending on component implementation
```

## Accessibility

All components should be accessible:

- ✅ Semantic HTML
- ✅ ARIA labels where needed
- ✅ Keyboard navigation support
- ✅ Focus visible states
- ✅ Color contrast compliance

### Example

```typescript
export const Button = ({ children, disabled, ...props }: ButtonProps) => {
  return (
    <button
      {...props}
      disabled={disabled}
      aria-pressed={props['aria-pressed']}
      aria-label={props['aria-label']}
      className={`button ${disabled ? 'button--disabled' : ''}`}
    >
      {children}
    </button>
  )
}
```

## Testing Components

```typescript
// src/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '../Button'

describe('Button', () => {
  it('should render button text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('should be clickable', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()

    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button'))

    expect(onClick).toHaveBeenCalled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('should show loading state', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true')
  })
})
```

## Storybook (Optional)

For visual component documentation:

```typescript
// Button.stories.tsx
import { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta = {
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
  args: { children: 'Click me', variant: 'primary' },
}

export const Secondary: Story = {
  args: { children: 'Cancel', variant: 'secondary' },
}

export const Loading: Story = {
  args: { children: 'Save', loading: true },
}

export const Disabled: Story = {
  args: { children: 'Disabled', disabled: true },
}
```

## Component Library Benefits

- **Consistency**: Shared components maintain UI consistency
- **Reusability**: No code duplication
- **Maintainability**: Update once, used everywhere
- **Scalability**: Easy to extend component library
- **Accessibility**: Implement accessibility once

## Future Components

Potential components to add:

- [ ] Card
- [ ] Input
- [ ] TextArea
- [ ] Select
- [ ] Modal
- [ ] Dropdown
- [ ] Tabs
- [ ] Accordion
- [ ] Toast/Notification
- [ ] Loading Spinner
- [ ] Badge
- [ ] Avatar
- [ ] Breadcrumb
- [ ] Pagination

## Publishing

When ready to publish to npm:

```bash
npm publish --workspace=packages/ui
```

Or use Changesets for versioning:

```bash
bun changeset
bun changeset version
bun changeset publish
```

## Best Practices

### Do's ✅

- Keep components focused and reusable
- Document with JSDoc and Storybook
- Test thoroughly
- Support theming/customization
- Export TypeScript types
- Use semantic HTML
- Support accessibility

### Don'ts ❌

- Don't create overly complex components
- Don't hardcode colors/spacing
- Don't assume target environment (React only)
- Don't forget accessibility
- Don't skip TypeScript types
- Don't create duplicate components

## Resources

- [Component Design Patterns](https://react.dev/learn/passing-props-to-a-component)
- [Accessibility (a11y)](https://www.w3.org/WAI/WCAG21/quickref/)
- [Design Systems](https://www.designsystems.com/)
- [Ant Design Components](https://ant.design/components/overview/)

---

**Last Updated**: December 2024
