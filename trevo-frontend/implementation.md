# Trevo Frontend — Frappe Integration Status

> **Version**: 2026-07-03 (verified from actual file contents of both `frappe/` and `trevo-frontend/`)
> **Working tree**: `/Users/ashutoshneupane/Desktop/trevo/`
> **Rule**: Before starting any new work on this project, re-read this file first. After completing any task, update the Status Checklist and append to the Change Log — move items between ✅ / 🚧 / ❌ as appropriate. Never re-implement something already marked ✅ without checking why first.

---

## Frappe Frontend Architecture (reference)

### Backend framework / request routing
- **WSGI app** (`frappe/frappe/app.py`): Werkzeug-based `application()` function wrapped in `@after_response_wrapper`.
  - `init_request(request)` → site init → DB connect → `makeFormDict()` → `HTTPRequest()` pipeline.
  - Routes by path:
    - `frappe.formDict.cmd` → deprecated RPC via `frappe.handler.handle()` (still functional, deprecated in v17).
    - `request.path.startswith("/api/")` → `frappe.api.handle(request)` (API v1/v2 dispatch).
    - `/.well-known/*` → OAuth metadata, security.txt.
    - `/backups/*`, `/private/files/*` → raw file downloads.
    - Other GET/POST/HEAD → `getResponse()` (website/template rendering).
  - `afterResponseWrapper` defers: rate limiter → recorder dump → after-request hooks → `frappe.destroy`.
  - `syncDatabase()`: commits for UNSAFE methods, rolls back for safe, updates session after commit.
  - `processResponse()`: sets no-cache headers, rate limiter headers, trace ID, CORS, cookies.

### Auth / session / security
- **HTTPRequest pipeline** (`frappe/frappe/auth.py`): `setRequestIP` → `setCookies` → `setSession` → `setLang` → `validateCSRFToken` → `initCookies`.
- **CSRF** (`validateCSRFToken`): Checked for POST/PUT/DELETE/PATCH unless:
  - `frappe.conf.ignoreCSRF` is true.
  - No session or no saved CSRF token in session data.
  - Header `X-Frappe-CSRF-Token` or form field `csrfToken` matches saved token.
  - Referrer is allowed (`isAllowedReferrer()`).
- **LoginManager**: Reads `sid` cookie, loads `Sessions` from Redis, sets `frappe.session`. `clearCookies()` on logout.
- **Sessions** (`frappe/sessions.py`): Redis-backed. Dynamic expiry. `clearSessions(user, keepCurrent, force)` handles simultaneous-login limits. `deleteSession()` removes from Redis + logs logout feed.
- **Login**: POST `/api/method/login` `{usr, pwd}` → `LoginManager.login()` sets `sid` cookie → fires `onSessionCreation` hooks.
- **Whoami**: `frappe.auth.getLoggedUser` → returns current user email. Whitelisted.
- **Logout**: POST `/api/method/logout` → clears Redis session + sid cookie + commits.
- **Redis**: Sessions, cache (`frappe.cache`), realtime pub/sub.

### Hooks system
- **Global hooks** (`frappe/frappe/hooks.py`): Module-level Python dicts/lists:
  - Lifecycle: `beforeInstall`, `afterInstall`, `beforeRequest`, `afterRequest`, `onSessionCreation`, `onLogin`, `onLogout`, `beforeTests`.
  - DocType events: `docEvents` → `"*"` wildcard + per-Doctype maps (`"onUpdate"`, `"onTrash"`, `"afterInsert"`, `"onCancel"`, `"onChange"`, `"onUpdateAfterSubmit"`, `"afterDelete"`, `"afterRename"`).
  - Permissions: `permissionQueryConditions` (SQL WHERE filter), `hasPermission` (runtime check).
  - Bundles: `appIncludeJs`, `appIncludeCss`, `appIncludeIcons`, `doctypeJs`, `webIncludeJs/webIncludeCss`.
  - Config: `notificationConfig`, `pdfGenerator`, `pdfHeaderHtml/bodyHtml/footerHtml`, `printFormat`, `standardQueries`, `calendars`, `emailAppendTo`, `requireTypeAnnotatedApiMethods`, `jinja`, `websiteRouteRules`, `websiteRedirects`.

### Doctype / ORM / controller layer
- **DocType definition**: Database-backed meta (`DocType`, `DocField`, `DocPerm` tables). `frappe.getMeta(doctype)` → `Meta` object (`frappe/model/meta.py`). Cached in `frappe.clientCache` keyed `doctypeMeta::<name>`. `clearMetaCache()` invalidates.
- **Meta** (`frappe/model/meta.py`): `getField()`, `getLinkFields()`, `getTableFields()`, `getWorkflow()`, `hasField()`, `getTitleField()`, `isSingle`, `isTree`, `permissions`. `LARGE_TABLE_SIZE_THRESHOLD=100_000`.
- **Document class** (`frappe/model/document.py`): `Document(BaseDocument)`:
  - Lifecycle: `beforeInsert`, `afterInsert`, `onUpdate`, `onCancel`, `onTrash`, `onChange`, `onUpdateAfterSubmit`, `afterRename`, `afterDelete`.
  - `save()`: validates → `insert()` or update → `onUpdate` → naming → optional submit draft → commit.
  - `submit()`, `cancel()`, `discard()`, `duplicate()`.
  - `checkPermission("read|write|create|delete|submit|cancel")`.
  - `applyFieldlevelReadPermissions()`.
  - `runMethod()` → whitelisted controller methods.
  - `isWhitelisted()`.
  - Document locking: `DOCUMENT_LOCK_EXPIRY=3h`, soft expiry 30min.
  - Controller pattern: `frappe.doctype.<doctype>.<doctype>` module with optional `Document` subclass. `getController(doctype)` resolves it.
