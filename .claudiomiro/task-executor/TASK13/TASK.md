@dependencies [TASK0, TASK5, TASK6, TASK7, TASK9.5]
@scope integration

# Task: Root and Package CLAUDE.md Documentation

## Summary
Create comprehensive CLAUDE.md documentation files for the root project and all major packages, documenting purpose, architecture, commands, and conventions.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates `/CLAUDE.md` at root
- Documents project overview, architecture, quick start
- Creates package-level CLAUDE.md files

## Complexity
Low

## Dependencies
Depends on: [TASK0, TASK5, TASK6, TASK7, TASK9.5]
Blocks: [TASK15]
Parallel with: [TASK12]

## Detailed Steps
1. Create root `/CLAUDE.md`:
   - Project overview
   - Tech stack summary
   - Architecture diagram (ASCII or description)
   - Quick start guide
   - Monorepo structure explanation
   - Common commands

2. Verify package CLAUDE.md files exist:
   - `/backend/CLAUDE.md` (created in TASK5)
   - `/frontend/CLAUDE.md` (created in TASK9.5)
   - `/packages/contract/CLAUDE.md` (created in TASK3)
   - `/backend/modules/users/CLAUDE.md` (created in TASK6)
   - `/backend/modules/notifications/CLAUDE.md` (created in TASK7)

3. Ensure consistency across all CLAUDE.md files:
   - Same structure/format
   - Correct cross-references
   - Up-to-date commands

## Acceptance Criteria
- [ ] Root `CLAUDE.md` documents full project
- [ ] All package CLAUDE.md files exist and are consistent
- [ ] Quick start guide works as documented
- [ ] Architecture is clearly explained
- [ ] All commands are accurate

## Code Review Checklist
- [ ] Commands are tested and work
- [ ] No broken cross-references
- [ ] Consistent formatting
- [ ] Up-to-date with implementation

## Reasoning Trace
CLAUDE.md files serve as the primary documentation for AI agents and developers. Root documentation provides the big picture while package docs provide focused guidance. Consistency ensures predictable documentation experience.
