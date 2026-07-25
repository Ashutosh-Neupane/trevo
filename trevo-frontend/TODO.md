# Fix TypeScript Errors in FormRenderer.tsx

## Plan
- [x] 1. Add `useEffect` to React import
- [x] 2. Rename `document` prop to `doc` to avoid shadowing global `Document`, use `window.document` for DOM API
- [x] 3. Move `useEffect` block after `useCallback` definitions to fix "used before declaration" errors
- [ ] 4. Verify with `npx tsc --noEmit`

