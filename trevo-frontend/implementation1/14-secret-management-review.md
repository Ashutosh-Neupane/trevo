# Section 14: Secret Management Review

## Current State
- No secrets management system
- Backend URL is hardcoded
- No API keys or tokens in codebase currently
- No `.env.example` file

## Issues

### Issue S-1: No Secrets Management
- All configuration is in code or environment variables
- No encrypted secrets storage
- **Fix**: Implement secrets management with:
  - Production: Vercel Environment Variables / AWS Secrets Manager
  - Development: `.env.local` with `.env.example` template

### Issue S-2: Hardcoded Backend URL
- `FRAPPE_BACKEND_URL = "http://localhost:8000"` in `lib/frappe/server.ts`
- Accident-prone for production deployments
- **Fix**: Always read from environment, fail if missing

### Issue S-3: No Encryption for Sensitive Data
- Zustand stores may persist auth tokens in localStorage unencrypted
- **Fix**: Use encrypted persistence for sensitive store data

## Recommendations
1. Create `.env.example` with all env vars documented
2. Add `.env.local` to `.gitignore` (already done)
3. Use `zod` to validate env vars at startup
4. Implement encrypted Zustand persist for sensitive data
5. Use Vercel environment variables for production

## Checklist
- [ ] Create `.env.example` file
- [ ] Verify `.env.local` is in `.gitignore`
- [ ] Add environment validation schema
- [ ] Remove hardcoded defaults
- [ ] Add secrets scanning to CI/CD
