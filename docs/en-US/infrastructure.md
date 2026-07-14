# Infrastructure

Local: **Docker Compose MySQL only** (`docker compose --profile infra up -d`).

Production (when needed): Terraform under `infra/` targets Cloud Run + Cloud SQL (MySQL). Keep optional services out of the app until required.
