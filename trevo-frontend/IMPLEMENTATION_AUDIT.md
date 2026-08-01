# Implementation Audit — Trevo Frontend

> **Date**: 2026-08-01
> **Scope**: Full architecture, performance, UI, and proxy/middleware review of `trevo-frontend/` against `implementation.md`, `implementation1/*.md`, `PLAN.md`, `PLAN-TODO.md`, `TODO.md`, and the `frappe/` reference implementation.
> **Method**: Ground-truth verification against actual code (file:line citations), not the existing docs — several existing docs are stale relative to recent commits. This file is the source of truth going forward; update it as fixes land.
> **Status of this pass**: Read-only analysis complete. No code changes made yet except two safe local-dev actions (killed a runaway crashed `next dev` process, deleted corrupted `.next` cache) — see [0].

---

## 0. Immediate incident (handled during this audit)

While starting the audit, the user's local `next dev` (Turbopack) crashed with a `turbo-tasks-backend` panic ("Every task must have a task type"), and the underlying `next-server` process was left running in a busy-loop at 500%+ CPU. This was caused by Turbopack's persistent cache (`.next/cache`) getting corrupted after the in-progress `middleware.ts` → `proxy.ts` rename happened while the dev server had the old file's cache warm.

**Action taken**: killed the runaway process (PID 11275/11274), deleted `.next` entirely. Not yet restarted — see P0-2 below for why this matters for the performance story, and restart it once the `.env.local` fix (P0-1) lands so the first test run isn't against a dead backend.

---

## 1. Progress Status — corrections to existing docs

The existing tracking docs (`TODO.md`, `PLAN-TODO.md`, `implementation.md`) claim **~55–65% porting completion**. That headline is roughly right, but several individual item statuses are wrong in both directions:

| Item | Docs say | Actual (verified) | Correction |
|---|---|---|---|
| P0-7 Form Builder | TODO.md: all unchecked ("not started"); commit log: "add P0-7 Form Builder component" | `components/features/form-builder/{FormBuilder,FieldPalette,FieldProperties,FormPreview}.tsx` **exist** but are imported **nowhere** in `app/` — confirmed via repo-wide grep for `"form-builder"`/`"FormBuilder"` outside the component's own barrel. `app/(desk)/desk/forms/page.tsx` is a plain DocType picker, not the builder. | **Built, fully orphaned.** Not "not started," but not usable either — needs a route + entry point. |
| P1-4 Workflow Actions | TODO.md/PLAN-TODO.md: not started | `components/features/workflow/WorkflowActions.tsx` + `app/api/workflow/action/route.ts` exist **and are wired** into `app/(desk)/desk/doctype/[doctype]/[name]/page.tsx:18,250` (a "Workflow" tab). | **Docs stale — this is actually done.** |
| P1-10 Linked With | TODO.md/PLAN-TODO.md: not started | `components/features/linked-with/LinkedWith.tsx` wired into the same detail page (`page.tsx:19,253`). | **Docs stale — actually done.** |
| loading.tsx/error.tsx coverage | Commit: "add loading.tsx and error.tsx for key desk routes" | Only 5 of ~13 desk route segments have both: `desk/`, `doctype/[doctype]/`, `doctype/[doctype]/[name]/`, `reports/`, `workspace/[name]/`. `doctype/[doctype]/[name]/edit/` has `loading.tsx` only. **Missing entirely**: `calendar/`, `doctype/[doctype]/new/`, `doctype/[doctype]/view/`, `forms/`, `list/`, `settings/`, `tasks/`, and `(auth)/login/`. | Partial, as claimed — but "key routes" undersells that ~8 segments still have zero boundary, meaning any error there is an unstyled Next.js default crash page. |
| AuthProvider ↔ auth.store sync | Docs: known issue, listed as "not started" | Still real. `lib/frappe/auth.tsx` (`AuthProvider`/`useAuth`, React Context) and `lib/stores/auth.store.ts` (`useAuthStore`, Zustand) are two independent, unsynchronized user/session sources. `auth.store` is **not dead** — `lib/hooks/useBootInfo.ts:4,10` writes to it, consumed by `app/(desk)/desk/page.tsx:16,36` and `settings/page.tsx:3`. | **Confirmed still broken as described.** |
| Kanban realtime | Docs: "Realtime updates via polling" | Confirmed replaced — `lib/services/realtime.ts` uses `socket.io-client`, not polling. | Docs stale, actual state is better than documented. |

