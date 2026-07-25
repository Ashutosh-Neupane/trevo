# Trevo Frontend — Frappe Integration Status (implementation1.md)

## Frappe Frontend Architecture (reference)

> Reference = upstream Frappe v17.x style architecture (Python backend + built-in desk/website frontend).

### Backend framework / request routing
- **WSGI app** (`frappe/frappe/app.py`): initializes request, validates auth, and routes by path:
  - Requests starting with **`/api/`** go to `frappe.api.handle(request)`.
  - Non-`/api/` paths are served via page rendering.

### Hooks system
- Hooks are registered and executed via `frappe.get_hooks(...)` / `frappe.call(...)`.
- Common global hook categories in core codebases:
  - `before_request`, `after_request`
  - doctype events (`doc_events`)
  - session lifecycle events (e.g. login/logout)

### Doctype / ORM / controller layer
- Doctypes are implemented as document models in `frappe/model/*`.
- Runtime access is via helpers like:
  - `frappe.get_meta(doctype)`
  - `frappe.get_doc(doctype, name)`
  - permission checks: `doc.check_permission('read'|'write')`

### REST / RPC API layer
From **`frappe/frappe/api/v1.py`**:
- RPC-style method execution:
  - `POST /method/<path:method>` → sets `frappe.form_dict.cmd` and calls `frappe.handler.handle()`.
- REST-style resource CRUD:
  - `GET /resource/<doctype>` → list (`frappe.client.get_list`)
  - `POST /resource/<doctype>` → create (`frappe.new_doc(...).insert()`)
  - `GET /resource/<doctype>/<name>/` → read (`doc.check_permission('read')` + field-level read)
  - `PUT /resource/<doctype>/<name>/` → update (`doc.update()` + `doc.save()`)
  - `DELETE /resource/<doctype>/<name>/` → delete
  - `POST /resource/<doctype>/<name>/` → execute doc method (whitelist enforced via `doc.is_whitelisted(...)`)

### Build/asset pipeline
- Frappe bundles desk/website assets via its own internal asset pipeline.
- `trevo_frontend` does **not** replicate this pipeline; it integrates via BFF proxy endpoints.

### Key conventions (for integration)
- Auth/session is validated by `validate_auth()` in the WSGI layer.
- CSRF handling is tied into Frappe auth validation (exact enforcement details should be checked in `frappe/frappe/auth.py` when needed).
- Browser interaction pattern for this migration: browser → Next BFF → Frappe API.

## Current State of trevo_frontend

> Source of truth = `trevo-frontend/RECAP.md` plus targeted reads already performed.

### Framework
- **Next.js (App Router)** + **TypeScript** + **React**.
- Styling: Tailwind CSS.

### Folder layout (high level)
- `app/(auth)/*` — login UI.
- `app/(desk)/*` — protected desk routes.
- `app/api/*` — BFF/proxy routes.
- `lib/frappe/*` — integration layer (types, auth, server-side fetch).
- `lib/trevo-form/*` — form rendering/state management (partial).
- `components/*` — shell components (e.g. `TrevoShell`).

### Current integration capabilities (verified in RECAP + open tabs)
- Auth flow (BFF + cookie session)
  - `app/api/auth/login/route.ts`: proxies login to `/api/method/login`, then **re-issues** `sid` cookie for Next domain.
  - `app/api/auth/logout/route.ts`: proxies logout and clears `sid` on Next domain.
  - `app/api/auth/whoami/route.ts`: returns current user info (or null/guest).
  - `app/(desk)/desk/layout.tsx`: server-side guard calling `/api/auth/whoami` and redirecting to `/login`.
- Generic proxy
  - `app/api/frappe/[...path]/route.ts`: forwards HTTP methods to Frappe, forwards cookies, and forwards `Set-Cookie`.
- Doctype endpoints
  - `app/api/doctype/[doctype]/meta/route.ts`: fetches DocType meta via `resource/DocType/:doctype`.
  - `app/api/doctype/[doctype]/doc/route.ts`: list/create docs via REST `resource/:doctype`.
  - `app/api/doctype/[doctype]/docinfo/route.ts`: uses method `frappe.desk.form.load.get_doc_info`.
  - `app/api/doctype/[doctype]/save/route.ts`: saves docs via method `frappe.desk.form.save.savedocs`.
