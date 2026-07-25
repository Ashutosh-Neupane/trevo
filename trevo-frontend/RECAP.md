# Trevo — Frappe Headless Frontend

> Modern Next.js frontend for Frappe. Source of truth = live backend at `localhost:8080`.

---

## ✅ DONE

### Architecture
- **Next.js 16** app with App Router, TypeScript, Tailwind CSS v4.
- **BFF proxy pattern**: browser → `/api/frappe/*` → Frappe. No direct `:8080` calls from client.
- **sid re-issue on Next domain**: fixes cross-origin cookie issue from Frappe's SameSite=Lax.
- **Auth guard middleware**: redirects unauthenticated users to `/login`.
- **React Compiler** compatible: manual memoization preserved, no skipped optimizations.

### BFF routes (`app/api/`)
- Generic proxy: `frappe/[...path]` (GET/POST/PUT/DELETE)
- Auth: `/auth/login`, `/auth/logout`, `/auth/whoami`, `/boot`
- DocType: `/doctype/[doctype]/doc`, `/doc/[name]`, `/meta`, `/save`, `/count`, `/docinfo`

### Frappe client library (`lib/frappe/`)
- `server.ts` — server-side fetch with sid forwarding, `FrappeError`, `getCookieHeader()`
- `client.ts` — browser axios client (baseURL=/api/frappe), method/resource helpers, auth interceptors
- `types.ts` — full typed contract (DocTypeMeta, DocField, FrappeDocument, Workspace*, etc.)
- `doctype.ts` — DocType meta fetch (server + client)
- `document.ts` — fetchDocument, savedocs (Save/Submit/Update), cancelDoc, discardDoc, CRUD, fetchDocInfo, addComment
- `list.ts` — fetchList (server+client), fetchCount
- `workspace.ts` — sidebar items + workspace data (server+client)
- `search.ts` — searchLink, globalSearch
- `notification.ts` — fetchNotifications, markRead
- `upload.ts` — multipart file upload
- `report.ts` — runReport, fetchReportMeta
- `boot.ts` — assembleBootInfo (composes user + apps since `get_bootinfo` is 403)

### State & Data layer
- **Zustand stores**: `auth.store.ts` (user, bootInfo), `ui.store.ts` (sidebar, theme), `desk.store.ts` (recent docs)
- **TanStack Query hooks**: `useBootInfo`, `useWorkspaces`, `useWorkspace`, `useDoctype`, `useDoctypes`, `useDocument`, `useSaveDocument`, `useCancelDocument`, `useDiscardDocument`, `useList`, `useListCount`, `useSearchLink`, `useGlobalSearch`, `useNotifications`, `useMarkNotificationRead`, `useReport`, `useReportMeta`, `useReportsList`

### Pages & Shell
- `login/page.tsx` — email/password auth with error handling
- `desk/page.tsx` — dashboard with stat cards (Sales Order, Customer, Sales Invoice, Payment Entry) + workspace cards
- `desk/doctype/page.tsx` — all DocType list
- `desk/doctype/[doctype]/page.tsx` — list view with sorting, pagination, filters, bulk delete, proper meta-driven columns
- `desk/doctype/[doctype]/[name]/page.tsx` — detail view with tabs: Details, Comments, Attachments, Version History
- `desk/doctype/[doctype]/[name]/edit/page.tsx` — edit form with Save/Submit/Discard/Cancel actions
- `desk/doctype/[doctype]/new/page.tsx` — new document form
- `desk/workspace/[name]/page.tsx` — workspace shortcuts, links, number cards, charts placeholders
- `desk/forms/page.tsx` — searchable New Document selector
- `desk/reports/page.tsx` — report runner with results table
- `desk/calendar/page.tsx` — month-grid calendar navigation
- `desk/tasks/page.tsx` — Task list view
- `desk/settings/page.tsx` — profile + system settings from boot info
- `desk/list/page.tsx` — quick links to key DocTypes

### Components
- `TrevoShell.tsx` — header, collapsible sidebar with dynamic workspace items, theme toggle, command palette trigger, user menu
- `CommandPalette.tsx` — Ctrl+K palette with quick actions, workspace search, theme switcher
- `NotificationsPanel.tsx` — notification dropdown
- `shadcn/card.tsx`, `shadcn/tabs.tsx` — minimal primitives
- `Skeleton.tsx`, `ErrorBoundary.tsx`

### Dynamic form system (`lib/trevo-form/`)
- `FormRenderer.tsx` — renders full DocType forms with sections/tabs/columns, supports edit/new modes, accepts raw Frappe documents
- `FormControl.tsx` — dispatches to field controls by fieldtype
- `FormStore.ts` — section collapse state
- `parseDoctypeMeta.ts` — maps Frappe Section/Column/Tab breaks into Trevo sections
- Field controls: FormField, SelectField, DateField, DateTimeField, CheckField, IntField, FloatField, CurrencyField, TextEditorField, LinkField, AttachmentField, TableField, HTMLField, CodeField, ReadOnlyField, PasswordField

---

## ⏳ REMAINING

### Must-have for production parity
- [ ] **shadcn primitives**: button, input, label, select, checkbox, badge, dialog, dropdown-menu, popover, tooltip, separator, scroll-area, slot, avatar, textarea
- [ ] **Remaining field types**: Signature, Geolocation, Rating, Barcode, Duration, JSON, Table MultiSelect, Dynamic Link
- [ ] **Child table save backend**: ensure `savedocs` correctly serializes nested child table arrays with parent/child DocType relationships
- [ ] **List view filters**: proper date-range, numeric-range, link filters with operator selectors
- [ ] **List view export**: CSV/Excel export via Frappe API
- [ ] **Form validation**: client-side validation using Frappe meta (mandatory, regex, min/max) before save
- [ ] **Document actions**: Print, Email, Share, Delete with proper Frappe method calls
- [ ] **Navigation breadcrumbs**: path-aware breadcrumbs in shell
- [ ] **404 / error pages**: styled error states
- [ ] **Loading skeletons**: replace spinners with skeleton loaders in list/detail/reports

### Nice-to-have (Phase 2)
- [ ] **Charts**: workspace number cards with live counts, recharts integration for report charts
- [ ] **Notifications panel**: real-time notification list + mark-read
- [ ] **Global search**: cross-DocType search with ranking
- [ ] **Calendar events**: fetch Event/Task doctypes and render on calendar
- [ ] **Keyboard shortcuts**: Ctrl+S save, Ctrl+Z undo (form-level)
- [ ] **Auto-save**: draft autosave every 30s
- [ ] **Realtime updates**: Socket.io / frappe realtime for document changes
- [ ] **Import**: CSV import for list view
- [ ] **Bulk actions**: bulk submit, cancel, update

### Backend / infra
- [ ] **Frappe bench app**: move custom trial/billing logic out of frontend into a proper bench app if needed
- [ ] **Environment config**: NEXT_PUBLIC_FRAPPE_BASE_URL, FRAPPE_BACKEND_URL
- [ ] **Docker / deploy config**: vercel.json or Dockerfile
- [ ] **E2E tests**: Playwright against localhost:8080

---

## 🔑 Key design decisions
1. **BFF proxy** — browser → `/api/frappe/*` → Frappe. No direct :8080 calls.
2. **sid re-issued on Next domain** — Frappe sets SameSite=Lax on :8080; we re-issue on :3000.
3. **savedocs for Save/Submit** — the real Frappe desk path, runs server-side hooks.
4. **React Compiler** — manual memoization preserved, no skipped optimizations.
5. **Form renderer is headless-CMS ready** — accepts raw Frappe documents or empty meta, dynamically renders any DocType.