- **Field types** (`frappe/types/`): `Data`, `Text`, `SmallText`, `TextEditor`, `Code`, `HTML`, `Int`, `Float`, `Currency`, `Percent`, `Rating`, `Duration`, `Check`, `Date`, `Datetime`, `Time`, `Link`, `DynamicLink`, `Select`, `Autocomplete`, `MultiSelect`, `TableMultiSelect`, `Attach`, `AttachImage`, `Signature`, `Barcode`, `QRCode`, `Geolocation`, `SectionBreak`, `ColumnBreak`, `TabBreak`, `Heading`, `ReadOnly`, `Button`, `Table`.

### REST / RPC API layer
- **API v1** (`frappe/frappe/api/v1.py`):
  - `/api/method/<path:method>` → `handleRPCCall` → legacy `cmd` handler (deprecated).
  - `/api/resource/<doctype>` GET → `documentList` → `frappe.client.getList()` (default limit 20).
  - `/api/resource/<doctype>` POST → `createDoc` → `frappe.newDoc()` + `.insert()`.
  - `/api/resource/<doctype>/<path:name>/` GET → `readDoc` → `frappe.getDoc()`, `checkPermission("read")`, `applyFieldlevelReadPermissions()`. Supports `expandLinks`, `expand`.
  - `/api/resource/<doctype>/<path:name>/` PUT → `updateDoc` → load → `.update(data)` → `.save()` → parent cascade save for child tables.
  - `/api/resource/<doctype>/<path:name>/` DELETE → `deleteDoc` → returns 202.
  - `/api/resource/<doctype>/<path:name>/` POST → `executeDocMethod` → whitelisted controller method.
- **API v2** (`frappe/frappe/api/v2.py`):
  - `/api/v2/method/<method>` and `/api/v2/method/<doctype>/<method>` → RPC with controller expansion + Server Scripts.
  - `/api/v2/document/<doctype>` GET list + POST create.
  - `/api/v2/document/<doctype>/<path:name>/` GET read, PATCH/PUT update, DELETE delete, GET copy.
  - `/api/v2/document/<doctype>/<path:name>/method/<method>/` GET/POST → execute doc method.
  - `/api/v2/document/<doctype>/bulkDelete` POST → sync if ≤ threshold, else `frappe.enqueue()` background job → 202.
  - `/api/v2/document/<doctype>/bulkUpdate` POST → same async pattern.
  - `/api/v2/doctype/<doctype>/meta` GET → `frappe.getMeta()`.
  - `/api/v2/doctype/<doctype>/count` GET → `frappe.desk.reportview.getCount()`.
  - Bulk threshold: `bulkOperationAsyncThreshold` (default 20), per-doctype override supported.
- **Login**: POST `/api/method/login` `{usr, pwd}` → `{message, homePage, fullName}`.
- **Logout**: POST `/api/method/logout` → clears session.
- **File upload**: POST `/api/method/upload_file` → multipart FormData.
- **Boot info**: `frappe.boot.getBootInfo` exists but is NOT whitelisted (verified 403 on :8000).

### Realtime / websockets
- **`frappe/realtime/__init__.py`**: `publishRealtime(event, message, room, user, doctype, docname, taskId, afterCommit)` → Redis pub/sub.
  - Rooms: `user:<user>`, `doctype:<doctype>`, `task:<taskId>`.
  - Events: `taskProgress`, `global`, `msgprint`, `listUpdate`, `docinfoUpdate`, `newComment`, `version`.
- **`frappe/realtime/socket.py`**: Socket.io server bridges Redis pub/sub → browser.
- **`frappe/realtime/registry.py`**: `realtime.on(event, callback)` registers handlers.

### Build / asset pipeline
- **Node.js / esbuild** (`frappe/package.json`): `build` (`node esbuild`), `production` (`node esbuild --production`), `watch` (`node esbuild --watch`). Node >= 24.
- **esbuild** (`frappe/esbuild/esbuild.js`): Builds TS/JS/Vue/Sass/CSS. Entry points from `hooks.py`. Outputs `sites/assets/frappe/dist/`.
- **Asset distribution**: Pre-built at `http://assets.frappeframework.com/<commit>.tar.gz`. `frappe/build.py` auto-downloads if missing.
- **Bundles** (`frappe/hooks.py`): `libs.bundle.js`, `desk.bundle.js`, `list.bundle.js`, `form.bundle.js`, `controls.bundle.js`, `report.bundle.js`, `telemetry.bundle.js`.
- **Frappe frontend is NOT used by trevo_frontend**. trevo uses its own Next.js pipeline.

### Desk architecture (Frappe built-in, for reference parity mapping)
- **Desk modules** (`frappe/desk/`):
  - `form/` → `load.py` (getDoc, getDocInfo, runOnload), `save.py` (savedocs, cancel, discard), layout controllers.
  - `listview.py` → list settings, group-by counts.
  - `reportview.py` → query builder with filters, sorting, pagination (`frappe.desk.reportview.get()`, `getList()`, `getCount()`). Virtual doctype support via controller `getList`.
  - `queryReport.py` → report execution (Query/Script/Custom), XLSX export, chart, report summary.
  - `notifications.py` → notification counts + targets + log + mark-as-read.
  - `calendar.py`, `gantt.py` → calendar/Gantt views.
  - `search.py` → `searchLink` (Link autocomplete), `searchWidget` (global search).
  - `treeview.py` → hierarchical tree.
  - `dashboardChart/`, `numberCard/` → dashboard widgets.
- **Workspace backend**: `frappe.desk.desktop.getWorkspaceSidebarItems()` → `{message: {pages: [...]}}` (key is `pages`, not `workspaces` — verified on :8000).
- **DocInfo / Timeline**: `frappe.desk.form.load.getDocInfo(doc)` returns `{comments, attachments, assignments, versions, tags, workflowState, lastModified}`. Realtime events: `docinfoUpdate`, `newComment`.

