# Projects Guide

## Purpose
This document defines how the 51 backend projects should be presented, managed, and extended.
Each project is a service and should be treated as an independent learning unit.

## The service mindset
Each `project-XX-*` folder represents a backend service, not just playground code.
As services, they should:
- expose clear API endpoints
- document their contract
- optionally expose health and metrics
- be runnable independently
- be safe to inspect and modify

## Project metadata contract
Every project should provide these artifacts:
- `demo.json` — example endpoints and request/response pairs
- `README.md` — purpose, tech stack, startup, API examples
- `project-manifest.json` or central manifest entry — title, slug, category, difficulty, live support status
- `server.js` or equivalent entrypoint
- `routes/`, `models/`, `middleware/` as needed

## Minimum project structure
Use a consistent pattern across services:
```
project-XX-name/
├── server.js
├── README.md
├── demo.json
├── routes/
├── models/
├── middleware/
└── utils/
```

This consistency is essential when 51 services exist because it makes discovery, onboarding, and automation easier.

## Categories and organization
Group services by category so users can find them quickly.
Example categories:
- Authentication
- CRUD / Data
- Realtime / WebSocket
- Performance / Cache
- Integrations / Webhooks
- AI / Machine Learning

Use categories in the manifest to power filtering in the explorer UI.

## What each project should document
A `README.md` inside each project should include:
- project goal and learning objective
- required environment variables
- startup command
- database requirements
- API endpoint examples
- special behavior (WebSocket, webhook, external APIs)

## Demo metadata and live support
`demo.json` files are the contract between service and explorer.
Each file must include:
- `baseUrl`
- `endpoints` array
- example requestBody / responseBody
- response status and timing hints
- optional `websocket` or `webhook` flags

A sample endpoint entry:
```json
{
  "method": "POST",
  "path": "/api/auth/login",
  "description": "Authenticate a user and return a JWT.",
  "requestBody": { "email": "user@example.com", "password": "secret" },
  "responseStatus": 200,
  "responseBody": { "token": "..." },
  "responseTimeMs": 120
}
```

## Managing 51 services on a budget
### Chosen solution
Do not assume all 51 services must be hosted live simultaneously.
Instead:
- maintain a live catalog of all 51 services
- support a small set of hosted live demos
- keep the rest available for local execution

### Why this is the right choice
- minimizes hosting and operational cost
- preserves the live learning experience
- allows learners to run full services locally
- avoids overbuilding the production platform

## Contribution process for projects
When adding a new service:
1. Create `project-XX-name/` folder.
2. Add `server.js`, `README.md`, and `demo.json`.
3. Add a manifest entry in the root manifest file.
4. Add front-end metadata if necessary.
5. Validate with local startup and `npm run lint`.
6. Open a PR with documentation and tests.

## Quality control tasks
- trust the manifest rather than the folder list alone
- audit every `demo.json` file with schema validation
- ensure every service has a health endpoint
- keep dependencies minimal and aligned with the platform Node version
- remove stale or duplicate utility code
