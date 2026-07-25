# Section 34: Frappe Frontend Porting — Gap Analysis

> **Objective**: Identify all Frappe frontend features that need to be ported to Trevo
> **Source**: Original Frappe frontend at `frappe/frappe/public/js/`

---

## Executive Summary

**Current Porting Status**: ~35% complete  
**Total Frappe Modules**: ~80+ modules/bundles  
**Ported to Trevo**: ~28 modules (35%)  
**Not Yet Ported**: ~52 modules (65%)

The most critical missing features are: **Kanban/Gantt/Map views**, **Data Import/Export**, **Form Builder**, **Realtime updates**, **Bulk Operations**, and **Advanced Filters**.

---

## What Has Been Ported ✅

| Feature | Frappe Source | Trevo Location | Status |
|---------|--------------|----------------|--------|
| Authentication | `frappe/request.js`, `frappe/auth.py` | `app/(auth)/`, `lib/frappe/auth.tsx` | ✅ Complete |
| API BFF Proxy | Custom | `app/api/frappe/` | ✅ Complete |
| Form Controls | `frappe/form/controls/*` | `lib/trevo-form/controls/*` | ✅ 25+ controls |
| Form Renderer | `frappe/form/form.js`, `layout.js` | `lib/trevo-form/renderers/` | ✅ Partial |
| Form Store/State | `frappe/model/model.js` | `lib/trevo-form/FormStore.ts`, `docState.ts` | ✅ Complete |
| Form Validation | `frappe/form/controls/*` | `lib/trevo-form/validation.ts` | ✅ Complete |
| Doctype Metadata | `frappe/model/meta.js` | `lib/trevo-form/meta/parseDoctypeMeta.ts` | ✅ Complete |
| List View (Basic) | `frappe/list/list_view.js` | `app/(desk)/desk/list/` | ✅ Partial |
| List Filters (Basic) | `frappe/list/list_filter.js` | `components/ListFilters.tsx` | ✅ Basic |
| Dashboard (Home) | `frappe/ui/dashboard.js` | `app/(desk)/desk/page.tsx` | ✅ Basic |
| Reports (Basic) | `frappe/views/reports/` | `app/(desk)/desk/reports/` | ✅ Basic |
| Calendar (Basic) | `frappe/views/calendar/calendar.js` | `app/(desk)/desk/calendar/` | ✅ Basic |
| Settings | `frappe/ui/settings_dialog.js` | `app/(desk)/desk/settings/` | ✅ Basic |
| Error Boundaries | Custom | `components/ErrorBoundary.tsx` | ✅ Complete |
| Breadcrumbs | `frappe/views/breadcrumbs.js` | `components/Breadcrumbs.tsx` | ✅ Complete |
| Notifications | `frappe/ui/notifications/` | `components/NotificationsPanel.tsx` | ✅ Complete |
| Command Palette | UI toolbar | `components/CommandPalette.tsx` | ✅ Complete |
| Charts (Basic) | `frappe/ui/chart.js` | `components/charts.tsx` | ✅ Basic |
| Document Actions | `frappe/form/toolbar.js` | `components/DocumentActions.tsx` | ✅ Basic |
| Form Field Component | `frappe/form/controls/*` | `components/FormField.tsx` | ✅ Complete |
| Skeleton/Loading | Custom | `components/Skeleton.tsx` | ✅ Complete |
| Trevo Shell | `frappe/ui/toolbar/toolbar.js` | `components/TrevoShell.tsx` | ✅ Basic |
| Workspace Navigation | `frappe/views/workspace/` | `app/(desk)/desk/workspace/` | ✅ Basic |
| Search (Basic) | `frappe/utils/search.js` | `lib/frappe/search.ts` | ✅ Basic |
| Upload | `frappe/upload.js` | `lib/frappe/upload.ts` | ✅ Basic |
| Client Library | `frappe/client.py` | `lib/frappe/client.ts` | ✅ Complete |
| Zod Schemas | N/A | `lib/trevo-form/validation.ts` | ✅ Complete |
| TypeScript Types | N/A | `lib/frappe/types.ts` | ✅ Complete |

---

## What's NOT Yet Ported ❌

### P0 — Core Views (Critical for Parody)

| # | Feature | Frappe Source | Effort | Description |
|---|---------|--------------|--------|-------------|
| P0-1 | **Kanban Board** | `frappe/views/kanban/` | 16h | Drag-and-drop kanban view for doctypes with configurable columns |
| P0-2 | **Gantt View** | `frappe/views/gantt/` | 12h | Gantt chart view for project timelines |
| P0-3 | **Dashboard View** | `frappe/views/dashboard/` | 16h | Custom dashboard builder with charts, number cards, links |
| P0-4 | **Data Import/Export** | `frappe/data_import/` | 20h | CSV/Excel import with field mapping, export functionality |
| P0-5 | **Advanced List Filters** | `frappe/list/list_filter/` | 12h | Multi-condition filters, saved filters, filter groups |
| P0-6 | **Bulk Operations** | `frappe/list/bulk_operations.js` | 8h | Bulk edit, cancel, submit, delete, assign, print |
| P0-7 | **Form Builder** | `frappe/form_builder/` | 24h | Drag-and-drop form layout builder (Vue-based in Frappe) |

