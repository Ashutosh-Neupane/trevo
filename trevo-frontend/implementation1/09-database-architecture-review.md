# Section 9: Database Architecture Review

## Current State
This is a BFF proxy — there is NO direct database connection. All data is served by the Frappe backend.

## Analysis
Since this application acts purely as a proxy, the "database architecture" review focuses on:
1. **Data caching strategy** — Currently no caching at all
2. **Data transformation layer** — Minimal transformation in boot info assembly
3. **Offline capabilities** — None
4. **Optimistic updates** — Not implemented

## Recommendations

### 1. Client-Side Cache Strategy
- Use React Query's `staleTime` aggressively:
  - DocType meta: 1 hour (rarely changes)
  - List views: 30 seconds
  - Document details: 10 seconds (could be edited by others)
  - Boot info: 5 minutes

### 2. Response Cache Headers
- Add `Cache-Control` headers to API responses:
  - `/api/doctype/[doctype]/meta`: `public, max-age=3600, stale-while-revalidate=86400`
  - `/api/boot`: `private, no-cache` (contains user-specific data)

### 3. SWR Pattern
- Implement `stale-while-revalidate` for:
  - List views (show stale data, refetch in background)
  - Dashboard/report data

### 4. Optimistic Updates
- On document save: Immediately update React Query cache
- On document delete: Immediately remove from cache
- On document create: Immediately add to cache
- Rollback on error with toast notification
