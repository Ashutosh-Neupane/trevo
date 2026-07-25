# Section 7: Server vs Client Component Review

## Current State
All page components and the layout use `"use client"` directive. No server components are utilized.

## Issues Found
1. **Over-clientification**: Every page has `"use client"` — even pages that could be static/server-rendered
2. **No Server-Side Data Fetching**: All data fetching happens on the client via React Query hooks
3. **Missing ISR/SSR**: Boot info and meta data could be server-fetched for faster initial load
4. **Bundle Size**: Client components are larger and increase JS bundle

## Recommendations

### Convert to Server Components (No "use client")
- `app/page.tsx` — simple redirect, already Server Component ✅
- `app/layout.tsx` — already Server Component ✅
- `app/(desk)/desk/layout.tsx` — could be Server Component with client-shell pattern

### Use Server Component Pattern
```typescript
// Server Component (data fetching)
async function DeskLayout({ children }) {
  const bootInfo = await fetchBootInfo(); // Server fetch
  return (
    <AuthGuard>
      <Shell bootInfo={bootInfo}>
        {children}
      </Shell>
    </AuthGuard>
  );
}

// Client Component (interactivity)
("use client");
function Shell({ children, bootInfo }) {
  // Zustand store hydration from server data
  return <div>{children}</div>;
}
```

### Benefits
- Smaller client JS bundle
- Faster initial page load (server-rendered HTML)
- Better SEO for public pages
- Reduced client-server waterfall

### Priority Pages for Server Components
- `app/page.tsx` ✅ Already server
- `app/layout.tsx` ✅ Already server
- `app/(desk)/desk/layout.tsx` — Server component with client wrapper
- Login page — Server component with client form
- List views — Data fetching on server, interactivity on client
