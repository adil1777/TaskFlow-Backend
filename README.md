# TaskFlow Backend

A production-oriented, multi-tenant project management backend built as part of a Backend Developer Technical Assignment.

TaskFlow provides organization-based project management with secure multi-tenant access, role-based authorization, project membership, task management, task assignments, comments, task history, and asynchronous task-assignment notifications.

The backend focuses on production-oriented backend engineering practices including:

* Multi-tenant data isolation
* Organization and project-level authorization
* Layered architecture
* PostgreSQL relational data modeling
* Prisma ORM and migrations
* Redis and BullMQ background processing
* Retry and dead-letter queue handling
* Request validation with Zod
* Centralized error handling
* Authentication rate limiting
* Soft deletion
* Dockerized local development and deployment

---

# 🌐 Deployment

The backend is deployed on Render.

## 🚀 Live API

**Base URL**

https://taskflow-backend-nqwe.onrender.com

**Health Check**

https://taskflow-backend-nqwe.onrender.com/health

**API Base Path**

```text
/api/v1
```

Example:

```text
https://taskflow-backend-nqwe.onrender.com/api/v1/projects
```

---

# 🛠️ Tech Stack

| Technology     | Purpose                         |
| -------------- | ------------------------------- |
| Node.js        | Runtime                         |
| TypeScript     | Programming language            |
| Express.js     | REST API framework              |
| PostgreSQL     | Primary relational database     |
| Prisma         | ORM and database migrations     |
| Redis          | Queue backend                   |
| BullMQ         | Background job processing       |
| JWT            | Authentication                  |
| bcrypt         | Password hashing                |
| Zod            | Request validation              |
| Docker         | Containerization                |
| Docker Compose | Local multi-service environment |

---

# ✨ Features

## Authentication

* User registration
* User login
* JWT access tokens
* Refresh tokens
* Refresh-token persistence and revocation
* Secure password hashing using bcrypt
* Authentication rate limiting

## Multi-Tenant Organizations

* Organization creation
* Organization membership
* Organization-level roles
* Strict organization isolation
* Multiple users per organization

## Projects

* Project CRUD
* Project manager
* Project membership
* Organization-scoped project access
* Project-level authorization
* Soft deletion

## Tasks

* Task CRUD
* Task status management
* Task priority management
* Task filtering
* PostgreSQL full-text search
* Offset pagination
* Due-date filtering
* Task assignments
* Task history
* Soft deletion

## Comments

* Create comments
* Read comments
* Update own comments
* Delete own comments
* Organization/project authorization

## Dashboard

* Project-level task statistics
* Task counts grouped by status

## Background Processing

* Redis + BullMQ
* Asynchronous task-assignment notifications
* Retry with exponential backoff
* Dead-letter queue
* Job status tracking
* Separate worker process

## Engineering

* Prisma migrations
* Seed data
* Zod validation
* Centralized error handling
* Database constraints
* Dockerized API and worker
* PostgreSQL and Redis services

---

# 🏗️ Architecture

TaskFlow follows a layered backend architecture.

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
   ├── Authentication
   ├── RBAC
   ├── Validation
   └── Rate Limiting
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Repository
   │
   ▼
Prisma ORM
   │
   ▼
PostgreSQL
```

The service layer is responsible for business rules and authorization decisions.

The repository layer is responsible for database access.

This keeps HTTP handling, business logic, and persistence concerns separated.

---

# ⚙️ Background Job Architecture

Task assignment notifications are processed asynchronously.

```text
                    ┌──────────────────┐
                    │      Client      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Express API   │
                    └────────┬─────────┘
                             │
                  Create Task Assignment
                             │
                             ▼
                    ┌──────────────────┐
                    │   BullMQ Queue   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      Redis       │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Notification     │
                    │ Worker            │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Notification     │
                    │ Processor        │
                    └──────────────────┘
```

The worker runs independently from the API process.

This prevents notification processing from blocking normal API requests.

---

# 🔐 Multi-Tenant Security

TaskFlow treats organization isolation as a core security boundary.

A user authenticated in Organization A must not be able to access Organization B resources, even if the user knows the resource ID.

Authorization is enforced on the server.

Client-provided organization identifiers are not trusted for authorization decisions.

The authenticated user's organization membership is used to establish organization access.

Example:

```text
Organization A
      │
      ▼
    User A
      │
      ▼
