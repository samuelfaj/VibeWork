@dependencies [TASK5.5, TASK6, TASK7.3]
@scope backend

# Task: Backend Integration Tests with Testcontainers

## Summary
Implement integration tests using Testcontainers for MySQL and MongoDB. Test the User and Notification modules with real database containers.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates integration test files using Testcontainers
- Tests User module with MySQL container
- Tests Notification module with MongoDB container
- Configures Vitest for integration test pattern

## Complexity
Medium

## Dependencies
Depends on: [TASK5.5, TASK6, TASK7.3]
Blocks: [TASK12, TASK15]
Parallel with: []

## Detailed Steps
1. Install test dependencies:
   - @testcontainers/mysql
   - @testcontainers/mongodb
   - vitest

2. Create Vitest configuration:
   - `/backend/vitest.config.ts` - Main config
   - Separate config for integration tests
   - 80% coverage threshold

3. Create integration test for Users:
   - `/backend/modules/users/__tests__/integration.test.ts`
   - Start MySQL container
   - Run migrations
   - Test signup flow
   - Test login flow
   - Clean up container

4. Create integration test for Notifications:
   - `/backend/modules/notifications/__tests__/integration.test.ts`
   - Start MongoDB container
   - Test create notification
   - Test list notifications
   - Test mark as read
   - Clean up container

5. Add test scripts to package.json:
   - `test` - Unit tests only
   - `test:integration` - Integration tests with containers

## Acceptance Criteria
- [ ] Vitest configured with 80% coverage threshold
- [ ] User integration test with MySQL container passes
- [ ] Notification integration test with MongoDB container passes
- [ ] Containers start and stop properly
- [ ] `bun run test:integration` runs all integration tests

## Code Review Checklist
- [ ] Containers cleaned up after tests
- [ ] Proper timeout configuration for container startup
- [ ] Tests isolated from each other
- [ ] No hardcoded container ports (use random)

## Reasoning Trace
Testcontainers provide realistic database testing without mocks. Separate integration test configuration allows running unit tests quickly while integration tests run in CI. 80% coverage threshold ensures comprehensive testing.
