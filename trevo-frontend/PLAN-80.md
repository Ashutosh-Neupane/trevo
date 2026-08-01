# Porting to 80-85% — Execution Plan

**Current state**: ~65-70% (verified by reading all actual code)
**Target**: 80-85%

## Phase 1: Core Gaps (highest impact)

### 1. Timeline Comment Posting (4h)
- Add `add_comment` input box in the document detail page
- Wire to `frappeMethod("frappe.client.insert")` or `frappe.desk.form.add_comment`
- **Files**: `app/(desk)/desk/doctype/[doctype]/[name]/page.tsx`

### 2. Dashboard Charts on Home Page (6h)
- Wire chart widgets on the desk home page using `frappe.desk.query_report.run`
- Show real chart data for Sales Orders, Invoices, etc.
- **Files**: `app/(desk)/desk/page.tsx`

### 3. Query Reports Builder (8h)
- Add filter UI, column selector, and aggregation to the report runner
- **Files**: `app/(desk)/desk/reports/page.tsx`, `lib/frappe/report.ts`

### 4. Kanban Settings — Functional Board Management (4h)
- Add column add/remove in settings dialog
- Board creation dialog
- **Files**: `components/features/kanban/KanbanBoard.tsx`

## Phase 2: Integration & Polish

### 5. Data Import Server API Route (3h)
- Create `app/api/doctype/[doctype]/import/route.ts` that proxies to Frappe's data import
- **Files**: `app/api/doctype/[doctype]/import/route.ts`

### 6. FrappeScriptBridge — Script Fetching (3h)
- Fetch client scripts from Frappe API
- Execute onload/onchange scripts
- **Files**: `lib/trevo-form/frappeScriptBridge.tsx`

### 7. Filter URL Persistence (2h)
- Sync advanced filters to URL search params
- Restore on page load
- **Files**: `app/(desk)/desk/doctype/[doctype]/page.tsx`

### 8. Loading/Error Boundaries (3h)
- Add loading.tsx and error.tsx for missing route segments
- **Files**: `app/(desk)/desk/calendar/`, `doctype/new/`, `forms/`, `list/`, `settings/`, `tasks/`, `(auth)/login/`

### 9. List View Settings (3h)
- Custom column visibility, ordering, grouping
- **Files**: `components/features/list-view-settings/`

## Phase 3: Documentation Sync

### 10. Update all docs to match actual state (2h)
- TODO.md, PLAN-TODO.md, implementation1/34, implementation.md

## Estimated Effort: ~38h
## Target completion: 80-85%
