# Vendara Admin-Only Serverless PWA Plan

**Status:** Implementation-ready product and engineering plan  
**Target:** A simple, fast, secure, reliable store-owner application  
**Architecture:** Astro + React + Vercel Functions + Neon PostgreSQL/Auth + installable PWA  
**Primary actor:** One store owner  
**Target executor:** Cursor Composer 2.5  
**Execution method:** One phase per Cursor task, tests first, exact-path file allow list  
**Last updated:** July 24, 2026  
**Phase 6:** CI workflow (`.github/workflows/ci.yml`), runbooks under `contexts/runbooks/`, Biome format check (`npm run lint`) — Vercel/Neon platform controls documented externally per runbooks.

---

## 1. Executive Summary

Vendara will be simplified into a single-purpose application for one sari-sari store owner.

The owner will use one installable web application to:

1. Manage products and prices.
2. Manage customers.
3. Record customer credit purchases.
4. Record customer payments.
5. Review balances and ledger history.

The application will remain serverless:

- Astro will render the application and API routes.
- React will provide the interactive admin interface.
- Vercel will host the application and serverless functions.
- Neon will provide managed PostgreSQL and authentication.
- A PWA manifest and service worker will make Vendara installable on phones, tablets, and desktops.

The PWA will be **online-first**. It will cache only the application shell, icons, fonts, and an offline screen. It will not cache private products, cost prices, customers, ledger entries, authentication responses, or API responses. It will not accept or queue offline writes.

This boundary is intentional. It provides the convenience and speed of an installed application without introducing local databases, synchronization, conflict resolution, duplicate transactions, or private-data leakage.

The result should feel like a small native store tool:

- Open quickly.
- Sign in once.
- Find the needed product or customer immediately.
- Complete common actions in a few taps.
- Clearly communicate loading, success, failure, offline, and update states.
- Never silently lose or duplicate financial records.

---

## 2. Capability

### 2.1 Capability statement

A verified and explicitly approved store owner can install Vendara on a personal device and securely manage one store's products, customer credit purchases, payments, and balances through a fast, responsive, serverless web application.

### 2.2 User-visible promise

Vendara promises the owner:

- One private store workspace.
- One simple sign-in.
- One product list.
- One customer list.
- One trustworthy ledger per customer.
- Clear current balances.
- An installable mobile-friendly application.
- No public exposure of store or customer data.
- No ambiguous transaction status.

### 2.3 Outcome

The owner can replace a paper price list and handwritten utang ledger with a single reliable application without learning a complex inventory, accounting, or point-of-sale system.

---

## 3. Fixed Product Constraints

These constraints define the simplified product and should not be expanded during implementation without an explicit product decision.

### 3.1 Fixed scope

- One store.
- One owner role.
- One production deployment.
- One source of truth: Neon PostgreSQL.
- One authenticated application surface.
- Two primary work areas:
  - Products and prices.
  - Customers and credit ledger.
- Philippine peso as the initial currency.
- One configured business timezone, recommended `Asia/Manila`.
- Online connection required to read or modify business data.

### 3.2 Business invariants

- Every business-data API requires an authenticated, verified, active owner.
- Product cost price is always private.
- Customer information and ledger information are always private.
- A debt entry has one or more valid product line items.
- A payment entry has a positive payment amount.
- A ledger entry's type cannot change after creation.
- A debt header and its items are written in one database transaction.
- A product update and its price-history entry are written in one database transaction.
- A successful financial write is committed exactly once.
- A failed financial write leaves no partial data.
- Historical debt items retain the product name and prices used when the debt was recorded.
- Customer balance is derived from committed ledger entries.
- Inactive products and customers are hidden from normal lists but historical records remain intact.
- The client never becomes the authority for prices, balances, authentication, or authorization.

### 3.3 Trust boundaries

- The browser and installed PWA are untrusted clients.
- All submitted data is validated on the server.
- Every protected route performs authorization on the server.
- All financial calculations are repeated or verified on the server.
- PostgreSQL constraints provide the final data-integrity boundary.
- PWA caches contain no private business records.

---

## 4. Explicit Non-Goals

The following are not part of the simplified Vendara release:

- Public product catalog.
- Public price-search API.
- Customer accounts or customer login.
- Multiple stores or multi-tenancy.
- Multiple roles, granular permissions, or staff administration.
- Full point-of-sale or cash-sale tracking.
- Inventory quantity and stock movement.
- Purchasing and suppliers.
- Barcode scanning.
- Accounting, tax, payroll, or expense management.
- Advanced analytics.
- Custom report builder.
- CSV import/export.
- Printable statements in the initial release.
- Push notifications.
- Background sync.
- Offline customer, product, or ledger data.
- Offline writes.
- Conflict resolution between devices.
- Native iOS or Android applications.
- App-store packaging.
- WebSockets or real-time subscriptions.
- Redis, queues, containers, Kubernetes, or additional application servers.
- A general-purpose settings area.
- A design-system rewrite.

These features may be reconsidered later, but they must not complicate the initial admin-only PWA.

---

## 5. Simplification Principles

### 5.1 Keep the current stack

Do not rewrite Vendara in another framework.

Keep:

- Astro.
- React.
- TypeScript.
- Tailwind CSS.
- Existing accessible UI primitives.
- Vercel.
- Neon PostgreSQL.
- Neon Auth.
- Zod.
- Vitest.

### 5.2 Prefer managed platform capabilities

Use Vercel and Neon capabilities before adding another service.

Examples:

- Vercel deployments and rollback instead of containers.
- Vercel platform protection/rate controls instead of a Redis rate-limit service.
- Neon backups and recovery instead of a custom backup service.
- Neon Auth instead of a custom password system.

### 5.3 Prefer explicit behavior

The interface should never make the owner guess:

- Whether they are online.
- Whether a save is in progress.
- Whether a save succeeded.
- Whether a save failed.
- Whether the installed application has an update.
- Whether a customer has an outstanding balance.

### 5.4 Do not optimize hypothetical scale

Optimize for one store owner and a modest product/customer dataset.

Do not add:

- Distributed caches.
- Event buses.
- Microservices.
- CQRS.
- Read replicas in application code.
- Premature pagination abstractions.
- Background workers.

PostgreSQL indexes, efficient queries, and small API payloads are sufficient for the target.

### 5.5 Protect correctness before convenience

Financial correctness has priority over optimistic UI behavior.

For ledger writes:

- Disable repeat submission while saving.
- Use an idempotency key.
- Wait for the server result.
- Refresh the authoritative customer and ledger state after success.
- Do not show a completed transaction before the server commits it.

---

## 6. Owner Experience and Information Architecture

### 6.1 Routes

Keep the route surface minimal:

| Route | Purpose | Access |
|---|---|---|
| `/` | Redirect to `/admin` | Public redirect only |
| `/admin` | Login or owner workspace | Owner after sign-in |
| `/offline` | Safe offline explanation | Public, cached shell |
| `/api/health` | Minimal deployment health | Public, no private details |
| `/api/auth/session` | Validate current owner | Authenticated request |
| `/api/summary` | Return compact owner overview totals | Owner only |
| `/api/products...` | Product operations | Owner only |
| `/api/customers...` | Customer operations | Owner only |
| `/api/ledger...` | Ledger operations | Owner only |
| `/api/ledger/:id/void` | Void an incorrect ledger entry with a reason | Owner only |

Remove obsolete `/api/auth/login` and `/api/auth/logout` routes if the Neon client remains solely responsible for sign-in and sign-out.

### 6.2 Main application layout

Use one shell with:

1. Compact top bar:
   - Vendara name.
   - Online/offline indicator.
   - Owner menu.
   - Sign out.
2. Compact overview:
   - Active products.
   - Customers with balance.
   - Total outstanding balance.
3. Two primary navigation items:
   - Products.
   - Customers.

Open the authenticated workspace on `Customers` by default. For this product, the customer ledger is the daily operational surface and should require the fewest taps.

Do not add a permanent sidebar for only two sections.

Load the compact overview from one bounded `/api/summary` query. Do not download complete product and customer collections merely to calculate three totals. Load each full collection only when its work area is opened.

Recommended responsive navigation:

- Desktop/tablet: two tabs or segmented navigation under the summary.
- Mobile installed PWA: two-item bottom navigation or equally clear top tabs.

### 6.3 Products workflow

The default product screen should contain:

- Search field.
- Add product button.
- Product list/table.
- Product name.
- Selling price.
- Cost price.
- Markup as secondary information.
- Edit action.
- Price-history action.
- Archive action.

Product creation/editing should use one focused sheet, drawer, or modal:

- Name.
- Cost price.
- Selling price.
- Optional note.
- Save.
- Cancel.

Do not create a separate product-details route in the first release.

### 6.4 Customers workflow

The customer screen should use a list-detail pattern:

- Search customers.
- Add customer.
- Show current balance in the list.
- Select a customer to open the ledger.

Customer detail should prioritize:

1. Customer name and balance.
2. `Record credit purchase`.
3. `Record payment`.
4. Ledger history.
5. Edit/archive customer as secondary actions.

On mobile, show either the customer list or selected ledger, with a clear back action.

### 6.5 Debt workflow

Target flow:

1. Open customer.
2. Tap `Record credit purchase`.
3. Search/select product.
4. Enter quantity.
5. Add another item if needed.
6. Confirm date and optional note.
7. Review total.
8. Save once.
9. Show success and refreshed balance.

