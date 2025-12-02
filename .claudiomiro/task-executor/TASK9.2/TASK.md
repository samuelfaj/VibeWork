@dependencies [TASK3, TASK4]
@scope frontend

# Task: i18n Setup (react-i18next with en/pt-BR locales)

## Summary
Configure react-i18next with English and Brazilian Portuguese locales, including browser language detection.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions

**Task-Specific Context:**
- Creates i18n configuration in `/frontend/src/i18n/`
- Sets up locale JSON files for en and pt-BR
- Configures browser language detection

## Complexity
Low

## Dependencies
Depends on: [TASK3, TASK4]
Blocks: [TASK9.4, TASK9.5]
Parallel with: [TASK9.1]

## Detailed Steps
1. Create `/frontend/src/i18n/index.ts`:
   - Initialize i18next with react-i18next
   - Add LanguageDetector plugin
   - Set fallback to 'en'
   - Configure detection order: navigator, htmlTag

2. Create `/frontend/src/i18n/locales/en.json`:
   - auth namespace: login, signup, email, password, confirmPassword, submit, errors
   - common namespace: loading, error

3. Create `/frontend/src/i18n/locales/pt-BR.json`:
   - Same structure as en.json with Portuguese translations

## Acceptance Criteria
- [ ] i18n initializes with 'en' fallback
- [ ] en.json has all auth and common translations
- [ ] pt-BR.json has all auth and common translations
- [ ] Browser language detection configured
- [ ] Files ready to be imported by main.tsx

## Code Review Checklist
- [ ] Translation keys are consistent between locales
- [ ] No hardcoded strings in translation values
- [ ] Detection caches to localStorage
