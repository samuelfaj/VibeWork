# Playbook: Add endpoint to existing product feature

## Steps

1. Read `FEATURE_MAP.md` — confirm feature exists.
2. **Contract first** in `shared/contract/src/<feature>.ts` (+ test).
3. Export from `shared/contract/src/index.ts` if new symbols.
4. `bun run --filter @vibe-code/contract build`
5. Add service method on the existing **module object** (`FooService.method`), not a free function or static class.
6. Add controller method on `FooController` (HTTP status + i18n errors only; call service).
7. Add route with:
   - `requireAuth` (or `requireRole`) already on parent
   - contract schemas for body/query/response
   - **no** `as never`
8. Route unit test (mock `requireAuth` with `.resolve(() => ({ user }))`).
9. FE hook with `unwrapEden(api....)`.
10. i18n keys if new UI copy (en + pt-BR + es).
11. `bun run --filter @vibework/backend build:types`
12. `bun run feature:check`

## Golden copy pattern

See `backend/modules/notifications` + `frontend/src/features/notifications`.
