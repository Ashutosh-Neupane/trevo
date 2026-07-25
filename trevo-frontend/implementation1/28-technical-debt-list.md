# Section 28: Technical Debt List

## P0 — Critical (Security & Functionality)

| # | Item | Impact | File(s) | Effort |
|---|------|--------|---------|--------|
| TD1 | Hardcoded CSRF token literal | Auth bypass | `lib/frappe/client.ts` | 1h |
| TD2 | All API routes bypass auth in middleware | Unauthorized access | `middleware.ts` | 2h |
| TD3 | Literal `[doctype]` in save URL | Save operations broken | `lib/trevo-form/actions.ts` | 1h |
| TD4 | No input validation on API routes | Injection vulnerabilities | All API routes | 8h |
| TD5 | No rate limiting on login | Brute force | `api/auth/login/route.ts` | 2h |
| TD6 | Empty next.config.ts | No security headers, no caching | `next.config.ts` | 2h |

## P1 — High (Architecture & Quality)

| # | Item | Impact | File(s) | Effort |
|---|------|--------|---------|--------|
| TD7 | Monolithic lib/utils.ts | Maintainability, testing | `lib/utils.ts` | 4h |
| TD8 | No service layer abstraction | Tight coupling, hard to test | All lib/frappe/* | 8h |
| TD9 | Duplicate API client/server logic | Inconsistency, maintenance | `lib/frappe/client.ts` | 4h |
| TD10 | No loading states in list/form views | Poor UX | App pages | 4h |
| TD11 | No empty states | Poor UX | List components | 2h |
| TD12 | Error handling inconsistency | Debugging difficulty | All API routes | 6h |
| TD13 | No caching strategy | Poor performance | `next.config.ts`, API | 6h |
| TD14 | Client-side bundle size | Slow page loads | App pages | 4h |

## P2 — Medium (Developer Experience & Polish)

| # | Item | Impact | File(s) | Effort |
|---|------|--------|---------|--------|
| TD15 | No Prettier config | Inconsistent formatting | Root | 1h |
| TD16 | No pre-commit hooks | Quality regressions | Root | 1h |
| TD17 | No barrel exports | Fragile imports | lib/* | 2h |
| TD18 | No component tests | Unknown regressions | All components | 16h |
| TD19 | No integration tests | Unknown regressions | API routes | 8h |
| TD20 | Over-clientification | Bundle size, performance | Multiple pages | 4h |
| TD21 | Missing ARIA labels | Accessibility issues | Multiple components | 4h |
| TD22 | No per-page metadata | Poor SEO | Multiple pages | 1h |

## P3 — Low (Nice to Have)

| # | Item | Impact | File(s) | Effort |
|---|------|--------|---------|--------|
| TD23 | No Sentry integration | Unknown production errors | All | 4h |
| TD24 | No structured logging | Debugging difficulty | API routes | 4h |
| TD25 | No bundle analysis | Unknown bundle size | Build config | 1h |
| TD26 | No OpenAPI spec | Poor API documentation | API routes | 8h |
| TD27 | No storybook | Component documentation | Components | 16h |

## Total Estimated Technical Debt
| Priority | Count | Total Effort |
|----------|-------|-------------|
| P0 | 6 items | 16 hours |
| P1 | 8 items | 38 hours |
| P2 | 8 items | 37 hours |
| P3 | 5 items | 33 hours |
| **Total** | **27 items** | **~124 hours** |
