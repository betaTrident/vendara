# Phase 6 receipt — Customers and customer ledger

Status: complete (visual evidence blocked without E2E credentials)
Commit: not committed
Scope: Split CustomerManager into URL-backed Customers directory and Customer Ledger pages; centralize directory/ledger domain helpers; retain inline purchase/payment forms and void behavior until Phase 7.
Files changed:
- src/lib/domain/customers.ts
- src/lib/domain/ledger.ts (view helpers)
- src/components/app/pages/CustomersPage.tsx
- src/components/app/pages/CustomerLedgerPage.tsx
- src/components/app/customers/* (metrics, filters, table, cards, form panel, empty state, delete dialog, avatar, summary)
- src/components/app/ledger/* (metrics, filters, table, cards, chart, summary, transaction forms)
- src/components/app/AdminConsole.tsx
- src/components/app/CustomerManager.tsx (removed)
- src/components/app/CustomerLedgerPanel.tsx (removed)
- tests/customers-domain.test.ts
- tests/customers-page.test.ts
- tests/e2e/customers.spec.ts
- tests/e2e/customer-ledger.spec.ts (expanded)
- tests/e2e/visual/customers.spec.ts
- contexts/execution/app-reference-redesign/phase-6-receipt.md
Protected contracts checked:
- No phone/address/barangay schema or form fields (Phase 0 deferred)
- Ledger integrity: void controls retained; idempotency keys on purchase/payment forms unchanged
- requireOwner on customer GET + ledger GET; UUID validation retained
- Transaction creation remains on ledger page (not extracted to dedicated routes)
- Record purchase/payment routes still placeholders for Phase 7
Verification:
- npx vitest run tests/customers-domain.test.ts tests/customers-page.test.ts tests/ledger.test.ts tests/ledger-void.test.ts tests/customer-ledger-service.test.ts — PASS
- npm test — PASS (139/139)
- npm run typecheck — PASS
- npm run build — PASS
- npm run test:integration — PASS (3 passed, 4 skipped without broader fixtures)
- npx playwright test tests/e2e/customers.spec.ts tests/e2e/customer-ledger.spec.ts tests/e2e/visual/customers.spec.ts — SKIPPED (E2E_OWNER_EMAIL / E2E_OWNER_PASSWORD missing)
Visual evidence:
- Blocked: authenticated light/dark responsive captures require E2E owner credentials
- Harness ready at tests/e2e/visual/customers.spec.ts → contexts/execution/app-reference-redesign/evidence/phase-6/
Decisions/deviations:
- Phone, address, and barangay omitted per Phase 0 (honest omission in form copy)
- Record Purchase/Payment header actions scroll to retained accordion forms on ledger page until Phase 7
- Balance chart is inline SVG with sr-only summary + data table (no chart library)
- Customer delete uses AlertDialog confirmation (deactivate/soft-delete)
- Directory purchase/payment actions deep-link to ledger `#ledger-transactions`
Next phase/session:
- Capture Phase 6 visual evidence once E2E credentials are available
- Begin Phase 7 record purchase/payment extraction with financial RED tests and dedicated transaction pages
