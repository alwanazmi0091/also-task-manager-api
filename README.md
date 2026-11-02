# Task Manager API

A RESTful task-management API built with Node.js, Express, and MySQL. It supports user registration and login, session-based authentication, and CRUD operations for tasks. Each task is associated with the authenticated user.

## Features

- Register, log in, log out, view, update, and delete user accounts.
- Store passwords as Argon2id hashes.
- Authenticate requests with server-side Express sessions stored in MySQL.
- Create, retrieve, update, delete, search, filter, sort, and paginate tasks.
- Validate request bodies, query parameters, and route parameters with Zod.
- Restrict task access to the user who owns each task.

## Tech stack

- Node.js (18 or newer)
- Express 5
- MySQL 8.0+
- `mysql2`
- `express-session` and `express-mysql-session`
- Argon2
- Zod
- dotenv

## Getting started

### 1. Prerequisites

Install Node.js 18 or newer, npm, and MySQL 8.0 or newer. The included SQL dump uses the MySQL `utf8mb4_0900_ai_ci` collation.

### 2. Install dependencies

From the project root:

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env` and edit the values for your local MySQL setup:

```bash
cp .env.example .env
```

On Windows PowerShell, use:

```powershell
Copy-Item .env.example .env
```

`SESSION_SECRET` must be a long, random secret. You can generate one with:

```bash
openssl rand -base64 32
```

Do not commit `.env` or share its contents. It is already listed in `.gitignore`.

| Variable         | Required | Description                                                     |
| ---------------- | -------- | --------------------------------------------------------------- |
| `PORT`           | No       | HTTP port. Defaults to `3000` when omitted.                     |
| `DB_HOST`        | Yes      | MySQL hostname, such as `127.0.0.1`.                            |
| `DB_USER`        | Yes      | MySQL username.                                                 |
| `DB_PASSWORD`    | Yes      | Password for the MySQL user.                                    |
| `DB_NAME`        | Yes      | Database name. The included dump is labelled `task_manager_3`.  |
| `SESSION_SECRET` | Yes      | Secret used by `express-session` to sign the session ID cookie. |

The current database connection uses MySQL's default port. A custom database port is not currently configurable through `.env`; update `config/db.js` if your MySQL server uses a non-default port.

### 4. Create and initialize the database

Create the database (or use an existing empty database) with the same name configured in `DB_NAME`:

```sql
CREATE DATABASE task_manager_3
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;
```

The included `task_manager.sql` contains the `users`, `tasks`, and `sessions` table definitions. The dump is encoded as UTF-16LE, so convert it to UTF-8 before importing it with the MySQL command-line client:

```bash
iconv -f UTF-16 -t UTF-8 task_manager.sql > task_manager.utf8.sql
mysql -h 127.0.0.1 -u root -p task_manager_3 < task_manager.utf8.sql
```

Replace the host, username, and database name as needed. The command prompts for the MySQL password.

> **Warning:** The SQL dump contains `DROP TABLE IF EXISTS` statements. Importing it into a database with existing tables of the same names will drop and recreate those tables, deleting their existing data. Back up any data you need before importing.
>
> The dump also contains a `SET @@GLOBAL.GTID_PURGED` statement. Depending on your MySQL server's GTID configuration and privileges, you may need to omit that statement if the import fails specifically on it.

The session store is configured to create its session table automatically when it is missing. The included dump also defines a `sessions` table.

### 5. Run the API

Start in development mode (with automatic restarts):

```bash
npm run dev
```

Or start normally:

```bash
npm start
```

By default, the server listens at:

```text
http://localhost:3000
```

There is no `/api` prefix. The routes are mounted directly at `/user` and `/task`.

## Authentication and sessions

Authentication is session-based, not token-based. After a successful `POST /user/login`, the API sets an HTTP-only cookie named `sessionId`. Send that cookie with subsequent protected requests. The session data is stored in MySQL and expires after 24 hours.

All `/task` routes require authentication. The following user routes also require an authenticated session:

- `GET /user/me`
- `PATCH /user`
- `DELETE /user`
- `POST /user/logout`

Registration and login are public.

The current session cookie configuration uses `httpOnly: true`, `sameSite: "lax"`, and `secure: false`. Before deploying behind HTTPS, review the session cookie settings in `middleware/sessionMiddleware.js` and the cookie-clearing settings in `controllers/userController.js`; production cookies should be configured for HTTPS.

## API reference

Base URL:

```text
http://localhost:3000
```

All request bodies must be JSON and should use the `Content-Type: application/json` header.

### User routes

| Method   | Endpoint         | Auth required | Description                                                 | Success          |
| -------- | ---------------- | ------------- | ----------------------------------------------------------- | ---------------- |
| `POST`   | `/user/register` | No            | Create an account.                                          | `201 Created`    |
| `POST`   | `/user/login`    | No            | Log in and create a session.                                | `200 OK`         |
| `GET`    | `/user/me`       | Yes           | Return the signed-in user's profile.                        | `200 OK`         |
| `PATCH`  | `/user`          | Yes           | Update the signed-in user's profile.                        | `204 No Content` |
| `DELETE` | `/user`          | Yes           | Delete the account and its tasks, then destroy the session. | `204 No Content` |
| `POST`   | `/user/logout`   | Yes           | Destroy the current session.                                | `204 No Content` |

#### Register

`POST /user/register`

Request:

```json
{
  "email": "alex@example.com",
  "name": "Alex",
  "password": "a-secure-password"
}
```

The email must be valid. The name must not be empty. The password must contain at least 8 characters.

Example response (`201`):

```json
{
  "message": "User created successfully",
  "createdId": "b9c9d34a-1de2-4ad8-89c2-d62d35e5d2f0"
}
```

#### Log in

`POST /user/login`

Request:

```json
{
  "email": "alex@example.com",
  "password": "a-secure-password"
}
```

Example response (`200`):

```json
{
  "message": "Logged in successfully",
  "user": {
    "user_id": "b9c9d34a-1de2-4ad8-89c2-d62d35e5d2f0",
    "email": "alex@example.com",
    "name": "Alex"
  }
}
```

The response also sets the `sessionId` cookie. Keep and send this cookie for protected requests.

#### Get the current user

`GET /user/me`

Example response (`200`):

```json
{
  "user_id": "b9c9d34a-1de2-4ad8-89c2-d62d35e5d2f0",
  "email": "alex@example.com",
  "name": "Alex"
}
```

#### Update the current user

`PATCH /user`

Send one or more of `email`, `name`, or `password`:

```json
{
  "name": "Alex Morgan",
  "email": "alex.morgan@example.com"
}
```

A new password must contain at least 8 characters. The endpoint returns `204 No Content` on success.

#### Log out

`POST /user/logout`

Destroys the current session and clears the `sessionId` cookie. Returns `204 No Content`.

#### Delete the current user

`DELETE /user`

Deletes the signed-in user's account and destroys the current session. The database foreign key is configured to delete that user's tasks as well. Returns `204 No Content`.

### Task routes

Every task route requires an authenticated session. Task IDs are positive integers.

| Method   | Endpoint    | Description                            | Success          |
| -------- | ----------- | -------------------------------------- | ---------------- |
| `GET`    | `/task`     | List the signed-in user's tasks.       | `200 OK`         |
| `GET`    | `/task/:id` | Get one of the signed-in user's tasks. | `200 OK`         |
| `POST`   | `/task`     | Create a task.                         | `201 Created`    |
| `PATCH`  | `/task/:id` | Update a task.                         | `204 No Content` |
| `DELETE` | `/task/:id` | Delete a task.                         | `204 No Content` |

#### List tasks

`GET /task`

Supported query parameters:

| Parameter     | Description                                                        | Default      |
| ------------- | ------------------------------------------------------------------ | ------------ |
| `search`      | Match task content using a case-insensitive/SQL `LIKE` search.     | —            |
| `isCompleted` | Filter by completion status. Must be the string `true` or `false`. | —            |
| `page`        | Positive page number.                                              | `1`          |
| `limit`       | Positive number of results per page.                               | `10`         |
| `sortBy`      | One of `task_id`, `task_content`, `created_at`, or `updated_at`.   | `created_at` |
| `sortOrder`   | `ASC` or `DESC`.                                                   | `DESC`       |

Example:

```text
GET /task?search=report&isCompleted=false&page=1&limit=10&sortBy=created_at&sortOrder=DESC
```

Example response (`200`):

```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalItems": 1,
    "totalPages": 1
  },
  "tasks": [
    {
      "task_id": 12,
      "task_content": "Finish the project report",
      "is_completed": false
    }
  ]
}
```

#### Get a task

`GET /task/:id`

Example response (`200`):

```json
{
  "task_id": 12,
  "task_content": "Finish the project report",
  "is_completed": false
}
```

A task belonging to another user is not returned.

#### Create a task

`POST /task`

Request:

```json
{
  "task": "Finish the project report"
}
```

Example response (`201`):

```json
{
  "message": "Task created successfully",
  "insertId": 12
}
```

#### Update a task

`PATCH /task/:id`

Send at least one of `taskContent` or `isCompleted`:

```json
{
  "taskContent": "Finish and submit the project report",
  "isCompleted": true
}
```

The endpoint returns `204 No Content` on success.

#### Delete a task

`DELETE /task/:id`

Deletes the task if it belongs to the signed-in user. Returns `204 No Content`.

## cURL examples

The following examples use a cookie jar to save the login session and send it with later requests.

Register an account:

```bash
curl -i -X POST http://localhost:3000/user/register \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","name":"Alex","password":"a-secure-password"}'
```

Log in and save the session cookie:

```bash
curl -i -c cookies.txt -X POST http://localhost:3000/user/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alex@example.com","password":"a-secure-password"}'
```

Create a task using the saved cookie:

```bash
curl -i -b cookies.txt -X POST http://localhost:3000/task \
  -H "Content-Type: application/json" \
  -d '{"task":"Finish the project report"}'
