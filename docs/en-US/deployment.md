# Deployment Guide

Guide to deploying VibeWork to production environments.

## Deployment Overview

```
Development → Staging → Production
   (local)    (testing)  (public)
```

## Pre-Deployment Checklist

### Code Quality

- [ ] All tests passing (`bun run test`)
- [ ] No TypeScript errors (`bun run typecheck`)
- [ ] Linting passed (`bun run lint`)
- [ ] Code formatted (`bun run format`)

### Testing

- [ ] Unit tests: 80%+ coverage
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Manual QA approved

### Documentation

- [ ] README updated
- [ ] API changes documented
- [ ] Environment variables documented
- [ ] Deployment notes added

### Git

- [ ] Branch reviewed and approved
- [ ] Merged to main/release branch
- [ ] Version bumped (semantic versioning)
- [ ] CHANGELOG updated

## Version Management

### Semantic Versioning

Format: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes

Example: `1.2.3`

### Automated Versioning with semantic-release

```bash
# Configure in .releaserc.js
{
  "branches": ["main", { "name": "beta", "prerelease": true }],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    "@semantic-release/npm",
    "@semantic-release/git",
    "@semantic-release/github"
  ]
}
```

### Release Process

1. Commit changes with conventional commit format
2. Push to main branch
3. semantic-release automatically:
   - Analyzes commits
   - Bumps version
   - Generates changelog
   - Creates release
   - Publishes

**Conventional Commits:**

```
feat: Add new feature       → MINOR bump
fix: Fix bug               → PATCH bump
BREAKING CHANGE: ...       → MAJOR bump
```

## Staging Deployment

Deploy to staging before production.

### Staging Environment

- Same infrastructure as production (smaller scale)
- Uses test data
- Allows pre-production testing
- Can be reset if needed

### Deploy to Staging

```bash
# Build
bun run build

# Run tests
bun run test
bun run test:integration
bun run test:e2e

# Deploy to staging
gcloud run deploy vibe-backend-staging \
  --image gcr.io/your-project/vibe-backend:staging \
  --region us-central1 \
  --environment staging
```

### Staging Testing

- Smoke tests (critical paths)
- Performance testing
- Load testing
- Security testing

## Production Deployment

### Docker Build & Push

```bash
# Build Docker image
docker build -t vibe-backend:latest -f backend/Dockerfile .

# Tag for registry
docker tag vibe-backend:latest \
  gcr.io/your-project/vibe-backend:latest

# Push to Container Registry
docker push gcr.io/your-project/vibe-backend:latest

# Optional: Tag with version
docker tag vibe-backend:latest \
  gcr.io/your-project/vibe-backend:v1.2.3
```

### Cloud Run Deployment

```bash
# Deploy with environment variables
gcloud run deploy vibe-backend \
  --image gcr.io/your-project/vibe-backend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 60 \
  --max-instances 100 \
  --min-instances 1 \
  --set-env-vars \
    NODE_ENV=production,\
    MYSQL_HOST=$MYSQL_HOST,\
    MYSQL_USER=$MYSQL_USER,\
    MYSQL_PASSWORD=$MYSQL_PASSWORD,\
    MONGODB_URL=$MONGODB_URL,\
    REDIS_URL=$REDIS_URL,\
    GOOGLE_CLOUD_PROJECT=$GCP_PROJECT,\
    AWS_REGION=us-east-1,\
    AWS_SES_FROM_ADDRESS=$SES_FROM
```

### Frontend Deployment

```bash
# Build frontend
cd frontend
bun run build
# Creates dist/

# Deploy to Cloud Storage + CDN
gsutil -m cp -r dist/* gs://vibe-cdn/

# Or deploy to Cloud Run (serve static files)
docker build -t vibe-frontend:latest -f frontend/Dockerfile .
docker push gcr.io/your-project/vibe-frontend:latest

gcloud run deploy vibe-frontend \
  --image gcr.io/your-project/vibe-frontend:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Database Migrations

```bash
# Run migrations before deployment
cd backend

# Connect to production database
gcloud sql connect vibe-mysql --user root

# Run migrations
bun run db:migrate

# Verify
bun run db:export-schema
```

## Monitoring Deployment

### Check Deployment Status

```bash
# View Cloud Run service
gcloud run services describe vibe-backend \
  --platform managed \
  --region us-central1

# View recent logs
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=vibe-backend" \
  --limit 100 \
  --format json

# View metrics
gcloud monitoring time-series list \
  --filter='metric.type="run.googleapis.com/request_count"'
```

### Health Checks

```bash
# Liveness check
curl https://vibe-backend-xxx.run.app/healthz

# Readiness check
curl https://vibe-backend-xxx.run.app/readyz