**Net effect**: don't trust the checkbox state in `TODO.md`/`PLAN-TODO.md` at face value for anything touched by commits after 2026-07-25. Treat this table as the current baseline.

### Feature completion (unchanged findings, still accurate)
The broader P0–P2 feature matrix in `implementation1/34-frappe-frontend-porting-gap-analysis.md` and `TODO.md` — Kanban, Gantt, Tree, Bulk Ops, Advanced Filters, Import/Export, Dashboard shell, Reports runner, Timeline, Share, Realtime — matches what's on disk. Genuinely **not started**: Print Format Builder, Web Forms, File Browser, Map/Image/Inbox views, Translation Manager, Workflow Builder, System Console. Not re-litigated here; see that doc for the full list.

---

## 2. Architecture Review

### 2a. Duplicate auth checks on every desk page load (real bug, not just style)
- `app/(desk)/desk/layout.tsx:10-13` is a Server Component that calls `fetch("http://localhost:3000/api/auth/whoami")` — **the server calling itself over the network** to check auth, instead of invoking the whoami logic directly. This is a Next.js anti-pattern: it adds a full HTTP round-trip (DNS/connect/TLS-less-but-still-socket + full middleware/route-handler stack) before any HTML is sent.
- `lib/frappe/auth.tsx:25-30` (`AuthProvider`, mounted at the root via `app/providers.tsx:13`, above the desk layout) independently re-fetches `clientWhoAmI()` + `clientBoot()` on mount — the same whoami check, again, client-side.
- `lib/frappe/boot.ts:22,32,58` (`assembleBootInfo`) does this 3 more times over: **sequential** `await`s for `get_logged_user` → `resource/User/:email` → `apps.get_apps`. Steps 2 and 3 don't depend on each other (only on the email from step 1) and can run in `Promise.all`.
- `useBootInfo()` (react-query) fires **yet another** independent `/api/boot` call on top of `AuthProvider`'s raw (uncached) one, because `AuthProvider` doesn't go through the react-query cache.

**Net**: a cold desk load does ~2 redundant `/api/boot` calls (6 backend round-trips between them) plus 2 redundant whoami calls, before the shell even mounts. This is both an architecture smell and the single biggest perf lever in the code (see §3).

### 2b. Two parallel state systems for the same data
`AuthProvider` (Context) and `auth.store.ts` (Zustand) both hold user/session state, unsynchronized. `desk.store.ts`, `ui.store.ts` are fine (single-owner). Recommend: pick one (Context is already the UI source of truth per `CLAUDE.md`) and make `auth.store` either deleted or purely a write-through cache populated *by* `AuthProvider`, not a second fetch path.

### 2c. Proxy vs Middleware — already correctly migrated, just needs finishing (see §5)

### 2d. API route layer
Spot-checked `app/api/frappe/[...path]/route.ts`, `app/api/boot/route.ts`, `app/api/doctype/[doctype]/{save,docinfo}/route.ts`: no N+1 loop patterns, each is a single proxied fetch. The only real inefficiency is the sequential chain inside `boot.ts` described above. No action needed elsewhere in the API layer.

### 2e. No structural over-engineering found
Contrary to what's often true in ported codebases, there's no evidence of redundant abstraction layers, unnecessary wrapper components, or copied-but-inapplicable Frappe patterns (e.g., no Vuex-style store ported verbatim, no dead Frappe asset-pipeline references). The BFF/RSC split, React Query + Zustand split, and route structure are sound. Architecture score should move up from the docs' current 6/10 once §2a/2b are fixed — this is a state-management/data-fetching problem, not a structural one.

---

## 3. Performance Investigation — root cause of "5–6 minutes"

Ranked by estimated impact:

### P0 — `.env.local` points at a dead port (confirmed, highest impact)
`NEXT_PUBLIC_FRAPPE_BASE_URL=http://localhost:8080` in `.env.local`. **Nothing listens on :8080** (`lsof -iTCP:8080 -sTCP:LISTEN` → empty). The real Frappe backend is on `:8000` (`trevo_bench-backend-1` container, confirmed via `lsof` and a successful `curl`). `CLAUDE.md` documents `:8000` as the originally correct value — this is a regression, likely from editing `.env.local` while working on one of the *other* docker stacks on this machine (`becona-app`, `dndts-app`, or the stale/unhealthy `trevo_ecommerce-backend` + `trevo-mariadb` containers that are also running).

