# View Project — Backend Learning Explorer

This folder contains the demo platform used to explore backend projects from the main repository.
It includes a React UI and a backend sandbox that can run example API requests for supported projects.

## What is inside
- `frontend/` — React + Vite UI for browsing backend projects.
- `backend/` — Express demo API that executes sandboxed requests and returns responses.

## How it works
### Frontend
The frontend reads `view-project/frontend/src/data/projects.json` for project metadata.
It also loads `demo.json` files from sibling `project-*/` folders to show request examples.

### Backend sandbox
The backend exposes:
- `GET /api/demo/projects` — list of live sandbox-enabled projects
- `POST /api/demo/:project` — execute an example endpoint for a given project

If a project does not have a live sandbox handler, the frontend falls back to captured demo responses.

## Running locally
### Start the demo backend
```bash
cd view-project/backend
npm install
npm run start
```

### Start the frontend explorer
```bash
cd view-project/frontend
npm install
npm run dev
```

### Configure deployment
To point the frontend to a deployed backend, set:
```bash
VITE_API_URL=https://your-deployed-demo-api.example.com
```

## Supported live sandbox projects
Live sandbox support is implemented inside `view-project/backend/api/sandbox/registry.js`.
Currently only a small number of projects are wired through this registry.

To add live sandbox coverage for a new project:
1. Create a new sandbox folder at `view-project/backend/api/sandbox/projects/<project-slug>/`.
2. Add an `index.js` file that exports handlers keyed by `METHOD path`.
3. Example slug: `view-project/backend/api/sandbox/projects/blog-api/index.js`.
4. The loader discovers sandbox folders automatically, so manual registry changes are not required.

## Demo file expectations
Each project using the frontend explorer should include a `demo.json` file at the repository root level, for example:
- `project-01-blog-api/demo.json`
- `project-07-url-shortener-api/demo.json`

This file should provide:
- `baseUrl`
- `endpoints` list with `method`, `path`, `description`, and example request/response data

## Notes and limitations
- The frontend currently defaults to `http://localhost:3001` when `VITE_API_URL` is not provided.
- The sandbox backend maintains a small MongoDB connection pool and uses namespaced databases per project.
- Not all projects currently support live execution, so some responses are captured examples.

## Recommended improvements
- Add `demo.json` for every project.
- Add live sandbox handlers for projects with data models.
- Validate `demo.json` schema with a CI step.
- Make frontend project list generation dynamic instead of hard-coded.
- Add a shared `project-manifest.json` for both the explorer UI and repo metadata.

This README is meant to document the current explorer platform and guide future improvements.