## PROMPT
Perform comprehensive final validation of the complete system. Run all verification checks from AI_PROMPT.md, verify all test suites pass, and ensure the full signup flow works end-to-end. This is the Final Ω task.

## COMPLEXITY
High

## CONTEXT REFERENCE
**For complete environment context, read:**
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Contains full tech stack, architecture, project structure, coding conventions, and related code patterns

**You MUST read AI_PROMPT.md before executing this task to understand the environment.**

## TASK-SPECIFIC CONTEXT

### Verification Checklist (from AI_PROMPT.md)

**Run these commands and verify success:**
```bash
# Foundation
bun install
bun run build
bun run typecheck
bun run lint

# Docker
docker-compose up -d

# Tests
bun run test
bun run test:integration
bun run test:e2e

# Infrastructure
docker build -t backend ./backend
cd infra && terraform validate
```

**Manual verifications:**
- Navigate to http://localhost:3000/swagger
- Navigate to http://localhost:5173
- Complete signup flow
- Test i18n language switching
- Test commit with bad message (should be rejected)

### Requirement Traceability

Cross-check against Section 4 (Acceptance Criteria) and Section 6 (Verification and Traceability) in AI_PROMPT.md. Every checkbox must be verified.

### Integration Points

This task validates integration between:
- Frontend ↔ Backend (Eden RPC)
- Backend ↔ MySQL (Drizzle)
- Backend ↔ MongoDB (Typegoose)
- Backend ↔ Redis (Cache)
- Backend ↔ Pub/Sub (Events)
- Better-Auth ↔ MySQL (Sessions)

## EXTRA DOCUMENTATION
See AI_PROMPT.md Section 6: Verification and Traceability

## LAYER
Ω (Final)

## PARALLELIZATION
Parallel with: []

## CONSTRAINTS
- IMPORTANT: Do not perform any git commit or git push.
- ALL acceptance criteria must pass
- ALL test suites must pass
- Document any issues found
- This task MUST NOT be skipped
- System must be fully functional after this task
