# Getting started

## Prerequisites

- Bun 1.2+
- Docker (for MySQL)
- Git

## Setup

```bash
bun install
cp .env.example .env
docker compose --profile infra up -d
bun run --filter @vibework/backend db:migrate
bun run dev
```

| Port | Service  |
| ---- | -------- |
| 3307 | MySQL    |
| 3000 | API      |
| 5173 | Frontend |

## Verify

```bash
bun run typecheck
bun run test
bun run banlist
bun run feature:check
```

## Next

- [Architecture](architecture.md)
- New feature: `bun run slice:new <name>` ([AGENTS.md](../../AGENTS.md))
