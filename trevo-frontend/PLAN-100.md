# Frappe Frontend Porting — 100% Completion Plan

**Current State**: ~85% (verified by ground-truth code audit)
**Target**: 100% feature parity with Frappe frontend
**Remaining Effort**: ~120h (15 developer days)

---

## Phase 1: Documentation Update (2h)

- [ ] Update TODO.md — reflect actual ~85% state
- [ ] Update PLAN-TODO.md — reflect actual ~85% state
- [ ] Update PLAN.md — reflect actual ~85% state
- [ ] Update implementation1/34-frappe-frontend-porting-gap-analysis.md — correct to ~85%
- [ ] Update IMPLEMENTATION_AUDIT.md — correct to ~85%

## Phase 2: Missing Core Features (48h)

### 2.1 File View/Browser (12h)
- `components/features/files/` — FileBrowser, FileGrid, FilePreview, FileUpload
- API routes for file listing, upload, delete, folder management
- Tree navigation for folders, search, preview modal

### 2.2 Global Search / Awesome Bar (8h)
- Enhance `components/CommandPalette.tsx` — search across all doctypes
- Keyboard shortcut (Ctrl+K / Cmd+K)
- Recent searches, type-to-navigate, keyboard navigation

### 2.3 Quick Entry Dialog (4h)
- `components/features/quick-entry/` — Quick document creation
- Field selection, minimal form, submit

### 2.4 Tag Editor (2h)
- `components/features/tags/` — Document tagging system
- Add/remove tags, tag search, color-coded tags

### 2.5 Document Follow (2h)
- Follow/unfollow document updates
- Notification preferences

## Phase 3: Visual & Advanced Features (52h)

### 3.1 Print Format Builder (20h)
- `components/features/print-format/` — WYSIWYG editor
- Drag-and-drop fields, page layout, preview
- API routes for save/load, rendering

### 3.2 Workflow Builder (20h)
- `components/features/workflow-builder/` — Visual workflow designer
- Drag-and-drop states, transitions, conditions
- API routes for save/load

### 3.3 Map View (8h)
- `components/features/map/` — Leaflet-based geo view
- Geolocation markers, clustering, popups

### 3.4 Image View (4h)
- `components/features/image/` — Image gallery view
- Grid/lightbox, upload, delete

## Phase 4: Communication & Collaboration (20h)

### 4.1 Inbox/Communication (8h)
- `components/features/inbox/` — Email inbox integration
- Thread view, compose, attachments

### 4.2 Web Forms (16h)
- `components/features/web-form/` — Public-facing forms
- Form builder, submission handling, validation

## Phase 5: Admin & Utility Features (18h)

### 5.1 Role/Permission Editor (6h)
- `components/features/permissions/` — Role management UI
- CRUD for roles, permission matrix, user assignment

### 5.2 Translation Manager (6h)
- `components/features/translations/` — UI for managing translations
- Key-value editor, language management, import/export

### 5.3 System Console (6h)
- `components/features/system-console/` — SQL console
- Query editor, result display, history

## Phase 6: Polish & UX (12h)

### 6.1 User Onboarding / Form Tour (8h)
- `components/features/onboarding/` — Step-by-step guided tours
- Tour configuration, progress tracking, dismiss

### 6.2 Theme Switcher (2h) — Enhance existing
- System preference detection, persist choice
- More themes (sepia, high-contrast)

### 6.3 Module Editor (4h)
- `components/features/module-editor/` — Module configuration UI
- Enable/disable modules, module dependencies

## Phase 7: Code Quality (10h)

### 7.1 Undo Manager (4h) — Already exists in FormRenderer
- Enhance: add to more components

### 7.2 List View Settings (4h)
- Custom column visibility, ordering, grouping
- Save/load per-user settings

### 7.3 Filter URL Persistence (2h)
- Sync advanced filters to URL search params
- Restore on page load

---

## Implementation Order

1. **Phase 1**: Update docs (2h)
2. **Phase 2**: Missing core features (28h)
3. **Phase 3**: Visual & advanced features (52h)
4. **Phase 4**: Communication & collaboration (20h)
5. **Phase 5**: Admin & utility (18h)
6. **Phase 6**: Polish & UX (12h)
7. **Phase 7**: Code quality (10h)

**Total**: ~120h (15 developer days)

---

## Scoring Targets

| Category | Current | Target |
|----------|---------|--------|
| Feature Parity | 8.5/10 | 10/10 |
| Architecture | 6/10 | 8/10 |
| Security | 7/10 | 9/10 |
| Maintainability | 5/10 | 8/10 |
| Performance | 6/10 | 8/10 |
| Testing | 3/10 | 7/10 |
| **Overall** | **5.9/10** | **8.3/10** |
