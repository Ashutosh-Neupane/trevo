# Section 3: Folder Structure Evaluation

## Current Structure

```
trevo-frontend/
├── app/                          # Next.js App Router pages & API
│   ├── (auth)/                   # Login group
│   │   └── login/
│   │       └── page.tsx
│   ├── (desk)/                   # Desk (authenticated) group
│   │   └── desk/
│   │       ├── page.tsx          # Main desk page
│   │       ├── layout.tsx        # Auth guard + shell
│   │       ├── error.tsx
│   │       ├── not-found.tsx
│   │       ├── calendar/page.tsx
│   │       ├── doctype/          # DocType CRUD pages
│   │       │   ├── page.tsx
│   │       │   └── [doctype]/
│   │       │       ├── page.tsx  # List view
│   │       │       ├── [name]/
│   │       │       │   ├── page.tsx
│   │       │       │   └── edit/page.tsx
│   │       │       └── new/page.tsx
│   │       ├── forms/
│   │       │   └── [doctype]/page.tsx
│   │       ├── list/
│   │       │   ├── page.tsx
│   │       │   └── [doctype]/page.tsx
│   │       ├── reports/page.tsx
│   │       └── settings/page.tsx
│   ├── api/                      # BFF API routes
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   └── whoami/route.ts
│   │   ├── boot/route.ts
│   │   ├── doctype/[doctype]/
│   │   │   ├── doc/route.ts
│   │   │   ├── docinfo/route.ts
│   │   │   ├── meta/route.ts
│   │   │   ├── save/route.ts
│   │   │   └── list/route.ts
│   │   └── frappe/[...path]/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   └── providers.tsx
├── components/                   # Shared UI components
│   ├── Breadcrumbs.tsx
│   ├── charts.tsx
│   ├── CommandPalette.tsx
│   ├── DocumentActions.tsx
│   ├── ErrorBoundary.tsx
│   ├── FormField.tsx
│   ├── ListFilters.tsx
│   ├── NotificationsPanel.tsx
│   ├── Skeleton.tsx
│   ├── TrevoShell.tsx
│   └── shadcn/                   # Generated shadcn/ui components
├── lib/                          # Library code
│   ├── utils.ts                  # Monolithic utility file
│   ├── frappe/                   # Frappe backend integration
│   │   ├── auth.tsx
│   │   ├── boot.ts
│   │   ├── client.ts
│   │   ├── doctype.ts
│   │   ├── document.ts
│   │   ├── export.ts
│   │   ├── import.ts
│   │   ├── list.ts
│   │   ├── maps.ts
│   │   ├── notification.ts
│   │   ├── report.ts
│   │   ├── search.ts
│   │   ├── server.ts
│   │   ├── types.ts
│   │   ├── upload.ts
│   │   └── workspace.ts
│   ├── hooks/                    # React hooks
│   │   ├── useBootInfo.ts
│   │   ├── useDoctype.ts
│   │   ├── useDoctypes.ts
│   │   ├── useDocument.ts
│   │   ├── useKeyboardShortcut.ts
│   │   ├── useList.ts
│   │   ├── useNotifications.ts
│   │   ├── useReport.ts
│   │   ├── useSearch.ts
│   │   └── useWorkspaces.ts
│   ├── stores/                   # Zustand stores
│   │   ├── auth.store.ts
│   │   ├── desk.store.ts
│   │   └── ui.store.ts
│   └── trevo-form/              # Form engine
│       ├── actions.ts
│       ├── docState.ts
│       ├── FormStore.ts
│       ├── frappeScriptBridge.tsx
│       ├── types.ts
│       ├── validation.ts
│       ├── controls/              # 25+ field type controls
│       ├── hooks/
│       ├── meta/
│       └── renderers/
├── public/                        # Static assets
├── types/                         # Global type declarations
├── middleware.ts                  # Auth middleware
├── next.config.ts                 # Next.js config (empty!)
├── eslint.config.mjs              # ESLint config
├── tsconfig.json                  # TypeScript config
├── playwright.config.ts           # E2E test config
├── Dockerfile
├── dockerignore
├── package.json
└── README.md
```

## Evaluation Issues

**Issue F-1: Monolithic `lib/utils.ts`**
- Contains 15+ unrelated utility functions (Tailwind, dates, numbers, Frappe helpers, debounce)
- Makes testing difficult, imports unclear
- **Fix**: Split into `lib/utils/cn.ts`, `lib/utils/dates.ts`, `lib/utils/numbers.ts`, `lib/utils/frappe.ts`

**Issue F-2: Mixed Concerns in `lib/frappe/`**
- `client.ts` contains BFF proxy client AND Frappe REST helpers
- Duplicate logic between server-side routes and client-side functions
- **Fix**: Consolidate into `lib/services/` with clear separation: `auth.service.ts`, `doctype.service.ts`

**Issue F-3: No Feature-Based Organization**
- All components flat in `/components/` — hard to find related files
- Related features spread across folders (e.g., form controls in `lib/trevo-form/controls/` but renderers in `lib/trevo-form/renderers/`)
- **Fix**: Introduce feature-based grouping within `components/features/`

**Issue F-4: Missing Config Folder**
- ESLint config is in root `eslint.config.mjs`
- No Prettier config, no lint-staged config, no husky config
- No environment variable validation schema
- **Fix**: Create `config/` directory for all configuration files

**Issue F-5: Index Files Missing**
- `lib/frappe/` has no `index.ts` barrel export
- Import paths are deep and fragile
- **Fix**: Add barrel exports for all module directories
