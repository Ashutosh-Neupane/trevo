# Section 24: Testing Strategy

## Current State
- **Unit Tests**: None
- **Integration Tests**: None
- **E2E Tests**: 1 Playwright spec (incomplete)
- **Test Coverage**: ~0%

## Proposed Testing Strategy

### Unit Tests (Vitest)
```typescript
// lib/utils/cn.test.ts
import { describe, it, expect } from 'vitest';
import { cn } from './cn';

describe('cn utility', () => {
  it('merges class names correctly', () => {
    expect(cn('px-4', 'py-2')).toBe('px-4 py-2');
    expect(cn('px-4', false && 'hidden')).toBe('px-4');
  });
});
```

**What to test (Priority Order):**
1. Utility functions (`lib/utils/*`)
2. Zustand stores (`lib/stores/*`)
3. Zod validation schemas
4. API route handlers (with mocked Frappe backend)
5. Form control components
6. Hooks

### Integration Tests
```typescript
// tests/integration/auth.test.ts
import { describe, it, expect } from 'vitest';

describe('Authentication flow', () => {
  it('should set cookie on successful login', async () => {
    // Mock Frappe login endpoint
    // Call /api/auth/login
    // Assert cookie is set
  });
});
```

### E2E Tests (Playwright)
Already using Playwright — expand test coverage:

```typescript
// e2e/auth.spec.ts
test('should redirect unauthenticated user to login', async ({ page }) => {
  await page.goto('/desk');
  await expect(page).toHaveURL(/\/login/);
});

test('should login successfully', async ({ page }) => {
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/\/desk/);
});
```

### Test Configuration
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

## Coverage Targets
| Layer | Current | Target |
|-------|---------|--------|
| Utility functions | 0% | 95% |
| Zod schemas | 0% | 100% |
| Zustand stores | 0% | 90% |
| API routes | 0% | 85% |
| Components (unit) | 0% | 70% |
| Integration | 0% | 60% |
| E2E | Minimal | 80% of flows |

## Implementation Priority
1. Install Vitest and testing libraries
2. Set up test configuration
3. Write utility function tests
4. Write store tests
5. Write API route tests (integration)
6. Expand E2E tests
7. Add component tests with React Testing Library
8. Add CI test execution
