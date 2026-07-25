# Section 11: Security Audit

## Vulnerability Findings

### V-1: Hardcoded CSRF Token (Critical)
- File: `lib/frappe/client.ts` — contains `"X-Frappe-CSRF-Token": "fetch"` (literal string)
- Impact: Token never rotates, defeats CSRF protection purpose
- Fix: Remove hardcoded token, implement proper CSRF token fetching

### V-2: Open Proxy via Generic Route (High)
- File: `app/api/frappe/[...path]/route.ts`
- Impact: Any authenticated API call can be proxied to Frappe backend
- Fix: Implement allowlist of permitted Frappe API methods

### V-3: No Input Sanitization (High)
- All API routes accept raw input without validation
- Impact: SQL injection via Frappe, XSS via document content
- Fix: Validate and sanitize all inputs with Zod schemas

### V-4: No Rate Limiting (High)
- Login route has no rate limiting
- Impact: Brute force password attacks possible
- Fix: Implement rate limiting on auth routes

### V-5: Exposed Internal URLs (Medium)
- File: `lib/frappe/server.ts` — `FRAPPE_BACKEND_URL` exposed in client-side bundle
- Impact: Internal network architecture exposed
- Fix: Only expose through server-side env validation

### V-6: No Helmet/Security Headers (Medium)
- `next.config.ts` is empty — no `Content-Security-Policy`, `X-Frame-Options`, etc.
- Impact: Vulnerable to clickjacking, XSS, MIME sniffing
- Fix: Add security headers in `next.config.ts`

### V-7: Missing HTTP-Only on Non-API Cookies (Medium)
- Zustand persist stores may expose sensitive data in localStorage
- Impact: XSS could read persisted state
- Fix: Avoid persisting sensitive data; use Zustand encrypt option

### V-8: No Session Management (Medium)
- No session timeout enforcement
- No concurrent session detection
- Fix: Implement session management with Frappe

## Security Headers Required

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';" },
        ],
      },
    ];
  },
};
```

## Vulnerability Priority Matrix
| ID | Vulnerability | Severity | Effort | Priority |
|----|--------------|----------|--------|----------|
| V-1 | Hardcoded CSRF token | Critical | Low | P0 |
| V-2 | Open proxy | High | Medium | P0 |
| V-3 | No input validation | High | Medium | P0 |
| V-4 | No rate limiting | High | Low | P0 |
| V-5 | Exposed URLs | Medium | Low | P1 |
| V-6 | Missing headers | Medium | Low | P1 |
| V-7 | Persisted state | Medium | Medium | P2 |
| V-8 | Session management | Medium | High | P2 |