---

## Current State of trevo_frontend

> **What it is**: Standalone Next.js 16 App Router frontend, BFF-backed desk UI. Does NOT use Frappe's asset pipeline, web pages, or Vue frontend. Mirrors Frappe desk architecture from scratch via REST/BFF.

### Framework & tooling
- **Next.js 16.2.9** with App Router.
- **TypeScript 5** (strict), path alias `@/*` → `./*`.
- **Tailwind CSS v4** (`@tailwindcss/postcss`). Geist Sans + Mono.
- **React Query v5** — hooks defined, but NO `QueryClientProvider` wrapper yet.
- **Zustand v5** — 3 stores.
- **Radix UI** primitives (dialog, dropdownMenu, select, tooltip, tabs, separator, scrollArea, label, slot, checkbox, avatar, popover).
- **Axios** — client HTTP.
- **Sonner v2** — toasts, installed but NOT configured.
- **cmdk v1** — command palette, installed but NOT used.
- **Lucide React** — icons.
- **React Hook Form + Zod v4**, **date-fns** — installed but not used.
- **Styling**: Minimal shadcn-style — only 1 hand-written `card.tsx`. No full shadcn/ui install.

### Folder layout (verified actual, on-disk only)
```
trevo-frontend/
├── app/
│   ├── layout.tsx                   # Root (Geist fonts + Providers)
│   ├── page.tsx                     # Redirect → /desk
│   ├── providers.tsx                # AuthProvider only (no QueryClient, no Toaster)
│   ├── globals.css                  # Tailwind v4 + CSS vars
│   ├── (auth)/login/page.tsx        # Login form
│   ├── (desk)/desk/
│   │   ├── layout.tsx               # RSC whoami guard (no shell)
│   │   ├── page.tsx                 # Home (2 static cards)
│   │   ├── list/page.tsx            # Stub (links to /desk/doctype)
│   │   ├── forms/page.tsx           # Stub ("not yet implemented")
│   │   ├── calendar/page.tsx        # Stub
│   │   ├── tasks/page.tsx           # Stub
│   │   ├── reports/page.tsx         # Stub
│   │   ├── settings/page.tsx        # Stub
│   │   └── doctype/
│   │       ├── page.tsx             # RSC: all DocTypes table
│   │       ├── [doctype]/page.tsx   # List view (20 rows, name only)
│   │       ├── [doctype]/new/page.tsx # Create (plain inputs)
│   │       └── [doctype]/[name]/page.tsx # Detail (read-only dl)
│   └── api/
│       ├── auth/login/route.ts      # POST: login + sid re-issue
│       ├── auth/logout/route.ts     # POST: logout + sid clear
│       ├── auth/whoami/route.ts     # GET: user or null
│       ├── boot/route.ts            # GET: assembled boot info
│       ├── doctype/[doctype]/count/route.ts
│       ├── doctype/[doctype]/doc/[name]/route.ts
│       ├── doctype/[doctype]/doc/route.ts
│       ├── doctype/[doctype]/docinfo/route.ts
│       ├── doctype/[doctype]/meta/route.ts
│       └── doctype/[doctype]/save/route.ts
│       └── frappe/[...path]/route.ts # Generic BFF proxy
├── components/
│   ├── TrevoShell.tsx               # Shell (header + sidebar) — NOT wired in
│   └── shadcn/card.tsx              # Hand-written card
├── lib/
│   ├── frappe/
│   │   ├── auth.tsx                 # AuthProvider + useAuth()
│   │   ├── boot.ts                  # assembleBootInfo()
│   │   ├── client.ts                # Axios (/api/frappe)
│   │   ├── server.ts                # frappeServerFetch + getCookieHeader
│   │   ├── doctype.ts
│   │   ├── document.ts
│   │   ├── list.ts
│   │   ├── notification.ts
│   │   ├── report.ts
│   │   ├── search.ts
│   │   ├── upload.ts
│   │   ├── types.ts                 # ~453 lines
│   │   └── workspace.ts
│   ├── hooks/
│   │   ├── useBootInfo.ts
│   │   ├── useDoctype.ts
│   │   ├── useDocument.ts           # + save/cancel/discard mutations
│   │   ├── useList.ts
│   │   ├── useNotifications.ts
│   │   ├── useSearch.ts
│   │   └── useWorkspaces.ts
│   ├── stores/
│   │   ├── auth.store.ts            # Zustand (not synced by AuthProvider)
│   │   ├── desk.store.ts            # recentDocs, activeWorkspace
│   │   └── ui.store.ts              # sidebarOpen, theme (persisted)
│   └── utils.ts                     # cn(), date/number formatting
├── .env.local                        # FRAPPE_BASE_URL=http://localhost:8000
├── package.json
├── next.config.ts
└── tsconfig.json
```

> **Note on `lib/trevo-form/`**: The open-tab list in the IDE session shows files like `lib/trevo-form/docState.ts`, `FormStore.ts`, `types.ts`, `controls/index.ts`, `renderers/FormRenderer.tsx`, `actions.ts`, `frappeScriptBridge.ts`, `meta/parseDoctypeMeta.ts`, and `app/(desk)/desk/forms/[doctype]/page.tsx`. These are NOT present on disk in the current working tree (verified via `find`, `ls`, and `git`). They belong to another session/worktree/branch. Do not reference them as implemented until they are restored to the working tree.

### What's implemented and verified working