The server determines product snapshots and totals. The client total is a preview only.

### 6.6 Payment workflow

Target flow:

1. Open customer.
2. Tap `Record payment`.
3. Enter amount.
4. Confirm date and optional reference.
5. Save once.
6. Show success and refreshed balance.

The interface must explicitly warn before accepting a payment larger than the current balance. The product owner must choose one policy:

- Recommended default: reject overpayment.
- Alternative: permit negative balances as customer credit.

### 6.7 Interaction standards

- Minimum touch target: 44 by 44 CSS pixels.
- All forms have visible labels.
- Entered values remain visible after a recoverable server error.
- Destructive actions require confirmation.
- Saving controls show a busy state and cannot be submitted twice.
- Success is acknowledged once, then the authoritative data is refreshed.
- Errors use plain language and a specific recovery action.
- Empty states explain the next useful action.
- Search input is debounced and cancellable.
- Currency uses `Intl.NumberFormat` with `PHP`.
- Dates have one display format and one ISO storage format.

---

## 7. Target Technical Architecture

### 7.1 Architecture

```text
Installed PWA / Browser
        |
        | HTTPS
        v
Vercel CDN + Astro SSR
        |
        +-- Static hashed JS/CSS/fonts/icons
        |
        +-- Astro API routes as Vercel Functions
                |
                +-- Neon Auth verification
                |
                +-- Zod request validation
                |
                +-- Domain/service layer
                |
                +-- Transactional repositories
                        |
                        v
                 Neon PostgreSQL
```

### 7.2 Serverless rules

- Keep Astro `output: "server"`.
- Keep the Vercel adapter.
- Keep functions stateless.
- Do not store session or business state in function memory.
- Reuse module-level JWKS configuration where safe.
- Use the Neon serverless driver.
- Keep database operations short.
- Wrap multi-statement business operations in one database transaction.
- Do not perform nonessential background work after returning a response.
- Do not use serverless functions as scheduled workers.
- Use immutable static assets and normal Vercel CDN delivery.
- Apply `Cache-Control: no-store` to authenticated pages and every private API response.

### 7.3 Minimal module structure

Retain the current names and layer boundaries. The names in the following tree are
path contracts for the executor, not examples. Paths marked `[existing]` already
exist. Paths marked `[new]` are approved runtime additions. Section 27 is the
complete phase-specific authority, including tests, CI, runbooks, and decision files.

```text
src/
  components/
    app/
      AdminConsole.tsx                 [existing]
      AdminLogin.tsx                   [existing]
      AppTopBar.tsx                    [existing]
      ProductManager.tsx               [existing]
      CustomerManager.tsx              [existing]
      CustomerLedgerPanel.tsx          [existing]
      ConnectionStatus.tsx             [new; Phase 3]
      PwaUpdatePrompt.tsx               [new; Phase 4]
    ui/                                [existing; retain imported primitives]
  layouts/
    BaseLayout.astro                   [existing]
  lib/
    auth/                              [existing]
    client/                            [existing]
    db/                                [existing]
    domain/                            [existing]
    security/                          [existing]
    server/                            [existing]
      logger.ts                        [new; Phase 1]
    services/                          [existing]
    pwa/                               [new; Phase 4]
      cache-policy.ts                  [new; Phase 4]
      use-pwa-state.ts                 [new; Phase 4]
  pages/
    index.astro                        [existing]
    admin.astro                        [existing]
    offline.astro                      [new; Phase 4]
    api/
      health.ts                        [new; Phase 5]
      summary.ts                       [new, conditional; Phase 3]
      auth/
        login.ts                       [existing]
        logout.ts                      [existing]
        session.ts                     [existing]
      products.ts                      [existing]
      products/
        [id].ts                        [existing]
        [id]/
          history.ts                   [existing]
      customers.ts                     [existing]
      customers/
        [id].ts                        [existing]
        [id]/
          ledger.ts                    [existing]
          ledger/
            debt.ts                    [existing]
            payment.ts                 [existing]
      ledger/
        [entryId].ts                   [existing]
        [entryId]/
          void.ts                      [new; Phase 2]
  styles/
    global.css                         [existing]
public/
  favicon.ico                          [existing]
  favicon.svg                          [existing]
  icons/                               [new; Phase 4]
    icon-192x192.png                   [new; Phase 4]
    icon-512x512.png                   [new; Phase 4]
    icon-maskable-512x512.png          [new; Phase 4]
    apple-touch-icon-180x180.png       [new; Phase 4]
db/
  schema.sql                           [existing canonical fresh-schema snapshot]
  migrations/                          [new; Phase 2]
    0001_current_schema_baseline.sql   [new; Phase 2]
    0002_ledger_integrity_and_voiding.sql [new; Phase 2]
    0003_ledger_idempotency.sql        [new; Phase 2]
scripts/
  db-push.mjs                          [existing; deprecate after migration verification]
  db-migrate.mjs                       [new; Phase 2]
tests/                                 [existing unit-test location]
  integration/                         [new]
  e2e/                                 [new]
```

Do not rename the six existing application components merely to match terminology in
this plan. Do not perform a broad folder reorganization. New files outside this tree
require a documented reason and human approval before creation.

---

## 8. PWA Design

### 8.1 PWA objective

The PWA provides:

- Home-screen installation.
- Standalone display.
- Fast repeat loading of the application shell.
- Branded icons and launch appearance.
- A controlled update flow.
- A safe custom offline experience.

It does not provide offline access to private store data.

### 8.2 Recommended integration

Use the maintained Astro integration for Vite PWA:

- `@vite-pwa/astro`
- Workbox-generated service worker through the integration.
- `virtual:pwa-info` for manifest integration where appropriate.
- A small client component for service-worker update state.

Avoid a handwritten service worker unless the integration cannot express the required cache exclusions.

### 8.3 Manifest

Recommended manifest:

```text
id: /
name: Vendara
short_name: Vendara
description: Private product pricing and customer credit ledger for the store owner.
start_url: /admin
scope: /
display: standalone
orientation: any
theme_color: current Vendara primary surface color
background_color: application background color
lang: en-PH
```

Required assets:

- 192x192 icon.
- 512x512 icon.
- Maskable 512x512 icon.
- Apple touch icon.
- SVG favicon.

Do not add screenshots or application shortcuts until the base PWA is verified across target devices.

### 8.4 Caching contract

#### May be precached

- Hashed application JavaScript.
- Hashed application CSS.
- Local font files.
- PWA icons.
- Favicon.
- Offline page.
- Minimal non-sensitive shell assets.

#### Must never be cached by the service worker

- `/api/**`.
- Neon Auth endpoints.
- Requests containing `Authorization`.
- Responses containing customer data.
- Responses containing product cost data.
- Ledger responses.
- Session responses.
- Mutation responses.
- Error responses from private APIs.

#### Navigation behavior

- For `/admin`, prefer network while online.
- If navigation fails because the device is offline, show the cached offline experience.
- The offline experience must not display previously fetched private data.
- Static hashed assets may use cache-first behavior.
- The service-worker script and manifest must be checked for updates without stale CDN caching.

### 8.5 Offline behavior

When offline:

- Keep the installed app open.
- Show a persistent `Offline` status.
- Explain that store data requires a connection.
- Disable create, update, archive, delete, debt, and payment actions.
- Do not queue requests.
- Do not simulate success.
- Provide a `Try again` action.
- Automatically refresh session/data when connectivity returns.

Do not add IndexedDB, background sync, or conflict handling in this release.

### 8.6 Update behavior

Use a user-visible update prompt:

1. New service worker installs and waits.
2. Vendara displays `A new version is ready`.
3. The owner chooses `Update`.
4. If a form is dirty, warn before reloading.
5. Activate the new worker and reload once.

Do not force-reload while the owner is entering a debt or payment.

### 8.7 PWA acceptance criteria

- Vendara can be installed from a supported browser.
- Installed Vendara launches at `/admin` in standalone mode.
- Icons render correctly on Android, iOS home screen, Windows, and desktop Chromium where supported.
- Refreshing the installed app does not produce a blank screen.
- An offline navigation shows the custom offline state.
- No private API response appears in Cache Storage.
- No bearer token is stored in Cache Storage or localStorage.
- No write is attempted or queued while offline.
- A released update can be applied from the update prompt.
- A dirty form is protected from update-triggered reload.

---

## 9. Authentication and Authorization

### 9.1 Recommended model

Keep Neon Auth. Do not build custom authentication.

Use:

- Email and password or the currently supported verified-email flow.
- Verified email requirement.
- One active owner email in `admin_users`.
- No public sign-up screen.
- No role selection.
- No client-controlled role claims.

The database allow list remains valuable even with one owner because it separates a valid Neon identity from authorization to access Vendara.

### 9.2 Owner lifecycle

Required states:

```text
No account
  -> provision Neon Auth identity
  -> verify email
  -> add normalized email to admin_users
  -> active owner

Active owner
  -> deactivate admin_users row
  -> immediately unauthorized on the next API request
```

Document a manual recovery procedure for:

- Forgotten password.
- Lost device.
- Email change.
- Owner lockout.
- Suspected session compromise.

### 9.3 Session rules

