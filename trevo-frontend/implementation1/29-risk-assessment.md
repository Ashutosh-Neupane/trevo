# Section 29: Risk Assessment

## Risk Matrix

| Risk ID | Description | Probability | Impact | Score | Mitigation |
|---------|-------------|------------|--------|-------|------------|
| R1 | Backend API changes (Frappe) break proxy | Medium | High | 8 | Add integration tests, versioned API routes |
| R2 | Cookie-based auth compromised via XSS | Low | Critical | 8 | HttpOnly cookies, CSP headers, input sanitization |
| R3 | Open proxy route abused for SSRF | Medium | High | 8 | Allowlist permitted endpoints |
| R4 | Brute force attack on login | High | Medium | 6 | Rate limiting + account lockout |
| R5 | Dependency supply chain attack | Low | High | 6 | Lock files, Dependabot, npm audit |
| R6 | Breaking changes in Next.js 16 | Medium | High | 6 | Pin versions, thorough testing |
| R7 | Frappe session timeout inconsistency | Medium | Medium | 4 | Implement session refresh mechanism |
| R8 | Large form state memory leaks | Medium | Medium | 4 | Monitor memory, implement cleanup |
| R9 | CORS misconfiguration | Low | Medium | 3 | Validate CORS settings |
| R10 | Data exposure via Zustand persist | Medium | Medium | 4 | Encrypt persisted auth data |

## Risk Mitigation Plan

### Immediate (Week 1-2)
- R1: Add comprehensive integration tests with mocked Frappe backend
- R2: Add CSP headers, review XSS vectors
- R3: Implement allowlist for proxy route
- R4: Add rate limiting

### Short-term (Week 3-4)
- R5: Configure Dependabot, run weekly audits
- R6: Set up preview deployments for Next.js upgrades
- R7: Implement session health check with auto-refresh

### Medium-term (Month 2)
- R8: Add memory profiling, cleanup unused subscriptions
- R9: Audit and harden CORS configuration
- R10: Encrypt sensitive Zustand store data

## Contingency Plans
1. **Auth failure**: Implement fallback to basic auth
2. **Backend outage**: Enhanced error messages with retry logic
3. **Data corruption**: Reactive cache invalidation strategy