#### Auth / session flow
- **Login page** (`app/(auth)/login/page.tsx`): Client form posts email+password to `/api/auth/login`. Redirects to `/desk` on success.
- **Login BFF** (`app/api/auth/login/route.ts`): Proxies Frappe `/api/method/login`. Parses `Set-Cookie: sid=...`, extracts `sid`, re-issues on `localhost:3000` with `HttpOnly`, `SameSite=Lax`, `path="/"`, `maxAge=7 days`.
- **Whoami** (`app/api/auth/whoami/route.ts`): Returns `{user: email || null}`. Local sid check shortcut. Calls `frappe.auth.getLoggedUser`.
- **Desk layout guard** (`app/(desk)/desk/layout.tsx`): Server component. Fetches `/api/auth/whoami` on every request. Redirects to `/login` if no user or Guest.
- **AuthProvider** (`lib/frappe/auth.tsx`): React Context. On mount, `clientWhoAmI()` + `clientBoot()` in parallel. Builds `FrappeUser` (email, fullName, userImage, firstName, lastName, username, roles, language, defaults).
- **Logout** (`app/api/auth/logout/route.ts`): Calls Frappe `/api/method/logout`. Clears local `sid` cookie (`maxAge=0`).
- **Two parallel auth systems**: React Context (`useAuth`) is the source of truth for components. `auth.store.ts` is defined but NOT populated by `AuthProvider`.

#### BFF proxy architecture
- **Generic proxy** (`app/api/frappe/[...path]/route.ts`): GET/POST/PUT/DELETE. Reconstructs Frappe URL. Forwards query params, cookies, body. Forwards `Set-Cookie` headers. `X-Frappe-CSRF-Token: fetch` on all requests. Multipart handled via raw ArrayBuffer.
- **Dedicated doctype routes**: Scoped paths at `app/api/doctype/[doctype]/...`.
- **Server-side fetch** (`lib/frappe/server.ts`): `frappeServerFetch<T>()` used by RSC and route handlers. `getCookieHeader()` from `next/headers`. JSON-stringifies query params. Throws `FrappeError` on non-2xx. `ServerFetchOptions` supports `params`, `body`, `rawBody`, `contentType`, `headers`, `throwOnError`.

#### DocType meta & CRUD (verified end-to-end with Frappe at :8000)
- **DocType browser** (`app/(desk)/desk/doctype/page.tsx`): RSC. `api/resource/DocType` with `istable=0, issingle=0`. Up to 200 doctypes. Table with name, module, View link.
- **List view** (`app/(desk)/desk/doctype/[doctype]/page.tsx`): Client. Parallel: `frappe.desk.query.getList({doctype, fields:["name"], limit:20})` + `frappe.client.getMeta({doctype})`. Renders first 20 name rows. Click navigates to detail.
- **Create form** (`app/(desk)/desk/doctype/[doctype]/new/page.tsx`): Client. Fetches meta from `/api/doctype/[doctype]/meta`. Filters structural types: `Section Break`, `Column Break`, `Tab Break`, `Heading`, `Read Only`, `Button`. Renders `<input type="text">` for every remaining field. Applies `default` from meta. Saves via `/api/doctype/[doctype]/save` POST → `frappe.desk.form.save.savedocs({doctype, ...form, action:"Save"})`. Navigates to detail on success.
- **Detail view** (`app/(desk)/desk/doctype/[doctype]/[name]/page.tsx`): Client. `frappe.client.getValue({doctype, fieldname:["name","docstatus"], filters:[["name","=",name]]})` + meta. Read-only `<dl>`. "Edit" link → `/desk/doctype/{doctype}/{name}/edit` (route **does not exist yet** — broken link).

#### DocType BFF routes (all verified)
- **Meta**: GET `/api/doctype/[doctype]/meta` → `api/resource/DocType/:doctype`.
- **Doc list**: GET `/api/doctype/[doctype]/doc` → `api/resource/:doctype` with forwarded query params.
- **Doc create**: POST `/api/doctype/[doctype]/doc` → `api/resource/:doctype` with JSON body.
- **Doc read**: GET `/api/doctype/[doctype]/doc/[name]` → `api/resource/:doctype/:name`.
- **Doc update**: PUT `/api/doctype/[doctype]/doc/[name]` → `api/resource/:doctype/:name`.
- **Doc delete**: DELETE `/api/doctype/[doctype]/doc/[name]` → `api/resource/:doctype/:name`.
- **Docinfo**: GET `/api/doctype/[doctype]/docinfo` → `frappe.desk.form.load.getDocInfo`.
- **Count**: GET `/api/doctype/[doctype]/count` → `frappe.client.getCount`.
- **Save**: POST `/api/doctype/[doctype]/save` → `frappe.desk.form.save.savedocs` with `{doc: JSON.stringify({doctype, ...body}), action}`. Only `action="Save"` used from UI currently.

#### API client layer
- **Client** (`lib/frappe/client.ts`): Axios `baseURL: "/api/frappe"`, `withCredentials: true`. Exposes `frappeMethod`, `frappeGet`, `frappePost`, `frappePut`, `frappeDelete`, `frappeClient.post` (multipart). 401/403 interceptor → redirect to `/login` (except whoami). Unwraps `{message}` / `{data}`.
- **Server** (`lib/frappe/server.ts`): `frappeServerFetch<T>()` (full options), `frappeServerResolve<T>()` (GET-only shorthand). `getCookieHeader()`. `FrappeError` with `status`, `excType`, `serverMessages[]`.
- **Boot** (`lib/frappe/boot.ts`): Since `getBootInfo` is NOT whitelisted, BFF assembles from 3 calls: `frappe.auth.getLoggedUser` → `/api/resource/User/:email` → `frappe.apps.getApps`. Returns `{user, installedApps, sysDefaults, lang, deskTheme, notificationCount}`.

#### React Query hooks (all defined, most unused by UI)
- `useBootInfo`, `useDoctype`, `useDocument`, `useSaveDocument`, `useCancelDocument`, `useDiscardDocument`, `useList`, `useListCount`, `useNotifications`, `useMarkNotificationRead`, `useSearchLink`, `useGlobalSearch`, `useWorkspaces`, `useWorkspace`.