- Retrieve the session through the Neon Auth-supported mechanism.
- Keep access tokens out of localStorage.
- Send tokens only over HTTPS.
- Never log tokens.
- Validate issuer, signature, subject, email, and verified-email claim.
- Check the active owner record on every protected request.
- Return `401` for missing/invalid authentication.
- Return `403` for authenticated but unauthorized requests.
- Clear client application state on sign-out or `401`.
- Do not cache session responses.

### 9.4 Authorization rule

Create one shared route guard and use it on **every** business endpoint, including `GET /api/products`.

Suggested policy:

```text
Read request:
  valid owner token + active owner record

Write request:
  valid owner token + active owner record + trusted origin
```

Add route tests that fail if a business endpoint can be called anonymously.

---

## 10. API and Data Contract

### 10.1 Response envelope

Standardize every API response on this target shape:

```json
{
  "success": true,
  "data": {}
}
```

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Check the highlighted fields.",
    "requestId": "..."
  }
}
```

Normalize the failure shape so `error` is consistently an object rather than sometimes a string.

### 10.2 Error codes

Use a small fixed set:

- `UNAUTHENTICATED`
- `FORBIDDEN`
- `VALIDATION_ERROR`
- `NOT_FOUND`
- `CONFLICT`
- `OFFLINE`
- `RATE_LIMITED`
- `INTERNAL_ERROR`

Do not expose SQL messages, stack traces, token errors, or provider internals.

### 10.3 Request IDs

- Generate or accept a safe request ID at the API boundary.
- Return it in failure responses and a response header.
- Include it in structured server logs.
- Do not include personal data in the request ID.

### 10.4 Idempotency

Financial create requests require an idempotency key.

Recommended implementation:

- Client creates a UUID when the debt/payment form opens.
- Client sends it as `Idempotency-Key`.
- `ledger_entries` stores the operation ID with a unique constraint.
- A retry with the same key returns the committed result.
- A reused key with a different payload returns `409 CONFLICT`.

Do not generate a new key automatically when retrying the same visible form.

### 10.5 Validation

Validate:

- Route IDs as UUIDs.
- Product name length.
- Customer name length.
- Note length.
- Currency values as finite non-negative decimal values.
- Payment as a positive decimal.
- Quantity as a positive integer.
- Date as an allowed ISO date.
- Debt item count with a reasonable upper limit.
- Duplicate product IDs in one debt request.
- Request body size.

The database must repeat critical constraints.

### 10.6 Currency

Avoid unrestricted JavaScript floating-point arithmetic for authoritative financial storage and totals.

Recommended choices:

- Keep PostgreSQL `numeric(10,2)`.
- Convert input to normalized decimal strings at the API boundary.
- Perform authoritative line totals in PostgreSQL or a decimal-safe server utility.
- Return normalized numeric strings or explicitly controlled two-decimal numbers.
- Test rounding at half-cent boundaries even if the UI accepts only two decimals.

---

## 11. Database Reliability Plan

### 11.1 Keep the current core model

Retain:

- `products`
- `price_history`
- `customers`
- `admin_users`
- `ledger_entries`
- `ledger_entry_items`

### 11.2 Required schema hardening

Add:

- Unique idempotency/operation ID on `ledger_entries`.
- `voided_at`, `voided_by`, and `void_reason` on `ledger_entries`.
- Constraint ensuring debt rows have `total_amount` and no `payment_amount`.
- Constraint ensuring payment rows have `payment_amount` and no `total_amount`.
- Index on `(customer_id, entry_date, created_at)`.
- Index on active customer/product search paths if current indexes are insufficient.

Review whether product names must be unique. Recommended default: do not force uniqueness because different package sizes may share similar names; rely on clearer naming in the UI.

### 11.3 Required transaction fixes

#### Debt creation

One transaction must:

1. Validate idempotency.
2. Load and lock/verify referenced active products as needed.
3. Calculate authoritative snapshots and total.
4. Insert the debt ledger entry.
5. Insert all debt items.
6. Commit.

Any failure rolls back the entire operation.

#### Product price update

One transaction must:

1. Load the current product.
2. Compare prices.
3. Insert price history if prices changed.
4. Update the product.
5. Commit.

Any failure rolls back both history and product changes.

#### Ledger update

Remove ledger editing from the simplified UI and API.

Correct mistakes through **void and repost**:

1. The owner selects the incorrect entry.
2. The owner enters a required correction reason.
3. Vendara marks the entry void without deleting it.
4. The voided entry no longer affects the balance.
5. The owner posts the correct replacement as a new entry.

The entry type remains immutable and the original financial history remains auditable.

### 11.4 Delete policy

- Products: archive/soft-delete.
- Customers: archive/soft-delete.
- Ledger entries: never hard-delete through the application.
- Add `voided_at`, `voided_by`, and `void_reason`.
- Balance queries exclude voided entries.
- Ledger history can reveal voided entries through a `Show voided` control.
- The void operation returns the newly calculated authoritative balance.

### 11.5 Customer balance

- Continue deriving balance from ledger entries.
- Do not add a mutable `balance` column.
- After customer updates, return/reload the real aggregated balance rather than `0`.
- Test balances after create, payment, debt, deletion, and correction.

### 11.6 Versioned migrations

Replace one-shot schema pushing with a minimal migration runner:

```text
db/
  migrations/
    0001_current_schema_baseline.sql
    0002_ledger_integrity_and_voiding.sql
    0003_ledger_idempotency.sql
  schema.sql
```

Add:

- `schema_migrations` table.
- Ordered migration execution.
- One transaction per migration where PostgreSQL permits.
- Checksum or immutable migration policy.
- `npm run db:migrate`.
- `npm run db:migrate:status`.

Do not add a full ORM solely for migrations.

### 11.7 Backup and recovery

- Enable the appropriate Neon backup/point-in-time recovery capability.
- Document the retention period.
- Test a restore into a non-production branch.
- Before a risky migration, create a restorable branch/snapshot.
- Never test rollback against production first.
- Document the recovery point objective and recovery time expectation appropriate for a single store.

Recommended starting target:

- Recovery point: within the platform's enabled backup window.
- Recovery procedure tested at least quarterly.
- Owner is informed clearly if a recovery could omit the latest transactions.

---

## 12. Security Plan

### 12.1 Immediate fixes before PWA release

1. Require owner authentication on `GET /api/products`.
2. Verify all other business routes use the shared owner guard.
3. Fix or remove ledger update type conversion.
4. Make ledger and price-history writes atomic.
5. Stop returning internal exception messages.
6. Add strict private-response cache headers.
7. Fix user-facing encoding/mojibake.

### 12.2 CSRF and origin protection

- Retain a strict same-origin check for state-changing requests.
- Reject malformed or unexpected `Origin` values.
- In production, do not treat a missing origin as automatically trusted for browser mutations without a documented reason.
- Keep cookies `Secure` and with an appropriate `SameSite` policy through the auth provider.
- If authentication moves to cookies controlled by Vendara, add explicit CSRF tokens.

### 12.3 Security headers

Apply and test:

- `Content-Security-Policy`
- `Strict-Transport-Security` in production
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy`
- `Permissions-Policy`
- `X-Frame-Options: DENY`
- CSP `frame-ancestors 'none'`

The CSP must explicitly allow only the required Neon Auth connection origins and required local assets. Avoid broad wildcards.

### 12.4 Rate limits

Use platform-native rate controls where possible.

Apply stricter protection to:

- Authentication attempts.
- Session checks if abused.
- Search endpoints.
- Product/customer mutations.
- Ledger writes and deletions.

Rate limits are defense in depth; they do not replace owner authorization or idempotency.

Avoid an additional Redis service solely for the first version's rate limiting.

### 12.5 PWA privacy

- Cache no private API responses.
- Cache no authenticated HTML containing embedded owner/store data.
- Store no access token in Cache Storage or localStorage.
- Clear in-memory application state on sign-out.
- Show the owner that installed-device access should be protected with device PIN/biometrics.
- Document lost-device session revocation.
- Do not include customer names or balances in notifications because notifications are out of scope.

### 12.6 Secrets

- Keep secrets only in local ignored environment files and Vercel environment settings.
- Validate required variables at startup/build.
- Add and validate `STORE_TIME_ZONE`, defaulting by explicit configuration rather than the serverless function's local timezone.
- Keep the display store name in one documented configuration value rather than duplicating it across components.
- Remove unused `NEON_API_KEY` from `.env.example` unless a documented deployment script needs it.
- Never expose `DATABASE_URL` or provider keys through `PUBLIC_` variables.
- Rotate credentials after suspected exposure.
- Enable dependency update automation and security scanning.

### 12.7 Audit events

Record a small set of important server-side events:

- Owner sign-in authorization success/failure category.
- Product archive.
- Customer archive.
- Ledger create.
- Ledger delete/correction.
- Owner deactivation.

Do not log:

- Passwords.
- Tokens.
- Full request bodies.
- Customer notes.
- Product/customer data unnecessarily.

### 12.8 Security acceptance tests

- Anonymous product read returns `401`.
- Anonymous customer/ledger read returns `401`.
- Authenticated non-owner returns `403`.
- Unverified email is rejected.
- Inactive owner is rejected.
- Invalid origin is rejected on every mutation.
- Invalid UUID returns `400`, not a database error.
- Invalid and oversized bodies are rejected.
- SQL details never reach the client.
- Repeated idempotent ledger request creates one entry.
- Service-worker caches contain no private API response.
- Logout removes visible private data from the app.
- CSP and security headers are present in production responses.
- Rate limits return `429` when the configured boundary is exceeded.

