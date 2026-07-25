# Trevo Frontend — Context for next AI

**Goal:** Next.js 14+/App Router frontend replacing Frappe's `/app` desk UI. Consumes Frappe REST API only (no Frappe JS UI). `npm run dev` → test at `localhost:3000`.

## WHERE THINGS ARE
```
trevo-frontend/
├── lib/frappe/        API layer (DONE)
│   ├── types.ts       Typed Frappe contract (REAL key names)
│   ├── client.ts      Browser axios → /api/frappe/* (frappeMethod/Get/Post/Put/Delete, clientLogin/Logout/WhoAmI/Boot)
│   ├── server.ts      Server fetch → Frappe direct (frappeServerFetch, FrappeError, getCookieHeader)
│   ├── doctype.ts document.ts list.ts workspace.ts search.ts notification.ts upload.ts report.ts boot.ts
├── lib/stores/        auth.ui.desk (zustand, DONE)
├── lib/hooks/         react-query hooks: useBootInfo/useWorkspaces/useDoctype/useDocument/useList/useSearch/useNotifications (DONE)
├── lib/utils.ts       cn(), fmtDate/Number/Currency, parseSelectOptions, docStatusLabel, encodeFilters (DONE)
├── app/api/           BFF routes (DONE)
│   ├── frappe/[...path]/route.ts   Generic proxy GET/POST/PUT/DELETE → Frappe
│   ├── boot/route.ts               Assembles boot info
│   └── auth/{login,logout,whoami}/route.ts  Re-issues sid on Next domain
├── app/(auth)/login/page.tsx       NEEDS REBUILD (currently stub using old auth)
├── app/(desk)/desk/{layout,page}.tsx  NEEDS REBUILD (TrevoShell uses old auth)
├── app/{layout.tsx,providers.tsx,globals.css}  NEEDS REWRITE
├── components/        NEEDS: layout/, workspace/, list/, form/, ui/ (shadcn)
└── middleware.ts      NEEDS CREATE (auth guard)
```

## VERIFIED BACKEND CONTRACT (localhost:8000, curl-tested — DO NOT re-verify)
- **Creds:** Administrator / admin
- **Login:** `POST /api/method/login {usr,pwd}` → `{message:"Logged In",home_page,full_name}`, sets `sid` (HttpOnly, SameSite=Lax, domain=:8000)
- **get_bootinfo → 403 NOT whitelisted.** BFF `/api/boot` assembles it: get_logged_user + resource/User/:email + frappe.apps.get_apps
- **Workspace sidebar:** `frappe.desk.desktop.get_workspace_sidebar_items` → `{message:{pages:[...]}}`. **Key is `pages` NOT `workspaces`.** Each item: name,title,icon,indicator_color,parent_page,public,is_hidden
- **Workspace detail:** `resource/Workspace/:name` → shortcuts[],links[],charts[],number_cards[]. Links carry `link_type`(DocType/Report) AND `type`, plus `link_count`
- **DocType meta:** `resource/DocType/:name` → `{data:{fields[],permissions[],is_submittable,autoname,...}}`. Fieldtype is **"Text Editor"** (NOT "HTML Editor"). in_list_view flags list columns
- **List:** `GET resource/:doctype?fields=[...]&filters=[[f,op,val]]&limit_page_length=20&limit_start=0&order_by=modified%20desc` → `{data:[...]}`
- **Count:** `frappe.client.get_count?doctype=X&filters=[...]` → `{message:N}`
- **CRUD:** POST/PUT/DELETE `resource/:doctype/:name`. **CSRF NOT enforced** for cookie-auth → no token needed
- **Save:** `frappeMethod("frappe.desk.form.save.savedocs",{doc:JSON.stringify(doc),action})`. action∈{Save,Submit,Update}. Also: `cancel`(doctype,name), `discard`(doctype,name)
- **search_link:** `frappe.desk.search.search_link {doctype,txt,page_length}` → `{message:[{value,label,description}]}`
- **get_doc_info:** `frappe.desk.form.load.get_doc_info {doctype,name}` → `{docinfo:{comments,attachments,versions,...}}`

