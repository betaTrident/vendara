# Implementation Plan: Vendara Reference-Accurate App Redesign

## Document status

- **Deliverable:** Planning only
- **Implementation status:** Not started
- **Primary visual references:** `src/components/app/assets/pages/`
- **Primary logo references:** `src/components/app/assets/logo/`
- **Supporting specification:** `DESIGN.md`
- **Target application:** Vendara public product landing page plus private sari-sari store administration PWA
- **Required themes:** Light, dark, and system preference
- **Required form factors:** Desktop, tablet, and mobile

This document is the execution plan for rebuilding the current Vendara interface so every implemented page closely matches its corresponding reference image while preserving the application's existing authentication, data-integrity, security, and PWA behavior.

The reference images define the visual result. `DESIGN.md` explains the intended design language and behavior. The live code, database schema, API contracts, and automated tests define what the application can truthfully and safely do. When these sources conflict, use the following order:

1. Security, financial integrity, and truthful application behavior
2. The page and logo reference images
3. The current committed product scope
4. `DESIGN.md`
5. Existing implementation details that are not part of a protected behavior contract

---

## 1. Goal

Redesign Vendara as a polished, responsive product site and administrative workspace that:

- Matches the supplied public landing-page reference while keeping all store data and administrative actions private.
- Matches the composition, hierarchy, spacing, navigation, controls, tables, forms, cards, and responsive behavior shown in each page reference.
- Uses the supplied Vendara ribbon logo instead of the current hand-written rose placeholder mark.
- Supports a complete light and dark theme without flashes, unreadable states, or hardcoded light-only surfaces.
- Gives every major workspace a stable, shareable URL and correct browser history.
- Preserves the current owner-only authentication boundary and server-side authorization.
- Uses real application data and honest empty states instead of hardcoded mock production data.
- Preserves ledger idempotency, void history, running-balance integrity, and online-only transaction safety.
- Meets the repository requirement for test-first delivery and at least 80% automated test coverage.

---

## 2. Non-goals and scope boundaries

The redesign must not:

- Reintroduce a public product catalog, marketplace, customer account, customer login, or customer-facing storefront. The supplied public marketing landing page is the only approved public product surface.
- Add stock-on-hand, warehouse, inventory quantity, purchase-order, or ecommerce checkout behavior.
- Use the reference PNGs as page backgrounds or ship screenshot slices in place of accessible UI.
- Copy the device frames, presentation-board shadows, or decorative mockup canvas surrounding the actual page designs.
- Hardcode the sample people, balances, dates, product counts, or transaction values from the references into production.
- Pretend an unsupported action succeeded while offline.
- Weaken owner authentication, API authorization, input validation, idempotency, audit history, or safe error handling.
- Migrate away from Astro, React, Tailwind CSS v4, or the existing shadcn/Radix component foundation.
- Introduce a chart, icon, theme, or routing dependency before confirming that the existing stack cannot provide the required result.
- Treat dark mode as a simple color inversion.
- Add visual decoration that is not present in, or strongly implied by, the references.

Product metadata visible in the references—such as SKU, barcode, category, contact number, and address—does not become approved functional scope merely because it appears in a mockup. Phase 0 must classify each field. Default to the live contract and a faithful layout with honest omissions; introduce a field only after explicit scope approval and complete schema, validation, repository, API, migration, and test work. Any approved metadata expansion must not grow into inventory management.

---

## 3. Verified current repository state

### 3.1 Stack

- Astro 6 routes and layout
- React 19 client island for the admin application
- Tailwind CSS 4
- shadcn/Radix UI primitives
- Neon PostgreSQL
- Better Auth-compatible client authentication
- Vitest unit/integration tests
- Playwright E2E tests
- Astro PWA/Workbox integration

### 3.2 Current UI routes

- `/` now contains a large in-progress public landing page implementation in `src/pages/index.astro`.
- `/admin` renders one `AdminConsole` React island.
- `/offline` renders a separate Astro offline page.
- The current admin workspace exposes Products and Customers as tabs.
- Price history is embedded inside `ProductManager`.
- Customer ledger, record purchase, and record payment are embedded inside `CustomerLedgerPanel`.

The current route model cannot accurately reproduce the references without separating those embedded work areas into distinct URL-backed page views.

The in-progress landing file is approximately 1,184 lines and mixes the entire page, a large inline `<style>` block, inline SVGs, content, and responsive rules. It also currently contains dead `#` links and offline transaction/synchronization claims that exceed the verified PWA contract. The redesign should preserve useful work but split it into focused components, semantic theme tokens, working destinations, and truthful copy.

### 3.3 Current visual system

`src/styles/global.css` currently:

- Defines a light Airbnb/rose-inspired palette.
- Declares a Tailwind `.dark` custom variant but does not define dark theme tokens.
- Uses light-only aliases such as white canvas, light hairlines, and rose primary actions.
- Contains no working theme preference, persistence, or no-flash initialization.

`AppTopBar.tsx` and `AdminLogin.tsx` currently use hand-written placeholder `V` SVG marks. None of the supplied brand assets are imported.

### 3.4 Current data contracts

The live contracts are smaller than the page references:

- Products currently expose name, cost price, selling price, note, timestamps, and active state at the database level.
- Customers currently expose name, note, balance, timestamps, and active state at the database level.
- Price history currently exposes old/new cost and selling prices plus the change timestamp.
- Ledger entries currently support debt and payment entries, product snapshots, quantities, notes, entry dates, idempotency, void metadata, and running balances.
- The overview summary currently exposes active product count, customer count, customers with balances, and total outstanding.

The references additionally show SKU, barcode, category, product media, customer phone/address, updated-by information, price-change notes, payment methods/references, line discounts, recent activity, aging buckets, charts, notifications, and richer metrics. These are data-contract gaps, not styling details.

### 3.5 Existing protected behavior

The redesign must retain:

- Owner session checks and owner-required API routes
- Parameterized database access
- Safe client error messages
- Private response cache headers
- Ledger mutation idempotency
- Auditable voided entries
- Running-balance calculations
- Unsaved-change protection during PWA updates
- Disabled transaction actions while offline
- Skip-to-content support and main landmarks

---

## 4. Reference inventory and page mapping

The reference directory currently contains ten presentation images. The nine admin/auth/offline boards are 1448 × 1086 composites, while `landing-page.png` is a tall full-page marketing composition. They show desktop layouts and, depending on the page, tablet and/or mobile adaptations. The application must reproduce the page UI—not the surrounding presentation canvas or device hardware.

| Reference | Target URL | Target page component | Current implementation source | Main gap |
|---|---|---|---|---|
| `landing-page.png` | `/` | `LandingPage` | Large in-progress `src/pages/index.astro` draft | Needs reference review, component extraction, dark mode, truthful copy, working links, and performance cleanup |
| `login-page.png` | `/admin` when unauthenticated | `AdminLoginPage` | `AdminLogin.tsx` | Current form is a compact centered card with placeholder branding |
| `dashboard.png` | `/admin/overview` | `OverviewPage` | Summary cards in `AdminConsole.tsx` | Missing shared shell, recent activity, quick actions, balance snapshot, and responsive dashboard |
| `products.png` | `/admin/products` | `ProductsPage` | `ProductManager.tsx` | Current form/table composition, fields, metrics, and mobile treatment do not match |
| `price-history.png` | `/admin/products/:productId/price-history` | `ProductPriceHistoryPage` | Price-history section in `ProductManager.tsx` | Needs dedicated view, richer audit data, chart, and responsive timeline/table |
| `customers.png` | `/admin/customers` | `CustomersPage` | `CustomerManager.tsx` | Current split list/ledger workspace must become a directory page with metrics and drawer |
| `ledger.png` | `/admin/customers/:customerId/ledger` | `CustomerLedgerPage` | `CustomerLedgerPanel.tsx` | Needs dedicated header, metrics, filters, chart, table/card views, and navigation |
| `record-purchase.png` | `/admin/transactions/purchase` | `RecordPurchasePage` | Purchase accordion in `CustomerLedgerPanel.tsx` | Needs dedicated multi-line transaction flow and balance preview |
| `record-payment.png` | `/admin/transactions/payment` | `RecordPaymentPage` | Payment accordion in `CustomerLedgerPanel.tsx` | Needs dedicated stepped form, method selection, summary, and recent payments |
| `offline.png` | `/offline` | `OfflinePage` | `src/pages/offline.astro` | Current page is only one plain card and lacks reference layout/actions |

