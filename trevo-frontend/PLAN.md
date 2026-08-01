# Frappe Frontend Porting — Implementation Plan

> Based on: `implementation1/34-frappe-frontend-porting-gap-analysis.md`
> Total Features: 43 | Estimated Effort: 352h | Developer Days: 44

---

## Information Gathered

After thorough analysis of:
1. **Frappe source files** in `frappe/frappe/public/js/` — Kanban (Vuex), Gantt, Dashboard, Bulk Operations, List Filter, Data Export, Form Builder (Vue), etc.
2. **Existing Trevo codebase** — Current state at ~35% porting completion
3. **All 34 implementation1 sections** — Architecture, security, performance recommendations

### Key Technical Decisions:
- All P0 views (Kanban, Gantt, Dashboard) should be built as React components with TypeScript
- Existing shadcn/ui components should be reused for consistency
- API routes should follow BFF pattern already established
- React Query + Zustand for state management (already in use)
- Dynamic view routing already partially designed (see section 34 for ViewRouter pattern)

---

## Implementation Plan

### Phase P0: Core Views (Week 1-2 | ~108h)

#### P0-1: Kanban Board (16h)
- **Source**: `frappe/views/kanban/`, `kanban_board.bundle.js`
- **Components**: `components/features/kanban/`
- **API Routes**: `app/api/doctype/[doctype]/kanban/`
- **Props**: doctype, board_name, filters
- **State**: React Query for data, local state for drag-and-drop
- **Library**: `@dnd-kit/core` for drag-and-drop
- **Details**: 
  - KanbanBoard (main container), KanbanColumn, KanbanCard
  - Drag cards between columns, add/archive columns, add cards
  - Settings dialog for board configuration
  - Realtime updates via polling

#### P0-2: Gantt View (12h)
- **Source**: `frappe/views/gantt/gantt_view.js`
- **Components**: `components/features/gantt/`
- **API Routes**: `app/api/doctype/[doctype]/gantt/`
- **Library**: `frappe-gantt` (same as Frappe) or custom React wrapper
- **Details**:
  - GanttChart wrapper component
  - View mode buttons (Day, Week, Month, Quarter)
  - Drag to change dates/progress
  - Double-click to open document
  - Color coding by status

#### P0-3: Dashboard View (16h)
- **Source**: `frappe/views/dashboard/dashboard_view.js`
- **Components**: `components/features/dashboard/`
- **API Routes**: `app/api/doctype/[doctype]/dashboard/`
- **Details**:
  - DashboardView with Number Cards + Charts
  - WidgetGroup for managing widgets
  - Customize mode (add/remove/reorder)
  - Chart creation dialog
  - Number card component
  - Dashboard chart renderer (recharts-based)

#### P0-4: Data Import/Export (20h)
- **Source**: `frappe/data_import/data_exporter.js`
- **Components**: `components/features/data-import/`
- **API Routes**: `app/api/data-import/`, `app/api/data-export/`
- **Library**: `papaparse` (already in deps) for CSV, xlsx for Excel
- **Details**:
  - ExportDialog with field selection, filter area, file type
  - ImportDialog with CSV upload, field mapping, preview
  - MultiCheck field selection component
  - Template download functionality

#### P0-5: Advanced List Filters (12h)
- **Source**: `frappe/list/list_filter/`
- **Components**: Extend `components/ListFilters.tsx`
- **Details**:
  - Saved filter layouts
  - Multi-condition filters (AND/OR)
  - Filter groups
  - Date range presets
  - Filter operator selection
  - Layout management dialog

#### P0-6: Bulk Operations (8h)
- **Source**: `frappe/list/bulk_operations.js`
- **Extend**: `app/(desk)/desk/doctype/[doctype]/page.tsx`
- **Details**:
  - Bulk Print with letterhead/format dialog
  - Bulk Delete with confirmation
  - Bulk Assign with user selection dialog
  - Bulk Edit with field/value dialog
  - Bulk Submit/Cancel
  - Bulk Export
  - Bulk Add Tags
  - Copy to Clipboard

#### P0-7: Form Builder (24h)
- **Source**: `frappe/form_builder/` (Vue-based)
- **Components**: `components/features/form-builder/`
- **API Routes**: `app/api/form-builder/`
- **Library**: `@dnd-kit/core` for drag-and-drop
- **Details**:
  - Drag-and-drop form layout editor
  - Field palette sidebar
  - Section/Column management
  - Field property editor
  - Preview mode
  - Save as customizations

---

### Phase P1: Important Features (Week 3-4 | ~112h)

#### P1-1: Realtime/Socket.io (8h)
- **Source**: `frappe/socketio_client.js`
- **Service**: `lib/services/realtime.ts`
- **Details**: Socket.io client integration, realtime form updates, notification subscriptions

#### P1-2: Query Reports (16h)
- **Source**: `frappe/views/reports/query_report.js`
- **Components**: `components/features/reports/`
- **Details**: Advanced query builder, column selection, filters, aggregation

#### P1-3: Print Format Builder (20h)
- **Source**: `print_format_builder/` (Vue-based)
- **Components**: `components/features/print-format/`
- **Details**: WYSIWYG print format designer with drag-and-drop fields

