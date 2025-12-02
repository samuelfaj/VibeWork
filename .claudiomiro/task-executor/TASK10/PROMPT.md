## PROMPT
Create optimized Dockerfile for Bun backend (multi-stage), and Terraform skeleton for GCP infrastructure (Cloud SQL, Memorystore, Pub/Sub, Cloud Run). Configure TFLint and Checkov for IaC quality.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/backend/Dockerfile`
- `/infra/main.tf`
- `/infra/variables.tf`
- `/infra/outputs.tf`
- `/infra/providers.tf`
- `/.tflint.hcl`

### Patterns to Follow

**Bun Dockerfile (multi-stage):**
```dockerfile
# Build stage
FROM oven/bun:1 AS builder
WORKDIR /app
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

# Production stage
FROM oven/bun:1-slim
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["bun", "run", "dist/index.js"]
```

**Terraform GCP provider:**
```hcl
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
```

**GCP resources to define:**
- google_sql_database_instance (MySQL)
- google_redis_instance (Memorystore)
- google_pubsub_topic
- google_pubsub_subscription
- google_cloud_run_service

### Integration Points
- Dockerfile builds backend from TASK5/TASK6/TASK7
- Terraform deploys to GCP

## EXTRA DOCUMENTATION
- Bun Docker: https://bun.sh/guides/ecosystem/docker
- GCP Terraform: https://registry.terraform.io/providers/hashicorp/google/latest/docs

## LAYER
6

## PARALLELIZATION
Parallel with: [TASK1, TASK2, TASK3, TASK4]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- GCP only (not AWS)
- Bun runtime (not Node.js)
- No hardcoded secrets in Terraform
- Verify Dockerfile: `docker build -t backend .`
- Verify Terraform: `terraform validate`
