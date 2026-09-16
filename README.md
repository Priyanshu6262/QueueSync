# Mini Job Queue Dashboard

A production-ready full-stack Job Queue Management Dashboard built with **NestJS**, **PostgreSQL**, **TypeORM**, and **React (Vite + TypeScript + Tailwind CSS)**. This project demonstrates enterprise-level API design, strict state-machine lifecycle enforcement, atomic conditional updates for race-condition prevention, responsive UI ergonomics, and error handling.

---

## 1. Project Overview

Background jobs and asynchronous tasks are fundamental to modern web applications. In distributed or multi-user environments, race conditions can occur when multiple clients attempt to transition the status of the same job simultaneously (for instance, two operators or browser tabs clicking **"Run"** on a pending job at the exact same instant).

This project implements a concurrency-safe Job Queue Management system where:
- The **database is the single source of truth** for state transitions.
- The **backend service enforces atomic, conditional status transitions**, rejecting race conditions with `409 Conflict`.
- The **frontend provides real-time visibility and feedback**, handling conflicts gracefully and maintaining state synchronization.

---

## 2. Features

- **Job Lifecycle Management**: Create, list, transition, and delete background jobs.
- **Strict State Machine**: Enforces valid status transitions:
  - `pending` &rarr; `running` | `failed`
  - `running` &rarr; `completed` | `failed`
  - `completed` and `failed` are terminal states (immutable).
- **Concurrency-Safe Atomic Updates**: Prevents double-execution and status race conditions using atomic conditional SQL queries.
- **Live Summary Counters**: Real-time counts for Total, Pending, Running, Completed, and Failed jobs.
- **Interactive Filtering**: Client-side instant filtering by job status.
- **Bonus Production-Ready Feature**: **Automatic Polling & Refresh** with an on-screen toggle (5s interval) and pause capability to prevent stale dashboard states across multiple operators.
- **Confirmation Guards & Double-Click Prevention**: Prevents duplicate API dispatches by disabling buttons and displaying inline confirmation for destructive actions.
- **Standardized Error Schemas**: Consistent JSON error payloads across all HTTP endpoints.

---

## 3. Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler**: Vite 5
- **Styling**: Tailwind CSS 3
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Architecture**: Modular custom hooks (`useJobs`) and atomic component hierarchy

### Backend
- **Framework**: NestJS 10 (TypeScript)
- **Database & ORM**: PostgreSQL 16 with TypeORM
- **Validation**: `class-validator`, `class-transformer`
- **Testing**: Jest with mocked repository and query runner suites

---

## 4. Architecture

The system is structured as a decoupled client-server architecture:

```
┌─────────────────────────────────────────────────────────┐
│                    React Client (Vite)                  │
│  - DashboardHeader (Auto-poll toggle, manual refresh)   │
│  - StatusCards (Total / Pending / Running / Completed)  │
│  - StatusFilter (Client-side fast filter pills)         │
│  - JobTable & JobRow (Actions, confirm delete, badges)  │
│  - useJobs Hook (Central state, polling & 409 recovery) │
└───────────────────────────┬─────────────────────────────┘
                            │ REST APIs (JSON)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                     NestJS Backend                      │
│  - ValidationPipe (Whitelist, transform, DTO checks)    │
│  - ParseUUIDPipe (Strict UUID parameter validation)     │
│  - JobsController (HTTP routing & response mapping)     │
│  - JobsService (State-machine logic & atomic updates)   │
│  - HttpExceptionFilter (Uniform JSON error format)      │
└───────────────────────────┬─────────────────────────────┘
                            │ TypeORM (Atomic Conditional Queries)
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   PostgreSQL Database                   │
│  - Table: jobs (UUID PK, title, type, status, indexed)  │
│  - Indexed on status: idx_jobs_status                   │
│  - Concurrency Lock: Atomic row matching on status      │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Project Structure

```
AIRTH ASSIGNMENT SUBMISSION/
├── backend/
│   ├── src/
│   │   ├── common/
│   │   │   ├── enums/
│   │   │   │   └── job-status.enum.ts
│   │   │   └── filters/
│   │   │       └── http-exception.filter.ts
│   │   ├── jobs/
│   │   │   ├── dto/
│   │   │   │   ├── create-job.dto.ts
│   │   │   │   └── update-job-status.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── job.entity.ts
│   │   │   ├── jobs.controller.ts
│   │   │   ├── jobs.controller.spec.ts
│   │   │   ├── jobs.service.ts
│   │   │   ├── jobs.service.spec.ts
│   │   │   └── jobs.module.ts
│   │   ├── app.module.ts
│   │   ├── database.config.ts
│   │   └── main.ts
│   ├── .env.example
│   ├── package.json
│   ├── tsconfig.json
│   └── nest-cli.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── DashboardHeader.tsx
│   │   │   ├── StatusCards.tsx
│   │   │   ├── StatusFilter.tsx
│   │   │   ├── JobTable.tsx
│   │   │   ├── JobRow.tsx
│   │   │   ├── CreateJobModal.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── hooks/
│   │   │   └── useJobs.ts
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── jobsApi.ts
│   │   ├── types/
│   │   │   └── job.ts
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 6. Database Setup

