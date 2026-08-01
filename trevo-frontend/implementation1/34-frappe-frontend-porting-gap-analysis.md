# Section 34: Frappe Frontend Porting — Gap Analysis (Updated)

> **Objective**: Identify all Frappe frontend features that need to be ported to Trevo
> **Source**: Original Frappe frontend at `frappe/frappe/public/js/`
> **Last Updated**: Sessions to date — realtime, ShareDialog, and Gantt scroll now wired.

---

## Executive Summary

**Current Porting Status**: ~60–65% complete (foundational layers + P0 core views done)
**Total Frappe Modules**: ~80+ modules/bundles
**Ported to Trevo**: ~34 modules (42%)
**Partially Ported**: ~8 modules (10%)
**Not Yet Ported**: ~22 modules (28%)

**Progress vs. original baseline**: The original analysis (35%) under-reported. Since then, **Kanban, Gantt (incl. working scroll/nav), Tree, Bulk Operations, Data Import/Export, Advanced Filters, Form Timeline, Assign To, Number Cards, Undo Manager, Realtime (socket.io), Share Dialog** have been implemented and (mostly) integrated into the doctype view router.

**Remaining critical gaps**: Form Builder (P0-7), Query Report builder, Workflow Actions, Linked With, File View, Dashboard real chart data, Map/Image/Inbox views, Web Forms, Print Format Builder, Workflow Builder.

---

## What Has Been Ported ✅

### Foundation (Complete)
| Feature | Frappe Source | Trevo Location | Status |
|---------|--------------|----------------|--------|
| Authentication | `frappe/request.js`, `frappe/auth.py` | `app/(auth)/`, `lib/frappe/auth.tsx`, `app/api/auth/*` | ✅ Complete |
| API BFF Proxy | Custom | `app/api/frappe/[...path]/` | ✅ Complete |
| Client Library | `frappe/client.py` | `lib/frappe/client.ts` | ✅ Complete |
| Server Fetch | Custom | `lib/frappe/server.ts` | ✅ Complete |
| TypeScript Types | N/A | `lib/frappe/types.ts` | ✅ Complete |
| Boot Info | `frappe.boot.get_bootinfo` (403) | `lib/frappe/boot.ts`, `app/api/boot/` | ✅ Complete (assembled) |
| React Query Hooks | N/A | `lib/hooks/*` (15+ hooks) | ✅ Complete |
| Zustand Stores | N/A | `lib/stores/*` | ✅ Complete |
| Middleware Auth Guard | Custom | `middleware.ts` | ✅ Complete |

### Form Engine (`lib/trevo-form/`) — ~80% Complete
| Feature | Frappe Source | Trevo Location | Status |
|---------|--------------|----------------|--------|
| Form Store/State | `frappe/model/model.js` | `lib/trevo-form/FormStore.ts`, `docState.ts` | ✅ Complete |
| Form Renderer | `frappe/form/form.js`, `layout.js` | `lib/trevo-form/renderers/FormRenderer.tsx` | ✅ Partial (read-only detail tab) |
| Form Controls | `frappe/form/controls/*` | `lib/trevo-form/controls/*` | ✅ 24+ controls |
| Doctype Metadata | `frappe/model/meta.js` | `lib/trevo-form/meta/parseDoctypeMeta.ts` | ✅ Complete |
| Form Validation | `frappe/form/controls/*` | `lib/trevo-form/validation.ts` | ✅ Complete |
| Undo Manager | `frappe/form/undo_manager.js` | In `FormRenderer.tsx` (Ctrl+Z, 50-entry) | ✅ Complete |
| Auto-Save | `frappe/form/form.js` | `FormRenderer.tsx` (30s interval) | ✅ Complete |
| Keyboard Shortcuts | `frappe/ui/toolbar` | `hooks/useKeyboardShortcuts.ts` | ✅ Complete |
| Client Scripts Bridge | `frappe/form/script_manager.js` | `lib/trevo-form/frappeScriptBridge.tsx` | ⚠️ Stub (no fetch/execution) |

