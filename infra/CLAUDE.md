# Infrastructure - Terraform IaC

Google Cloud Platform infrastructure as code using Terraform for provisioning and managing the VibeWork backend environment.

## Purpose

Defines all GCP cloud resources needed to run the VibeWork backend:

- **Cloud SQL**: MySQL database
- **Memorystore**: Redis caching
- **Pub/Sub**: Event messaging
- **Cloud Run**: Backend service deployment
- **IAM & Networking**: Access control and network configuration

## Structure

```
infra/
├── main.tf              # Primary resource definitions
├── providers.tf         # GCP provider configuration
├── variables.tf         # Input variables for environments
├── outputs.tf           # Output values (endpoints, connection strings)
├── .terraform.lock.hcl  # Dependency lock file
└── .gitignore           # Exclude terraform state files
```

## Files Overview

### `main.tf`

Defines all infrastructure resources:

**Cloud SQL (MySQL)**

- Database instance with high availability (regional)
- Automated backups enabled
- Deletion protection for production
- User and database creation
- Connection security via private IP

**Memorystore (Redis)**

- Redis instance for caching
- Configurable memory size by environment
- High availability replication

**Pub/Sub**

- Two topics: `notifications` and `events`
- Subscriptions with 10-600 second backoff for retries
- Dead letter topic for failed messages

**Cloud Run**

- Backend service deployment
- Environment variables from terraform
- Autoscaling (0-2 replicas for dev, 0-10 for prod)
- Public access for non-prod (may change for prod)

**IAM**

- Service account for backend
- Role assignments for Cloud SQL, Pub/Sub, Cloud Run access

### `providers.tf`

GCP provider configuration:

```hcl
terraform {
  required_version = "~> 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
```

### `variables.tf`

Input variables for environment-specific configuration:

| Variable               | Type   | Description                           |
| ---------------------- | ------ | ------------------------------------- |
| `gcp_project_id`       | string | GCP project ID                        |
| `gcp_region`           | string | GCP region (e.g., us-central1)        |
| `environment`          | string | Environment name (dev, staging, prod) |
| `mysql_instance_type`  | string | Machine type for SQL instance         |
| `redis_memory_size_gb` | number | Redis memory in GB                    |
| `cloud_run_cpu`        | string | CPU allocation for Cloud Run          |
| `cloud_run_memory`     | string | Memory allocation for Cloud Run       |

### `outputs.tf`

Outputs deployment information:

- MySQL connection details
- Redis connection string
- Pub/Sub topic names
- Cloud Run service URL
- Service account email

Use outputs with:

```bash
terraform output mysql_connection_name
terraform output redis_host
terraform output cloud_run_service_url
```

## Setup & Deployment

### Prerequisites

1. **GCP Account & Project**

   ```bash
   gcloud auth login
   gcloud config set project PROJECT_ID
   ```

2. **Terraform Installed**

   ```bash
   terraform version  # Should be ~1.0+
   ```

3. **Required IAM Permissions**
   - Compute Admin
   - Cloud SQL Admin
   - Pub/Sub Admin
   - Cloud Run Admin
   - Service Account Admin

### Initialize Terraform

```bash
cd infra/
terraform init
```

This downloads required providers and initializes the `.terraform/` directory.

### Plan Deployment

```bash
# For development environment
terraform plan -var-file="environments/dev.tfvars" -out=tfplan

# For production environment
terraform plan -var-file="environments/prod.tfvars" -out=tfplan
```

Review the output to ensure changes are as expected.

### Apply Changes

```bash
# Development
terraform apply -var-file="environments/dev.tfvars" tfplan

# Production
terraform apply -var-file="environments/prod.tfvars" tfplan
```

This creates/updates all infrastructure resources.

### Destroy Resources

```bash
# Development (safe to destroy)
terraform destroy -var-file="environments/dev.tfvars"

# Production (requires approval - deletion protection enabled)
terraform destroy -var-file="environments/prod.tfvars"
```

## Environment Configuration

Create `environments/dev.tfvars` and `environments/prod.tfvars`:

```hcl
# environments/dev.tfvars
gcp_project_id       = "vibework-dev"
gcp_region          = "us-central1"
environment         = "dev"
mysql_instance_type = "db-f1-micro"
redis_memory_size_gb = 1
cloud_run_cpu       = "0.5"
cloud_run_memory    = "256Mi"

# environments/prod.tfvars
gcp_project_id       = "vibework-prod"
gcp_region          = "us-central1"
environment         = "prod"
mysql_instance_type = "db-n1-standard-1"
redis_memory_size_gb = 5
cloud_run_cpu       = "2"
cloud_run_memory    = "2Gi"
```

## State Management

### Remote State (Recommended for Teams)

Store state in GCS:

```hcl
# backend.tf
terraform {
  backend "gcs" {
    bucket = "vibework-terraform-state"
    prefix = "infra"
  }
}
```

Create bucket and lock table:

```bash
gsutil mb gs://vibework-terraform-state
```

### Local State (Development Only)

Default terraform.tfstate file in `infra/` directory.

**⚠️ Never commit to git!** (Already in .gitignore)

## Common Tasks

### Get Deployment Outputs

```bash
# View all outputs
terraform output

# Get specific output
terraform output cloud_run_service_url
terraform output mysql_host
```

### Update Resource Configuration

1. Modify variables in `variables.tf` or tfvars file
2. Run `terraform plan` to preview changes
3. Run `terraform apply` to apply changes

### Scale Cloud Run Replicas

Update in `main.tf`:

```hcl
autoscaling {
  max_instances = 10  # Increase from 2
}
```

Apply changes:

```bash
terraform apply
```

### Update Environment Variables

1. Modify in `main.tf` under `env` block
2. Run `terraform apply`
3. Redeploy backend service to pick up changes

## Monitoring & Debugging

### Check Resource Status

```bash
# List all resources
terraform show

# Validate configuration
terraform validate

# Format check
terraform fmt -check -recursive
```

### View GCP Resources

```bash
# List Cloud SQL instances
gcloud sql instances list

# List Redis instances
gcloud redis instances list

# View Cloud Run services
gcloud run services list

# Check Pub/Sub topics
gcloud pubsub topics list
```

### Connection Testing

```bash
# Test MySQL connection
gcloud sql connect vibework --user=root

# Test Redis connection
gcloud redis instances describe vibework --region=us-central1
```

## Troubleshooting

### State Lock Issues

If Terraform is stuck with a lock:

```bash
terraform force-unlock LOCK_ID
```

### Provider Mismatch

Update provider versions:

```bash
terraform init -upgrade
```

### Quota Exceeded

Check quotas in GCP Console:

- APIs & Services > Quotas
- Increase quotas as needed

### Connection Errors

Verify:

1. Service account has correct IAM roles
2. Network connectivity (firewall rules, VPC)
3. Database/Redis credentials in `.env`

## Security Considerations

### Production Best Practices

- [ ] Enable VPC for private connections
- [ ] Use Cloud IAM service accounts instead of API keys
- [ ] Enable Cloud Armor for DDoS protection
- [ ] Use Cloud KMS for secret management
- [ ] Enable audit logging
- [ ] Implement backup and disaster recovery procedures

### Current TODOs

See `main.tf` for comments marked with `TODO`:

- VPC setup for production security
- Private IP configuration
- Firewall rules refinement

## Maintenance

### Regular Tasks

- [ ] Review and update provider versions quarterly
- [ ] Check for deprecated resource types
- [ ] Test disaster recovery procedures
- [ ] Review cost optimization opportunities
- [ ] Update documentation as infrastructure changes

### Terraform Version Updates

```bash
# Check available updates
terraform version

# Update to latest compatible version
# Update required_version in providers.tf
terraform init -upgrade
```

## Related Documentation

- [GCP Terraform Provider Docs](https://registry.terraform.io/providers/hashicorp/google/latest/docs)
- [Cloud SQL Documentation](https://cloud.google.com/sql/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Pub/Sub Documentation](https://cloud.google.com/pubsub/docs)
