# TaskFlow Backend

A production-oriented, multi-tenant project management backend built as part of a Backend Developer Technical Assignment.

TaskFlow allows users to belong to organizations, create and manage projects, manage tasks, assign work, add comments, and receive asynchronous task-assignment notifications.

The project focuses on secure multi-tenant access, organization-level RBAC, PostgreSQL database design, clean architecture, background job processing, validation, error handling, and Dockerized deployment.

---
# 🌐 Deployment

The backend is deployed on Render.

## 🚀 Live API

**Base URL:**  
https://taskflow-backend-nqwe.onrender.com

**Health Check API:**  
[https://taskflow-backend-nqwe.onrender.com/health](https://taskflow-backend-nqwe.onrender.com/health)


---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| TypeScript | Programming Language |
| Express.js | REST API Framework |
| PostgreSQL | Primary Database |
| Prisma | ORM |
| Redis | Queue Backend |
| BullMQ | Background Job Processing |
| JWT | Authentication |
| bcrypt | Password Hashing |
| Zod | Request Validation |
| Docker | Containerization |
| Docker Compose | Multi-Service Environment |

---

# ✨ Features

- JWT authentication
- Access and refresh token authentication
- Secure password hashing using bcrypt
- Organization-level RBAC
- Strict multi-tenant data isolation
- Project CRUD
- Task CRUD
- Task filtering
- Offset pagination
- Task assignment and unassignment
- Comments CRUD
- Project dashboard with task counts
- Redis + BullMQ background jobs
- Asynchronous task-assignment notifications
- Job retry with exponential backoff
- Dead-letter queue
- Job status tracking
- PostgreSQL migrations
- Seed data
- Soft delete for projects and tasks
- PostgreSQL full-text search
- Zod request validation
- Centralized error handling
- Authentication rate limiting
- Dockerized API, Worker, PostgreSQL and Redis

---

# 🏗️ Architecture

TaskFlow follows a clean layered architecture:

```text
Client
   │
   ▼
Express API
   │
   ▼
Routes
   │
   ▼
Middleware
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL
```

### Background Job Architecture

```text
Client
   │
   ▼
API
   │
   ├── Persist Task Assignment
   │
   └── Enqueue Notification Job
              │
              ▼
           BullMQ
              │
              ▼
            Redis
              │
              ▼
           Worker
              │
              ▼
       Email Notification
```

The worker runs independently from the API process so email processing does not block API requests.

---

# 🔐 Multi-Tenant Security

One of the most important requirements of this assignment is strict organization-level isolation.

> A user from Organization A must never be able to read, update, or delete Organization B's projects, even if they know the project ID.

The application enforces organization-level authorization at the service layer.

The organization context is obtained from the authenticated user's JWT.

Client-provided `organizationId` values are never trusted.

### Example

```text
Organization A
    │
    └── User A
          │
          │ JWT
          ▼
     organizationId = A
          │
          ▼
     Request Project B
          │
          ▼
     Project.organizationId = B
          │
          ▼
        A != B
          │
          ▼
    403 Forbidden
```

The same tenant-isolation strategy is applied to:

- Projects
- Tasks
- Task assignments
- Comments
- Organization members

This prevents cross-organization data access even when a valid resource ID is known.

---

# 🗄️ Database Design

PostgreSQL is used as the primary database.

## Main Tables

```text
users
organizations
org_members
projects
tasks
task_assignments
comments
```

### Entity Relationship

```text
Users
  │
  ├───────────────┐
  │               │
  ▼               ▼
org_members   task_assignments
  │               │
  ▼               ▼
organizations   tasks
                    │
                    ├──────────────┐
                    │              │
                    ▼              ▼
                 projects       comments
                    │              │
                    ▼              ▼
              organizations       users
```

## PostgreSQL Enums

### Status

```text
todo
in_progress
review
done
```

### Priority

```text
low
medium
high
urgent
```

### Organization Role

```text
org_admin
member
```

Database changes are managed using Prisma migration files.

---

# 🗑️ Soft Delete

Projects and tasks support soft deletion using the `deleted_at` field.

Instead of immediately removing the record from the database, the record is marked as deleted.

This helps preserve historical data and provides safer data management.

---

# 🔎 Full-Text Search

Task title and description support PostgreSQL full-text search.

This allows users to search tasks using PostgreSQL without requiring an external search service.

---

# 🔑 Authentication

Authentication is implemented using JWT.

## Access Token

- JWT based
- 15-minute TTL
- Contains authenticated user and organization context
- Includes organization role

Example payload:

```json
{
  "sub": "user-id",
  "organizationId": "organization-id",
  "role": "member"
}
```

## Refresh Token

- 7-day TTL
- Stored in PostgreSQL
- Supports revocation
- Used to generate new access tokens

## Password Security

Passwords are hashed using bcrypt with a cost factor of at least 12.

## Authentication Rate Limiting

Authentication endpoints are protected with IP-based rate limiting:

```text
10 requests / minute / IP
```

---

# 👥 Role-Based Access Control

TaskFlow supports two organization roles.

## `org_admin`

Organization administrators can:

- Manage organization members
- Create projects
- Update projects
- Delete projects
- Perform administrative operations

## `member`

Organization members can:

- Access resources belonging to their organization
- Create and manage tasks according to their permissions
- Assign tasks
- Add comments
- Update their own comments

Authorization is enforced using the authenticated user's organization and role.

---

# 🔐 Authentication API

## Register

```http
POST /auth/register
```

## Login

```http
POST /auth/login
```

## Refresh Token

```http
POST /auth/refresh
```

## Logout

```http
POST /auth/logout
```

---

# 📁 Project API

## Create Project

```http
POST /projects
```

## Get Projects

```http
GET /projects
```

## Get Project

```http
GET /projects/:id
```

## Update Project

```http
PATCH /projects/:id
```

## Delete Project

```http
DELETE /projects/:id
```

Project queries are always scoped to the authenticated user's organization.

---

# ✅ Task API

## Create Task

```http
POST /projects/:projectId/tasks
```

## Get Tasks

```http
GET /projects/:projectId/tasks
```

## Get Task

```http
GET /tasks/:id
```

## Update Task

```http
PATCH /tasks/:id
```

## Delete Task

```http
DELETE /tasks/:id
```

Every task must belong to a project within the authenticated user's organization.

---

# 🔍 Task Filters

Tasks can be filtered by:

- Status
- Priority
- Assignee
- Due-date range
- Search text

Example:

```http
GET /projects/:projectId/tasks?status=in_progress
```

```http
GET /projects/:projectId/tasks?priority=high
```

```http
GET /projects/:projectId/tasks?assignee=user-id
```

```http
GET /projects/:projectId/tasks?dueDateFrom=2026-08-01&dueDateTo=2026-08-31
```

---

# 📄 Pagination

Offset-based pagination is supported.

Example:

```http
GET /projects/:projectId/tasks?page=1&limit=20
```

Response:

```json
{
  "data": [],
  "total": 0,
  "page": 1,
  "limit": 20
}
```

---

# 👤 Task Assignment

## Assign User

```http
POST /tasks/:id/assign
```

Request:

```json
{
  "userId": "user-id"
}
```

The assigned user must belong to the same organization as the task.

## Unassign User

```http
DELETE /tasks/:id/assign/:userId
```

Duplicate assignments are prevented using database constraints.

---

# 📊 Project Dashboard

```http
GET /projects/:projectId/dashboard
```

The dashboard returns task counts grouped by status.

Example:

```json
{
  "todo": 4,
  "in_progress": 3,
  "review": 2,
  "done": 5
}
```

---

# 💬 Comments

## Create Comment

```http
POST /tasks/:taskId/comments
```

Request:

```json
{
  "content": "Implementation completed."
}
```

## Get Comments

```http
GET /tasks/:taskId/comments
```

## Update Comment

```http
PATCH /comments/:id
```

## Delete Comment

```http
DELETE /comments/:id
```

Comments are organization-scoped through their associated task and project.

Users can only modify their own comments.

---

# ⚙️ Background Jobs

Task assignment notifications are processed asynchronously using Redis and BullMQ.

When a user is assigned to a task:

```text
1. Validate task
2. Validate organization
3. Validate assigned user
4. Persist assignment
5. Enqueue notification job
6. Return successful response
7. Worker processes notification asynchronously
```

The API does not wait for email processing to complete.

A mock email sender is used for the assignment notification.

---

# 🔄 Retry Strategy

Notification jobs use 3 retry attempts.

Exponential backoff:

```text
Attempt 1
   │
   └── 1 second
        │
        ▼
Attempt 2
   │
   └── 2 seconds
        │
        ▼
Attempt 3
   │
   └── 4 seconds
        │
        ▼
Dead Letter Queue
```

After all retry attempts are exhausted, the failed job is moved to the dead-letter queue.

---

# 📬 Job Status

## Get Job Status

```http
GET /jobs/:id
```

Supported statuses:

```text
pending
active
completed
failed
```

Example response:

```json
{
  "jobId": "job-id",
  "status": "completed",
  "metadata": {
    "attemptsMade": 1,
    "maxAttempts": 3
  }
}
```

---

# 🔄 Assignment & Queue Consistency

The assignment endpoint needs to ensure that the database assignment and notification job do not become inconsistent.

The implemented strategy is:

```text
Validate Request
      │
      ▼
Validate Task + Organization
      │
      ▼
Validate Assigned User
      │
      ▼
Create Task Assignment
      │
      ▼
Enqueue Notification Job
      │
      ├── Success → Return Success
      │
      └── Failure → Rollback Assignment
```

This prevents a task assignment from remaining in the database when the notification job could not be queued.

For a larger distributed production system, the Transactional Outbox Pattern could be used as a further improvement.

---

# ❌ Error Handling

The application uses centralized error handling with consistent API responses.

Example:

```json
{
  "error": "Task not found",
  "code": "TASK_NOT_FOUND",
  "details": {}
}
```

Common error codes include:

```text
VALIDATION_ERROR
UNAUTHORIZED
FORBIDDEN
PROJECT_NOT_FOUND
TASK_NOT_FOUND
COMMENT_NOT_FOUND
USER_NOT_FOUND
USER_NOT_IN_ORGANIZATION
TASK_ALREADY_ASSIGNED
JOB_NOT_FOUND
```

---

# ✔️ Request Validation

Zod is used to validate:

- Request bodies
- Route parameters
- Query parameters

Invalid requests are rejected before reaching the service layer.

---

# 🐳 Docker

Docker Compose runs all required services:

```text
┌─────────────────┐
│      API        │
└────────┬────────┘
         │
         ├───────────────┐
         │               │
         ▼               ▼
   PostgreSQL          Redis
                         │
                         ▼
                       Worker
```

Services:

- API
- Worker
- PostgreSQL
- Redis

---

# 🚀 Local Setup

## Prerequisites

Make sure the following are installed:

- Node.js
- npm
- Docker
- Docker Compose

---

## 1. Clone Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd TaskFlow-Backend
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Create a `.env` file:

```env
NODE_ENV=development

PORT=5000

DATABASE_URL=postgresql://taskflow:taskflow@localhost:5432/taskflow

REDIS_URL=redis://localhost:6379

JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret

ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
```

---

# 🗃️ Database Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run migrations:

```bash
npx prisma migrate dev
```

Seed the database:

```bash
npm run db:seed
```

Check migration status:

```bash
npx prisma migrate status
```

---

# ▶️ Run Locally

Start the API:

```bash
npm run dev
```

Start the worker in a separate terminal:

```bash
npm run worker
```

---

# 🐳 Run With Docker Compose

Build and start all services:

```bash
docker compose up --build
```

Stop services:

```bash
docker compose down
```

Stop services and remove volumes:

```bash
docker compose down -v
```

---

# 🌱 Seed Data

The database seed contains:

- 2 organizations
- 5 users
- Multiple projects
- 10+ tasks
- Tasks distributed across projects
- Different task statuses
- Different priorities
- Task assignments
- Sample comments

The seed data can be used to test:

- Authentication
- RBAC
- Multi-tenant isolation
- Projects
- Tasks
- Assignments
- Comments
- Dashboard functionality

---

# 🧪 Testing & Security Scenarios

Important scenarios to verify include:

### Cross-Tenant Project Access

```text
Organization A User
        ↓
Organization B Project ID
        ↓
403 Forbidden
```

### Cross-Tenant Task Access

```text
Organization A User
        ↓
Organization B Task ID
        ↓
403 Forbidden
```

### Cross-Tenant Comment Access

```text
Organization A User
        ↓
Organization B Comment ID
        ↓
403 Forbidden
```

### RBAC

Member attempting to delete a project:

```text
member
  ↓
DELETE /projects/:id
  ↓
403 Forbidden
```

Organization administrator:

```text
org_admin
  ↓
DELETE own organization project
  ↓
Success
```

---

# 🔒 Security

The application implements:

- Organization-level tenant isolation
- JWT authentication
- Short-lived access tokens
- Refresh-token persistence and revocation
- bcrypt password hashing
- Organization-level RBAC
- Service-layer organization scoping
- Zod input validation
- Authentication rate limiting
- Centralized error handling
- Same-organization validation for task assignments
- Database constraints
- Soft deletion for projects and tasks

---

# 📦 Project Structure

```text
TaskFlow-Backend/
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── src/
│   ├── config/
│   │   └── serverConfig.ts
│   │
│   ├── constants/
│   │   └── role.ts
│   │
│   ├── db/
│   │   └── prisma.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── rateLimit.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   ├── projects/
│   │   ├── tasks/
│   │   ├── comments/
│   │   └── jobs/
│   │
│   ├── queues/
│   │   ├── redis.ts
│   │   ├── notification.queue.ts
│   │   ├── dead-letter.queue.ts
│   │   └── notification.types.ts
│   │
│   ├── workers/
│   │   └── notification.worker.ts
│   │
│   ├── utils/
│   │   └── errors.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── Dockerfile
├── docker-compose.yml
├── prisma.config.ts
├── package.json
├── tsconfig.json
├── .env.example
├── .gitignore
└── README.md
```

---

# 🔮 Future Improvements

Potential improvements for a larger production environment:

- Transactional Outbox Pattern
- Refresh-token rotation
- Logout from all devices
- Global email rate limiting
- Comprehensive integration and end-to-end tests
- Swagger / OpenAPI documentation
- Real email provider integration
- Monitoring and centralized logging
- Distributed tracing

---

