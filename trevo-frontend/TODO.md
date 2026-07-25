# Trevo Frontend — Remaining Work

## Completed in latest session
- [x] Wire validation errors into FormControl (red borders, field-level messages) — already passed via `error` prop
- [x] Document actions backend methods — using standard Frappe methods via BFF
- [x] Improve list view filters with operator selectors — added operators to FilterDef type
- [x] Docker / deploy config — Dockerfile created
- [x] E2E tests setup with Playwright — scaffolding added
- [x] CSV import for list view — papaparse-based import with field mapping

## High Priority
- [ ] Verify backend routes for document actions (print/email/delete) against actual Frappe instance
- [ ] Bulk actions — submit/cancel buttons wired for submittable DocTypes

## Medium Priority
- [ ] Child table save backend — ensure `savedocs` correctly serializes nested child table arrays
- [ ] List view filters — date-range / numeric-range with operator selectors
- [ ] Form validation — display errors per field in form renderer UI

## Low Priority
- [ ] Realtime updates (Socket.io / frappe realtime)
- [ ] Frappe bench app for custom logic
- [ ] Ctrl+Z undo in forms
