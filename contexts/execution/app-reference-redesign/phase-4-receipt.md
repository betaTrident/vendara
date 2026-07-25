# Phase 4 receipt — Public landing page

Status: complete
Commit: not committed
Scope: Rebuild `/` into semantic marketing components with reference hero hierarchy, theme-aware brand/SEO, truthful PWA copy, and working CTAs — no private data path.
Files changed:
- src/pages/index.astro
- src/layouts/BaseLayout.astro (optional SEO/canonical/JSON-LD props)
- src/styles/landing.css
- src/lib/marketing/landing-content.ts
- src/components/marketing/* (LandingHeader/Hero/FeatureGrid/Workflow/ScreenPreviews/TrustSection/PwaSection/FaqSection/LandingCta/LandingFooter/AccessModal/LandingThemeControls/landing-interactive)
- tests/landing-page.test.ts
- tests/e2e/landing-page.spec.ts
- tests/e2e/visual/landing-page.spec.ts
- contexts/execution/app-reference-redesign/evidence/phase-4/*
- contexts/execution/app-reference-redesign/phase-4-receipt.md
Protected contracts checked: no `/api/(products|customers|ledger|transactions|summary)` on public render; `/admin` remains sign-in CTA; offline FAQ requires live connection for writes; no auto-sync / offline-transaction claims
Verification:
- npx vitest run tests/landing-page.test.ts — PASS
- npm run typecheck — PASS
- npm test — PASS (97/97)
- npm run build — PASS
- npx playwright test tests/e2e/landing-page.spec.ts --project=chromium — PASS (6/6)
- npx playwright test tests/e2e/visual/landing-page.spec.ts (mobile/tablet/laptop/desktop × light/dark) — PASS
Visual evidence:
- contexts/execution/app-reference-redesign/evidence/phase-4/*-above-fold.png
- contexts/execution/app-reference-redesign/evidence/phase-4/*-full.png
Decisions/deviations:
- Request Access remains an owner-approval guidance dialog (no public signup backend — not approved)
- Hero/CTA labels prefer truthful "Admin sign in" / "View screens" over reference "Open Admin Demo" / "Get Started" (no demo account)
- Feature #06 keeps installable/connection-aware PWA copy; reference "auto sync" claim excluded by Phase 0 contract
- Preview media uses existing dashboard/customers/ledger PNGs as marketing demos only (not live store data)
- Concurrent Phase 2–3 files present in dirty tree were left untouched by this phase
Next phase/session:
- Phase 5 requires completed Phases 2–3 gates + Phase 0 product-field decisions (metadata migrations still deferred). Read phase-2/3 receipts when available, then begin ProductManager split with RED product/history tests only.
