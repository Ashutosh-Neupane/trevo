# Trevo Frontend - Implementation Progress

## Section 34: Frappe Frontend Porting

### Current Status: ~60–65% complete (updated from 35%)

> Legend: ✅ Done · ⚠️ Partial/Stub · ❌ Not Started
> See `implementation1/34-frappe-frontend-porting-gap-analysis.md` for the full analysis.

---

### P0: Core Views (Phase 1)

#### P0-6: Bulk Operations
- [x] P0-6.1: Create BulkActions component with action menu
- [x] P0-6.2: Create BulkEditDialog with field/value selection
- [x] P0-6.3: Create BulkPrintDialog with letterhead/format options
- [x] P0-6.4: Create AssignToDialog for bulk assignment
- [ ] P0-6.5: **Wire BulkActions into the doctype list page** (currently the list page uses an inline bulk bar)
- [x] P0-6.6: Copy to clipboard functionality

#### P0-5: Advanced List Filters
- [x] P0-5.1: Create saved filter layouts system
- [x] P0-5.2: Add multi-condition filter groups (AND/OR)
- [x] P0-5.3: Add date range presets
- [x] P0-5.4: Create filter operator selection component
- [x] P0-5.5: Create layout management dialog
- [ ] P0-5.6: **Wire AdvancedFilters into the doctype list page** (currently the list page uses the simpler `ListFilters`)
- [ ] P0-5.7: Add filter URL state persistence

#### P0-1: Kanban Board View
- [x] P0-1.1: Create KanbanBoard main component
- [x] P0-1.2: Create KanbanColumn with card list
- [x] P0-1.3: Create KanbanCard component
- [ ] P0-1.4: **Replace HTML5 DnD with @dnd-kit** (library already installed)
- [x] P0-1.5: Add card creation in columns
- [x] P0-1.6: Add column management (add/archive/restore)
- [ ] P0-1.7: **KanbanSettings dialog is read-only** — implement board creation + column add/remove
- [x] P0-1.8: Create API route for kanban data
- [x] P0-1.9: Integrate into view router (tabs in doctype page)

#### P0-2: Gantt View
- [x] P0-2.1: Create GanttView wrapper component
- [x] P0-2.2: Add view mode buttons (Day/Week/Month/Quarter)
- [x] P0-2.3: Implement working scroll/navigation (scroll ref, prev/next with disabled states)
- [x] P0-2.4: Add progress tracking
- [x] P0-2.5: Create API route for gantt data
- [x] P0-2.6: Integrate into view router

#### P0-3: Dashboard View
- [x] P0-3.1: Create DashboardView component
- [x] P0-3.2: Create NumberCard widget component
- [x] P0-3.3: Create ChartWidget component with recharts
- [ ] P0-3.4: **Wire real chart data** (currently renders `data={[]}`)
- [ ] P0-3.5: **Add customize mode** (add/remove/reorder widgets)
- [ ] P0-3.6: **Create API routes for dashboard chart data** (currently hardcoded empty)
- [ ] P0-3.7: **Connect DashboardView to the desk home page** (home uses static stat cards)

#### P0-4: Data Import/Export
- [x] P0-4.1: Create ExportDialog with field selection
- [x] P0-4.2: Create ImportDialog with CSV upload/preview
- [x] P0-4.3: Add MultiCheck field selection component
- [x] P0-4.4: Add filter area for filtered export
- [ ] P0-4.5: **Create API routes for import/export** (currently client-side papaparse only)
- [x] P0-4.6: Add template download functionality
- [ ] P0-4.7: **Wire ImportDialog/ExportDialog into the doctype list page**

#### P0-7: Form Builder
- [ ] P0-7.1: Create FormBuilder main component
- [ ] P0-7.2: Create FieldPalette sidebar
- [ ] P0-7.3: Create drag-and-drop field placement
- [ ] P0-7.4: Create FieldProperties editor
- [ ] P0-7.5: Add section/column management
- [ ] P0-7.6: Create preview mode
- [ ] P0-7.7: Create API routes for form builder
- [ ] P0-7.8: Save/load form customizations

### Phase P1: Important Features

- [x] P1-1: Realtime/Socket.io integration — `lib/services/realtime.ts` (shared singleton) + `useRealtimeUpdates.ts` (typed subscriptions for doc_update/docinfo_update/list_update/new_comment/version)
- [ ] P1-2: **Query Report builder** (runner exists; add filters/columns/aggregation UI)
- [ ] P1-3: Print Format Builder
- [ ] P1-4: **Workflow Actions** (workflow state transitions UI)
- [x] P1-5: Form Timeline (comments, activity log, versions) — `components/features/timeline/FormTimeline.tsx`
- [ ] P1-6: File View/Browser
- [x] P1-7: Communication/Timeline — read-only tabs (comments/attachments/versions) in detail page
- [x] P1-8: Assign To Dialog — `components/features/bulk-operations/AssignToDialog.tsx`
- [x] P1-9: ShareDialog wired — `frappe.share.add`/`get_users`/`remove` via BFF proxy with user search, permission levels, existing-user list
- [ ] P1-10: **Linked With panel** (`frappe.desk.form.utils.get_linked_docs`)
- [x] P1-11: Global Search — CommandPalette + `lib/frappe/search.ts` (searchLink, globalSearch)
- [x] P1-12: Number Cards — live counts in workspace page
- [x] P1-13: Undo Manager — Ctrl+Z 50-entry stack in FormRenderer
- [ ] P1-14: List View Settings — saved column layouts / grouping / per-user settings

