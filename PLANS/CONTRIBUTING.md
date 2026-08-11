# Contributing to 100 Backend Projects

Thank you for contributing to this open source backend learning platform.
This document explains how to add new backend projects, work with the demo explorer, and keep the platform maintainable.

## Contribution principles
- Keep project code simple and consistent.
- Do not commit secrets or `.env` files.
- Prefer clear, readable APIs over clever shortcuts.
- Add documentation for any new project or feature.
- Test locally before opening a PR.

## Repo structure summary
- `project-XX-<name>/` — independent backend projects.
- `view-project/frontend/` — React + Vite exploration UI.
- `view-project/backend/` — demo sandbox API.

## How to contribute a new project
1. Create a new project folder using the naming format:
   - `project-52-my-new-api`
2. Add a working `server.js` and clean folder structure:
   - `routes/`
   - `models/`
   - `middleware/`
   - `utils/`
3. Use environment variables for configuration.
4. Add a `demo.json` file with example endpoints.
5. Add a manifest entry in `view-project/frontend/src/data/projects.json`.
6. Add a new sandbox folder in `view-project/backend/api/sandbox/projects/<project-slug>/index.js` if this project will support live sandbox execution.
7. Run the repository and verify the new project works:
   - `npm install`
   - `npm run start:pXX`
   - or run the view project demo locally.

## `demo.json` expectations
Each `demo.json` should describe the project's example requests and expected responses.
The frontend explorer uses `demo.json` to display API examples and execute live calls.

Required fields:
- `baseUrl` — the base API URL shown in the UI.
- `endpoints` — an array of objects.

Each endpoint should include:
- `method` — one of `GET`, `POST`, `PUT`, `PATCH`, `DELETE`
- `path` — route path starting with `/`
- `description` — short explanation of the endpoint
- `requestBody` — example request payload (set to `null` if not applicable)
- `responseStatus` — status code expected from the example
- `responseBody` — example JSON response
- `responseTimeMs` — demo response latency estimate

## Running the platform locally
### Run a project directly
```bash
npm install
npm run start:p1
```

### Run the demo explorer
```bash
cd view-project/backend
npm install
npm run start
```
```bash
cd view-project/frontend
npm install
npm run dev
```

### Production-ready deployment notes
- Use a managed database service for MongoDB/Redis.
- Keep secrets in environment variables or a secret store.
- Use rate limiting and request sanitization.
- Add health checks and logging.

## Pull request checklist
- [ ] Project code compiles and runs.
- [ ] No secrets are committed.
- [ ] New demo examples are added if applicable.
- [ ] `projects.json` or manifest updated.
- [ ] `CONTRIBUTING.md` referenced if needed.
- [ ] Tests and linting pass.

## Suggested CI checks
- Install dependencies.
- Run `npm run lint` in the frontend and backend.
- Validate `demo.json` schema.
- Run existing tests.
- Ensure the new project path is reachable.

## Workflow and branching
For enterprise-style branching and task management, follow the process in `WORKFLOW.md`.
That file defines issue-driven work, branch naming, PR expectations, and low-cost delivery decisions.

### Branch strategy
- `main` is the stable production-ready branch.
- `api-playground` is the integration branch for backend platform and explorer changes.
- New feature/bug branches should merge into `api-playground` first.
- Once `api-playground` is reviewed and stable, it merges into `main`.

This workflow helps us test platform changes collectively before they reach `main`.

This repository also includes GitHub templates in `.github/` for feature requests, bug reports, and pull requests.
Use the issue templates to capture task context before starting work.

## Best practices
- Use reusable middleware for auth, validation, logging, and error handling.
- Keep request and response shapes stable.
- Avoid inline secrets and hard-coded database URLs.
- Prefer `process.env` for runtime configuration.
- Keep the `view-project` demo API lightweight and safe.

## Issues to avoid
- Hard-coded credentials in repo files.
- Unchecked JSON parsing or unsafe request body handling.
- Inconsistent endpoint naming or route format.
- Missing documentation for how to run the project.

Thank you again for helping make this repo a useful open source learning platform.