# Section 25: CI/CD Improvements

## Current State
**No CI/CD pipeline exists.** Only manual commands in `package.json`.

## Proposed Pipeline

### GitHub Actions Workflow
```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: trevo-frontend/package-lock.json
      
      - name: Install dependencies
        run: npm ci
        working-directory: trevo-frontend
      
      - name: Type check
        run: npx tsc --noEmit
        working-directory: trevo-frontend
      
      - name: Lint
        run: npm run lint
        working-directory: trevo-frontend
      
      - name: Check formatting
        run: npx prettier --check .
        working-directory: trevo-frontend

  test:
    name: Tests
    needs: quality
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
        working-directory: trevo-frontend
      
      - name: Run unit tests
        run: npx vitest run --coverage
        working-directory: trevo-frontend
      
      - name: Run E2E tests
        run: npx playwright test
        working-directory: trevo-frontend
        env:
          CI: true

  security:
    name: Security Scan
    needs: quality
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: npm audit
        run: npm audit --production
        working-directory: trevo-frontend
        continue-on-error: true
      
      - name: Check for secrets
        uses: trufflesecurity/trufflehog@v3
        with:
          extra_args: --only-verified

  build:
    name: Build
    needs: [test, security]
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
        working-directory: trevo-frontend
      
      - name: Build
        run: npm run build
        working-directory: trevo-frontend
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: trevo-frontend/.next/

  deploy:
    name: Deploy
    if: github.ref == 'refs/heads/main'
    needs: build
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Quality Gates
| Gate | Threshold | Action |
|------|-----------|--------|
| TypeScript | No errors | Fail build |
| ESLint | No errors | Fail build |
| Test coverage | >80% | Warning |
| Security audit | No critical | Fail build |
| Build | Successful | Required |
| Formatting | Compliant | Warning |

### Pre-commit Hooks (husky + lint-staged)
```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm run type-check && npm run test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

## Implementation Priority
1. Set up GitHub Actions workflow
2. Add husky + lint-staged pre-commit hooks
3. Configure Dependabot for dependency updates
4. Add Vercel deployment integration
5. Add security scanning