Authenticated Request
      │
      ▼
Organization Context = A
      │
      ▼
Request Project B
      │
      ▼
Project.organizationId = B
      │
      ▼
A !== B
      │
      ▼
403 Forbidden
```

The same security model is applied across:

* Organizations
* Projects
* Project members
* Tasks
* Task assignments
* Comments
* Task history

---

# 👥 Authorization Model

TaskFlow uses two levels of authorization.

## System Role

Users have a global system role:

```text
system_admin
user
```

## Organization Role

Organization membership has an organization-scoped role:

```text
org_admin
member
```

Project access is controlled separately through project membership and project manager assignment.

```text
User
 │
 ├── Organization Membership
 │       └── org_admin / member
 │
 └── Project Membership
         └── Project Member
```

This avoids treating every organization member as automatically having access to every project.

---

# 🔑 Organization Permissions

## `org_admin`

Organization administrators can:

* Manage organization membership
* Create projects
* Update projects
* Delete projects
* Assign project managers
* Manage project membership
* Access organization projects

## `member`

Organization members can access projects and tasks according to their project membership and project-level permissions.

A member does not automatically gain access to every project in the organization.

---

# 📁 Project Permissions

Project access is determined using:

* Organization membership
* Project manager assignment
* Project membership

### Project Manager

A project manager can:

* View the project
* Update the project
* Manage project members
* Create tasks
* Update tasks
* Delete tasks
* Assign tasks
* Unassign tasks

### Project Member

A project member can:

* View the project
* View project tasks
* Create tasks according to the application's authorization rules
* View task history
* Add comments
* Update their own comments
* Delete their own comments
* Update an assigned task's status where permitted

### Organization Admin

An organization administrator has organization-wide administrative access to projects and their associated resources.

Authorization is enforced server-side and is not dependent on frontend UI visibility.

---

# 🗄️ Database Design

PostgreSQL is the primary database.

The database is modeled around organizations, memberships, projects, tasks, assignments, comments, authentication sessions, notifications, and audit history.

## Main Tables

```text
users
organizations
org_members
projects
project_members
tasks
task_assignments
comments
task_history
refresh_tokens
notifications
```

## Entity Relationship

```text
                         ┌─────────────────┐
                         │      User       │
                         └────────┬────────┘
                                  │
                ┌─────────────────┼──────────────────┐
                │                 │                  │
                ▼                 ▼                  ▼
          OrgMember        ProjectMember       RefreshToken
                │                 │
                ▼                 │
        Organization             │
                │                 │
                ▼                 ▼
             Project ◄──────── ProjectMember
                │
                ▼
              Task
                │
        ┌───────┼───────────┐
        │       │           │
        ▼       ▼           ▼
 Assignment  Comment    TaskHistory
        │       │           │
        └───────┴───────────┘
                │
                ▼
              User
```

---

# 🧩 Prisma Data Model

Important relationships include:

```text
Organization
    │
    ├── OrgMember
    │       └── User
    │
    └── Project
            │
            ├── ProjectMember
            │       └── User
            │
            └── Task
                    │
                    ├── TaskAssignment
                    │       └── User
                    │
                    ├── Comment
                    │       └── User
                    │
                    └── TaskHistory
                            └── User
```

Database constraints are used to enforce important invariants.

For example:

```text
User + Organization
        ↓
unique membership
```

```text
Project + User
        ↓
unique project membership
```

```text
Task + User
        ↓
