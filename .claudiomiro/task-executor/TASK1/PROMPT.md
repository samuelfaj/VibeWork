## PROMPT
Create Docker Compose configuration for local development environment with MySQL, MongoDB, Redis, and Google Cloud Pub/Sub emulator. Configure health checks, volumes, and environment variables for all services.

## COMPLEXITY
Medium

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Files This Task Will Create
- `/docker-compose.yml` - Docker Compose configuration
- `/.env.example` - Example environment variables

### Service Configuration

**MySQL 8.0:**
- Port: 3306
- Database: vibe_db
- Health check: `mysqladmin ping`

**MongoDB 6.0:**
- Port: 27017
- Database: vibe_notifications
- Health check: `mongosh --eval "db.adminCommand('ping')"`

**Redis 7:**
- Port: 6379
- Health check: `redis-cli ping`

**Pub/Sub Emulator:**
- Image: `gcr.io/google.com/cloudsdktool/cloud-sdk:emulators`
- Port: 8085
- Command: `gcloud beta emulators pubsub start --host-port=0.0.0.0:8085`

## EXTRA DOCUMENTATION
- Docker Compose: https://docs.docker.com/compose/
- Pub/Sub Emulator: https://cloud.google.com/pubsub/docs/emulator

## LAYER
0

## PARALLELIZATION
Parallel with: [TASK2, TASK3, TASK4]

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- Use official Docker images only
- Configure proper health checks for dependency ordering
- All secrets via environment variables
- Verify with `docker-compose config` and `docker-compose up -d`
