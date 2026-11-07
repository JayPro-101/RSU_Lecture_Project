# RSU Lecture Information Platform

A real-time lecture and venue change notifier built for Rivers State University students.

## Overview

RSU Lecture Information Platform helps students stay up to date when lectures are rescheduled or venues change. Instead of relying on group chats and notice boards, it gives them a single source of truth with verified updates and secure accounts. The platform also gives moderators and administrators the tools to manage users and publish changes through role-based access.

## System Architecture

```mermaid
flowchart LR
  Client["Web / Mobile Client"]
  API["API Server"]
  DB[("PostgreSQL Database")]
  Email["Email Service"]

  Client -- "HTTPS" --> API
  API --> DB
  API --> Email

  style Client fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff
  style API fill:#2e1065,stroke:#8b5cf6,stroke-width:2px,color:#fff
  style DB fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
  style Email fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fff
```

## Features

### Secure Authentication with Refresh Token Rotation

Users register with a verified email and log in to receive short-lived access tokens plus HttpOnly cookie refresh tokens. The system rotates refresh tokens on every use and revokes entire families if reuse is detected, which helps stop session hijacking.

```mermaid
sequenceDiagram
  actor User
  participant API
  participant DB as Database

  User->>API: Register / login
  API->>DB: Store hashed session
  API->>User: Access token + refresh cookie
  User->>API: Request protected resource
  API->>DB: Validate access token
  API->>User: Return resource
  User->>API: Refresh access token
  API->>DB: Rotate refresh token
  API->>User: New access token
```

### Email Verification and Password Reset

New accounts must be verified through a one-time email token. If a user forgets their password, they can request a secure reset link that expires after a configurable time.

```mermaid
sequenceDiagram
  actor User
  participant API
  participant Email as Email Service
  participant DB as Database

  User->>API: Request verification
  API->>DB: Store token hash
  API->>Email: Send verification email
  Email->>User: Token / link
  User->>API: Submit token
  API->>DB: Mark email verified
  API->>User: Account activated
```

### Role-Based Access Control

The platform supports multiple roles, including student, student moderator, academic representative, and platform admin. Sensitive endpoints check both authentication and role permissions before returning data.

### Account Management

Admins can update account statuses, while users can update their own profile. Password hashes are never returned in API responses, and serialization strips sensitive fields automatically.

## Technologies Used

| Technology | Description |
|------------|-------------|
| [TypeScript](https://www.typescriptlang.org/) | Typed superset of JavaScript used across the backend |
| [NestJS](https://nestjs.com/) | Progressive Node.js framework for building scalable APIs |
| [Prisma](https://www.prisma.io/) | Type-safe ORM for database access and schema management |
| [PostgreSQL](https://www.postgresql.org/) | Relational database for storing users, sessions, and tokens |
| [Passport](http://www.passportjs.org/) / JWT | Authentication middleware and token signing |
| [Argon2](https://argon2.online/) | Password hashing algorithm configured with Argon2id |
| [Nodemailer](https://nodemailer.com/) | SMTP email transport provider |
| [Sendlib](https://sendlib.samueltuoyo.com/) | Cloud email provider integration |
| [Jest](https://jestjs.io/) | Testing framework for unit and integration tests |

## Installation

1. Clone the repository:

```bash
git clone https://github.com/JayPro-101/RSU_Lecture_Project.git
cd RSU_Lecture_Project/backend
```

2. Install dependencies:

```bash
pnpm install
```

3. Create a `.env` file in the `backend` directory. Here is an example:

```bash
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/rsu_lecture_db"
JWT_ACCESS_SECRET="your-jwt-access-secret"
JWT_ACCESS_EXPIRATION="15m"
EMAIL_PROVIDER="sendlib"
SEND_LIB_API_KEY="your-sendlib-key"
SEND_LIB_FROM="RSU Lecture Platform <no-reply@rsu.edu.ng>"
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-smtp-user"
SMTP_PASS="your-smtp-password"
EMAIL_FROM="RSU Lecture Platform <no-reply@rsu.edu.ng>"
EMAIL_VERIFICATION_TOKEN_TTL_HOURS=24
EMAIL_RESEND_COOLDOWN_SECONDS=60
PASSWORD_RESET_TOKEN_TTL_MINUTES=60
```

4. Generate the Prisma client and run migrations:

```bash
npx prisma generate
npx prisma migrate dev
```

5. Start the development server:

```bash
pnpm run start:dev
```

The API will be available at `http://localhost:3000`.

## Usage

### Health check

Start the server and call the root endpoint:

```bash
curl http://localhost:3000/
```

Example response:

```json
{
  "status": "success",
  "message": "Welcome to RSU Lecture Information Platform API",
  "data": "Hello World!"
}
```

### Run the test suite

```bash
pnpm run test
```

### Run with coverage

```bash
pnpm run test:cov
```

## Contributing

Contributions are welcome. If you want to add a feature or fix a bug, please open an issue first so we can discuss the change. Keep pull requests focused, well-tested, and aligned with the existing code style.

## Author

- LinkedIn: [https://linkedin.com/in/devtext16](https://linkedin.com/in/devtext16)
- X: [https://x.com/DevText16](https://x.com/DevText16)

## Badges

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://dokugen.samueltuoyo.com)