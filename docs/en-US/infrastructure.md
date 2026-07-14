# Infrastructure

Local: **Docker Compose MySQL only** (`docker compose --profile infra up -d`).

Production (when needed): Terraform under `infra/`:

```
infra/
  dev|staging|prod/   # env roots — Cloud SQL + Cloud Run only
  modules/
    cloud-sql/
    cloud-run/
```

No Redis/Pub/Sub modules — app does not use them.