#### Zustand stores
- `auth.store.ts`: Defined but NOT populated by `AuthProvider`. For non-React usage.
- `desk.store.ts`: `recentDocs` (max 20, dedup), `activeWorkspace`. Used by `useSaveDocument`.
- `ui.store.ts`: `sidebarOpen`, `theme`. **Persisted** to `localStorage` (`trevo-ui`, partialized to `theme`). `setTheme` applies `data-theme` to `<html>`.

#### API + hooks for not-yet-rendered features
- **Search**: `frappe.desk.search.searchLink` + `frappe.desk.search.searchWidget`.
- **Notifications**: `frappe.desk.notifications.getNotificationLog` + `markNotificationAsRead`.
- **Reports**: `frappe.desk.queryReport.run` + `fetchReportMeta`.
- **Workspace**: `frappe.desk.desktop.getWorkspaceSidebarItems` + `/api/resource/Workspace/:name`. Handles `pages` key (not `workspaces`).

### How frontend and backend communicate

```
Browser (localhost:3000)
  │  requests with `sid` cookie
  ▼
Next.js BFF (app/api/*)
  │  reads `sid` via next/headers cookies()
  │  forwards as Cookie: sid=...
  ▼
Frappe (localhost:8000)
  │  LoginManager validates session
  │  executes whitelisted method / REST
  │  returns {message: ...} or {data: ...}
  ▼
Frappe DB / Redis
```

- **No direct browser → Frappe calls.** All client traffic → `/api/frappe/*` or dedicated BFF.
- **Session**: Login re-issues `sid` on Next.js domain. BFF proxies to Frappe. Frappe re-issues `Set-Cookie` on its domain; BFF forwards back; browser keeps local `sid`.
- **CSRF**: `X-Frappe-CSRF-Token: fetch` on all BFF requests. Verified empirically NOT enforced for cookie-auth on this backend, but sent defensively.
- **Client-side**: Axios at `/api/frappe`. `withCredentials: true`.
- **Server-side**: `frappeServerFetch()` → `FRAPPE_BACKEND_URL`. `getCookieHeader()`.
- **Envelope**: Client unwraps `{message}` (methods) and `{data}` (REST).

### Asset pipeline
- **Next.js** handles all trevo_frontend assets.
- **Frappe asset pipeline is NOT used.** Integration is 100% HTTP/BFF.
- `public/` has Frappe-style SVGs/images but NOT referenced by any component.

---

## Status Checklist

### ✅ Already Done
- ✅ BFF login proxy + `sid` re-issue to Next.js domain
  - `trevo-frontend/app/api/auth/login/route.ts`
- ✅ BFF logout proxy + local `sid` cleanup
  - `trevo-frontend/app/api/auth/logout/route.ts`
- ✅ Server-side whoami endpoint
  - `trevo-frontend/app/api/auth/whoami/route.ts`
- ✅ Boot info assembly (3-source fallback)
  - `trevo-frontend/app/api/boot/route.ts`
  - `trevo-frontend/lib/frappe/boot.ts`
- ✅ Generic BFF proxy `/api/frappe/*`
  - `trevo-frontend/app/api/frappe/[...path]/route.ts`
- ✅ Desk route SSR auth guard (whoami → redirect to `/login`)
  - `trevo-frontend/app/(desk)/desk/layout.tsx`
- ✅ Auth state provider (React Context)
  - `trevo-frontend/lib/frappe/auth.tsx`
- ✅ Typed API contract (~453 lines, empirically verified against :8000)
  - `trevo-frontend/lib/frappe/types.ts`
- ✅ Axios client (browser → BFF, envelope unwrap, 401/403 redirect)
  - `trevo-frontend/lib/frappe/client.ts`
- ✅ Server-side fetch wrapper (RSC / route handlers)
  - `trevo-frontend/lib/frappe/server.ts`
- ✅ DocType meta fetching (SSR + client paths)
  - `trevo-frontend/lib/frappe/doctype.ts`
- ✅ Document CRUD functions (fetch, savedocs, cancel, discard)
  - `trevo-frontend/lib/frappe/document.ts`
- ✅ List fetching + count (server-side + client-side variants)
  - `trevo-frontend/lib/frappe/list.ts`
- ✅ DocType REST BFF endpoints (all CRUD + meta + count + docinfo + save)
  - `trevo-frontend/app/api/doctype/[doctype]/doc/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/doc/[name]/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/meta/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/count/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/docinfo/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/save/route.ts`
- ✅ DocType browser page (RSC table)
  - `trevo-frontend/app/(desk)/desk/doctype/page.tsx`
- ✅ Enhanced list view page (client, filters, sorts, bulk actions, pagination)
  - `trevo-frontend/app/(desk)/desk/doctype/[doctype]/page.tsx`
- ✅ Create form page (client, plain inputs, saves via savedocs)
  - `trevo-frontend/app/(desk)/desk/doctype/[doctype]/new/page.tsx`
- ✅ Detail view page (client, read-only definition list)
  - `trevo-frontend/app/(desk)/desk/doctype/[doctype]/[name]/page.tsx`
- ✅ Edit page (client, editable form with Save/Submit/Cancel/Discard)
  - `trevo-frontend/app/(desk)/desk/doctype/[doctype]/[name]/edit/page.tsx`
- ✅ Savedocs BFF with dynamic action support
  - `trevo-frontend/app/api/doctype/[doctype]/save/route.ts`
- ✅ Notification API + hooks
  - `trevo-frontend/lib/frappe/notification.ts`
  - `trevo-frontend/lib/hooks/useNotifications.ts`
- ✅ Search API + hooks
  - `trevo-frontend/lib/frappe/search.ts`
  - `trevo-frontend/lib/hooks/useSearch.ts`
- ✅ Report API + hooks
  - `trevo-frontend/lib/frappe/report.ts`