## ARCHITECTURE (locked decisions)
1. **BFF proxy** — browser → `/api/frappe/*` route → Frappe. Never call :8000 from browser (CORS).
2. **sid re-issued on Next domain** — Frappe sets sid on :8000 (SameSite=Lax won't cross to :3000). Login route re-issues it HttpOnly on localhost:3000 so every Next request carries it. See `app/api/auth/login/route.ts`.
3. **savedocs** for form Save/Submit/Cancel.
4. **SSR** — pages are RSC: fetch meta+data server-side via frappeServerFetch(cookie), pass to client components for interactivity.

## TECH STACK (installed)
Next 16 App Router, React 19, TS, Tailwind v4 (`@import "tailwindcss"` in globals.css, `@theme` block), shadcn/ui (Radix), zustand, @tanstack/react-query, react-hook-form+zod, date-fns, lucide-react, sonner, cmdk, axios.

## NEXT TASKS (Phase 1 vertical slice — do IN ORDER)
1. **app/providers.tsx** — QueryClientProvider + `<Toaster/>` (sonner). Client component.
2. **app/globals.css** — theme CSS vars (`--color-primary` etc) + `[data-theme=dark]` overrides + base styles. Tailwind v4 `@theme inline`.
3. **app/layout.tsx** — root layout, Inter font, wrap children in Providers. Keep Geist or swap to Inter.
4. **middleware.ts** — guard `/desk,/list,/form,/workspace,/report`; redirect `/login` if no `sid` cookie or sid==="Guest".
5. **shadcn primitives** in `components/ui/`: button,input,textarea,label,card,badge,dropdown-menu,tooltip,tabs,select,checkbox,avatar,breadcrumb,skeleton,separator,scroll-area,command,popover,dialog. (Use shadcn source patterns; deps already installed. cn() is in lib/utils.ts)
6. **app/(desk)/desk/layout.tsx** — `<DeskShell>` client comp: Navbar (top) + Sidebar (left) + main.
7. **components/layout/** — Navbar (logo, search→Ctrl+K, notifications bell, user dropdown), Sidebar (workspaces from useWorkspaces, grouped public/private, active state), CommandPalette (cmdk), NotificationPanel.
8. **app/(desk)/desk/page.tsx** — redirect to first workspace.
9. **app/(desk)/desk/workspace/[name]/page.tsx** (RSC) + `components/workspace/` — WorkspacePage renders shortcuts grid, links sections (grouped by Card Break), number cards (fetch via frappe.client.get_count/get_value).
10. **app/(desk)/desk/list/[doctype]/page.tsx** (RSC fetches meta+first page) + `components/list/` — ListView: ListTable (columns from in_list_view), ListFilters (add filter row: field/op/value), ListPagination (page size, prev/next, count).
11. **app/(desk)/desk/form/[doctype]/{new,[name]}/page.tsx** (RSC fetches meta+doc) + `components/form/` — FormView: FormHeader (title, docstatus badge, Save/Submit/Cancel via savedocs), FormLayout (Section/Column/Tab Break → render cards/tabs; iterate fields → FormFieldRenderer), fields/ (one per type: Data,Text,TextEditor,Select,Link→autocomplete,Check,Date,Datetime,Time,Int,Float,Currency,ReadOnly,Attach,Color), ChildTable (inline grid), FormSidebar (attachments/assignments), FormTimeline (comments).

## ROUTES
- `/login` (auth) · `/desk` (redirect→first workspace) · `/desk/workspace/:name` · `/desk/list/:doctype` · `/desk/form/:doctype/new` · `/desk/form/:doctype/:name`

## CONVENTIONS
- Frappe bools are 0/1 → use `truthy()`/`toBool()` in lib/utils.ts
- Select `options` is newline-separated → `parseSelectOptions()`
- All shadcn comps use `cn()` from `@/lib/utils`
- Client comps start with `"use client"`
- Errors: 403→redirect /login (interceptor in client.ts). Show sonner toasts.

## KNOWN BUILD FIXES NEEDED (do these first)
- `app/(desk)/desk/page.tsx`, `app/(auth)/login/page.tsx`, `app/providers.tsx`, `components/TrevoShell.tsx` reference deleted `@/lib/frappe/auth` — rebuild or stub.
- `lib/frappe/upload.ts` has bad cast — fix return unwrap.
- `lib/frappe/{document,list}.ts` server params type too narrow — widen to `Record<string, string|number|boolean|undefined|null|object>`.

## ENV
`.env.local`: `NEXT_PUBLIC_FRAPPE_BASE_URL=http://localhost:8000`. Add `FRAPPE_BACKEND_URL=http://localhost:8000` (server-side, used by lib/frappe/server.ts — already defaults correctly).

See RECAP.md for detailed done/pending status.
