# Phase 9 receipt — Release-candidate regression, security, and visual sign-off

Status: complete (authenticated visual evidence blocked without E2E credentials)
Commit: not committed
Scope: Full verification gates, RC regression contracts, expanded accessibility coverage, login visual sign-off matrix, performance baseline, and skip-link focus fix.
Files changed:
- tests/phase-9-rc-gate.test.ts (new — RC security/regression contracts)
- tests/pwa-state.test.ts (expanded last-safe-view and dirty-form coverage)
- tests/offline-page.test.ts (unsupported-claim detection)
- tests/e2e/accessibility.spec.ts (skip link, 200% zoom, reduced motion)
- tests/e2e/fixtures/owner-auth.ts (shared E2E auth helper)
- tests/e2e/visual/login.spec.ts (login matrix → phase-9 evidence)
- tests/e2e/visual/admin-signoff.spec.ts (overview/ledger/price-history harness)
- contexts/execution/app-reference-redesign/benchmarks/phase-9-baseline.json
- src/pages/index.astro (`tabindex="-1"` on main for skip-link focus)
- src/components/app/layout/AdminShell.tsx
- src/components/app/AdminConsole.tsx
- src/components/app/offline/OfflinePageContent.tsx
Protected contracts checked:
- Private `/api/*` remains NetworkOnly; large assets excluded from precache
- Financial mutations stay server-authoritative via ledger debt/payment APIs
- Open redirects rejected in `resolvePostAuthPath`
- No PII logging in transaction/customer page sources
- Skip link focuses `#main-content` on landing and admin shells
Verification:
- npm run typecheck — PASS
- npm test — PASS (176/176)
- npm run test:integration — PASS (3 passed, 4 skipped without broader fixtures)
- npm run coverage — PASS (statements 91.5%, branches 82.46%, functions 96.21%, lines 91.49%)
- npm run build — PASS
- npm run test:e2e — PASS (53 passed, 57 skipped — auth-required specs need `E2E_OWNER_EMAIL` / `E2E_OWNER_PASSWORD`)
Visual evidence:
| Reference | Evidence location | Status |
|---|---|---|
| landing-page.png | `evidence/phase-4/` | captured (16 PNGs) |
| login-page.png | `evidence/phase-9/` | captured (16 PNGs) |
| dashboard.png | `evidence/phase-9/` | blocked (needs E2E credentials) |
| products.png | `evidence/phase-5/` | blocked (needs E2E credentials) |
| price-history.png | `evidence/phase-9/` | blocked (needs E2E credentials) |
| customers.png | `evidence/phase-6/` | blocked (needs E2E credentials) |
| ledger.png | `evidence/phase-9/` | blocked (needs E2E credentials) |
| record-purchase.png | `evidence/phase-7/` | blocked (needs E2E credentials) |
| record-payment.png | `evidence/phase-7/` | blocked (needs E2E credentials) |
| offline.png | `evidence/phase-8/` | captured (16 PNGs) |
Performance baseline:
- `benchmarks/phase-9-baseline.json` — static output ~5.3 MB; landing preview PNGs dominate weight but are excluded from PWA precache
- AdminConsole JS chunk ~484 KB (uncompressed build artifact)
Security review:
- No Critical/High findings in RC gate scan
- Auth-required API routes return 401 without session
- Ledger PUT/DELETE hard-blocked (405)
- Transaction pages use idempotency keys; no localStorage persistence of financial drafts
Accessibility review:
- Main landmarks on public, admin, and offline pages
- Skip link keyboard activation moves focus to main
- 200% zoom landing has no horizontal page scroll
- Reduced motion honored on offline page
Decisions/deviations:
- Authenticated admin visual matrix requires owner E2E credentials; harnesses are ready and skip cleanly when unset
- Landing marketing preview images remain in build output for ScreenPreviews; precache policy excludes reference boards and logo sources
- Phase 0 deferred fields unchanged (line discounts, payment method/reference, datetime migration)
Next steps:
- Set `E2E_OWNER_EMAIL` and `E2E_OWNER_PASSWORD`, then run:
  `npx playwright test tests/e2e/visual/admin-signoff.spec.ts tests/e2e/visual/products.spec.ts tests/e2e/visual/customers.spec.ts tests/e2e/visual/transactions.spec.ts`
- Human review of phase-4/8/9 PNG evidence against reference boards
- Redesign definition-of-done checklist in APP-REFERENCE-REDESIGN-PLAN.md §19 remains for final human sign-off
