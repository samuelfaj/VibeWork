# Research for TASK9.2

## Context Reference

**For tech stack and conventions, see:**

- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK9.2/TASK.md` - Task-level context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK9.2/PROMPT.md` - Task-specific context

**This file contains ONLY new information discovered during research.**

## Task Understanding Summary

Configure react-i18next for frontend with English and Portuguese (Brazil) locales, browser language detection, and localStorage caching.

## Files Discovered to Read/Modify

- `frontend/package.json` - Minimal placeholder, needs i18n dependencies added
- No existing `frontend/src/` directory - needs to be created

## Current State Analysis

### Frontend Package Status

- Package name: `@vibe-code/frontend`
- Version: `0.0.0`
- **Status:** Empty placeholder - no dependencies, no source files
- **i18n directory:** Does not exist - needs creation

### Existing i18n in Codebase

- **No existing i18n implementation found** in frontend
- Backend i18n (TASK5.3) is a separate implementation
- No patterns to follow within the codebase - follow PROMPT.md template

## Dependencies Required

Dependencies to add to `frontend/package.json`:

```json
{
  "dependencies": {
    "i18next": "^23.x",
    "react-i18next": "^14.x",
    "i18next-browser-languagedetector": "^8.x"
  }
}
```

## Code Patterns from react-i18next Documentation

### Detection Configuration (verified from docs)

```typescript
detection: {
  order: ['navigator', 'htmlTag'],  // As per PROMPT.md
  caches: ['localStorage']          // As per PROMPT.md
}
```

### Key i18next Configuration Options

- `fallbackLng: 'en'` - Default language
- `interpolation: { escapeValue: false }` - React handles escaping
- Use `initReactI18next` plugin (required for React integration)
- `LanguageDetector` must be `.use()`d before `.init()`

## Integration & Impact Analysis

### Files Being Created:

1. `/frontend/src/i18n/index.ts`
   - **Purpose:** i18n configuration entry point
   - **Exports:** default i18n instance
   - **Will be imported by:** `main.tsx` (TASK9.4)

2. `/frontend/src/i18n/locales/en.json`
   - **Purpose:** English translations
   - **Imported by:** `index.ts`

3. `/frontend/src/i18n/locales/pt-BR.json`
   - **Purpose:** Brazilian Portuguese translations
   - **Imported by:** `index.ts`

### Downstream Dependencies:

- **TASK9.4 (main.tsx):** Will import `./i18n` to initialize translations
- **TASK9.5 (Auth UI):** Will use `useTranslation` hook with these keys

### Translation Keys Required:

```
auth.login
auth.signup
auth.email
auth.password
auth.confirmPassword
auth.submit
auth.noAccount
auth.hasAccount
auth.errors.invalidEmail
auth.errors.passwordTooShort
auth.errors.passwordMismatch
auth.errors.loginFailed
auth.errors.signupFailed
common.loading
common.error
```

## Test Strategy Discovered

- No frontend tests exist yet (empty package)
- Testing framework: Vitest (per root config)
- i18n testing not required for this task (setup only)

## Risks & Challenges Identified

### Risk 1: Directory Structure

- **Issue:** `frontend/src/` does not exist
- **Mitigation:** Create directory structure with files

### Risk 2: Package Dependencies

- **Issue:** Dependencies not installed
- **Mitigation:** This task creates files only; dependencies will be installed by TASK3/TASK4 (already completed per @dependencies)

### Risk 3: TypeScript JSON Import

- **Issue:** Importing JSON in TypeScript requires config
- **Mitigation:** Assume `tsconfig.json` has `resolveJsonModule: true` (standard Vite setup)

## Execution Strategy

1. **Create directory structure:**
   - `/frontend/src/i18n/`
   - `/frontend/src/i18n/locales/`

2. **Create `/frontend/src/i18n/locales/en.json`:**
   - Follow exact structure from PROMPT.md
   - All auth and common namespace keys

3. **Create `/frontend/src/i18n/locales/pt-BR.json`:**
   - Mirror en.json structure exactly
   - Use Brazilian Portuguese translations

4. **Create `/frontend/src/i18n/index.ts`:**
   - Follow exact pattern from PROMPT.md
   - Import locales, configure i18next with detection

5. **Verify:**
   - Translation keys match between locales
   - TypeScript compiles without errors