---

## 13. Reliability and Failure Handling

### 13.1 Client states

Every data surface must support:

- Initial loading.
- Loaded data.
- Empty data.
- Recoverable error.
- Unauthorized/session expired.
- Offline.
- Saving.
- Save succeeded.
- Save failed.

Do not convert a network or database failure into an empty list.

### 13.2 Mutation behavior

For every mutation:

1. Validate locally for immediate guidance.
2. Preserve form input.
3. Disable submit after the first click.
4. Send one request with request ID and, for ledger creates, idempotency key.
5. Let the server validate and commit.
6. On success, refresh authoritative data.
7. On known validation failure, map errors to fields.
8. On unknown failure, show a safe retry message and request ID.

### 13.3 Timeouts and retries

- Apply reasonable client request timeouts.
- Do not automatically retry non-idempotent writes.
- Idempotent reads may be retried with a small bounded policy.
- Ledger writes may be manually retried with the same idempotency key.
- Avoid infinite loading states.

### 13.4 Health endpoint

`GET /api/health` should return only:

```json
{
  "status": "ok",
  "version": "deployment identifier"
}
```

Do not expose:

- Database URL.
- Provider details.
- Stack traces.
- Owner identity.
- Table counts.

A deeper database check should be protected or run through deployment smoke tests rather than making an expensive public endpoint.

### 13.5 Logging and monitoring

Use structured server logs containing:

- Timestamp.
- Level.
- Request ID.
- Route.
- Method.
- Status code.
- Duration.
- Safe error category.
- Deployment/version identifier.

Exclude private payloads and credentials.

Minimum monitoring:

- Vercel deployment/build failures.
- Server function error rate.
- `5xx` responses.
- Authentication failure spikes.
- Database connection/query failures.
- External uptime check for `/api/health`.

Add a third-party error platform only if Vercel's available logs and alerts are insufficient. Do not add one by default merely for architectural completeness.

---

## 14. Performance Plan

### 14.1 User-experience targets

At the 75th percentile on supported mobile devices:

- Largest Contentful Paint: at or below 2.5 seconds.
- Interaction to Next Paint: at or below 200 milliseconds.
- Cumulative Layout Shift: at or below 0.1.

Operational targets to measure after deployment:

- Cached application shell opens without a blank screen.
- Search feedback begins within 100 milliseconds of typing.
- Normal warm API reads target under 500 milliseconds.
- Normal warm writes target under 800 milliseconds, excluding unusually slow provider/network conditions.
- No common owner action requires a full-page navigation.

These are targets, not reasons to add a cache or service before measurement shows a need.

### 14.2 Frontend performance

- Keep one React application island for the owner workspace unless measurement justifies splitting.
- Lazy-load secondary price-history UI if it materially reduces the initial bundle.
- Avoid loading every dialog and large icon set eagerly.
- Use local fonts already included in the build.
- Prefer CSS over animation libraries.
- Respect `prefers-reduced-motion`.
- Keep animations under approximately 200 milliseconds and functional.
- Debounce server search.
- Cancel superseded searches.
- Avoid fetching the same product/customer collections independently in multiple components.

### 14.3 API and database performance

- Select only required columns.
- Keep search bounded.
- Add pagination only when real dataset size requires it.
- Avoid N+1 item queries.
- Use existing name indexes.
- Add composite ledger indexes based on measured query plans.
- Monitor query duration before adding application caches.
- Never CDN-cache authenticated owner data.

### 14.4 Bundle and dependency discipline

For every new dependency:

- Confirm it solves a current requirement.
- Check maintenance and security posture.
- Prefer the existing stack.
- Avoid overlapping libraries.
- Record why it is needed.

The PWA integration should be the only major dependency needed for installability.

---

## 15. Accessibility and Mobile Standards

- Meet WCAG 2.2 AA for the core owner flows.
- Full keyboard operation on desktop.
- Visible focus indicators.
- Correct dialog focus trapping and restoration.
- Semantic headings.
- Proper table semantics where tables are used.
- Accessible names for icon-only actions.
- Error messages connected to their form fields.
- Status messages announced through an appropriate live region.
- Color is never the only indicator of balance, error, or success.
- Text remains usable at 200% zoom.
- Layout works at 320 CSS pixels wide.
- Inputs use suitable mobile types and input modes:
  - Decimal for prices/payments.
  - Numeric for quantities.
  - Date controls for posting dates.
- Safe-area insets are respected in standalone mobile mode.

---

## 16. Testing Strategy

The project requires test-driven development and at least 80% coverage.

### 16.1 Test layers

#### Unit tests

Cover:

- Pricing comparisons.
- Decimal normalization and totals.
- Ledger balance.
- Debt snapshots.
- Validation schemas.
- Owner authorization helpers.
- Cache-routing decisions.
- Idempotency behavior.
- Error mapping.

#### Integration tests

Run against a disposable PostgreSQL database or Neon branch:

- Product CRUD.
- Product price update plus history transaction.
- Customer CRUD and accurate returned balance.
- Debt header/items atomicity.
- Payment creation.
- Duplicate idempotency key.
- Ledger balance after mutations.
- Archive behavior.
- Database constraints.
- Migration from a representative current schema.

#### API tests

Cover every route:

- Authentication required.
- Active owner required.
- Trusted origin on writes.
- Valid request success.
- Invalid request failure.
- Not-found behavior.
- Conflict behavior.
- Safe `500` response.
- `Cache-Control: no-store` on private responses.

#### E2E tests

Critical flows:

1. Owner signs in.
2. Owner creates and edits a product.
3. Price change appears in history.
4. Owner creates a customer.
5. Owner records a multi-item debt.
6. Owner records a payment.
7. Balance and running balance are correct.
8. Owner archives a customer/product.
9. Session expiry returns to login without showing stale private data.
10. Offline mode disables business actions.
11. Installed PWA update prompt does not discard a dirty form.

#### PWA/browser tests

- Manifest fields and icons.
- Service-worker registration.
- Offline fallback.
- Static asset caching.
- API cache exclusion.
- Update activation.
- Standalone viewport and safe areas.
- Android Chromium.
- iOS Safari/Add to Home Screen.
- Desktop Chromium.

#### Security tests

Use the acceptance tests in Section 12.8 as automated tests where practical.

### 16.2 Coverage gate

Configure Vitest thresholds:

```text
statements >= 80%
branches >= 80%
functions >= 80%
lines >= 80%
```

Critical domain, authorization, transaction, and cache-policy modules should target higher than the repository-wide minimum.

### 16.3 TDD order

For every phase:

1. Write a failing test.
2. Implement the smallest passing change.
3. Refactor.
4. Run unit and affected integration tests.
5. Run the complete verification suite before merge.

---

## 17. CI/CD and Release Process

### 17.1 Pull-request checks

Add a GitHub Actions workflow that runs:

1. `npm ci`
2. Lint/format check.
3. `npm run typecheck`
4. Unit tests.
5. Integration tests.
6. Coverage with 80% thresholds.
7. `npm run build`
8. PWA manifest/service-worker verification.
9. Dependency/security audit according to project policy.

Vercel may create a preview deployment after checks begin, but production promotion must require the mandatory checks to pass.

### 17.2 Production release

Recommended release flow:

```text
Feature branch
  -> Pull request
  -> Automated checks
  -> Vercel preview
  -> Manual smoke test
  -> Merge to main
  -> Production deploy
  -> Production smoke test
  -> Monitor errors
```

### 17.3 Database release

- Use backward-compatible migrations.
- Run migration tests before merge.
- Back up or branch the production database before risky changes.
- Apply migrations before code only when the old application remains compatible.
- Prefer expand-and-contract changes:
  1. Add new nullable/defaulted structure.
  2. Deploy compatible code.
  3. Backfill if needed.
  4. Enforce constraints in a later migration.
- Do not combine destructive schema removal with the first PWA release.

### 17.4 Rollback

Application rollback:

- Promote the previous known-good Vercel deployment.

Database rollback:

- Prefer forward fixes for committed production migrations.
- Use a tested reverse migration only when safe.
- Restore from Neon recovery only for serious data-loss/corruption scenarios.

PWA rollback consideration:

- A previous server deployment does not instantly remove an already installed service worker.
- Keep service-worker changes backward-compatible.
- Test update and rollback across at least two consecutive versions.
- Ensure the manifest and service-worker URLs remain valid.

---

## 18. Implementation Phases

The phases are ordered by risk and dependency, not visual appeal.

### Phase 0 — Confirm the boundary

**Goal:** Prevent scope drift.

Tasks:

- Approve one store and one owner role.
- Confirm PHP currency.
- Confirm overpayment policy.
- Confirm the void-and-repost correction workflow.
- Confirm the store timezone; use `Asia/Manila` unless the store operates elsewhere.
- Confirm whether one optional emergency recovery owner account is permitted without introducing another role or staff model.
- Confirm supported device/browser baseline.
- Mark the public catalog and multi-role features as out of scope.
- Designate this file as the active implementation plan.
- Mark older contradictory plans as historical.

Exit criteria:

- No unresolved question changes the data model or financial rules.

#### Phase 0 — Recorded decisions (confirmed 2026-07-23)

| Decision | Confirmed value | Notes |
|---|---|---|
| Store model | One store, one owner role | No multi-tenancy or staff roles |
| Currency | Philippine peso (PHP), `₱` in UI | No multi-currency in initial release |
| Store timezone | `Asia/Manila` | Used for dated ledger entries and display |
| Overpayments | Reject payment amounts above current positive balance | Enforced server-side in Phase 2+; policy locked now |
| Ledger corrections | Void-and-repost (no in-place type or amount edits) | Hard delete and PUT ledger edits removed in Phase 1; void fields in Phase 2 |
| Recovery identity | One optional second allow-list credential, same owner role | Not a separate role; documented in Phase 6 runbook |
| Device/browser baseline | Current Chromium/Safari on mobile and desktop (last two major versions) | Installable PWA target in Phase 4 |
| Public catalog | Out of scope | No public product or price API |
| Multi-role / staff admin | Out of scope | `admin_users` table name retained; “Owner” is user-facing |
| Active implementation plan | This file (`VENDARA_ADMIN_ONLY_PWA_PLAN.md`) | Single source of execution truth |
| Voided-entry display (future) | Hidden by default; “Show voided” later | Phase 2 schema + UI |
| Repeat void (future) | `409 Conflict` | Phase 2 |
| Idempotency transport (future) | `Idempotency-Key` UUID header | Phase 2 |
| Summary KPI endpoint | Deferred until Phase 3 fields are approved | Not required for Phase 1 |

**Historical plans (superseded — do not implement from these):**

- `SARI_SARI_STORE_PRICELIST_PLAN.md` (includes public search; superseded)
- `UI-REDESIGN-PLAN.md`, `REDESIGN.md`, `DESIGN.md`, `DESIGN-airbnb.md`, `vercel/DESIGN.md` (design context only)

#### Phase 0 — Repo scan summary (2026-07-23)

Verified stack and surfaces match Section 26: Astro 6 SSR on Vercel, React admin UI under `src/components/app/`, business APIs under `src/pages/api/`, Neon via `@neondatabase/serverless`, Neon Auth + JWKS in `src/lib/auth/admin.ts`, Vitest under `tests/`. No ORM. `GET /api/products` was the only business read route missing owner auth at scan time.

### Phase 1 — Security and integrity baseline

**Goal:** Make the current application safe enough to become installable.

Tests first:

- Anonymous product read is rejected.
- Ledger entry type cannot change.
- Failed debt-item insert rolls back the debt header.
- Failed product update rolls back price history.
- Customer update returns real balance.
- Private responses use `no-store`.

Implementation:

- Protect `GET /api/products`.
- Centralize the owner guard.
- Disable ledger editing and hard deletion. Add void-and-repost only after the
  additive void fields are introduced in Phase 2.
- Make debt writes atomic.
- Make product/history writes atomic.
- Correct customer update response.
- Validate route UUIDs.
- Normalize safe API errors.
- Add request IDs and structured logs.
- Strengthen security headers.
- Fix mojibake.

Exit criteria:

- All business APIs require the owner.
- No known partial financial write remains.
- All new tests pass.

### Phase 2 — Minimal migrations and idempotency

**Goal:** Make schema changes and financial retries reliable.

Tests first:

- Migrations apply once and in order.
- Duplicate migration does not rerun.
- Duplicate ledger idempotency key creates one transaction.
- Debt/payment constraints reject invalid row shapes.

Implementation:

- Add migration runner and `schema_migrations`.
- Baseline current production schema safely.
- Add ledger operation/idempotency ID.
- Add ledger shape constraints.
- Add the trusted-owner void endpoint and void-aware balance/history queries.
- Add supporting indexes.
- Document backup and restore.

Exit criteria:

- A fresh database and a representative existing database reach the same schema.
- Retry of a ledger write cannot duplicate the entry.

### Phase 3 — Owner interface simplification

**Goal:** Make daily workflows fast and obvious.

Tests first:

- Primary UI states render correctly.
- Double submission is prevented.
- Failed form retains input.
- Session expiry clears private UI.

Implementation:

- Reduce navigation to Products and Customers.
- Simplify the KPI strip.
- Make product form focused and mobile-safe.
- Make customer list-detail behavior consistent.
- Prioritize debt and payment actions.
- Add clear loading, offline, saving, success, and failure states.
- Remove dead UI and unused routes/components.
- Keep price history inside product context.

Exit criteria:

- Core flows can be completed on a small phone without horizontal scrolling.
- No obsolete public/customer-facing UI remains.

### Phase 4 — Installable PWA

**Goal:** Add installability without caching private data.

Tests first:

- Manifest validates.
- Static shell is cached.
- Offline fallback works.
- API/auth requests are never cached.
- Offline mutations are disabled.
- Update prompt protects dirty forms.

Implementation:

- Add `@vite-pwa/astro`.
- Configure manifest.
- Add icons.
- Add offline route.
- Configure strict Workbox runtime rules.
- Add connection status.
- Add install/update handling.
- Add safe-area styling.

Exit criteria:

- PWA installs and launches on target devices.
- Cache inspection shows no private data.

### Phase 5 — Integration, E2E, and performance

**Goal:** Prove the complete system.

Implementation:

- Add disposable database integration environment.
- Add route integration tests.
- Add critical Playwright E2E flows.
- Enforce 80% coverage.
- Add lint/format checks.
- Measure Core Web Vitals and bundle size.
- Fix measured bottlenecks.
- Run accessibility checks.

Exit criteria:

- Unit, integration, API, E2E, accessibility, and build checks pass.
- Coverage thresholds pass.
- Performance targets are met or any exception is documented and approved.

### Phase 6 — CI/CD and production rollout

**Goal:** Release safely and make recovery routine.

Implementation:

- Add GitHub Actions.
- Configure Vercel preview/production environments.
- Configure production environment variables.
- Configure rate controls.
- Configure monitoring and uptime check.
- Test Neon backup restore.
- Run staged production smoke test.
- Verify PWA update from previewed previous version to release version.
- Document owner recovery and operational runbook.

Exit criteria:

- Deployment is reproducible.
- Previous Vercel deployment can be restored.
- Database recovery procedure is verified.
- Production smoke tests pass.

### Phase 7 — Cleanup

**Goal:** Leave one clear product and one clear operating model.

Tasks:

- Update `README.md`.
- Add setup, migration, testing, deployment, and recovery instructions.
- Mark outdated design/product plans as archived or superseded.
- Remove dead endpoints.
- Remove unused environment variables.
- Remove unused dependencies and components.
- Record final architecture decisions.

Exit criteria:

- A new developer can set up, test, migrate, and deploy Vendara using the maintained documentation.

---

## 19. Implementation Checklist by Area

### Product

- [ ] One store confirmed.
- [ ] One owner role confirmed.
- [ ] Products and customer ledger are the only primary modules.
- [ ] Overpayment policy confirmed.
- [ ] Ledger correction policy confirmed.
- [ ] Non-goals approved.

### API

- [ ] Shared owner guard covers every business route.
- [ ] Product reads are private.
- [ ] UUIDs and bodies are validated.
- [ ] Error envelope is consistent.
- [ ] Request IDs are returned.
- [ ] Private responses use `no-store`.
- [ ] Financial writes use idempotency.

### Database

- [ ] Versioned migrations exist.
- [ ] Debt creation is atomic.
- [ ] Product/history update is atomic.
- [ ] Ledger types are immutable.
- [ ] Ledger row-shape constraints exist.
- [ ] Balance responses are accurate.
- [ ] Backup/restore is tested.

### PWA

- [ ] Manifest is valid.
- [ ] Icons include maskable asset.
- [ ] Start URL is `/admin`.
- [ ] Standalone mode works.
- [ ] Offline page is cached.
- [ ] Private APIs are excluded from caches.
- [ ] Offline writes are disabled.
- [ ] Update prompt works.
- [ ] Dirty forms survive update decisions.

### Security

- [ ] Neon Auth remains managed.
- [ ] No public sign-up.
- [ ] Verified email required.
- [ ] Active owner allow list required.
- [ ] Same-origin writes enforced.
- [ ] Security headers complete.
- [ ] Platform rate limits configured.
- [ ] No secrets or tokens in logs/caches.
- [ ] Lost-device recovery documented.

### Quality

- [ ] Unit tests pass.
- [ ] Integration tests pass.
- [ ] API tests pass.
- [ ] E2E tests pass.
- [ ] PWA tests pass.
- [ ] Accessibility checks pass.
- [ ] Coverage is at least 80%.
- [ ] Type-check passes.
- [ ] Lint/format checks pass.
- [ ] Production build passes.

### Operations

- [x] CI workflow added (`.github/workflows/ci.yml`); require as branch protection in GitHub.
- [ ] Vercel preview is smoke-tested.
- [x] Production health check exists (`GET /api/health`).
- [ ] Error monitoring is configured (Vercel / external — see runbooks).
- [ ] Rollback is tested (document in deployment runbook).
- [ ] Database restore is tested (see `contexts/runbooks/database-backup-restore.md`).
- [x] Runbooks added under `contexts/runbooks/`.

---

## 20. Definition of Done

Vendara is ready for the simplified production release only when all of the following are true:

### Product

- The application contains only the owner-focused product and customer-ledger workflows.
- There is no public store-data surface.
- Common actions are usable on mobile and desktop.
- The owner can understand every loading, offline, save, and error state.

### PWA

- The application is installable.
- It launches in standalone mode.
- It has a safe offline experience.
- It never caches private business data.
- It never accepts or queues offline writes.
- Updates do not destroy unsaved form data.

### Correctness

- Debt and payment totals are authoritative on the server.
- Debt header/items are atomic.
- Product/history changes are atomic.
- Ledger writes are idempotent.
- Entry type cannot change.
- Customer balances remain correct after every supported operation.

### Security

- Every business endpoint requires the active verified owner.
- Cost prices, customers, and ledger data are private.
- Security headers and origin controls pass tests.
- No secrets or tokens appear in source, logs, or PWA caches.
- Rate controls and safe errors are active.

### Quality

- Unit, integration, API, E2E, PWA, and security tests pass.
- Coverage is at least 80% and enforced.
- Type-check, lint, and production build pass in CI.
- Core Web Vitals meet the stated targets at the 75th percentile or have an approved remediation plan.

### Operations

- Versioned migrations are used.
- Production can be rolled back.
- The database can be restored.
- Owner account recovery is documented.
- Setup, deployment, and incident steps are documented.

---

## 21. Decisions and Recommended Defaults

| Decision | Recommended default | Reason |
|---|---|---|
| Store model | One store | Removes tenancy and store-switching complexity |
| User model | One owner role | No RBAC or staff management |
| Authentication | Keep Neon Auth | Managed, already integrated |
| Authorization | One active owner allow-list row | Simple explicit access boundary |
| Public catalog | Remove | Matches admin-only direction and protects cost data |
| PWA data mode | Online-only private data | Avoids sync and device-data risk |
| Offline writes | Disallow | Prevents conflicts and duplicate ledger entries |
| PWA cache | Static shell only | Fast repeat launch without private-data persistence |
| PWA updates | Visible update prompt | Protects in-progress financial forms |
| Ledger retry | Idempotency key | Prevents duplicate debt/payment after uncertain response |
| Ledger editing | Remove initially | Avoids type corruption and audit ambiguity |
| Product/customer deletion | Archive | Preserves history |
| Ledger deletion | Audited correction policy | Financial records need traceability |
| Database access | Keep raw parameterized Neon SQL | No need for ORM rewrite |
| Migrations | Small SQL migration runner | Reliable history without a new framework |
| Deployment | Vercel Git deployment | Existing serverless target |
| Rate limiting | Platform-native | Avoids Redis/service sprawl |
| Monitoring | Vercel logs/alerts first | Add tools only when evidence requires them |

---

## 22. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Service worker caches private data | Explicit deny rules, `no-store`, automated cache inspection |
| Owner submits twice after slow network | Disable submit, idempotency key, authoritative result refresh |
| Partial debt record | Single database transaction |
| False price history | Product update and history in one transaction |
| Installed app runs stale code | Update prompt, compatible migrations, update/rollback tests |
| Lost device exposes an active session | Device-lock guidance, sign-out/revocation runbook, short provider-supported session policy |
| Serverless retry duplicates transaction | Database unique operation ID |
| Owner loses access | Document Neon Auth recovery and allow-list update procedure |
| Migration damages production data | Backward-compatible migration, Neon branch/backup, restore test |
| Error looks like empty data | Explicit error states and structured logs |
| Scope expands into POS/accounting | Enforce non-goals and require a new capability decision |
| PWA work delays reliability fixes | Complete security/integrity phase before PWA phase |

---

## 23. Handoff

This plan is tailored for execution by Cursor Composer 2.5. Composer must read
Section 7.3 and follow Sections 24 through 29 before implementing any phase.

The recommended next execution sequence is:

1. Open one Cursor task for Phase 0 and record the fixed decisions.
2. Open a new task for Phase 1; create failing tests before implementation.
3. Complete the Phase 1 verification gate and security review.
4. Execute each later phase in a separate task and stop at its exit criteria.
5. Add the PWA only after private APIs and financial writes are safe.
6. Do not combine migrations, UI redesign, PWA work, and deployment in one task.

No framework rewrite, database replacement, or new infrastructure service is required.

---

## 24. Cursor Composer 2.5 Executor Contract

### 24.1 Authority and precedence

When instructions conflict, use this order:

1. The current user instruction.
2. `AGENTS.md`.
3. This plan's fixed constraints, invariants, non-goals, and phase manifest.
4. Existing code and tests.
5. Current official third-party documentation for exact package syntax.

`SARI_SARI_STORE_PRICELIST_PLAN.md`, `REDESIGN.md`,
`UI-REDESIGN-PLAN.md`, `DESIGN.md`, `DESIGN-airbnb.md`, and
`vercel/DESIGN.md` are historical context. They must not introduce requirements
that conflict with this plan.

### 24.2 Mandatory execution rules

Composer must:

- Execute exactly one numbered phase per Cursor task.
- Read `AGENTS.md`, the complete selected phase, Sections 24 through 29, every
  required `SKILL.md`, and every allowed source file before editing.
- Run `git status --short` before editing and preserve all existing user changes.
- Preserve this plan even when it is untracked; never use `git clean`, destructive
  reset, or checkout commands.
- Verify every path labeled **existing** before relying on it.
- Create only paths labeled **create** for the active phase.
- Follow TDD: observe the intended test failure, implement the smallest safe change,
  refactor, then run focused and full verification.
- Keep the current Astro, React, Vercel, Neon Auth, Neon PostgreSQL, Tailwind, Zod,
  and Vitest architecture.
- Use immutable transformations, parameterized SQL, thin routes, and the current API
  response envelope.
- End the phase with exact changed paths, command results, coverage, risks, and
  deviations.

Composer must not:

- Attempt the full plan in one task.
- Invent frameworks, services, routes, tables, roles, components, abstractions, or
  product requirements.
- Rename or move files unless the exact operation is listed for the active phase.
- Create unspecified `helpers`, `common`, `shared`, `core`, or `utils` modules.
- Add an ORM, Redis, queues, containers, GraphQL, offline database, analytics
  platform, state library, or another UI library.
- Change unrelated package versions.
- Delete a route, component, dependency, or document based only on an assumption
  that it is unused.
- Deploy, run a production migration, change Neon/Vercel production settings,
  commit, or push without separate user authorization.

### 24.3 Stop instead of guessing

Stop the phase and report evidence if:

- An existing path is missing or has a materially different responsibility.
- The work needs a path outside the active phase manifest.
- An unapproved dependency is required.
- A migration cannot be additive and backward-compatible.
- The production data shape affects a constraint or backfill but is unknown.
- The installed Neon driver does not support the assumed transaction API.
- Neon Auth behavior differs from the existing JWKS and allow-list flow.
- A required decision remains unresolved.
- An unrelated worktree edit overlaps a required change.

The report must include the observed fact, affected path, why safe execution cannot
continue, and the smallest decision needed.

### 24.4 Implementation invariants for Composer

- Keep the database money columns as PostgreSQL `numeric`; integer centavos are for
  safe TypeScript calculations, not an authorized physical-column rewrite.
- Debt header and items must use one repository transaction.
- Product update and price-history insertion must use one repository transaction.
- Idempotency must use a database uniqueness constraint; a disabled button is not
  sufficient.
- Migrate the current string-error response to the target envelope defined in
  Section 10.1 during Phase 1, then preserve that normalized envelope:

```ts
{ success: true, data: value }
{
  success: false,
  error: {
    code: "FIXED_ERROR_CODE",
    message: "Safe message",
    requestId: "request-id"
  },
  details?: safeDetails
}
```

- All business routes require the existing server-side owner/admin guard.
- All mutations retain the trusted-origin check.
- Never trust client totals, prices, balances, entry types, or owner identity.
- Never log bearer tokens, passwords, OTPs, connection strings, full request bodies,
  customer notes, or ledger notes.
- `/api/**`, Neon Auth, authorization-bearing requests, authenticated HTML, customer
  data, ledger data, product cost data, and sessions must never enter PWA caches.
- `/admin` is SSR private HTML and must not be precached. The safe shell consists of
  hashed static assets, local fonts, icons, manifest, and the non-sensitive offline
  page.

---

## 25. Skills and Review Sequence

Skills are repository-local at `.agents/skills/<skill>/SKILL.md`. Composer must
open the complete file for each **Required** skill before phase actions. Skills do
not expand the file allow list.

| Phase | Required skills | Purpose |
|---|---|---|
| 0 | `repo-scan`, `product-capability` | Verify current assets and lock product truth |
| 1 | `tdd-workflow`, `security-review`, `api-design`, `backend-patterns`, `verification-loop` | Secure APIs and make financial operations atomic |
| 2 | `tdd-workflow`, `backend-patterns`, `security-review`, `documentation-lookup`, `verification-loop` | Implement verified Neon migrations and idempotency |
| 3 | `frontend-patterns`, `accessibility`, `tdd-workflow`, `verification-loop` | Simplify existing React workflows without a redesign rewrite |
| 4 | `documentation-lookup`, `frontend-patterns`, `security-review`, `browser-qa`, `verification-loop` | Add a current, secure PWA integration |
| 5 | `tdd-workflow`, `browser-qa`, `accessibility`, `benchmark`, `verification-loop` | Prove integration, E2E, accessibility, and performance |
| 6 | `deployment-patterns`, `security-review`, `verification-loop` | Implement CI, preview, release, rollback, and recovery |
| 7 | `repo-scan`, `architecture-decision-records`, `verification-loop` | Prove cleanup safety and capture durable decisions |