### 4.1 Route rules

- Retain `/` as the public marketing route and refactor the in-progress implementation to match the supplied landing reference.
- Keep all product, customer, ledger, transaction, settings, and owner data behind authenticated `/admin` routes.
- The landing page may describe the product but must not fetch or embed private store data.
- Keep `/admin` as the authentication entry.
- After a successful session check:
  - Replace `/admin` with `/admin/overview`.
  - Preserve a valid originally requested internal admin destination.
  - Never accept an arbitrary external return URL.
- Use stable path-based navigation rather than tab-only state.
- Preserve query parameters only for safe UI state such as:
  - `?customer=<uuid>`
  - `?product=<uuid>`
  - approved search/filter values
- Validate all UUID path/query values before API use.
- Unknown admin paths must show a branded not-found state with a safe link back to Overview.
- Browser back/forward navigation must restore the correct page, selected record, and page title.

### 4.2 Recommended Astro/React routing shape

Keep authentication and application state centralized while allowing every reference page to have a stable URL:

```text
src/pages/
├── index.astro
├── admin.astro
├── admin/
│   └── [...path].astro
└── offline.astro
```

Both admin entry files should mount the same `AdminConsole`/`AdminApp` island. The catch-all route passes the current path to a small typed route resolver. Do not add a large third-party SPA router unless a verified limitation makes it necessary.

---

## 5. Visual fidelity contract

“Accurately match” means the implementation must preserve all of the following where visible:

- Page structure and section order
- Desktop sidebar and top bar proportions
- Mobile header and bottom navigation behavior
- Content widths and page gutters
- Grid and column ratios
- Page-title and supporting-copy hierarchy
- Typography scale, weight, line height, and numeric alignment
- Surface, border, radius, shadow, and divider logic
- Primary, secondary, destructive, success, warning, and informational color roles
- Icon scale and stroke consistency
- Search, filter, action, pagination, and form-control placement
- Card/table-to-mobile-card transformations
- Drawer, sheet, sticky action, and responsive stacking behavior
- Loading, empty, error, success, disabled, hover, active, and focus states
- Currency, date, time, percentage, and balance formatting
- Information priority at desktop, tablet, and mobile sizes

The implementation may differ from the mockups only when:

- A reference action is not supported by the product contract.
- Accessibility requires a visible or semantic adjustment.
- A mobile browser safe area requires additional spacing.
- Real content is longer than the example and needs resilient wrapping.
- Security or financial integrity requires additional confirmation or validation.

Any deliberate difference must be recorded in the phase evidence rather than silently drifting from the reference.

### 5.1 Dark-reference limitation

The page boards primarily specify light mode. `offline.png` supplies a substantial dark mobile treatment, and the logo directory supplies dedicated light- and dark-surface wordmarks, but there is no complete dark board for every page. Therefore:

- Light mode can be compared directly to the supplied page references.
- Dark mode must keep the exact same information architecture, geometry, density, typography hierarchy, component family, and responsive transformations.
- Dark colors and elevation are a documented semantic derivation, not a claim of direct pixel matching to a nonexistent source.
- Dark mode still requires complete screenshot, contrast, focus, chart, form, overlay, and logo review for every page.

### 5.2 Reference viewport set

Capture and review at minimum:

- Desktop: 1440 × 1024
- Small desktop/laptop: 1280 × 800
- Tablet portrait: 768 × 1024
- Tablet landscape: 1024 × 768
- Mobile narrow: 360 × 800
- Mobile reference: 390 × 844
- Mobile wide: 430 × 932

Test both light and dark mode at every breakpoint category. Test at 200% browser zoom and with enlarged text before sign-off.

---

## 6. Brand and logo implementation plan

### 6.1 Supplied logo classification

Visual inspection of the supplied files shows:

- `light-mode.svg`: horizontal ribbon symbol plus dark navy Vendara wordmark for light surfaces.
- `light-modee.svg`: a near-duplicate light-surface wordmark with slightly tighter intrinsic bounds; compare it against `light-mode.svg` and select one canonical optimized source rather than shipping both.
- `darkmode.svg`: horizontal ribbon symbol plus white Vendara wordmark for dark surfaces.
- `Untitled design (2).svg`: large icon/app-mark composition on a rounded light tile.
- `Untitled design (3).svg`: large stacked ribbon/wordmark composition.

The SVG files are unusually large because they contain rasterized artwork:

- Horizontal wordmarks are approximately 329–405 KB each.
- Square/stacked variants are approximately 1.95–2.23 MB.

Do not repeatedly render those large files in every navigation instance without optimization.

### 6.2 Brand component

Create a single typed component:

```text
src/components/app/branding/VendaraLogo.tsx
```

Required API:

```ts
type VendaraLogoProps = {
  variant: "horizontal" | "stacked" | "icon";
  theme?: "light" | "dark";
  priority?: boolean;
  className?: string;
};
```

Requirements:

- Use `light-mode.svg` on light surfaces.
- Use `darkmode.svg` on dark surfaces.
- Use an optimized icon derivative for compact headers, the PWA icon, and favicon where appropriate.
- Preserve the original aspect ratio.
- Never stretch, recolor, rotate, clip, or add a heavy shadow.
- Treat a decorative symbol as `aria-hidden`.
- Give a linked home logo an accessible name such as `Vendara overview`.
- Set explicit width/height or aspect ratio to avoid layout shift.
- Use `<picture>` or theme-controlled asset selection without downloading both large assets when avoidable.

### 6.3 Asset optimization

Before application wiring:

1. Preserve the original five files unchanged as source assets.
2. Inspect transparency, intrinsic bounds, and whitespace.
3. Produce optimized, visually lossless derivatives in a clearly named directory such as:

   ```text
   public/brand/
   ├── vendara-wordmark-light.svg
   ├── vendara-wordmark-dark.svg
   ├── vendara-mark.svg
   ├── vendara-app-icon-192.png
   └── vendara-app-icon-512.png
   ```

4. Remove unused embedded metadata and excess transparent canvas.
5. Compare optimized assets against the originals on both light and dark test surfaces.
6. Update PWA icons and favicons only after the icon-only derivative is confirmed.
7. Keep each commonly loaded wordmark small enough that it does not materially delay first render.

### 6.4 Logo acceptance criteria

- Light mode always uses a readable dark wordmark.
- Dark mode always uses a readable white wordmark.
- The ribbon gradient remains visually identical in both themes.
- Sidebar, mobile header, login, offline screen, favicon, and install metadata use the correct composition.
- No placeholder rose logo remains in `AppTopBar.tsx` or `AdminLogin.tsx`.
- No cumulative layout shift is caused by late logo sizing.

---

## 7. Theme system plan

### 7.1 Theme behavior

