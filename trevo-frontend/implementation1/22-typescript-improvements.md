# Section 22: TypeScript Improvements

## Current State
- `strict: true` enabled in tsconfig
- But many `any` types and unchecked type casts throughout the codebase
- No strict type checking for Frappe API responses
- Missing type definitions for some global objects

## Issues Found

### Issue TS-1: Unchecked Type Casts
```typescript
// Current (unsafe)
const bootUser = bootInfo?.user as Omit<FrappeUser, "name"> | undefined;

// Proposed (safe)
const bootUser = bootInfo?.user;
// Type guard or Zod schema validation
```

### Issue TS-2: `any` Types in API Responses
```typescript
// FrappeAPIResponse<T> has exc: string | object | null — too loose
// Many functions return Promise<any> instead of typed responses
```

### Issue TS-3: Missing Generic Constraints
- React Query hooks don't enforce proper type parameters
- useState hooks without explicit type parameters

### Issue TS-4: No Declaration Files
- `types/google-maps.d.ts` exists but may be incomplete
- No ambient declarations for environment variables

## Recommendations

### 1. Enable Strict Options
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": false,
    "forceConsistentCasingInFileNames": true
  }
}
```

### 2. Add Zod Validation for API Boundaries
Use Zod schemas to validate data at the API boundary and derive types:
```typescript
const BootInfoSchema = z.object({
  user: FrappeUserSchema,
  installed_apps: z.array(InstalledAppSchema),
  sysdefaults: z.record(z.string()),
  lang: z.string(),
});

type BootInfo = z.infer<typeof BootInfoSchema>;
```

### 3. No `any` Policy
- Configure ESLint to disallow `any` types
- Use `unknown` instead of `any` for generic data
- Use branded types for IDs (DocType, DocName)

### 4. Proper Generic Types
```typescript
// Instead of useState<any>(null)
useState<FrappeUser | null>(null);

// Instead of Promise<any>
async function getDocument<T extends FrappeDocument>(name: string): Promise<T>;
