@dependencies [TASK0, TASK1, TASK5.1, TASK5.2, TASK5.3, TASK5.4]
@scope backend

# Task: Backend CLAUDE.md Documentation

## Summary
Create comprehensive CLAUDE.md documentation for the backend package, documenting purpose, structure, scripts, environment variables, and API endpoints.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions

**Task-Specific Context:**
- Creates `/backend/CLAUDE.md`
- Documents all backend infrastructure created in TASK5.1-5.4
- Provides development setup instructions

## Complexity
Low

## Dependencies
Depends on: [TASK0, TASK1, TASK5.1, TASK5.2, TASK5.3, TASK5.4]
Blocks: []
Parallel with: []

## Detailed Steps
1. Create `/backend/CLAUDE.md` documenting:
   - Purpose: Backend service for VibeWork monorepo
   - Tech stack: Bun, ElysiaJS, Drizzle, Typegoose, Redis, Pub/Sub
   - Directory structure with descriptions
   - Available scripts (dev, build, test, lint)
   - Environment variables reference table
   - API endpoints summary (health endpoints)
   - Development setup instructions

## Acceptance Criteria
- [ ] CLAUDE.md documents backend purpose
- [ ] Tech stack listed
- [ ] Directory structure explained
- [ ] Scripts documented
- [ ] Environment variables listed
- [ ] API endpoints documented
- [ ] Development setup clear

## Code Review Checklist
- [ ] No actual secrets in documentation
- [ ] References .env.example for variables
- [ ] Concise but complete

## Reasoning Trace
CLAUDE.md provides quick reference for AI assistants and developers. Documenting after implementation ensures accuracy.