#### P1-4: Workflow Actions (8h)
- **Source**: `frappe/form/workflow.js`
- **Details**: Workflow state transitions, approval workflow UI

#### P1-5: Form Timeline (8h)
- **Source**: `frappe/form/footer/form_timeline.js`
- **Components**: `components/features/timeline/`
- **Details**: Activity log, comments, version history

#### P1-6: File View/Browser (12h)
- **Source**: `frappe/views/file/`, `frappe/file_uploader/`
- **Components**: `components/features/files/`
- **Details**: File browser with folders, preview, search, upload

#### P1-7: Communication/Timeline (8h)
- **Source**: `frappe/views/communication.js`
- **Details**: Email thread view, communication log

#### P1-8: Assign To Dialog (4h)
- **Source**: `frappe/form/sidebar/assign_to.js`
- **Components**: `components/shared/AssignToDialog.tsx`
- **Details**: User selection dialog for document assignment

#### P1-9: Share Dialog (4h)
- **Source**: `frappe/form/sidebar/share.js`
- **Components**: `components/shared/ShareDialog.tsx`
- **Details**: Document sharing with permission levels

#### P1-10: Linked With (4h)
- **Source**: `frappe/form/linked_with.js`
- **Components**: `components/shared/LinkedWith.tsx`
- **Details**: Show documents linked to current document

#### P1-11: Global Search / Awesome Bar (8h)
- **Source**: `frappe/ui/toolbar/awesome_bar.js`
- **Extend**: `components/CommandPalette.tsx`
- **Details**: Unified search across all doctypes

#### P1-12: Number Cards (6h)
- **Source**: `frappe/views/reports/number_card.js`
- **Components**: `components/features/dashboard/NumberCard.tsx`
- **Details**: Dashboard number card widget with configurable aggregation

#### P1-13: Undo Manager (4h)
- **Source**: `frappe/form/undo_manager.js`
- **Service**: `lib/services/undoManager.ts`
- **Details**: Ctrl+Z undo for form edits

#### P1-14: List View Settings (4h)
- **Source**: `frappe/list/list_settings.js`
- **Details**: Custom columns, sorting, grouping, layout management

---

### Phase P2: Nice-to-Have Features (Week 5-8 | ~132h)

#### P2-1 through P2-22: Remaining features
- Map View, Image View, Inbox, Tree View, Translation Manager
- Web Forms, DataTable, Quick Entry, Document Follow
- Form Tour, User Onboarding, Color Picker, Icon Picker
- Barcode Scanner, Tag Editor, Role/Permission Editor
- Module Editor, Theme Switcher, PDF/CSV Export
- Preview Email, System Console, Workflow Builder

---

## File Structure for New Features

```
trevo-frontend/
├── components/
│   ├── features/
│   │   ├── kanban/
│   │   │   ├── KanbanBoard.tsx
│   │   │   ├── KanbanColumn.tsx
│   │   │   ├── KanbanCard.tsx
│   │   │   ├── KanbanSettings.tsx
│   │   │   └── index.ts
│   │   ├── gantt/
│   │   │   ├── GanttView.tsx
│   │   │   └── index.ts
│   │   ├── dashboard/
│   │   │   ├── DashboardView.tsx
│   │   │   ├── NumberCard.tsx
│   │   │   ├── ChartWidget.tsx
│   │   │   └── index.ts
│   │   ├── data-import/
│   │   │   ├── ExportDialog.tsx
│   │   │   ├── ImportDialog.tsx
│   │   │   └── index.ts
│   │   ├── form-builder/
│   │   │   ├── FormBuilder.tsx
│   │   │   ├── FieldPalette.tsx
│   │   │   ├── FieldProperties.tsx
│   │   │   └── index.ts
│   │   ├── bulk-operations/
│   │   │   ├── BulkActions.tsx
│   │   │   ├── BulkEditDialog.tsx
│   │   │   ├── BulkPrintDialog.tsx
│   │   │   └── index.ts
│   │   ├── timeline/
│   │   │   ├── FormTimeline.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   └── index.ts
│   │   └── ... (one per feature)
│   └── shared/
│       ├── AssignToDialog.tsx
│       ├── ShareDialog.tsx
│       └── LinkedWith.tsx
├── app/
│   └── api/
│       ├── doctype/[doctype]/
│       │   ├── kanban/route.ts
│       │   ├── gantt/route.ts
│       │   └── dashboard/route.ts
│       ├── data-import/route.ts
│       ├── data-export/route.ts
│       └── form-builder/route.ts
```

---

## Implementation Order

1. **P0-6**: Bulk Operations (extends existing list view) — leverages existing code
2. **P0-5**: Advanced List Filters (extends existing filters) — incremental improvement
3. **P0-1**: Kanban Board — most commonly used view
4. **P0-2**: Gantt View — project management essential
5. **P0-3**: Dashboard View — homepage enhancement
6. **P0-4**: Data Import/Export — data management
7. **P0-7**: Form Builder — advanced customization
8. **P1** features in priority order
9. **P2** features

---

## Dependencies to Install

```bash
# Kanban
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Gantt
npm install frappe-gantt

# Data Import/Export
npm install xlsx

# Realtime
npm install socket.io-client

# Form Builder
# (uses @dnd-kit already installed above)
```