### Phase P2: Nice-to-Have Features

- [ ] P2-1: Map View
- [ ] P2-2: Image View
- [ ] P2-3: Inbox View
- [x] P2-4: Tree View — `components/features/tree/TreeView.tsx` + API route + integrated
- [ ] P2-5: Translation Manager
- [ ] P2-6: Web Forms
- [ ] P2-7: DataTable (inline editing)
- [ ] P2-8: Quick Entry
- [ ] P2-9: Document Follow
- [ ] P2-10: Form Tour
- [ ] P2-11: User Onboarding
- [ ] P2-12: Color Picker
- [ ] P2-13: Icon Picker
- [x] P2-14: Barcode field (input only, no scanner)
- [ ] P2-15: Tag Editor
- [ ] P2-16: Role & Permission Editor
- [ ] P2-17: Module Editor
- [x] P2-18: Theme Switcher — light/dark toggle in TrevoShell
- [x] P2-19: PDF/CSV Export — CSV/JSON client export + `download_pdf` in DocumentActions
- [ ] P2-20: Preview Email
- [ ] P2-21: System Console
- [ ] P2-22: Workflow Builder

---

## Phase A: Wire & Fix Existing Features (CURRENT SPRINT)

- [x] Implement Gantt scroll/navigation (scroll ref, prev/next disabled states)
- [x] Wire ShareDialog into DocumentActions (real share API via BFF)
- [x] Implement Realtime socket.io connection (lib/services/realtime.ts + useRealtimeUpdates)
- [ ] Wire BulkActions into doctype list page
- [ ] Wire AdvancedFilters into doctype list page
- [ ] Wire ImportDialog/ExportDialog into doctype list page
- [ ] Connect DashboardView to real chart data
- [ ] Kanban: switch to @dnd-kit, make settings dialog functional
- [ ] Make Form Timeline comment posting work (add_comment)

## Phase B: Build Remaining High-Impact Features

- [ ] P0-7: Form Builder (24h)
- [ ] P1-4: Workflow Actions (8h)
- [ ] P1-10: Linked With panel (4h)
- [ ] P1-2: Query Report builder (8h)
- [ ] P1-6: File View/Browser (8h)

## Phase C: SSR & Next.js Improvements

- [ ] Convert `desk/doctype/page.tsx` to Server Component (already partially server-side)
- [ ] Convert `desk/doctype/[doctype]/page.tsx` list view to SSR-first with client islands
- [ ] Convert `desk/reports`, `desk/calendar`, `desk/workspace` to SSR where possible
- [ ] Add route-specific `loading.tsx` / `error.tsx` boundaries
- [ ] Add `React.cache()` for server data fetching dedup
- [ ] Add `generateMetadata` for SEO
- [ ] Add ISR where static data allows (doctype list, meta)

---

## Other Phases (Architecture / Quality / Testing)

## Phase 1: Architecture & Quality (Priority: HIGH)
- [ ] P1.1: Split lib/utils.ts into domain-specific utilities
- [ ] P1.2: Create Zod validation schemas for API inputs
- [ ] P1.3: Create service layer for API routes
- [ ] P1.4: Standardize error handling across all API routes
- [ ] P1.5: Add input validation to all API routes
- [ ] P1.6: Create reusable API response helpers
- [ ] P1.7: Audit and fix Server vs Client component boundaries

## Phase 2: TypeScript & Developer Experience (Priority: HIGH)
- [ ] P2.1: Enable strict TypeScript checks (noUncheckedIndexedAccess, etc.)
- [ ] P2.2: Add ESLint plugins (jsx-a11y, import, security)
- [ ] P2.3: Create Prettier config
- [ ] P2.4: Create .husky pre-commit hooks (lint-staged)
- [ ] P2.5: Add lint-staged config
- [ ] P2.6: Add VS Code recommended extensions

## Phase 3: Testing (Priority: MEDIUM)
- [ ] P3.1: Add Vitest for unit tests
- [ ] P3.2: Add React Testing Library
- [ ] P3.3: Expand Playwright e2e tests
- [ ] P3.4: Add API route tests
- [ ] P3.5: Add component unit tests

## Phase 4: Performance & Caching (Priority: MEDIUM)
- [ ] P4.1: Add React cache for server data fetching
- [ ] P4.2: Implement proper ISR for static pages
- [ ] P4.3: Add image optimization
- [ ] P4.4: Add font preloading
- [ ] P4.5: Add bundle analyzer

## Phase 5: Monitoring & Observability (Priority: MEDIUM)
- [ ] P5.1: Add request logging middleware
- [ ] P5.2: Add structured error logging
- [ ] P5.3: Add performance monitoring (Web Vitals)

## Phase 6: Infrastructure & CI/CD (Priority: LOW)
- [ ] P6.1: Create Docker optimization
- [ ] P6.2: Add GitHub Actions workflow
- [ ] P6.3: Add health check endpoint
- [ ] P6.4: Add Sentry for error tracking

## Scoring

| Category | Score | Target |
|----------|-------|--------|
| Architecture | 6/10 | 10/10 |
| Security | 7/10 | 10/10 |
| Maintainability | 5/10 | 10/10 |
| Scalability | 5/10 | 10/10 |
| Performance | 6/10 | 10/10 |
| Testing | 3/10 | 10/10 |
| **Overall** | **5.3/10** | **10/10** |

## Current Sprint: Phase A — Wire & Fix Existing Features

**Goal**: Wire the built-but-unconnected P0 components into the main doctype list page, fix stubs, and reach ~70% porting.

