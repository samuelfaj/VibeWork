@dependencies [TASK0, TASK1, TASK5.1, TASK5.2]
@scope backend

# Task: Health and Readiness Endpoints

## Summary
Create /healthz and /readyz endpoints for Kubernetes-style health checks. /healthz returns immediately, /readyz checks all infrastructure connections.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions

**Task-Specific Context:**
- Creates `/backend/src/routes/health.ts`
- /healthz returns 200 immediately
- /readyz checks MySQL, MongoDB, Redis with 5s timeout
- Registers routes in Elysia app

## Complexity
Low

## Dependencies
Depends on: [TASK0, TASK1, TASK5.1, TASK5.2]
Blocks: [TASK5.5]
Parallel with: []

## Detailed Steps
1. Create `/backend/src/routes/health.ts`:
   - GET /healthz: Returns { status: 'ok' } immediately
   - GET /readyz: Checks MySQL, MongoDB, Redis
     - Returns 200 with { status: 'ready', checks: {...} } if all pass
     - Returns 503 with { status: 'not-ready', checks: {...} } if any fail

2. Register health routes in `/backend/src/app.ts`

3. Write unit tests with mocked infra checks

## Acceptance Criteria
- [ ] /healthz returns 200 immediately
- [ ] /readyz checks MySQL, MongoDB, Redis
- [ ] /readyz returns 200 when all pass
- [ ] /readyz returns 503 when any fail
- [ ] Checks run in parallel with 5s timeout
- [ ] Response includes individual check results
- [ ] Unit tests pass

## Code Review Checklist
- [ ] Health endpoints are public (no auth)
- [ ] No detailed error messages exposed
- [ ] /healthz has no external dependencies
- [ ] Timeout per check prevents blocking

## Reasoning Trace
Health endpoints enable Kubernetes liveness and readiness probes. /healthz confirms process is running, /readyz confirms dependencies are available. Parallel checks with timeout ensure responsive readiness checks.
