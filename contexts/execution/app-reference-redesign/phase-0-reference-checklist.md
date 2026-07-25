# Phase 0 — Reference page / viewport checklist

Measure **page UI regions only**. Ignore device frames, presentation-board shadows, and decorative mockup canvas.

## Reference → route map

| Reference | Target URL | Primary viewports in boards | Notes |
|---|---|---|---|
| `landing-page.png` | `/` | Desktop + mobile tall | Public marketing only |
| `login-page.png` | `/admin` (unauthenticated) | Desktop + tablet/mobile | Client-gated |
| `dashboard.png` | `/admin/overview` | Desktop + tablet + mobile | After Phase 2 routing |
| `products.png` | `/admin/products` | Desktop + tablet + mobile | |
| `price-history.png` | `/admin/products/:id/price-history` | Desktop + tablet + mobile | |
| `customers.png` | `/admin/customers` | Desktop + tablet + mobile | |
| `ledger.png` | `/admin/customers/:id/ledger` | Desktop + tablet + mobile | |
| `record-purchase.png` | `/admin/transactions/purchase` | Desktop + tablet + mobile | |
| `record-payment.png` | `/admin/transactions/payment` | Desktop + tablet + mobile | |
| `offline.png` | `/offline` | Mobile dark treatment present | Light + dark required |

## Required capture matrix (later visual gates)

Widths from plan §5.2 / Phase 0 harness:

| Project key | Width | Height | Themes |
|---|---:|---:|---|
| `visual-mobile-360` | 360 | 800 | light, dark |
| `visual-tablet-768` | 768 | 1024 | light, dark |
| `visual-laptop-1024` | 1024 | 768 | light, dark |
| `visual-desktop-1440` | 1440 | 1024 | light, dark |

Additional review sizes (manual / later): 1280×800, 390×844, 430×932, 200% zoom, enlarged text.

## Measurement rules

1. Crop to the actual app chrome/content, not the surrounding presentation board.
2. Light mode compares directly to supplied boards.
3. Dark mode keeps identical IA/geometry; colors are semantic derivation (except offline dark mobile cue).
4. Do not ship reference PNGs as page backgrounds.

## Fixture rules (deterministic)

- Prefer seeded owner fixtures and synthetic domain data only.
- Never assert hardcoded sample people/balances from the reference PNGs as production truth.
- Theme must be set explicitly via `localStorage` key `vendara-theme` (`light` | `dark` | `system`) plus `colorScheme` / `emulateMedia` as needed.
- Visual projects run only under `tests/e2e/visual/` so functional E2E stays on the default desktop project.
