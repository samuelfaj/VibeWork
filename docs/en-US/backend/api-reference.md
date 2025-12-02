# Backend API Reference

Complete reference for all backend API endpoints.

## Base URL

```
http://localhost:3000  (development)
https://api.example.com (production)
```

## Authentication Endpoints

All endpoints that require authentication use HTTP-only session cookies.

### Sign Up

Create a new user account.

```http
POST /api/auth/sign-up/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (201 Created):**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": null,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2024-02-15T10:30:00Z"
  }
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input (missing fields, invalid email)
- `409 Conflict` - Email already exists
- `422 Unprocessable Entity` - Password too weak

### Sign In

Login with email and password.

```http
POST /api/auth/sign-in/email
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "image": null
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2024-02-15T10:30:00Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Invalid credentials
- `400 Bad Request` - Missing fields
- `404 Not Found` - User not found

### Get Session

Get current authenticated user session.

```http
GET /api/auth/session
```

**Response (200 OK):**

```json
{
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "session": {
    "id": "session_123",
    "expiresAt": "2024-02-15T10:30:00Z"
  }
}
```

**Response (401 Unauthorized):**

```json
{
  "user": null,
  "session": null
}
```

### Sign Out

Logout current user and invalidate session.

```http
POST /api/auth/sign-out
```

**Response (200 OK):**

```json
{
  "success": true
}
```

**Note:** Uses session cookie for authentication.

## User Endpoints

### Get Current User

Get authenticated user's profile.

```http
GET /api/users/me
```

**Response (200 OK):**

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "image": null,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated

### Update Current User

Update authenticated user's profile.

```http
PUT /api/users/me
Content-Type: application/json

{
  "name": "John Smith",
  "image": null
}
```

**Response (200 OK):**

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Smith",
  "image": null,
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `400 Bad Request` - Invalid input

### Get User Profile

Get public user profile by ID.

```http
GET /api/users/:id
```

**Response (200 OK):**

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "image": null,
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

- `404 Not Found` - User doesn't exist

## Notification Endpoints

### Create Notification

Create a new notification.

