# Deployment runbook

Vendara ships as an Astro SSR application on **Vercel** with **Neon PostgreSQL** and **Neon Auth**.

## Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Preview | PR branches | Vercel preview URL | Review + smoke test |
| Production | `main` | Production domain | Store owner |

Configure the same variable **names** in Vercel (Preview + Production); use isolated values for non-production databases and auth where possible.

### Required environment variables

| Variable | Scope | Notes |
|----------|-------|--------|
| `DATABASE_URL` | Server | Neon pooled connection string |
| `PUBLIC_NEON_AUTH_URL` | Client + build | Neon Auth base URL (no secrets) |

Optional:

| Variable | Notes |
|----------|--------|
| `VENDARA_ALLOW_PRODUCTION_MIGRATE` | Set to `1` only when intentionally migrating a production-like URL (see database runbook) |

**Do not** commit `.env` or paste secrets into runbooks or tickets.

## Release flow

1. Open a PR against `main`.
2. Wait for **GitHub Actions CI** (`CI` workflow): format, typecheck, tests, coverage, build, PWA artifact check.
3. Open the **Vercel preview** deployment; smoke test sign-in, products, customer ledger, and PWA install/update if the change touches the shell.
4. Merge to `main` after approval and green checks.
5. Confirm **production** deploy on Vercel completes.
6. Run production smoke (below) and watch Vercel function errors for 15–30 minutes.

## Production smoke (manual)

- `GET /api/health` returns `status: "ok"` with `timestamp` and `requestId` only.
- Owner can sign in at `/admin`.
- Create/edit a product; confirm price list updates.
- Open a customer; record a small test debt and payment on a **non-production** branch when possible.
- Installed PWA: open app, confirm online indicator and no errors in console.

## Application rollback

1. In Vercel → Project → Deployments, find the last known-good production deployment.
2. **Promote to Production** (instant rollback of application code).
3. If the release included a **service worker** change, verify installed clients still load; owners may need to use the in-app **Update** prompt on a later fix.

Rollback does **not** reverse database migrations. See `database-migrations.md` and `database-backup-restore.md`.

## Vercel platform (external — configure in dashboard)

Document and verify in the Vercel project; do not assume these are enabled without checking:

- **Deployment Protection** for preview (and production if required).
- **Environment variables** scoped per environment.
- **Firewall / rate limiting** for abusive traffic (platform rules; verify in Vercel UI).
- **Uptime monitor** hitting `GET /api/health` on production (third-party or Vercel integration).

Record who verified each control and the date in your change ticket.

## CI secrets (GitHub)

| Secret | Used for |
|--------|----------|
| `CI_DATABASE_URL` | Optional Neon branch for integration tests in CI |
| `E2E_OWNER_EMAIL` | Optional dedicated test owner (never production) |
| `E2E_OWNER_PASSWORD` | Matching test password |

Without `CI_DATABASE_URL`, integration tests that need a database are skipped in CI.

## PWA update verification (two-version)

Before a release that changes the service worker:

1. Deploy version **A** to preview; install PWA from preview.
2. Deploy version **B** to the same preview; confirm **“A new version is ready”** appears and reload works.
3. With a dirty form open, confirm update warns before reload.
