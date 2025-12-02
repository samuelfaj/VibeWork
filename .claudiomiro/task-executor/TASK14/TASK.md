@dependencies [TASK5]
@scope backend

# Task: Backend i18n Error Messages

## Summary
Complete backend i18n setup by ensuring all error messages and API responses are properly translated. Add error message translations for both locales.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Extends i18n from TASK5 with error message translations
- Ensures Accept-Language header detection works
- Adds translations for auth and notification errors

## Complexity
Low

## Dependencies
Depends on: [TASK5]
Blocks: [TASK15]
Parallel with: [TASK6, TASK7]

## Detailed Steps
1. Extend locale files with error messages:
   - `/backend/src/i18n/locales/en.json` - English errors
   - `/backend/src/i18n/locales/pt-BR.json` - Portuguese errors

2. Add error message categories:
   - Auth errors (invalid credentials, user exists, etc.)
   - Validation errors (invalid email, password too short)
   - Notification errors (not found, unauthorized)
   - Generic errors (server error, not found)

3. Create i18n middleware for Elysia:
   - Detect Accept-Language header
   - Set locale for request
   - Provide t() function in context

4. Update error handlers to use i18n

## Acceptance Criteria
- [ ] Error messages translated to en and pt-BR
- [ ] Accept-Language header detection works
- [ ] API returns localized error messages
- [ ] All auth errors translated
- [ ] All notification errors translated

## Code Review Checklist
- [ ] All error paths use i18n
- [ ] No hardcoded error strings
- [ ] Fallback to 'en' if locale not supported
- [ ] Consistent key naming convention

## Reasoning Trace
Localized error messages improve user experience for international users. Accept-Language detection enables automatic locale selection. Consistent error translation ensures the API is fully internationalized.
