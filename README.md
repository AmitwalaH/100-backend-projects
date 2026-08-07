# 🚀 100 Backend Projects — Open Source Learning Platform

## Overview
This repository is an open source backend learning platform built for developers who want to learn real backend engineering by running and exploring working projects.

The idea is simple:
- provide many independent backend projects
- make it easy to run each one locally
- allow developers to inspect APIs, routes, JSON payloads, and responses
- support contributors who add new backend projects with a consistent review and CI workflow

This repo currently contains 51 backend projects plus a demo platform for browsing them.

## Why this exists
Backend development is best learned through practice. This project combines:
- real API examples
- backend concepts like auth, persistence, caching, sockets and docs
- code that learners can run, modify, and debug
- an open source contribution model for adding new projects

The goal is not to ship a polished product today, but to turn this into a maintainable, scalable learning platform with clean structure and clear documentation.

## Current architecture
The repository has two main parts:

1. `project-XX-*` folders
   - Each folder is a standalone backend project.
   - Most projects are built with Node.js + Express.
   - Many use MongoDB, Redis, Cloudinary, Socket.io, or third-party APIs.

2. `view-project/`
   - `view-project/frontend`: React + Vite explorer UI.
   - `view-project/backend`: demo API sandbox and live endpoint runner.
   - This wrapper is intended to help learners preview API behavior without manually coding every request.

## How to run
### Run a single backend project
From the repository root:
```bash
npm install
npm run start:p1   # starts project-01-blog-api
npm run start:p4   # starts project-04-user-auth-api
```

Note: several script entries are hard-coded. There is one existing path issue in `start:p38` that should be fixed before using that project.

### Run the demo browser platform
The demo platform is a separate app in `view-project/`.

1. Start the backend sandbox:
```bash
cd view-project/backend
npm install
npm run start
```

2. Start the frontend UI:
```bash
cd view-project/frontend
npm install
npm run dev
```

If you deploy the demo backend, set `VITE_API_URL` in the frontend environment to your deployed API URL.

## What is implemented today
### Projects and demo support
- 51 backend project folders.
- A frontend UI that loads `view-project/frontend/src/data/projects.json`.
- Live demo sandbox support for a small subset of projects.
- `project-01-blog-api/demo.json` and `project-07-url-shortener-api/demo.json` as examples of live/demo payloads.

### Key platform building blocks
- `view-project/backend/api/index.js` — main demo API server
- `view-project/backend/api/routes/demo.js` — API playground route
- `view-project/backend/api/sandbox/registry.js` — map of live sandboxed project handlers
- `view-project/frontend/src/hooks/useProjectDemo.js` — loads demo metadata from `demo.json`
- `view-project/frontend/src/components/projects/ProjectDemoPanel.jsx` — runs demo requests

## What needs improvement
### Consistency and maintainability
- Many projects use different styles for routing, middleware, and config.
- Some projects hard-code MongoDB connection strings and secrets.
- `package.json` root scripts are brittle and inconsistent.
- Only two projects currently expose live sandbox handlers; the rest use static captured data.
- There is no unified project manifest or shared middleware.

### Security and production readiness
- `.env` is present in the repository and contains secrets. This must be removed.
- Secrets should be managed with environment variables and not committed.
- Some projects use weak or hard-coded JWT/session secrets.
- There is no centralized validation or input sanitization across all projects.

### Open source contribution workflow
- There is no documented contribution process.
- No CI config is present to validate new project additions.
- The repository needs a standard project onboarding flow.

## Recommended improvements (senior engineering plan)
### Phase 1 — stabilize the foundation
- Add a root-level `CONTRIBUTING.md` and `view-project/README.md`.
- Fix root scripts and ensure `start:p38` points to `project-38-docker-api/server.js`.
- Remove the committed `.env` file and add `.env.example`.
- Standardize environment config with a shared loader for all projects.
- Normalize each project to use the same startup pattern and error handling.

### Phase 2 — shape the learning platform
- Introduce a project manifest file, e.g. `projects.json` or `project-manifest.json`, for all projects.
- Add metadata for each exercise: title, slug, category, difficulty, tech stack, status.
- Replace brittle `projects.json` in the frontend with a manifest generated from repo metadata.
- Add robust demo schema validation for `demo.json` files.
- Expand live sandbox coverage gradually: convert more projects into `view-project/backend/api/sandbox/projects/<slug>.js` handlers.

### Phase 3 — enable safe open source contributions
- Add GitHub Actions that run lint, unit tests, and demo validation for pull requests.
- Create a PR checklist:
  - branch from `main`
  - add project folder and manifest entry
  - add `demo.json` for the new project
  - add tests or example requests
  - verify locally with `npm run lint` and `npm test`
- Enforce no committed secrets and no hard-coded environment values.

### Phase 4 — production-ready deployment path
- Use environment variables for all runtime configuration.
- Add health check endpoints and application metrics.
- Add rate limiting, CORS allowlists, request sanitization, and centralized error handling.
- Deploy the demo backend to a cloud host or container platform.
- Keep the frontend static and the backend API separate.

## Suggested project structure
A cleaner future repo shape could be:
```
100-backend-projects/
├── README.md
├── CONTRIBUTING.md
├── project-manifest.json
├── project-01-blog-api/
├── project-02-products-api/
├── ...
├── view-project/
│   ├── frontend/
│   └── backend/
└── .github/workflows/
```

### Shared organization goals
- each project folder should be self-contained
- common utilities should live in a shared location, not duplicated
- documentation should be complete and discoverable
- CI should validate both code quality and demo metadata

## How contributors should add a project
1. Create a new folder `project-52-<name>`.
2. Add a working `server.js` and any `routes/`, `models/`, `middleware/` folders.
3. Add a `demo.json` with request and response examples.
4. Add a `view-project` manifest entry.
5. Test locally with the root and view-project apps.
6. Open a PR, letting CI verify the new project before merge.

## Practical next steps
- Update the root `README.md` (done).
- Create a standard `CONTRIBUTING.md` for open source onboarding.
- Add `view-project/README.md` to document the frontend/backend demo flow.
- Add GitHub Actions that validate new projects and demo definitions.
- Clean up committed `.env` values and create `.env.example`.

## Notes for this repo today
- The repository is a promising learning platform.
- It is not yet a production-grade multi-project monorepo.
- The frontend/demo wrapper is a strong starting point but currently only supports a small live sandbox surface.
- The most valuable next step is documentation and consistency before adding more code.

---

Thank you for building this platform. The next delivery should focus on structure, docs, and a small set of high-value quality improvements rather than adding more unstructured projects.