### Schema Definition
The `jobs` table uses a UUID primary key with indexed status for high-throughput status filtering:

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | `UUID` | PRIMARY KEY | Unique identifier generated automatically (`uuid_generate_v4()`) |
| `title` | `VARCHAR(255)` | NOT NULL | Human-readable title of the job |
| `type` | `VARCHAR(100)` | NOT NULL | Job classification (e.g., `email`, `processing`) |
| `status` | `ENUM` | NOT NULL, INDEXED | Status: `'pending'`, `'running'`, `'completed'`, `'failed'` (default: `'pending'`) |
| `createdAt` | `TIMESTAMPTZ` | NOT NULL | Timestamp of creation (default: `NOW()`) |
| `updatedAt` | `TIMESTAMPTZ` | NULLABLE | Timestamp of last status change |

### Running PostgreSQL with Docker
A `docker-compose.yml` file is provided in the repository root for instantaneous setup:

```bash
docker compose up -d
```
This spins up PostgreSQL 16 on port `5432` with database `job_queue_db`, username `postgres`, and password `postgrespassword`.

---

## 7. Environment Variables

### Backend (`backend/.env`)
```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgrespassword@localhost:5432/job_queue_db
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:3000
```

Both directories include `.env.example` files.

---

## 8. Local Development Setup

### Prerequisites
- Node.js (v18+ or v20+)
- npm (v9+)
- PostgreSQL running locally or via Docker

### Step 1: Clone and Start PostgreSQL
```bash
# In the project root directory:
docker compose up -d
```

### Step 2: Run Backend
```bash
cd backend
npm install
npm run start:dev
```
The NestJS API will be running at `http://localhost:3000`.

### Step 3: Run Frontend
```bash
cd ../frontend
npm install
npm run dev
```
The React dashboard will be running at `http://localhost:5173`.

---

## 9. API Documentation

### 1. `POST /jobs`
Creates a new background job.

- **Status Code**: `201 Created`
- **Request Body**:
  ```json
  {
    "title": "Send Welcome Onboarding Emails",
    "type": "email"
  }
  ```
- **Validation**:
  - `title`: Required, non-empty string, maximum 255 characters.
  - `type`: Required, non-empty string, maximum 100 characters.
  - Initial `status` is automatically set to `pending`.
- **Success Response (201)**:
  ```json
  {
    "id": "7bf3b3a1-9457-4cc5-9923-38b4d83d9d30",
    "title": "Send Welcome Onboarding Emails",
    "type": "email",
    "status": "pending",
    "createdAt": "2026-09-16T08:30:00.000Z",
    "updatedAt": null
  }
  ```
- **Possible Errors**:
  - `400 Bad Request`: Missing or empty `title`/`type`.

---

### 2. `GET /jobs`
Returns all jobs, sorted newest first (`createdAt DESC`).

- **Status Code**: `200 OK`
- **Success Response (200)**:
  ```json
  [
    {
      "id": "7bf3b3a1-9457-4cc5-9923-38b4d83d9d30",
      "title": "Send Welcome Onboarding Emails",
      "type": "email",
      "status": "pending",
      "createdAt": "2026-09-16T08:30:00.000Z",
      "updatedAt": null
    }
  ]
  ```

---

### 3. `PATCH /jobs/:id/status`
Performs an atomic, concurrency-safe transition on the job status.

- **Status Code**: `200 OK`
- **URL Parameters**:
  - `id`: UUID (validated by `ParseUUIDPipe`)