```

List tasks:

```bash
curl -i -b cookies.txt "http://localhost:3000/task?page=1&limit=10"
```

Mark a task as completed:

```bash
curl -i -b cookies.txt -X PATCH http://localhost:3000/task/12 \
  -H "Content-Type: application/json" \
  -d '{"isCompleted":true}'
```

Log out:

```bash
curl -i -b cookies.txt -X POST http://localhost:3000/user/logout
```

## Validation and error responses

Request validation is handled by Zod. Request objects are strict, so unexpected fields are rejected. Invalid requests return `400 Bad Request` with a response similar to:

```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

Common status codes:

| Status | Meaning                                                                           |
| ------ | --------------------------------------------------------------------------------- |
| `200`  | Request succeeded.                                                                |
| `201`  | A user or task was created.                                                       |
| `204`  | Request succeeded with no response body.                                          |
| `400`  | Request validation failed.                                                        |
| `401`  | No valid signed-in session was provided, or the login credentials were incorrect. |
| `404`  | The requested user or task was not found.                                         |
| `409`  | The email address is already in use.                                              |
| `500`  | An unexpected server error occurred.                                              |

Error responses use a `message` property. Validation errors also include an `errors` array.

## Project structure

```text
.
├── config/
│   └── db.js
├── controllers/
│   ├── taskController.js
│   └── userController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorMiddleware.js
│   ├── sessionMiddleware.js
│   └── zodMiddleware.js
├── models/
│   ├── Task.js
│   └── User.js
├── routes/
│   ├── taskRoute.js
│   └── userRoute.js
├── schemas/
│   ├── taskSchema.js
│   └── userSchema.js
├── services/
│   ├── TaskService.js
│   └── UserService.js
├── .env.example
├── server.js
└── task_manager.sql
```

## Available npm scripts

| Script        | Command             | Description                                           |
| ------------- | ------------------- | ----------------------------------------------------- |
| `npm run dev` | `nodemon server.js` | Start the development server with automatic restarts. |
| `npm start`   | `node server.js`    | Start the server.                                     |

## Notes

- The API currently has no automated test script configured in `package.json`.
- The API does not currently expose a health-check endpoint.
- The current server does not configure CORS. Add and configure CORS middleware before using it from a browser-based frontend hosted on a different origin.