**Why this alone can explain minutes, not seconds**: every Frappe call from the frontend fails at connection-refused (instant per attempt), but:
- `app/providers.tsx:9` creates `QueryClient` with **zero `defaultOptions`** → global defaults apply: `retry: 3` with exponential backoff (~1s+2s+4s ≈ 7s of *waiting* between attempts, even though each attempt itself fails instantly).
- Several un-overridden queries (`useList.ts` list/count queries, used 4x on the dashboard alone) each pay that ~7s tax independently.
- `lib/frappe/client.ts:33-42`'s 401/403 interceptor does a **hard `window.location.href = "/login"`** on failure, which triggers a full page reload and a fresh Turbopack dev-compile of the target route on every bounce — compounding with the corrupted-cache crash from §0 that was *also* happening during this session.
- Stack these across the duplicated boot/whoami calls in §2a and repeated navigation attempts, and multi-minute totals are entirely plausible without needing any single dramatic bug.

**Fix**: change `.env.local` to `http://localhost:8000`. This is a one-line change; recommend doing it immediately (P0) rather than waiting for the rest of the plan, since nothing else in this audit can be correctly load-tested against a backend that isn't reachable.

### P0 — Backend itself is slow even on the correct port
Direct `curl` to `:8000` for a trivial whitelisted method (`frappe.auth.get_logged_user`) took **1.18s TTFB**. That's high for a single simple call. Contributing factors visible in `docker ps`: 9 containers running simultaneously on this machine, including a stale/duplicate Frappe stack (`trevo_ecommerce-backend`, `trevo-mariadb` — both marked `(unhealthy)`, not the ones actually serving traffic) sitting idle and consuming resources alongside the live `trevo_bench-*` stack. Recommend stopping the unhealthy/unused containers (`trevo_ecommerce-backend`, `trevo-mariadb`, and its redis if unused) to free up CPU/memory contention. This is infra hygiene, not a code fix — flagging for the user's confirmation before touching Docker state.

### P1 — Redundant boot/whoami calls (§2a)
Collapse to one whoami check and one boot assembly per navigation. Concretely: make `desk/layout.tsx` call the whoami logic directly (no self-fetch), parallelize `boot.ts`'s steps 2–3 with `Promise.all`, and route `AuthProvider` through the same react-query-cached `useBootInfo` call instead of a second raw fetch.

### P1 — Missing QueryClient defaults
Add `defaultOptions: { queries: { staleTime: 30_000, retry: 1 } }` (or similar) to `app/providers.tsx:9`. Zero-config react-query defaults (staleTime 0, retry 3, refetchOnWindowFocus true) are fine for a healthy backend but actively harmful when anything is flaky, and unnecessary refetch-on-focus is pure waste for desk data that doesn't change every second.

### Ruled out (verified, not contributors)
- **Polling**: only `useNotifications` (60s interval, cheap) and Kanban is confirmed socket.io-based, not polling.
- **useEffect loops**: none found with bad dependency arrays in `lib/hooks/**` or `components/features/**`.
- **Bundle size**: 47 total deps, heavy libs (`@dnd-kit`, `frappe-gantt`, `recharts`, `xlsx`) are correctly scoped to their feature routes, never imported in the shell/layout chain. Also irrelevant in dev mode specifically, since dev doesn't minify/bundle the way prod does.
- **Doctype browser N+1**: single RSC fetch, no per-row calls.
- **Proxy overhead**: `proxy.ts` is fully synchronous (cookie read + string match), no `fetch`/`await` inside — negligible per-request cost even though its matcher covers every route.

---

## 4. Styling & UI Audit

The user's "feels poor and inconsistent" read is correct and traceable to specific, fixable causes — not a vague aesthetic judgment.

