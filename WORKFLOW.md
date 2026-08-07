# Workflow and Branching Strategy

## Purpose
This document defines how new work is created, tracked, branched, implemented, and merged.
It is written like a senior engineering team process, not an AI checklist.

## Core principles
- Keep each change small and focused.
- Always branch from `main`.
- Use issue-driven work before coding.
- Keep the platform sustainable with low-cost hosting and operations.
- Treat each project as a service and each task as a product improvement.

## Issue intake
### Use issue templates for clarity
Create issues with one of these types:
- `Feature` — new project, new explorer capability, new service integration
- `Bug` — broken startup, incorrect demo response, missing API contract
- `Chore` — documentation, cleanup, refactor, dependency updates

### Issue content
Each issue should include:
- Problem statement
- Goal and acceptance criteria
- Impact on learners or maintainers
- Related project/service
- Optional design notes for architecture-sensitive changes

## Branch naming
Use consistent branch names so the workflow stays predictable.
Example formats:
- `feature/<id>-<short-description>`
- `bugfix/<id>-<short-description>`
- `chore/<id>-<short-description>`
- `hotfix/<id>-<short-description>`
- `docs/<id>-<short-description>`

If you are not using issue numbers yet, use a short descriptive name:
- `feature/live-demo-proxy`
- `bugfix/project-38-startup`
- `docs/add-security-guide`

## Branch workflow
1. Create an issue first.
2. Branch from `main` to create a feature/task branch.
3. Keep the branch limited to one feature, bug, or documentation task.
4. Commit frequently with meaningful messages.
5. Merge feature branches into `api-playground` first.
6. After `api-playground` is reviewed and stable, merge `api-playground` into `main`.
7. Do not merge until CI passes and at least one review approves.

## Branch strategy
The repo uses a two-stage integration model:
- `main` is the stable production-ready branch.
- `api-playground` is the integration branch for backend platform and explorer changes.
- All feature and bugfix branches merge into `api-playground` first.
- `api-playground` is the only branch that merges into `main`.

This structure helps us validate grouped platform work before it reaches `main`.

## Task structure
For each new feature or service:
- add or update `project-manifest.json` or `projects.json`
- add or update `demo.json` for live explorer examples
- add or update the service/project `README.md`
- add tests or validation for the new behavior
- add documentation in `WORKFLOW.md`, `ARCHITECTURE.md`, or relevant doc files if the change is structural

## New feature guidelines
When adding a new feature:
- Ask: does this need a new service, a platform change, or a docs change?
- Choose the simplest implementation that meets the goal.
- Avoid over-engineering.
- If the feature affects live execution, prefer a small curated rollout rather than exposing everything at once.
- For real-time and WebSocket features, document the connection contract and any event emitters.

## Service and project tasks
There are 51 projects, and they should be treated as service units.
For new tasks on a project:
- identify the project service category (Auth, CRUD, Realtime, Integration, Performance)
- choose one delivery path: local-service or hosted live demo
- if the service is hosted live, include a sandbox or proxy implementation
- if the service is local-only, ensure the README explains how to run it

## Pull request expectations
A PR must include:
- Summary of what changed and why
- Issue reference or task context
- Testing steps
- Updated docs if the feature changed behavior
- Checklist of tasks completed

## Review standards
Reviewers should verify:
- the branch is correctly scoped
- no secrets were added
- code is consistent with the repo patterns
- documentation and metadata were updated
- the feature can be run locally or via the explorer when applicable

## Release planning
Because this repo is cost-sensitive:
- do not deploy every change automatically unless it is ready
- group platform improvements into small, reviewable batches
- label experimental live services clearly
- prefer static content and lightweight runtime services whenever possible

## Low-cost delivery mindset
To avoid spending money:
- use free-tier hosting for frontend and lightweight backend components
- keep most services local-run only unless there is a strong need for hosted demo support
- reuse existing infrastructure rather than introducing new hosted services
- document the difference between "live hosted demo" and "local runnable service"

## Summary
This workflow gives us structure like a large engineering team while remaining practical for an open source repo.
It is built around issue-driven branches, focused feature work, and a low-cost service model.