# Trevo Frontend — Remaining Work

## High Priority
- [x] Wire validation errors into FormControl (red borders, field-level messages) — already passed via `error` prop
- [x] Document actions backend methods — using standard Frappe methods via BFF
- [x] Improve list view filters with operator selectors — added operators to FilterDef type
- [ ] CSV import for list view
- [ ] Bulk actions (submit, cancel, update)
- [ ] Verify backend routes for document actions (print/email/delete) against actual Frappe instance

## Medium Priority
- [x] Docker / deploy config — Dockerfile created
- [x] E2E tests setup with Playwright — scaffolding added

## Low Priority
- [ ] Realtime updates (Socket.io / frappe realtime)
- [ ] Frappe bench app for custom logic
- [ ] Ctrl+Z undo in forms
