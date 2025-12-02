# Infrastructure Guide

Guide to infrastructure services, Docker Compose, and GCP setup.

## Local Development Infrastructure

### Docker Compose Services

**Location:** `docker-compose.yml`

All services for local development run in Docker:

```yaml
services:
  mysql:
    image: mysql:8.0
    ports:
      - '3306:3306'
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: vibe_db

  mongodb:
    image: mongodb:6.0
    ports:
      - '27017:27017'
    environment:
      MONGO_INITDB_DATABASE: vibe_notifications

  redis:
    image: redis:7.0
    ports:
      - '6379:6379'

  pubsub:
    image: google/cloud-sdk:emulator
    ports:
      - '8085:8085'
    command: >
      gcloud beta emulators pubsub start
      --host-port=0.0.0.0:8085
```

### Starting Services

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove volumes
docker-compose down -v
```

### Service Details

**MySQL 8.0**

- Port: 3306
- Database: vibe_db
- User: root
- Password: (from .env)
- Volumes: mysql_data (persistent)

**MongoDB 6.0**

- Port: 27017
- Database: vibe_notifications
- Volumes: mongodb_data (persistent)

**Redis 7.0**

- Port: 6379
- No authentication (local only)

**Google Pub/Sub Emulator**

- Port: 8085
- Project: vibe-local
- Reset each start

## Production Infrastructure (GCP)

### Architecture

```
┌──────────────────────┐
│   Cloud Load         │
│   Balancer           │
└──────────┬───────────┘
           │
┌──────────┴───────────┐
│   Cloud Run          │  (Containerized app)
│   (auto-scaling)     │
└──────────┬───────────┘
           │
    ┌──────┴──────┬──────────┬──────────┐
    │             │          │          │
    ▼             ▼          ▼          ▼
┌────────┐  ┌─────────┐  ┌─────┐  ┌──────┐
│Cloud   │  │Cloud    │  │Redis│  │Pub/  │
│SQL     │  │Firestore│  │     │  │Sub   │
│(MySQL) │  │ or Atlas│  │Cache│  │      │
└────────┘  └─────────┘  └─────┘  └──────┘
```

### Cloud SQL (MySQL)

```bash
# Create instance
gcloud sql instances create vibe-mysql \
  --database-version MYSQL_8_0 \
  --tier db-f1-micro \
  --region us-central1

# Create database
gcloud sql databases create vibe_prod \
  --instance vibe-mysql

# Create user
gcloud sql users create app_user \
  --instance vibe-mysql \
  --password <secure_password>

# Connect
gcloud sql connect vibe-mysql \
  --user root
```

### Cloud Memorystore (Redis)

```bash
# Create Redis instance
gcloud redis instances create vibe-redis \
  --size 1 \
  --region us-central1

# Get connection details
gcloud redis instances describe vibe-redis \
  --region us-central1
```

### Cloud Run Deployment

Backend application runs as container:

```bash
# Build Docker image
docker build -t vibe-backend:latest -f backend/Dockerfile .

# Push to Container Registry
docker tag vibe-backend:latest \
  gcr.io/your-project/vibe-backend:latest
docker push gcr.io/your-project/vibe-backend:latest

# Deploy to Cloud Run
gcloud run deploy vibe-backend \
  --image gcr.io/your-project/vibe-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars \
    MYSQL_HOST=<cloud-sql-ip>,\
    MONGODB_URL=<atlas-url>,\
    REDIS_URL=<memorystore-ip>,\
    GOOGLE_CLOUD_PROJECT=your-project
```

### Cloud Pub/Sub

```bash
# Create topics
gcloud pubsub topics create notification-created
gcloud pubsub topics create notification-sent

# Create subscriptions
gcloud pubsub subscriptions create \
  notification-created-email \
  --topic notification-created \
  --push-endpoint https://vibe-backend-xxx.run.app/webhooks/email

# Publish test message
gcloud pubsub topics publish notification-created \
  --message '{"notificationId":"test123"}'
```

### Cloud Storage (Optional)

For file uploads:

```bash
# Create bucket
gsutil mb gs://vibe-uploads

# Set permissions
gsutil iam ch \
  serviceAccount:vibe-app@project.iam.gserviceaccount.com:objectCreator,objectViewer \
  gs://vibe-uploads
```

## Containerization

### Dockerfile

**Backend Dockerfile:**

```dockerfile
# backend/Dockerfile
FROM oven/bun:latest as builder

WORKDIR /app

# Copy files
COPY . .

# Install and build
RUN bun install --frozen-lockfile
RUN bun run build

# Runtime stage
FROM oven/bun:latest

WORKDIR /app

# Copy built files
COPY --from=builder /app/backend/dist ./
COPY --from=builder /app/backend/package.json ./

# Install runtime dependencies only
RUN bun install --production --frozen-lockfile

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD bun run healthcheck || exit 1

# Start application
EXPOSE 3000
CMD ["bun", "run", "index.js"]
```

### Building Docker Image

```bash
# Build image
docker build -t vibe-backend:latest -f backend/Dockerfile .

# Tag for registry
docker tag vibe-backend:latest gcr.io/your-project/vibe-backend:latest

# Run locally
docker run -p 3000:3000 \
  -e MYSQL_HOST=host.docker.internal \
  -e MONGODB_URL=mongodb://host.docker.internal:27017 \
  vibe-backend:latest
```

### Docker Compose for Local

**Full development stack:**

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - '3000:3000'
    environment:
      MYSQL_HOST: mysql
      MONGODB_URL: mongodb://mongodb:27017
      REDIS_URL: redis://redis:6379
    depends_on:
      - mysql
      - mongodb
      - redis

  frontend:
    build: ./frontend
    ports:
      - '5173:5173'
    environment:
      VITE_API_URL: http://localhost:3000
    depends_on:
      - backend

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: vibe_db
    volumes:
      - mysql_data:/var/lib/mysql

  mongodb:
    image: mongodb:6.0
    volumes:
      - mongodb_data:/data/db

  redis:
    image: redis:7.0

volumes:
  mysql_data:
  mongodb_data:
```

