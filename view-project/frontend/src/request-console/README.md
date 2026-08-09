# Request Console

## What this is
`request-console` is a self-contained, in-browser HTTP request client that replaces
`ProjectApiRunner` inside the project page explorer. It is built to the same
functional standard as a general-purpose API client: multiple request tabs,
editable method/URL/params/headers/auth/body, environments with variable
substitution, a response inspector, request history, saved requests, and a
request/response console log.

It is a first-party module of `100-backend-projects`. It does not wrap, embed,
or reference any third-party API client — everything here is our own
implementation, built against the existing `/api/project-request` proxy in
`view-project/backend`.

## Why it exists
`ProjectApiRunner` (the previous implementation) could only replay the fixed
list of calls defined in each project's `project-page.json`. Learners could
edit a JSON body but nothing else — no custom headers, no query params, no
auth, no environments, no history. That's enough to demo an endpoint, but not
enough to actually explore an API the way you would against any real backend
project in this repo.

This module turns the "Backend Runner" panel into a real request-building
workspace so learners can:
- construct arbitrary requests against any project's endpoints, not just the
  seeded examples
- reuse values (base URLs, tokens, ids) across requests via environments
- inspect exactly what came back — status, timing, size, headers, cookies
- keep a request open across page interactions instead of losing state per click
- save requests they want to return to, and see what they've already run

## Directory layout
```
request-console/
├── README.md                     — this file
├── index.js                      — public entry point (barrel export)
├── RequestConsole.jsx            — top-level orchestrator component
├── constants.js                  — method colors, tab ids, body modes
├── styles.css                    — module-scoped styles (imported by RequestConsole)
├── components/
│   ├── CollectionSidebar.jsx     — Saved requests + History, scoped to one project
│   ├── TabBar.jsx                — open request tabs, dirty indicator, new tab
│   ├── EnvironmentBar.jsx        — environment selector + inline variable editor
│   ├── UrlBar.jsx                — method select, URL input, Send, Save
│   ├── RequestPanel.jsx          — Params / Auth / Headers / Body / Scripts / Tests / Settings
│   ├── ParamsEditor.jsx          — query string key/value editor
│   ├── HeadersEditor.jsx         — header key/value editor
│   ├── AuthEditor.jsx            — none / bearer token / basic auth
│   ├── BodyEditor.jsx            — none / raw (json|text) / x-www-form-urlencoded
│   ├── ScriptsEditor.jsx         — pre-request variable assignments + response assertions
│   ├── SettingsEditor.jsx        — per-request timeout, redirect handling
│   ├── ResponsePanel.jsx         — status/time/size, Body(Pretty/Raw/Preview)/Cookies/Headers/Tests
│   ├── ConsoleLog.jsx            — collapsible send/receive log, newest first
│   ├── KeyValueTable.jsx         — shared editable table used by params/headers/form body
│   └── SplitPane.jsx             — generic vertical resizable split, ratio persisted
├── hooks/
│   ├── useRequestTabs.js         — tab collection, active tab, seeding from project-page.json
│   ├── useEnvironments.js        — environment CRUD + active environment
│   ├── useSavedRequests.js       — per-project saved request collection
│   ├── useRequestHistory.js      — per-project send history, capped
│   ├── useConsoleLog.js          — console log entries
│   └── useSendRequest.js         — builds + sends a request, runs assertions, returns a result
└── utils/
    ├── id.js                     — id generation
    ├── interpolate.js            — {{variable}} substitution against active environment
    ├── buildUrl.js               — resolves variables + merges enabled params into a URL
    ├── shareableCommand.js       — renders a request as a copyable shell command
    └── testRunner.js             — safe assertion DSL evaluator (no eval / no Function())
```

## State model
A **request tab** is the unit of work:
```js
{
  id, name, method, url,
  params: [{ id, key, value, description, enabled }],
  headers: [{ id, key, value, description, enabled }],
  auth: { type: 'none' | 'bearer' | 'basic', token, username, password },
  bodyMode: 'none' | 'raw-json' | 'raw-text' | 'form-urlencoded',
  bodyRaw: string,
  formBody: [{ id, key, value, enabled }],
  preRequestScript: string,   // "set name = value" lines, see Scripts below
  testScript: string,         // assertion lines, see Scripts below
  settings: { timeoutMs, followRedirects },
  isDirty: boolean,
  savedRequestId: string | null,
  response: ResponseResult | null,
}
```

Tabs, environments, saved requests, and history are persisted to
`localStorage` under a namespaced key
(`request-console:<kind>:<projectKey>` for per-project data, plain
`request-console:environments` for environments, which are global — the same
way a real client keeps environments independent of any single collection).
This is a deliberate choice to avoid adding a database or server-side storage
for what is inherently per-learner, disposable state — consistent with the
low-cost, local-first posture in `WORKFLOW.md`.

## Scripts: pre-request and tests, without `eval`
Executing arbitrary user-authored JavaScript against a live page (even a local
one) is an unforced security risk and adds a sandboxing problem we don't need
to solve for what this panel actually has to do. Instead of `eval` /
`new Function()`, both script fields use small, explicit line-based DSLs:

**Pre-request** — one variable assignment per line, evaluated against the
active environment before the request is built:
```
set userId = 42
set token = abc123
```

**Tests** — one assertion per line, evaluated against the response after it
comes back:
```
status == 200
status != 500
responseTime < 800
header[content-type] contains json
body.token exists
body.user.email == amit@example.com
```

`utils/testRunner.js` parses and evaluates these directly — no dynamic code
execution. This covers the assertions learners actually need (status, timing,
header presence, body shape) without opening up arbitrary script execution.

## Known, intentional scope boundaries
Written down explicitly rather than silently missing:
- **No multipart/binary file upload body.** Supporting real multipart bodies
  (file inputs, streaming, size limits) is a meaningfully larger feature and
  wasn't part of what any project in this repo needs today. `form-urlencoded`
  and raw JSON/text cover every existing project's `demo.json`/`project-page.json`
  request shapes.
- **No cloud sync.** Saved requests, history, and environments are local to
  the browser. Nothing here talks to a database — see `IMPLEMENTATION_PLAN.md`
  Phase 2.3 if that's ever wanted for the platform generally.
- **No arbitrary pre-request/test scripting.** See above — this is a
  deliberate security and complexity trade-off, not an oversight.

## Wiring it in
`ProjectPageRenderer.jsx` renders `<RequestConsole backendConfig={backendConfig} projectKey={project.slug} />`
in place of the old `<ProjectApiRunner backendConfig={backendConfig} />`. The
`backendConfig.calls` array is used once, to seed the first set of tabs the
first time a learner opens a given project — after that, tab state is driven
entirely by `useRequestTabs`.

## Backend contract
`view-project/backend/api/routes/projectRequest.js` was extended (not
replaced) to accept, in addition to the existing `baseUrl` / `method` / `path`
/ `requestBody`:
- `headers` — object, forwarded as request headers
- `params` — object, appended to the URL query string
- `bodyMode` — `'none' | 'raw-json' | 'raw-text' | 'form-urlencoded'`, controls
  how `requestBody` is serialized and what `Content-Type` is sent
- `timeoutMs` — optional, aborts the upstream request via `AbortSignal.timeout`

The response envelope gained `headers` (already added) and `setCookies`
(parsed from any `set-cookie` response header) so the response panel's
Headers and Cookies tabs have something real to show.