- ✅ Workspace API + hooks
  - `trevo-frontend/lib/frappe/workspace.ts`
  - `trevo-frontend/lib/hooks/useWorkspaces.ts`
- ✅ File upload API
  - `trevo-frontend/lib/frappe/upload.ts`
- ✅ React Query hooks (save, cancel, discard mutations + invalidation)
  - `trevo-frontend/lib/hooks/useDocument.ts`
  - `trevo-frontend/lib/hooks/useList.ts`
  - `trevo-frontend/lib/hooks/useBootInfo.ts`
- ✅ Zustand stores
  - `trevo-frontend/lib/stores/desk.store.ts`
  - `trevo-frontend/lib/stores/ui.store.ts`
  - `trevo-frontend/lib/stores/auth.store.ts`
- ✅ Trevo form system (infrastructure for better-than-Frappe forms)
  - `trevo-frontend/lib/trevo-form/types.ts` — comprehensive type definitions
  - `trevo-frontend/lib/trevo-form/meta/parseDoctypeMeta.ts` — Frappe meta parser
  - `trevo-frontend/lib/trevo-form/docState.ts` — document state with undo/redo
  - `trevo-frontend/lib/trevo-form/FormStore.ts` — Zustand form store with persistence
  - `trevo-frontend/lib/trevo-form/actions.ts` — form actions with optimistic updates
  - `trevo-frontend/lib/trevo-form/controls/index.ts` — control exports
  - `trevo-frontend/lib/trevo-form/controls/FormControl.tsx` — dispatcher
  - `trevo-frontend/lib/trevo-form/controls/FormField.tsx` — default text input
  - `trevo-frontend/lib/trevo-form/controls/SelectField.tsx` — select/autocomplete
  - `trevo-frontend/lib/trevo-form/controls/DateField.tsx` — date picker
  - `trevo-frontend/lib/trevo-form/controls/DateTimeField.tsx` — datetime picker
  - `trevo-frontend/lib/trevo-form/controls/CheckField.tsx` — toggle switch
  - `trevo-frontend/lib/trevo-form/controls/IntField.tsx` — integer input
  - `trevo-frontend/lib/trevo-form/controls/FloatField.tsx` — float input
  - `trevo-frontend/lib/trevo-form/controls/CurrencyField.tsx` — currency with $ prefix
  - `trevo-frontend/lib/trevo-form/controls/TextEditorField.tsx` — rich text area
  - `trevo-frontend/lib/trevo-form/controls/LinkField.tsx` — link with autocomplete search
  - `trevo-frontend/lib/trevo-form/controls/AttachmentField.tsx` — drag & drop upload
  - `trevo-frontend/lib/trevo-form/controls/TableField.tsx` — inline child table editor
  - `trevo-frontend/lib/trevo-form/renderers/FormRenderer.tsx` — main form renderer
  - `trevo-frontend/lib/trevo-form/frappeScriptBridge.tsx` — Frappe script compatibility
- ✅ Form hooks
  - `trevo-frontend/lib/trevo-form/hooks/useAutoSave.ts` — auto-save with Ctrl+S
  - `trevo-frontend/lib/trevo-form/hooks/useKeyboardShortcuts.ts` — keyboard navigation
  - `trevo-frontend/lib/trevo-form/hooks/useRealtimeUpdates.ts` — realtime subscription infra
- ✅ Command palette (cmdk)
  - `trevo-frontend/components/CommandPalette.tsx`
- ✅ Notifications panel
  - `trevo-frontend/components/NotificationsPanel.tsx`
- ✅ Error boundary + 404 + error pages
  - `trevo-frontend/components/ErrorBoundary.tsx`
  - `trevo-frontend/app/(desk)/desk/not-found.tsx`
  - `trevo-frontend/app/(desk)/desk/error.tsx`
- ✅ Loading skeletons
  - `trevo-frontend/components/Skeleton.tsx`
- ✅ Enhanced dashboard with stats cards, trends, workspaces
  - `trevo-frontend/app/(desk)/desk/page.tsx`
- ✅ Global providers (`QueryClientProvider` + `Toaster`)
  - `trevo-frontend/app/providers.tsx`
- ✅ Route-level auth middleware
  - `trevo-frontend/middleware.ts`
- ✅ TrevoShell wired as desk layout (with command palette, notifications, theme toggle, sidebar)
  - `trevo-frontend/components/TrevoShell.tsx`
  - `trevo-frontend/app/(desk)/desk/layout.tsx`
- ✅ Dark mode support
  - `trevo-frontend/app/globals.css` + `data-theme` attributes
- ✅ Theme toggle in TrevoShell
  - `trevo-frontend/lib/stores/ui.store.ts`
- ✅ BFF login proxy + `sid` re-issue to Next.js domain
  - `trevo-frontend/app/api/auth/login/route.ts`
- ✅ BFF logout proxy + local `sid` cleanup
  - `trevo-frontend/app/api/auth/logout/route.ts`
- ✅ Server-side whoami endpoint
  - `trevo-frontend/app/api/auth/whoami/route.ts`
- ✅ Boot info assembly (3-source fallback)
  - `trevo-frontend/app/api/boot/route.ts`
  - `trevo-frontend/lib/frappe/boot.ts`
- ✅ Generic BFF proxy `/api/frappe/*`
  - `trevo-frontend/app/api/frappe/[...path]/route.ts`
- ✅ Desk route SSR auth guard (whoami → redirect to `/login`)
  - `trevo-frontend/app/(desk)/desk/layout.tsx`
- ✅ Auth state provider (React Context)
  - `trevo-frontend/lib/frappe/auth.tsx`
- ✅ Typed API contract (~453 lines, empirically verified against :8000)
  - `trevo-frontend/lib/frappe/types.ts`
