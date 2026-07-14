# Infraestrutura (GCP)

Terraform em `infra/`.

## Layout típico

```
infra/
  dev/ staging/ prod/
  modules/                # cloud-sql, redis, run, …
```

## Alvos da stack

| Recurso             | Papel                           |
| ------------------- | ------------------------------- |
| Cloud Run           | API (e opcionalmente worker)    |
| Cloud SQL (MySQL)   | Store relacional principal      |
| Memorystore / Redis | Cache, rate limit, idempotência |
| Pub/Sub             | Mensageria assíncrona           |
| Artifact Registry   | Imagens de container            |
| Secret Manager      | Segredos (auth, DB)             |

## Local vs cloud

| Local                            | Cloud                          |
| -------------------------------- | ------------------------------ |
| Docker Compose MySQL/Mongo/Redis | Serviços gerenciados           |
| Emulador Pub/Sub                 | Pub/Sub GCP real               |
| Arquivo `.env`                   | Secrets de CI + Secret Manager |

## Notas

- Domínios e buckets de state no Terraform podem exigir valores por ambiente.
- Prefira rede privada (VPC) para SQL/Redis em produção ao endurecer a stack.
- Arquitetura da app: [architecture.md](architecture.md). Deploy: [deployment.md](deployment.md).
