# Trevo Frontend — Build Recap

> Status as of this commit. Source of truth = LIVE Frappe backend at `localhost:8080` (verified by curl before coding).

---

## ✅ DONE (line-by-line recap)

> Note: This file is updated by manually mapping the currently-open/verified implementation files. Some “Remaining” items in the old recap are unchanged.

### app/api/auth/login/route.ts
1. `/** ... */` comment: describes POST /api/auth/login proxy and sid re-issue.
2. `import { NextResponse } ...` imports Next.js response helper.
3. `import { cookies } ...` lets server read incoming cookies.
4. `import { FRAPPE_BACKEND_URL } ...` uses configured backend URL.
5. `export async function POST(req)` declares handler for POST.
6. Parse JSON body via `await req.json().catch(() => ({}))`.
7. Extract `email` and `password` from body.
8. If missing, return 400 with `{ message: "Missing email/password" }`.
9. `const cookieJar = await cookies()` reads cookies in Next request context.
10. `cookieHeader = cookieJar.toString()` builds cookie header string.
11. Builds target URL: `${FRAPPE_BACKEND_URL}/api/method/login`.
12. Calls Frappe login via `fetch(url, { method: "POST", headers..., body: JSON.stringify({ usr: email, pwd: password }) })`.
13. Parses response JSON and tolerates failure: `await res.json().catch(() => null)`.
14. If `!res.ok`, returns Next error with message fallback and status `res.status`.
15. Reads Set-Cookie headers from Frappe response: `res.headers.getSetCookie?.() ?? []`.
16. Creates Next JSON response: `NextResponse.json(...)`.
17. Extracts `sid` cookie value by regex `/^sid=([^;]+)/` over each Set-Cookie entry.
18. If `sidValue` exists, re-issues `sid` cookie on Next domain using `response.cookies.set("sid", sidValue, { httpOnly:true, sameSite:"lax", path:"/", maxAge: 60*60*24*7 })`.
19. Returns the response.

### app/api/frappe/[...path]/route.ts
1. `/** ... */` comment explains generic BFF proxy and responsibilities.
2. Imports NextRequest/NextResponse.
3. Imports FRAPPE_BACKEND_URL.
4. Sets `const BACKEND = FRAPPE_BACKEND_URL`.
5. Declares `export async function GET(req,{params})` that calls `proxyRequest(req,"GET",params)`.
6. Same for `POST`, `PUT`, `DELETE`.
7. `proxyRequest` awaits `paramsPromise` and joins `path` segments with `/`.
8. Builds backend URL: `new URL(`${BACKEND}/${frappePath}`)`.
9. Forwards query params from caller to backend: `req.nextUrl.searchParams.forEach(...)`.
10. Creates default headers: Accept JSON + `X-Frappe-CSRF-Token: fetch`.
11. Forwards incoming cookies with `req.headers.get("cookie")`.
12. Reads `content-type` from incoming request.
13. Creates `fetchOpts` with method + headers.
14. If POST/PUT and multipart: forwards raw body via `await req.arrayBuffer()` and preserves content-type.
15. Else if JSON: reads text body via `await req.text()` and sets `fetchOpts.body` + `Content-Type: application/json`.
16. Calls backend `fetch(url.toString(), fetchOpts)` with try/catch; on failure returns 502.
17. Creates `responseHeaders` for outgoing response.
18. Forwards `Set-Cookie` headers from backend to client: appends each cookie to responseHeaders.
19. Reads backend response body as text `await res.text()`.
20. Sets `Content-Type` header from backend.
21. Returns `new NextResponse(body,{ status: res.status, headers: responseHeaders })`.

### app/api/doctype/[doctype]/doc/route.ts
1. Imports NextRequest/NextResponse.
2. Imports frappeServerFetch + getCookieHeader from `lib/frappe/server`.
3. `GET` handler reads `doctype` from params.
4. Reads cookie header via `getCookieHeader()`.
5. Reads search params from `req.nextUrl.searchParams`.
6. Calls Frappe REST: `api/resource/:doctype` with `params: Object.fromEntries(searchParams.entries())`.
7. Returns `{ data: data ?? [] }` JSON.
8. Catches errors and returns `{ error: err.message }` with computed status.
9. `POST` handler reads doctype and request JSON body.
10. Calls whitelisted save/REST create style via `frappeServerFetch(..., "api/resource/:doctype", { method:"POST", body })`.
11. Returns `{ data }` with status 201.
12. Catch returns error JSON similarly.

### app/api/doctype/[doctype]/save/route.ts
1. Imports NextRequest/NextResponse.
2. Imports frappeServerFetch + getCookieHeader.
3. `POST` reads `doctype` from params.
4. Reads cookie header.
5. Parses body via `await req.json()`.
6. Calls Frappe whitelisted method `frappe.desk.form.save.savedocs`.
7. Sends `{ doc: JSON.stringify({ doctype, ...body }), action: "Save" }`.
8. Returns `{ data }` status 201.
9. Catch returns `{ error }` and status.

