# Infraestrutura

Local: **só MySQL no Docker Compose** (`docker compose --profile infra up -d`).

Produção (quando precisar): Terraform em `infra/`:

```
infra/
  dev|staging|prod/   # Cloud SQL + Cloud Run
  modules/
    cloud-sql/
    cloud-run/
```

Sem módulos Redis/Pub/Sub — a app não usa.
