# ClawManager

<p align="center">
  <img src="frontend/public/openclaw_github_logo.png" alt="ClawManager" width="100%" />
</p>

<p align="center">
  ClawManager is the upgraded control plane built on top of ClawReef for operating OpenClaw and Linux desktop runtimes on Kubernetes.
</p>

<p align="center">
  <strong>Languages:</strong>
  English |
  <a href="./README.zh-CN.md">中文</a> |
  <a href="./README.ja.md">日本語</a> |
  <a href="./README.ko.md">한국어</a> |
  <a href="./README.de.md">Deutsch</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.21%2B-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go 1.21+" />
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Kubernetes-Native-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes Native" />
  <img src="https://img.shields.io/badge/MySQL-8.0%2B-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8.0+" />
</p>

## News

- [2026-03-20] README refreshed to match the latest implemented product state, including portal access, Webtop runtime support, runtime image cards, cluster resource overview, password change flows, and OpenClaw import/export support.

## Overview

ClawManager keeps the original ClawReef goal of managing virtual desktops on Kubernetes, and extends it into a fuller operations plane for desktop runtime delivery, user governance, and secure in-cluster access.

Today the project already includes:

- multi-user desktop instance management
- role-based admin and user consoles
- quota control for instances, CPU, memory, storage, and GPU
- token-based desktop access through backend proxy endpoints
- embedded desktop access in both the instance detail page and a dedicated portal page
- OpenClaw workspace export/import support
- runtime image override management
- cluster resource overview for administrators
- multilingual UI with English, Chinese, Japanese, Korean, and German

## Current Capabilities

### User Side

- Register, log in, refresh token, log out, and change password
- Create desktop instances with quota-aware validation
- Supported runtime types: `openclaw`, `webtop`, `ubuntu`, `debian`, `centos`, `custom`
- Start, stop, restart, delete, and inspect instances
- Access running desktops from:
  - the instance detail page
  - the dedicated `/portal` workspace switcher
- Generate short-lived access tokens for proxied desktop sessions
- Export and import OpenClaw workspace archives for `openclaw` instances

### Admin Side

- Admin dashboard with:
  - total users / instances / running instances / allocated storage
  - cluster node readiness
  - CPU, memory, and disk requested vs allocatable summaries
  - per-node capacity table
- User management:
  - create users
  - delete users
  - update role
  - update quota
  - CSV import with default password generation
- Global instance management across users
- Runtime image card management for supported instance types
- Cluster resource overview API and UI
- Password change entry in admin settings

### Backend / Platform

- REST API under `/api/v1`
- JWT-based authentication
- WebSocket endpoint for realtime connections
- Kubernetes-backed instance lifecycle handling
- Reverse proxy for desktop traffic, including WebSocket forwarding
- Periodic instance sync service

## Architecture

```text
Browser
  -> React frontend
  -> Go/Gin backend
  -> MySQL
  -> Kubernetes API
  -> Namespace / Pod / PVC / Service
  -> OpenClaw / Webtop / Linux desktop runtime
```

Notes:

- Desktop traffic is exposed through authenticated backend proxy routes.
- Cluster visibility and instance lifecycle features require backend access to Kubernetes.
- Some historical package names still use `clawreef`; the product name is now ClawManager.

## Project Structure

```text
ClawManager/
├── backend/        # Go backend API, services, migrations
├── frontend/       # React frontend
├── deployments/    # Root-level Kubernetes deployment files
├── dev_docs/       # Design and implementation notes
├── scripts/        # Helper scripts
├── README.md
├── README.zh-CN.md
├── TASK_BREAKDOWN.md
└── dev_progress.md
```

## Tech Stack

### Frontend

- React 19
- TypeScript 5.9
- Vite 8
- React Router 7
- Axios
- Zustand

### Backend

- Go 1.21+
- Gin
- upper/db
- MySQL 8.0+
- JWT authentication

### Infrastructure

- Kubernetes
- Docker
- WebSocket proxying

## API Highlights

Key implemented endpoints:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/change-password`
- `GET /api/v1/auth/me`
- `GET /api/v1/users`
- `POST /api/v1/users/import`
- `PUT /api/v1/users/:id/quota`
- `GET /api/v1/instances`
- `POST /api/v1/instances`
- `POST /api/v1/instances/:id/start`
- `POST /api/v1/instances/:id/stop`
- `POST /api/v1/instances/:id/restart`
- `POST /api/v1/instances/:id/access`
- `POST /api/v1/instances/:id/sync`
- `GET /api/v1/instances/:id/openclaw/export`
- `POST /api/v1/instances/:id/openclaw/import`
- `GET /api/v1/system-settings/images`
- `PUT /api/v1/system-settings/images`
- `GET /api/v1/system-settings/cluster-resources`
- `GET /api/v1/ws`

## Quick Start

### Prerequisites

- MySQL 8.0+
- A reachable Kubernetes cluster
- `kubectl` configured for the cluster used by ClawManager
- Node.js 20+
- Go 1.21+

Verify Kubernetes connectivity first:

```bash
kubectl get nodes
```

### Backend

Local development config lives in `backend/configs/dev.yaml` and defaults to:

- server: `http://localhost:9001`
- database host: `localhost`
- database port: `13306`
- database name: `clawreef`

Start the backend:

```bash
cd backend
go mod tidy
make run
```

### Frontend

Start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Default frontend address:

- `http://localhost:9002`

### Database Bootstrap

If you are using the local init tool:

```bash
cd backend
go run cmd/initdb/main.go
```

The initializer creates the default admin account:

- `admin / admin123`

### Docker Compose

The repository also includes Docker Compose files under `backend/deployments/docker/`.

```bash
cd backend
make docker-up
```

## First Run Workflow

1. Log in as `admin`.
2. Create users manually or import them from CSV.
3. Assign quotas for instances, CPU, memory, storage, and GPU.
4. Optionally configure runtime image cards in admin settings.
5. Log in as a regular user and create an instance.
6. Open the desktop from the instance detail page or from `/portal`.

## CSV Import

The user import flow accepts a CSV file with headers such as:

```csv
Username,Email,Role,Password,Max Instances,Max CPU Cores,Max Memory (GB),Max Storage (GB),Max GPU Count
```

Rules implemented in code:

- `Username`, `Role`, `Max Instances`, `Max CPU Cores`, `Max Memory (GB)`, and `Max Storage (GB)` are required
- `Email`, `Password`, and `Max GPU Count` are optional
- when `Password` is omitted, the backend generates a default by role:
  - imported admin: `admin123`
  - imported user: `user123`

## Configuration Notes

Common backend environment variables:

- `SERVER_ADDRESS`
- `SERVER_MODE`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

Practical notes:

- frontend development calls the backend on port `9001`
- desktop access uses backend proxy routes under `/api/v1/instances/:id/proxy`
- OpenClaw import/export is only available for running `openclaw` instances
- cluster resource overview is admin-only

## Documentation

- [TASK_BREAKDOWN.md](./TASK_BREAKDOWN.md)
- [dev_progress.md](./dev_progress.md)
- [backend/README.md](./backend/README.md)
- [dev_docs/ARCHITECTURE_SIMPLE.md](./dev_docs/ARCHITECTURE_SIMPLE.md)
- [dev_docs/MONITORING_DASHBOARD.md](./dev_docs/MONITORING_DASHBOARD.md)

## License

MIT