Support three settings:

- Light
- Dark
- System

Use System as the first-visit default. Persist a deliberate user choice locally. Do not store theme preference in a public URL or server log.

### 7.2 Required files

```text
src/components/app/theme/ThemeProvider.tsx
src/components/app/theme/ThemeMenu.tsx
src/lib/theme.ts
src/styles/global.css
src/layouts/BaseLayout.astro
```

### 7.3 No-flash initialization

Add a minimal inline bootstrap script in `BaseLayout.astro` that:

- Reads the stored theme safely.
- Resolves System with `prefers-color-scheme`.
- Applies `.dark` before first paint.
- Sets `color-scheme`.
- Updates the theme-color meta value.
- Handles unavailable or malformed storage without throwing.

The React provider must adopt the already-applied document state to avoid a hydration mismatch.

### 7.4 Token architecture

Replace hardcoded page colors with role-based tokens. Define complete light and dark sets for:

- App background
- Raised and sunken surfaces
- Sidebar and top bar
- Primary and secondary text
- Muted text
- Borders and dividers
- Inputs and disabled controls
- Brand blue/cyan/indigo/violet
- Success, warning, danger, and information
- Positive and outstanding balances
- Chart series and chart grid
- Focus ring
- Overlay and shadow

The light theme should follow the references: cool white canvas, very light blue-gray page background, navy text, restrained blue primary actions, cyan/teal success/support accents, violet financial accents, soft borders, and low-contrast elevation.

The dark theme should preserve the same hierarchy using tinted navy/blue-black surfaces rather than pure black. Cards, inputs, tables, sidebars, charts, hover states, disabled states, and overlays all need explicit dark values.

### 7.5 Theme constraints

- Minimum WCAG AA contrast for text and controls.
- Visible keyboard focus in both themes.
- Do not rely on color alone for debt/payment or success/error meaning.
- Avoid hardcoded `bg-white`, `text-black`, light-only hairlines, and literal hex values inside page components.
- Charts must define theme-aware lines, fills, grid, tooltip, and data-point focus states.
- Product media and avatars need appropriate fallback surfaces in both themes.
- Respect `prefers-reduced-motion`.

---

## 8. Shared responsive application shell

### 8.1 New shared components

```text
src/components/app/layout/AdminShell.tsx
src/components/app/layout/AdminSidebar.tsx
src/components/app/layout/AdminTopBar.tsx
src/components/app/layout/MobileHeader.tsx
src/components/app/layout/MobileBottomNavigation.tsx
src/components/app/layout/PageContainer.tsx
src/components/app/layout/PageHeader.tsx
src/components/app/layout/StoreStatusCard.tsx
src/components/app/layout/InstallAppCard.tsx
src/components/app/navigation/admin-navigation.ts
```

### 8.2 Desktop shell

Match the references with:

- A persistent left sidebar near 240–260 px.
- Correct full horizontal logo at the top.
- Active navigation using a pale blue surface, blue icon/text, and clear selection.
- Store connection/status card near the bottom.
- Store identity/settings summary.
- Optional PWA install card only when installation is actually available.
- A sticky top bar containing global search, notification entry, user avatar/name/role, theme menu, and account actions.
- Main content constrained to a readable maximum width without reproducing the presentation-board outer shadow.

### 8.3 Tablet shell

- Collapse the sidebar into a drawer.
- Keep a compact brand header.
- Stack contextual right panels below the main content when width is insufficient.
- Reduce metric grids to two columns.
- Preserve readable tables only where the reference does; otherwise switch to cards.

### 8.4 Mobile shell

- Use a compact top application bar.
- Use a safe-area-aware bottom navigation with no more than five primary items.
- Recommended primary items: Overview, Products, Customers, Ledger, More.
- Put Price History, Record Purchase, Record Payment, Offline status, theme, and account actions in More or contextual navigation.
- Keep the primary transaction action sticky when the reference shows it.
- Never allow the bottom navigation to cover content, toasts, or submit controls.

### 8.5 Global search and notifications

The reference shows search and notifications, but the current app does not have complete cross-entity search or notification contracts.

Implement in this order:

1. Build the visual shell with truthful disabled/limited behavior.
2. Add keyboard shortcut handling only when the search dialog is functional.
3. Search only authorized product/customer data.
4. Do not expose customer balances in browser history, analytics, or public caches.
5. Do not show a fake unread notification count.

---

## 9. Page-by-page redesign specification

## 9.0 Public landing page

**Reference:** `src/components/app/assets/pages/landing-page.png`  
**Primary files:** `src/pages/index.astro`, `src/components/marketing/*`, `src/components/app/branding/VendaraLogo.tsx`

Purpose:

- Explain Vendara clearly to sari-sari store owners and approved administrators.
- Provide a safe entry to the admin sign-in experience.
- Present the product without exposing real product, customer, ledger, balance, or owner data.

Required sections:

1. Marketing header with the light-surface logo and anchor navigation
2. Hero using the “Private store administration, made simpler.” hierarchy
3. Product-value summary and primary/secondary calls to action
4. Private, offline/PWA, and installability trust points
5. Feature grid covering price management, customer accounts, credit purchases, payments, ledgers, and the PWA
6. Three-step workflow
7. Product-screen previews
8. Private/internal-use trust section
9. Installable PWA section
10. Final call to action
11. Compact legal/support footer

Implementation rules:

- Build the page with semantic HTML and reusable marketing components; do not ship the reference image or a dashboard screenshot as one inaccessible page background.
- Use optimized, purposeful preview media derived from approved assets only where needed.
- Preview content must be deterministic demonstration content that is clearly marketing/demo material, never live store data.
- Replace unsupported claims such as offline transaction synchronization with truthful copy describing the actual PWA behavior.
- “Open Admin Demo,” “Request Access,” “Get Started,” and “View Screens” must lead to real, safe destinations or be revised/omitted. Do not ship dead `#` controls.
- `/admin` remains the canonical owner sign-in destination.
- Do not expose a demo account or credentials in client code.
- If Request Access is retained, design and approve its real backend/contact flow separately with validation, rate limiting, spam protection, and privacy copy.
- Add an accurate title, description, canonical URL, social metadata, and structured product/organization data without unverifiable claims.
- Preserve the reference’s restrained white/blue hierarchy in light mode and create a role-equivalent navy dark theme without changing the section order.
- On mobile, collapse navigation accessibly, preserve concise hero copy and a visible primary action, stack the workflow, and keep preview text legible.
- Keep the page fast with responsive images, explicit dimensions, lazy-loaded below-the-fold media, local fonts, and no multi-megabyte source logo in the critical path.

Required states:

- Light
- Dark
- System theme
- Mobile navigation open/closed
- PWA install eligible/ineligible
- Reduced motion
- No-JavaScript baseline with readable content and a working `/admin` link

## 9.1 Admin login

**Reference:** `src/components/app/assets/pages/login-page.png`  
**Primary files:** `src/components/app/AdminLogin.tsx`, `src/components/app/branding/VendaraLogo.tsx`, `src/styles/global.css`

Desktop:

- Build the split composition shown in the reference.
- Left: brand lockup, concise store-admin explanation, three real product benefits, sari-sari illustration area, and secure private-access notice.
- Right: centered sign-in card with persistent field labels, password reveal, remember-me behavior only if supported safely, password recovery entry only if implemented, primary sign-in action, verification action, and administrators-only notice.
- Use the correct light wordmark.

Tablet/mobile:

- Remove the large illustration panel.
- Center the brand above a compact single-column form.
- Keep full-width actions, clear error/status messaging, and safe-area padding.

Behavior:

