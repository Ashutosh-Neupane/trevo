# Section 20: SEO Review

## Current State
- Single global metadata in `app/layout.tsx`
- Title: "Trevo — Frappe Frontend"
- No per-page metadata
- No structured data (JSON-LD)
- No sitemap
- No robots.txt

## Issues
**Issue SEO-1: All Pages Behind Auth** — Most pages require login, so SEO impact is limited.
**Issue SEO-2: Login Page Missing Metadata** — Login page has no specific title/description.
**Issue SEO-3: No Open Graph Tags** — Social sharing metadata missing.

## Recommendations
While this is an authenticated app, we should still implement:
1. **Per-page metadata** for shared pages (login, public resources)
2. **Open Graph tags** on login page for social sharing
3. **robots.txt** to disallow indexing of authenticated pages
4. **Sitemap** for any public pages
5. **Structured data** for login page (WebApplication)

## Implementation
```typescript
// app/(auth)/login/page.tsx — Add metadata
export const metadata: Metadata = {
  title: 'Login | Trevo',
  description: 'Sign in to Trevo — Modern ERP Frontend',
  openGraph: {
    title: 'Trevo — Modern ERP Frontend',
    description: 'Sign in to manage your business operations',
  },
};

// public/robots.txt
User-agent: *
Disallow: /desk/
Disallow: /api/
