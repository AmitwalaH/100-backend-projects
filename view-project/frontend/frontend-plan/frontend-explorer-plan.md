# Frontend Explorer Plan

## Purpose

This plan documents the React + Vite explorer UI for the 100 Backend Projects repository.
The explorer should present real project metadata and support live API interaction using the actual backend project folders.

## Current design

- Explorer metadata is sourced from the root `project-manifest.json`.
- Live demo payloads are loaded from `project-*/demo.json` files in sibling folders.
- The frontend makes requests to the demo backend at `/api/demo/:project`.
- The explorer no longer relies on stale captured responses.

## Goals

- represent each backend project using a shared repository manifest
- drive the UI from a single source of truth rather than duplicated frontend JSON
- load project demo metadata from actual `project-*/demo.json` files
- keep frontend behavior aligned with the open source repo structure
- show live playground support only when demo metadata and backend integration exist

## Engineering plan

### 1. Use the root project manifest

- Load `project-manifest.json` at the repository root instead of `view-project/frontend/src/data/projects.json`.
- Keep `slug`, `github`, `liveDemo`, and `difficulty` metadata centrally maintained.
- Use the manifest across the explorer and documentation.

### 2. Use actual project demo metadata

- Use Vite `import.meta.glob` to read `project-*/demo.json` files.
- Match those demo files to project slugs using `project.slug` or the GitHub URL.
- Only render `ProjectDemoPanel` when a demo file exists for the selected project.

### 3. Remove captured fallback behavior

- If live demo execution fails, show a clear live-demo error instead of a captured example.
- This makes the explorer honest and encourages live demo coverage.
- Use UI messaging to explain that the project may need sandbox support or a running backend.

### 4. Keep hosted live links optional

- Keep `project.liveDemo` for externally deployed project endpoints.
- Use the explorer live panel for repository-local sandbox/demo integration.

## Implementation priorities

1. Finish manifest-first frontend wiring.
2. Update `ProjectDetail` and `ProjectDemoPanel` to depend on actual demo metadata.
3. Add `demo.json` schema validation in the explorer.
4. Document how contributors add demo support in `view-project/frontend/frontend-plan`.
5. Add CI checks for manifest/demo drift and missing demo schema.

## Contributor guide

To add a new project to the explorer:

1. Add the project to `project-manifest.json` with `slug`, metadata, `github`, and `liveDemo`.
2. Add `project-XX-name/demo.json` with example API payloads.
3. If live sandbox support is required, add `view-project/backend/api/sandbox/projects/<slug>/index.js`.
4. Validate the new demo file with the explorer's `validateDemoFiles` helper.
