# Phase 0 — Reference field contract matrix

Status: approved for later-phase gating  
Authority: Phase 0 of `APP-REFERENCE-REDESIGN-PLAN.md`  
Default rule: live schema/API wins; unsupported reference fields stay absent or explicitly unavailable until a later explicit migration approval.

## Classification legend

| Class | Meaning |
|---|---|
| `supported` | Present in live schema/API/UI contracts today |
| `derivable` | Can be computed from supported data without schema change |
| `migration` | Needs schema + validation + repository + API + tests; **not approved in Phase 0** |
| `excluded` | Out of product scope; never add for visual parity |

## Product fields

| Reference cue | Class | Decision |
|---|---|---|
| Name | `supported` | Keep |
| Cost price | `supported` | Keep |
| Selling price | `supported` | Keep |
| Note | `supported` | Keep |
| Active / inactive | `supported` | Keep |
| Created / updated timestamps | `supported` | Keep |
| Markup % | `derivable` | `(selling - cost) / cost` when cost > 0; honest empty when not |
| SKU | `migration` | Deferred — honest omission until approved migration |
| Barcode | `migration` | Deferred — honest omission until approved migration |
| Category | `migration` | Deferred — honest omission until approved migration |
| Product media / photo | `migration` | Deferred — use empty/fallback surface only |
| Stock / inventory quantity | `excluded` | Never |

## Customer fields

| Reference cue | Class | Decision |
|---|---|---|
| Name | `supported` | Keep |
| Note | `supported` | Keep |
| Active / inactive | `supported` | Keep |
| Balance | `derivable` | Server aggregate excluding voided entries |
| Contact number / phone | `migration` | Deferred — honest omission |
| Address / barangay | `migration` | Deferred — honest omission |
| Customer portal / public account | `excluded` | Never |

## Price history

| Reference cue | Class | Decision |
|---|---|---|
| Old / new cost | `supported` | Keep |
| Old / new selling | `supported` | Keep |
| Changed-at timestamp | `supported` | Keep |
| Change note | `migration` | Deferred |
| Updated-by actor | `migration` | Deferred — may later use authenticated session actor only |
| Trend chart | `derivable` | Chart from existing history points; accessible text equivalent required |

## Ledger / transactions

| Reference cue | Class | Decision |
|---|---|---|
| Debt (credit purchase) entries | `supported` | Keep |
| Payment entries | `supported` | Keep |
| Product snapshot + quantity | `supported` | Keep |
| Entry note | `supported` | Keep |
| Entry date | `supported` | Keep |
| Idempotency key | `supported` | Keep (API contract) |
| Void metadata | `supported` | Keep — retain even if reference omits |
| Running balance | `derivable` | Chronological walk excluding voided |
| Payment method | `migration` | Deferred |
| Payment reference | `migration` | Deferred |
| Line discount | `migration` | Deferred |
| Offline queued financial writes | `excluded` | Never without separate approved design |

## Overview / shell chrome

| Reference cue | Class | Decision |
|---|---|---|
| Active product count | `supported` | Summary API |
| Customer count | `supported` | Summary API |
| Customers with balances | `supported` | Summary API |
| Total outstanding | `supported` | Summary API |
| Recent activity feed | `derivable` | May compose from existing ledger/product events in later phases without new columns when feasible |
| Aging buckets | `derivable` | Prefer date-based derivation; no fake buckets |
| Global search results | `derivable` | Client/server search over supported entities only |
| Notifications inbox | `excluded` for Phase 0–3 | Treat as UI affordance only when empty/unavailable; no fake alerts |
| Charts | `derivable` | Theme-aware; never invent series |

## Auth / login / PWA

| Reference cue | Class | Decision |
|---|---|---|
| Email + password sign-in | `supported` | Neon Auth client |
| Remember-me | `excluded` unless Neon Auth already provides it safely | Do not invent cookie longevity |
| Password recovery | `excluded` until verified provider flow exists | No dead recovery link |
| Offline retry / install cues | `supported` | Truthful online-only transaction copy |

## Logo canonical source

| Asset | Role |
|---|---|
| `src/components/app/assets/logo/light-mode.svg` | **Canonical light-surface wordmark source** |
| `src/components/app/assets/logo/darkmode.svg` | **Canonical dark-surface wordmark source** |
| `src/components/app/assets/logo/light-modee.svg` | Near-duplicate; retain as source archive only — do not ship both |
| `Untitled design (2).svg` / `(3).svg` | Icon/stacked source candidates for optimized derivatives only |

Rationale: plan §6.2 requires `light-mode.svg` on light surfaces; `light-modee.svg` differs mainly by intrinsic bounds (~1 byte size delta). Phase 1 optimizes from the two canonical sources into `public/brand/`.

## Dirty-worktree ownership (do not revert)

| Path | Owner |
|---|---|
| `src/pages/index.astro` | User in-progress landing |
| `tests/e2e/landing-page.spec.ts` | User in-progress landing E2E |
| `src/components/app/assets/pages/landing-page.png` | User-supplied reference |
| `src/components/app/assets/logo/light-modee.svg` | User-supplied asset (archive after Phase 1) |
| `APP-REFERENCE-REDESIGN-PLAN.md` | Planning deliverable |
| `dev-dist/sw.js`, `dev-dist/workbox-*.js` | Generated PWA artifacts — ignore / do not hand-edit |

## Migration approval gate

No `0004_reference_ui_metadata.sql` work is approved by this matrix. Later phases that need SKU, barcode, category, media, phone, address, payment method/reference, discounts, or history notes must obtain an explicit follow-up approval before writing migrations.
