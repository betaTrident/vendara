# Phase 3 receipt — Admin sign-in and overview

Status: complete
Commit: not committed
Scope: Redesign AdminLogin against the login reference (honest controls only) and rebuild OverviewPage with derived summary aggregates, aging snapshot, and real quick-action routes.
Files changed:
- src/components/app/AdminLogin.tsx
- src/components/app/pages/OverviewPage.tsx
- src/components/app/AdminConsole.tsx (session check timeout)
- src/lib/domain/overview.ts
- src/lib/server/summary-repository.ts
- src/lib/types.ts (OwnerSummary aggregates)
- playwright.config.ts (dev server for local E2E; vercel preview unsupported)
- tests/overview-domain.test.ts
- tests/admin-login.test.ts
- tests/overview-page.test.ts
- tests/summary-api.test.ts
- tests/e2e/login-visual.spec.ts
- contexts/execution/app-reference-redesign/phase-3-receipt.md
Protected contracts checked: owner-only /api/summary; private no-store cache headers unchanged; no remember-me/forgot-password dead links; no owner summary fetch before auth; quick actions only hit internal /admin routes
Verification:
- npx vitest run tests/overview-domain.test.ts tests/admin-login.test.ts tests/overview-page.test.ts tests/summary-api.test.ts — PASS
- npm test — PASS (108+)
- npm run typecheck — PASS
- npm run build — PASS
- PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npx playwright test tests/e2e/login-visual.spec.ts --project=chromium — PASS
Visual evidence:
- test-results/phase-3-login-light-1440.png
- test-results/phase-3-login-dark-1440.png
- test-results/phase-3-login-light-360.png
- test-results/phase-3-login-dark-360.png
- Overview authenticated screenshots deferred (requires E2E owner credentials); layout covered by unit/source contracts + shell nav
Decisions/deviations:
- Omitted Remember me / Forgot password (unsupported)
- Greeting uses Manila time-of-day Filipino phrase without mock owner names
- Aging buckets derived from oldest non-voided debt date while balance > 0
- Recent activity merges ledger, price history, and customer creates server-side (no client N+1)
Next phase/session:
- Read phase-2 + phase-3 receipts; begin Phase 4 public landing extraction against landing-page.png while preserving dirty-tree landing work.