### app/api/doctype/[doctype]/docinfo/route.ts
1. Imports NextRequest/NextResponse and server fetch helpers.
2. `GET` reads `{ doctype, name }` from params.
3. Reads cookie header.
4. Calls Frappe method `frappe.desk.form.load.get_doc_info`.
5. Supplies `params: { doctype, name }`.
6. Returns `NextResponse.json({ data: data ?? {} })`.
7. Catch returns `{ error }`.

### app/api/doctype/[doctype]/meta/route.ts
1. Imports NextResponse + server fetch helpers.
2. `GET` reads doctype from params.
3. Reads cookie header.
4. Calls Frappe resource: `api/resource/DocType/:doctype`.
5. If no data, returns 404 with `{ error: "DocType not found" }`.
6. Else returns `{ data }`.
7. Catch returns `{ error }`.

### lib/frappe/server.ts
1. Block comment explains server-side client usage and sid forwarding.
2. Imports `FrappeAPIResponse` type.
3. Computes `BACKEND_URL` from env vars with fallback `http://localhost:8080`.
4. Exports `FRAPPE_BACKEND_URL`.
5. Defines `FrappeError` class with `status`, `excType`, and `serverMessages`.
6. Defines `ServerFetchOptions` typing.
7. Defines internal `ResolvedFetch` interface (data, status, ok, setCookies, envelope).
8. Implements `frappeServerFetch` signature.
9. Destructures options with defaults: method, params, body/rawBody, headers, throwOnError.
10. Builds URL `${BACKEND_URL}/${path.replace(/^\//,'')}`.
11. If params exist, sets them as query params; object params get JSON.stringify.
12. Builds request headers: Accept JSON, `X-Frappe-CSRF-Token: fetch`, plus extra headers.
13. If rawBody provided: uses it and sets content-type if given.
14. Else if body provided: JSON.stringify(body) and sets Content-Type application/json.
15. If cookieHeader provided, sets `Cookie` header.
16. Calls fetch with `cache: "no-store"`.
17. On network error, throws `FrappeError` with status 502.
18. Reads `setCookies` from response and reads body as text.
19. Parses JSON into `envelope` if possible.
20. If not ok and throwOnError, extracts message from envelope `exc`/`exception` and throws `FrappeError`.
21. Unwraps envelope: methods use `message`, REST uses `data`.
22. Returns `{ data, status, ok, setCookies, envelope }`.
23. `parseServerMessagesSafe` helper parses `_server_messages` if JSON.
24. `getCookieHeader()` reads cookies() and returns jar.toString().

### lib/frappe/auth.tsx
1. Declares client component.
2. Imports React hooks + `FrappeUser` type.
3. Imports clientLogin/clientLogout/clientWhoAmI/clientBoot.
4. Defines `UserContext` interface (user, loading, login/logout).
5. Creates `AuthContext` with defaults.
6. `AuthProvider` holds `user` state and `loading` state.
7. `refresh()` calls Promise.all([whoami, boot]).
8. If `whoami` is missing or Guest, sets user null.
9. Reads bootInfo.user and constructs fullUser shape (name/email/full_name + other fields).
10. Sets user via `setUser(fullUser)`.
11. Catch sets user null.
12. finally sets loading false.
13. `useEffect` calls `refresh()` on mount.
14. login() awaits clientLogin then refresh().
15. logout() awaits clientLogout and sets user null.
16. Returns `AuthContext.Provider` with value.
17. Exposes `useAuth()` hook.

### app/(auth)/login/page.tsx
1. Declares client component.
2. Imports React state + Next router.
3. Imports `useAuth` context.
4. Component initializes router + { login, user, loading }.
5. Local state: email/password/error/submitting.
6. `onSubmit` prevents default, clears error, sets submitting.
7. Calls `login(email,password)`.
8. On success navigates to `/desk`.
9. On error sets `error` from thrown exception’s `message`.
10. finally sets submitting false.
11. If not loading and user exists, `router.replace("/desk")`.
12. Renders login form with input bindings.

### app/(desk)/desk/layout.tsx
1. Server layout for desk route group.
2. Uses `redirect`.
3. Async function fetches whoami from `/api/auth/whoami` with `cache: "no-store"`.
4. Parses JSON response.
5. If no user / Guest, redirects to `/login`.
6. Catch redirects to `/login`.
7. If authenticated, returns fragment with children.

### app/(desk)/desk/page.tsx
1. client component (uses hooks).
2. Imports Link + router.
3. Uses `useAuth()` for user/loading.
4. also stores `serverUser` local state.
5. First effect: calls `frappeWhoAmI()` and stores into serverUser.
6. Second effect: if auth loading done and no user, router.replace('/login').
7. Shows “Session” UI and navigation links.

