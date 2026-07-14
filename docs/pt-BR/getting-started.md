# Começando

## Pré-requisitos

- Bun 1.2+
- Docker (MySQL)
- Git

## Setup

```bash
bun install
cp .env.example .env
docker compose --profile infra up -d
bun run --filter @vibework/backend db:migrate
bun run dev
```

| Porta | Serviço  |
| ----- | -------- |
| 3307  | MySQL    |
| 3000  | API      |
| 5173  | Frontend |

## Verificar

```bash
bun run typecheck
bun run test
bun run banlist
bun run feature:check
```

## Próximos passos

- [Arquitetura](architecture.md)
- Nova feature: `bun run slice:new <name>` ([AGENTS.md](../../AGENTS.md))
