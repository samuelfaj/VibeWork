Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**
1. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
2. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK9.4/TASK.md` - Task-level context
3. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK9.4/PROMPT.md` - Patterns to follow

---

## Implementation Plan

- [ ] **Item 1 — Create auth hooks**
  - **What to do:**
    Create `/frontend/src/features/auth/hooks.ts` with:
    - useSignup: useMutation for POST /signup
    - useLogin: useMutation for POST /login
    - useCurrentUser: useQuery for GET /users/me with retry: false

  - **Touched:** CREATE `/frontend/src/features/auth/hooks.ts`

---

- [ ] **Item 2 — Create LoginForm component**
  - **What to do:**
    Create `/frontend/src/features/auth/LoginForm.tsx` with:
    - Controlled inputs for email and password
    - useLogin hook integration
    - useTranslation for all labels and messages
    - Error display on login failure
    - Loading state during submission
    - Disabled button while pending
    - Link to signup

  - **Touched:** CREATE `/frontend/src/features/auth/LoginForm.tsx`

---

- [ ] **Item 3 — Create SignupForm component**
  - **What to do:**
    Create `/frontend/src/features/auth/SignupForm.tsx` with:
    - Controlled inputs for email, password, confirmPassword
    - Client-side validation: password match, min length
    - useSignup hook integration
    - useTranslation for all labels and messages
    - Error display on signup failure
    - Loading state during submission
    - Link to login

  - **Touched:** CREATE `/frontend/src/features/auth/SignupForm.tsx`

---

- [ ] **Item 4 — Create barrel export and update App**
  - **What to do:**
    1. Create `/frontend/src/features/auth/index.ts`:
       - Export LoginForm, SignupForm from components
       - Export hooks
    2. Update `/frontend/src/App.tsx`:
       - Import auth components
       - Render LoginForm and SignupForm (or basic toggle)

  - **Touched:**
    - CREATE `/frontend/src/features/auth/index.ts`
    - MODIFY `/frontend/src/App.tsx`

---

## Verification

- [ ] Run `bun run typecheck` in frontend directory
- [ ] All form labels use i18n translations
- [ ] Forms handle errors gracefully

## Acceptance Criteria

- [ ] useSignup calls POST /signup
- [ ] useLogin calls POST /login
- [ ] useCurrentUser queries GET /users/me
- [ ] LoginForm renders with translated labels
- [ ] SignupForm validates password match
- [ ] All text uses useTranslation hook
- [ ] Forms show loading state
- [ ] Forms display API errors
