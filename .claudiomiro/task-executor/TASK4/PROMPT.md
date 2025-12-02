## PROMPT
Create the `packages/ui` placeholder package for shared React components. Include minimal structure with a placeholder Button component. Sets up for future design system expansion.

## COMPLEXITY
Low

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/packages/ui/package.json`
- `/packages/ui/tsconfig.json`
- `/packages/ui/src/index.ts`
- `/packages/ui/src/Button.tsx`

### Package Configuration

**package.json:**
```json
{
  "name": "@vibe/ui",
  "version": "0.0.1",
  "main": "src/index.ts",
  "types": "src/index.ts",
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

**Placeholder Button:**
```tsx
import { type ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
}

export function Button({ children, onClick }: ButtonProps) {
  return <button onClick={onClick}>{children}</button>
}
```

## EXTRA DOCUMENTATION
None required for placeholder.

## LAYER
1

## PARALLELIZATION
Parallel with: [TASK1, TASK2, TASK3]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Keep minimal - this is a placeholder
- React as peer dependency
- Verify compilation with `bun run build`
