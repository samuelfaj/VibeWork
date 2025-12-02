@dependencies [TASK3, TASK5.5]
@scope backend

# Task: User Module (MySQL/Drizzle + Better-Auth)

## Summary
Implement the User module with Drizzle schema, Better-Auth integration for email/password authentication, and API endpoints for signup, login, and user profile.

## Context Reference
**For complete environment context, see:**
- `../AI_PROMPT.md` - Contains full tech stack, architecture, coding conventions, and related code patterns

**Task-Specific Context:**
- Creates `/backend/modules/users/` module structure
- Implements Drizzle schema for users table
- Integrates Better-Auth with Drizzle adapter
- Creates authentication routes: signup, login, me

## Complexity
High

## Dependencies
Depends on: [TASK3, TASK5.5]
Blocks: [TASK8, TASK11, TASK12]
Parallel with: [TASK7]

## Detailed Steps
1. Create module structure:
   - `/backend/modules/users/schema/user.schema.ts` - Drizzle schema
   - `/backend/modules/users/core/password.ts` - Password hashing utilities
   - `/backend/modules/users/services/user.service.ts` - Data access layer
   - `/backend/modules/users/routes/auth.routes.ts` - Auth endpoints
   - `/backend/modules/users/routes/user.routes.ts` - User endpoints

2. Define Drizzle schema:
   - users table: id, email, passwordHash, createdAt, updatedAt

3. Implement Better-Auth:
   - `/backend/infra/auth.ts` - Better-Auth configuration
   - Drizzle adapter for MySQL
   - Email/password authentication only

4. Create password utilities:
   - Hash password with argon2
   - Verify password
   - Unit test for password functions

5. Implement routes:
   - `POST /signup` - Create user, return session
   - `POST /login` - Authenticate, return session
   - `GET /users/me` - Protected route, return current user

6. Run database migration:
   - Create drizzle.config.ts
   - Generate and apply migration

7. Create module `CLAUDE.md`

## Acceptance Criteria
- [ ] `users` table created via Drizzle migration
- [ ] Better-Auth integrated with Drizzle adapter
- [ ] `POST /signup` creates user and returns session
- [ ] `POST /login` authenticates and returns session
- [ ] `GET /users/me` returns current user (protected)
- [ ] Password uses argon2 hashing
- [ ] Unit test exists for password hashing in `core/`
- [ ] Module `CLAUDE.md` documents API endpoints

## Code Review Checklist
- [ ] No plaintext passwords stored
- [ ] Email uniqueness enforced at DB level
- [ ] Protected routes check session
- [ ] Error messages don't leak user existence
- [ ] Validation uses schemas from contract package

## Reasoning Trace
User module establishes the authentication foundation. Better-Auth provides battle-tested auth with Drizzle integration. Separating password utilities into core/ enables unit testing without database. Protected routes use session-based authentication.