# Response should include all services OK
```

### Error Tracking

- Monitor error logs
- Check exception tracking (Sentry, etc.)
- Review performance metrics
- Verify database connections

## Rollback Procedures

### Rollback to Previous Version

```bash
# View revisions
gcloud run revisions list --service vibe-backend

# Rollback to previous revision
gcloud run deploy vibe-backend \
  --image gcr.io/your-project/vibe-backend:v1.2.2 \
  --region us-central1

# Or route traffic to specific revision
gcloud run services update vibe-backend \
  --update-traffic previous-revision=100 \
  --region us-central1
```

### Database Rollback

```bash
# For migrations, create rollback migrations
# Example: migration down script

bun run db:rollback

# Or restore from backup
gcloud sql backups restore BACKUP_ID \
  --backup-instance vibe-mysql
```

## Zero-Downtime Deployment

### Gradual Traffic Shift

```bash
# Deploy new version
gcloud run deploy vibe-backend \
  --image gcr.io/your-project/vibe-backend:v1.3.0 \
  --region us-central1 \
  --no-traffic

# Route 10% traffic to new version
gcloud run services update vibe-backend \
  --update-traffic new-revision=10,stable-revision=90 \
  --region us-central1

# Monitor errors and metrics

# If OK, increase to 50%
gcloud run services update vibe-backend \
  --update-traffic new-revision=50,stable-revision=50 \
  --region us-central1

# Finally switch 100%
gcloud run services update vibe-backend \
  --update-traffic new-revision=100 \
  --region us-central1
```

### Health Check Optimization

```hcl
# terraform/main.tf
resource "google_cloud_run_service" "backend" {
  # ... other config ...

  # Configure minimum instances to avoid cold starts
  template {
    spec {
      container_concurrency = 50
      service_account_name  = google_service_account.app.email
    }
  }
}
```

## Post-Deployment

### Verification

- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Database connections working
- [ ] Pub/Sub messages flowing
- [ ] Emails sending
- [ ] No error spikes in logs
- [ ] Performance metrics normal
- [ ] User reports no issues

### Announcement

```markdown
# Deployment Update

Version: v1.2.3
Date: 2024-01-15
Environment: Production

## Changes

- Added feature X
- Fixed bug Y
- Improved performance Z

## Impact

- No downtime
- No database migrations required
- Optional: No action needed from users

## Rollback Plan

Can rollback to v1.2.2 if critical issues found
```

## CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test
      - run: bun run test:integration
      - run: bun run test:e2e

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          context: ./backend
          push: true
          tags: gcr.io/your-project/vibe-backend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy vibe-backend \
            --image gcr.io/your-project/vibe-backend:${{ github.sha }}
```

## Troubleshooting

### Deployment Failed

```bash
# Check logs
gcloud run logs read vibe-backend

# View deployment history
gcloud run revisions list --service vibe-backend

# Check configuration
gcloud run services describe vibe-backend
```

### Cold Starts

**Solution**: Set minimum instances

```bash
gcloud run services update vibe-backend \
  --min-instances 1
```

### Out of Memory

**Solution**: Increase memory allocation

```bash
gcloud run deploy vibe-backend \
  --memory 1Gi
```

### Database Connection Issues

```bash
# Verify Cloud SQL Proxy
gcloud sql instances describe vibe-mysql

# Check network connectivity
gcloud compute networks peering list

# Test connection
gcloud sql connect vibe-mysql --user root
```

## Production Monitoring

### Essential Metrics

- Request rate and latency
- Error rate by endpoint
- Database query performance
- Cache hit rate
- Pub/Sub message throughput

### Alerting

Set up alerts for:

- Error rate > 1%
- Response time > 1s
- Database CPU > 80%
- Disk usage > 90%

### Dashboards

Create dashboards for:

- Service health
- Traffic patterns
- Error trends
- Performance metrics

## Disaster Recovery Plan

### RTO/RPO Targets

- **RTO** (Recovery Time Objective): 1 hour
- **RPO** (Recovery Point Objective): 15 minutes

### Backup Schedule

- Database: Every 6 hours, retention 30 days
- Configuration: Every deploy
- Logs: Retained 90 days

### Incident Response

1. **Detect**: Monitoring alerts
2. **Assess**: Check logs and metrics
3. **Respond**: Rollback or fix
4. **Verify**: Health checks pass
5. **Document**: Post-mortem

## Next Steps

- [Infrastructure Guide](./infrastructure.md) - GCP setup
- [Monitoring](#monitoring-deployment) - Setup monitoring
- [Automation](#cicd-pipeline) - Setup automation
- [Rollback](#rollback-procedures) - Know how to rollback

---

**Last Updated**: December 2024
