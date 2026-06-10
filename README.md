# JobPortal — Enterprise Job Portal Platform

A full-stack enterprise job portal built with React 18, Spring Boot 3, and MySQL 8.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, MUI v5, TanStack Query, React Hook Form, Zod |
| Backend | Java 21, Spring Boot 3.2, Spring Security, JPA/Hibernate, JWT |
| Database | MySQL 8.0 |
| DevOps | Docker, Docker Compose, Nginx |

---

## Quick Start (Docker)

### 1. Clone and configure
```bash
cp .env.example .env
# Edit .env with your values (especially JWT_SECRET)
```

### 2. Start everything
```bash
docker-compose up -d
```

### 3. Access the app
- Frontend: http://localhost
- Backend API: http://localhost:8080/api
- Default admin: `admin@jobportal.com` / password hash in DB (reset via API)

---

## Local Development

### Prerequisites
- Java 21+
- Node.js 20+
- MySQL 8.0+
- Maven 3.9+

### Backend
```bash
cd backend

# Create database
mysql -u root -p < ../database/schema.sql

# Configure (copy and edit)
cp ../env.example .env
# Or set env vars directly:
export DB_HOST=localhost
export DB_USERNAME=jobportal
export DB_PASSWORD=12345678
export JWT_SECRET=your_very_long_secret_key_at_least_256_bits

# Run
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
cp .env.example .env.local
# Edit VITE_API_BASE_URL=http://localhost:8080/api

npm install
npm run dev
```

App runs at http://localhost:3000

---

## User Roles

| Role | Default Path | Capabilities |
|------|-------------|-------------|
| Candidate | `/` | Browse jobs, apply, upload resume, track applications |
| Recruiter | `/recruiter/dashboard` | Post jobs, view applicants, manage company profile |
| Admin | `/admin/dashboard` | Manage all users, view platform stats |

### Creating Users
Register via UI at `/register` — select role (Job Seeker or Recruiter).

Admin accounts must be created manually via SQL:
```sql
-- Password: Admin@123456  (BCrypt hash below)
INSERT INTO users (email, username, password, first_name, last_name, role, is_active, is_email_verified)
VALUES ('admin@jobportal.com', 'admin',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewrUHcKYqzQwkV3u',
  'System', 'Admin', 'ADMIN', 1, 1);
```

---

## API Documentation

Import `postman/JobPortal.postman_collection.json` into Postman.

### Key Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token
POST   /api/auth/logout
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/change-password

GET    /api/jobs?keyword=&location=&page=0&size=12
GET    /api/jobs/{id}
GET    /api/categories

GET    /api/candidate/profile
PUT    /api/candidate/profile
PATCH  /api/candidate/profile/location
PATCH  /api/candidate/profile/salary
POST   /api/candidate/resumes           (multipart)
DELETE /api/candidate/resumes/{id}
POST   /api/candidate/applications
GET    /api/candidate/applications
POST   /api/candidate/saved-jobs/{jobId}
GET    /api/candidate/saved-jobs

POST   /api/recruiter/companies
POST   /api/recruiter/jobs
GET    /api/recruiter/jobs
PUT    /api/recruiter/jobs/{id}
GET    /api/recruiter/jobs/{id}/applications
PATCH  /api/recruiter/applications/{id}/status

GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/read-all

GET    /api/admin/users
PATCH  /api/admin/users/{id}/deactivate
```

---

## Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_PORT=3306
DB_NAME=jobportal
DB_USERNAME=jobportal
DB_PASSWORD=your_password
JWT_SECRET=your_256bit_secret_key
JWT_EXPIRATION=86400000
REFRESH_TOKEN_EXPIRATION=604800000
UPLOAD_DIRECTORY=./uploads
CORS_ORIGINS=http://localhost:3000
```

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:8080/api
VITE_APP_NAME=JobPortal
VITE_ENVIRONMENT=development
```

---

## Project Structure

```
jobportal/
├── backend/
│   ├── src/main/java/com/jobportal/
│   │   ├── controller/     # REST controllers
│   │   ├── service/        # Business logic
│   │   ├── repository/     # Spring Data JPA repos
│   │   ├── entity/         # JPA entities
│   │   ├── dto/            # Request/response DTOs
│   │   ├── security/       # JWT + Spring Security
│   │   ├── exception/      # Global exception handling
│   │   └── config/         # Security, CORS config
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client + service functions
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components per role
│   │   ├── store/          # Auth context
│   │   └── types/          # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── database/
│   └── schema.sql          # Full MySQL schema + seed data
├── postman/
│   └── JobPortal.postman_collection.json
├── docker-compose.yml
└── README.md
```

---

## Notes

- Resume files are stored on disk under `UPLOAD_DIRECTORY`
- JWT tokens expire in 24h; refresh tokens in 7 days
- Passwords are BCrypt-hashed (cost factor 12)
- All API responses follow `{ success, message, data, timestamp }` format
- Pagination: `{ content, pageNumber, pageSize, totalElements, totalPages }`
