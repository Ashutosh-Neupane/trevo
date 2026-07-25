# Section 13: Environment Variable Audit

## Current Environment Variables

| Variable | Used In | Current Value | Issue |
|----------|---------|---------------|-------|
| `NEXT_PUBLIC_FRAPPE_BASE_URL` | `lib/frappe/client.ts` | `http://localhost:8000` | Hardcoded default, public exposure |
| `FRAPPE_BACKEND_URL` | `lib/frappe/server.ts` | `http://localhost:8000` | Hardcoded default, no validation |
| None (env validation) | — | — | No validation schema exists |

## Issues Found

**Issue ENV-1: No Environment Validation**
- No runtime validation of required environment variables
- App starts with missing/invalid config
- **Fix**: Add Zod schema for environment validation

**Issue ENV-2: Public Exposure of Backend URL**
- `NEXT_PUBLIC_FRAPPE_BASE_URL` is exposed in client bundle
- Internal network topology exposed to users
- **Fix**: Remove `NEXT_PUBLIC_` prefix, route all through BFF

**Issue ENV-3: Missing Required Variables**
| Variable | Required | Description |
|----------|----------|-------------|
| `FRAPPE_BACKEND_URL` | Yes | Frappe backend URL |
| `NEXT_PUBLIC_APP_URL` | Yes | Public app URL (for CORS/redirects) |
| `NODE_ENV` | Yes | Environment mode |
| `SENTRY_DSN` | No | Error tracking |
| `LOG_LEVEL` | No | Logging level |

## Proposed Environment Variable Schema

```typescript
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  // Required
  FRAPPE_BACKEND_URL: z.string().url().default('http://localhost:8000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // Optional with defaults
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  SENTRY_DSN: z.string().url().optional(),
  
  // Feature flags
  ENABLE_RATE_LIMITING: z.coerce.boolean().default(true),
  ENABLE_CACHE: z.coerce.boolean().default(true),
  CACHE_TTL_SECONDS: z.coerce.number().default(300),
});

export const env = envSchema.parse(process.env);
```

## Migration Steps
1. Create `config/env.ts` with Zod validation
2. Move `FRAPPE_BACKEND_URL` usage to server-only
3. Remove `NEXT_PUBLIC_FRAPPE_BASE_URL` from client code
4. Add `.env.example` with all required variables documented
5. Add `.env.local` validation on app startup