- **Request Body**:
  ```json
  {
    "status": "running"
  }
  ```
- **Validation**:
  - `status`: Must be one of `'pending'`, `'running'`, `'completed'`, `'failed'`.
- **Success Response (200)**:
  ```json
  {
    "id": "7bf3b3a1-9457-4cc5-9923-38b4d83d9d30",
    "title": "Send Welcome Onboarding Emails",
    "type": "email",
    "status": "running",
    "createdAt": "2026-09-16T08:30:00.000Z",
    "updatedAt": "2026-09-16T08:31:12.000Z"
  }
  ```
- **Possible Errors**:
  - `400 Bad Request`: Malformed UUID or invalid status string.
  - `404 Not Found`: Job with given UUID does not exist.
    ```json
    {
      "statusCode": 404,
      "message": "Job not found"
    }
    ```
  - `409 Conflict`: Status already changed by another request, or transition is invalid:
    ```json
    {
      "statusCode": 409,
      "message": "Job status has already changed or transition from 'completed' to 'running' is not allowed"
    }
    ```

---

### 4. `DELETE /jobs/:id`
Permanently deletes a job.

- **Status Code**: `200 OK`
- **URL Parameters**:
  - `id`: UUID
- **Success Response (200)**:
  ```json
  {
    "statusCode": 200,
    "message": "Job deleted successfully",
    "id": "7bf3b3a1-9457-4cc5-9923-38b4d83d9d30"
  }
  ```
- **Possible Errors**:
  - `400 Bad Request`: Malformed UUID.
  - `404 Not Found`: Job does not exist.

---

## 10. Job State Machine

The backend enforces a strict directed acyclic state machine:

```
        ┌───────────┐
        │  pending  │
        └─────┬─────┘
              │
      ┌───────┴───────┐
      ▼               ▼
┌───────────┐   ┌───────────┐
│  running  │   │  failed   │◄──────┐
└─────┬─────┘   └───────────┘       │
      │           (terminal)        │
      ├─────────────────────────────┘
      ▼
┌───────────┐
│ completed │
└───────────┘
 (terminal)
```

### Transition Rules:
1. **From `pending`**:
   - &rarr; `running` (Allowed: worker picked up job)
   - &rarr; `failed` (Allowed: immediate validation or queue error)
2. **From `running`**:
   - &rarr; `completed` (Allowed: execution finished successfully)
   - &rarr; `failed` (Allowed: unhandled error during execution)
3. **Terminal States**:
   - `completed` cannot transition to `running`, `pending`, or `failed`.
   - `failed` cannot transition to `running`, `pending`, or `completed`.
   - No job can ever transition back to `pending`.

---

## 11. Concurrency Handling

### Why Frontend-Only Checks Are Insufficient
In a real-world multi-user environment:
1. Operator A opens Tab 1 and sees Job #101 in `pending`.
2. Operator B opens Tab 2 and also sees Job #101 in `pending`.
3. Both operators click **"Run"** within milliseconds of each other.

If the backend relies on:
```ts
// ❌ NAIVE APPROACH - VULNERABLE TO RACE CONDITIONS
const job = await repo.findOne(id);
if (job.status === 'pending') {
  // Latency window: another thread changes status here!
  job.status = 'running';
  await repo.save(job);
}
```
Both threads will read `pending`, both will pass the check, and both will execute `save()`, leading to duplicated worker dispatches or inconsistent state.

### The Solution: Atomic Conditional Database Update
We leverage the database's row-level locking via an atomic `UPDATE ... WHERE` query:

```sql
UPDATE jobs
SET status = :targetStatus, "updatedAt" = NOW()
WHERE id = :id AND status IN (:...allowedSourceStatuses);
```

#### Code Implementation (`JobsService`):
```ts
const allowedSources = ALLOWED_SOURCE_STATES[targetStatus];

const updateResult = await this.jobRepository
  .createQueryBuilder()
  .update(Job)
  .set({ status: targetStatus, updatedAt: new Date() })
  .where('id = :id AND status IN (:...allowedSources)', {
    id,
    allowedSources,
  })
  .execute();

if (updateResult.affected === 0) {
  const existingJob = await this.jobRepository.findOne({ where: { id } });
  if (!existingJob) {
    throw new NotFoundException({ statusCode: 404, message: 'Job not found' });
  }
  throw new ConflictException({
    statusCode: 409,
    message: `Job status has already changed or transition from '${existingJob.status}' to '${targetStatus}' is not allowed`,
  });
}

return await this.jobRepository.findOneByOrFail({ id });
```

