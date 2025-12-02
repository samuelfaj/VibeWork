# Users Module

Authentication and user management module using Better-Auth with Drizzle ORM.

## Purpose

Provides user authentication (signup, login, logout) and user profile management for the VibeWork platform.

## Structure

```
modules/users/
├── core/
│   ├── password.ts          # Argon2 password hashing utilities
│   └── __tests__/
│       └── password.test.ts # Password utility tests
├── routes/
│   ├── auth.routes.ts       # Better-Auth handler mount
│   └── user.routes.ts       # User profile routes
├── schema/
│   ├── user.schema.ts       # Drizzle user table schema
│   └── auth.schema.ts       # Session/account/verification schemas
├── services/
│   └── user.service.ts      # User CRUD operations
├── index.ts                 # Module exports
└── CLAUDE.md                # This file
```

## API Endpoints

### Authentication (handled by Better-Auth)

| Method | Path                      | Description            |
| ------ | ------------------------- | ---------------------- |
| POST   | `/api/auth/sign-up/email` | Register new user      |
| POST   | `/api/auth/sign-in/email` | Login with credentials |
| POST   | `/api/auth/sign-out`      | Logout (clear session) |
| GET    | `/api/auth/session`       | Get current session    |

### User Profile

| Method | Path        | Description                    | Auth Required |
| ------ | ----------- | ------------------------------ | ------------- |
| GET    | `/users/me` | Get current authenticated user | Yes           |

## Request/Response Examples

### Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","name":"John Doe"}'
```

### Sign In

```bash
curl -X POST http://localhost:3000/api/auth/sign-in/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Get Current User

```bash
curl http://localhost:3000/users/me \
  -H "Cookie: better-auth.session_token=<token>"
```

Response:

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "user@example.com",
  "emailVerified": false,
  "image": null,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

## Database Schema

### user table

| Column         | Type         | Constraints             |
| -------------- | ------------ | ----------------------- |
| id             | varchar(36)  | PRIMARY KEY             |
| name           | varchar(255) | NOT NULL                |
| email          | varchar(255) | NOT NULL, UNIQUE        |
| email_verified | boolean      | NOT NULL, DEFAULT false |
| password_hash  | varchar(255) | NOT NULL                |
| image          | text         | NULLABLE                |
| created_at     | timestamp(3) | NOT NULL, DEFAULT NOW() |
| updated_at     | timestamp(3) | NOT NULL, DEFAULT NOW() |

### session table

| Column     | Type         | Constraints                               |
| ---------- | ------------ | ----------------------------------------- |
| id         | varchar(36)  | PRIMARY KEY                               |
| expires_at | timestamp(3) | NOT NULL                                  |
| token      | varchar(255) | NOT NULL, UNIQUE                          |
| ip_address | varchar(45)  | NULLABLE                                  |
| user_agent | text         | NULLABLE                                  |
| user_id    | varchar(36)  | NOT NULL, FK → user(id) ON DELETE CASCADE |

### account table

| Column                   | Type         | Constraints                               |
| ------------------------ | ------------ | ----------------------------------------- |
| id                       | varchar(36)  | PRIMARY KEY                               |
| account_id               | varchar(255) | NOT NULL                                  |
| provider_id              | varchar(255) | NOT NULL                                  |
| user_id                  | varchar(36)  | NOT NULL, FK → user(id) ON DELETE CASCADE |
| access_token             | text         | NULLABLE                                  |
| refresh_token            | text         | NULLABLE                                  |
| access_token_expires_at  | timestamp(3) | NULLABLE                                  |
| refresh_token_expires_at | timestamp(3) | NULLABLE                                  |
| scope                    | text         | NULLABLE                                  |
| password                 | varchar(255) | NULLABLE                                  |

### verification table

| Column     | Type         | Constraints |
| ---------- | ------------ | ----------- |
| id         | varchar(36)  | PRIMARY KEY |
| identifier | varchar(255) | NOT NULL    |
| value      | varchar(255) | NOT NULL    |
| expires_at | timestamp(3) | NOT NULL    |

## Authentication Flow

1. **Signup**: User submits email/password → Better-Auth hashes password → Creates user + session → Returns session cookie
2. **Login**: User submits credentials → Better-Auth verifies → Creates session → Returns session cookie
3. **Protected Routes**: Request includes session cookie → `auth.api.getSession()` validates → Route executes or returns 401
4. **Logout**: Session cookie invalidated → User must re-authenticate

## Environment Variables

| Variable       | Description         | Default   |
| -------------- | ------------------- | --------- |
| MYSQL_HOST     | MySQL hostname      | localhost |
| MYSQL_USER     | MySQL username      | root      |
| MYSQL_PASSWORD | MySQL password      | password  |
| MYSQL_DATABASE | MySQL database name | vibework  |

## Commands

```bash
# Run password tests
bun test backend/modules/users/core --silent

# Push schema to MySQL
cd backend && bun run db:push

# Type check
cd backend && bun run typecheck
```

## Security Considerations

- Passwords hashed with Argon2id (OWASP recommended settings)
- Email uniqueness enforced at database level
- Session tokens are cryptographically secure
- HttpOnly cookies prevent XSS token theft
- Generic error messages prevent user enumeration
- Rate limiting recommended for production (not included)
