# Implementation Plan

## Purpose
This document is the senior-engineering roadmap for turning `100-backend-projects` into a production-grade open source backend learning platform.

It focuses on:
- high-availability architecture
- live backend execution, not only demo fallback data
- developer experience and contribution safety
- security, scalability, and maintainability
- CI/CD and release readiness

## Document naming
- `README.md` — project overview, quick start, high-level purpose.
- `CONTRIBUTING.md` — contribution workflow and quality expectations.
- `IMPLEMENTATION_PLAN.md` — engineering execution roadmap for the platform.
- `view-project/README.md` — demo platform architecture and operational runbook.
- `view-project/frontend/README.md` — frontend explorer-specific documentation.

## Phase 0 — cleanup and secure baseline

### 0.1 Remove committed secrets
- Delete `.env` from the repo and ensure `.gitignore` includes it.
- Add `.env.example` with placeholder values only.
- Scan the repo for hard-coded API keys, database URIs, and secrets.
- Remove any production credentials from source history if possible.

### 0.2 Fix existing metadata and script issues
- Correct `package.json` project scripts (fix `start:p38` path, ensure all entrypoints are valid).
- Make the root `package.json` a controller for workspace setup only.
- Standardize environment loading across all projects using `dotenv` and a shared config helper.

### 0.3 Define shared repo contracts
- Add a root-level `project-manifest.json` or `projects.json` with metadata for every project.
- Add per-project `README.md` stubs in each `project-XX-*` folder when missing.
- Define a single `demo.json` schema for live demo metadata and example payloads.

## Phase 1 — platform refactor and consistency

### 1.1 Project structure standardization
- Each project should follow a predictable layout:
  - `server.js`
  - `routes/`
  - `models/`
  - `middleware/`
  - `utils/`
  - `demo.json`
  - `README.md`
- Use consistent naming for API route prefixes, e.g. `/api/v1/`.
- Use a shared `errorHandler`, `requestLogger`, `validateRequest`, and `securityMiddleware`.

### 1.2 API quality and reliability
- Add health endpoints to every supported project:
  - `GET /api/health`
  - `GET /status`
- Add JSON schema validation for incoming payloads using `express-validator` or `ajv`.
- Add centralized error handling and consistent response envelopes.
- Add CORS policies, rate limiting, and request size limits.

### 1.3 Modular shared tooling
- Build `lib/` or `packages/common/` for shared utilities when the repo grows:
  - config loader
  - logger wrapper
  - DB helpers
  - auth utilities
  - validation helpers
- Keep each project self-contained, but share only non-business logic.

## Phase 2 — live backend execution and explorer conversion

### 2.1 No demo data, only live execution
- Replace static fallback behavior with real live execution for all supported projects.
- The platform should route requests to actual backend services or start project servers on demand.
- Maintain a lightweight proxy layer in `view-project/backend` that can forward requests to running project instances.

### 2.2 Live sandbox architecture
- Support two execution models:
  1. **Local process mode**: start each project as a child process and proxy traffic to its local port.
  2. **Container mode**: run each project inside Docker and expose a stable local gateway.
- Use a registry for live project endpoints and health checks.
- For real-time projects, support WebSocket proxying through the explorer gateway.

### 2.3 Live data support for stateful projects
- Projects that require persistence should use isolated databases or namespaces.
- For MongoDB-based projects, use a separate database per project or per demo environment.
- For Redis-backed projects, use separate prefixes or logical databases.
- Reset or isolate demo data between sessions to avoid cross-project contamination.

### 2.4 Demo metadata and endpoint catalog
- Require every project to include `demo.json` with:
  - `baseUrl`
  - `endpoints`
  - `examples`
  - `websocket` or `webhook` support flags when relevant
- Enhance the UI explorer to show live endpoint status and actual response times.

## Phase 3 — scalability, reliability, and production readiness

### 3.1 Deployment architecture
- Separate frontend and backend deployment.
- Use a gateway or API router for live explorer traffic.
- Deploy backend services to a managed platform and use environment-specific config.
- Use Docker Compose for local dev and Kubernetes / managed container service for production.

### 3.2 Observability and performance
- Add structured logging with `winston` or `pino`.
- Add request tracing and metrics for key endpoints.
- Add simple alerting criteria for health check failures.
- Add caching for expensive external API calls.

### 3.3 Security and operational controls
- Enforce HTTPS for all live environments.
- Add OWASP-style security headers using `helmet`.
- Add input sanitization and strict JSON validation.
- Harden the demo gateway so only allowed backend targets are proxied.
- Add API usage limits and IP throttling.

## Phase 4 — contribution and CI/CD workflow

### 4.1 GitHub Actions / CI
- Validate new project additions with:
  - linting
  - `demo.json` schema validation
  - `npm test`
  - dependency checks
  - environment audit for secrets
- Add a workflow that verifies:
  - the `project-manifest.json` contains the new project
  - `view-project/frontend/src/data/projects.json` is in sync
  - the new project has a `demo.json`

### 4.2 Branch protection and PR quality
- Protect `main` with required checks.
- Add a PR template describing required files and validation steps.
- Require at least one code review for new project additions.

### 4.3 Contribution guardrails
- No direct edits to live production config.
- No committed secrets or direct credentials.
- Require documentation for any new real-time or webhook feature.
- Encourage small, focused PRs.

## Phase 5 — feature polish and platform maturity

### 5.1 WebSocket support
- Ensure the explorer can run and visualize real-time projects.
- Support projects like chat, polling, broadcast, and kanban over WebSocket.
- Add a connection-level status indicator in the frontend.

### 5.2 Webhook and event-driven features
- Add example webhook consumers for projects that integrate with external services.
- Document webhook registration and verification patterns.
- Provide a local webhook sink or replay mechanism for developers.

### 5.3 API documentation and discoverability
- Use Swagger/OpenAPI for supported backend projects.
- Generate API docs automatically from `demo.json` or route metadata.
- Surface docs in the explorer UI.

### 5.4 Developer experience
- Add `npm run dev` commands for the explorer and for each backend project.
- Add a root `setup` script to bootstrap the repo.
- Add project-level README templates with example requests, environment, and startup instructions.

## Phase 6 — live production support and scaling beyond 51 projects

### 6.1 Adoption and performance
- Prepare for many concurrent users by using a gateway and caching layer.
- Deploy backend services behind a load balancer.
- Scale stateless services independently from stateful DB-backed services.

### 6.2 Ongoing maintenance
- Add a regular checklist for repo cleanup, dependency updates, and security reviews.
- Add a project lifecycle policy: new, supported, archived.
- Add analytics for project usage in the explorer.

### 6.3 Open source governance
- Add issue templates for feature requests, bug reports, and project additions.
- Publish contribution guidelines for mentors, reviewers, and maintainers.
- Maintain a small backlog of priority improvements.

## Minimum viable execution for today
1. Stop relying on captured demo examples and commit to real live backend execution.
2. Standardize every supported project with `demo.json` and a metadata manifest.
3. Implement the `view-project/backend` gateway as a live proxy for project servers.
4. Secure the repo by removing secrets and adding `.env.example`.
5. Add CI checks for schema validation and linting.

## Final strategic goal
Create a platform where millions of learners can explore backend APIs with confidence, where maintainers can safely add new projects, and where the platform scales with real-time, webhook, and live backend execution features.

This is not a collection of demos — it must become a reliable live learning platform with engineering-grade stability, observability, and contribution quality.