# Security Guide

## Purpose
This document captures the security requirements and tasks for the repo and demo platform.
It is written with the assumption that many developers and learners will use the platform.

## Core security rules
- never commit secrets or `.env` values
- keep all secrets in environment variables or secret stores
- treat the repo as public by default

## Secret management
- add `.env.example` with placeholders only
- ensure `.env` is ignored by Git
- use GitHub secret scanning and local auditing
- avoid hard-coded API keys, DB URLs, or passwords

## Application security
### Request handling
For each backend service and the explorer:
- validate all JSON payloads
- enforce strict input schemas
- sanitize user-provided values
- set request size limits

### API safety
- use CORS allowlists in production
- apply rate limiting on public endpoints
- do not expose internal or admin routes through the explorer
- require explicit registration for live sandbox endpoints

### Authentication and authorization
- use JWT or session secrets from env variables
- use bcrypt or similar for password hashing
- verify authorization on protected routes
- keep tokens and session secrets strong and non-default

## Sandbox and demo security
- only expose approved demo endpoints
- isolate project data in separate databases or namespaces
- do not reuse production data for demos
- log demo execution errors without leaking secrets

## WebSocket and webhook security
### WebSockets
- validate origin and connection metadata
- use namespaces or rooms to limit access
- avoid global broadcasts unless required
- close idle or abusive WebSocket connections

### Webhooks
- verify payload signatures where possible
- document expected webhook formats
- do not process untrusted webhook payloads without validation

## Open source operational security
- use dependency scanning tools like `npm audit`
- keep dependencies up to date within reason
- prefer mature, well-maintained libraries
- limit transitive dependency surface by removing unused packages

## Cost-aware security choices
Because this repo must remain low-cost:
- use open-source security libraries instead of paid scanners
- use GitHub Actions for audit automation
- use static analysis and manual review for new projects
- avoid paid runtime protection services unless necessary

## Recommended tasks
- add `SECURITY.md` to the repo index
- implement `npm audit` in CI
- add a GitHub workflow to reject commits containing secrets
- add project-level security checks for new services
- document security behavior in each project README

## Summary
Security is not optional, especially for a public learning platform.
Apply the simplest robust protections first: secrets handling, validation, sandbox isolation, and open-source audit tooling.
