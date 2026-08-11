# Local API Workspace

This repository now includes a dedicated local API workspace in `api-workspace/` for exploring and testing each backend project in `project-*` from a developer-focused perspective.

## What it is

- A local explorer UI that loads per-project `project-page.json` metadata.
- A backend API runner that proxies requests from the explorer to each project backend.
- A frontend project preview area for apps that include a local `frontendConfig`.
- A dark mode theme and a more polished workspace experience for developer testing.

## How to use it

1. Start the project servers you want to explore.
   - Each `project-*` folder typically has a `server.js` and may require a separate terminal.
   - Example: `cd project-01-blog-api && npm install && npm start`

2. Start the workspace.
   - From the root workspace:
     - `cd api-workspace`
     - `npm install`
     - `npm run start`
     - `npm run dev`

3. Open the workspace in your browser at `http://localhost:5174`.
   - The app should show a list of local project endpoints.
   - Select an endpoint, edit the request body, and send the request through the proxy.

If you also want the explorer-style app, use `view-project/`.

## Why this exists

This workspace is designed for contributors who want to:

- run real backend requests without mock/demo data
- browse configured project metadata in a local explorer
- interact with API endpoints in a single, consistent UI
- verify project behavior across both backend and frontend contexts

## Adding a new local project page

Create a `project-page.json` file in the corresponding project folder.

Example:

```json
{
  "title": "Blog API",
  "description": "A local backend for managing blog posts and comments.",
  "backendConfig": {
    "baseUrl": "http://localhost:3000",
    "calls": [
      {
        "method": "GET",
        "path": "/posts",
        "description": "List all blog posts"
      }
    ]
  },
  "frontendConfig": {
    "previewUrl": "http://localhost:3000"
  }
}
```

## Recommended workflow for contributors

- Keep backend projects running locally on stable ports.
- Add `project-page.json` metadata for each project you want surfaced in the explorer.
- Avoid demo fallback behavior; the explorer should show only configured local pages.
- Use the dark mode toggle for minimal and comfortable coding sessions.

## Notes

- The explorer backend proxy is located in `view-project/backend/api`.
- The frontend explorer is in `view-project/frontend`.
- If a project has no `project-page.json`, it will show a placeholder that explains how to add one.
