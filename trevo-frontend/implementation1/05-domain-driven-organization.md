# Section 5: Domain-Driven Organization

## Current State
The codebase is organized by technical layers (components, lib, hooks) rather than business domains. This makes it hard to find all code related to a specific feature.

## Proposed Domain Boundaries

```typescript
// Domain: Authentication
src/
  features/auth/
    components/          // LoginForm, LogoutButton
    hooks/               // useAuth, useLogin
    services/            // auth.service.ts
    schemas/             // login.schema.ts
    types.ts             // auth.types.ts

// Domain: Document Management
src/
  features/doctype/
    components/          // ListView, FormView, TableRenderer
    hooks/               // useDoctype, useDocument, useList
    services/            // doctype.service.ts, document.service.ts
    schemas/             // doctype.schema.ts
    types.ts             // doctype.types.ts

// Domain: Workspace
src/
  features/workspace/
    components/          // Sidebar, WorkspaceCard, ShortcutLinks
    hooks/               // useWorkspaces, useSidebar
    services/            // workspace.service.ts
    types.ts

// Domain: Notifications
src/
  features/notifications/
    components/          // NotificationsPanel, NotificationBadge
    hooks/               // useNotifications
    services/            // notification.service.ts
    types.ts

// Domain: Reports
src/
  features/reports/
    components/          // ReportViewer, ChartRenderer
    hooks/               // useReport
    services/            // report.service.ts
    types.ts
```

## Implementation Notes
- Each domain should have its own barrel export (`index.ts`)
- Cross-domain dependencies should go through the service layer
- Shared components (UI primitives, layout) stay in `components/ui/` and `components/layout/`
- This enables parallel development and easier testing
- Each domain can be independently developed and tested