- Preserve the current password and email-verification flow.
- Keep verification status visible and announced.
- Do not hide server errors inside visual-only toast messages.
- If “Remember me” or “Forgot password” is not implemented, do not ship a dead control just to match the image.
- Loading must disable duplicate submission without hiding the button label context.

Required states:

- Default
- Submitting
- Invalid credentials
- Verification required
- Verification sent
- OTP entry
- Verified; sign in again
- Temporary server error
- Offline

## 9.2 Overview

**Reference:** `src/components/app/assets/pages/dashboard.png`  
**Target component:** `src/components/app/pages/OverviewPage.tsx`

Required sections:

1. Page title, greeting, and current date/week context
2. Active Products metric
3. Customers with Unpaid Balances metric
4. Total Outstanding Amount metric
5. Recent Activity
6. Quick Actions
7. Customer Balances Snapshot
8. PWA install prompt when eligible

Implementation notes:

- Keep metric colors semantic and restrained.
- Make Quick Actions navigate to real destinations.
- Derive recent activity from authorized price-history, customer, and ledger data.
- Derive aging buckets from real transaction dates and balances.
- Provide an accessible table/list equivalent for the balance chart.
- On mobile, use compact single-column metric rows and a safe, readable quick-action grid.
- Never use the reference’s sample counts or names as production fallbacks.

## 9.3 Products

**Reference:** `src/components/app/assets/pages/products.png`  
**Current source:** `src/components/app/ProductManager.tsx`  
**Target component:** `src/components/app/pages/ProductsPage.tsx`

Required sections:

1. Page heading and description
2. Product search
3. Filters
4. Add Product primary action
5. Total Products, Recently Updated, Highest Markup, and Low Markup metrics
6. Desktop table
7. Mobile product cards
8. Pagination
9. Add/edit contextual panel

Refactor:

- Split the 582-line `ProductManager.tsx` into focused product form, metrics, table, mobile-card, filters, and empty-state components.
- Use a right-side panel on desktop and a full-height sheet/drawer on small screens.
- Preserve edit and delete behavior.
- Keep destructive confirmation.
- Keep markup calculations centralized in the domain pricing utilities.
- Add SKU, barcode, category, and product-media fields only after schema/API support exists.
- Do not add inventory quantity.
- Product images require a safe upload/storage decision; use a semantic placeholder mark until that decision is implemented.

## 9.4 Product price history

**Reference:** `src/components/app/assets/pages/price-history.png`  
**Target component:** `src/components/app/pages/ProductPriceHistoryPage.tsx`

Required sections:

1. Back to Products
2. Product identity and current price summary
3. Total changes, latest update, and average markup
4. Time-range control
5. Selling/cost price trend
6. Desktop history table
7. Mobile chronological timeline/cards
8. Load-more or pagination control

Behavior:

- Validate the product UUID before fetching.
- Handle missing/deactivated products.
- Extend the existing price-history API rather than fetching all products client-side.
- Preserve price values as numeric financial data and format only at the UI boundary.
- If “changed by” and notes are introduced, source them from authenticated server context; never trust arbitrary client actor names.
- Give the chart a text summary and keyboard-readable data table.

## 9.5 Customers

**Reference:** `src/components/app/assets/pages/customers.png`  
**Current source:** `src/components/app/CustomerManager.tsx`  
**Target component:** `src/components/app/pages/CustomersPage.tsx`

Required sections:

1. Search
2. Filters
3. Add Customer primary action
4. Total, Unpaid, Fully Paid, and Highest Outstanding metrics
5. Desktop directory table
6. Mobile customer cards
7. Pagination
8. Add/edit contextual panel
9. Direct actions: View Ledger, Record Purchase, Record Payment, Edit

Refactor:

- Remove the permanently embedded ledger from the directory page.
- Keep selection and actions URL-backed.
- Add phone and address/barangay only through validated contracts and a migration.
- Mask or minimize personal information wherever the reference does not need full detail.
- Keep balances prominent but do not make color the only signal.
- Preserve confirmation and error handling for destructive/customer status actions.

## 9.6 Customer ledger

**Reference:** `src/components/app/assets/pages/ledger.png`  
**Current source:** `src/components/app/CustomerLedgerPanel.tsx`  
**Target component:** `src/components/app/pages/CustomerLedgerPage.tsx`

Required sections:

1. Back to Customers
2. Customer identity/contact summary
3. Current balance
4. Record Purchase and Record Payment actions
5. Total Purchases, Total Payments, Current Balance, Last Activity
6. Type/date filters
7. Transaction table or mobile transaction cards
8. Balance-over-time chart
9. Transaction summary
10. Clear explanation that a positive balance means the customer owes the store

Refactor:

- Split the current 757-line component into ledger header, metrics, filters, table/cards, chart, summary, and correction/void controls.
- Preserve newest-first ordering.
- Preserve voided entries as auditable records.
- Keep running-balance calculations server-authoritative or derived from a verified ordered contract.
- Do not hide the existing correction/void feature merely because it is absent from the presentation reference; place it in a safe overflow/detail action.
- Export must not be shown until there is a secure, tested export implementation.

## 9.7 Record credit purchase

**Reference:** `src/components/app/assets/pages/record-purchase.png`  
**Current source:** purchase accordion in `CustomerLedgerPanel.tsx`  
**Target component:** `src/components/app/pages/RecordPurchasePage.tsx`

Required sections:

1. Customer selector
2. Current outstanding balance
3. Product lines
4. Selling price
5. Quantity stepper
6. Optional line discount
7. Line total
8. Add/search/browse product controls
9. Purchase summary
10. New balance preview
11. Optional notes
12. Review notice
13. Primary confirmation action

Integrity requirements:

- Reuse existing idempotency protection.
- Compute totals from server-validated product prices and quantities.
- Never trust a client-submitted line total or resulting balance.
- If discounts are introduced, add an explicit bounded discount contract and store the applied value in the ledger item snapshot.
- Show the exact balance effect before confirmation.
- Disable the action offline.
- Prevent duplicate submission.
- Keep product and customer selection accessible on touch devices.

## 9.8 Record payment

**Reference:** `src/components/app/assets/pages/record-payment.png`  
**Current source:** payment accordion in `CustomerLedgerPanel.tsx`  
**Target component:** `src/components/app/pages/RecordPaymentPage.tsx`

Required sections:

1. Customer selector
2. Customer summary and current balance
3. Payment amount
4. Payment date and time
5. Payment method
6. Reference/notes
7. Previous balance, payment amount, and resulting balance
8. Recent payments
9. Cancel and confirmation actions

Integrity requirements:

- Preserve positive amount validation.
- Do not allow an accidental overpayment unless the domain explicitly supports credit balances.
- Introduce payment method/reference fields only through schema and API validation.
- Source the recorder identity from the authenticated server session.
- Reuse idempotency protection.
- Show the resulting balance before submission.
- Disable submission offline.

## 9.9 Offline

**Reference:** `src/components/app/assets/pages/offline.png`  
**Primary files:** `src/pages/offline.astro`, `src/lib/pwa/cache-policy.ts`, `src/lib/pwa/use-pwa-state.ts`

Desktop/tablet:

- Render inside the shared shell only when a safe cached shell/session context is available.
- Center the illustration/message/actions composition.
- Show truthful connection status.

Mobile:

- Use the dark branded full-screen treatment shown in the reference.
- Use the correct dark-mode wordmark.
- Respect all safe-area insets.
- Provide high-contrast Try Again, Go to Last Available View, and Offline Tips actions only when each action works.

Behavior:

- Try Again checks connectivity and retries safely.
- Last Available View must point only to an approved locally cached administrative route.
- Offline Tips must open real guidance, not a dead control.
- Never cache private API responses broadly.
- Never queue a financial transaction unless a separate reliable, secure queue design is approved.
- Announce reconnection and return control to the user; do not discard unsaved form input silently.

---

## 10. Supporting data-contract work

Accurate layout must not be achieved with fake fields. Add only the data necessary for the approved references.

### 10.1 Candidate migration

Create a forward-only migration after repository/schema review:

```text
db/migrations/0004_reference_ui_metadata.sql
```

Candidate nullable fields:

- Product: SKU, barcode, category, media reference
- Customer: contact number, address/barangay
- Price history: change note and authenticated actor reference
- Ledger payment: payment method and external/internal reference
- Ledger line item: discount snapshot
- Ledger activity: exact occurrence timestamp if the current date-only contract is insufficient

Before adding fields:

- Confirm uniqueness and nullability rules.
- Confirm whether barcode/SKU uniqueness is global or store-scoped.
- Use constraints for bounded enums and non-negative money values.
- Avoid destructive backfills.
- Keep existing rows valid.
- Update `db/schema.sql` and migration tests.

### 10.2 API/repository changes

Likely affected files:

```text
src/lib/types.ts
src/lib/validation.ts
src/lib/server/products-repository.ts
src/lib/server/customers-repository.ts
src/lib/server/ledger-repository.ts
src/lib/server/summary-repository.ts
src/pages/api/products.ts
src/pages/api/products/[id].ts
src/pages/api/products/[id]/history.ts
src/pages/api/customers.ts
src/pages/api/customers/[id].ts
src/pages/api/customers/[id]/ledger.ts
src/pages/api/customers/[id]/ledger/debt.ts
src/pages/api/customers/[id]/ledger/payment.ts
src/pages/api/summary.ts
```

Rules:

- Validate every new field with Zod at the boundary.
- Keep authorization server-side on every private endpoint.
- Use parameterized queries.
- Obtain actor identity from the authenticated session.
- Never accept a client-calculated balance as authoritative.
- Keep error messages useful but non-sensitive.
- Add pagination/filter limits to list/history endpoints.
- Avoid N+1 queries for dashboard activity, aging data, and metrics.
- Keep private data non-cacheable unless an explicit secure offline policy approves it.

---

## 11. Component architecture

Target organization:

```text
src/components/app/
├── AdminConsole.tsx
├── auth/
│   └── AdminLoginPage.tsx
├── branding/
│   └── VendaraLogo.tsx
├── layout/
│   ├── AdminShell.tsx
│   ├── AdminSidebar.tsx
│   ├── AdminTopBar.tsx
│   ├── MobileHeader.tsx
│   ├── MobileBottomNavigation.tsx
│   ├── PageContainer.tsx
│   └── PageHeader.tsx
├── navigation/
│   ├── admin-navigation.ts
│   └── use-admin-route.ts
├── pages/
│   ├── OverviewPage.tsx
│   ├── ProductsPage.tsx
│   ├── ProductPriceHistoryPage.tsx
│   ├── CustomersPage.tsx
│   ├── CustomerLedgerPage.tsx
│   ├── RecordPurchasePage.tsx
│   └── RecordPaymentPage.tsx
├── products/
│   ├── ProductMetrics.tsx
│   ├── ProductFilters.tsx
│   ├── ProductTable.tsx
│   ├── ProductCardList.tsx
│   ├── ProductForm.tsx
│   └── PriceHistoryChart.tsx
├── customers/
│   ├── CustomerMetrics.tsx
│   ├── CustomerTable.tsx
│   ├── CustomerCardList.tsx
│   ├── CustomerForm.tsx
│   └── CustomerSummary.tsx
├── ledger/
│   ├── LedgerMetrics.tsx
│   ├── LedgerFilters.tsx
│   ├── LedgerTable.tsx
│   ├── LedgerCardList.tsx
│   ├── BalanceChart.tsx
│   └── LedgerSummary.tsx
├── transactions/
│   ├── CreditPurchaseForm.tsx
│   ├── ProductLineEditor.tsx
│   ├── PaymentForm.tsx
│   └── BalancePreview.tsx
├── states/
│   ├── PageSkeleton.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   └── NotFoundState.tsx
└── theme/
    ├── ThemeProvider.tsx
    └── ThemeMenu.tsx

src/components/marketing/
├── LandingHeader.astro
├── LandingHero.astro
├── FeatureGrid.astro
├── Workflow.astro
├── ScreenPreviews.astro
├── TrustSection.astro
├── PwaSection.astro
├── LandingCta.astro
└── LandingFooter.astro
```

This is a target boundary, not permission to create empty wrapper files. Create a component only when it owns a distinct behavior or independently testable visual unit. Keep functions below roughly 50 lines where practical and files below 800 lines.

---

## 12. Implementation phases

This is an executor playbook for one autonomous Cursor agent at a time (Composer 2.5 or Grok 4.5), not a request to attempt the whole redesign in one chat. The existing sections remain the product specification; this section controls execution order, context, skills, evidence, and stopping conditions.

### 12.1 Executor operating contract

1. Work on exactly one phase per fresh executor session. A phase may contain focused commits/checkpoints, but it must end at its stated gate before a later phase is opened.
2. Follow RED → GREEN → IMPROVE: add or correct focused tests, observe the expected failure when feasible, make the smallest complete change, then refactor only while tests remain green.
3. Read the current plan, `git status --short`, relevant source/tests, and the skill files listed for the active phase before editing. Existing uncommitted work belongs to the user; preserve it and do not revert it.
4. Load only the skills listed for that phase. If a listed skill is unavailable, record that fact and use the closest repository-native guidance; do not invent a replacement dependency or workflow.
5. Do not add scope from a reference image. An unsupported field/control remains absent or explicitly unavailable until its data-contract decision is approved.
6. Do not use a broad rewrite, unbounded search, or all-repository test loop during implementation. Keep reads and commands limited to the phase files and their immediate contracts.

### 12.2 Context-window budget and mandatory handoff

The following is an **operating ceiling**, intentionally lower than 170k tokens; it does not assume a specific advertised context limit for Composer 2.5 or Grok 4.5.

| Checkpoint | Maximum accumulated context | Required action |
|---|---:|---|
| Normal phase work | 90k tokens | Continue only within the active phase and its file allowlist. |
| Early handoff threshold | 110k tokens | Stop new exploration. Run focused verification, write the handoff receipt, and open a fresh session to finish the same phase. |
| Absolute execution stop | 130k tokens | Make no further implementation edits in that session. Handoff is mandatory. |
| Prohibited zone | 170k tokens and above | Never enter it. No phase should rely on a near-limit continuation. |

Each session handoff must be at most 2,500 tokens. Save it as `contexts/execution/app-reference-redesign/phase-<N>-receipt.md` (create that nested `contexts/` path only when implementation is approved) and include:

- active phase and its exact objective;
- completed work, changed files, and intentionally untouched files;
- commands run with pass/fail/blocker results;
- test state (including any RED result still outstanding);
- screenshots/reference regions reviewed and any deliberate deviations;
- current `git status --short` summary;
- the single next action and the phase gate still required.

The next session must begin by reading that receipt and verifying the stated working tree before continuing. A handoff is not a phase completion claim. Use this exact compact shape:

```md
# Phase <N> receipt — <name>

Status: complete | blocked | handoff-required
Commit: <hash or not committed>
Scope: <one sentence>
Files changed: <paths>
Protected contracts checked: <auth / ledger / PWA / cache / routing>
Verification:
- <command> — PASS | FAIL | BLOCKED: <exact reason>
Visual evidence:
- <route, viewport, theme, screenshot path>
Decisions/deviations:
- <approved decision or none>
Next phase/session:
- Read <paths only>; begin with <specific test or contract>.
```

### 12.3 Common phase evidence and stop rules

Every phase must record the compact receipt above. It must include the file list, focused tests, required screenshots, known deviations, and gate result. Do not create a new root-level tracking file.

Stop immediately and hand off when any of these is true:

- a protected auth, ledger, idempotency, void-history, private-cache, or redirect contract fails;
- a migration or data-contract decision is needed but is not explicitly approved by this plan's Phase 0 matrix;
- the phase has reached the 110k-token early-handoff threshold;
- an authoritative test/gate is blocked by unavailable local infrastructure;
- the change would require beginning a later phase.

For a blocked authoritative gate, record the exact command and blocker. Do not call the phase passed from static inspection or a subset of tests.

### Phase 0 — Baseline, contract decisions, and visual test harness

**Risk:** Medium  
**Dependencies:** None  
**Expected session budget:** 35–60k tokens  
**Load these skills:** `redesign-existing-projects`, `design-system`, `tdd-workflow`, `browser-qa`, `verification-loop`

**Allowed surface:** `APP-REFERENCE-REDESIGN-PLAN.md`, `DESIGN.md`, supplied page/logo assets, existing tests/configuration, and documentation or test-harness files only. Do not redesign production UI.

1. Re-verify routes, auth boundaries, PWA/cache behavior, APIs, ledger invariants, scripts, and dirty-worktree ownership.
2. Turn the ten references into a page/viewport checklist; measure only the page regions, never device frames or presentation boards.
3. Classify each reference field as supported, derivable, migration/API work, or excluded. Resolve the `light-mode.svg`/`light-modee.svg` canonical-source choice.
4. Establish deterministic fixture rules and the minimal Playwright viewport/theme projects needed by later phases: 360/768/1024/1440 widths plus explicit light/dark state. The current configuration's single desktop project is not sufficient.
5. Capture a before-state only if the local app and required safe test data are available.

**Gate:** Baseline `typecheck`, unit/integration tests, and build have recorded results; every reference and data gap has a decision; no production visual change has been made; later phases have a verified test command and reference target.

### Phase 1 — Semantic theme, brand assets, and shared primitives

**Risk:** Medium  
**Dependencies:** Phase 0  
**Expected session budget:** 45–70k tokens  
**Load these skills:** `design-system`, `frontend-patterns`, `accessibility`, `tdd-workflow`, `verification-loop`

**Allowed surface:** `src/styles/global.css`, `src/layouts/BaseLayout.astro`, theme/branding/shared UI components, approved optimized public brand assets, and targeted theme/branding tests.

1. Test theme resolution, persistence, system changes, bootstrap/no-flash behavior, and logo selection before wiring UI.
2. Replace light-only values with complete semantic light/dark tokens; include states, focus, overlays, charts, and safe-area behavior.
3. Implement the no-flash bootstrap, provider, theme menu, and a single typed `VendaraLogo` boundary.
4. Optimize official derived assets without modifying the supplied source files, then update PWA/favicons only after visual comparison.
5. Audit shared controls in keyboard, reduced-motion, forced-colors, light, and dark states.

**Gate:** No placeholder brand mark or theme flash remains; correct wordmark is selected in both themes; targeted tests and component accessibility checks pass; asset sizes/layout stability are recorded.

### Phase 2 — URL-backed admin shell and safe navigation

**Risk:** High  
**Dependencies:** Phase 1  
**Expected session budget:** 45–70k tokens  
**Load these skills:** `frontend-patterns`, `api-design`, `security-review`, `accessibility`, `tdd-workflow`, `verification-loop`, `browser-qa`

**Allowed surface:** `src/pages/admin.astro`, `src/pages/admin/[...path].astro`, `AdminConsole`, admin layout/navigation/state modules, and focused auth/route tests. Do not redesign login, the landing page, or domain data pages here.

1. Add failing tests for typed route resolution, safe internal return paths, direct entry, refresh, invalid paths, and browser back/forward behavior.
2. Build one shared authenticated shell with desktop sidebar/topbar and mobile header/bottom navigation.
3. Keep `/admin` as the entry that resolves to `/admin/overview` only after session validation.
4. Preserve auth API authorization, PWA unsaved-change/update hooks, skip-to-content behavior, and safe not-found handling.
5. Capture shell-only screenshots at desktop, tablet, and mobile widths without claiming unfinished page visual parity.

**Gate:** All admin paths remain owner-protected; external return paths are rejected; direct navigation/history/unknown-route behavior works; shell accessibility evidence exists; focused tests, typecheck, and build pass.

### Phase 3 — Admin sign-in and overview

**Risk:** High  
**Dependencies:** Phase 2  
**Expected session budget:** 45–70k tokens  
**Load these skills:** `redesign-existing-projects`, `frontend-patterns`, `backend-patterns`, `security-review`, `accessibility`, `tdd-workflow`, `browser-qa`

**Allowed surface:** `src/components/app/AdminLogin.tsx`, `src/components/app/pages/OverviewPage.tsx`, summary formatting/repository/API only if supported or approved, associated brand/shared components, and focused auth/summary/overview tests.

1. Characterize login and overview behavior, then write focused login-state, owner-privacy, summary, and responsive tests.
2. Rebuild the unauthenticated login composition against its page region, with truthful supported controls and safe server-error handling.
3. Add only the minimum authorized aggregate data required for the overview; avoid N+1 queries and preserve private cache headers.
4. Build the overview with real or defensibly derived data and honest loading/error/empty states.
5. Test that no owner data appears before a valid session and all actions navigate to implemented routes.

**Gate:** Login and overview references have light/dark responsive evidence; no owner data is exposed before session validation; all visible actions are real; summary/auth tests and focused security review pass.

### Phase 4 — Public landing page

**Risk:** High  
**Dependencies:** Phase 1  
**Expected session budget:** 55–80k tokens  
**Load these skills:** `redesign-existing-projects`, `frontend-patterns`, `accessibility`, `seo`, `tdd-workflow`, `browser-qa`, `verification-loop`

**Allowed surface:** `src/pages/index.astro`, only necessary `src/components/marketing/*`, shared brand components, and landing E2E/visual tests. Preserve user-owned in-progress work and do not add a private API/data path.

1. Characterize the in-progress landing implementation and write focused public-isolation, CTA, metadata, and responsive tests.
2. Extract the approximately 1,184-line landing page only where a component owns a distinct behavior or independently testable visual unit; preserve semantic Astro output.
3. Rebuild the landing composition against the actual page regions, never the presentation board/device frame.
4. Replace dead `#` links and unsupported offline-transaction/synchronization claims with working safe destinations and truthful copy.
5. Validate metadata, headings, landmarks, focus order, performance-sensitive assets, and full-height/above-the-fold screenshots.

**Gate:** All CTAs work; no private data reaches the public render path; no unsupported PWA claim remains; landing E2E, typecheck, and build pass; desktop/tablet/mobile light/dark visual evidence is recorded.

### Phase 5 — Products and price history

**Risk:** High  
**Dependencies:** Phases 2–3 and approved Phase 0 product-field decisions  
**Expected session budget:** 60–85k tokens  
**Load these skills:** `product-capability`, `api-design`, `backend-patterns`, `security-review`, `tdd-workflow`, `accessibility`, `browser-qa`

**Allowed surface:** product schema/migration only if approved, types/validation, product repository/API, product and history page/component boundaries, and targeted product tests.