Required agent sequence from `AGENTS.md`:

1. `planner` before each phase.
2. `tdd-guide` before a feature or defect implementation.
3. `code-reviewer` immediately after code changes.
4. `typescript-reviewer` after TypeScript/React changes.
5. `security-reviewer` after Phases 1, 2, 4, and 6.
6. `silent-failure-hunter` after Phases 1 and 5.
7. `build-error-resolver` only when build/type verification fails.

If the active Cursor environment cannot invoke these agents, Composer must open the
matching definition under `contexts/agents/`, perform its checklist directly, and
state that no separate agent was run. It must never claim an agent review occurred
without evidence.

Composer must not use `prompt-optimizer` to execute this plan. That skill is
advisory-only and explicitly prohibits implementation.

---

## 26. Verified Existing File Inventory

These paths existed when this executor plan was written. Reverify them at the
beginning of the relevant phase.

### Configuration and runtime

- `package.json`
- `package-lock.json`
- `astro.config.mjs`
- `tsconfig.json`
- `vitest.config.ts`
- `.env.example`
- `.gitignore`
- `src/middleware.ts`
- `src/layouts/BaseLayout.astro`
- `src/pages/index.astro`
- `src/pages/admin.astro`
- `src/styles/global.css`

### Application UI

- `src/components/app/AdminConsole.tsx`
- `src/components/app/AdminLogin.tsx`
- `src/components/app/AppTopBar.tsx`
- `src/components/app/ProductManager.tsx`
- `src/components/app/CustomerManager.tsx`
- `src/components/app/CustomerLedgerPanel.tsx`

Files under `src/components/ui/` are existing primitives. They are outside the
default modification list. Modify/remove one only after `rg` proves its import graph
and the active phase explicitly requires it.

### Auth, API, domain, services, and repositories

- `src/lib/api.ts`
- `src/lib/client/api.ts`
- `src/lib/auth/admin.ts`
- `src/lib/auth/client.ts`
- `src/lib/auth/http.ts`
- `src/lib/db/client.ts`
- `src/lib/domain/ledger.ts`
- `src/lib/domain/pricing.ts`
- `src/lib/env.server.ts`
- `src/lib/security/headers.ts`
- `src/lib/server/admin-users-repository.ts`
- `src/lib/server/customers-repository.ts`
- `src/lib/server/formatters.ts`
- `src/lib/server/ledger-repository.ts`
- `src/lib/server/products-repository.ts`
- `src/lib/services/customer-ledger.ts`
- `src/lib/services/products.ts`
- `src/lib/types.ts`
- `src/lib/utils.ts`
- `src/lib/validation.ts`

### API routes

- `src/pages/api/auth/login.ts`
- `src/pages/api/auth/logout.ts`
- `src/pages/api/auth/session.ts`
- `src/pages/api/products.ts`
- `src/pages/api/products/[id].ts`
- `src/pages/api/products/[id]/history.ts`
- `src/pages/api/customers.ts`
- `src/pages/api/customers/[id].ts`
- `src/pages/api/customers/[id]/ledger.ts`
- `src/pages/api/customers/[id]/ledger/debt.ts`
- `src/pages/api/customers/[id]/ledger/payment.ts`
- `src/pages/api/ledger/[entryId].ts`

Square brackets are literal Astro route characters. In PowerShell use
`-LiteralPath` when reading them.

### Database, assets, and tests

- `db/schema.sql`
- `scripts/db-push.mjs`
- `public/favicon.ico`
- `public/favicon.svg`
- `tests/admin-auth.test.ts`
- `tests/auth-http.test.ts`
- `tests/customer-ledger-service.test.ts`
- `tests/ledger.test.ts`
- `tests/pricing.test.ts`
- `tests/product-service.test.ts`
- `tests/security-headers.test.ts`
- `tests/tooling-config.test.ts`

---

## 27. Exact File Manifest by Phase

This is the file allow list. **Modify** paths exist. **Create** paths are approved
proposals. Delete candidates cannot be removed until the specified proof exists.

### 27.1 Phase 0 — scope and baseline

**Modify:**

- `VENDARA_ADMIN_ONLY_PWA_PLAN.md` — record confirmed decisions only.

**Create:** none.

Read `AGENTS.md`, all current routes/components/tests, `package.json`,
`astro.config.mjs`, `.env.example`, and `db/schema.sql`. Do not modify runtime code.

### 27.2 Phase 1 — security and integrity baseline

**Modify:**

- `src/lib/api.ts`
- `src/lib/client/api.ts`
- `src/lib/auth/admin.ts`
- `src/lib/auth/http.ts`
- `src/lib/security/headers.ts`
- `src/middleware.ts`
- `src/lib/validation.ts`
- `src/lib/services/customer-ledger.ts`
- `src/lib/services/products.ts`
- `src/lib/server/ledger-repository.ts`
- `src/lib/server/products-repository.ts`
- `src/lib/server/customers-repository.ts`
- `src/pages/api/products.ts`
- `src/pages/api/products/[id].ts`
- `src/pages/api/products/[id]/history.ts`
- `src/pages/api/customers.ts`
- `src/pages/api/customers/[id].ts`
- `src/pages/api/customers/[id]/ledger.ts`
- `src/pages/api/customers/[id]/ledger/debt.ts`
- `src/pages/api/customers/[id]/ledger/payment.ts`
- `src/pages/api/ledger/[entryId].ts`
- `src/components/app/CustomerLedgerPanel.tsx`
- `src/components/app/AdminConsole.tsx`
- `src/components/app/AdminLogin.tsx`
- `src/pages/admin.astro`
- `tests/admin-auth.test.ts`
- `tests/auth-http.test.ts`
- `tests/customer-ledger-service.test.ts`
- `tests/product-service.test.ts`
- `tests/ledger.test.ts`
- `tests/security-headers.test.ts`

**Create:**

- `src/lib/server/logger.ts`
- `tests/api-security-contract.test.ts`
- `tests/repository-transactions.test.ts`
- `tests/private-cache-policy.test.ts`
- `tests/api-error-safety.test.ts`

`src/pages/api/ledger/[entryId].ts` must stop accepting `PUT` and hard `DELETE`.
Return `405` with `Allow` until Phase 7 proves the route can be deleted. Do not create
or query schema-backed void behavior until Phase 2 adds the required columns.

### 27.3 Phase 2 — migrations, idempotency, and money safety

**Modify:**

- `package.json`
- `package-lock.json`
- `db/schema.sql`
- `scripts/db-push.mjs`
- `.env.example`
- `src/lib/env.server.ts`
- `src/lib/db/client.ts`
- `src/lib/validation.ts`
- `src/lib/domain/ledger.ts`
- `src/lib/types.ts`
- `src/lib/services/customer-ledger.ts`
- `src/lib/server/ledger-repository.ts`
- `src/lib/server/customers-repository.ts`
- `src/lib/server/formatters.ts`
- `src/pages/api/customers/[id]/ledger/debt.ts`
- `src/pages/api/customers/[id]/ledger/payment.ts`
- `src/components/app/CustomerLedgerPanel.tsx`
- `src/lib/client/api.ts`
- `tests/customer-ledger-service.test.ts`
- `tests/ledger.test.ts`
- `tests/tooling-config.test.ts`
- `vitest.config.ts`

**Create:**

- `db/migrations/0001_current_schema_baseline.sql`
- `db/migrations/0002_ledger_integrity_and_voiding.sql`
- `db/migrations/0003_ledger_idempotency.sql`
- `scripts/db-migrate.mjs`
- `src/lib/domain/money.ts`
- `src/pages/api/ledger/[entryId]/void.ts`
- `tests/migration-runner.test.ts`
- `tests/money.test.ts`
- `tests/ledger-idempotency.test.ts`
- `tests/ledger-void.test.ts`
- `tests/integration/migrations.test.ts`
- `tests/integration/ledger-repository.test.ts`

Do not add an ORM or migration framework. Verify the installed Neon driver's current
transaction API through official documentation. The runner must support safe baseline
adoption for an existing database and refuse an apparent production target unless an
explicit human-approved production flag is present.

### 27.4 Phase 3 — owner interface simplification

**Modify:**

- `src/components/app/AdminConsole.tsx`
- `src/components/app/AdminLogin.tsx`
- `src/components/app/AppTopBar.tsx`
- `src/components/app/ProductManager.tsx`
- `src/components/app/CustomerManager.tsx`
- `src/components/app/CustomerLedgerPanel.tsx`
- `src/lib/client/api.ts`
- `src/lib/types.ts`
- `src/styles/global.css`
- `src/layouts/BaseLayout.astro`
- `src/pages/admin.astro`
- `tests/tooling-config.test.ts`

**Create:**

- `src/components/app/ConnectionStatus.tsx`
- `src/pages/api/summary.ts` — only after defining and testing the exact response.
- `src/lib/server/summary-repository.ts` — only if the summary endpoint is retained.
- `tests/admin-console.test.ts`
- `tests/owner-workflows.test.ts`
- `tests/summary-api.test.ts` — only if the summary endpoint is retained.

