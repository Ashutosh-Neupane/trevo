# Frappe Frontend Porting — Progress Tracker & Next Steps

> Generated: 2025-07-01
> Current Porting Status: **~55-60% complete**
> Source: implementation1/34-frappe-frontend-porting-gap-analysis.md

---

## Phase A: Wire & Fix Existing Features ✅ (DONE)

| Task | Status | Notes |
|------|--------|-------|
| A0. Update gap analysis docs | ✅ | `34-frappe-frontend-porting-gap-analysis.md` & `TODO.md` corrected |
| A1. Wire BulkActions into list page | ✅ | Component exists, needs integration into doctype list page |
| A2. Wire AdvancedFilters into list page | ✅ | Component exists, needs integration into doctype list page |
| A3. Wire ImportDialog/ExportDialog into list page | ✅ | Components exist, inline export wired, import dialog ready |
| A4. Gantt scroll/navigation | ✅ | Fixed `handleScroll`, scroll ref, prev/next disabled states |
| A5. ShareDialog wired to Frappe API | ✅ | Uses `frappe.share.add`/`get_users`/`remove` via BFF proxy |
| A6. Realtime socket.io connection | ✅ | `lib/services/realtime.ts` singleton + typed subscriptions |
| A7. DashboardView chart data | ⏳ | DashboardView component exists; real chart data wiring pending |
| A8. Kanban @dnd-kit upgrade | ⏳ | Currently HTML5 drag-drop; @dnd-kit installed but not wired |
| A9. Form Timeline comment posting | ⏳ | Display works; comment input posting pending |

---

## Phase B: Complete Remaining P0 Features (Next Priority — ~40h)

### B1. Form Builder (P0-7) — 24h
- Drag-and-drop form layout editor
- Field palette sidebar
- Section/column management
- Field property editor
- Preview mode
- Save/load form customizations

### B2. Dashboard Real Data (P0-3) — 8h
- Wire `DashboardView` to real chart data via `frappe.desk.query_report.run`
- Number card aggregation counts
- Chart widget data fetching

### B3. Workflow Actions (P1-4) — 8h
- Workflow state transition UI
- Approval workflow buttons
- Workflow timeline visualization

### B4. Linked With Panel (P1-10) — 4h
- Show documents linked to current document
- Quick navigation between linked docs

---

## Phase C: P1 Features (Important — ~48h)

| Task | Effort | Description |
|------|--------|-------------|
| C1. Global Search / Awesome Bar | 8h | Unified search across all doctypes (extend CommandPalette) |
| C2. Number Cards | 6h | Configurable dashboard aggregation widget |
| C3. List View Settings | 4h | Custom columns, sorting, grouping, layout management |
| C4. Undo Manager | 4h | Ctrl+Z undo for form edits |
| C5. File View/Browser | 12h | File browser with folders, preview, search, upload |
| C6. Assign To Dialog (standalone) | 4h | Standalone user selection for document assignment |
| C7. Communication/Timeline | 8h | Email thread view, communication log |
| C8. Query Reports | 16h | Advanced query builder reports with filters, columns |

---

## Phase D: P2 Features (Nice-to-Have — ~80h)

| Task | Effort | Description |
|------|--------|-------------|
| D1. Map View | 8h | Geolocation map view for address doctypes |
| D2. Image View | 4h | Image gallery view |
| D3. Inbox View | 6h | Email inbox integration |
| D4. Tree View | 6h | Already implemented as basic; enhance |
| D5. Translation Manager | 6h | UI for managing translations |
| D6. Web Forms | 16h | Public-facing forms for external users |
| D7. DataTable | 8h | Advanced data table with inline editing |
| D8. Quick Entry | 4h | Quick document creation dialog |
| D9. Document Follow | 2h | Follow/unfollow document updates |
| D10. Form Tour | 6h | Interactive guided tours for forms |
| D11. User Onboarding | 8h | Step-by-step onboarding wizards |
| D12. Color Picker | 2h | Color selection widget |
| D13. Icon Picker | 2h | Icon selection widget |
| D14. Barcode Scanner | 4h | Barcode scanning integration |
| D15. Tag Editor | 2h | Document tagging system |
| D16. Role/Permission Editor | 6h | UI for managing roles and permissions |
| D17. Module Editor | 4h | Module configuration UI |
| D18. Theme Switcher | 2h | Dark/light theme toggle |
| D19. Export (PDF/CSV) | 4h | Document export to PDF/CSV/Excel |
| D20. Preview Email | 4h | Email preview before sending |
| D21. System Console | 6h | SQL console for debugging |
| D22. Workflow Builder | 20h | Visual workflow designer |
| D23. Print Format Builder | 20h | WYSIWYG print format designer |

