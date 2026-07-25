# Section 4: Recommended Folder Structure

## Proposed Structure

```
trevo-frontend/
├── src/                              # NEW: Source directory
│   ├── app/                          # Next.js App Router (pages only)
│   │   ├── (auth)/login/page.tsx
│   │   ├── (desk)/desk/
│   │   │   ├── page.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── loading.tsx
│   │   │   ├── error.tsx
│   │   │   └── not-found.tsx
│   │   └── api/                      # BFF API routes
│   ├── components/                   # Shared UI
│   │   ├── ui/                       # shadcn/ui components
│   │   ├── layout/                   # Shell, Sidebar, Navbar
│   │   ├── features/                 # Feature-based components
│   │   │   ├── auth/
│   │   │   ├── doctype-list/
│   │   │   ├── doctype-form/
│   │   │   ├── workspace/
│   │   │   ├── notifications/
│   │   │   ├── command-palette/
│   │   │   └── reports/
│   │   └── shared/                   # Reusable primitives
│   ├── config/                       # Configuration
│   │   ├── env.ts                    # Environment validation
│   │   ├── frappe.ts                 # Frappe-specific constants
│   │   └── routes.ts                 # Route constants
│   ├── lib/                          # Core library
│   │   ├── services/                 # Service layer (NEW)
│   │   │   ├── auth.service.ts
│   │   │   ├── doctype.service.ts
│   │   │   ├── document.service.ts
│   │   │   ├── list.service.ts
│   │   │   ├── workspace.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── search.service.ts
│   │   │   └── report.service.ts
│   │   ├── utils/                    # Split utilities
│   │   │   ├── cn.ts                 # Tailwind merge
│   │   │   ├── dates.ts             # date-fns wrappers
│   │   │   ├── numbers.ts           # Currency/number format
│   │   │   ├── frappe.ts            # Frappe-specific helpers
│   │   │   ├── strings.ts           # String manipulation
│   │   │   └── debounce.ts          # Debounce utility
│   │   ├── hooks/                    # React hooks
│   │   ├── stores/                   # Zustand stores
│   │   ├── frappe/                   # Frappe client (thin)
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── types.ts
│   │   ├── trevo-form/               # Form engine (unchanged)
│   │   └── validation/               # Zod schemas
│   │       ├── auth.schema.ts
│   │       ├── doctype.schema.ts
│   │       └── common.schema.ts
│   ├── middleware.ts                 # Edge middleware
│   └── providers.tsx                 # Client providers
├── config/                           # Project-level config
│   ├── eslint.config.mjs
│   ├── prettier.config.mjs
│   ├── jest.config.ts
│   ├── playwright.config.ts
│   └── docker-compose.yml
├── scripts/                          # Automation scripts
│   ├── seed.ts
│   └── migrate.ts
├── public/
├── tests/                            # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── Dockerfile
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Migration Strategy
1. Create `src/` directory structure first
2. Move files incrementally (not breaking `@/` path alias — update to `@/src/`)
3. Update `tsconfig.json` paths: `"@/*": ["./src/*"]`
4. Create barrel exports for all modules
5. Maintain backward compatibility during transition
