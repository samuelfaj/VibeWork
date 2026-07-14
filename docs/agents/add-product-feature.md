# Playbook: Add product feature

**Audience:** AI agents. Follow steps in order.

## Input

- Feature name: kebab-case (`billing`, `projects`)
- User-facing? yes/no
- Storage: **MySQL only** (no Mongo)

## Steps

1. `bun run slice:new <name>`
2. Implement **SLOT** comments only (schema/service/routes/hooks/page).
   - Services = module objects. Routes call services. **No controllers.**
3. Do **not** touch: `requireAuth` wiring, other feature barrels, infra.
4. `bun run --filter @vibe-code/contract build`
5. `bun run --filter @vibework/backend build:types`
6. Connect FE hooks with `unwrapEden(api.<camel>...)`.
7. If user-facing: Playwright happy path (copy auth/notifications).
8. `bun run feature:done <name>` — must exit 0.

## Done when

`feature:done <name>` succeeds.

## Forbidden

- Mongo / Redis / Pub/Sub / workers
- Controllers
- `fetch` in features
- `X-User-Id` auth
- Hardcoded UI strings (use i18n en/pt-BR/es)