1. Write failing validation, repository, migration (when approved), route, and UI behavior tests.
2. Add only approved metadata without invalidating existing products; do not add stock quantity or inventory behavior.
3. Split `ProductManager` by behavior into products directory, metrics, filters, form panel, responsive records, and dedicated history page.
4. Keep pricing/markup logic centralized; provide accessible history/trend data rather than a chart-only experience.
5. Test long names, missing media, zero cost, large values, empty history, invalid UUIDs, and destructive confirmation.

**Gate:** Product CRUD/history integration remains correct, money and markup values are verified, desktop/tablet/mobile light/dark evidence exists, and no unapproved inventory scope or unsafe field is present.

### Phase 6 — Customers and customer ledger

**Risk:** High  
**Dependencies:** Phases 2–3 and approved Phase 0 customer-field decisions  
**Expected session budget:** 60–85k tokens  
**Load these skills:** `api-design`, `backend-patterns`, `security-review`, `tdd-workflow`, `accessibility`, `browser-qa`

**Allowed surface:** customer/ledger schema and contracts when approved, repositories/APIs, customer and ledger pages/components, and customer/ledger tests. Do not extract transaction forms in this phase.

1. Add failing tests for validated contact metadata, directory behavior, filters, metrics, ordered running balances, voided records, privacy, and deep links.
2. Separate customer directory and ledger into URL-backed pages without changing ledger authority or ordering.
3. Build responsive directory and ledger views, including filters, cards/tables, metric summaries, and accessible text equivalents for charts.
4. Retain correction/void behavior in a safe secondary action; do not hide it because the reference omits it.
5. Exercise zero/large balances, void-only history, missing contact values, long names, no transactions, and invalid UUIDs.

**Gate:** Ledger integrity/idempotency/void tests remain green; private customer information is not public-cached or logged; all required reference evidence is captured; transaction creation remains unchanged until Phase 7.

### Phase 7 — Record credit purchase and record payment

**Risk:** Critical  
**Dependencies:** Phase 6  
**Expected session budget:** 60–85k tokens  
**Load these skills:** `security-review`, `api-design`, `backend-patterns`, `tdd-workflow`, `accessibility`, `browser-qa`, `verification-loop`

**Allowed surface:** approved ledger migration/contracts, ledger domain/service/repository/API code, transaction pages/components, and transaction tests only.

1. Establish RED tests for calculations, validation, idempotency, double submits, overpayment policy, discounts/method/reference fields (only if approved), offline behavior, and displayed balance summaries.
2. Extract the existing accordions into dedicated purchase/payment flows without duplicating or relocating server-authoritative ledger logic.
3. Keep totals, discounts, actor identity, and balances server-derived/validated; retain confirmation and error/retry behavior.
4. Match the forms responsively while maintaining labels, touch targets, keyboard operation, and clear balance-effect disclosure.
5. Verify retries, reconnects, and PWA updates cannot create a duplicate financial entry.

**Gate:** Financial unit, integration, and E2E tests pass; persisted and displayed balances agree; duplicates and offline false-success states are impossible; all financial reference views have light/dark responsive evidence; no Critical/High security finding remains.

### Phase 8 — Offline/PWA, global edge states, and content truthfulness

**Risk:** High  
**Dependencies:** Phases 2–7  
**Expected session budget:** 45–70k tokens  
**Load these skills:** `browser-qa`, `security-review`, `accessibility`, `tdd-workflow`, `verification-loop`

**Allowed surface:** offline page, PWA/cache/update code, shared state components, configuration, and targeted PWA/edge-state tests.

1. Write failing cache-policy, offline navigation, retry, last-safe-view, reconnection, update/unsaved-work, and private-response tests.
2. Rebuild the offline page against its desktop/tablet/mobile reference regions, including its dark mobile treatment and only working actions.
3. Normalize loading, empty, error, success, disabled, and not-found states across the completed pages without reopening their core features.
4. Confirm PWA assets do not precache large source logos or broadly cache private APIs.
5. Make copy concise, domain-specific, and truthful; remove any stale unsupported claims found in touched surfaces.

**Gate:** Offline/PWA tests pass; the page and all actions work truthfully; private caching is rejected; update/reconnect flows preserve unsaved work; accessibility evidence exists for state announcements and focus handling.

### Phase 9 — Release-candidate regression, security, and visual sign-off

**Risk:** High  
**Dependencies:** Phases 0–8  
**Expected session budget:** 50–75k tokens; split into verification-only fresh sessions if needed  
**Load these skills:** `ai-regression-testing`, `browser-qa`, `accessibility`, `security-review`, `verification-loop`, `benchmark`, `git-workflow`

**Allowed surface:** tests/configuration, narrowly scoped corrections found by verification, and existing project documentation such as `DESIGN.md`/`README.md`. Do not expand the feature set.

1. Run the full unit, integration, coverage, typecheck, build, and E2E gates in the documented order.
2. Capture all required page/theme/viewport evidence, including full-height and above-the-fold landing views. Compare against the correct page regions and record deliberate deviations.
3. Complete keyboard, screen-reader, contrast, 200% zoom, reduced-motion, touch-target, private-data, authorization, redirect, validation, cache, and PII review.
4. Measure bundle/asset size, route loading, layout shift, and avoidable rerenders. Fix only defects discovered by these checks.
5. Update existing documentation only for confirmed final architecture changes; do not create a duplicate root design document.

**Gate:** All authoritative commands pass; coverage is at least 80% across statements, branches, functions, and lines; no Critical/High security finding remains; every reference has signed-off evidence; no placeholder, dead control, unexplained deviation, or unverified blocked gate remains.

---

## 13. Testing strategy

Phase 0 must expand the current single-desktop Playwright configuration into the phase-required viewport/theme matrix before any page is declared visually complete. Vitest coverage remains a required quality gate, but its current coverage configuration excludes `src/components/**` and `src/pages/**`; page and component confidence must therefore come from focused E2E, accessibility, and visual evidence as well as domain/unit coverage. Do not misreport the coverage threshold as direct UI-component coverage.

### 13.1 Unit tests

Cover:

- Theme resolution and persistence
- Admin route parsing
- Safe internal return paths
- Currency/date/time/percentage formatting
- Metric derivation
- Markup calculation
- Aging-bucket calculation
- Balance-chart series generation
- Purchase line and discount calculation
- Payment balance preview
- Form schemas and boundary cases
- Logo asset selection

### 13.2 Integration tests

Cover:

- Owner authorization on every added/changed endpoint
- Product metadata CRUD
- Customer metadata CRUD
- Paginated product/customer lists
- Price-history audit data
- Overview activity/aging summary
- Ledger filters and running balances
- Purchase and payment persistence
- Actor identity from session
- Idempotent retries
- Private cache headers
- Forward migration from the current schema

### 13.3 E2E tests

Cover:

- Public landing navigation, calls to action, metadata, and private-data isolation
- Owner sign-in and email verification
- Light/dark/system theme selection and reload
- Desktop sidebar navigation
- Mobile bottom navigation
- Browser back/forward behavior
- Product create/edit/delete and price-history navigation
- Customer create/edit and ledger navigation
- Record purchase and resulting balance
- Record payment and resulting balance
- Validation and duplicate-submit prevention
- Offline handling and reconnection
- PWA update with clean and dirty forms
- Keyboard-only use
- Main landmarks and skip link
- Visual snapshots at the required viewport/theme matrix

### 13.4 Visual comparison method

The admin/auth/offline source PNGs are composite presentation boards, while the landing reference is a tall full-page composition. Do not compare a raw admin screenshot against an entire composite board. Instead:

1. Identify the page region for desktop/tablet/mobile without editing the source asset; compare the landing page both as a whole and by full-width section.
2. Capture the real application at the corresponding viewport.
3. Compare hierarchy, geometry, spacing, type, colors, controls, and responsive transformations side by side.
4. Use deterministic test data for stable screenshots.
5. Mask only truly nondeterministic content such as current time.
6. Require human review for large first-baseline snapshots.
7. Treat automated screenshot thresholds as regression protection, not proof of design quality.

---

## 14. Accessibility requirements

- Preserve one `<main id="main-content">` per page.
- Keep the skip link and replace stale `ia-*` classes with valid theme tokens.
- Use semantic landmarks for sidebar, header, content, and contextual panels.
- Ensure every icon-only action has an accessible name.
- Keep visible, persistent form labels.
- Associate help and error text with inputs.
- Announce loading, save success, errors, offline status, and reconnection appropriately.
- Use at least 44 × 44 px touch targets for primary mobile controls.
- Trap focus correctly in dialogs, sheets, and drawers.
- Restore focus when overlays close.
- Do not use tables as layout.
- Give data tables captions or accessible names and correct header associations.
- Give charts a text summary and equivalent data representation.
- Ensure debt/payment/success/error distinctions include text or icons, not color alone.
- Support keyboard navigation in menus, pagination, filters, date controls, quantity steppers, and mobile navigation.
- Honor reduced motion.
- Maintain readable layouts at 200% zoom without hidden actions or horizontal page scrolling.

---

## 15. Security and privacy requirements

- Preserve `requireOwner` on all private API routes.
- Validate all route/query IDs and all request bodies.
- Validate sort, filter, page, page-size, date-range, and search inputs.
- Use server-derived actor identity.
- Keep SQL parameterized.
- Keep write endpoints rate-limited according to project policy.
- Keep idempotency on purchase/payment mutations.
- Never trust client-calculated totals, discounts, or balances.
- Require confirmation for destructive actions and ledger corrections.
- Prevent open redirects in post-login return handling.
- Do not render arbitrary user HTML.
- Do not leak customer phone, address, balances, notes, or tokens into logs.
- Do not cache private API responses in a shared/public cache.
- Do not put sensitive values into URLs.
- Do not expose stack traces or database details to the client.
- Do not persist unsaved transaction data beyond what is explicitly needed.

---

## 16. Performance requirements

- Optimize the supplied logo files before broad reuse.
- Set image dimensions/aspect ratios to prevent layout shift.
- Lazy-load noncritical charts and contextual panels.
- Avoid fetching Products and Customers globally for pages that do not need them.
- Batch or aggregate dashboard metrics server-side.
- Paginate product, customer, history, and ledger lists.
- Debounce search while preserving accessible immediate feedback.
- Avoid N+1 metrics/activity queries.
- Memoize expensive derived chart/summary data where measurement shows value.
- Prefer CSS/SVG already available in the stack before adding a chart dependency.
- Keep mobile lists virtualized or paginated if real data size requires it; do not add virtualization preemptively.
- Verify the PWA precache does not balloon from original multi-megabyte logo source files.

---

## 17. Risks and mitigations

### Risk: Visual references imply unsupported business data

**Mitigation:** Complete the Phase 0 contract matrix. Add safe nullable schema/API support where approved. Otherwise use honest unavailable/empty states and record the deviation.

### Risk: A visual refactor breaks ledger correctness

**Mitigation:** Keep calculation and persistence logic in domain/service/repository layers. Refactor UI boundaries only after characterization tests pass.

### Risk: Route separation breaks the current authenticated session flow

**Mitigation:** Use one shared session gate and typed internal route resolver. Test direct entry, refresh, login return, logout, invalid path, and back/forward navigation.

### Risk: Dark mode looks like a low-quality inversion

**Mitigation:** Define role-based dark tokens for every surface and state, use the dedicated dark wordmark, and review every page in dark mode at each breakpoint.

### Risk: Large supplied logo SVGs hurt performance

**Mitigation:** Preserve originals, produce visually lossless derivatives, trim transparent bounds, and keep the large source files out of the critical runtime path.

### Risk: Composite references encourage copying device frames

**Mitigation:** Rebuild only the page UI visible inside each viewport. Validate at real browser viewport sizes.

### Risk: Screenshot tests become brittle

**Mitigation:** Use deterministic fixtures, mask only true nondeterminism, keep assertions focused by page/viewport/theme, and require human review for intentional baseline updates.

### Risk: Too many files are created without useful boundaries

**Mitigation:** Use the target component tree as a guide. Create a component only for a distinct behavior, reusable pattern, or independently testable region.

### Risk: Existing tests rely on Products/Customers tabs

**Mitigation:** Replace those selectors with stable URL and navigation contracts in the test-first phase. Preserve behavioral coverage rather than retaining obsolete tab markup.

### Risk: Mobile sticky controls overlap safe areas or navigation

**Mitigation:** Centralize safe-area spacing and bottom-navigation height tokens. Test actual narrow and tall mobile viewports.

---

## 18. Required implementation commands

Run focused commands during each phase, then the complete gate:

```powershell
npm run typecheck
npm run test
npm run test:integration
npm run coverage
npm run build
npm run test:e2e
```

If a command cannot run because credentials, database access, or the local server is unavailable:

- Record the exact command.
- Record the exact blocker.
- Do not describe that gate as passed.
- Continue only with checks that do not hide the blocked authoritative gate.

---

## 19. Definition of done

The redesign is complete only when:

- [ ] The public landing page matches `landing-page.png` across desktop, tablet, and mobile.
- [ ] Login matches `login-page.png` across desktop, tablet, and mobile.
- [ ] Overview matches `dashboard.png`.
- [ ] Products matches `products.png`.
- [ ] Product Price History matches `price-history.png`.
- [ ] Customers matches `customers.png`.
- [ ] Customer Ledger matches `ledger.png`.
- [ ] Record Credit Purchase matches `record-purchase.png`.
- [ ] Record Payment matches `record-payment.png`.
- [ ] Offline matches `offline.png`.
- [ ] Light mode uses the supplied light-surface wordmark correctly.
- [ ] Dark mode uses the supplied dark-surface wordmark correctly.
- [ ] The icon/stacked logo variants are optimized and used in the correct contexts.
- [ ] The public landing page is isolated from private data, and every admin page has a stable owner-only URL with working browser history.
- [ ] Desktop sidebar, tablet drawer, mobile header, and bottom navigation are consistent.
- [ ] All visible controls perform a real action or are explicitly unavailable.
- [ ] No sample reference data is hardcoded into production.
- [ ] No stock/inventory/public storefront scope was added.
- [ ] All loading, empty, error, success, disabled, offline, and not-found states are designed.
- [ ] Keyboard, screen-reader, contrast, zoom, reduced-motion, and touch-target checks pass.
- [ ] Auth, validation, idempotency, audit, PII, redirect, and caching checks pass.
- [ ] Unit, integration, E2E, and visual regression tests pass.
- [ ] Coverage is at least 80%.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] No Critical or High review finding remains.
- [ ] Each phase has light/dark responsive screenshot evidence, including full-page and above-the-fold landing captures.
- [ ] Any deliberate deviation from a reference is documented with its reason.

---

## 20. Execution hard stop

This file authorizes planning only. It does not authorize application, database, asset, or deployment changes.

When implementation is approved, execute one phase at a time. Do not begin a later phase merely because it appears in this document. A phase is complete only after its tests, visual review, security checks, and stated gate pass.
