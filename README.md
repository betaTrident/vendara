# Vendara

Owner-only admin PWA for product pricing and customer credit ledgers (Astro, React, Neon, Vercel).

## Scripts

| Script | Purpose |
|--------|---------|
| `npm run dev` | Local development server |
| `npm run build` | Production build (PWA service worker + Vercel output) |
| `npm run preview` | Preview production build |
| `npm test` | Unit and API tests (Vitest) |
| `npm run test:integration` | Integration tests (`DATABASE_URL` / `CI_DATABASE_URL` for DB-backed cases) |
| `npm run test:e2e` | Playwright E2E (optional `E2E_OWNER_*` for signed-in flows) |
| `npm run coverage` | Unit tests with 80% thresholds on core `src/lib` |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | Biome format check (scoped paths) |
| `npm run format` | Biome format write (same paths) |

## Environment

Copy `.env.example` to `.env` and set `DATABASE_URL` and `PUBLIC_NEON_AUTH_URL`.

Install uses `.npmrc` (`legacy-peer-deps=true`) because `@vite-pwa/astro` peer range does not yet list Astro 6.

## Health

`GET /api/health` returns `{ status, timestamp, requestId }` only (no database or auth details). Use for uptime monitoring.

## PWA

Installable via `@vite-pwa/astro`. Private `/api/**` and auth traffic are network-only; offline UI is at `/offline`.

## CI/CD

GitHub Actions workflow: `.github/workflows/ci.yml`

On pull requests and `main` pushes: format check, typecheck, unit tests, integration tests (when `CI_DATABASE_URL` secret is set), coverage, build, PWA artifact verification, optional `npm audit`, and Playwright smoke tests.

Operational runbooks: `contexts/runbooks/` (deployment, migrations, backup/restore, owner recovery, incidents).

### GitHub secrets (repository settings)

| Secret | Purpose |
|--------|---------|
| `CI_DATABASE_URL` | Neon branch for integration tests in CI |
| `E2E_OWNER_EMAIL` | Dedicated test owner (not production) |
| `E2E_OWNER_PASSWORD` | Test owner password |

Vercel preview/production env vars and platform firewall/rate limits are configured in the Vercel dashboard — see `contexts/runbooks/deployment.md`.
