# Northwind Support Desk

A full-stack support ticket management system built with **.NET 10 Web API**, **React 19**, and **SQL Server**.

---

## Overview & Time Spent

This project implements a complete four-task engineering assignment for the Northwind Support Desk team.
* **Time Spent**: ~15 hours across 2 days.
* **Tasks Completed**:
  1. **Task 1**: Fixed input/debouncing defects and implemented server-side filtering.
  2. **Task 2**: Automated triage, SLA calculations, premium tiers, agent specializations, and ticket escalations with immutable audit history.
  3. **Task 3**: Agent authentication via JWT, password hashing, and frontend session management.
  4. **Task 4**: Full API containerization with a multi-stage Dockerfile, non-root user security (`appuser`), database health probes, and Docker Compose orchestration.

---

## Development Login Credentials

To evaluate the application, sign in using any of the pre-seeded local agent fixtures:
* **Email**: `alex.turner@northwind-support.example` (or `ben.osei@northwind-support.example`, `priya.nair@northwind-support.example`)

---

## Getting Started & Running the Project

### Method 1: Running via Docker Compose (Recommended - Task 4)
One command brings up SQL Server, applies migrations, seeds data, and launches the API:

1. Ensure Docker is running.
2. From the repository root, run:
   ```bash
   docker compose down -v
   docker compose up --build
## Quick start

**Prerequisites:** .NET SDK 10 (`global.json`), Node.js 22 (`.nvmrc`; 20.19+ works), Docker.

```bash
cp .env.example .env          # optional, every value has a working default
npm install                   # installs the web app
npm run db:up                 # SQL Server 2022 in Docker on localhost:1433
npm run api                   # terminal 1: migrates, seeds, then serves the API
npm run web                   # terminal 2: React dev server
```

| What | Where |
| --- | --- |
| Web app | http://localhost:5173 |
| API | https://localhost:7043 (also http://localhost:5043) |
| Swagger | https://localhost:7043/swagger |

In Development the API applies migrations and seeds demo data on startup. **Never commit real
credentials.**

**Visual Studio 2026:** run `npm run db:up`, open `SupportDesk.sln`, set
**SupportDesk.Presentation** as the startup project, and press F5 on the **https** profile.

## Tests

```bash
npm test                      # dotnet test, then the web tests (Vitest)
```

Both pass on a clean checkout and neither needs a database.

## Commands

| Command | What it does |
| --- | --- |
| `npm run db:up` / `db:down` / `db:reset` | Start / stop / wipe SQL Server |
| `npm run api` / `npm run web` | Run the API / the React app |
| `npm run build` | Build both |
| `npm run lint` / `typecheck` / `format` | Web lint and types / `dotnet format` |
| `npm run ef -- migrations add <Name>` | Add an EF Core migration |

## API at a glance

| Endpoint | Description |
| --- | --- |
| `GET /api/tickets` | Paged list with `search`, `status`, `priority`, `categoryId`, `customerId`, `assignedAgentId`, `unassignedOnly`, `sortBy`, `sortDirection`. **Filters are accepted but not applied yet** (Task 1). |
| `GET /api/tickets/{id}` | One ticket |
| `POST /api/tickets` | Create a ticket |
| `PATCH /api/tickets/{id}/status` · `/assignment` | Change status / assignee |
| `GET /api/customers` · `/api/agents` · `/api/categories` | Reference data |

Errors are `ProblemDetails`: `400` validation, `404` not found, `409` conflict or business rule.

**Seed data:** 5 categories, 6 customers (3 Premium), 6 agents (one inactive, one at their limit)
and 40 tickets across every status, priority and SLA state.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| API cannot reach the database | `npm run db:up`, wait ~20 s, check `docker compose ps` |
| Port 1433 already in use | Change the port in `docker-compose.yml` and `.env` |
| Browser warns about the certificate | `dotnet dev-certs https --trust`, or use the web app, which proxies |
| Web app shows "Unable to load tickets" | The API is not running, or `VITE_API_PROXY_TARGET` points at the wrong port |
| SQL Server slow on Apple Silicon | Enable Rosetta in Docker Desktop → Settings → General |