### Race Condition Analysis:
- **Request 1 (First to acquire row lock)**: Matches `status = 'pending'`, executes update, `affected = 1`. Successfully transitions to `running`.
- **Request 2 (Arrives shortly after)**: Status is now `running`. The conditional clause `status IN ('pending')` evaluates to false. `affected = 0`.
- The service inspects the record: it exists, but was already updated. It throws `409 Conflict`.
- **Frontend Reaction**: The React application catches the `409 Conflict`, displays a prominent banner:
  > *"This job was updated by another user. The latest status has been loaded."*
  and immediately triggers a silent background re-fetch to synchronize the UI.

---

## 12. Bonus Production-Ready Feature: Automatic Polling & Refresh

### Choice:
**Automatic Polling / Refresh** (with a 5-second interval and user control toggle).

### Justification:
In asynchronous job processing, background workers update job states continuously. Without automatic polling:
- A user must repeatedly reload the browser or click manual refresh.
- UI state rapidly becomes stale, increasing the probability of concurrency conflicts (409s) when clicking actions.

### Implementation:
- Implemented in `useJobs.ts` using `setInterval` with silent background synchronization (does not trigger the disruptive full-screen loading spinner).
- Includes an on/off toggle pill directly in `DashboardHeader`:
  - Shows animated pulse indicator when active (`Auto-poll: 5s ON`).
  - Allows operators to pause polling when examining a specific job.

---

## 13. Validation & Error Handling

- **Class-Validator & DTOs**: Incoming payloads for creation and status updates are validated with `@IsNotEmpty()`, `@IsString()`, `@IsEnum()`, and trimmed using `@Transform()`.
- **Strict Whitelist**: Any unwhitelisted parameters in HTTP requests are rejected immediately with `400 Bad Request`.
- **UUID Validation**: Controller parameters utilize `ParseUUIDPipe` to ensure malformed IDs never hit the database layer.
- **Global Filter**: `HttpExceptionFilter` formats all exceptions into a predictable `{ statusCode, message }` JSON contract.

---

## 14. Testing

### Automated Backend Tests
Unit and integration tests are implemented with Jest, covering all 10 required specifications:
1. Create job successfully
2. Reject invalid job
3. Get all jobs sorted newest first
4. Valid `pending` &rarr; `running` transition
5. Valid `running` &rarr; `completed` transition
6. Valid `running` &rarr; `failed` transition
7. Reject `completed` &rarr; `running` (409 Conflict)
8. Reject `failed` &rarr; `running` (409 Conflict)
9. Job not found (404 Not Found)
10. Concurrency race simulation (affected = 0 triggers 409 Conflict)
11. Delete existing job and reject non-existent deletion (404)

### Running Backend Tests:
```bash
cd backend
npm test
```
Result: **2 test suites passed, 19 tests passed (100% success rate)**.

### Production Build Verification:
```bash
# Verify backend TypeScript compilation:
cd backend && npm run build

# Verify frontend bundle compilation:
cd ../frontend && npm run build
```

---

## 15. Assumptions & Trade-offs

1. **Client-Side Filtering**: Since GET `/jobs` returns the full queue and job counts are under thousands in typical assessment scopes, filtering by status is done client-side for zero-latency filter switching. For millions of jobs, server-side pagination and database-level status filtering should be introduced.
2. **Synchronize Schema**: `synchronize: true` is enabled in development for quick setup without migration files. For production, TypeORM migrations should manage schema versions.
3. **Polling vs. WebSockets**: Polling every 5 seconds was chosen over WebSockets because it is lightweight, stateless, works through firewalls without sticky sessions, and avoids the operational complexity of WebSocket connection pooling.

---

## 16. Future Improvements

1. **Dead Letter Queue (DLQ) & Retry Policy**: Configurable max retry count for failed jobs with exponential backoff.
2. **Worker Consumer Service**: A BullMQ/Redis worker consumer layer to pick up jobs and execute tasks in distributed containers.
3. **Role-Based Access Control (RBAC)**: JWT authentication to restrict job deletion to administrative roles.
