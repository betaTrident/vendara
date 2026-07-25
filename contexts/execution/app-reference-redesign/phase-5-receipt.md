# Phase 5 receipt — Products and price history

Status: complete (visual evidence blocked without E2E credentials)
Commit: not committed
Scope: Split ProductManager into URL-backed Products and Product Price History pages; centralize markup/catalog/history helpers; extend history API with range/pagination; add product GET; keep Phase 0 field contracts (no SKU/barcode/category/media/stock).
Files changed:
- src/lib/domain/pricing.ts
- src/lib/server/products-repository.ts
- src/pages/api/products/[id].ts (GET)
- src/pages/api/products/[id]/history.ts
- src/components/app/AdminConsole.tsx
- src/components/app/pages/ProductsPage.tsx
- src/components/app/pages/ProductPriceHistoryPage.tsx
- src/components/app/products/* (metrics, filters, table, cards, form panel, empty state, markup badge, delete dialog, media placeholder, trend chart)
- src/components/app/ProductManager.tsx (removed)
- tests/pricing.test.ts
- tests/products-page.test.ts
- tests/product-price-history.test.ts
- tests/product-history-api.test.ts
- tests/e2e/products.spec.ts
- tests/e2e/visual/products.spec.ts
- contexts/execution/app-reference-redesign/phase-5-receipt.md
Protected contracts checked:
- No stock/inventory quantity
- No SKU/barcode/category/media schema or form fields (media placeholder only)
- No invented changed-by / change-note fields
- requireOwner on product GET + history GET; UUID validation retained
- Markup/money math remains in domain pricing helpers
- History API returns `{ items, total }` with validated `range`/`limit`/`offset`
Verification:
- npx vitest run tests/pricing.test.ts tests/products-page.test.ts tests/product-price-history.test.ts tests/product-history-api.test.ts — PASS
- npm test — PASS (129/129)
- npm run typecheck — PASS
- npm run build — PASS
- npm run test:integration — PASS (3 passed, 4 skipped without broader fixtures)
- npx playwright test tests/e2e/products.spec.ts tests/e2e/visual/products.spec.ts — SKIPPED (E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD missing)
Visual evidence:
- Blocked: authenticated light/dark responsive captures require E2E owner credentials
- Harness ready at tests/e2e/visual/products.spec.ts → contexts/execution/app-reference-redesign/evidence/phase-5/
Decisions/deviations:
- SKU, barcode, category, product photos, actor names, and change notes omitted per Phase 0 (deferred migration / unavailable)
- Product photos use semantic Package placeholder mark only
- Trend chart is inline SVG (no chart library dependency) with sr-only text summary + data table/timeline
- Delete uses AlertDialog confirmation (deactivate/soft-delete) instead of immediate DELETE
- History response shape changed from bare array to `{ items, total }` (only new Products/History UI consumes it)
- Inventory wording removed from products UI (catalog/products language)
Next phase/session:
- Capture Phase 5 visual evidence once E2E credentials are available
- Begin Phase 6 Customers + customer ledger with Phase 0 customer-field contracts
