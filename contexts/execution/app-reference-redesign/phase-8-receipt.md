# Phase 8 receipt — Offline/PWA, global edge states, and content truthfulness

Status: complete
Commit: not committed
Scope: Rebuild offline fallback page, harden PWA cache policy, add reconnect/last-safe-view flows, normalize shared edge-state components, and verify truthful offline copy.
Files changed:
- src/lib/pwa/cache-policy.ts (precache exclusions, helpers)
- src/lib/pwa/dirty-form.ts
- src/lib/pwa/last-safe-view.ts
- src/lib/pwa/offline-guidance.ts
- src/lib/pwa/use-pwa-state.ts (reconnect announcement state)
- src/components/app/offline/* (illustration, tips dialog, page content)
- src/components/app/pages/OfflinePage.tsx
- src/components/app/states/* (loading, error, banner, reconnect)
- src/components/app/navigation/use-admin-route.ts (last-safe-view tracking)
- src/components/app/AdminConsole.tsx (reconnect banner, offline aria-live)
- src/components/app/PwaUpdatePrompt.tsx (theme tokens, dirty-form import)
- src/components/app/pages/OverviewPage.tsx, CustomersPage.tsx (shared error state)
- src/pages/offline.astro
- astro.config.mjs (PRECACHE_GLOB_IGNORES)
- tests/pwa-state.test.ts
- tests/offline-page.test.ts
- tests/pwa-integration.test.ts
- tests/pwa-cache-policy.test.ts
- tests/pwa-manifest.test.ts
- tests/e2e/pwa-offline.spec.ts
- tests/e2e/visual/offline.spec.ts
Protected contracts checked:
- Private `/api/*` and authorized requests remain NetworkOnly in Workbox runtime caching
- Large logo sources and reference boards excluded from precache via `PRECACHE_GLOB_IGNORES`
- No offline transaction queueing; purchase/payment still blocked when offline
- PWA update prompt still confirms before reload when dirty forms are present
- Last-safe-view only stores validated read-only admin routes (no purchase/payment forms)
Verification:
- npm test — PASS (162/162)
- npm run typecheck — PASS
- npm run build — PASS
- npm run test:integration — PASS (3 passed, 4 skipped without broader fixtures)
- npx playwright test tests/e2e/pwa-offline.spec.ts — PASS (3/3)
- npx playwright test tests/e2e/visual/offline.spec.ts — PASS (8 viewport/theme captures)
Visual evidence:
- Captured at contexts/execution/app-reference-redesign/evidence/phase-8/
Decisions/deviations:
- Standalone `/offline` page uses mobile dark gradient treatment below `md` and card layout on tablet/desktop per reference regions
- “Go to last available view” only renders when a validated sessionStorage path exists
- Offline tips use Dialog (requires hydration); E2E waits for `data-offline-page-ready`
- Shared PageErrorState/PageLoadingState adopted on overview and customers without reopening feature logic
Next phase/session:
- Begin Phase 9 release-candidate regression, security, and visual sign-off across all pages