unique task assignment
```

This prevents duplicate memberships and assignments at the database level.

---

# 🗑️ Soft Delete

Projects and tasks support soft deletion through:

```text
deletedAt
```

Instead of physically deleting the record, the application marks it as deleted.

Soft-deleted projects and tasks are excluded from normal application queries.

This preserves historical records and provides safer data management.

---

# 🔎 Full-Text Search

Task title and description support PostgreSQL full-text search.

This allows task searching to be performed by PostgreSQL without introducing an external search engine.

---

# 🔑 Authentication

Authentication is implemented using JWT access tokens and persistent refresh tokens.

## Access Token

The access token is short-lived and contains the authenticated user's identity and required authorization context.

Example:

```json
{
  "sub": "user-id",
  "organizationId": "organization-id",
  "role": "member"
}
```

The backend does not rely solely on JWT claims for authorization. Organization membership and resource ownership are validated server-side.

## Refresh Token

Refresh tokens:

* Are long-lived compared with access tokens
* Are persisted in PostgreSQL
* Support revocation
* Are used to issue new access tokens

## Password Security

Passwords are hashed using bcrypt with a cost factor of at least 12.

## Authentication Rate Limiting

Authentication endpoints are protected using IP-based rate limiting.

Current configuration:

```text
10 requests / minute / IP
```

---

# 🔐 Authentication API

All API routes use the `/api/v1` prefix.

## Register

```http
POST /api/v1/auth/register
```

## Login

```http
POST /api/v1/auth/login
```

## Refresh Token

```http
POST /api/v1/auth/refresh
```

## Logout

```http
POST /api/v1/auth/logout
```

---

# 🏢 Organization API

## Create Organization

```http
POST /api/v1/organizations
```

Creating an organization establishes the creator as an organization administrator.

## Get Organization

```http
GET /api/v1/organizations/:organizationId
```

## Update Organization

```http
PATCH /api/v1/organizations/:organizationId
```

## Delete Organization

```http
DELETE /api/v1/organizations/:organizationId
```

## Organization Members

Organization membership is managed through organization-scoped APIs.

All membership operations verify organization access before modifying membership data.

---

# 📁 Project API

## Create Project

```http
POST /api/v1/projects
```

## Get Projects

```http
GET /api/v1/projects
```

## Get Project

```http
GET /api/v1/projects/:projectId
```

## Update Project

```http
PATCH /api/v1/projects/:projectId
```

## Delete Project

```http
DELETE /api/v1/projects/:projectId
```

## Project Members

```http
GET /api/v1/projects/:projectId/members
```

```http
POST /api/v1/projects/:projectId/members
```

```http
DELETE /api/v1/projects/:projectId/members/:userId
```

Project queries are organization-scoped and additionally enforce project-level access.

---

# ✅ Task API

## Create Task

```http
POST /api/v1/projects/:projectId/tasks
```

## Get Tasks

```http
GET /api/v1/projects/:projectId/tasks
```

## Get Task

```http
GET /api/v1/tasks/:id
```

## Update Task

```http
PATCH /api/v1/tasks/:id
```

## Delete Task

```http
DELETE /api/v1/tasks/:id
```

Every task belongs to a project, and every project belongs to an organization.

The service layer validates the complete resource chain before performing authorization-sensitive operations.

```text
Organization
      │
      ▼
   Project
      │
      ▼
     Task
```

---

# 🔍 Task Filters

Tasks support filtering by:

* Status
* Priority
* Assignee
* Due-date range
* Search text

Examples:

```http
GET /api/v1/projects/:projectId/tasks?status=in_progress
```

```http
GET /api/v1/projects/:projectId/tasks?priority=high
```

```http
GET /api/v1/projects/:projectId/tasks?assignee=user-id
```

```http
GET /api/v1/projects/:projectId/tasks?dueDateFrom=2026-08-01&dueDateTo=2026-08-31
```

---

# 📄 Pagination

Offset-based pagination is supported.

Example:

```http
GET /api/v1/projects/:projectId/tasks?page=1&limit=20
```

Example response:

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
POST /api/v1/tasks/:id/assign
```

Request:

```json
{
  "userId": "user-id"
}
```

The assigned user must satisfy the project's membership requirements.

The service validates the task, project, organization, and target project membership before creating the assignment.

Duplicate assignments are prevented by a database-level unique constraint.

## Unassign User

```http
DELETE /api/v1/tasks/:id/assign/:userId
```

---

# 📜 Task History

Task changes are tracked through the `TaskHistory` model.

Tracked events include:

```text
created
updated
status_changed
priority_changed
assigned
unassigned
comment_added
```

Example:

```text
Task
 │
 ├── Created
 ├── Status changed
 ├── Priority changed
 ├── User assigned
 ├── Comment added
 └── User unassigned
```

This provides an audit trail for important task activity.

---

# 📊 Project Dashboard

