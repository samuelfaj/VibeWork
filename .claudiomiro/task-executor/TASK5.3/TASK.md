@dependencies [TASK0, TASK1, TASK5.1]
@scope backend

# Task: Backend i18n Configuration

## Summary
Configure i18next for backend internationalization with English and Brazilian Portuguese locales, Accept-Language header detection, and integration with Elysia error handler.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions

**Task-Specific Context:**
- Creates `/backend/src/i18n/` directory structure
- Configures i18next with language detection
- Creates en.json and pt-BR.json locale files
- Integrates with Elysia app error handler

## Complexity
Low

## Dependencies
Depends on: [TASK0, TASK1, TASK5.1]
Blocks: [TASK5.5]
Parallel with: [TASK5.2]

## Detailed Steps
1. Create `/backend/src/i18n/index.ts`:
   - Initialize i18next
   - Language detection from Accept-Language header
   - Fallback to 'en'
   - Export t() and initI18n()

2. Create `/backend/src/i18n/locales/en.json`:
   - Error messages (validation, auth, server errors)
   - Health check messages
   - At least 10 translation keys

3. Create `/backend/src/i18n/locales/pt-BR.json`:
   - Same keys translated to Brazilian Portuguese

4. Integrate with Elysia error handler in app.ts

5. Write unit tests

## Acceptance Criteria
- [ ] i18next initialized with en and pt-BR
- [ ] t() returns correct translations
- [ ] Language detected from Accept-Language header
- [ ] Unknown language falls back to 'en'
- [ ] Error handler uses i18n messages
- [ ] Unit tests pass

## Code Review Checklist
- [ ] Translations loaded at startup
- [ ] Missing keys return key itself
- [ ] No hardcoded strings in error responses

## Reasoning Trace
i18n at backend level enables localized error messages and API responses. Accept-Language detection provides automatic language selection. Fallback ensures graceful degradation.