```http
POST /api/notifications
Content-Type: application/json

{
  "title": "Welcome!",
  "message": "Welcome to VibeWork",
  "type": "email",
  "userId": "user_123"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | Notification title |
| message | string | Yes | Notification message |
| type | enum | Yes | `email`, `push`, `in-app` |
| userId | string | Yes | Target user ID |
| metadata | object | No | Additional data |

**Response (201 Created):**

```json
{
  "id": "notif_123",
  "title": "Welcome!",
  "message": "Welcome to VibeWork",
  "type": "email",
  "userId": "user_123",
  "read": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "sentAt": null
}
```

**Error Responses:**

- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Not authenticated
- `404 Not Found` - User not found

### List Notifications

Get authenticated user's notifications.

```http
GET /api/notifications?page=1&limit=20&read=false
```

**Query Parameters:**
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number (1-indexed) |
| limit | number | 20 | Items per page (max 100) |
| read | boolean | (all) | Filter by read status |
| type | string | (all) | Filter by notification type |

**Response (200 OK):**

```json
{
  "data": [
    {
      "id": "notif_123",
      "title": "Welcome!",
      "message": "Welcome to VibeWork",
      "type": "email",
      "read": false,
      "createdAt": "2024-01-15T10:30:00Z",
      "sentAt": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "hasMore": false
  }
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated

### Get Notification

Get a specific notification by ID.

```http
GET /api/notifications/:id
```

**Response (200 OK):**

```json
{
  "id": "notif_123",
  "title": "Welcome!",
  "message": "Welcome to VibeWork",
  "type": "email",
  "userId": "user_123",
  "read": false,
  "createdAt": "2024-01-15T10:30:00Z",
  "sentAt": null
}
```

**Error Responses:**

- `404 Not Found` - Notification not found
- `401 Unauthorized` - Not authenticated

### Update Notification

Update notification details (title, message).

```http
PATCH /api/notifications/:id
Content-Type: application/json

{
  "title": "Updated Title",
  "message": "Updated message"
}
```

**Response (200 OK):**

```json
{
  "id": "notif_123",
  "title": "Updated Title",
  "message": "Updated message",
  "type": "email",
  "read": false,
  "updatedAt": "2024-01-15T11:00:00Z"
}
```

**Error Responses:**

- `404 Not Found` - Notification not found
- `401 Unauthorized` - Not authenticated

### Mark as Read

Mark notification as read.

```http
PATCH /api/notifications/:id/read
Content-Type: application/json

{
  "read": true
}
```

**Response (200 OK):**

```json
{
  "id": "notif_123",
  "title": "Welcome!",
  "message": "Welcome to VibeWork",
  "read": true,
  "readAt": "2024-01-15T11:00:00Z"
}
```

**Error Responses:**

- `404 Not Found` - Notification not found
- `401 Unauthorized` - Not authenticated

### Delete Notification

Delete a notification.

```http
DELETE /api/notifications/:id
```

**Response (204 No Content)**

**Error Responses:**

- `404 Not Found` - Notification not found
- `401 Unauthorized` - Not authenticated

## Health Check Endpoints

### Liveness Check

Check if server is running.

```http
GET /healthz
```

**Response (200 OK):**

```json
{
  "status": "ok"
}
```

Used by container orchestration systems to detect if pod should be restarted.

### Readiness Check

Check if server is ready to handle traffic.

```http
GET /readyz
```

**Response (200 OK):**

```json
{
  "status": "ready",
  "checks": {
    "database": "ok",
    "cache": "ok"
  }
}
```

**Response (503 Service Unavailable):**

```json
{
  "status": "not_ready",
  "checks": {
    "database": "error",
    "cache": "ok"
  }
}
```

Checks critical dependencies before marking ready.

## API Documentation

### Swagger UI

Interactive API documentation available at:

```
GET /swagger
```

Open in browser: http://localhost:3000/swagger

### OpenAPI Schema

Raw OpenAPI specification:

```
GET /swagger.json
```

## Common Headers

### Request Headers

```http
Content-Type: application/json
Accept: application/json
Accept-Language: en,pt-BR;q=0.9
Cookie: session=<session_id>
```

### Response Headers

```http
Content-Type: application/json; charset=utf-8
Set-Cookie: session=<session_id>; HttpOnly; SameSite=Lax; Path=/
X-Request-ID: req_abc123
```

## Error Responses

All error responses follow this format:

```json
{
  "error": {
    "code": "INVALID_INPUT",
    "message": "Email is required",
    "details": {
      "field": "email",
      "reason": "required"
    }
  }
}
```

### Common Error Codes

| Code             | Status | Description                 |
| ---------------- | ------ | --------------------------- |
| `INVALID_INPUT`  | 400    | Input validation failed     |
| `UNAUTHORIZED`   | 401    | Not authenticated           |
| `FORBIDDEN`      | 403    | Not authorized for resource |
| `NOT_FOUND`      | 404    | Resource doesn't exist      |
| `CONFLICT`       | 409    | Resource already exists     |
| `RATE_LIMITED`   | 429    | Too many requests           |
| `INTERNAL_ERROR` | 500    | Server error                |

## Pagination

List endpoints support pagination via query parameters:

```http
GET /api/notifications?page=2&limit=50
```

**Parameters:**

- `page` (number, default: 1) - Page number (1-indexed)
- `limit` (number, default: 20, max: 100) - Items per page

**Response Format:**

```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 50,
    "total": 150,
    "hasMore": true
  }
}
```

## Internationalization

### Locale Detection

Backend automatically detects locale from:

1. `Accept-Language` header
2. User preference (if authenticated)
3. Default: `en`

**Example:**

```http
GET /api/notifications
Accept-Language: pt-BR,pt;q=0.9
```

Error messages will be returned in Portuguese.

## Rate Limiting

Currently not implemented in development. Production deployments should implement rate limiting at reverse proxy layer (nginx, Cloudflare, etc.).

**Recommended limits:**

- Auth endpoints: 10 requests/minute per IP
- API endpoints: 100 requests/minute per user
- Health checks: unlimited

## CORS Policy

Configured to allow requests from frontend origin.

**Default (development):**

```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## API Client Examples

### Using Eden RPC (Frontend)

```typescript
import { client } from '@/lib/api'

// Type-safe API calls
const { user, session } = await client.api.auth['sign-in'].email.post({
  email: 'user@example.com',
  password: 'password123',
})
```

### Using curl

```bash
# Sign up
curl -X POST http://localhost:3000/api/auth/sign-up/email \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"securepassword123"}'

# Get session (with cookie)
curl -H "Cookie: session=<session_id>" \
  http://localhost:3000/api/auth/session

# Create notification
curl -X POST http://localhost:3000/api/notifications \
  -H "Content-Type: application/json" \
  -H "Cookie: session=<session_id>" \
  -d '{
    "title": "Test",
    "message": "Test notification",
    "type": "email",
    "userId": "user_123"
  }'
```

### Using Postman

1. Open Postman
2. Import OpenAPI: http://localhost:3000/swagger.json
3. Set cookies for authenticated requests
4. Create requests from imported endpoints

## WebSocket (Future)

WebSocket support is planned for:

- Real-time notifications
- Live updates
- Chat functionality

## API Versioning

Current version: **v1** (implicit)

Future versions will be:

- `/api/v2/...` for breaking changes
- `/api/...` continues to support v1

## Changelog

### Latest Changes

- 2024-01: Initial API design
- 2024-01: Authentication endpoints
- 2024-01: Notifications CRUD endpoints

---

**Last Updated**: December 2024
**API Version**: v1