```http
GET /api/v1/projects/:projectId/dashboard
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

Dashboard data is scoped to the requested project and authenticated user's organization.

---

# 💬 Comments

## Create Comment

```http
POST /api/v1/tasks/:taskId/comments
```

Request:

```json
{
  "content": "Implementation completed."
}
```

## Get Comments

```http
GET /api/v1/tasks/:taskId/comments
```

## Update Comment

```http
PATCH /api/v1/comments/:id
```

## Delete Comment

```http
DELETE /api/v1/comments/:id
```

Comments inherit organization and project authorization through their associated task.

Users can only modify their own comments.

Comment creation also records a `comment_added` event in task history.

---

# ⚙️ Background Jobs

Task-assignment notifications are processed asynchronously using BullMQ and Redis.

When a user is assigned to a task:

```text
1. Validate request
2. Validate task and project
3. Validate organization access
4. Validate project membership
5. Create task assignment
6. Enqueue notification job
7. Return API response
8. Worker processes notification asynchronously
```

The current notification processor uses a mock email sender for demonstration and testing.

A real email provider can be integrated behind the notification processor in a production environment.

---

# 🔄 Retry Strategy

Notification jobs use:

```text
3 attempts
```

with exponential backoff.

```text
Attempt 1
    │
    └── wait 1 second
           │
           ▼
Attempt 2
    │
    └── wait 2 seconds
           │
           ▼
Attempt 3
    │
    └── wait 4 seconds
           │
           ▼
Dead Letter Queue
```

After the configured retry attempts are exhausted, the failed job is copied to the dead-letter queue.

The DLQ provides a mechanism for investigating failed background jobs without silently losing them.

---

# 📬 Job Status

## Get Job Status

```http
GET /api/v1/jobs/:id
```

Supported statuses:

```text
pending
active
completed
failed
```

Example:

```json
{
  "success": true,
  "data": {
    "jobId": "job-id",
    "status": "completed",
    "metadata": {
      "name": "task-assigned",
      "attemptsMade": 1,
      "maxAttempts": 3,
      "createdAt": 1750000000000,
      "processedOn": 1750000001000,
      "finishedOn": 1750000001500,
      "failedReason": null
    }
  }
}
```

BullMQ job records are retained according to the queue's cleanup policy. Therefore, an old completed job may no longer be available through the job-status endpoint.

---

# 🔄 Assignment and Queue Reliability

The assignment workflow separates durable business data from asynchronous processing.

```text
Validate Request
      │
      ▼
Validate Task / Project / Organization
      │
      ▼
Validate Project Membership
      │
      ▼
Create Task Assignment
      │
      ▼
Enqueue Notification Job
      │
      ├── Success
      │
      └── Queue Failure
