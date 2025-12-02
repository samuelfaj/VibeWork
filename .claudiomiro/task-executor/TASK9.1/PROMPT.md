## PROMPT
Create the frontend Vite + React project scaffold with TypeScript configuration and workspace dependencies.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Full tech stack, architecture, project structure

**You MUST read AI_PROMPT.md before executing this task.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/frontend/package.json`
- `/frontend/tsconfig.json`
- `/frontend/vite.config.ts`
- `/frontend/index.html`
- `/frontend/src/vite-env.d.ts`

### Patterns to Follow

**package.json structure:**
```json
{
  "name": "@vibe/frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@elysiajs/eden": "^1.0.0",
    "@tanstack/react-query": "^5.0.0",
    "react-i18next": "^14.0.0",
    "i18next": "^23.0.0",
    "i18next-browser-languagedetector": "^7.0.0",
    "@vibe/contract": "workspace:*",
    "@vibe/ui": "workspace:*"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0"
  }
}
```

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### Integration Points
- Workspace dependency: `@vibe/contract` from packages/contract
- Workspace dependency: `@vibe/ui` from packages/ui

## LAYER
4

## PARALLELIZATION
Parallel with: [TASK9.2]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push
- Verify with `bun install` in frontend directory
- Path aliases must match between tsconfig.json and vite.config.ts
