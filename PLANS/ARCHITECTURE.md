# Architecture Overview

## Purpose
This document describes the architecture of `100-backend-projects` as a platform of independent backend services and a live explorer.
It is written from a senior-engineer perspective: choose one practical architecture, explain tradeoffs, and deliver a cost-aware solution.

## Core architecture
The repository is best modeled as a mini microservice platform.
Each project folder is a separate service with its own API surface.
The platform has two main runtime layers:

1. **Project services**
   - Each of the 51 projects is a standalone backend service.
   - Examples include auth, CRUD, real-time chat, caching, scheduler, webhook handlers, and AI helpers.

2. **Explorer layer**
   - `view-project/frontend` is the UI for discovering and exercising projects.
   - `view-project/backend` is a gateway/sandbox for executing requests and returning live data.

## Service model and categories
Treat each project as one of these service types:
- HTTP REST service
- WebSocket / real-time service
- Worker / job processor service
- Integration service (webhooks, external API adapters)

Organize services by category and capability, for example:
- Auth/Users
- CRUD/Data
- Realtime/WebSockets
- Caching/Queue
- External API integrations
- AI / ML helpers

## Selected engineering approach
### Chosen solution: hybrid gateway + curated live execution
We evaluated multiple approaches and chose one balance between realism, cost, and maintainability:
- Do not run all 51 services in one hosted environment by default.
- Expose a curated set of live services through the explorer.
- Keep the remaining services runnable locally and discoverable with metadata.
- Use the explorer gateway to proxy live requests for supported services.

This is the engineering decision that fits the repo constraints:
- no budget for large cloud infrastructure
- many independent services with diverse tech requirements
- need to preserve the learning experience

### Why not full-service production for all 51 services?
A full production deployment of 51 independent hosted services would require significant infrastructure and operational cost.
Instead, we use a mixed model:
- front-end discovery and manifest-driven service catalog are fully hosted/static
- live execution is available for a small, curated set of services
- local dev allows learners to run the other services themselves

## Component responsibilities
### Root repository
- holds 51 project folders
- stores shared documentation, manifest, and contribution rules
- provides a single entry point for developers

### `view-project/frontend`
- renders project catalog and demo panel
- reads service metadata from `projects.json` and project `demo.json`
- issues live requests through the explorer gateway

### `view-project/backend`
- handles live demo request execution
- optionally proxies requests to running project services
- supports WebSocket and HTTP route testing
- isolates example databases per project

## Data and isolation
### Database strategy
For each project that uses persistence:
- use a separate MongoDB database or collection prefix
- use a separate Redis namespace or logical DB index
- avoid sharing production data across unrelated demos

### Sandbox isolation
- the live gateway must never expose raw admin or secret routes
- only defined demo endpoints should be accessible
- use a registry of approved sandbox handlers for safety

## Observability and reliability
Essential platform requirements:
- health endpoints for each live service
- request logging and response timing
- centralized error handling in the explorer gateway
- lightweight metrics for active demo usage

## Decision rationale
### Engineering principles used
- **Pragmatism over perfection**: choose a design that works with zero infrastructure budget.
- **Isolation over convenience**: each project service remains independent.
- **Shared metadata over duplication**: one manifest drives both UI and runtime.
- **Live experience over demo-only output**: real requests are the priority, but limited by cost.

## Practical tasks for this architecture
- Standardize every project with a manifest entry, health endpoint, and `demo.json`.
- Build a service registry for live supported services.
- Implement a proxy/gateway in `view-project/backend`.
- Add WebSocket support for real-time services.
- Add webhook examples and validation for integration services.
- Keep deployment simple by using static hosting and free-tier backend hosting.

## Future architecture improvements
These are the next valid engineering upgrades:
- shared utility package for common middleware and config
- containerized local environment using Docker Compose
- automated service startup for local dev
- optional dynamic service registry for runtime discovery
- improved API documentation via OpenAPI/Swagger
