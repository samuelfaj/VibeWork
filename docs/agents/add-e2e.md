# Playbook: Add Playwright E2E (only E2E framework)

Stagehand was **removed**. Use Playwright exclusively.

## Golden path (copy)

1. Specs: `e2e/playwright/tests/`
2. Fixtures: `e2e/playwright/fixtures/auth.ts`
3. Prefer `getByTestId` / `data-testid`
4. Deep path example: `notifications.spec.ts` (signup → create → mark read)

## Steps

1. Add `data-testid` on the feature UI.
2. Create `e2e/playwright/tests/<feature>.spec.ts` from golden specs.
3. Run: `bun run test:e2e:playwright`
4. `bun run feature:done <feature>`

## Do not

- Reintroduce Stagehand or other AI browser runners as DoD.
- Rely on `waitForTimeout` as primary sync.