Do not rename the six existing app components. Record unused UI primitives as Phase 7
candidates; do not delete them during UI changes.

### 27.5 Phase 4 — installable PWA

**Approved dependency:** `@vite-pwa/astro`. Add Workbox packages only if current
official installation instructions explicitly require them.

**Modify:**

- `package.json`
- `package-lock.json`
- `astro.config.mjs`
- `src/layouts/BaseLayout.astro`
- `src/pages/admin.astro`
- `src/components/app/AdminConsole.tsx`
- `src/components/app/AppTopBar.tsx`
- `src/lib/auth/client.ts`
- `src/styles/global.css`
- `tests/tooling-config.test.ts`

**Create:**

- `src/components/app/PwaUpdatePrompt.tsx`
- `src/lib/pwa/cache-policy.ts`
- `src/lib/pwa/use-pwa-state.ts`
- `src/pages/offline.astro`
- `tests/pwa-cache-policy.test.ts`
- `tests/pwa-manifest.test.ts`
- `public/icons/icon-192x192.png`
- `public/icons/icon-512x512.png`
- `public/icons/icon-maskable-512x512.png`
- `public/icons/apple-touch-icon-180x180.png`

Use `public/favicon.svg` as the visual source. Do not invent a new logo. If it cannot
produce legible maskable assets, stop for an approved source. Do not create a static
manifest when the integration generates one. Do not create a manual service worker
when the selected `generateSW` mode generates it.

### 27.6 Phase 5 — integration, E2E, accessibility, performance, and health

**Approved development dependency:** `@playwright/test`.

**Modify:**

- `package.json`
- `package-lock.json`
- `vitest.config.ts`
- `tsconfig.json` — only if test types require it.
- `astro.config.mjs` — only for measured performance corrections.
- `src/lib/env.server.ts`
- `src/lib/server/customers-repository.ts`
- `src/lib/server/products-repository.ts`
- `src/lib/server/ledger-repository.ts`
- `src/pages/api/products.ts`
- `src/pages/api/customers.ts`
- `src/pages/api/customers/[id]/ledger.ts`
- `db/schema.sql` — only for a verified index represented by a new migration.
- `README.md`

**Create:**

- `src/pages/api/health.ts`
- `playwright.config.ts`
- `vitest.integration.config.ts`
- `tests/integration/api-auth.test.ts`
- `tests/integration/products-repository.test.ts`
- `tests/integration/customers-repository.test.ts`
- `tests/integration/health.test.ts`
- `tests/e2e/owner-login.spec.ts`
- `tests/e2e/products.spec.ts`
- `tests/e2e/customer-ledger.spec.ts`
- `tests/e2e/pwa-offline.spec.ts`
- `tests/e2e/pwa-update.spec.ts`
- `tests/e2e/accessibility.spec.ts`

If a query index is proven necessary, create
`db/migrations/0004_query_indexes.sql`; never rewrite an applied migration. Choose one
lint/format policy before installing tooling; do not add both Biome and
ESLint/Prettier.

### 27.7 Phase 6 — CI/CD and production readiness

**Modify:**

- `package.json`
- `package-lock.json`
- `.env.example`
- `.gitignore`
- `README.md`
- `VENDARA_ADMIN_ONLY_PWA_PLAN.md`

**Create:**

- `.github/workflows/ci.yml`
- `contexts/runbooks/deployment.md`
- `contexts/runbooks/database-migrations.md`
- `contexts/runbooks/database-backup-restore.md`
- `contexts/runbooks/owner-recovery.md`
- `contexts/runbooks/incident-response.md`

Vercel firewall rules, environment values, Neon branching/backups, deployment
protection, and uptime monitoring are external actions. Document them, but do not
claim completion without platform evidence.

### 27.8 Phase 7 — cleanup and durable documentation

**Modify:**

- `README.md`
- `VENDARA_ADMIN_ONLY_PWA_PLAN.md`
- `package.json`
- `package-lock.json`
- `.env.example`

**Create:**

- `contexts/decisions/0001-admin-only-serverless-pwa.md`

**Conditional delete candidates after `rg`, tests, typecheck, and build prove safety:**

- `src/pages/api/auth/login.ts`
- `src/pages/api/auth/logout.ts`
- `src/pages/api/ledger/[entryId].ts`
- `scripts/db-push.mjs`
- unused files under `src/components/ui/`
- unused dependencies confirmed by imports and build output.

Historical documents may receive a “Superseded” header but must not be deleted
without separate user approval. Do not create another top-level plan.

---

## 28. Decisions Composer Must Not Invent

Phase 0 must record these before affected implementation begins:

| Decision | Recommended default | Blocks |
|---|---|---|
| Store timezone | `Asia/Manila` | Phases 2–6 |
| Recovery identity | One optional recovery credential, same owner role | Auth runbook |
| Overpayments | Reject amounts above current positive balance | Payment transaction/tests |
| Voided-entry display | Hidden by default; available through “Show voided” | Ledger UI/API |
| Repeat void | `409 Conflict` | Void route/tests |
| Idempotency transport | `Idempotency-Key` UUID header | Phase 2 |
| Duplicate key response | Return original logical success result | Phase 2 |
| Summary endpoint | Keep only if its exact actionable fields are approved | Phase 3 |
| Integration database | Disposable Neon branch or isolated non-production database | Phase 5/CI |
| Auth E2E | Dedicated test identity/branch; never production owner | Phase 5/CI |
| Lint/format tool | Biome (formatter + organize imports on scoped paths; `npm run lint`) | Phase 5–6 |

Other constraints:

- Keep the existing `admin_users` table name; “Owner” is user-facing terminology.
- Changing physical money columns from `numeric` to integer is out of scope.
- A public health endpoint must expose only `ok`/`degraded`, timestamp, and request
  ID—never provider, database, owner, migration, or stack details.
- Build CSP from actual same-origin and configured Neon Auth requirements; do not
  paste a generic policy that breaks sign-in.
- Do not fabricate repository-based Vercel rate limiting. Platform rules require
  actual platform configuration and verification.

---

## 29. Cursor Composer Phase Prompt

Use this once per phase:

```text
Execute Phase <PHASE> of VENDARA_ADMIN_ONLY_PWA_PLAN.md only.

Executor: Cursor Composer 2.5.
Architecture is fixed: Astro SSR + React + Vercel Functions + Neon Auth +
Neon PostgreSQL. Vendara is one-store, owner-only, online-first, and an
installable PWA. Do not add another runtime platform or infrastructure service.

Before editing:
1. Read AGENTS.md completely.
2. Read Section 7.3, the selected phase, and Sections 24–29 completely.
3. Open every required .agents/skills/<skill>/SKILL.md.
4. Run git status --short and preserve existing/untracked user changes.
5. Verify every existing path in the phase manifest.
6. Return a short implementation plan naming exact files and tests.

Rules:
- Modify/create only paths allowed for Phase <PHASE>.
- Do not rename/move files or invent endpoints, components, tables, dependencies,
  abstractions, or services.
- Follow TDD: failing test, minimal implementation, refactor, verification.
- Use parameterized SQL and immutable data transformations.
- Do not deploy, run production migrations, change external platform settings,
  commit, or push.
- Stop and report evidence if a Section 24.3 stop condition occurs.

Verification:
- Run focused tests for each red/green cycle.
- Run npm test.
- Run npm run coverage and report all four metrics.
- Run npm run typecheck.
- Run npm run build.
- Run phase-specific migration, integration, E2E, PWA, accessibility, or benchmark
  checks.
- Perform the Section 25 review sequence.

Completion report:
- Outcome.
- Exact files modified, created, and deleted.
- Tests added/changed.
- Commands and actual pass/fail results.
- Coverage percentages.
- Security/data-integrity checks.
- Deviations and remaining risks.

Do not begin the next phase.
```

Completion checklist:

- [ ] Exactly one phase was executed.
- [ ] Every existing path was verified before editing.
- [ ] Every created path and dependency was approved for that phase.
- [ ] No unlisted rename, move, abstraction, or service was introduced.
- [ ] A failing test was observed before implementation.
- [ ] Unrelated and untracked worktree changes were preserved.
- [ ] Focused tests, full tests, coverage, typecheck, and build were actually run.
- [ ] External Neon/Vercel work was not claimed without evidence.
- [ ] No deployment, production migration, commit, or push occurred without approval.
- [ ] The executor stopped rather than guessed when facts diverged.

---

## 30. References

The implementation should verify exact package syntax against current documentation when work begins:

- Vite PWA Astro integration documentation (documentation hosting only; Netlify is
  not part of Vendara's runtime): <https://vite-pwa-org.netlify.app/frameworks/astro>
- Vite PWA service-worker update documentation (documentation hosting only; Netlify
  is not part of Vendara's runtime): <https://vite-pwa-org.netlify.app/guide/auto-update>
- Progressive Web App fundamentals: <https://web.dev/learn/pwa/>
- PWA installability and offline experience: <https://web.dev/articles/pwa-checklist>
- Core Web Vitals: <https://web.dev/articles/vitals>
- Vercel Astro deployment: <https://vercel.com/docs/frameworks/frontend/astro>
- Vercel caching behavior: <https://vercel.com/docs/caching>
