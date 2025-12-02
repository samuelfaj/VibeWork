# Research for TASK11

## Context Reference

**For tech stack and conventions, see:**

- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK11/TASK.md` - Task-level context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK11/PROMPT.md` - Task-specific context

**This file contains ONLY new information discovered during research.**

---

## Task Understanding Summary

Configure Playwright E2E tests at `/e2e/` to test the complete auth signup flow: frontend form submission through Eden RPC to Elysia backend with Better-Auth and MySQL.

---

## Similar Components Found (LEARN FROM THESE)

### 1. Unit Test Pattern - `backend/src/__tests__/app.test.ts:1-21`

**Why similar:** Shows Vitest test structure used in project
**Patterns to reuse:**

- Lines 1-2: Import pattern `import { describe, it, expect } from 'vitest'`
- Lines 4-8: Describe block structure with simple assertions
- Lines 16-19: Testing Elysia with `app.handle(new Request(...))`
  **Key learnings:**
- Project uses Vitest for all testing
- Simple describe/it structure without heavy setup

### 2. Health Route Test - `backend/src/routes/__tests__/health.test.ts:1-146`

**Why similar:** Comprehensive Vitest test with mocking and async operations
**Patterns to reuse:**

- Lines 4-8: `vi.mock()` pattern for mocking dependencies
- Lines 17-24: `beforeEach` with `vi.clearAllMocks()`
- Lines 22-24: Factory function `createApp()` for test app creation
- Lines 27-33: HTTP request testing with `app.handle(new Request(...))`
  **Key learnings:**
- Tests use factory functions for app creation
- Parallel assertions verified (lines 99-130)
- Async/await pattern consistently used

### 3. Password Test - `backend/modules/users/core/__tests__/password.test.ts:1-42`

**Why similar:** Simple unit test for core functionality
**Patterns to reuse:**

- Clean describe/it structure without setup
- Both positive and negative test cases
- Edge case handling (empty inputs)
  **Key learnings:**
- Tests follow happy path + edge cases pattern

---

## Reusable Components (USE THESE, DON'T RECREATE)

### 1. No existing Playwright configuration

**Finding:** No Playwright config or E2E tests exist in codebase - greenfield implementation needed.

### 2. Root package.json already configured

**Location:** `/package.json:6-11,23`
**Finding:**

- Workspaces already include `e2e` directory
- `test:e2e` script already defined: `turbo run test:e2e`
  **Integration:** No modification needed for workspaces; just need to add `test:e2e` script to e2e package.json

### 3. Turbo.json E2E task

**Location:** `/turbo.json:22-26`
**Finding:** `test:e2e` task already configured with `cache: false`
**Integration:** E2E package just needs to implement `test:e2e` script

---

## Codebase Conventions Discovered

### File Organization

- Tests in `__tests__/` directories co-located with source
- E2E tests expected at `/e2e/tests/` (from AI_PROMPT.md:88-91)

### Naming Conventions

- Test files: `*.test.ts`
- Spec files for E2E: `*.spec.ts` (per TODO.md)
- Packages: `@vibe/*` or `@vibework/*` naming

### Testing Pattern

```typescript
// Pattern from backend/src/__tests__/app.test.ts
import { describe, it, expect } from 'vitest'

describe('Component', () => {
  it('should behavior description', async () => {
    // Arrange
    // Act
    // Assert
  })
})
```

---

## Integration & Impact Analysis

### Frontend Auth Components:

1. **`SignupForm`** in `frontend/src/features/auth/SignupForm.tsx:1-92`
   - **Form fields:**
     - `id="signup-email"` - email input (line 43)
     - `id="signup-password"` - password input (line 53)
     - `id="signup-confirm-password"` - confirm password (line 65)
     - `button[type="submit"]` - submit button (line 78)
   - **Labels:** Using `htmlFor` with translated text (`t('auth.email')`, etc.)
   - **Error display:** `role="alert"` div (lines 74-76)

2. **`LoginForm`** in `frontend/src/features/auth/LoginForm.tsx:1-62`
   - **Form fields:**
     - `id="login-email"` - email input (line 27)
     - `id="login-password"` - password input (line 37)
     - `button[type="submit"]` - submit button (line 48)
   - **Error display:** `role="alert"` div (line 46)

3. **`hooks.ts`** in `frontend/src/features/auth/hooks.ts:1-62`
   - **useSignup()** - mutation for signup (lines 26-36)
   - **useLogin()** - mutation for login (lines 38-48)
   - **useCurrentUser()** - query for current user (lines 50-62)

### Frontend App Structure:

- `frontend/src/App.tsx:1-19`
  - **No routing** - uses state toggle between Login/Signup forms
  - `showLogin` state controls which form displays
  - **No `/dashboard` route exists** - TODO.md assumption incorrect
  - **No `/signup` or `/login` routes** - forms are inline components

### Backend Auth Endpoints:

