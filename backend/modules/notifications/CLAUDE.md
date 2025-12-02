# Notifications Module

## Purpose

Handles user notifications with support for in-app and email delivery channels. Provides CRUD operations, Pub/Sub event publishing, and async email delivery via Google Cloud Pub/Sub.

## API Endpoints

### POST /notifications

Creates a new notification and publishes event to Pub/Sub.

**Request:**

```json
{
  "userId": "string",
  "type": "in-app" | "email",
  "message": "string"
}
```

**Response (201):**

```json
{
  "id": "string",
  "userId": "string",
  "type": "in-app" | "email",
  "message": "string",
  "read": false,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### GET /notifications

Lists notifications for authenticated user with pagination.

**Headers:**

- `X-User-Id`: string (required) - User ID for authentication

**Query Parameters:**

- `page`: number (default: 1)
- `limit`: number (default: 20)

**Response:**

```json
{
  "data": [...notifications],
  "total": 100,
  "page": 1,
  "limit": 20
}
```

### PATCH /notifications/:id/read

Marks a notification as read.

**Headers:**

- `X-User-Id`: string (required) - User ID for authentication

**Response:**

```json
{
  "id": "string",
  "userId": "string",
  "type": "in-app",
  "message": "string",
  "read": true,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Errors:**

- `401`: Missing X-User-Id header
- `404`: Notification not found or belongs to another user

## Dependencies

- **@vibe-code/contract**: TypeBox schemas for validation
- **Google Cloud Pub/Sub**: Async event publishing
- **MongoDB/Typegoose**: Document storage
- **AWS SES**: Email delivery (optional)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Notifications Module                      │
├─────────────────────────────────────────────────────────────┤
│  routes/                                                     │
│    └── notification.routes.ts   ← REST API endpoints         │
├─────────────────────────────────────────────────────────────┤
│  services/                                                   │
│    ├── notification.service.ts  ← CRUD operations            │
│    ├── notification-publisher.ts ← Pub/Sub publishing        │
│    ├── notification-subscriber.ts ← Pub/Sub subscription     │
│    └── email.service.ts         ← Email delivery (SES)       │
├─────────────────────────────────────────────────────────────┤
│  core/                                                       │
│    └── notification.formatter.ts ← Response formatting       │
├─────────────────────────────────────────────────────────────┤
│  models/                                                     │
│    └── notification.model.ts    ← Typegoose model            │
└─────────────────────────────────────────────────────────────┘
```

## Environment Variables

| Variable               | Description                             | Required |
| ---------------------- | --------------------------------------- | -------- |
| `MONGODB_URI`          | MongoDB connection string               | Yes      |
| `PUBSUB_PROJECT_ID`    | Google Cloud project ID                 | Yes      |
| `PUBSUB_EMULATOR_HOST` | Emulator endpoint (dev only)            | No       |
| `AWS_REGION`           | AWS region for SES                      | No       |
| `EMAIL_FROM`           | Sender email address                    | No       |
| `MOCK_EMAIL`           | Set to 'true' to use mock email service | No       |

## Testing Locally

```bash
# Run unit tests
bun test backend/modules/notifications

# Run specific test file
bun test backend/modules/notifications/routes/notification.routes.test.ts

# Start Pub/Sub emulator (required for integration tests)
gcloud beta emulators pubsub start --project=test-project

# Set emulator env
export PUBSUB_EMULATOR_HOST=localhost:8085
export PUBSUB_PROJECT_ID=test-project
```

## Pub/Sub Topics

| Topic                  | Description                            |
| ---------------------- | -------------------------------------- |
| `notification-created` | Published when notification is created |

## Data Flow

1. Client sends POST /notifications
2. Route validates with CreateNotificationSchema
3. NotificationService creates document in MongoDB
4. NotificationPublisher publishes to `notification-created` topic
5. NotificationSubscriber (async) receives message
6. If type=email, EmailService sends via AWS SES