### P0 — Core Views
| Feature | Frappe Source | Trevo Location | Status |
|---------|--------------|----------------|--------|
| P0-1 **Kanban Board** | `frappe/views/kanban/` | `components/features/kanban/` + `app/api/doctype/[doctype]/kanban/` | ✅ ~80% |
| P0-2 **Gantt View** | `frappe/views/gantt/` | `components/features/gantt/` + `app/api/doctype/[doctype]/gantt/` | ✅ ~70% |
| P0-3 **Dashboard View** | `frappe/views/dashboard/` | `components/features/dashboard/DashboardView.tsx` + `app/api/doctype/Dashboard/` | ⚠️ ~40% (charts empty) |
| P0-4 **Data Import/Export** | `frappe/data_import/` | `components/features/data-import/` + `lib/frappe/import.ts`, `export.ts` | ✅ ~60% |
| P0-5 **Advanced List Filters** | `frappe/list/list_filter/` | `components/features/list-filters/` (groups, saved layouts, presets) | ✅ ~60% |
| P0-6 **Bulk Operations** | `frappe/list/bulk_operations.js` | `components/features/bulk-operations/` + `app/api/doctype/[doctype]/bulk/` | ✅ ~80% |
| P0-7 **Form Builder** | `frappe/form_builder/` (Vue) | `components/features/form-builder/` | ❌ Not started |

### P1 — Important Features
| Feature | Frappe Source | Trevo Location | Status |
|---------|--------------|----------------|--------|
| P1-1 **Realtime/Socket.io** | `frappe/socketio_client.js` | `lib/services/realtime.ts` + `hooks/useRealtimeUpdates.ts` | ✅ Complete (singleton socket, typed subs) |
| P1-2 **Query Reports** | `frappe/views/reports/query_report.js` | `app/(desk)/desk/reports/` + `lib/frappe/report.ts` | ⚠️ ~35% (runner only) |
| P1-5 **Form Timeline** | `frappe/form/footer/form_timeline.js` | `components/features/timeline/FormTimeline.tsx` | ✅ Complete |
| P1-7 **Communication/Timeline** | `frappe/views/communication.js` | Tabs in detail page (read-only) | ⚠️ ~50% |
| P1-8 **Assign To Dialog** | `frappe/form/sidebar/assign_to.js` | `components/features/bulk-operations/AssignToDialog.tsx` | ✅ Complete |
| P1-9 **Share Dialog** | `frappe/form/sidebar/share.js` | `components/features/sharing/ShareDialog.tsx` | ✅ Complete (`frappe.share.add`/`get_users`/`remove` via BFF) |
| P1-11 **Global Search** | `frappe/ui/toolbar/awesome_bar.js` | `components/CommandPalette.tsx` + `lib/frappe/search.ts` | ⚠️ ~50% |
| P1-12 **Number Cards** | `frappe/views/reports/number_card.js` | `workspace/[name]/page.tsx` (live counts) | ✅ Complete |
| P1-13 **Undo Manager** | `frappe/form/undo_manager.js` | `FormRenderer.tsx` | ✅ Complete |
| P1-14 **List View Settings** | `frappe/list/list_settings.js` | Sorting/pagination (no saved layouts) | ⚠️ ~30% |

### P2 — Nice to Have
| Feature | Frappe Source | Trevo Location | Status |
|---------|--------------|----------------|--------|
| P2-4 **Tree View** | `frappe/views/treeview.js` | `components/features/tree/TreeView.tsx` + `app/api/doctype/[doctype]/tree/` | ✅ Complete |
| P2-14 **Barcode** | `frappe/scanner/` | `controls/BarcodeField.tsx` (input only) | ⚠️ ~50% |
| P2-18 **Theme Switcher** | `frappe/ui/theme_switcher.js` | `TrevoShell.tsx` (light/dark toggle) | ✅ Complete |

---

## What's NOT Yet Ported ❌

### P0 — Remaining
| # | Feature | Frappe Source | Effort | Status |
|---|---------|--------------|--------|--------|
| P0-7 | **Form Builder** | `frappe/form_builder/` | 24h | ❌ Not started |

### P1 — Remaining
| # | Feature | Frappe Source | Effort |
|---|---------|--------------|--------|
| P1-3 | **Print Format Builder** | `print_format_builder/` | 20h |
| P1-4 | **Workflow Actions** | `frappe/form/workflow.js` | 8h |
| P1-6 | **File View/Browser** | `frappe/views/file/`, `frappe/file_uploader/` | 12h |
| P1-10 | **Linked With** | `frappe/form/linked_with.js` | 4h |