- `backend/modules/users/routes/auth.routes.ts:1-6`
  - **Prefix:** `/api/auth/*`
  - Better-Auth handles all routes via `auth.handler(ctx.request)`
  - Expected endpoints (Better-Auth standard):
    - `POST /api/auth/sign-up/email` - signup
    - `POST /api/auth/sign-in/email` - signin

### Health Check Endpoint:

- `backend/src/routes/health.ts:38-39`
  - **GET /healthz** - returns `{ status: 'ok' }`
  - This is the health check URL for Playwright webServer

### Port Configuration:

- Backend: `localhost:3000` (from AI_PROMPT.md)
- Frontend: `localhost:5173` (Vite default, confirmed in frontend/package.json dev script)

### Breaking Changes Assessment:

- **NO breaking changes** - all new files
- Frontend has NO routing - E2E tests should navigate to root `/` and toggle between forms

---

## Test Strategy Discovered

### Testing Framework

- **Framework:** Playwright (to be added)
- **Test command:** `bunx playwright test` (to be configured)
- **Config:** `/e2e/playwright.config.ts` (to be created)

### Test Patterns Found

- Vitest pattern exists but Playwright is different
- E2E tests use `test, expect` from `@playwright/test`
- Page object pattern recommended but not required for simple tests

### Mocking Approach

- E2E tests should NOT mock - test real flow
- Docker Compose provides real services (MySQL, MongoDB, Redis)

---

## Risks & Challenges Identified

### Technical Risks

1. **Frontend has no routing**
   - Impact: High
   - Mitigation: Navigate to `/`, use form toggle buttons instead of URL navigation
   - E2E tests must click "signup" button to switch forms, not navigate to `/signup`

2. **No dashboard page exists**
   - Impact: Medium
   - Mitigation: Verify signup success via:
     - Success state in form
     - API response check
     - Or absence of error alert

3. **Better-Auth endpoints may differ from expected**
   - Impact: Medium
   - Mitigation: Check actual Better-Auth documentation for endpoint paths
   - Expected: `/api/auth/sign-up/email` not `/signup`

4. **Form IDs vs name attributes**
   - Impact: Low
   - Mitigation: Use `getByLabel()` or `id` selectors, not `[name="email"]`
   - Actual: Forms use `id="signup-email"` not `name="email"`

### Complexity Assessment

- Overall: Medium
- Reasoning: Standard Playwright setup, but frontend routing assumptions in TODO.md are incorrect

### Missing Information

- [ ] **Actual post-signup behavior** - Does form redirect? Show success message? Need to verify
- [ ] **Better-Auth exact endpoints** - Need to verify actual endpoint paths

---

## Execution Strategy Recommendation

**Based on research findings, execute in this order:**

1. **Create E2E Package Structure** - Item 1
   - Create: `/e2e/package.json`, `/e2e/tsconfig.json`, `/e2e/playwright.config.ts`
   - Follow pattern from: PROMPT.md:24-48
   - Adjust webServer commands based on actual project scripts
   - Test with: `bun install && bunx playwright install chromium`

2. **Create Auth Fixtures** - Item 2
   - Create: `/e2e/fixtures/auth.ts`
   - **CRITICAL ADJUSTMENT:** Use `#signup-email` not `[name="email"]` selectors
   - Use `getByLabel()` for i18n-safe selection
   - Click toggle buttons to switch forms (no URL routing)

3. **Implement Auth E2E Tests** - Item 3
   - Create: `/e2e/tests/auth.spec.ts`
   - **CRITICAL ADJUSTMENT:**
     - Navigate to `/` (root), not `/signup`
     - Click "signup" toggle if needed
     - Verify success via error alert absence or success message
     - Cannot verify `/dashboard` redirect (page doesn't exist)

4. **Verify & Document** - Item 4
   - Create: `/e2e/.gitignore`
   - Run full test suite
   - Verify consistency (2x runs)

---

## Selector Strategy (CRITICAL)

Based on actual frontend code:

| Element        | TODO.md Expected        | Actual Selector                                   |
| -------------- | ----------------------- | ------------------------------------------------- |
| Email input    | `[name="email"]`        | `#signup-email` or `getByLabel(/email/i)`         |
| Password input | `[name="password"]`     | `#signup-password` or `getByLabel(/^password$/i)` |
| Submit button  | `button[type="submit"]` | `button[type="submit"]` (correct)                 |
| Error message  | -                       | `[role="alert"]`                                  |
| Form toggle    | -                       | Button with text from i18n                        |

**Recommended Playwright selectors:**

```typescript
// Signup form
page.locator('#signup-email')
page.locator('#signup-password')
page.locator('#signup-confirm-password')
page.locator('button[type="submit"]')

// Login form
page.locator('#login-email')
page.locator('#login-password')

// Or use getByLabel for i18n-safe:
page.getByLabel(/email/i)
page.getByLabel(/^password$/i)
```

---

**Research completed:** 2025-12-02
**Total similar components found:** 3 test files
**Total reusable components identified:** 2 (root package.json config, turbo.json task)
**Estimated complexity:** Medium
