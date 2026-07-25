# Section 15: Input Validation Review

## Current State
**No input validation exists anywhere in the API route handlers or component forms.**

## Findings

### API Routes (No Validation)
- `/api/auth/login` — No email/password format validation
- `/api/doctype/[doctype]/doc` — No doctype name validation, body validation
- `/api/doctype/[doctype]/list` — No filter, sort, pagination validation
- `/api/doctype/[doctype]/save` — No document data validation
- `/api/frappe/[...path]` — No path or method validation

### Client-Side Forms
- `react-hook-form` and `zod` are in dependencies but NOT used in forms
- Custom `validation.ts` exists but is Frappe-specific field validation
- No schema validation on form submission

## Proposed Validation Architecture

```typescript
// lib/validation/auth.schema.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128),
});

// lib/validation/doctype.schema.ts
export const listParamsSchema = z.object({
  doctype: z.string().min(1).max(255),
  fields: z.array(z.string()).optional(),
  filters: z.array(z.unknown()).optional(),
  order_by: z.string().optional(),
  limit: z.number().int().min(1).max(1000).default(20),
  limit_start: z.number().int().min(0).default(0),
});
```

## Implementation Plan
1. Create `/lib/validation/` directory with schemas for all endpoints
2. Add schema validation middleware for API routes
3. Integrate `react-hook-form` + `zod` in all form components
4. Add client-side validation before form submission
5. Add server-side validation in API routes as second line of defense

## Priority Routes for Validation
| Priority | Route | Schema |
|----------|-------|--------|
| P0 | `/api/auth/login` | `loginSchema` |
| P0 | `/api/doctype/[doctype]/save` | `documentSchema` |
| P0 | `/api/doctype/[doctype]/list` | `listParamsSchema` |
| P1 | `/api/doctype/[doctype]/doc` | `docSchema` |
| P1 | `/api/frappe/[...path]` | `proxySchema` |
