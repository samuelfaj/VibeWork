# Infraestrutura

Local: **só MySQL no Docker Compose** (`docker compose --profile infra up -d`).

Produção (quando precisar): Terraform em `infra/` mira Cloud Run + Cloud SQL (MySQL). Não adicione serviços opcionais na app até serem necessários.
