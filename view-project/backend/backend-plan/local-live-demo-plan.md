# Local Live Demo Plan

## Purpose

This document defines the local-first live demo implementation for the 100 Backend Projects explorer.
It explains why a local sandbox-first experience is the correct next step and how to implement it for actual working backend and frontend integration.

This plan is intentionally detailed so contributors can follow a single path from concept to working local demo pages.
The first phase is local-only demo support; the second phase will extend this same architecture to hosted URLs.

## Why local first?

- Local-first means we can validate real backend behavior before investing in hosted deployments.
- Every project can be tested against actual request/response handlers living inside the repository.
- Local demo support makes the explorer reliable for development and staging.
- Hosted demos are optional later; they should build on this local foundation.

## What this plan covers

- project metadata and demo contract design
- local backend sandbox architecture
- frontend per-project demo page behavior
- local live demo route and button flow
- code structure and UX expectations
- developer setup and testing strategy
- future hosted extension principles

## Scope

This plan is scoped to the `view-project/` workspace.
The local demo implementation is intentionally separate from any production hosted demo URLs.

### Included

- `project-manifest.json` metadata
- `project-*/demo.json` contract files
- `view-project/backend/api` sandbox backend
- `view-project/frontend` explorer UI and project pages

### Excluded

- external deployed hosting services
- cloud CI/CD deployment automation
- production monitoring for the hosted URL path

## Core objectives

1. Create reliable local demo pages for supported projects.
2. Keep local demo support aligned with the repository metadata.
3. Use `demo.json` as a contract, not as a fake backend.
4. Support a per-project detail page for every project with local live demo UI.
5. Keep the live demo button meaningful for local sandbox-enabled projects.
6. Preserve future hosted-demo support in the same architecture.

## Principle: demo.json is contract metadata

`demo.json` should describe the project's API surface.
It should not be the source of truth for backend behavior.
Instead it should be:

- a list of example endpoints
- request and response examples
- a `baseUrl` hint for the frontend
- the source for the live demo panel layout

The actual backend request execution should be handled by the sandbox or the real project backend.

## Local live demo architecture

The local live demo architecture has two halves:

1. Backend sandbox service
2. Frontend explorer UI

### Backend sandbox service

The local backend sandbox is responsible for:

- loading project-specific sandbox handlers
- isolating state and data for each project
- exposing a single demo endpoint for the explorer
- returning consistent JSON responses
- providing a list of supported local demo projects

The key service contract is:

- `POST /api/demo/:project` — execute a demo request for the named project
- `GET /api/demo/projects` — list sandbox-ready projects
- `GET /api/health` — health check for the demo service

### Frontend explorer UI

The frontend UI is responsible for:

- loading project metadata from `project-manifest.json`
- loading demo metadata from actual `project-*/demo.json` files
- rendering a per-project detail page at `/project/:slug`
- showing local demo availability on the project page
- executing real live demo requests through the sandbox backend
- keeping external hosted demo support optional and separate

## Local demo page behavior

Each project should have its own detail page.
The route design is:

- `/project/:slug` — project detail page

The detail page should include:

- project metadata
- GitHub link
- live demo button
- API playground panel when local demo metadata exists

If the project has local demo support, the live demo button should:

- be active
- focus or scroll to the API playground
- use local backend sandbox execution

If the project has an external `liveDemo` URL, the button should:

- open the external demo in a new tab
- remain optional and secondary to the local playground

If the project has neither local demo metadata nor external live demo support, the button should:

- be disabled
- explain that local demo support is not yet available

## Project manifest design

`project-manifest.json` is the central metadata source for the explorer.
It should include at least the following fields per project:

- `id`
- `slug`
- `title`
- `description`
- `category`
- `difficulty`
- `tech`
- `github`
- `liveDemo`
- `demoSupport`

The `liveDemo` field is optional.
It may contain:

- `false` — no live demo link available
- `"#"` — placeholder for later hosted demo support
- `"http://..."` or `"https://..."` — external hosted demo URL

The `demoSupport` field should be derived rather than authored manually when possible.
It may come from existence of `project-*/demo.json` or from project sandbox registration.

