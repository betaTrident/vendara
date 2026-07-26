# Phase 7 receipt — Record credit purchase and record payment

Status: complete (visual evidence blocked without E2E credentials)
Commit: not committed
Scope: Extract ledger purchase/payment accordions into dedicated URL-backed transaction pages with server-validated previews, idempotent submission, offline guards, and overpayment prevention.
Files changed:
- src/lib/domain/transactions.ts
- src/components/app/transactions/* (CustomerPicker, ProductLineEditor, PurchaseSummaryPanel, PaymentSummaryPanel, RecentPaymentsPanel)
- src/components/app/pages/RecordPurchasePage.tsx
- src/components/app/pages/RecordPaymentPage.tsx
- src/components/app/AdminConsole.tsx
- src/components/app/pages/CustomersPage.tsx
- src/components/app/pages/CustomerLedgerPage.tsx
- src/components/app/ledger/LedgerTransactionForms.tsx (removed)
- tests/transactions-domain.test.ts
- tests/transactions-page.test.ts
- tests/customers-page.test.ts (updated contracts)
- tests/e2e/transactions.spec.ts
- tests/e2e/visual/transactions.spec.ts
Protected contracts checked:
- Ledger debt/payment APIs unchanged; idempotency keys retained on mutations
- Server-authoritative totals via existing `createCustomerLedgerService` + `buildDebtEntrySnapshot`
- Overpayment rejected client-side and via `PaymentExceedsBalanceError` server path
- Offline submission disabled (`isOnline` + AdminShell pointer-events guard)
- Phase 0 deferred fields omitted: line discounts, payment method/reference schema
Verification:
- npx vitest run tests/transactions-domain.test.ts tests/transactions-page.test.ts tests/customers-page.test.ts tests/ledger.test.ts tests/ledger-idempotency.test.ts tests/customer-ledger-service.test.ts — PASS
- npm test — PASS (150/150)
- npm run typecheck — PASS
- npm run build — PASS
- npm run test:integration — PASS (3 passed, 4 skipped without broader fixtures)
- npx playwright test tests/e2e/transactions.spec.ts tests/e2e/visual/transactions.spec.ts — SKIPPED (E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD missing)
Visual evidence:
- Blocked: authenticated light/dark responsive captures require E2E owner credentials
- Harness ready at tests/e2e/visual/transactions.spec.ts → contexts/execution/app-reference-redesign/evidence/phase-7/
Decisions/deviations:
- Line discounts and payment method/reference omitted per Phase 0 contract matrix (honest copy in UI)
- Payment date remains date-only (datetime migration still deferred)
- Successful submit navigates to customer ledger for balance confirmation
- Ledger page no longer embeds inline transaction accordions
Next phase/session:
- Capture Phase 7 visual evidence once E2E credentials are available
- Begin Phase 8 offline/PWA and global edge states
