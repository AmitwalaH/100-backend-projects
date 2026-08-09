# Local API Workspace

This folder contains a dedicated API testing workspace for the backend projects in this repo.

## What it is

- A React + Vite frontend that behaves like a lightweight request builder.
- A sidebar for selecting backend project endpoints.
- A request editor panel with live JSON editing.
- A response viewer with status, timing, and body details.
- A backend proxy server that forwards requests to local project servers.

## What you’ll see

- Project selector on the left.
- Endpoint list and request details in the middle.
- Request body editor and response panel on the right.
- The blog API (`project-01-blog-api`) is preconfigured as the default project.

## Run it locally

1. Start the backend project you want to test.
   - Example: `cd project-01-blog-api`
   - `npm install`
   - `npm start`

2. Start the workspace proxy.
   - `cd api-workspace`
   - `npm install`
   - `npm run start`

3. Start the workspace frontend.
   - `cd api-workspace`
   - `npm run dev`

4. Open the browser at `http://localhost:5174`

## How it works

- The frontend sends requests to `/api/project-request`.
- The proxy server in `backend/server.js` forwards those requests to the configured local backend URL.
- Responses are returned with status, text, headers, and parsed JSON if available.

## Add or update projects

- Edit `src/data/projectConfigs.js` to add new local project entries.
- Each config includes `slug`, `title`, `category`, `description`, and `backendConfig`.
- The workspace will render the new project automatically.

## Notes

- Keep local backend projects running on their configured ports.
- The default blog API expects `project-01-blog-api` on port `3000`.
- This workspace is intentionally separate from the explorer in `view-project`.
