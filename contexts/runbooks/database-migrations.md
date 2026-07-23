# Database migrations runbook

Vendara uses **versioned SQL migrations** under `db/migrations/`, applied with:

```bash
npm run db:migrate:status
npm run db:migrate
```

(`db:migrate` loads `.env` via `--env-file`.)

## Before migrating

1. Confirm the target `DATABASE_URL` (preview branch vs production).
2. For production or production-like URLs, require explicit human approval before setting `VENDARA_ALLOW_PRODUCTION_MIGRATE=1`.
3. Prefer a **Neon branch** for risky changes; run migrations on the branch first, then merge branch or promote after validation.
4. Ensure CI migration tests passed on the PR (`tests/integration/migrations.test.ts` when `DATABASE_URL` is set).

## Applying migrations

**Preview / branch**

```bash
# .env points at Neon branch
npm run db:migrate:status
npm run db:migrate
```

**Production**

1. Announce maintenance window only if a long-running migration is expected (rare for this app).
2. Take a backup or ensure Neon PITR/backup is available (see `database-backup-restore.md`).
3. Set `VENDARA_ALLOW_PRODUCTION_MIGRATE=1` in the shell **only for the migrate command** if the guard applies.
4. Run `npm run db:migrate` from a trusted machine with production `DATABASE_URL`.
5. Deploy application code compatible with the new schema (usually merge after migrate, or deploy code that tolerates old + new schema per expand-and-contract).

## Rules

- **Never** edit a migration file that has already been applied in an environment; add a new file (e.g. `0004_...sql`).
- Prefer **backward-compatible** migrations: add nullable columns first, backfill, then constrain in a later migration.
- Do not combine destructive drops with the first PWA or major release without a separate approved plan.

## Failure handling

- If migrate fails mid-way, inspect `db/migrate` status output and Neon logs.
- Do not re-run blindly; fix forward with a new migration or restore from backup if data integrity is uncertain.

## Rollback

- **Preferred:** forward-fix with a new migration.
- **Reverse migration:** only if a tested down script exists and data loss is understood.
- **Restore:** see `database-backup-restore.md` for serious corruption or loss.
