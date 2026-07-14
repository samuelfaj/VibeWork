# Playbook: Add product feature

**Audience:** AI agents. Follow steps in order. Do not invent structure.

## Input

- Feature name: kebab-case (`billing`, `projects`)
- User-facing? yes/no
- Storage: default MySQL (only use `--mongo` if document store is required)

## Steps

1. `bun run slice:new <name>`
   - Creates contract, backend module, FE feature, i18n, e2e stub
   - Wires `backend/src/app.ts` + `frontend/src/App.tsx`
2. Implement **SLOT** comments only (schema/service/controller/hooks/page).
   - Services/controllers = **module objects** (`export const XService = { … }`), not classes/static.
   - Controllers call services only. See AGENTS.md § Service patterns.
3. Do **not** touch: `requireAuth` wiring, public barrels of other features, infra kernel.
4. `bun run --filter @vibe-code/contract build`
5. `bun run --filter @vibework/backend build:types`
6. Connect FE hooks with `unwrapEden(api.<camel>...)`.
7. If user-facing: implement **Playwright** happy path (`e2e/playwright/tests/<name>.spec.ts`, copy auth/notifications).
8. Ensure tests exist: contract, route, service, FE hooks, Playwright.
9. `bun run feature:done <name>` — must exit 0 (runs unit FE+BE + coverage).

## Done when

`feature:done <name>` prints success. No other definition of done.

## Forbidden

- `fetch` in features
- `X-User-Id` auth
- Deep imports from another feature
- Skipping contract
- Hardcoded UI strings (must use i18n en/pt-BR/es)
