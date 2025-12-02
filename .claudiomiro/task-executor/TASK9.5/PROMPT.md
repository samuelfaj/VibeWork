## PROMPT
Create CLAUDE.md documentation for the frontend and perform end-to-end verification.

## COMPLEXITY
Low

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Full tech stack, architecture

**You MUST read AI_PROMPT.md before executing this task.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/frontend/CLAUDE.md`

### Patterns to Follow

**CLAUDE.md template:**
```markdown
# Frontend Application

## Purpose
React + Vite frontend for the Vibe application with type-safe API calls via Eden.

## Tech Stack
- React 18+ with Vite
- @elysiajs/eden for type-safe RPC
- TanStack Query v5 for data fetching
- react-i18next for internationalization

## Quick Start
\`\`\`bash
bun install
bun run dev     # Starts on http://localhost:5173
bun run build   # Production build
bun run preview # Preview production build
\`\`\`

## Structure
\`\`\`
src/
├── features/
│   └── auth/          # Authentication UI
├── i18n/              # Internationalization
│   └── locales/       # en.json, pt-BR.json
└── lib/
    ├── api.ts         # Eden client
    └── query.ts       # TanStack Query setup
\`\`\`

## Adding Features
1. Create feature folder: `src/features/<name>/`
2. Add hooks in `hooks.ts`
3. Add components in `*.tsx`
4. Add translations to locales

## Environment Variables
- `VITE_API_URL` - Backend API URL (default: http://localhost:3000)

## Testing
\`\`\`bash
bun test              # Run all tests
bun test:coverage     # With coverage
\`\`\`
```

## LAYER
4

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push
- Verify all commands in documentation actually work
- Update structure diagram to match actual files
