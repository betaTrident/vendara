# Incident response runbook

## Severity guide

| Level | Examples | Response |
|-------|----------|----------|
| S1 | Production down, data loss, auth bypass | Immediate; rollback or restore; notify owner |
| S2 | Partial outage, elevated 5xx, failed deploy | Rollback or hotfix within hours |
| S3 | Preview broken, non-prod test failure | Fix in PR; no production change |

## First 15 minutes

1. **Triage** — Vercel deployment status, `GET /api/health`, owner reports.
2. **Contain** — rollback app to last good Vercel deployment if the release caused the issue.
3. **Communicate** — tell the owner if they cannot use the store ledger.
4. **Preserve** — note time window, deployment ID, request IDs from errors (not customer data).

## Logs and monitoring

- **Vercel:** function logs, build logs, error rate.
- **Neon:** connection errors, query failures.
- **Health:** external uptime check on `/api/health` (no DB details in response).

Do not paste secrets, JWTs, or full customer ledgers into tickets.

## Common scenarios

### Bad deployment

- Promote previous production deployment (see `deployment.md`).
- If DB migration shipped with bad code, assess whether forward migration or restore is needed.

### Database connectivity

- Verify `DATABASE_URL` in Vercel production env.
- Check Neon incident status; scale/limits on Neon plan.

### Auth spike / lockout

- Distinguish owner mistake vs attack; rate limits are on **Vercel platform** (verify firewall rules in dashboard).
- Use `owner-recovery.md` for legitimate owner access.

### Suspected data breach

- Rotate Neon and Vercel credentials.
- Review access logs; involve Neon/Vercel support per your policy.
- Document in post-incident review.

## Post-incident

1. Timeline and root cause (blameless).
2. Actions: tests, runbook updates, platform config changes.
3. If PWA/service worker involved, verify two-version update test on preview.

## Contacts (fill in for your org)

| Role | Contact |
|------|---------|
| Operator | _ |
| Owner | _ |
| Neon support | Neon console |
| Vercel support | Vercel dashboard |
