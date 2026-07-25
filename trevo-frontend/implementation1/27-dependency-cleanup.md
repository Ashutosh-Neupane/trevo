# Section 27: Dependency Cleanup

## Current Dependencies Audit

### Production Dependencies
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `@hookform/resolvers` | ^5.4.0 | ✅ Keep | Used with react-hook-form |
| `@radix-ui/*` | Various | ✅ Keep | UI primitives |
| `@tanstack/react-query` | ^5.101.1 | ✅ Keep | Server state management |
| `axios` | ^1.18.1 | ⚠️ Consider | Could replace with native `fetch` |
| `class-variance-authority` | ^0.7.1 | ✅ Keep | shadcn dependency |
| `clsx` | ^2.1.1 | ✅ Keep | Combined with tailwind-merge |
| `cmdk` | ^1.1.1 | ✅ Keep | Command palette |
| `cookie-parser` | ^1.4.7 | ⚠️ Server only | Move to dev deps |
| `date-fns` | ^4.4.0 | ✅ Keep | Date utilities |
| `js-cookie` | ^3.0.8 | ❌ Remove | Use native cookie API |
| `jsonwebtoken` | ^9.0.3 | ⚠️ Verify | Not actively used? |
| `lucide-react` | ^1.21.0 | ✅ Keep | Icons |
| `next` | 16.2.9 | ✅ Keep | Framework |
| `papaparse` | ^5.5.2 | ✅ Keep | CSV import/export |
| `react` + `react-dom` | 19.2.4 | ✅ Keep | UI library |
| `react-hook-form` | ^7.80.0 | ✅ Keep | Form management |
| `recharts` | ^3.10.0 | ✅ Keep | Charts |
| `sonner` | ^2.0.7 | ✅ Keep | Toast notifications |
| `tailwind-merge` | ^3.6.0 | ✅ Keep | Class merging |
| `zod` | ^4.4.3 | ✅ Keep | Validation |
| `zustand` | ^5.0.14 | ✅ Keep | State management |

### Dev Dependencies
| Package | Version | Status | Notes |
|---------|---------|--------|-------|
| `@playwright/test` | ^1.55.0 | ✅ Keep | E2E testing |
| `@tailwindcss/postcss` | ^4 | ✅ Keep | CSS |
| `@types/node` | ^20 | ✅ Keep | TypeScript |
| `@types/react` | ^19 | ✅ Keep | TypeScript |
| `@types/react-dom` | ^19 | ✅ Keep | TypeScript |
| `eslint` | ^9 | ✅ Keep | Linting |
| `eslint-config-next` | 16.2.9 | ✅ Keep | ESLint config |
| `tailwindcss` | ^4 | ✅ Keep | CSS |
| `typescript` | ^5 | ✅ Keep | Language |

### Packages to Add
| Package | Purpose | Priority |
|---------|---------|----------|
| `vitest` + `@testing-library/react` | Unit/integration testing | P0 |
| `prettier` | Code formatting | P0 |
| `husky` + `lint-staged` | Pre-commit hooks | P0 |
| `@sentry/nextjs` | Error tracking | P1 |
| `@next/bundle-analyzer` | Bundle analysis | P1 |
| `zod` validation schemas | Already in deps, needs usage | P0 |

### Packages to Remove
| Package | Reason |
|---------|--------|
| `js-cookie` | Replaced by native `cookies()` API |
| `jsonwebtoken` | Not used — Frappe manages auth |
| `cookie-parser` | Move to devDependencies (server-only) |

## Action Items
1. Remove unused dependencies
2. Move `cookie-parser` to devDependencies
3. Add testing libraries
4. Add formatting tools
5. Add Sentry for error tracking
6. Regular dependency audit in CI
