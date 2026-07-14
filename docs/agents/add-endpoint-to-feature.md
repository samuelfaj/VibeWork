# Playbook: Add endpoint to existing product feature

## Steps

1. Read `FEATURE_MAP.md` — confirm feature exists.
2. **Contract first** in `shared/contract/src/<feature>.ts` (+ test).
3. Export from `shared/contract/src/index.ts` if needed.
4. `bun run --filter @vibe-code/contract build`
5. Add method on the **module object** service (`FooService.method`).
6. Add route handler that calls the service (status + i18n errors in the route).
7. Route unit test (mock `requireAuth` with `.resolve(() => ({ user }))`).
8. FE hook with `unwrapEden(api....)`.
9. i18n keys if new UI copy (en + pt-BR + es).
10. `bun run --filter @vibework/backend build:types`
11. `bun run feature:check`

## Golden copy

`backend/modules/notifications` + `frontend/src/features/notifications`.