### P0 — The design-token system is broken, not just thin
`app/globals.css` (69 lines) defines only `--background`/`--foreground` plus an unused raw zinc hex scale — no `--card`, `--primary`, `--border`, `--muted`, `--destructive`, `--ring`, radius, or spacing tokens. Yet `components/shadcn/card.tsx:10` renders `bg-card text-card-foreground`, a class referencing tokens that **don't exist anywhere in the CSS** — every `<Card>` in the app currently paints with undefined background/foreground and silently falls back to browser defaults. This is a rendering bug, not a taste issue, and is likely a large part of why the UI "feels" off even on pages that otherwise look fine.

### P0 — Two dark-mode mechanisms, one of them inert
Theme toggling sets `data-theme="dark"|"light"` on `<html>` (`lib/stores/ui.store.ts:25-32`), and `globals.css` only remaps 2 CSS vars under `[data-theme="dark"]`. Separately, **68 files** use Tailwind's `dark:` variant (all 23 files in `components/features/**` among them). Tailwind v4's `dark:` defaults to `@media (prefers-color-scheme: dark)` unless a `@custom-variant dark (&:where([data-theme=dark] *));` is declared — which it isn't here. **Result: the in-app theme toggle does not control dark mode for the vast majority of the UI; only the OS-level preference does.** A user who manually switches themes sees only 2 properties change while everything else stays locked to their OS setting.

### P1 — Hardcoded colors bypass tokens everywhere
Raw `gray-`/`zinc-`/`slate-`/`white`/`black` Tailwind utilities appear ~1,500+ times across `components/features/**`, `app/(desk)/**`, and even inside the shadcn primitives themselves (129 hits in `components/shadcn/**`). Every color decision is repeated file-by-file. Concentration: `data-import` (79), `kanban` (76), `list-filters` (57), `bulk-operations` (56), `form-builder` (56).

### P1 — Real shadcn primitives exist but are inconsistently used
18 real components live in `components/shadcn/` — this isn't the "1 hand-written card.tsx" the old docs describe. But 29 files hand-roll card-like divs (`rounded-xl border ... bg-white ... dark:bg-zinc-800`) instead of importing `Card` (only 18 files do). Badges/pills are similarly reinvented ad hoc in `list-filters/AdvancedFilters.tsx:232` and `doctype/[doctype]/page.tsx:243` instead of using the real `Badge` (imported in only 6 files).

### P1 — Built components sitting unused
`components/EmptyState.tsx` is fully built and documented but has **zero consumers** — every empty state in the app is ad hoc plain text ("No tasks found.", "No records found.", "No results found.") instead of using it. `components/Skeleton.tsx` is used in 7 places but 3+ pages (`list/`, `forms/`, `reports/loading.tsx`) hand-roll their own separate `animate-pulse` markup instead.

### P2 — Spacing inconsistency
Page wrappers alternate `space-y-4` vs `space-y-6` with no rule; card padding varies `p-4`/`p-6`/`p-12` for conceptually equivalent containers. Headers are actually consistent (`text-2xl font-semibold ...` repeated correctly across 5 pages) — this part doesn't need work.

### P2 — Near-zero responsive coverage outside the shell
`TrevoShell.tsx` has only 3 responsive-prefixed classes; the sidebar is JS-toggled, not breakpoint-driven, and fixed at `w-64` always. 21 of 23 `components/features/**` files have **zero** responsive classes — kanban, gantt, data-import, bulk-operations, sharing, tree, workflow, timeline all render identically regardless of viewport.

### P2 — Accessibility is close to absent
0 `aria-*` attributes and 1 `alt=` across all of `components/features/**`. Positively: no `<div onClick>` custom-clickable anti-patterns (all 86 click handlers are on real interactive elements), so this is a labeling gap, not a keyboard-trap problem — cheaper to fix than it sounds.

### P3 — Error boundary inconsistency
4 of 5 `error.tsx` files share one visual pattern; the top-level `app/(desk)/desk/error.tsx` is a different, unrelated implementation (raw `<button>` instead of shadcn `Button`, different layout). Low priority but easy to align.

---

## 5. Proxy vs Middleware

**Finding: the migration in progress is correct and should simply be finished, not redone.**

