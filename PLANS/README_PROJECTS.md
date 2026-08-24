# 100 Backend Projects Explorer

## Overview
This repository is a local developer explorer for the `100-backend-projects` collection. It is designed to let you inspect and run backend projects locally while also showing a frontend preview when available.

## What we are building
- A central React-based explorer UI (`view-project/frontend`) for browsing backend projects.
- A local project page for each configured project.
- A backend runner panel that behaves like a request runner for local project endpoints.
- A frontend preview panel that links to the running project UI.
- A repository structure document to help future developers and AI understand the project.

## Project Structure

### Root
- `package.json`: root scripts for starting any project by alias.
- `project-manifest.json`: metadata for all 100 projects.
- `README_PROJECTS.md`: this project guide.

### Explorer
- `view-project/frontend/`: React app and explorer UI.
  - `src/App.jsx`: router and page shell.
  - `src/components/projects/ProjectPage.jsx`: local project page.
  - `src/components/projects/ProjectPageRenderer.jsx`: backend/frontend panel renderer.
  - `src/components/projects/ProjectApiRunner.jsx`: API runner.
  - `src/hooks/useProjectPageConfig.js`: loads `project-page.json` from each project folder.
  - `src/index.css`: explorer UI styling.
- `view-project/backend/`: proxy backend for explorer features.
  - `api/app.js`: register routes including `/api/project-request`.
  - `api/routes/projectConfig.js`: project page config API.
  - `api/routes/projectRequest.js`: proxy local backend requests.

### Individual project folders
Each project may include:
- `server.js`: local project backend server.
- `project-page.json`: explorer page definition.
- `project-backend-config.json`: optional backend request definitions.
- `public/`: static frontend preview assets.
- `routes/`, `models/`, other project logic.

## Current status
- Explorer frontend builds successfully.
- Local project page config system uses `project-page.json`.
- `project-01-blog-api` and `project-02-products-api` have working sample page configs.
- `ProjectPage` now displays:
  - title, description, difficulty, category
  - visual summary cards
  - backend runner panel
  - frontend preview panel
- Demo fallback data has been removed from the new project page flow.

## Implementation plan
1. Use actual `project-page.json` files instead of `demo.json`.
2. Load config via `useProjectPageConfig` by matching project folder names.
3. Render two panels for each project page:
   - Backend panel: API runner with endpoint actions.
   - Frontend panel: preview description and open link.
4. Avoid fallback demo sandbox usage on the project page.
5. Keep page config extensible without hard-coded routes.

## Important design principles
- Keep the implementation simple, not over-engineered.
- Avoid hard-coded values whenever possible.
- Use actual backend URLs from `project-page.json`.
- Prefer local-first behavior for development.
- Make the page work in production, not just dev mode.
- Consider scaling, maintainability, and security.

## Before writing code
- Search the internet and Reddit for how large teams build developer portal UX and integrated API playgrounds.
- Think through the implementation plan before applying code changes.
- Work as a senior engineer: solve architecture, data flow, and UX issues, not just write code.

## How to run
### Explorer
```powershell
cd d:\Amit\100-backend-projects\view-project\frontend
npm install
npm run dev
```

### Explorer backend
```powershell
cd d:\Amit\100-backend-projects\view-project\backend
npm install
npm start
```

### Sample project servers
```powershell
cd d:\Amit\100-backend-projects
npm run start:p1
npm run start:p2
```

## Notes
- If a project has `project-page.json`, it should render the explorer page.
- If a project does not have `project-page.json`, the explorer will note that the page is not configured yet.
- The API runner uses a backend proxy route to avoid CORS and unify the request flow.
