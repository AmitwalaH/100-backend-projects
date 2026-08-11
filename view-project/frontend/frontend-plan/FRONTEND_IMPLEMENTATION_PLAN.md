# Frontend Preview

## Problem

Every `project-XX-*` folder that has a `public/` directory (static HTML/CSS/JS
served by that project's own `server.js`) currently has no in-platform way to
see what it actually looks like. The explorer's "Frontend Preview" link just
opens `frontendConfig.url` in a new tab — useful, but it leaves the learner
entirely outside the platform, and it only supports a single fixed page even
when a project has several (e.g. `project-01-blog-api/public/` has
`index.html`, `register.html`, and `dashboard.html`).

We want an embedded preview: see the project's actual rendered frontend
without leaving the request console, the same way the Backend Runner lets you
exercise the project's API without leaving the page.

## Why this isn't as simple as "just add an iframe"

Three real constraints, not hypothetical ones:

1. **These are local dev servers, not hosted apps.** A project's frontend
   only exists at `http://localhost:<port>` while someone has run
   `npm start` in that project's folder. The platform itself may be opened
   from `https://` (a deployed explorer) or `http://localhost:5173` (dev).
   Either way, most of the time nothing will be listening on the target port,
   and the preview has to degrade gracefully instead of showing a blank
   iframe or a browser error page.
2. **Safari does not exempt localhost from mixed-content blocking.** Chrome,
   Firefox, and Edge do (confirmed via the W3C mixed-content spec discussion
   and MDN); Safari will silently block an `http://localhost` iframe on an
   `https://` page. The preview has to detect this and say so, not fail
   silently.
3. **We are not going to run 51 projects' worth of live hosted backends.**
   `PROJECTS.md` already made this call for the request console ("maintain a
   live catalog... support a small set of hosted live demos... keep the rest
   available for local execution") and the same reasoning applies here. A
   CodeSandbox/StackBlitz-style always-on hosted preview is real engineering
   effort solving a problem we don't have money or need for.

## Solution

An iframe-based preview, embedded in the request console's own layout,
scoped to whichever project page you're on — with an explicit reachability
check before rendering, and a clear, actionable message when nothing's
running, instead of a blank box.

### Why an iframe and not a proxy that fetches/rewrites the HTML

Considered and rejected: have `view-project/backend` fetch the project's
HTML/CSS/JS and re-serve it same-origin (rewriting relative asset and `fetch`
URLs as it goes). This is what a "real" reverse-proxy dev-server integration
would do, and it's how you'd solve this if the goal were zero user-visible
localhost URLs. It was rejected because:

- It requires rewriting every relative `fetch()` call inside each project's
  own client-side JS to point back through our proxy — fragile per-project,
  and breaks the moment a project uses an absolute URL, a `fetch` inside a
  dynamically-loaded script, a WebSocket, or `FormData` uploads.
  Direct-iframe doesn't have this problem: the project's JS talks to its own
  origin exactly as it was written to.
- It's solving the "hide localhost from the user" problem, which we don't
  have — the request console already shows raw `localhost` URLs everywhere
  (base URLs, the command-line export, etc.), so there's no consistency
  argument for hiding it here specifically.
- No isolation benefit: origins are already separated by port, so
  same-origin-policy protection is already in place without a proxy.

### Why we don't need CodeSandbox/StackBlitz-style sandboxing

Their hard problem is running _arbitrary, untrusted, third-party_ code
safely at scale, which is why they pay for per-session containers or ship a
WASM-based Node runtime behind randomized subdomains. Every project here is
first-party, reviewed-via-PR, checked into this repo. The thing we actually
need — not letting the previewed page read our platform's cookies/localStorage
— is already provided for free by the browser, because `localhost:3001` and
`localhost:5173` are different origins. Building subdomain-per-project
infrastructure to re-solve an already-solved problem would be the
over-engineering `PROJECTS.md` and `WORKFLOW.md` explicitly warn against.

## Implementation plan

### 1. Data: extend `project-page.json`, don't replace it

`frontendConfig` currently supports a single `url`. Add an optional `pages`
array alongside it — additive, not a breaking change, and every existing
`frontendConfig.url` keeps working untouched as a fallback:

```json
{
  "frontendConfig": {
    "url": "http://localhost:3000",
    "pages": [
      { "label": "Home", "path": "/index.html" },
      { "label": "Register", "path": "/register.html" },
      { "label": "Dashboard", "path": "/dashboard.html" }
    ]
  }
}
```

`path` resolves against `backendConfig.baseUrl` when the frontend is served
by the same Express app as the API (true for every project we've seen so
far, since `server.js` does both) — no second base URL to configure, no new
field to keep in sync. A project with a genuinely separate frontend server
can still set `frontendConfig.url` as its own base and omit `pages`, and
we'll fall back to the single-link behavior that already works today.

### 2. Reachability check before rendering anything

Before mounting the iframe, run `fetch(pageUrl, { mode: 'no-cors' })`:
resolves → render the iframe; rejects → show a "not running" state with the
exact `cd project-01-blog-api && npm install && npm start` command, matching
the tone the Backend Runner already uses when a request fails. Poll on a low
frequency (e.g. every 4s while unreachable) so the panel recovers on its own
the moment the learner starts the server — no manual refresh needed.

### 3. Browser-capability gate

Detect Safari specifically (or more precisely: attempt the reachability
fetch and treat a same-shape failure differently — see open question below)
and show "this browser blocks local previews over a secure connection; open
in a new tab instead" rather than a misleading "not running" message when
the real cause is the browser, not the missing server.

### 4. Page picker + iframe, inside the existing layout

A small tab strip (reusing the same visual pattern as the request tabs) for
`pages`, each rendering the same iframe element with `src` swapped — not a
new iframe per page, to avoid re-triggering the reachability check
unnecessarily on every tab switch.

### 5. What we are explicitly not building right now

- No proxy/rewrite layer (see rejected alternative above).
- No hosted/always-on preview infrastructure for projects without a running
  local server — a link to `README.md`'s existing "how to run" instructions
  is the correct fallback, not a cloud container.
- No iframe `sandbox` attribute restricting scripts — the isolation we need
  is already provided by cross-origin SOP, and an overly-restrictive sandbox
  would just break projects that rely on `fetch`, forms, or `localStorage`
  for auth tokens, for no real security gain.

## Open question before I write code

Detecting "Safari blocking this" versus "server not running" from JS alone
is unreliable — both can present as a failed/blocked load with no
distinguishing signal. Simplest honest option: skip trying to distinguish
them, and always show the reachability-failure message with both a retry
and an explicit "open in new tab" escape hatch — new-tab navigation isn't
subject to the iframe mixed-content restriction, so it works regardless of
which cause it actually was. I'd rather ship the simpler, always-correct
version than a "smart" detection that's sometimes wrong.
