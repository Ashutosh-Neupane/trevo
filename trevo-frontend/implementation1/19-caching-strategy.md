# Section 19: Caching Strategy

## Caching Layers

### Layer 1: Browser Cache (Cache-Control Headers)
```typescript
// API Routes Cache Strategy
const CACHE_STRATEGIES = {
  // DocType metadata — rarely changes, cache for 1 hour
  META: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' },
  
  // Boot info — user-specific, no cache
  BOOT: { 'Cache-Control': 'private, no-cache, no-store, must-revalidate' },
  
  // List data — short cache for paginated results
  LIST: { 'Cache-Control': 'public, max-age=30, stale-while-revalidate=300' },
  
  // Document data — short cache
  DOC: { 'Cache-Control': 'public, max-age=10, stale-while-revalidate=60' },
  
  // Static assets — cache for 1 year
  STATIC: { 'Cache-Control': 'public, max-age=31536000, immutable' },
};
```

### Layer 2: React Query Client Cache
```typescript
// React Query stale time configuration
const STALE_TIMES = {
  meta: 1000 * 60 * 60,     // 1 hour
  boot: 1000 * 60 * 5,      // 5 minutes
  list: 1000 * 30,          // 30 seconds
  document: 1000 * 10,      // 10 seconds
  search: 1000 * 5,         // 5 seconds
  notifications: 1000 * 15, // 15 seconds
};
```

### Layer 3: Server-Side Response Cache
```typescript
// In-memory cache for server-side data
class ServerCache {
  private cache = new Map<string, { data: unknown; expires: number }>();
  
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry || entry.expires < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    return entry.data as T;
  }
  
  set(key: string, data: unknown, ttlMs: number): void {
    this.cache.set(key, { data, expires: Date.now() + ttlMs });
  }
}

const metaCache = new ServerCache();
export { metaCache };
```

### Layer 4: Next.js ISR (for public pages)
- Future consideration: ISR for public-facing pages
- Not applicable currently as all pages require auth

## Cache Invalidation Strategy
1. **Implicit invalidation**: TTL-based (stale-while-revalidate)
2. **Explicit invalidation**: On mutation (save/delete), invalidate related queries
3. **Optimistic updates**: Update cache immediately, rollback on error

## Implementation Priority
1. Add Cache-Control headers to API routes (P0)
2. Configure React Query stale times per data type (P0)
3. Implement server-side cache for meta data (P1)
4. Implement optimistic updates for CRUD operations (P1)
5. Add SWR pattern for background data refresh (P2)
