# Section 10: Authentication & Authorization Review

## Current Auth Flow

1. **Login**: User submits creds → `/api/auth/login` → Frappe `/api/method/login` → Re-issue `sid` cookie on our domain
2. **Session Validation**: Middleware checks `sid` cookie existence (not validity) for `/desk/*`
3. **WhoAmI**: `/api/auth/whoami` → Frappe `frappe.auth.get_logged_user`
4. **Boot**: `/api/boot` → Calls Frappe for user info + installed apps

## Security Issues

**Issue Auth-1: Cookie-Only Auth Without Validation**
- Middleware only checks if `sid` cookie *exists* — not if it's *valid*
- An expired `sid` allows access until the subsequent API call fails
- **Fix**: Validate session server-side with a lightweight check

**Issue Auth-2: Token Not Regenerated on Login**
- Users who were logged in as Guest get the same `sid` type
- No session rotation
- **Fix**: Force session rotation on login

**Issue Auth-3: No Logout Server-Side**
- Current logout only clears client cookie
- Session remains active on Frappe backend
- **Fix**: Call Frappe logout method AND clear cookie

**Issue Auth-4: No Authorization**
- No role/permission checks on API routes
- Any authenticated user can access any doctype
- **Fix**: Check Frappe has_permission before CRUD operations

**Issue Auth-5: No CSRF Protection**
- Cookie-based auth without CSRF token
- Login route could be CSRF-attacked
- **Fix**: Implement double-submit cookie pattern or use SameSite=Strict

## Proposed Auth Architecture

```typescript
// auth.service.ts
interface AuthService {
  login(email: string, password: string): Promise<Session>;
  logout(): Promise<void>;
  validateSession(sid: string): Promise<boolean>;
  checkPermission(doctype: string, name?: string): Promise<boolean>;
}

// middleware.ts
// Check session validity AND permission on every protected request
```

## Authorization Matrix
| Role | Action | Endpoint |
|------|--------|----------|
| System Manager | All CRUD | All |
| User | Read own docs | GET /doc |
| Guest | None | Protected |