- `proxy.ts` (root) is a real, native Next.js 16.2.9 convention — `PROXY_FILENAME = 'proxy'` is defined in `node_modules/next/dist/lib/constants.js:289`, and the build pipeline treats it as the direct successor to `middleware.ts` (throws if both exist, warns if only the old name is used). This is not a homebrew rename.
- The deleted `middleware.ts` and the new `proxy.ts` have **identical logic** — same public-path allowlist, same sid-cookie check, same matcher. Nothing else in the repo references `middleware.ts` by name (the only "middleware" hits anywhere are unrelated Zustand `persist` middleware imports in `FormStore.ts`/`ui.store.ts`).
- `proxy.ts` is fully synchronous (no `fetch`/`await`), so there's no overhead concern from its matcher covering every route.

**Justification for keeping this migration**: the task's stated requirement — "use Proxy only, remove middleware" — is already satisfied by this uncommitted change. There is no remaining middleware-based responsibility to migrate; the one file that existed has already been ported 1:1.

**What's left**: this is currently an *uncommitted, unverified* change (`git status`: `D middleware.ts`, `?? proxy.ts`). Recommend: (1) start the dev server and manually confirm the auth-guard behavior still works (login redirect, 401 on protected API routes) now that `proxy.ts` is the active file, since it's never been runtime-tested; (2) commit once confirmed. No code changes needed beyond verification.

---

## 6. Prioritized Action Plan

### Priority 0 — Critical blockers
1. Fix `.env.local`: `NEXT_PUBLIC_FRAPPE_BASE_URL` → `http://localhost:8000`. *(1-line change, unblocks everything else from being testable.)*
2. Restart dev server clean (cache already cleared in §0) and confirm the app actually loads against the real backend.
3. Runtime-verify the `proxy.ts` migration (login redirect + 401 behavior), then it's ready to commit.
4. Fix the broken `Card` token reference (`bg-card`/`text-card-foreground` pointing at undefined CSS vars) — either add the missing tokens to `globals.css` or point `card.tsx` at tokens that exist. This affects every page using `Card`.

### Priority 1 — Performance
5. Parallelize `boot.ts` steps 2–3 with `Promise.all`.
6. Remove the self-fetch whoami in `desk/layout.tsx`; call the whoami logic directly.
7. Route `AuthProvider`'s boot fetch through the same cached `useBootInfo` call (eliminate the duplicate `/api/boot` hit).
8. Add sane `QueryClient` defaults (`staleTime`, `retry: 1`) in `app/providers.tsx`.
9. (User to confirm) stop the stale/unhealthy Docker containers competing for resources.

### Priority 2 — Missing/incorrect functionality
10. Wire `FormBuilder` into an actual route (it's fully built but orphaned).
11. Fill in missing `loading.tsx`/`error.tsx` for the 8 route segments that have neither.
12. Resolve `AuthProvider` vs `auth.store` duplication — pick one source of truth.
13. Correct `TODO.md`/`PLAN-TODO.md` checkbox states per §1's table.

### Priority 3 — UI/UX
14. Fix the dark-mode split: either add `@custom-variant dark (&:where([data-theme=dark] *));` so Tailwind's `dark:` respects the in-app toggle, or migrate all 68 `dark:`-using files to the CSS-var approach. (Recommend the `@custom-variant` fix — 1 line, makes all 68 files correct instantly.)
15. Wire the built-but-unused `EmptyState` and `Skeleton` components into the pages currently hand-rolling their own.
16. Consolidate ad hoc card/badge divs onto the real `Card`/`Badge` components (29 and 2 call sites respectively).
17. Add basic `aria-label`s to icon-only buttons and status pills.
18. Align the outlier `desk/error.tsx` with the other 4 error boundaries' shared pattern.

### Priority 4 — Cleanup/refactoring
19. Extract repeated hardcoded color utilities into design tokens where a genuine reusable pattern exists (not a wholesale rewrite — target the highest-concentration files first: `data-import`, `kanban`, `list-filters`).
20. Normalize page-wrapper spacing (`space-y-4` vs `space-y-6`) and card padding (`p-4`/`p-6`/`p-12`) once tokens exist to standardize against.
21. Add responsive breakpoints to `TrevoShell` sidebar and the 21 non-responsive feature components, starting with the most-used views (list, kanban, gantt).

---

## Change Log
- 2026-08-01: Initial audit created. Read-only analysis complete (architecture, performance, UI, proxy). Fixed local dev incident (killed runaway crashed process, cleared corrupted `.next` cache). No application code changed yet — awaiting go-ahead on the P0/P1 items above.