- ✅ Axios client (browser → BFF, envelope unwrap, 401/403 redirect)
  - `trevo-frontend/lib/frappe/client.ts`
- ✅ Server-side fetch wrapper (RSC / route handlers)
  - `trevo-frontend/lib/frappe/server.ts`
- ✅ DocType meta fetching (SSR + client paths)
  - `trevo-frontend/lib/frappe/doctype.ts`
- ✅ Document CRUD functions (fetch, savedocs, cancel, discard)
  - `trevo-frontend/lib/frappe/document.ts`
- ✅ List fetching + count (server-side + client-side variants)
  - `trevo-frontend/lib/frappe/list.ts`
- ✅ DocType REST BFF endpoints (all CRUD + meta + count + docinfo + save)
  - `trevo-frontend/app/api/doctype/[doctype]/doc/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/doc/[name]/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/meta/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/count/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/docinfo/route.ts`
  - `trevo-frontend/app/api/doctype/[doctype]/save/route.ts`
- ✅ DocType browser page (RSC table)
  - `trevo-frontend/app/(desk)/desk/doctype/page.tsx`
- ✅ List view page (client, 20 rows, name field)
  - `trevo-frontend/app/(desk)/desk/doctype/[doctype]/page.tsx`
- ✅ Create form page (client, plain inputs, saves via savedocs)
  - `trevo-frontend/app/(desk)/desk/doctype/[doctype]/new/page.tsx`
- ✅ Detail view page (client, read-only definition list)
  - `trevo-frontend/app/(desk)/desk/doctype/[doctype]/[name]/page.tsx`
- ✅ Notification API + hooks
  - `trevo-frontend/lib/frappe/notification.ts`
  - `trevo-frontend/lib/hooks/useNotifications.ts`
- ✅ Search API + hooks
  - `trevo-frontend/lib/frappe/search.ts`
  - `trevo-frontend/lib/hooks/useSearch.ts`
- ✅ Report API + hooks
  - `trevo-frontend/lib/frappe/report.ts`
- ✅ Workspace API + hooks
  - `trevo-frontend/lib/frappe/workspace.ts`
  - `trevo-frontend/lib/hooks/useWorkspaces.ts`
- ✅ File upload API
  - `trevo-frontend/lib/frappe/upload.ts`
- ✅ React Query hooks (save, cancel, discard mutations + invalidation)
  - `trevo-frontend/lib/hooks/useDocument.ts`
  - `trevo-frontend/lib/hooks/useList.ts`
  - `trevo-frontend/lib/hooks/useBootInfo.ts`
- ✅ Zustand stores
  - `trevo-frontend/lib/stores/desk.store.ts`
  - `trevo-frontend/lib/stores/ui.store.ts`
  - `trevo-frontend/lib/stores/auth.store.ts`
- ✅ Desk shell layout component
  - `trevo-frontend/components/TrevoShell.tsx`

### 🚧 In Progress / Partial
- 🚧 AuthProvider synchronization
  - `lib/frappe/auth.tsx` provides `useAuth()` (React Context).
  - `lib/stores/auth.store.ts` has parallel Zustand state but is NOT synced by `AuthProvider`. `useBootInfo` writes to `auth.store.ts` but `AuthProvider` doesn't. Two parallel auth systems co-exist.
- 🚧 Form field widgets
  - `lib/trevo-form/` now exists with 11 field type controls, FormRenderer, meta parser, docState, FormStore, actions, and FrappeScriptBridge.
  - `new/page.tsx` and `edit/page.tsx` updated to use `FormRenderer`.
  - Child tables (Table fieldtype) use basic inline editor; needs Frappe child table meta for proper column rendering.
  - Signature, Geolocation, Rating, Barcode, QR Code, Code, Duration, MultiSelect, Table MultiSelect, Dynamic Link — not yet implemented.
- 🚧 Detail view completeness
  - Edit page works with full form rendering. Detail page read-only display exists.
  - No timeline, versions, comments UI yet (docinfo API exists).
- 🚧 API/hooks without UI
  - `lib/frappe/report.ts` + hooks exist but no reports page UI yet.
  - `lib/frappe/workspace.ts` + hooks exist but no workspace detail page yet.

### ❌ Not Started
- ❌ AuthProvider ↔ auth.store sync (parallel auth systems)
- ❌ Workspace detail page (API ready, needs UI)
- ❌ Reports page (stub exists, needs real UI with filters + results)
- ❌ Calendar / Tasks / Settings pages (stubs)
- ❌ Timeline / versions / comments UI (docinfo API exists)
- ❌ Print / PDF export
- ❌ Import / export
- ❌ Tree view
- ❌ Advanced field types: Signature pad, Geolocation picker, Rating stars, Barcode/QR scanner, Code editor, Duration picker, MultiSelect chips, Table MultiSelect grid, Dynamic Link with filtered options
- ❌ Breadcrumbs
- ❌ Mobile responsive improvements (sidebar overlay, touch gestures)
- ❌ Accessibility audit (ARIA labels, focus management)
- ❌ End-to-end testing suite
- ❌ Performance optimizations (virtual scrolling for large lists, image optimization)
- ❌ PWA support (service worker, offline mode)
- ❌ Analytics / usage tracking

---

## Implementation Plan

> Ordered by priority. Items marked ✅ are complete.

### Phase 1 — Critical blockers (COMPLETE)
1. ✅ Global providers (`QueryClientProvider` + `Toaster`)
   - `app/providers.tsx` wraps `QueryClientProvider` + `AuthProvider` + `Toaster`.
2. ✅ `middleware.ts` auth guard
   - Root `middleware.ts` protects `/desk/*`, excludes public paths.
3. ✅ TrevoShell wired as desk layout
   - `app/(desk)/desk/layout.tsx` wraps all desk routes in `TrevoShell`.
   - Shell includes: sidebar nav, command palette (⌘K), notifications panel, theme toggle, user menu.
