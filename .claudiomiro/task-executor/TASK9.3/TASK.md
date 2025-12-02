@dependencies [TASK3, TASK4, TASK9.1]
@scope frontend

# Task: Eden/TanStack Query Setup + React Entry Point

## Summary
Configure Eden client for type-safe API calls, TanStack Query v5 for data fetching, and create React application entry points.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions

**Task-Specific Context:**
- Creates `/frontend/src/lib/api.ts` - Eden client
- Creates `/frontend/src/lib/query.ts` - QueryClient setup
- Creates `/frontend/src/main.tsx` - React entry point
- Creates `/frontend/src/App.tsx` - Root component

## Complexity
Medium

## Dependencies
Depends on: [TASK3, TASK4, TASK9.1]
Blocks: [TASK9.4, TASK9.5]
Parallel with: []

## Detailed Steps
1. Create `/frontend/src/lib/api.ts`:
   - Import treaty from @elysiajs/eden
   - Import App type from @vibe/contract or backend
   - Create treaty client with env-based URL

2. Create `/frontend/src/lib/query.ts`:
   - Create QueryClient with defaultOptions
   - staleTime: 5 minutes
   - retry: 1
   - refetchOnWindowFocus: false

3. Create `/frontend/src/main.tsx`:
   - Import React, ReactDOM
   - Import QueryClientProvider
   - Import i18n (side effect)
   - Render App wrapped in providers

4. Create `/frontend/src/App.tsx`:
   - Basic placeholder component
   - Import for future auth components

## Acceptance Criteria
- [ ] Eden client creates type-safe treaty instance
- [ ] QueryClient has correct default options
- [ ] main.tsx renders App with QueryClientProvider
- [ ] App.tsx exists as placeholder
- [ ] TypeScript compiles without errors

## Code Review Checklist
- [ ] Eden client uses environment variable for API URL
- [ ] QueryClient options are reasonable
- [ ] Providers are properly nested
