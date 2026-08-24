# Backend Restructure Plan

## Why this restructure is needed
The backend sandbox currently uses a flat file layout that is fragile for 51+ projects.
As the number of project demos grows, the backend must scale in a maintainable way without requiring manual registry updates for each project.

## Goals
- support 50+ demo projects cleanly
- make sandbox projects self-contained
- use a dynamic live-project loader
- keep route matching correct for path parameters
- isolate demo data per project database
- separate app configuration, routes, and controllers
- make the backend easy to extend and audit

## New folder structure
- `api/`
  - `config.js` - runtime configuration and env var defaults
  - `app.js` - Express application setup, middleware, route registration
  - `server.js` - local development / production entrypoint
  - `index.js` - existing compatibility entry export
  - `routes/` - route definitions and routers
  - `controllers/` - route handlers and demo execution logic
  - `middleware/` - shared Express middleware
  - `sandbox/`
    - `registry.js` - dynamic sandbox project loader
    - `projects/` - one folder per supported demo project
    - `README.md` - project sandbox authoring guide

## What changes first
1. create a central `config.js` so runtime values are isolated and testable.
2. split Express app setup from server startup (`app.js` + `server.js`).
3. refactor demo route into a controller that can match both exact and parameterized paths.
4. load sandbox projects dynamically instead of using a manual registry map.
5. move existing demo projects into folder-based sandboxes.
6. update documentation with the new architecture and project contribution expectations.

## Execution plan
- Phase 1: restructure files and preserve the current API contract.
- Phase 2: add `:param` route matching to sandbox handlers.
- Phase 3: create a consistent sandbox module template.
- Phase 4: document how to add new sandbox projects and how demo fallback works.
- Phase 5: migrate additional live project demos into the new structure.

## Expected benefits
- easier onboarding for contributors adding new demo projects
- safer expansion as the number of projects grows
- lower maintenance overhead when adding project sandboxes
- improved clarity for backend live demo flow
- cleaner separation between the demo platform and individual project handlers
