# RESEARCH.md (Adapted from TASK5.5)

> This research was adapted from TASK5.5 (92% similar). Matching topics: authentication, api, database, testing, config, service, component, validation, error, logging, file.

# Research for TASK5.5

## Context Reference

**For tech stack and conventions, see:**

- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/AI_PROMPT.md` - Universal context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.5/TASK.md` - Task-level context
- `/Users/samuelfajreldines/Desenvolvimento/VibeWork/.claudiomiro/task-executor/TASK5.5/PROMPT.md` - Task-specific context

**This file contains ONLY new information discovered during research.**

---

## Task Understanding Summary

Create `/backend/CLAUDE.md` documenting the backend package purpose, tech stack, directory structure, scripts, environment variables, and API endpoints. Reference TODO.md for full acceptance criteria.

---

## Similar Components Found (LEARN FROM THESE)

### 1. `packages/contract/CLAUDE.md`

**Why similar:** Same documentation format for a package CLAUDE.md
**Patterns to reuse:**

- Section structure: Purpose, Structure (tree), Commands, Usage Examples
- Concise format with code blocks for structure visualization
- Naming conventions section
- Available resources table format
  **Key learnings:**
- Use markdown code blocks with backticks for directory trees
- Include quick bash commands section
- Document available schemas/endpoints in table format

### 2. `frontend/CLAUDE.md`

**Why similar:** Same package-level CLAUDE.md documentation format
**Patterns to reuse:**

- Lines 1-40: Structure with Purpose, Structure (tree diagram), Quick Start
- Lines 99-132: Environment Variables table with Variable | Description | Default columns
- Lines 133-145: Key Dependencies list format
- Adding features workflow section
  **Key learnings:**
- Include supported locales section for i18n
- Environment variables table format: `| Variable | Description | Default |`
- Quick Start section with numbered steps

---

## Reusable Components (USE THESE, DON'T RECREATE)

No reusable code components needed - this is a documentation task only.

---

## Codebase Conventions Discovered

### CLAUDE.md Structure Pattern (from existing files)

```markdown
# Package Name

Short description.

## Purpose

Brief explanation of the package role.

## Structure
```

directory-tree/
├── folder/
│ └── file.ts
└── file.ts

````

## Quick Start / Commands
```bash
bun run dev
bun run build
````

## Environment Variables

| Variable | Description | Default |

## Available Endpoints / Schemas

| Type | Name | Description |

```

---

## Files Discovered to Read (NOT in PROMPT.md)

Files already reviewed that inform CLAUDE.md content:
- `backend/package.json` - Scripts: dev, build, test, lint, typecheck
- `backend/src/app.ts` - Elysia app with swagger, cors, i18n, error handling
- `backend/src/index.ts` - Entry point, PORT env, graceful shutdown
- `backend/src/routes/health.ts:38-58` - /healthz, /readyz endpoints
- `backend/src/infra/index.ts` - Exports for mysql, mongodb, redis, pubsub
- `backend/src/infra/database/mysql.ts` - MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DATABASE
- `backend/src/infra/database/mongodb.ts` - MONGODB_URI
- `backend/src/infra/cache.ts` - REDIS_URL (default: redis://localhost:6379)
- `backend/src/infra/pubsub.ts` - PUBSUB_PROJECT_ID, PUBSUB_EMULATOR_HOST
- `backend/src/i18n/index.ts` - i18next with en, pt-BR locales
- `backend/Dockerfile` - Multi-stage Bun build, port 3000

---

## Integration & Impact Analysis

### No Code Modifications
This task creates a new documentation file only. No code changes.

### Files Created:
- `/backend/CLAUDE.md` - New file, no dependencies

---

## Test Strategy Discovered

N/A - Documentation task, no tests required.

---

## Risks & Challenges Identified

### Technical Risks
1. **Outdated Documentation**
   - Impact: Low
   - Mitigation: Derive all info from actual source files (already reviewed)

### Complexity Assessment
- Overall: Low
- Reasoning: Pure documentation task with clear template from existing CLAUDE.md files

### Missing Information
- [ ] None - All required information collected from source files

---

## Execution Strategy Recommendation

**Based on research findings, execute in this order:**

1. **Create /backend/CLAUDE.md**
   - Follow pattern from: `packages/contract/CLAUDE.md`, `frontend/CLAUDE.md`
   - Include sections:
     - Purpose
     - Tech Stack (from package.json dependencies)
     - Directory Structure (from glob results)
     - Scripts (from package.json)
     - Environment Variables (from infra/*.ts files)
     - API Endpoints (from routes/health.ts)
     - Development Setup
   - Verify: File exists, all sections complete

2. **Verify Accuracy**
   - Cross-check env vars against actual usage in infra/
   - Cross-check scripts against package.json
   - Ensure no secrets exposed

---

**Research completed:** 2025-12-02
**Total similar components found:** 2
**Total reusable components identified:** 0 (documentation task)
**Estimated complexity:** Low
```

---

## Task-Specific Additions

Review the content above and adapt as needed for this specific task.
