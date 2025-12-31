# Infrastructure - Terraform IaC

Google Cloud Platform infrastructure as code using Terraform for provisioning and managing the VibeWork backend environment.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GCP Infrastructure                                  │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      Cloud Run Service                                 │  │
│  │                    (ElysiaJS Backend)                                  │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                    │                                         │
│          ┌─────────────────────────┼─────────────────────────┐              │
│          │                         │                         │              │
│          ▼                         ▼                         ▼              │
│  ┌───────────────┐     ┌───────────────────┐     ┌──────────────────────┐  │
│  │  Cloud SQL    │     │   Memorystore     │     │      Pub/Sub         │  │
│  │   (MySQL)     │     │    (Redis)        │     │  (Notifications,     │  │
│  │               │     │                   │     │     Events)          │  │
│  └───────────────┘     └───────────────────┘     └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Structure

```
infra/
├── modules/                         # Shared Terraform modules
│   ├── cloud-run/                   # Cloud Run service + IAM
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── cloud-sql/                   # Cloud SQL MySQL
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   ├── redis/                       # Memorystore Redis
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   └── outputs.tf
│   │
│   └── pubsub/                      # Pub/Sub topics and subscriptions
│       ├── main.tf
│       ├── variables.tf
│       └── outputs.tf
│
├── dev/                             # Development environment
│   ├── main.tf
│   ├── variables.tf
│   ├── providers.tf
│   └── outputs.tf
│
├── staging/                         # Staging environment
│   ├── main.tf
│   ├── variables.tf
│   ├── providers.tf
│   └── outputs.tf
│
├── prod/                            # Production environment
│   ├── main.tf
│   ├── variables.tf
│   ├── providers.tf
│   └── outputs.tf
│
└── CLAUDE.md                        # This documentation
```

## Modules

### Cloud Run Module (`modules/cloud-run/`)

- **Service Account**: IAM for Cloud Run with Pub/Sub and Cloud SQL permissions
- **Cloud Run Service**: Serverless backend with configurable scaling
- **IAM Binding**: Optional public access for non-production environments

### Cloud SQL Module (`modules/cloud-sql/`)

- **MySQL Instance**: Cloud SQL with configurable tier
- **Database**: Application database
- **User**: Application database user
- **Backup**: Automated backups configuration

### Redis Module (`modules/redis/`)

- **Memorystore Instance**: Redis cache with configurable memory and tier
- **High Availability**: Optional HA for production

### Pub/Sub Module (`modules/pubsub/`)

- **Notifications Topic**: For notification events
- **Events Topic**: For general events
- **Subscriptions**: With retry policies

## Environment Configuration

| Setting           | Dev         | Staging        | Prod         |
| ----------------- | ----------- | -------------- | ------------ |
| Domain            | dev.\*      | staging.\*     | vibework.app |
| API               | api-dev.\*  | api-staging.\* | api.\*       |
| Cloud Run min     | 0           | 1              | 2            |
| Cloud Run max     | 2           | 5              | 20           |
| CPU               | 1000m       | 1000m          | 2000m        |
| Memory            | 512Mi       | 1Gi            | 2Gi          |
| MySQL Tier        | db-f1-micro | db-g1-small    | db-n1-std-1  |
| Redis Memory (GB) | 1           | 2              | 5            |
| Redis Tier        | BASIC       | BASIC          | STANDARD_HA  |
| Public Access     | Yes         | Yes            | No           |
| Deletion Protect  | No          | No             | Yes          |

## Deployment

### Prerequisites

```bash
# GCP Authentication
gcloud auth application-default login
gcloud config set project PROJECT_ID
```

### Deploy Environment

```bash
# Development
cd infra/dev
terraform init
terraform plan -var="gcp_project_id=PROJECT_ID" -var="mysql_password=PASSWORD"
terraform apply -var="gcp_project_id=PROJECT_ID" -var="mysql_password=PASSWORD"

# Staging
cd infra/staging
terraform init
terraform plan -var="gcp_project_id=PROJECT_ID" -var="mysql_password=PASSWORD"
terraform apply -var="gcp_project_id=PROJECT_ID" -var="mysql_password=PASSWORD"

# Production
cd infra/prod
terraform init
terraform plan -var="gcp_project_id=PROJECT_ID" -var="mysql_password=PASSWORD"
terraform apply -var="gcp_project_id=PROJECT_ID" -var="mysql_password=PASSWORD"
```

### Using tfvars files

Create `terraform.tfvars` in each environment directory:

```hcl
# dev/terraform.tfvars
gcp_project_id = "vibework-dev"
gcp_region     = "us-central1"
mysql_password = "your-secure-password"
backend_image  = "gcr.io/vibework-dev/vibe-backend:latest"
```

Then deploy:

```bash
cd infra/dev
terraform apply
```

## State Management

Each environment has its own state file. For team collaboration, configure remote state in GCS:

1. Create the bucket:

```bash
gsutil mb gs://vibework-terraform-state
gsutil versioning set on gs://vibework-terraform-state
```

2. Uncomment the backend configuration in each environment's `providers.tf`:

```hcl
backend "gcs" {
  bucket = "vibework-terraform-state"
  prefix = "infra/dev"  # or staging, prod
}
```

| Environment | State Key       |
| ----------- | --------------- |
| Dev         | `infra/dev`     |
| Staging     | `infra/staging` |
| Prod        | `infra/prod`    |

## Outputs

```bash
# Get all outputs
terraform output

# Specific outputs
terraform output cloud_run_url
terraform output mysql_connection_name
terraform output redis_host
```

## Common Tasks

### Scale Cloud Run

Update `min_instances` and `max_instances` in the environment's `main.tf`:

```hcl
module "cloud_run" {
  # ...
  min_instances = 2
  max_instances = 10
}
```

### Add Authorized Network for Cloud SQL

```hcl
# In variables.tf or terraform.tfvars
authorized_networks = [
  {
    name = "office"
    cidr = "203.0.113.0/24"
  }
]
```

### Update Backend Image

```bash
terraform apply -var="backend_image=gcr.io/PROJECT/vibe-backend:v1.2.3"
```

## Security Considerations

### Production Best Practices

- [ ] Enable VPC for private Cloud SQL access
- [ ] Configure Cloud IAM for Cloud Run authentication
- [ ] Use Secret Manager for sensitive values
- [ ] Enable audit logging
- [ ] Configure Cloud Armor for DDoS protection
- [ ] Implement backup and disaster recovery

### Current Status

- Dev/Staging: Public access enabled for easier development
- Prod: Authentication required (IAM-based)
- All: Deletion protection enabled for production

## Troubleshooting

### Terraform State Lock

```bash
terraform force-unlock LOCK_ID
```

### Provider Version Mismatch

```bash
terraform init -upgrade
```

### Cloud SQL Connection Issues

1. Check authorized networks
2. Verify IAM permissions
3. Use Cloud SQL Proxy for local development:

```bash
cloud-sql-proxy PROJECT:REGION:INSTANCE
```

## Related Documentation

- [GCP Terraform Provider](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud Run Docs](https://cloud.google.com/run/docs)
- [Cloud SQL Docs](https://cloud.google.com/sql/docs)
- [Memorystore Docs](https://cloud.google.com/memorystore/docs/redis)
- [Pub/Sub Docs](https://cloud.google.com/pubsub/docs)
