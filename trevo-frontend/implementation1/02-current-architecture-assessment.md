# Section 2: Current Architecture Assessment

## 2.1 High-Level Architecture

```
┌─────────────────────────────────────────┐
│              Browser                     │
│  Next.js App (localhost:3000)           │
│  ┌───────────┐  ┌──────────────────┐   │
│  │ Client     │  │ Server (BFF)     │   │
│  │ Components │  │ API Routes       │   │
│  │ Context/   │  │ - /api/auth/*    │   │
│  │ Zustand    │  │ - /api/doctype/* │   │
│  │ ReactQuery │  │ - /api/frappe/*  │   │
│  └───────────┘  └──────────────────┘   │
│         │               │               │
└─────────┼───────────────┼───────────────┘
          │               │
          ▼               ▼
┌─────────────────────────────────────────┐
│        Frappe Backend (:8000)           │
│  REST API + Method calls + Cookie auth  │
└─────────────────────────────────────────┘
```

## 2.2 Route Architecture
- **Auth routes** (`/api/auth/*`): Login proxy re-issues `sid` HttpOnly cookie on Next.js domain.
- **BFF proxy** (`/api/frappe/[...path]`): Generic catch-all forwarding to Frappe backend.
- **Doctype routes** (`/api/doctype/[doctype]/*`): CRUD operations + meta + docinfo + save.
- **Boot route** (`/api/boot`): Assembles user + installed apps into single response.

## 2.3 State Management
- **Server state**: TanStack React Query handles caching, refetching, pagination
- **Client state**: Zustand stores for auth, UI, desk state
- **Auth context**: React Context wrapping AuthProvider with user state
- **Form state**: Custom FormStore class implementing observer pattern

## 2.4 Authentication Flow
1. User submits credentials to `/api/auth/login`
2. Server proxies to Frappe `/api/method/login`
3. Frappe returns `Set-Cookie: sid=...` (on Frappe domain)
4. Our BFF extracts `sid` and re-issues it on our domain as HttpOnly, SameSite=Lax
5. Browser sends `sid` cookie to our `/api/frappe/*` and `/api/boot`
6. Server forwards cookie to Frappe for each backend call
7. Middleware checks for `sid` cookie on `/desk/*` routes, redirects to `/login` if missing

## 2.5 Key Architectural Issues

**Issue A-1: Bypassable Auth in Middleware**
- File: `middleware.ts`
- Problem: Line `if (pathname.startsWith("/api/")) return NextResponse.next();` — ALL API routes skip auth check
- Impact: `/api/doctype/*` endpoints are accessible without authentication
- Fix: Implement JWT/session validation for API routes instead of blanket bypass

**Issue A-2: Broken URL Pattern in actions.ts**
- File: `lib/trevo-form/actions.ts`
- Problem: URL contains literal `[doctype]` instead of being dynamic
- Impact: Save operations fail because the URL is never resolved
- Fix: Make save URL dynamic via parameter interpolation

**Issue A-3: Duplicate API Logic**
- Multiple client-side functions in `lib/frappe/client.ts` duplicate logic from server routes
- Example: `frappeGet`, `frappePost` in client vs `/api/doctype/[doctype]/doc/route.ts`
- Fix: Centralize API layer, route all requests through server-side BFF

**Issue A-4: No Separation of Concerns**
- `lib/utils.ts` mixes: Tailwind helpers, Frappe value coercion, date formatting, number formatting, Frappe-specific helpers, debounce
- Violates Single Responsibility Principle
- Fix: Split into domain-specific utilities

**Issue A-5: No Service Layer**
- Business logic scattered across route handlers, hooks, and components
- No abstraction for data access, making testing difficult
- Fix: Create service classes/objects for each domain (auth, document, list, workspace)
