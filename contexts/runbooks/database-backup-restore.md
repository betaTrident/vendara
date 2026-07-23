# Database backup and restore runbook

Vendara’s source of truth is **Neon PostgreSQL**. Application rollback on Vercel does not restore data.

## Backups (Neon)

Use Neon platform capabilities (verify in Neon console for your project):

- **Automatic backups** / point-in-time recovery (PITR) where enabled on the plan.
- **Branches** for pre-migration experiments (disposable copy of data).

Before risky migrations or production releases:

1. Create a **branch** from production, or confirm a recent backup/PITR window.
2. Record branch name or backup timestamp in the change ticket.

## When to restore

- Accidental destructive migration applied to production.
- Confirmed data corruption or loss.
- Security incident requiring known-good data state.

Prefer **forward fixes** for minor issues; restore is for serious cases.

## Restore procedure (high level)

Exact UI steps depend on Neon; typical flow:

1. **Stop writes** — enable maintenance mode or block owner access (communicate with owner).
2. In Neon, choose **Restore** / **PITR** to a time before the incident, or promote a known-good **branch** to primary (per Neon docs for your setup).
3. Update `DATABASE_URL` in Vercel production if the connection endpoint changes.
4. Redeploy or restart serverless functions if needed.
5. Run `npm run db:migrate:status` against the restored database; align code version with schema.
6. Production smoke test (see `deployment.md`).
7. Post-incident review (`incident-response.md`).

## Verification (required periodically)

At least once per quarter or before first production go-live:

1. Restore to a **non-production branch** from backup/PITR.
2. Point local or CI `DATABASE_URL` at that branch.
3. Run `npm run test:integration` and manual ledger smoke.

Document date, operator, and outcome in your ops log. Do not claim “restore tested” without this evidence.

## What not to put in backups tickets

- Full `DATABASE_URL` with password in chat or email.
- Owner PII exports unless required by policy.
