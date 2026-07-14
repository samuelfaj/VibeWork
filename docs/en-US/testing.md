# Testing

## Layers

| Layer                                 | Tool                           | When                                           |
| ------------------------------------- | ------------------------------ | ---------------------------------------------- |
| Contract                              | Vitest + TypeBox `Value.Check` | Schema changes                                 |
| Unit (service/controller/route/hooks) | Vitest                         | Domain logic always                            |
| Integration                           | Vitest + Testcontainers        | Persistence / critical flows                   |
| E2E                                   | **Playwright only**            | User-facing flows                              |
| Coverage                              | Vitest coverage                | Backend thresholds enforced in `feature:check` |

Co-locate unit tests next to source: `file.ts` + `file.test.ts`.

Stagehand and other AI browser runners are **not** part of this repo.

## Commands

```bash
bun run test                    # all unit workspaces
bun run test:integration
bun run test:e2e                # Playwright
bun run test:e2e:playwright     # alias

bun run --filter @vibework/backend test:coverage
bun run feature:check           # banlist + i18n + types + unit + BE coverage
bun run feature:done <name>     # structure + feature:check
```

## E2E (Playwright)

Location: `e2e/playwright/`

| Spec                          | Covers                 |
| ----------------------------- | ---------------------- |
| `tests/auth.spec.ts`          | Signup / signin smoke  |
| `tests/notifications.spec.ts` | Notifications UI smoke |
| `fixtures/auth.ts`            | Shared helpers         |

Copy those specs when adding a new user-facing slice. Prefer `data-testid` + `getByTestId`.

## Agent gates

| Gate                  | Meaning                                           |
| --------------------- | ------------------------------------------------- |
| `banlist`             | Forbidden patterns (header auth, raw fetch, etc.) |
| `i18n:parity`         | en / pt-BR / es key parity                        |
| `feature:check`       | Full quality bar before “done”                    |
| `feature:done <name>` | Slice structure + `feature:check`                 |

**Definition of Done for a product feature = `feature:done <name>` exit 0.**

## Mocking module objects

```ts
vi.mock('../services/user.service', () => ({
  UserService: {
    findUserById: (id: string) => mockFindUserById(id),
  },
}))
```

Do not invent static class mocks for domain services.
