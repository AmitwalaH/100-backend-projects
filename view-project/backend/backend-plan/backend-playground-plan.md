# Backend Playground API

## Overview
This folder contains the backend service for the live API explorer platform.
It is not a project-specific API; instead, it is the gateway and sandbox layer that powers the UI in `view-project/frontend`.

This backend is responsible for:
- executing live API requests for supported backend projects
- isolating demo data per project
- enforcing API security and limits
- providing health and status endpoints
- returning consistent JSON responses for the explorer

## Goals
The backend should be:
- **live**: execute real request handlers whenever possible, not only static examples
- **safe**: protect the demo database and limit abuse
- **configurable**: use environment variables for keys, origins, and host settings
- **observable**: provide health checks and error feedback
- **extensible**: add new project sandbox handlers easily

## Architecture
### Key components
- `api/config.js` — centralized runtime configuration and environment defaults
- `api/app.js` — Express app setup, middleware registration, and routes
- `api/server.js` — local development/production startup entry
- `api/index.js` — exported app entrypoint for compatibility with hosting platforms
- `api/routes/demo.js` — sandbox execution routes
- `api/controllers/demoController.js` — demo handler matching and DB isolation
- `api/sandbox/registry.js` — dynamic live sandbox loader
- `api/sandbox/projects/` — sandbox modules organized by project slug
- `api/middleware` — CORS, rate limiting, sanitization, and error handling

### Demo execution model
The backend uses a dynamic sandbox loader for project modules.
Each supported project exports handlers for approved endpoints using the key format:
```
POST /api/auth/register
GET /api/posts
```

The sandbox routes forward requests to those handlers, resolve the project-specific MongoDB namespace, and return a JSON response with demo metadata.

### Data isolation
Live sandbox data is isolated per project.
This service creates a single shared MongoDB connection and uses `mongoose.Connection#useDb()` to keep each project on its own logical database.

## Running locally
```bash
cd view-project/backend
npm install
cp .env.example .env
# fill in MONGODB_URI and any other keys required for the sandbox
npm run start
```

For development with hot reload:
```bash
npm run dev
```

## Environment variables
This service expects the following variables:
- `PORT` — backend HTTP port
- `MONGODB_URI` — MongoDB connection string used for demo sandbox databases
- `ALLOWED_ORIGIN` — frontend origin allowed by CORS
- `RATE_LIMIT_WINDOW_MS` — request window size
- `RATE_LIMIT_MAX` — max requests per window
- `NODE_ENV` — `development` or `production`

## Health and diagnostics
- `GET /api/health` — confirms the service is running
- `GET /api/demo/projects` — lists sandbox-ready projects

## Improving the backend
### Priorities for the next iteration
1. Add project-level sandbox handlers for all supported services.
2. Add runtime validation for demo input payloads.
3. Add structured logging and request metrics.
4. Add a CI check that verifies the sandbox loader and `demo.json` files are in sync.
5. Add connection retry or fallback behavior for MongoDB.

## Development branch flow
Work on backend improvements in a feature branch created from `api-playground`.
Merge backend changes into `api-playground` first, then merge `api-playground` into `main` once stable.

## New sandbox module pattern
- Each sandbox project lives in `api/sandbox/projects/<project-slug>/index.js`
- Handlers are keyed by `METHOD path` and may accept optional path parameters.
- This folder-based loader scales to 50+ projects without manual registry updates.

## Notes
This backend is the strongest foundation for the live explorer experience.
The platform still needs more live handlers for all projects, but the design here is intentionally minimal and production-oriented.
