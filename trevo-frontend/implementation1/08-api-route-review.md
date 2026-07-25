# Section 8: API Route Review

## Current API Routes

| Route | Method | Purpose | Issues |
|-------|--------|---------|--------|
| `/api/auth/login` | POST | Login proxy to Frappe | No rate limiting, no input validation |
| `/api/auth/logout` | POST | Logout proxy | No CSRF protection |
| `/api/auth/whoami` | GET | Get current user | Exposed without auth (intentional) |
| `/api/boot` | GET | Assemble boot info | No caching, calls multiple Frappe endpoints |
| `/api/doctype/[doctype]/doc` | GET/POST/DELETE | CRUD operations | No input validation, no authorization |
| `/api/doctype/[doctype]/docinfo` | GET | Document info | No input validation |
| `/api/doctype/[doctype]/meta` | GET | DocType metadata | No caching (rarely changes) |
| `/api/doctype/[doctype]/save` | POST | Save via savedocs method | No input validation |
| `/api/doctype/[doctype]/list` | GET | List with filters/pagination | No input validation, no caching |
| `/api/frappe/[...path]` | ALL | Generic proxy | No auth check, no validation, open proxy risk |

## Critical Issues

**Issue API-1: No Input Validation**
- All route handlers accept raw params without validation
- No type checking on query params, body, or path params
- **Risk**: Injection attacks, malformed requests causing backend errors
- **Fix**: Use Zod schemas to validate all inputs

**Issue API-2: No Rate Limiting**
- All routes are unprotected against brute force and DoS
- Login route is especially vulnerable
- **Fix**: Implement rate limiting with `@upstash/ratelimit` or similar

**Issue API-3: No Authentication on Generic Proxy**
- `/api/frappe/[...path]` allows any authenticated Frappe API call
- Acts as open proxy to Frappe backend
- **Fix**: Implement allowlist + audit logging for proxied calls

**Issue API-4: No Response Caching**
- Meta data and boot info are fetched fresh on every request
- DocType metadata rarely changes — could be cached for hours
- **Fix**: Implement response caching with `stale-while-revalidate`

**Issue API-5: Inconsistent Error Responses**
- Some routes return `{ error: "..." }`, others return `{ message: "..." }`
- No standardized error response format
- **Fix**: Create `ApiError` class and standardized error response utility
