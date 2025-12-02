@dependencies [TASK0]
@scope integration

# Task: Docker Compose Local Development Environment

## Summary
Create Docker Compose configuration for local development services: MySQL, MongoDB, Redis, and Google Cloud Pub/Sub emulator. This enables all backend services to run locally without cloud dependencies.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates `/docker-compose.yml` with all required services
- MySQL: for User module with Drizzle ORM
- MongoDB: for Notification module with Typegoose
- Redis: for caching only (NOT event bus)
- Pub/Sub emulator: for async messaging

## Complexity
Medium

## Dependencies
Depends on: [TASK0]
Blocks: [TASK5, TASK6, TASK7, TASK8, TASK11]
Parallel with: [TASK2, TASK3, TASK4]

## Detailed Steps
1. Create `docker-compose.yml` with services:
   - `mysql`: MySQL 8.0, port 3306, with health check
   - `mongodb`: MongoDB 6.0, port 27017, with health check
   - `redis`: Redis 7, port 6379, with health check
   - `pubsub`: Google Cloud Pub/Sub emulator, port 8085

2. Configure volumes for data persistence:
   - `mysql_data` for MySQL
   - `mongodb_data` for MongoDB

3. Set environment variables for each service:
   - MySQL: MYSQL_ROOT_PASSWORD, MYSQL_DATABASE
   - MongoDB: MONGO_INITDB_DATABASE

4. Create `.env.example` with required variables

## Acceptance Criteria
- [ ] `docker-compose up -d` starts all 4 services
- [ ] MySQL accessible on localhost:3306
- [ ] MongoDB accessible on localhost:27017
- [ ] Redis accessible on localhost:6379
- [ ] Pub/Sub emulator accessible on localhost:8085
- [ ] Health checks pass for all services
- [ ] `.env.example` documents required variables

## Code Review Checklist
- [ ] Services use official images
- [ ] Health checks properly configured
- [ ] Volumes persist data between restarts
- [ ] No secrets hardcoded (uses env vars)
- [ ] Network configured for inter-service communication

## Reasoning Trace
Docker Compose provides consistent local development environment matching production services. Using official images ensures reliability. Health checks enable proper startup ordering. Pub/Sub emulator allows testing async messaging without GCP account.
