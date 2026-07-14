# Infrastructure (GCP)

Terraform lives under `infra/`.

## Layout (typical)

```
infra/
  dev/ staging/ prod/     # environment roots
  modules/                # cloud-sql, redis, run, …
```

## What the stack targets

| Resource            | Role                           |
| ------------------- | ------------------------------ |
| Cloud Run           | API (and optionally worker)    |
| Cloud SQL (MySQL)   | Primary relational store       |
| Memorystore / Redis | Cache, rate limit, idempotency |
| Pub/Sub             | Async messaging                |
| Artifact Registry   | Container images               |
| Secret Manager      | Secrets (auth, DB)             |

## Local vs cloud

| Local                                     | Cloud                       |
| ----------------------------------------- | --------------------------- |
| Docker Compose MySQL/Mongo/Redis          | Managed services            |
| Pub/Sub emulator (`PUBSUB_EMULATOR_HOST`) | Real GCP Pub/Sub            |
| `.env` file                               | CI secrets + Secret Manager |

## Notes

- Domain names and state buckets in Terraform may still need environment-specific values.
- Prefer private networking (VPC) for production SQL/Redis when you harden the stack.
- Application architecture docs: [architecture.md](architecture.md). Deploy flow: [deployment.md](deployment.md).
