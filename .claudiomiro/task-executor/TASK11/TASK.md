@dependencies [TASK6, TASK7.3, TASK9.5]
@scope integration

# Task: Playwright E2E Tests

## Summary
Configure Playwright at monorepo root and create E2E tests for the complete signup flow: frontend form submission through Eden to Elysia backend with Better-Auth and MySQL.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates `/e2e/` directory at monorepo root
- Configures Playwright for E2E testing
- Tests complete user journey: signup flow
- Uses Docker Compose for backend services

## Complexity
Medium

## Dependencies
Depends on: [TASK6, TASK7.3, TASK9.5]
Blocks: [TASK12, TASK15]
Parallel with: []

## Detailed Steps
1. Create E2E package:
   - `/e2e/package.json`
   - `/e2e/playwright.config.ts`
   - `/e2e/tsconfig.json`

2. Configure Playwright:
   - Base URL for frontend (localhost:5173)
   - Backend health check before tests
   - Screenshots on failure
   - HTML reporter

3. Create auth E2E test:
   - `/e2e/tests/auth.spec.ts`
   - Navigate to signup page
   - Fill signup form
   - Submit and verify success
   - Verify user can access protected route

4. Add scripts to root package.json:
   - `test:e2e` - Run Playwright tests
   - Requires Docker Compose services running

5. Create test fixtures:
   - `/e2e/fixtures/auth.ts` - Auth helpers

## Acceptance Criteria
- [ ] Playwright configured at `/e2e/`
- [ ] E2E test navigates to frontend
- [ ] Test fills signup form successfully
- [ ] Test verifies signup success
- [ ] Test runs against Docker Compose services
- [ ] `bun run test:e2e` passes

## Code Review Checklist
- [ ] Tests are independent and repeatable
- [ ] Test data cleaned up between runs
- [ ] Proper waiting strategies (no arbitrary delays)
- [ ] Screenshots captured on failure
- [ ] Health check before test execution

## Reasoning Trace
E2E tests verify the complete user journey from frontend through Eden to backend. Playwright provides reliable browser automation. Running against Docker Compose ensures consistent environment. Auth flow is the critical user journey to verify first.