## Demo contract spec

Every project that supports local demo should include a `demo.json` file at the repository root level.
The file path pattern is:

- `project-XX-name/demo.json`

The contract should describe:

- `baseUrl` — a hint or UI label for preview purposes
- `endpoints` — an array of endpoint descriptions

Each endpoint object should include:

- `method` — HTTP method
- `path` — API path
- `description` — short explanation
- `requestBody` — example request payload or `null`
- `responseStatus` — expected status code
- `responseBody` — example response data
- optional `responseTimeMs` for example timing

### Example structure

```json
{
  "baseUrl": "http://localhost:4000",
  "endpoints": [
    {
      "method": "POST",
      "path": "/api/auth/register",
      "description": "Register a new user account.",
      "requestBody": {
        "name": "Amit Wala",
        "email": "amit@example.com",
        "password": "secret123"
      },
      "responseStatus": 201,
      "responseBody": {
        "success": true,
        "token": "...",
        "user": { "_id": "...", "name": "Amit Wala" }
      },
      "responseTimeMs": 120
    }
  ]
}
```

## Local sandbox backend design

The sandbox backend should load project modules automatically.
The folder layout is:

- `view-project/backend/api/sandbox/projects/<project-slug>/index.js`

Each project module should export named handlers keyed by a request spec.
The key format is:

- `METHOD /api/path`

The handler signature should be:

- `async function handler(body, db, params)`

Where:

- `body` is the request payload and route params combined
- `db` is a MongoDB connection scoped to the project
- `params` contains path variables from the route

### Example sandbox handler

```js
module.exports = {
  "POST /api/auth/register": async (body, db) => {
    const User = db.model("User", new mongoose.Schema({ name: String, email: String, password: String }));
    const user = await User.create({ name: body.name, email: body.email, password: body.password });
    return {
      status: 201,
      body: { success: true, user: { _id: user._id, name: user.name, email: user.email } }
    };
  }
};
```

### Sandbox loader behavior

The backend sandbox loader should:

- scan `api/sandbox/projects/`
- load `index.js` from each subfolder
- allow top-level project files for compatibility if needed
- register handlers under their project key
- avoid loading unknown or dangerous files

The current implementation already supports folder-based discovery.
This plan builds on that by validating the project slug mapping and sandbox contract.

## Frontend explorer design

The frontend explorer should use a manifest-first model.
The data sources are:

- `project-manifest.json` — central project metadata
- `project-*/demo.json` — project-specific demo contract files

### Data loading

The explorer should:

- import `project-manifest.json` from the repository root
- load `project-*/demo.json` files using Vite glob import
- validate both the manifest and demo files
- derive local demo availability from the demo data

### Local route behavior

The primary page route is:

- `/project/:slug`

When the user visits a project page, the explorer should:

- show the project metadata
- show whether local demo support exists
- show the live demo button accordingly
- render the `ProjectDemoPanel` only if demo metadata exists

### Live demo button behavior

The live demo button should be:

- external if `liveDemo` is a valid URL
- local if `demo.json` exists for the project
- disabled if neither local nor external demo support exists

For local demo-enabled projects, the button should:

- bring the user to the local demo panel
- show actual backend execution capability
- be labeled clearly as `Live Demo` or `Open Local Demo`

### Per-project page design

Each project detail page should contain:

- title and project description
- difficulty and category badges
- technology tags
- GitHub link
- live demo action button
- local sandbox playground panel when available
- navigation to previous and next projects

This satisfies the request for "different page for different projects." The project route is the page.

## Local demo UX

For a project with local demo metadata:

- the explorer should show the API playground panel
- the live demo button should be active
- the panel should call the local backend sandbox
- the panel should display live response status

For a project without local support:

- the explorer should still show project metadata
- the live demo button should be disabled
- the UI should explain that the local demo is not available yet

The code should not rely on stale captured demo response data.

## Implementation tasks

### Task 1: new local demo plan README