### P2 — Remaining
| # | Feature | Frappe Source | Effort |
|---|---------|--------------|--------|
| P2-1 | **Map View** | `frappe/views/map/` | 8h |
| P2-2 | **Image View** | `frappe/views/image/` | 4h |
| P2-3 | **Inbox View** | `frappe/views/inbox/` | 6h |
| P2-5 | **Translation Manager** | `frappe/views/translation_manager.js` | 6h |
| P2-6 | **Web Forms** | `frappe/web_form/` | 16h |
| P2-7 | **DataTable** | `frappe/ui/datatable.js` | 8h |
| P2-8 | **Quick Entry** | `frappe/form/quick_entry.js` | 4h |
| P2-9 | **Document Follow** | `frappe/form/sidebar/document_follow.js` | 2h |
| P2-10 | **Form Tour** | `frappe/form/form_tour.js` | 6h |
| P2-11 | **User Onboarding** | `frappe/ui/user_onboarding/` | 8h |
| P2-12 | **Color Picker** | `frappe/color_picker/` | 2h |
| P2-13 | **Icon Picker** | `frappe/icon_picker/` | 2h |
| P2-15 | **Tag Editor** | `frappe/ui/tag_editor.js` | 2h |
| P2-16 | **Role & Permission Editor** | `frappe/roles_editor.js` | 6h |
| P2-17 | **Module Editor** | `frappe/module_editor.js` | 4h |
| P2-19 | **Export (PDF/CSV)** | `frappe/utils/file_manager.js` | 4h |
| P2-20 | **Preview Email** | `frappe/utils/preview_email.js` | 4h |
| P2-21 | **System Console** | `frappe/desk/doctype/system_console/` | 6h |
| P2-22 | **Workflow Builder** | `frappe/workflow_builder/` | 20h |

---

## Porting Completion Map (Updated)

```
frappe/public/js/
├── desk.bundle.js          → Trevo Shell + Core   → ~55% done
├── form.bundle.js          → Form System          → ~80% done
├── list.bundle.js          → List Views           → ~65% done
├── list_layout.bundle.js   → List Layout          → ~35% done
├── controls.bundle.js      → Form Controls        → ~85% done
├── calendar.bundle.js      → Calendar             → ~50% done
├── report.bundle.js        → Reports              → ~35% done
├── dialog.bundle.js        → Dialogs/Modals       → ~40% done
├── kanban/                 → Kanban Board         → ~80% done
├── gantt/                  → Gantt View           → ~70% done
├── treeview.js             → Tree View            → ~80% done
├── data_import_tools.bundle.js → Import/Export    → ~60% done
├── print.bundle.js         → Print Formats        → ~5% done
├── form_builder.bundle.js  → Form Builder         → ~0% done
├── workflow_builder/       → Workflow Designer    → ~0% done
├── print_format_builder/   → Print Format Editor  → ~0% done
├── web_form.bundle.js      → Web Forms            → ~0% done
├── leaflet.bundle.js       → Map View             → ~0% done
├── photoswipe.bundle.js    → Image Gallery        → ~0% done
└── sentry.bundle.js        → Error Tracking       → ~0% done
```

---

## Estimated Effort to Reach 80%

| Priority | Features | Total Effort | Status |
|----------|----------|-------------|--------|
| P0-7 | Form Builder | 24h | Not started |
| P1-4 | Workflow Actions | 8h | Not started |
| P1-10 | Linked With | 4h | Not started |
| P1-1 | Realtime (wire socket.io) | 4h | Stub → implement |
| P1-2 | Query Report builder | 8h | Runner exists |
| P1-9 | Wire ShareDialog | 2h | Exists → wire |
| P1-6 | File View/Browser | 8h | Not started |
| P1-11 | Global Search polish | 4h | Partial |
| **Total** | | **~62h** | |

---

## Porting Strategy (Next Steps)

### Phase A: Complete Integration (Week 1)
1. **Wire existing components** into `doctype/[doctype]/page.tsx` — `BulkActions`, `AdvancedFilters`, `ImportDialog`, `ExportDialog`
2. **Fix shallow implementations** — Gantt scroll, ShareDialog wiring, DashboardView real chart data
3. **Implement Realtime** — actual socket.io connection (already installed)

### Phase B: Build Remaining P0/P1 (Week 2-3)
4. **P0-7 Form Builder** — drag-and-drop layout editor with `@dnd-kit`
5. **P1-4 Workflow Actions** — workflow state transitions
6. **P1-10 Linked With** — `frappe.desk.form.utils.get_linked_docs`
7. **P1-2 Query Report builder** — filters/columns/aggregation UI

### Phase C: SSR & Next.js Improvements (Week 4)
8. Convert key pages to Server Components
9. Add `loading.tsx` / `error.tsx` boundaries
10. `React.cache()` for server data fetching dedup
11. `generateMetadata` per page

## Porting Completion: 55–60% ✅ → Target: 100%

**Next Priority**: Phase A (wire + fix existing) → Phase B (Form Builder + Workflow + Linked With) → Phase C (SSR).

