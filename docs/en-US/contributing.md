# Contributing

## Source of truth

| Audience    | Doc                                                     |
| ----------- | ------------------------------------------------------- |
| AI agents   | **[AGENTS.md](../../AGENTS.md)** (wins on architecture) |
| Humans      | This `docs/en-US` tree (+ [pt-BR](../pt-BR/))           |
| Live slices | [FEATURE_MAP.md](../../FEATURE_MAP.md)                  |

Do not add parallel “architecture” markdown that contradicts `AGENTS.md`.

## Workflow

1. Create a branch (or work on an agreed main policy).
2. Prefer `bun run slice:new <name>` for new product domains.
3. Contract → backend → frontend → Playwright.
4. Run gates:

```bash
bun run feature:check
# or for a named slice:
bun run feature:done <name>
```

5. Open MR/PR with a clear Conventional Commit history.

## Commits

- Language: **English**
- Format: [Conventional Commits](https://www.conventionalcommits.org/)  
  Examples: `feat:`, `fix:`, `docs:`, `chore:`, `test:`, `refactor:`
- **Never** use `--no-verify` to skip hooks.

## Code language

| Asset                        | Language                       |
| ---------------------------- | ------------------------------ |
| Code identifiers / comments  | English                        |
| UI + API user-facing strings | i18n **en**, **pt-BR**, **es** |
| Human docs                   | en-US + pt-BR                  |
| AGENTS.md / agent playbooks  | English                        |

## i18n checklist

When adding copy:

1. Add key to `en.json`
2. Add same key to `pt-BR.json` and `es.json`
3. Run `bun run i18n:parity`

## Pull request checklist

- [ ] `bun run feature:check` (or `feature:done <name>`) green
- [ ] No forbidden patterns (`banlist`)
- [ ] Tests co-located and meaningful
- [ ] E2E updated if user-facing
- [ ] Docs updated only when behavior/architecture changed

## What not to do

- Drive-by refactors outside the task
- New Mongo collections “for flexibility” without need
- Microservices / multi-deploy without product decision
- Reintroduce Stagehand or header-based auth
