# Deployment Guide

## Purpose
This document describes how to deploy the platform with zero or minimal infrastructure cost.
The focus is on practical, free-tier hosting and a sustainable operating model.

## Deployment goals
- keep the platform available for learners
- avoid paid cloud services when possible
- preserve live demo capabilities for core services
- make the frontend static and cheap to host
- keep all runtime configuration external to source code

## Recommended deployment model
### Static frontend
Host `view-project/frontend` as a static site.
Best low-cost options:
- GitHub Pages
- Vercel free tier
- Netlify free tier

### Backend explorer
Host `view-project/backend` as a lightweight Node.js app.
Recommended low-cost providers:
- Vercel Serverless / Functions
- Railway free plan
- Fly.io free tier
- Render free starter

### Project services
Because there are 51 services, the cost-aware strategy is:
- host a limited curated set of live demo services in production
- maintain the remaining services as local-run learning projects
- provide live execution only for the most valuable service set

This is a deliberate engineering decision. It preserves the platform without requiring large budgets.

## Data storage strategy
### MongoDB
- use MongoDB Atlas free tier if a managed DB is required
- otherwise, use local MongoDB for local development
- isolate each project by database name or collection prefix

### Redis
- use a single Redis free-tier instance with separate namespaces per service
- only enable Redis for services that actually need caching or pub/sub

## Deployment tasks
### Local developer deployment
- use `npm install` at root and inside `view-project/frontend` and `view-project/backend`
- run `npm run dev` in frontend
- run `npm start` in backend
- run specific project server with `npm run start:pXX` from root

### Production deployment
1. Build frontend:
   ```bash
   cd view-project/frontend
   npm run build
   ```
2. Deploy the static output to GitHub Pages or Vercel.
3. Deploy `view-project/backend` as a Node app.
4. Deploy the curated live service set if desired.

### CI / CD
Use GitHub Actions to automate:
- frontend build and lint
- backend build and lint
- `demo.json` schema validation
- `npm audit` or dependency checks
- optional deploy to staging on push to `develop`

## Cost-sensitive service selection
### Practical solution for 51 projects
Do not deploy all 51 services to a free host.
Instead:
- select 10-15 live demo-ready services
- publish them through the explorer gateway
- label the rest as "local-run only" or "learn locally"

### Why this is acceptable
- it keeps the platform usable without overspending
- learners still see all 51 projects in the catalog
- the live experience remains available for a meaningful subset
- future upgrades can unlock more services as budget allows

## Free-tier deployment rules
- use a single static site for the frontend
- reuse one backend host for explorer logic
- use only one or two managed DB instances
- do not run all projects simultaneously in hosted mode

## Future optimization ideas
- use Docker Compose for local full-stack testing
- add a lightweight edge cache for static demo assets
- use a single API gateway rather than many hosts
- implement a service onboarding checklist for hosted readiness