### P1 — Important Features

| # | Feature | Frappe Source | Effort | Description |
|---|---------|--------------|--------|-------------|
| P1-1 | **Realtime/Socket.io** | `frappe/socketio_client.js` | 8h | Real-time updates for form saves, notifications, chat |
| P1-2 | **Query Reports** | `frappe/views/reports/query_report.js` | 16h | Advanced query builder reports with filters, columns |
| P1-3 | **Print Format Builder** | `frappe/print_format_builder/` | 20h | WYSIWYG print format designer |
| P1-4 | **Workflow Actions** | `frappe/form/workflow.js` | 8h | Workflow state transitions, approvals |
| P1-5 | **Form Timeline** | `frappe/form/footer/form_timeline.js` | 8h | Activity log, comments, version history |
| P1-6 | **File View/Browser** | `frappe/views/file/`, `frappe/file_uploader/` | 12h | File browser with folders, preview, search |
| P1-7 | **Communication/Timeline** | `frappe/views/communication.js` | 8h | Email thread view, communication log |
| P1-8 | **Assign To Dialog** | `frappe/form/sidebar/assign_to.js` | 4h | Document assignment with user selection |
| P1-9 | **Share Dialog** | `frappe/form/sidebar/share.js` | 4h | Document sharing with permission levels |
| P1-10 | **Linked With** | `frappe/form/linked_with.js` | 4h | Show documents linked to current document |
| P1-11 | **Global Search (Awesome Bar)** | `frappe/ui/toolbar/awesome_bar.js` | 8h | Unified search across all doctypes |
| P1-12 | **Number Cards** | `frappe/views/reports/number_card.js` | 6h | Dashboard number card widgets |
| P1-13 | **Undo Manager** | `frappe/form/undo_manager.js` | 4h | Ctrl+Z undo for form edits |
| P1-14 | **List View Settings** | `frappe/list/list_settings.js` | 4h | Custom columns, sorting, grouping |

### P2 — Nice to Have

| # | Feature | Frappe Source | Effort | Description |
|---|---------|--------------|--------|-------------|
| P2-1 | **Map View** | `frappe/views/map/` | 8h | Geo-location map view for address doctypes |
| P2-2 | **Image View** | `frappe/views/image/` | 4h | Image gallery view for doctypes with images |
| P2-3 | **Inbox View** | `frappe/views/inbox/` | 6h | Email inbox integration |
| P2-4 | **Tree View** | `frappe/views/treeview.js` | 6h | Hierarchical tree view for nested doctypes |
| P2-5 | **Translation Manager** | `frappe/views/translation_manager.js` | 6h | UI for managing language translations |
| P2-6 | **Web Forms** | `frappe/web_form/` | 16h | Public-facing forms for external users |
| P2-7 | **DataTable** | `frappe/ui/datatable.js` | 8h | Advanced data table with inline editing |
| P2-8 | **Quick Entry** | `frappe/form/quick_entry.js` | 4h | Quick document creation dialog |
| P2-9 | **Document Follow** | `frappe/form/sidebar/document_follow.js` | 2h | Follow/unfollow document updates |
| P2-10 | **Form Tour** | `frappe/form/form_tour.js` | 6h | Interactive guided tours for forms |
| P2-11 | **User Onboarding** | `frappe/ui/user_onboarding/` | 8h | Step-by-step onboarding wizards |
| P2-12 | **Color Picker** | `frappe/color_picker/` | 2h | Color selection widget |
| P2-13 | **Icon Picker** | `frappe/icon_picker/` | 2h | Icon selection widget |
| P2-14 | **Barcode Scanner** | `frappe/scanner/` | 4h | Barcode scanning integration |
| P2-15 | **Tag Editor** | `frappe/ui/tag_editor.js` | 2h | Document tagging system |
| P2-16 | **Role & Permission Editor** | `frappe/roles_editor.js` | 6h | UI for managing roles and permissions |
| P2-17 | **Module Editor** | `frappe/module_editor.js` | 4h | Module configuration UI |
| P2-18 | **Theme Switcher** | `frappe/ui/theme_switcher.js` | 2h | Dark/light theme toggle |
| P2-19 | **Export (PDF/CSV)** | `frappe/utils/file_manager.js` | 4h | Document export to PDF/CSV/Excel |
| P2-20 | **Preview Email** | `frappe/utils/preview_email.js` | 4h | Email preview before sending |
| P2-21 | **System Console** | `frappe/desk/doctype/system_console/` | 6h | SQL console for debugging |
| P2-22 | **Workflow Builder** | `frappe/workflow_builder/` | 20h | Visual workflow designer |

