Fully implemented: NO

## Context Reference

**For complete environment context, read these files in order:**
1. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context (tech stack, architecture, conventions)
2. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK3/TASK.md` - Task-level context (what this task is about)
3. `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK3/PROMPT.md` - Task-specific context (files to touch, patterns to follow)

**You MUST read these files before implementing to understand:**
- Tech stack and framework versions
- Project structure and architecture
- Coding conventions and patterns
- Related code examples with file:line references
- Integration points and dependencies

**DO NOT duplicate this context below - it's already in the files above.**

## Implementation Plan

- [ ] **Item 1 — Create Contract Package Structure + TypeBox User Schemas + Tests**
  - **What to do:**
    1. Create directory structure at `/packages/contract/`
    2. Create `/packages/contract/package.json` with:
       - Name: `@vibe-code/contract`
       - Type: `module`
       - Main: `dist/index.js`
       - Types: `dist/index.d.ts`
       - Dependencies: `elysia` (for TypeBox via `t` export)
       - Scripts: `build` (using `bun build`), `typecheck`
       - Exports configured for ESM
    3. Create `/packages/contract/tsconfig.json` extending root config:
       - Include: `["src/**/*"]`
       - OutDir: `dist`
       - Declaration: true
       - DeclarationMap: true
    4. Create `/packages/contract/src/user.ts` with schemas as specified in PROMPT.md:23-44:
       - `SignupSchema`: email (format: email), password (minLength: 8)
       - `LoginSchema`: email (format: email), password (string)
       - `UserResponseSchema`: id (string), email (format: email), createdAt (string)
       - Export TypeScript types using `Static<typeof Schema>`
    5. Create unit tests at `/packages/contract/src/__tests__/user.test.ts`:
       - Test SignupSchema validates correct input
       - Test SignupSchema rejects invalid email
       - Test SignupSchema rejects short password (<8 chars)
       - Test LoginSchema accepts valid credentials
       - Test UserResponseSchema validates user response structure

  - **Context (read-only):**
    - PROMPT.md:26-44 — User schema definitions with exact TypeBox syntax
    - AI_PROMPT.md:122-135 — ElysiaJS TypeBox validation pattern
    - TASK0/PROMPT.md:35-39 — Root tsconfig base configuration

  - **Touched (will modify/create):**
    - CREATE: `/packages/contract/package.json`
    - CREATE: `/packages/contract/tsconfig.json`
    - CREATE: `/packages/contract/src/user.ts`
    - CREATE: `/packages/contract/src/__tests__/user.test.ts`

  - **Interfaces / Contracts:**
    ```typescript
    // Exported from user.ts
    export const SignupSchema: TObject<{
      email: TString;
      password: TString;
    }>
    export const LoginSchema: TObject<{
      email: TString;
      password: TString;
    }>
    export const UserResponseSchema: TObject<{
      id: TString;
      email: TString;
      createdAt: TString;
    }>
    export type SignupInput = Static<typeof SignupSchema>
    export type LoginInput = Static<typeof LoginSchema>
    export type UserResponse = Static<typeof UserResponseSchema>
    ```

  - **Tests:**
    Type: unit tests with Vitest
    - Happy path: SignupSchema.Check({ email: "test@example.com", password: "password123" }) returns true
    - Happy path: LoginSchema.Check({ email: "test@example.com", password: "pass" }) returns true
    - Edge case: SignupSchema rejects email without @ symbol
    - Edge case: SignupSchema rejects password with 7 chars
    - Edge case: UserResponseSchema validates complete user object

  - **Migrations / Data:**
    N/A - No data changes (pure TypeBox schema definitions)

  - **Observability:**
    N/A - No observability requirements (compile-time schemas)

  - **Security & Permissions:**
    - Password schema has minLength: 8 validation
    - Email schema uses format: 'email' for proper validation
    - No PII logging concerns (schemas only, no runtime data handling)

  - **Performance:**
    N/A - TypeBox schemas are compile-time constructs with negligible runtime overhead

  - **Commands:**
    ```bash
    # Create directories
    mkdir -p /Users/samuelfajreldines/Desenvolvimento/VibeWork/packages/contract/src/__tests__

    # Install dependencies (after creating package.json)
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork && bun install

    # Run tests (ONLY contract package)
    bun test packages/contract --silent

    # Type check (ONLY contract package)
    cd packages/contract && bun run typecheck
    ```

  - **Risks & Mitigations:**
    - **Risk:** Elysia's `t` export API may differ from raw TypeBox
      **Mitigation:** Use `import { t } from 'elysia'` as specified in PROMPT.md, verify with actual Elysia docs

---

- [ ] **Item 2 — Create TypeBox Notification Schemas + Tests**
  - **What to do:**
    1. Create `/packages/contract/src/notification.ts` with schemas as specified in PROMPT.md:46-60:
       - `NotificationTypeSchema`: Union of Literal('in-app') | Literal('email')
       - `CreateNotificationSchema`: userId (string), type (NotificationTypeSchema), message (string)
       - `NotificationSchema`: id, userId, type, message, read (boolean), createdAt
       - Export TypeScript types using `Static<typeof Schema>`
    2. Create unit tests at `/packages/contract/src/__tests__/notification.test.ts`:
       - Test NotificationTypeSchema accepts 'in-app'
       - Test NotificationTypeSchema accepts 'email'
       - Test NotificationTypeSchema rejects invalid type
       - Test CreateNotificationSchema validates complete input
       - Test NotificationSchema validates full notification object

  - **Context (read-only):**
    - PROMPT.md:46-60 — Notification schema definitions with exact TypeBox syntax
    - AI_PROMPT.md:152-169 — Typegoose notification model pattern for field reference
    - `/packages/contract/src/user.ts` — Pattern from Item 1 for consistent code style

  - **Touched (will modify/create):**
    - CREATE: `/packages/contract/src/notification.ts`
    - CREATE: `/packages/contract/src/__tests__/notification.test.ts`

  - **Interfaces / Contracts:**
    ```typescript
    // Exported from notification.ts
    export const NotificationTypeSchema: TUnion<[TLiteral<'in-app'>, TLiteral<'email'>]>
    export const CreateNotificationSchema: TObject<{
      userId: TString;
      type: typeof NotificationTypeSchema;
      message: TString;
    }>
    export const NotificationSchema: TObject<{
      id: TString;
      userId: TString;
      type: typeof NotificationTypeSchema;
      message: TString;
      read: TBoolean;
      createdAt: TString;
    }>
    export type NotificationType = Static<typeof NotificationTypeSchema>
    export type CreateNotificationInput = Static<typeof CreateNotificationSchema>
    export type Notification = Static<typeof NotificationSchema>
    ```

  - **Tests:**
    Type: unit tests with Vitest
    - Happy path: NotificationTypeSchema.Check('in-app') returns true
    - Happy path: NotificationTypeSchema.Check('email') returns true
    - Happy path: CreateNotificationSchema validates { userId, type, message }
    - Edge case: NotificationTypeSchema rejects 'sms' (invalid type)
    - Edge case: CreateNotificationSchema rejects missing required fields
    - Happy path: NotificationSchema validates complete notification with read: false

  - **Migrations / Data:**
    N/A - No data changes

  - **Observability:**
    N/A - No observability requirements

  - **Security & Permissions:**
    - userId field is string (no validation of user existence - that's backend's job)
    - message field has no length limit in schema (consider adding maxLength if needed)

  - **Performance:**
    N/A - TypeBox schemas are compile-time constructs

  - **Commands:**
    ```bash
    # Run tests (ONLY notification schemas)
    bun test packages/contract/src/__tests__/notification.test.ts --silent

    # Type check
    cd packages/contract && bun run typecheck
    ```

  - **Risks & Mitigations:**
    - **Risk:** TypeBox Union/Literal syntax may require specific import
      **Mitigation:** Elysia's `t` includes all TypeBox types; use `t.Union([t.Literal(...)])` pattern

---

- [ ] **Item 3 — Create Index Barrel Export + CLAUDE.md + Build Verification**
  - **What to do:**
    1. Create `/packages/contract/src/index.ts` that exports all schemas and types:
       - Re-export everything from `./user`
       - Re-export everything from `./notification`
    2. Create `/packages/contract/CLAUDE.md` documenting:
       - Package purpose: shared TypeBox schemas for Eden RPC type safety
       - How to add new schemas (step-by-step)
       - Schema naming conventions
       - Example of importing in backend/frontend
       - Build/test commands
    3. Verify package builds successfully with `bun run build`
    4. Verify TypeScript types are properly inferred

  - **Context (read-only):**
    - AI_PROMPT.md:76-81 — Expected contract package structure
    - TASK.md:47 — Requirement for CLAUDE.md documentation
    - `/packages/contract/src/user.ts` — Exports to re-export
    - `/packages/contract/src/notification.ts` — Exports to re-export

  - **Touched (will modify/create):**
    - CREATE: `/packages/contract/src/index.ts`
    - CREATE: `/packages/contract/CLAUDE.md`

  - **Interfaces / Contracts:**
    ```typescript
    // index.ts barrel export
    export * from './user'
    export * from './notification'
    ```

  - **Tests:**
    Type: build verification (no additional unit tests needed)
    - Verify: `bun run build` completes without errors
    - Verify: `dist/index.js` and `dist/index.d.ts` are generated
    - Verify: TypeScript can import and infer types from package

  - **Migrations / Data:**
    N/A - No data changes

  - **Observability:**
    N/A - No observability requirements

  - **Security & Permissions:**
    N/A - No security concerns for barrel exports

  - **Performance:**
    N/A - Barrel exports have no runtime performance impact

  - **Commands:**
    ```bash
    # Build package
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/packages/contract && bun run build

    # Verify dist files exist
    ls -la /Users/samuelfajreldines/Desenvolvimento/VibeWork/packages/contract/dist/

    # Type check entire package
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/packages/contract && bun run typecheck

    # Run all contract tests
    cd /Users/samuelfajreldines/Desenvolvimento/VibeWork && bun test packages/contract --silent
    ```

  - **Risks & Mitigations:**
    - **Risk:** Bun build may need specific configuration for TypeScript declarations
      **Mitigation:** Use `tsc` for declaration generation alongside bun build, or use `bun build --dts`

---

## Verification (global)
- [ ] Run targeted tests ONLY for changed code:
      ```bash
      # Run contract package tests only
      cd /Users/samuelfajreldines/Desenvolvimento/VibeWork && bun test packages/contract --silent

      # Type check contract package only
      cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/packages/contract && bun run typecheck

      # Build contract package
      cd /Users/samuelfajreldines/Desenvolvimento/VibeWork/packages/contract && bun run build
      ```
      **CRITICAL:** Do not run full-project checks. Tests are scoped to packages/contract only.
- [ ] All acceptance criteria met (see below)
- [ ] Code follows conventions from AI_PROMPT.md and PROMPT.md
- [ ] TypeBox schemas use Elysia's `t` export as specified
- [ ] All types are properly exported alongside schemas

## Acceptance Criteria
- [ ] Package compiles with `bun run build` in `/packages/contract/`
- [ ] TypeBox schemas export correctly from `@vibe-code/contract`
- [ ] User schemas defined: SignupSchema, LoginSchema, UserResponseSchema
- [ ] Notification schemas defined: NotificationTypeSchema, CreateNotificationSchema, NotificationSchema
- [ ] All schemas have proper TypeScript types inferred via `Static<typeof Schema>`
- [ ] `CLAUDE.md` documents how to add new schemas with examples
- [ ] Unit tests pass for all schema validations
- [ ] Email validation uses `format: 'email'`
- [ ] Password has `minLength: 8` constraint

## Impact Analysis
- **Directly impacted:**
  - `/packages/contract/package.json` (new)
  - `/packages/contract/tsconfig.json` (new)
  - `/packages/contract/src/index.ts` (new)
  - `/packages/contract/src/user.ts` (new)
  - `/packages/contract/src/notification.ts` (new)
  - `/packages/contract/src/__tests__/user.test.ts` (new)
  - `/packages/contract/src/__tests__/notification.test.ts` (new)
  - `/packages/contract/CLAUDE.md` (new)

- **Indirectly impacted:**
  - TASK6, TASK7, TASK8, TASK9 depend on these schemas
  - Backend (TASK4) will import schemas for Elysia route validation
  - Frontend (TASK5) will use schemas for Eden type inference
  - Root `/package.json` workspaces will include this package

## Diff Test Plan
| Changed Symbol | Test Type | Test Cases |
|---------------|-----------|------------|
| SignupSchema | unit | valid input, invalid email, short password |
| LoginSchema | unit | valid input, missing fields |
| UserResponseSchema | unit | valid user object |
| NotificationTypeSchema | unit | 'in-app', 'email', invalid type |
| CreateNotificationSchema | unit | valid input, missing fields |
| NotificationSchema | unit | complete notification object |

## Follow-ups
- None identified - PROMPT.md provides complete schema definitions