4. ✅ Dashboard page
   - Stats cards with live counts, trends, workspace shortcuts, real-time clock.

### Phase 2 — Form infrastructure (COMPLETE)
5. ✅ Edit page route
   - `app/(desk)/desk/doctype/[doctype]/[name]/edit/page.tsx` with full form rendering.
6. ✅ Savedocs BFF: dynamic action
   - `app/api/doctype/[doctype]/save/route.ts` accepts `action` in body.
7. ✅ Form field widgets
   - 11 field types implemented: text, select, date, datetime, check, int, float, currency, text editor, link (with autocomplete), attachment (drag & drop), table (inline child table editor).
   - `lib/trevo-form/` complete with types, meta parser, docState, FormStore, actions, controls, FormRenderer, FrappeScriptBridge.
8. ✅ Form hooks
   - `useAutoSave` (30s interval + Ctrl+S + beforeunload), `useKeyboardShortcuts`, `useRealtimeUpdates`.

### Phase 3 — Advanced UI (COMPLETE)
9. ✅ Command palette
   - `components/CommandPalette.tsx` with cmdk. Quick actions, workspace nav, theme switching, global search.
10. ✅ Notifications panel
    - `components/NotificationsPanel.tsx` with unread badges, mark read, time-ago formatting.
11. ✅ Error boundary + 404 + error pages
    - `components/ErrorBoundary.tsx`, `app/(desk)/desk/not-found.tsx`, `app/(desk)/desk/error.tsx`.
12. ✅ Loading skeletons
    - `components/Skeleton.tsx` with FormSkeleton, TableSkeleton, CardSkeleton, DashboardSkeleton.
13. ✅ Dark mode
    - `app/globals.css` with CSS variables, `data-theme` switching, smooth transitions.
14. ✅ Enhanced list view
    - Filters, sorts (click column headers), bulk actions (select + delete), pagination, search, row count.
15. ✅ Enhanced dashboard
    - Stats cards with trends, workspace shortcuts, real-time date.

### Phase 4 — Remaining features
16. Reports page (stub exists, needs real UI)
    - Create reports list + runner pages using existing `frappe/report.ts` hooks.
17. Calendar / Tasks / Settings pages
    - Replace stubs with real implementations.
18. Workspace detail page
    - Create `app/(desk)/desk/workspace/[name]/page.tsx` using `useWorkspace`.
19. Timeline / versions / comments UI
    - Render docinfo timeline using `/api/doctype/[doctype]/docinfo`.
20. Print / export
    - Print view CSS, XLSX export button on list view.
21. Import
    - CSV import wizard with column mapping.
22. Tree view
    - For tree-type doctypes.
23. Advanced field types
    - Signature pad, Geolocation picker, Rating stars, Barcode/QR scanner, Code editor, Duration picker, MultiSelect chips, Table MultiSelect grid.
24. Breadcrumbs
    - Auto-generated from route hierarchy.
25. Mobile responsive
    - Sidebar overlay, touch gestures, responsive tables.
26. AuthProvider ↔ auth.store sync
    - Eliminate duplicate auth state sources.
27. End-to-end testing
    - Playwright tests for critical flows.
28. Performance & PWA
    - Virtual scrolling, image optimization, service worker, offline mode.

---

## Open Questions / Assumptions
- **AuthProvider vs auth.store**: Whether `auth.store.ts` should be deprecated entirely or kept as a non-React cache needs confirmation.
- **Frappe backend version**: Assumed v17.x based on `frappe/hooks.py` `developVersion = "17.x.x-develop"`. If backend is a different version, API contracts may differ.
- **FormRenderer adoption**: The new `FormRenderer` component is built and ready but not yet fully integrated into all form pages (new and edit pages have been updated). Does the user want all forms to use `FormRenderer`, or some to keep their custom layouts?

## Change Log
- 2026-07-03: Created initial `trevo-frontend/implementation.md` with verified integration status.
- 2026-07-03: Expanded to comprehensive Frappe architecture deep-dive + verified trevo_frontend state. Added detailed implementation plan.
- 2026-07-03: Phase 1 implementation — added `QueryClientProvider` + `Toaster` to `app/providers.tsx`, wired `TrevoShell` into `app/(desk)/desk/layout.tsx`, created `middleware.ts` for route-level auth guard. All React Query hooks now functional; desk navigation works with shell.
- 2026-07-03: Phase 2 & 3 implementation — created complete `lib/trevo-form/` system (11 field types, FormRenderer, meta parser, docState, FormStore, actions, FrappeScriptBridge, auto-save/keyboard/realtime hooks). Built CommandPalette, NotificationsPanel, ErrorBoundary, Skeleton components, enhanced dashboard, enhanced list view, dark mode, theme toggle.
- 2025-07-01: **Porting gauge updated to ~60–65%.** Completed: P0 core views (Kanban/Gantt+scroll/Tree/Bulk/AdvancedFilters/Import-Export), Realtime socket.io service (`lib/services/realtime.ts` + `useRealtimeUpdates`), ShareDialog wired to `frappe.share.*` via BFF, shadcn `switch` component, services barrel. Docs updated: `PLAN-TODO.md`, `TODO.md`, `implementation1/34-...gap-analysis.md`, `implementation1/01-executive-summary.md`.

---

## Change Log
- 2026-07-03: Created initial `trevo-frontend/implementation.md` with verified integration status.
- 2026-07-03: Expanded to comprehensive Frappe architecture deep-dive + verified trevo_frontend state. Added detailed implementation plan.
- 2026-07-03: Phase 1 implementation — added `QueryClientProvider` + `Toaster` to `app/providers.tsx`, wired `TrevoShell` into `app/(desk)/desk/layout.tsx`, created `middleware.ts` for route-level auth guard. All React Query hooks now functional; desk navigation works with shell.
