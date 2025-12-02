@dependencies [TASK3, TASK4, TASK9.1, TASK9.2, TASK9.3]
@scope frontend

# Task: Authentication UI (Login/Signup Forms + Hooks)

## Summary
Create authentication UI components including Login and Signup forms with TanStack Query hooks for API calls, using i18n for all text.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions

**Task-Specific Context:**
- Creates auth hooks in `/frontend/src/features/auth/hooks.ts`
- Creates LoginForm component
- Creates SignupForm component
- Integrates with Eden client and i18n

## Complexity
Medium

## Dependencies
Depends on: [TASK3, TASK4, TASK9.1, TASK9.2, TASK9.3]
Blocks: [TASK9.5]
Parallel with: []

## Detailed Steps
1. Create `/frontend/src/features/auth/hooks.ts`:
   - useSignup mutation (POST /signup)
   - useLogin mutation (POST /login)
   - useCurrentUser query (GET /users/me)

2. Create `/frontend/src/features/auth/LoginForm.tsx`:
   - Controlled form with email/password
   - useLogin hook integration
   - Error display with i18n
   - Loading state
   - Link to signup

3. Create `/frontend/src/features/auth/SignupForm.tsx`:
   - Controlled form with email/password/confirmPassword
   - Client-side validation (password match)
   - useSignup hook integration
   - Error display with i18n
   - Loading state
   - Link to login

4. Create `/frontend/src/features/auth/index.ts` - barrel export

5. Update `/frontend/src/App.tsx` to render auth components

## Acceptance Criteria
- [ ] useSignup calls POST /signup with email/password
- [ ] useLogin calls POST /login with email/password
- [ ] useCurrentUser queries GET /users/me
- [ ] LoginForm renders with translated labels
- [ ] SignupForm validates password match
- [ ] All text uses useTranslation hook
- [ ] Forms show loading state during submission
- [ ] Forms display API errors

## Code Review Checklist
- [ ] No hardcoded strings in components
- [ ] Password field uses type="password"
- [ ] Forms prevent double submission
- [ ] Error messages are user-friendly
