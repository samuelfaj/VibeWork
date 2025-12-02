# @vibe/ui

Shared React UI component library for the VibeWork frontend application.

## Purpose

Provides reusable, themeable UI components that can be used across different parts of the application.

## Structure

```
src/
├── index.ts        # Barrel export (export all components)
└── Button.tsx      # Button component example
```

## Available Components

### `Button`

A simple, reusable button component.

**Props:**

```typescript
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
  loading?: boolean
}
```

**Usage:**

```typescript
import { Button } from '@vibe/ui'

export function MyComponent() {
  return (
    <Button variant="primary" onClick={() => console.log('clicked')}>
      Click me
    </Button>
  )
}
```

## Adding New Components

1. Create a new file in `src/` with your component:

   ```typescript
   // src/Card.tsx
   export function Card({ children }: { children: React.ReactNode }) {
     return <div className="card">{children}</div>
   }
   ```

2. Export from `src/index.ts`:

   ```typescript
   export { Button } from './Button'
   export { Card } from './Card'
   ```

3. Use in frontend packages:
   ```typescript
   import { Button, Card } from '@vibe/ui'
   ```

## Component Best Practices

- **Keep components small**: Single responsibility principle
- **Type props with TypeScript**: Use interfaces or type aliases
- **Document with JSDoc**: Include examples in comments
- **Support customization**: Use CSS classes or style props for theming
- **Test complex logic**: Add unit tests in `__tests__/` folder
- **Avoid business logic**: UI components should be presentational

## Styling Approach

Currently supports:

- Inline styles
- CSS modules (if added)
- Tailwind CSS (if configured)
- Ant Design theme integration

## Quick Start

```bash
# Install dependencies
bun install

# Type check
bun run typecheck

# Build
bun run build

# Run tests (when added)
bun run test

# Lint
bun run lint
```

## Building

```bash
# Build this package
bun run build --filter @vibe/ui

# Watch mode during development
bun run dev --filter @vibe/ui
```

## Importing in Other Packages

From `@vibe/frontend`:

```typescript
import { Button } from '@vibe/ui'
```

The workspace configuration automatically resolves `@vibe/ui` to the local package during development.

## Dependencies

- `react` ^18.2.0 - Core UI library
- `react-dom` ^18.2.0 - React DOM utilities
- `typescript` ^5.3.0 - Type checking

## Future Improvements

- [ ] Add more components (Card, Modal, Input, Select, etc.)
- [ ] Create Storybook for component documentation
- [ ] Add Tailwind CSS for consistent styling
- [ ] Implement theming system (light/dark mode)
- [ ] Add accessibility testing (a11y)
- [ ] Component prop variants system
