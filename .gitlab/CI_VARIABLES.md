# GitLab CI/CD Variables Configuration

## Required Variables

| Variable             | Description                     | Environments |
| -------------------- | ------------------------------- | ------------ |
| `GCP_SERVICE_KEY`    | GCP service account JSON        | All          |
| `GCP_PROJECT_ID`     | GCP project ID                  | All          |
| `DB_HOST`            | Cloud SQL host                  | All          |
| `DB_USER`            | Database user (dev/staging)     | Dev, Staging |
| `DB_PASSWORD`        | Database password (dev/staging) | Dev, Staging |
| `DB_PROD_USER`       | Database user (prod)            | Prod         |
| `DB_PROD_PASSWORD`   | Database password (prod)        | Prod         |
| `MONGODB_URI`        | MongoDB URI (dev/staging)       | Dev, Staging |
| `MONGODB_PROD_URI`   | MongoDB URI (prod)              | Prod         |
| `REDIS_URL`          | Redis URL (dev/staging)         | Dev, Staging |
| `REDIS_PROD_URL`     | Redis URL (prod)                | Prod         |
| `BETTER_AUTH_SECRET` | Better Auth secret key          | All          |
| `JWT_SECRET`         | JWT signing secret              | All          |

## Optional Variables

| Variable              | Description                 | Default |
| --------------------- | --------------------------- | ------- |
| `BROWSERBASE_API_KEY` | Browserbase API for E2E     | -       |
| `SLACK_WEBHOOK_URL`   | Slack notifications webhook | -       |

## Generate Secrets

```bash
# Generate auth secrets
openssl rand -base64 32  # For BETTER_AUTH_SECRET
openssl rand -base64 32  # For JWT_SECRET
```

## Environment Variables Generated in .env

### Development (main branch)

```env
NODE_ENV=development
ENVIRONMENT=dev
PORT=3000
TZ=America/Sao_Paulo
MYSQL_HOST=$DB_HOST
MYSQL_PORT=3306
MYSQL_USER=$DB_USER
MYSQL_PASSWORD=$DB_PASSWORD
MYSQL_DATABASE=vibe_dev
MONGODB_URI=$MONGODB_URI
REDIS_URL=$REDIS_URL
FRONTEND_URL=https://dev.vibework.app
API_URL=https://api-dev.vibework.app
GCP_PROJECT_ID=$GCP_PROJECT_ID
BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET
JWT_SECRET=$JWT_SECRET
```

### Staging (staging branch)

```env
NODE_ENV=staging
ENVIRONMENT=staging
MYSQL_DATABASE=vibe_staging
FRONTEND_URL=https://staging.vibework.app
API_URL=https://api-staging.vibework.app
# ... same as dev
```

### Production (production branch)

```env
NODE_ENV=production
ENVIRONMENT=prod
MYSQL_USER=$DB_PROD_USER
MYSQL_PASSWORD=$DB_PROD_PASSWORD
MYSQL_DATABASE=vibe
MONGODB_URI=$MONGODB_PROD_URI
REDIS_URL=$REDIS_PROD_URL
FRONTEND_URL=https://vibework.app
API_URL=https://api.vibework.app
# ... same as dev
```

## Pipeline Flow

```
main branch        →  backend:deploy:dev     →  api-dev.vibework.app
staging branch     →  backend:deploy:staging →  api-staging.vibework.app
production branch  →  backend:deploy:prod    →  api.vibework.app
```

## Deploy Process

1. Generate `.env` file with all environment variables
2. `gcloud builds submit` - builds Docker image with .env included
3. `gcloud run deploy` - deploys to Cloud Run

## Setting Up Variables in GitLab

1. Go to **Settings > CI/CD > Variables**
2. Add each variable with the following settings:
   - **Type**: Variable
   - **Protected**: Yes (for production secrets)
   - **Masked**: Yes (for sensitive values like passwords)
   - **Expand variable reference**: No

## GCP Service Account Setup

The `GCP_SERVICE_KEY` should be a JSON key for a service account with these roles:

- **Cloud Run Admin** - Deploy Cloud Run services
- **Cloud Build Editor** - Submit builds
- **Artifact Registry Writer** - Push Docker images
- **Cloud SQL Client** - Access Cloud SQL (if using Cloud SQL Proxy)
- **Pub/Sub Publisher/Subscriber** - Access Pub/Sub topics
- **Storage Object Admin** - Access GCS buckets (for Terraform state)

### Create Service Account

```bash
# Create service account
gcloud iam service-accounts create vibework-ci \
  --display-name="VibeWork CI/CD"

# Grant roles
gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:vibework-ci@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:vibework-ci@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding PROJECT_ID \
  --member="serviceAccount:vibework-ci@PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"

# Create and download key
gcloud iam service-accounts keys create key.json \
  --iam-account=vibework-ci@PROJECT_ID.iam.gserviceaccount.com

# Copy contents of key.json to GCP_SERVICE_KEY variable
cat key.json
```