### components/TrevoShell.tsx
1. client component.
2. NavItem helper uses `usePathname` to highlight active routes.
3. TrevoShell renders header with Trevo brand + user name + Logout button (calls logout from useAuth()).
4. Sidebar lists nav items (Dashboard/List/Forms/Reports/Tasks/Calendar/Settings).
5. main content shows `children`.

---

## ✅ DONE (legacy summary kept for context)

### 0. Backend contract verified (empirically, against localhost:8080)
- Login: `POST /api/method/login` `{usr,pwd}` → `{message:"Logged In", home_page, full_name}`, sets `sid` cookie. ✅ (Administrator/admin)
- `get_bootinfo` → **403 NOT whitelisted**. BFF now assembles boot info instead.
- Workspace sidebar → `{message:{pages:[...]}}` (key is `pages`, NOT `workspaces`).
- `resource/Workspace/:name` → shortcuts/links/charts/number_cards. Links carry `link_type` AND `type`.
- `resource/DocType/:name` → meta. Fieldtype **"Text Editor"** (not "HTML Editor").
- REST CRUD on `/api/resource/*` → `{data:...}`. Works without CSRF token (verified).
- `frappe.client.get_count`, `search_link`, `get_doc_info`, `savedocs` → all verified working.
- **CSRF is NOT enforced** for cookie-auth REST/method calls → no token plumbing needed.

