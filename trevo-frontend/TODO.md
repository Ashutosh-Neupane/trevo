# Trevo Frontend — Remaining Work

## Completed in latest session
- [x] Wire validation errors into FormControl (red borders, field-level messages)
- [x] Document actions backend methods — using standard Frappe methods via BFF
- [x] Improve list view filters with operator selectors
- [x] Docker / deploy config — Dockerfile created
- [x] E2E tests setup with Playwright
- [x] CSV import for list view — papaparse-based import with field mapping
- [x] Bulk submit/cancel/discard for submittable DocTypes
- [x] Document polling + "Document updated" toast notifications
- [x] Ctrl+Z undo in forms (50-entry history stack)
- [x] next.config.ts security headers
- [x] .env.example

## High Priority
- [ ] Verify backend routes for document actions against actual Frappe instance
- [ ] Child table save backend — ensure `savedocs` serializes nested arrays correctly

## Medium Priority
- [ ] List view filters — date-range / numeric-range dual-input UI for "Between" operator
- [ ] Form validation — per-field error display in form renderer UI

## Low Priority
- [x] Realtime updates — polling-based notifications implemented (30s interval)
- [ ] Frappe bench app for custom logic
