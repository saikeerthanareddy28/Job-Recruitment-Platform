# Deployment Guide

This document provides step-by-step instructions for deploying the Job Recruitment Platform to production:

- **Frontend**: Vercel (React / TypeScript / Vite)
- **Backend**: Render (Spring Boot / Java 21)
- **Database**: Clever Cloud (MySQL)

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Clever Cloud — MySQL Database](#2-clever-cloud--mysql-database)
3. [Render — Spring Boot Backend](#3-render--spring-boot-backend)
4. [Vercel — React Frontend](#4-vercel--react-frontend)
5. [Environment Variables Reference](#5-environment-variables-reference)
6. [Verifying the Deployment](#6-verifying-the-deployment)
7. [Troubleshooting](#7-troubleshooting)

---

## 1. Prerequisites

- A GitHub account with the repository pushed to GitHub.
- Accounts on:
  - [Clever Cloud](https://www.clever-cloud.com) (MySQL add-on)
  - [Render](https://render.com) (Web Service)
  - [Vercel](https://vercel.com) (Frontend)
- **Node.js 18+** and **Maven** installed locally (for testing builds).

---

## 2. Clever Cloud — MySQL Database

### 2.1 Create a MySQL Add-on

1. Log in to [Clever Cloud Console](https://console.clever-cloud.com).
2. Click **"Create an application"**.
3. Choose **"Add-on"** → **"MySQL"**.
4. Select a plan (the free/dev plan is sufficient for testing).
5. Give it a name (e.g., `jobportal-mysql`).
6. Click **Create**.

### 2.2 Get Database Credentials

After creation, go to the add-on's dashboard. Clever Cloud automatically provides a **`DATABASE_URL`** environment variable in the format:

```
mysql://user:password@host:port/dbname
```

> **Note**: The `DATABASE_URL` Clever Cloud provides uses the `mysql://` scheme. The backend's `application.yml` expects a full JDBC URL starting with `jdbc:mysql://`. You will transform this when setting the environment variable on Render (see step 3.2).

Alternatively, note down these individual values from the dashboard:
- `DB_HOST` (e.g., `xxxxx-xxxxx.mysql.clever-cloud.com`)
- `DB_PORT` (usually `3306`)
- `DB_NAME`
- `DB_USERNAME`
- `DB_PASSWORD`

---

## 3. Render — Spring Boot Backend

### 3.1 Create a Web Service

1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **"New +"** → **"Web Service"**.
3. Connect your GitHub repository.
4. Configure the service:

| Setting | Value |
|---------|-------|
| **Name** | `jobportal-backend` |
| **Region** | Choose the closest to your MySQL instance |
| **Branch** | `main` |
| **Runtime** | `Java` |
| **Build Command** | `mvn clean package -DskipTests -f backend/pom.xml` |
| **Start Command** | `java -Dserver.port=$PORT -jar backend/target/jobportal-backend-1.0.0.jar` |
| **Root Directory** | (leave blank — we use `backend/` in the build command) |

Alternatively, if using the Procfile (located at `backend/Procfile`):

| Setting | Value |
|---------|-------|
| **Build Command** | `cd backend && mvn clean package -DskipTests` |
| **Start Command** | `cd backend && java -Dserver.port=$PORT -jar target/jobportal-backend-1.0.0.jar` |

> **Important**: Make sure the `Root Directory` is set to the repository root, and the commands reference the `backend/` folder.

### 3.2 Set Environment Variables in Render

Under the **"Environment"** section, add the following:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `jdbc:mysql://[host]:[port]/[dbname]?useSSL=true&serverTimezone=UTC&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true` | Build from Clever Cloud credentials. Replace `[host]`, `[port]`, `[dbname]` with actual values. Add user+password via `DB_USERNAME`/`DB_PASSWORD` below OR embed in URL: `jdbc:mysql://user:pass@host:port/dbname?...` |
| `DB_USERNAME` | (from Clever Cloud) | Only needed if credentials are not embedded in `DATABASE_URL` |
| `DB_PASSWORD` | (from Clever Cloud) | Only needed if credentials are not embedded in `DATABASE_URL` |
| `DB_HOST` | (from Clever Cloud) | Fallback if `DATABASE_URL` is not set |
| `DB_PORT` | `3306` | Fallback if `DATABASE_URL` is not set |
| `DB_NAME` | (from Clever Cloud) | Fallback if `DATABASE_URL` is not set |
| `JPA_DDL_AUTO` | `update` | Use `validate` for stricter production mode |
| `JWT_SECRET` | A random 32+ character string | **Generate a strong secret** (e.g., `openssl rand -base64 48`) |
| `JWT_EXPIRATION` | `86400000` | 24 hours in ms |
| `REFRESH_TOKEN_EXPIRATION` | `604800000` | 7 days in ms |
| `CORS_ALLOWED_ORIGINS` | `https://your-frontend.vercel.app` | The URL of your Vercel deployment (see step 4) |
| `UPLOAD_DIRECTORY` | `/tmp/uploads` | Use `/tmp/` on Render (ephemeral storage — see warning below) |

> **⚠️ File Upload Warning**: Render uses an ephemeral filesystem. Any files uploaded (resumes, profile pictures) will be lost when the service restarts or redeploys. The backend logs a warning on startup about this. For production, replace `FileStorageService` with a cloud storage solution (S3, Cloudinary, etc.).

### 3.3 Select Plan

- Choose **"Free"** (or "Starter" for better performance).
- Free tier spins down after 15 minutes of inactivity. Consider a paid plan for always-on availability.

### 3.4 Deploy

1. Click **"Create Web Service"**.
2. Render will automatically clone the repo, run the build command, and start the service.
3. Once deployed, note the service URL: `https://jobportal-backend.onrender.com`

### 3.5 Verify Backend

Test the health endpoint:

```bash
curl https://jobportal-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}'
```

You should get a JSON response (even if it's an error about invalid credentials — the important thing is the server is reachable).

---

## 4. Vercel — React Frontend

### 4.1 Prepare Your Frontend

The repository already includes:
- `frontend/vercel.json` — SPA rewrite rule (prevents 404 on page refresh).
- `frontend/vite.config.ts` — build configuration.
- `frontend/.env.example` — frontend environment template.

### 4.2 Deploy to Vercel

1. Log in to [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** → **"Project"**.
3. Import your GitHub repository.
4. Configure the project:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (or `tsc && vite build`) |
| **Output Directory** | `dist` |

### 4.3 Set Environment Variables

Under **"Environment Variables"**, add:

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_BASE_URL` | `/api` | The proxy prefix (Vite uses this as the base URL for API calls). In production, Vercel will forward `/api/*` calls to your Render backend URL. |
| `VITE_APP_NAME` | `JobPortal` | Optional — app display name |
| `VITE_ENVIRONMENT` | `production` | Optional — environment flag |

> **Important**: For Vercel to proxy `/api` to your backend, you need to add the **`vercel.json`** with a `rewrites` section that forwards `/api/*` to your Render URL. Update the `frontend/vercel.json` file to include the API rewrite:

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "https://jobportal-backend.onrender.com/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

> Replace `https://jobportal-backend.onrender.com` with your actual Render service URL.

After updating, commit and push the changes. Vercel will automatically redeploy.

### 4.4 Deploy

Click **"Deploy"**. Vercel will build and deploy the frontend.

### 4.5 Update CORS on Backend

After deployment, go back to **Render** and update the `CORS_ALLOWED_ORIGINS` environment variable to include your Vercel domain:

```
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
```

Render will automatically restart the service with the new variable.

---

## 5. Environment Variables Reference

### 5.1 Backend (Render)

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `jdbc:mysql://localhost:3306/jobportal?...` | Full JDBC URL. If set, overrides DB_HOST/DB_PORT/DB_NAME. |
| `DB_HOST` | `localhost` | MySQL host (used if DATABASE_URL is not set) |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | `jobportal` | MySQL database name |
| `DB_USERNAME` | `root` | MySQL username |
| `DB_PASSWORD` | `12345678` | MySQL password |
| `JPA_DDL_AUTO` | `update` | Hibernate DDL mode (`update`, `validate`, `none`, `create-drop`) |
| `JWT_SECRET` | (default in code) | JWT signing key (min 32 chars) |
| `JWT_EXPIRATION` | `86400000` | Access token TTL (ms) |
| `REFRESH_TOKEN_EXPIRATION` | `604800000` | Refresh token TTL (ms) |
| `SERVER_PORT` | `8080` | Server port (Render sets this via `$PORT`) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:3000` | Comma-separated allowed origins |
| `UPLOAD_DIRECTORY` | `./uploads` | Local upload directory (ephemeral on Render) |

### 5.2 Frontend (Vercel)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `/api` | API base path (proxied to backend via Vercel rewrites) |
| `VITE_APP_NAME` | `JobPortal` | Application display name |
| `VITE_ENVIRONMENT` | `development` | Environment label |

---

## 6. Verifying the Deployment

1. **Open the Vercel URL** (e.g., `https://your-project.vercel.app`).
2. **Register a new account** — the registration form should submit successfully.
3. **Log in** — you should be redirected to the dashboard.
4. **Browse jobs** — the job listings should load from the backend.
5. **Check CORS** — open browser DevTools → Console; there should be no CORS errors.
6. **Refresh any page** (e.g., `/jobs`, `/profile`) — it should load correctly (SPA rewrite is working).

---

## 7. Troubleshooting

### Backend won't start
- Check Render logs for database connection errors.
- Verify `DATABASE_URL` or individual DB variables are correct.
- Make sure Clever Cloud allows connections from Render's IP range (Clever Cloud MySQL add-ons are usually publicly accessible with SSL).

### CORS errors in browser
- Verify `CORS_ALLOWED_ORIGINS` on Render includes the exact Vercel URL (no trailing slash).
- Check that `SecurityConfig.java` and `WebConfig.java` use `CORS_ALLOWED_ORIGINS` from the env var.
- Ensure the `vercel.json` rewrite for `/api` points to the correct Render URL.

### 404 on page refresh (React Router)
- Make sure `frontend/vercel.json` contains the `"/(.*)"` → `"/index.html"` rewrite rule.
- Re-deploy on Vercel after updating `vercel.json`.

### File uploads don't persist
- This is expected: file uploads go to the local filesystem (`/tmp/uploads` on Render).
- The backend logs a warning on startup.
- **Solution**: Implement cloud storage (S3, Cloudinary) in `FileStorageService.java`.

### Database connection timeout
- Clever Cloud MySQL may need SSL. Ensure `useSSL=true` in `DATABASE_URL`.
- Check that Render's IP is allowed. For production, consider using Clever Cloud's "Private Network" feature.

### Free tier spin-down
- Render free web services spin down after 15 minutes of inactivity.
- The first request after inactivity may take 30–60 seconds to respond.
- Upgrade to a paid plan for always-on availability.

---

## Quick Reference: Complete Flow

```
┌─────────────┐      /api/*      ┌──────────────┐     JDBC       ┌───────────────┐
│   Vercel    │ ────────────────▶ │    Render    │ ──────────────▶ │ Clever Cloud  │
│  (Frontend) │ ◀──────────────── │  (Backend)   │ ◀────────────── │   (MySQL)     │
│  React/Vite │     JSON/API      │ Spring Boot  │    Results     │               │
└─────────────┘                   └──────────────┘                └───────────────┘
                                                                                     
  Vercel rewrites:                      Render env vars:             Clever Cloud:
  /api/*  → Render URL                 DATABASE_URL              Auto provides
  /*      → /index.html               CORS_ALLOWED_ORIGINS        DATABASE_URL
                                       JWT_SECRET
```

---

*Last updated: 2026-06-23*