- Frontend modules present
  - `lib/frappe/auth.tsx`: `AuthProvider`/`useAuth`.
  - `components/TrevoShell.tsx`: top header + sidebar navigation + logout.
  - `lib/trevo-form/*`: renderer/store/bridge for doctype-driven form UIs (not fully verified end-to-end).

## Status Checklist

### ✅ Already Done
- ✅ BFF login proxy + `sid` re-issue
  - `trevo-frontend/app/api/auth/login/route.ts`
- ✅ BFF logout proxy
  - `trevo-frontend/app/api/auth/logout/route.ts`
- ✅ Whoami endpoint + desk route guard
  - `trevo-frontend/app/api/auth/whoami/route.ts`
  - `trevo-frontend/app/(desk)/desk/layout.tsx`
- ✅ Generic proxy for `/api/frappe/*`
  - `trevo-frontend/app/api/frappe/[...path]/route.ts`
- ✅ Doctype REST endpoints
  - `trevo-frontend/app/api/doctype/[doctype]/meta/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/doc/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/docinfo/route.ts`
- ✅ Save via `savedocs`
  - `trevo-frontend/app/api/doctype/[doctype]/save/route.ts`
- ✅ Client auth state integration skeleton
  - `trevo-frontend/lib/frappe/auth.tsx`
- ✅ Form module scaffolding exists
  - `trevo-frontend/lib/trevo-form/*`
- ✅ UI shell scaffolding exists
  - `trevo-frontend/components/TrevoShell.tsx`

### 🚧 In Progress / Partial
- 🚧 Global app wiring
  - `trevo-frontend/app/providers.tsx` (needs verification: QueryClientProvider/Toaster/etc.)
- 🚧 Desk shell UI integration coverage
  - Ensure all desk routes consistently use `TrevoShell`.
- 🚧 Workspace navigation renderer
  - Verify that workspace/shortcut data is implemented end-to-end.
- 🚧 List view parity
  - Confirm filters/pagination/table rendering behavior against Frappe.
- 🚧 Form view parity
  - Fieldtype coverage and child table editing completeness not yet verified.

### ❌ Not Started
- ❌ `middleware.ts` auth guard (route-level)
- ❌ Command palette
- ❌ Notifications panel / markRead UI
- ❌ Timeline/version diff UI
- ❌ Reports UI
- ❌ Full fieldtype parity (dynamic link, autocomplete, signature, rating, barcode, JSON, HTML editor vs text editor, etc.)

## Implementation Plan

> Ordered to close gaps between “Frappe desk capabilities” and “trevo_frontend current slice”.

1. Verify/finish global providers
   - Ensure TanStack Query + any UI providers are correctly wired in `app/providers.tsx`.
2. Add `middleware.ts` auth guard (route-level)
   - Redirect unauthenticated users away from `/desk/*`.
3. Finish desk shell wiring
   - Ensure `TrevoShell` wraps all desk pages.
4. Implement command palette
   - Cross-doctype navigation using Frappe search endpoints.
5. Implement workspace/shortcut renderer
   - Render sidebar shortcut cards/links/number cards using Frappe workspace resources.
6. Complete list view
   - Table, filtering, sorting, pagination.
7. Complete form view
   - Form header actions + field rendering + child table editing + Save/Submit/Cancel.
8. Add notifications panel
   - Fetch notifications and implement markRead.
9. Add timeline + versions
   - Render doc info timeline (comments/versions/etc.) via `get_doc_info`.
10. Implement reports view
11. Fieldtype parity work
   - Iteratively add missing Frappe fieldtypes until parity is reached.
12. End-to-end verification
   - Validate login/logout, list, form save, submit/cancel using representative doctypes.

## Open Questions / Assumptions
- Whether TanStack Query + UI Toaster are fully present/wired (pending verification of `app/providers.tsx`).
- Whether list/workspace/form pages are currently fully functional or partial.
- CSRF enforcement: integration notes claim “CSRF not enforced” for REST/method calls with cookie auth, but exact enforcement should be rechecked if POST/PUT starts failing.

## Change Log
- 2026-07-03: Created `trevo-frontend/implementation1.md` capturing current verified integration state and planned gaps.

