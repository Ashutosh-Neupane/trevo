# Section 18: Performance Optimization Plan

## Current Issues

**Issue P-1: No Image Optimization**
- Static images in `/public/images/` are served as-is (4+ MB PNG files)
- No Next.js Image component usage
- **Impact**: Slow page loads, high bandwidth usage
- **Fix**: Use `next/image` with proper sizing, WebP format, lazy loading

**Issue P-2: No Code Splitting**
- Large bundle includes all form controls (25+) even when not used
- Command palette, notifications panel loaded eagerly
- **Impact**: Large initial JS bundle
- **Fix**: Dynamic imports with `next/dynamic` for heavy components

**Issue P-3: No Bundle Analysis**
- No tools to identify large dependencies or duplicate code
- **Impact**: Unknown bundle size, regressions easy
- **Fix**: Add `@next/bundle-analyzer` to build process

**Issue P-4: No Font Optimization**
- Geist font loaded from next/font (good) but with both Sans and Mono
- **Impact**: Extra font file download
- **Fix**: Only load fonts needed per page

**Issue P-5: Inefficient Re-renders**
- State stored high in tree causes unnecessary re-renders
- No useMemo/useCallback usage in many components
- **Impact**: Sluggish UI during heavy data updates
- **Fix**: Audit and optimize render behavior

## Optimization Targets

### 1. Bundle Size Optimization
```typescript
// Before (eager import)
import { FormRenderer } from '@/lib/trevo-form/renderers/FormRenderer';

// After (dynamic import)
const FormRenderer = dynamic(() => 
  import('@/lib/trevo-form/renderers/FormRenderer'), 
  { loading: () => <Skeleton /> }
);
```

### 2. Image Optimization
```typescript
// next.config.ts
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};
```

### 3. React Query Optimizations
```typescript
// Configure stale times per data type
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds default
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Doctype meta: stale for 1 hour (rarely changes)
// Boot info: stale for 5 minutes
// List data: stale for 30 seconds
// Document data: stale for 10 seconds
```

### 4. Server-Side Performance
- Add response caching for meta data
- Implement connection pooling to Frappe backend
- Add request coalescing (deduplicate identical requests)

### 5. Client-Side Performance
- Virtual scrolling for large lists
- Debounce search inputs
- Memoize expensive computations
- Use React.memo for pure components

## Performance Budget
| Metric | Current | Target |
|--------|---------|--------|
| Initial JS bundle | ~500KB | <200KB |
| First Contentful Paint | ~2s | <1s |
| Largest Contentful Paint | ~4s | <2s |
| Time to Interactive | ~3s | <1.5s |
| Lighthouse Performance | ~60 | >90 |