## Terraform (IaC)

**Location:** `infra/main.tf`

Manages GCP infrastructure as code:

```hcl
# Provider configuration
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project
  region  = var.gcp_region
}

# Variables
variable "gcp_project" {
  type = string
}

variable "gcp_region" {
  type    = string
  default = "us-central1"
}

# Cloud SQL
resource "google_sql_database_instance" "mysql" {
  name             = "vibe-mysql"
  database_version = "MYSQL_8_0"
  region           = var.gcp_region

  settings {
    tier              = "db-f1-micro"
    availability_type = "REGIONAL"
    backup_configuration {
      enabled  = true
      location = var.gcp_region
    }
  }
}

# Redis
resource "google_redis_instance" "cache" {
  name           = "vibe-redis"
  memory_size_gb = 1
  region         = var.gcp_region
}

# Service Account
resource "google_service_account" "app" {
  account_id   = "vibe-app"
  display_name = "VibeWork Application"
}

# IAM Roles
resource "google_project_iam_member" "pubsub" {
  project = var.gcp_project
  role    = "roles/pubsub.editor"
  member  = "serviceAccount:${google_service_account.app.email}"
}
```

### Terraform Commands

```bash
cd infra

# Initialize
terraform init

# Plan changes
terraform plan

# Apply changes
terraform apply

# Destroy resources
terraform destroy

# View state
terraform show
```

## Environment Configuration

### Development (.env)

```env
NODE_ENV=development
LOG_LEVEL=debug

# MySQL
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=vibe_db

# MongoDB
MONGODB_URL=mongodb://localhost:27017/vibe_notifications

# Redis
REDIS_URL=redis://localhost:6379

# Pub/Sub (Emulator)
PUBSUB_EMULATOR_HOST=localhost:8085
GOOGLE_CLOUD_PROJECT=vibe-local

# AWS SES
AWS_REGION=us-east-1
AWS_SES_FROM_ADDRESS=test@example.com
```

### Production (GCP)

```env
NODE_ENV=production
LOG_LEVEL=warn

# Cloud SQL
MYSQL_HOST=<cloud-sql-ip>
MYSQL_USER=app_user
MYSQL_PASSWORD=<strong-password>
MYSQL_DATABASE=vibe_prod

# MongoDB Atlas
MONGODB_URL=mongodb+srv://user:pass@cluster.mongodb.net/vibe

# Cloud Memorystore
REDIS_URL=redis://<memorystore-ip>:6379

# Cloud Pub/Sub
GOOGLE_CLOUD_PROJECT=your-gcp-project
GOOGLE_APPLICATION_CREDENTIALS=/var/secrets/gcp.json

# AWS SES
AWS_REGION=us-east-1
AWS_SES_FROM_ADDRESS=noreply@yourdomain.com
AWS_ROLE_ARN=arn:aws:iam::account:role/service-role
```

## Monitoring and Logging

### GCP Monitoring

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision" \
  --limit 50 \
  --format json

# Create alert policy
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error Rate > 5%" \
  --condition-threshold-value=5
```

### Metrics to Monitor

- **Application**: Request rate, error rate, latency
- **Database**: Connection pool usage, slow queries
- **Cache**: Hit rate, memory usage
- **Pub/Sub**: Message throughput, processing latency
- **Infrastructure**: CPU, memory, disk usage

## Disaster Recovery

### Backup Strategy

**MySQL:**

```bash
# Automated backups (via Cloud SQL)
# Retention: 7 days

# Manual backup
gcloud sql backups create \
  --instance vibe-mysql \
  --description "Pre-deployment backup"
```

**MongoDB Atlas:**

- Automatic backups: Every 12 hours
- Retention: 35 days
- Restore to any point in time

**Pub/Sub:**

- No persistent storage (events processed immediately)
- Implement application-level logging

### Recovery Procedures

1. **Database Corruption**:
   - Restore from backup
   - Verify data integrity
   - Run integrity checks

2. **Service Outage**:
   - Check Cloud Run status
   - Review error logs
   - Rollback if deployment issue

3. **Data Loss**:
   - Restore from backup
   - Re-process events if needed
   - Notify users if applicable

## Security

### Network Security

- Use VPC for database access
- Cloud SQL Auth proxy for secure connections
- Firewall rules to restrict access

### Secrets Management

```bash
# Store secrets in Secret Manager
gcloud secrets create mysql-password \
  --replication-policy automatic \
  --data-file - <<< "secure_password"

# Access in Cloud Run
gcloud run deploy \
  --set-env-vars MYSQL_PASSWORD=projects/PROJECT/secrets/mysql-password/latest
```

### SSL/TLS

- Cloud Load Balancer provides SSL
- Certificates managed by Google
- Auto-renewal enabled

## Cost Optimization

### Recommended Configuration

- **Cloud Run**: Pay-as-you-go, auto-scaling
- **Cloud SQL**: Shared CPU instances for small workloads
- **Redis**: Smallest instance size initially
- **Storage**: 5GB quota included free

### Cost Reduction

- Use reserved instances for predictable load
- Implement caching to reduce database hits
- Monitor and optimize queries
- Clean up unused resources regularly

## Next Steps

- [Deployment Guide](./deployment.md) - Deployment procedures
- [Backend Infrastructure](./backend/infrastructure.md) - Backend services
- [Getting Started](./getting-started.md) - Local setup

---

**Last Updated**: December 2024