### 1. Dependencies installed
- zustand, @tanstack/react-query, react-hook-form, @hookform/resolvers, zod, date-fns, clsx, tailwind-merge, class-variance-authority, lucide-react, sonner, cmdk
- @radix-ui/* (dialog, dropdown-menu, tooltip, select, popover, tabs, checkbox, avatar, separator, scroll-area, slot, label)

### 2. Lib layer (real contract)
- `lib/frappe/types.ts` — full typed contract (real key names)
- `lib/utils.ts` — cn(), formatters (date/number/currency), Frappe helpers (truthy, parseSelectOptions, docStatusLabel, encodeFilters, parseServerMessages, debounce)
- `lib/frappe/server.ts` — server-side fetch to Frappe (forwards sid cookie), FrappeError, getCookieHeader()
- `lib/frappe/client.ts` — browser axios client (baseURL=/api/frappe), method/resource helpers, clientLogin/Logout/WhoAmI/Boot, 403→/login interceptor
- `lib/frappe/doctype.ts` — meta fetch (server + client)
- `lib/frappe/document.ts` — fetchDocument, **savedocs** (Save/Submit/Update), cancelDoc, discardDoc, CRUD, fetchDocInfo, addComment
- `lib/frappe/list.ts` — fetchList (server+client), fetchCount
- `lib/frappe/workspace.ts` — sidebar items + workspace data (server+client)
- `lib/frappe/search.ts` — searchLink, globalSearch
- `lib/frappe/notification.ts` — fetchNotifications, markRead
- `lib/frappe/upload.ts` — uploadFile (multipart)
- `lib/frappe/report.ts` — runReport, fetchReportMeta
- `lib/frappe/boot.ts` — assembleBootInfo (composes user + User resource + apps)

### 3. Stores (Zustand)
- `lib/stores/auth.store.ts` — user, bootInfo, bootLoaded
- `lib/stores/ui.store.ts` — sidebarOpen, theme (persisted, applies data-theme)
- `lib/stores/desk.store.ts` — activeWorkspace, recentDocs

### 4. Hooks (TanStack Query)
- useBootInfo, useWorkspaces (+useWorkspace), useDoctype, useDocument (+useSaveDocument/useCancelDocument/useDiscardDocument), useList (+useListCount), useSearch (+useGlobalSearch), useNotifications (+useMarkNotificationRead)

### 5. BFF routes
- `app/api/frappe/[...path]/route.ts` — generic proxy (GET/POST/PUT/DELETE), forwards sid + query + body + Set-Cookie
- `app/api/boot/route.ts` — assembles boot info
- `app/api/auth/login/route.ts` — proxies login, **re-issues sid on Next domain** (fixes cross-origin cookie)
- `app/api/auth/logout/route.ts` — proxies logout, clears sid on Next domain
- `app/api/auth/whoami/route.ts` — returns current user email (or null)

---

## ⏳ REMAINING (per approved plan)


### 0. Backend contract verified (empirically, against localhost:8080)
- Login: `POST /api/method/login` `{usr,pwd}` → `{message:"Logged In", home_page, full_name}`, sets `sid` cookie. ✅ (Administrator/admin)
- `get_bootinfo` → **403 NOT whitelisted**. BFF now assembles boot info instead.
- Workspace sidebar → `{message:{pages:[...]}}` (key is `pages`, NOT `workspaces`).
- `resource/Workspace/:name` → shortcuts/links/charts/number_cards. Links carry `link_type` AND `type`.
- `resource/DocType/:name` → meta. Fieldtype **"Text Editor"** (not "HTML Editor").
- REST CRUD on `/api/resource/*` → `{data:...}`. Works without CSRF token (verified).
- `frappe.client.get_count`, `search_link`, `get_doc_info`, `savedocs` → all verified working.
- **CSRF is NOT enforced** for cookie-auth REST/method calls → no token plumbing needed.

### 1. Dependencies installed
- zustand, @tanstack/react-query, react-hook-form, @hookform/resolvers, zod, date-fns, clsx, tailwind-merge, class-variance-authority, lucide-react, sonner, cmdk
- @radix-ui/* (dialog, dropdown-menu, tooltip, select, popover, tabs, checkbox, avatar, separator, scroll-area, slot, label)

### 2. Lib layer (real contract)
- `lib/frappe/types.ts` — full typed contract (real key names)
- `lib/utils.ts` — cn(), formatters (date/number/currency), Frappe helpers (truthy, parseSelectOptions, docStatusLabel, encodeFilters, parseServerMessages, debounce)
- `lib/frappe/server.ts` — server-side fetch to Frappe (forwards sid cookie), FrappeError, getCookieHeader()
- `lib/frappe/client.ts` — browser axios client (baseURL=/api/frappe), method/resource helpers, clientLogin/Logout/WhoAmI/Boot, 403→/login interceptor
- `lib/frappe/doctype.ts` — meta fetch (server + client)
- `lib/frappe/document.ts` — fetchDocument, **savedocs** (Save/Submit/Update), cancelDoc, discardDoc, CRUD, fetchDocInfo, addComment
- `lib/frappe/list.ts` — fetchList (server+client), fetchCount
- `lib/frappe/workspace.ts` — sidebar items + workspace data (server+client)
- `lib/frappe/search.ts` — searchLink, globalSearch
- `lib/frappe/notification.ts` — fetchNotifications, markRead
- `lib/frappe/upload.ts` — uploadFile (multipart)
- `lib/frappe/report.ts` — runReport, fetchReportMeta
- `lib/frappe/boot.ts` — assembleBootInfo (composes user + User resource + apps)

### 3. Stores (Zustand)
- `lib/stores/auth.store.ts` — user, bootInfo, bootLoaded
- `lib/stores/ui.store.ts` — sidebarOpen, theme (persisted, applies data-theme)
- `lib/stores/desk.store.ts` — activeWorkspace, recentDocs

### 4. Hooks (TanStack Query)
- useBootInfo, useWorkspaces (+useWorkspace), useDoctype, useDocument (+useSaveDocument/useCancelDocument/useDiscardDocument), useList (+useListCount), useSearch (+useGlobalSearch), useNotifications (+useMarkNotificationRead)

### 5. BFF routes
- `app/api/frappe/[...path]/route.ts` — generic proxy (GET/POST/PUT/DELETE), forwards sid + query + body + Set-Cookie
- `app/api/boot/route.ts` — assembles boot info
- `app/api/auth/login/route.ts` — proxies login, **re-issues sid on Next domain** (fixes cross-origin cookie)
- `app/api/auth/logout/route.ts` — proxies logout, clears sid on Next domain
- `app/api/auth/whoami/route.ts` — returns current user email (or null)

---

## ⏳ REMAINING (per approved plan)

### Phase 1 (vertical slice — in progress)
- [ ] Providers (QueryClient + Toaster), globals.css theme, root layout
- [ ] middleware.ts auth guard
- [ ] shadcn UI primitives (button, input, card, badge, etc.)
- [ ] Desk shell: Navbar, Sidebar, CommandPalette, NotificationPanel
- [ ] Workspace renderer (shortcuts/links/number cards)
- [ ] List view (table, filters, pagination)
- [ ] Form view (header, layout, field types, child table, save via savedocs)
- [ ] Run dev server + test end-to-end against localhost:8080

### Phase 2 (deferred)
- Reports view, full child-table editor, full timeline (version diffs), bulk actions, charts (recharts), remaining field types (Signature, Geolocation, Rating, Barcode, Code, Duration, JSON, Autocomplete, Dynamic Link, Table MultiSelect, Button, HTML), command-palette cross-doctype search

---

## 🔑 Key design decisions (locked)
1. **BFF proxy** — browser → `/api/frappe/*` → Frappe. No direct :8080 calls.
2. **sid re-issued on Next domain** — Frappe sets SameSite=Lax on :8080; we re-issue on :3000 so the browser sends it back.
3. **savedocs** for Save/Submit/Cancel (the real desk path, runs server-side hooks).
4. **SSR** — workspace/list/form pages fetch initial data server-side, hydrate client components.