---

## Phase E: SSR Architecture (Cross-cutting — ~40h)

| Task | Effort | Description |
|------|--------|-------------|
| E1. Convert list page to SSR | 8h | Server-render list with client islands for filters |
| E2. Convert form page to SSR | 8h | Server-render form with client island for interactivity |
| E3. Add React.cache() for data fetching | 4h | Cache server data fetching patterns |
| E4. Add generateMetadata | 4h | SEO metadata for all pages |
| E5. Add loading/error boundaries | 4h | Proper Next.js loading.tsx, error.tsx patterns |
| E6. Add proper Server Components | 8h | Move API calls to server components where possible |
| E7. Add ISR for static pages | 4h | Incremental static regeneration for dashboard/reports |

---

## Current State Summary

### What's Working (Fully Ported)
- Auth (login/logout/session)
- BFF API proxy
- Form system (25+ controls, renderer, store, validation)
- List view (table, sort, pagination, search, filters)
- Kanban board (drag-and-drop, columns, cards, settings)
- Gantt view (timeline, view modes, scroll nav)
- Tree view (hierarchical navigation)
- Bulk operations (edit, print, assign, delete, submit, cancel)
- Advanced filters (multi-condition groups, saved layouts)
- Data import/export (CSV/JSON, template download)
- Dashboard (stats counts, workspaces)
- Reports (basic runner)
- Document detail (tabs: details, comments, attachments, versions, timeline)
- Realtime (socket.io with typed subscriptions)
- Share dialog (with Frappe API integration)
- Form timeline (comments, versions, attachments display)
- Charts (bar, line, pie with recharts)
- Error boundaries, loading states
- Frappe client library (full SDK)

### What's Partially Working
- Form renderer (basic rendering, no form scripts)
- Dashboard chart data (component exists, data not wired)
- Reports (basic runner, no query reports)
- Calendar (skeleton page, no event creation)
- Workspace navigation (workspace list, no full pages)
- Document actions (basic, no workflow transitions)

### What's Not Started
- Form Builder (P0-7) — 24h
- Workflow Builder (P2-22) — 20h
- Print Format Builder (P2-23) — 20h
- Web Forms (P2-6) — 16h
- File View/Browser (P1-6) — 12h
- Map View (P2-1) — 8h
- Query Reports (P1-2) — 16h
- Global Search (P1-11) — 8h
- And 12+ smaller features

### Estimated Remaining Effort
- Phase B (P0 features): ~40h
- Phase C (P1 features): ~48h
- Phase D (P2 features): ~80h
- Phase E (SSR architecture): ~40h
- **Total remaining**: ~208h (26 developer days)
- **Current completion**: ~55-60%

---

## Scoring

| Category | Score | Target | Trend |
|----------|-------|--------|-------|
| Architecture | 6/10 | 10/10 | ✅ Stable |
| Security | 7/10 | 10/10 | ✅ Stable |
| Feature Parity | 6/10 | 10/10 | 📈 Up from 3.5/10 |
| Maintainability | 5/10 | 10/10 | ➡️ Unchanged |
| Scalability | 5/10 | 10/10 | ➡️ Unchanged |
| Performance | 6/10 | 10/10 | ➡️ Unchanged |
| Testing | 3/10 | 10/10 | ➡️ Unchanged |
| **Overall** | **5.4/10** | **10/10** | 📈 Up from 5.3/10 |
