# Section 6: Component Architecture Improvements

## Current Issues

**Issue C-1: No Component Composition Pattern**
- Components like `TrevoShell.tsx` are monolithic — mix sidebar, header, content area
- Hard to customize or test individual parts
- **Fix**: Split into `Shell`, `Sidebar`, `TopBar`, `ContentArea` — compose via children/slots

**Issue C-2: Missing Loading States**
- `Skeleton.tsx` exists but is not consistently used across pages
- List view and form view don't show skeleton during data fetch
- **Fix**: Add loading.tsx for each route segment + Suspense boundaries

**Issue C-3: Error Boundaries Not Granular**
- Single `ErrorBoundary.tsx` wraps large sections
- Error in one component crashes the entire layout
- **Fix**: Add granular error boundaries per feature domain

**Issue C-4: No Empty States**
- List view shows "No records found" text — no illustrative empty state
- **Fix**: Create reusable `EmptyState` component with icon, message, action CTA

## Recommendations

1. **Atomic Design Pattern**: Atoms (Button, Input, Badge) -> Molecules (SearchBar, FilterBar) -> Organisms (DataTable, Form)
2. **Compound Components**: Use Radix UI primitives to build compound components with context sharing
3. **Render Props / Slots**: Allow customization via render props for table columns, form actions
4. **Consistent Props Interface**: All components should follow `cn()` pattern for className extension
5. **Forward Refs**: All interactive components should forward refs for form libraries