---

## Porting Completion Map

### By Bundle (from Frappe bundles)

```
frappe/public/js/
├── desk.bundle.js          → Trevo Shell + Core   → ~40% done
├── form.bundle.js          → Form System          → ~60% done
├── list.bundle.js          → List Views           → ~30% done
├── list_layout.bundle.js   → List Layout          → ~20% done
├── controls.bundle.js      → Form Controls        → ~70% done
├── calendar.bundle.js      → Calendar             → ~25% done
├── report.bundle.js        → Reports              → ~20% done
├── dialog.bundle.js        → Dialogs/Modals       → ~10% done
├── print.bundle.js         → Print Formats        → ~0% done
├── data_import_tools.bundle.js → Import/Export    → ~0% done
├── form_builder.bundle.js  → Form Builder         → ~0% done
├── workflow_builder/       → Workflow Designer    → ~0% done
├── print_format_builder/   → Print Format Editor  → ~0% done
├── kanban/                 → Kanban Board         → ~0% done
├── gantt/                  → Gantt View           → ~0% done
├── web_form.bundle.js      → Web Forms            → ~0% done
├── leaflet.bundle.js       → Map View             → ~0% done
├── photoswipe.bundle.js    → Image Gallery        → ~0% done
└── sentry.bundle.js        → Error Tracking       → ~0% done
```

### By View Type (from Frappe views)

```
frappe/views/
├── factory.js              → View Factory        → ~50% done (Basic routing)
├── formview.js             → Form View           → ~60% done
├── listview.js             → List View           → ~30% done
├── pageview.js             → Page View           → ~50% done
├── treeview.js             → Tree View           → ❌ Not started
├── container.js            → View Container      → ~40% done
├── calendar/               → Calendar View       → ~25% done
├── dashboard/              → Dashboard View      → ❌ Not started
├── file/                   → File View           → ❌ Not started
├── gantt/                  → Gantt View          → ❌ Not started
├── image/                  → Image View          → ❌ Not started
├── inbox/                  → Inbox View          → ❌ Not started
├── kanban/                 → Kanban View         → ❌ Not started
├── map/                    → Map View            → ❌ Not started
├── reports/                → Report View         → ~20% done
├── workspace/              → Workspace View      → ~30% done
└── communication.js        → Communication       → ❌ Not started
```

---

## Porting Strategy

### Phase 0: Core Views (Week 1-2)
Build the view system that handles all view types dynamically:

```typescript
// Proposed architecture for view system
// app/(desk)/desk/doctype/[doctype]/view/page.tsx

type ViewType = 'list' | 'form' | 'kanban' | 'gantt' | 'calendar' | 'dashboard' | 'tree' | 'image' | 'map' | 'file' | 'inbox' | 'report';

interface ViewConfig {
  type: ViewType;
  doctype: string;
  filters?: FilterCondition[];
  columns?: string[];
  group_by?: string;
}

// Dynamic view renderer based on user settings or doctype meta
function ViewRouter({ doctype, viewType }: { doctype: string; viewType: ViewType }) {
  switch (viewType) {
    case 'kanban': return <KanbanView doctype={doctype} />;
    case 'gantt': return <GanttView doctype={doctype} />;
    case 'calendar': return <CalendarView doctype={doctype} />;
    case 'tree': return <TreeView doctype={doctype} />;
    case 'image': return <ImageView doctype={doctype} />;
    case 'map': return <MapView doctype={doctype} />;
    default: return <ListView doctype={doctype} />;
  }
}
```

### Phase 1: Enhanced Form Features (Week 3-4)
- Form Timeline (comments, activity log)
- Workflow Actions (state transitions)
- Assign To / Share dialogs
- Linked With panel
- Form Tours
- Quick Entry
- Undo Manager

### Phase 2: Advanced Data Features (Week 5-6)
- Data Import/Export
- Bulk Operations
- Advanced Filters
- Query Reports
- Number Cards
- List View Settings

### Phase 3: Utilities & Polish (Week 7-8)
- Realtime Updates (Socket.io)
- Global Search (Awesome Bar)
- File View/Browser
- Form Builder
- Print Format Builder
- Workflow Builder
- Communication/Inbox
- Translation Manager
- Web Forms

---

## Estimated Effort Summary

| Priority | Features | Total Effort | Developer Days |
|----------|----------|-------------|----------------|
| P0 | 7 features | 108h | 13.5 days |
| P1 | 14 features | 112h | 14 days |
| P2 | 22 features | 132h | 16.5 days |
| **Total** | **43 features** | **352h** | **44 days** |

## Porting Completion: 35% ✅  → Target: 100%

**Next Priority**: P0-1 through P0-7 — Core views that make Trevo a true Frappe frontend replacement.