```

The task assignment is stored as durable PostgreSQL data, while the notification is handled asynchronously by BullMQ.

Because PostgreSQL and Redis/BullMQ are separate systems, a standard database transaction cannot atomically commit both operations.

For a larger distributed production system, the **Transactional Outbox Pattern** is the recommended evolution.

The outbox pattern would allow the database transaction and event creation to be committed atomically, after which a worker publishes/processes the notification event reliably.

---

# ❌ Error Handling

TaskFlow uses centralized error handling and consistent application error types.

Example:

```json
{
  "success": false,
  "error": {
    "message": "Task not found",
    "code": "TASK_NOT_FOUND"
  }
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
PROJECT_ACCESS_FORBIDDEN
ORGANIZATION_ACCESS_FORBIDDEN
TASK_ALREADY_ASSIGNED
JOB_NOT_FOUND
```

---

# ✔️ Request Validation

Zod is used to validate incoming request data.

Validation is applied to:

* Request bodies
* Route parameters
* Query parameters

Invalid requests are rejected before reaching business logic.

This keeps validation rules explicit and prevents malformed input from reaching the service layer.

---

# 🐳 Docker Architecture

Docker Compose provides the local multi-service environment.

```text
┌─────────────────┐
│       API       │
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

* API
* Worker
* PostgreSQL
* Redis

The API and worker run as separate processes so background processing does not block HTTP request handling.

---

# 🚀 Local Setup

## Prerequisites

Install:

* Node.js
* npm
* Docker
* Docker Compose

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

Do not commit real secrets to Git.

Use `.env.example` for documenting required environment variables.

---

# 🗃️ Database Setup

Generate Prisma Client:

```bash
npx prisma generate
```

Run development migrations:

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

For production deployments:

```bash
npx prisma migrate deploy
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

The API and worker should use the same PostgreSQL and Redis configuration.

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

The seed database contains representative data for testing:

* Multiple organizations
* Users
* Organization memberships
* Projects
* Project memberships
* Tasks
* Different task statuses
* Different priorities
* Task assignments
* Sample comments

The seed data can be used to test:

* Authentication
* RBAC
* Multi-tenant isolation
* Project access
* Project membership
* Tasks
* Assignments
* Comments
* Dashboard functionality

---

# 🧪 Testing and Security Scenarios

The following scenarios should be verified before deployment.

## Cross-Tenant Project Access

```text
Organization A User
        │
        ▼
Organization B Project ID
        │
        ▼
403 Forbidden
```

## Cross-Tenant Task Access

```text
Organization A User
        │
        ▼
Organization B Task ID
        │
        ▼
403 Forbidden
```

## Cross-Tenant Comment Access

```text
Organization A User
        │
        ▼
Organization B Comment ID
        │
        ▼
403 Forbidden
```

## Project Membership

```text
Organization Member
        │
        ▼
Project A
        │
        ▼
Not a Project Member
        │
        ▼
Project access denied
```

## Project Manager Authorization

```text
Project Manager
        │
        ▼
Task Management
        │
        ├── Create
        ├── Update
        ├── Delete
        └── Assign
```

## Organization RBAC

Member attempting to delete a project:

```text
member
  │
  ▼
DELETE /api/v1/projects/:id
  │
  ▼
403 Forbidden
```

Organization administrator:

```text
org_admin
  │
  ▼
DELETE own organization project
  │
  ▼
Success
```

---

# 🔒 Security

The application implements:

* Organization-level tenant isolation
* Organization membership validation
* Project-level membership authorization
* JWT authentication
* Short-lived access tokens
* Refresh-token persistence and revocation
* bcrypt password hashing
* Organization-level RBAC
* Service-layer authorization
* Zod input validation
* Authentication rate limiting
* Centralized error handling
* Same-project validation for task assignments
* Database-level uniqueness constraints
* Soft deletion for projects and tasks
* Cross-tenant resource protection

The backend does not rely on frontend authorization for security.

Every protected resource is validated server-side.

---

# 📈 Production Considerations

The current implementation is designed to demonstrate production-oriented backend fundamentals.

For a larger production deployment, additional infrastructure could include:

```text
Load Balancer
      │
      ▼
Multiple API Instances
      │
      ├────────── PostgreSQL
      │
      ├────────── Redis
      │
      └────────── Multiple Workers
```

Additional operational improvements could include:

* Centralized structured logging
* Metrics collection
* Application monitoring
* Distributed tracing
* Database connection pooling
* Redis monitoring
* Queue monitoring
* Automated CI/CD
* Automated integration tests
* End-to-end tests
* Secret management
* Health/readiness probes

---

# 🔮 Future Improvements

Potential improvements for a larger production environment:

* Transactional Outbox Pattern
* Refresh-token rotation
* Logout from all devices
* Real email provider integration
* Notification persistence and read/unread APIs
* Comprehensive integration tests
* End-to-end tests
* Swagger / OpenAPI documentation
* Structured logging
* Monitoring and alerting
* Distributed tracing
* CI/CD pipeline
* Queue monitoring
* Advanced audit logging

---

# 📌 Engineering Principles

TaskFlow follows several backend engineering principles:

### 1. Security First

Authorization is enforced server-side and scoped to the organization and project.

### 2. Separation of Concerns

Controllers handle HTTP concerns, services handle business logic, and repositories handle persistence.

### 3. Database Constraints

Important invariants are enforced at the database level wherever possible.

### 4. Asynchronous Processing

Non-critical background work is moved to BullMQ workers instead of blocking API requests.

### 5. Failure Handling

Background jobs use retries, exponential backoff, and a dead-letter queue.

### 6. Explicit Validation

External input is validated using Zod before entering business logic.

### 7. Evolution Toward Distributed Reliability

The current queue architecture can evolve toward a Transactional Outbox Pattern when stronger database-to-message delivery guarantees are required.

---

# 📄 License

This project was created as part of a Backend Developer Technical Assignment.
