Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**
1. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
2. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.3/TASK.md` - Task-level context
3. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.3/PROMPT.md` - Task-specific patterns

---

## Implementation Plan

- [ ] **Step 1 — Create i18n module**
  - **What to do:**
    - Create `/backend/src/i18n/index.ts`
    - initI18n() - initialize i18next
    - t() - translation function
    - getLanguageFromHeader() - parse Accept-Language
    - Fallback to 'en'
  - **Touched:** CREATE `/backend/src/i18n/index.ts`

- [ ] **Step 2 — Create English locale**
  - **What to do:**
    - Create `/backend/src/i18n/locales/en.json`
    - errors: validation, unauthorized, forbidden, notFound, serverError, badRequest, conflict, timeout, tooManyRequests, serviceUnavailable
    - health: ok, ready, notReady
  - **Touched:** CREATE `/backend/src/i18n/locales/en.json`

- [ ] **Step 3 — Create Portuguese locale**
  - **What to do:**
    - Create `/backend/src/i18n/locales/pt-BR.json`
    - Same keys as en.json translated to Brazilian Portuguese
  - **Touched:** CREATE `/backend/src/i18n/locales/pt-BR.json`

- [ ] **Step 4 — Integrate with Elysia app**
  - **What to do:**
    - Modify `/backend/src/app.ts`
    - Import i18n functions
    - Update error handler to use t() with detected language
  - **Touched:** MODIFY `/backend/src/app.ts`

- [ ] **Step 5 — Create unit tests**
  - **What to do:**
    - Create `/backend/src/i18n/__tests__/i18n.test.ts`
    - Test t() returns English string
    - Test t() with lng: 'pt-BR' returns Portuguese
    - Test unknown language falls back to 'en'
    - Test getLanguageFromHeader() parsing
  - **Touched:** CREATE `/backend/src/i18n/__tests__/i18n.test.ts`

- [ ] **Step 6 — Verify**
  - **Commands:**
    ```bash
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork && bun test backend/src/i18n --silent
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/backend && bun run tsc --noEmit
    ```

---

## Acceptance Criteria

- [ ] i18next initialized with en and pt-BR
- [ ] t() returns correct translations
- [ ] Language detected from Accept-Language header
- [ ] Unknown language falls back to 'en'
- [ ] Error handler uses i18n messages
- [ ] Unit tests pass