- add a new markdown file in `view-project/backend/backend-plan/`
- include local-first design, architecture, user flows, and developer steps
- keep the file focused on local demo first and hosted demo second
- include project metadata expectations, sandbox contract, and UI behavior

### Task 2: frontend local demo page behavior

- derive local demo availability from `demo.json` presence
- show the live demo panel only when local metadata exists
- make the live demo button scroll to the demo panel when local support exists
- keep external live demo links optional
- preserve project-by-project detail routing

### Task 3: backend sandbox contract

- confirm the demo backend route supports per-project execution
- ensure the sandbox loader maps project slugs correctly
- validate request matching and route param support
- produce clear backend error responses for unsupported endpoints

### Task 4: demo contract validation

- validate `demo.json` schema in the frontend
- ensure `demo.json` files have required endpoint properties
- throw user-friendly errors on invalid demo contracts
- add sanity checks for missing `demo.json` files

### Task 5: developer flow and testing

- document how to run the local backend
- document how to run the frontend explorer
- document how to add a new local demo project
- include test commands for the live demo flow

## Local developer workflow

### Step 1: install dependencies

```bash
cd view-project/backend
npm install
cd ../frontend
npm install
```

### Step 2: configure the backend

Create `.env` in `view-project/backend` with:

```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017
ALLOWED_ORIGIN=http://localhost:5173
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=30
```

### Step 3: start the backend sandbox

```bash
cd view-project/backend
npm run dev
```

### Step 4: start the frontend explorer

```bash
cd view-project/frontend
npm run dev
```

### Step 5: open a local demo page

- visit `http://localhost:5173`
- select a project with local demo support
- click the `Live Demo` button or scroll to the API playground

## Project onboarding process

To add local demo support for a new project:

1. add the project to `project-manifest.json`
2. add `project-XX-name/demo.json`
3. add `view-project/backend/api/sandbox/projects/<slug>/index.js` if execution is required
4. validate the demo file with the frontend helpers
5. verify the project page renders local demo controls
6. run the local backend and frontend to confirm end-to-end behavior

## Branch workflow

Use the branch structure already described in the repository:

- `main` — stable production-ready code
- `api-playground` — integrated local explorer platform
- feature branches — created from `api-playground`

Merge local demo work into `api-playground` first.
Only merge into `main` after the local demo flow is stable and tested.

## Local demo page mechanics

The project page route should be a unique page for each project.
For example:

- `http://localhost:5173/project/blog-api`
- `http://localhost:5173/project/url-shortener-api`

The page should present:

- project identity
- demo availability
- live backend execution controls

If the user arrives from a list or search result, the route should still be a separate page.
The current `ProjectDetail` component is the project page.

## Local backend call flow

When the frontend executes a demo request:

1. the user clicks `Run Request`
2. the frontend sends a `POST` to `http://localhost:3001/api/demo/<project>`
3. the backend sandbox matches the request to a handler
4. the handler executes against project-specific data
5. the backend returns JSON to the frontend
6. the frontend renders response status and body

This flow is the local-first live demo path.

## Backend sandbox handler expectations

Each handler should:

- accept a payload object
- accept a scoped `db` instance
- return `{ status, body }`
- avoid mutating global state
- store data in the per-project database when necessary

The backend sandbox itself should:

- inject route params into handler invocation
- measure execution time for debugging
- return meaningful error metadata during development

## Local demo validation requirements

The frontend should validate:

- `demo.json` contains `baseUrl`
- `demo.json.endpoints` is an array
- each endpoint contains `method`, `path`, `description`, `responseStatus`, and `responseBody`
- request bodies are either objects or null

If validation fails, the explorer should log errors and avoid crashing the whole app.

## What the live demo button should do locally

When a local demo exists:

- the button should not link to a fake external URL
- it should open or reveal the local live playground
- it should set user expectations clearly

When no local demo exists and there is no external hosted URL:

- the button should be disabled
- the UI should explain that the local demo is pending

If there is a valid external demo URL:

- the button should still open the hosted demo in a new tab
- this should be a secondary path, not the primary local-first path

## UI rules for local demo state

The explorer should support these states:

- `liveLocal` — local demo metadata exists and sandbox is available
- `liveExternal` — external hosted demo URL exists
- `noDemo` — neither local nor external demo support exists

The button and panel behavior should reflect those states.

## Future hosted extension strategy

Phase 1: local-first implementation.
Phase 2: add hosted support using the same manifest and project contract.
Phase 3: allow projects to declare a hosted `liveDemo` URL alongside local demo support.

The hosted extension should not change the local sandbox architecture.
Instead it should build on top of it.

## Monitoring and experience

The local demo experience should provide clear feedback:

- show when sandbox backend is unavailable
- show when demo files are missing
- show when a requested endpoint is not supported
- show execution time and response status

A good local developer experience is the most important goal here.

## Documentation and contributor guidance

This document is the single source of truth for local demo implementation.
Contributors should reference it when:

- adding a new demo project
- updating the sandbox backend
- changing the project manifest
- improving the frontend explorer UI

## Practical file checklist

The implementation should be reflected in these files:

- `view-project/backend/backend-plan/local-live-demo-plan.md`
- `project-manifest.json`
- `project-*/demo.json`
- `view-project/backend/api/sandbox/registry.js`
- `view-project/backend/api/controllers/demoController.js`
- `view-project/frontend/src/App.jsx`
- `view-project/frontend/src/components/projects/ProjectDetail.jsx`
- `view-project/frontend/src/components/projects/ProjectDemoPanel.jsx`
- `view-project/frontend/src/hooks/useProjectDemo.js`
- `view-project/frontend/src/utils/validateProjects.js`
- `view-project/frontend/src/utils/validateDemoFiles.js`

## Testing checklist

A working local implementation should satisfy:

- backend sandbox starts successfully
- frontend explorer starts successfully
- selecting a project page works
- the live demo button is active for demo-enabled projects
- the demo panel renders when `demo.json` exists
- the demo backend receives requests and returns JSON

## Local first constraints

The local-first plan intentionally defers hosted deployment.
This means:

- external `liveDemo` URLs are not required for local demo support
- local `demo.json` contracts are the primary source of live demo behavior
- the local sandbox backend is the primary runtime for the explorer

## Error handling guidance

For local demo execution, the backend should return:

- `404` when the project is not sandbox-enabled
- `404` when the endpoint is unknown
- `500` when the handler throws
- consistent JSON error messages

The frontend should display these errors clearly in the demo panel.

## Local-first success criteria

This plan will be successful when:

- the explorer uses real local backend behavior for at least one project
- the project page shows a specific live demo experience
- the live demo button is meaningful and not just cosmetic
- the UI no longer relies on stale captured responses
- the local sandbox architecture can be extended to additional projects

## Incremental implementation path

The initial implementation should focus on:

1. validating the demo contract for existing demo files
2. making the local live demo button work for supported projects
3. making the project detail page a real page for each project
4. making the backend sandbox route execute demo calls
5. documenting the local-first workflow clearly

Later, the team can add more demo data and hosted URLs.

## Branch and merge guidance

Use the feature branch model:

- create feature branches from `api-playground`
- keep local demo work isolated in a feature branch
- merge into `api-playground` for testing
- merge into `main` only after local demo is stable

This preserves the open source branch strategy already described in the repository.

## Local demo readiness criteria

A project is local-demo-ready when:

- it has a valid `project-*/demo.json`
- it has a backend sandbox handler if execution is required
- it is included in `project-manifest.json`
- the frontend renders its demo panel
- the demo endpoint can be executed through the sandbox backend

## Developer onboarding notes

New contributors should be able to:

- read this plan
- add a new project from scratch
- create a `demo.json`
- add backend sandbox support if needed
- run the local explorer end-to-end

## Summary

This local live demo plan is the foundation for a real local-first explorer.
It is not a wishlist.
It is a practical implementation path.

The first phase is local only.
The second phase will add hosted URLs once the local path is stable.

The project page must be the per-project page.
The local demo button must be meaningful.
The live demo panel must use actual backend execution.

This plan provides the architecture, contract, and implementation checklist to make that happen.
