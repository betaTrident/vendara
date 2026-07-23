# Owner recovery runbook

**Audience:** Store owner and operator supporting them.

Vendara has **one owner role** (database table `admin_users`; UI label “Owner”). There is no separate staff admin in this release.

## Sign-in problems

1. Confirm **internet** connection (app is online-first; offline mode does not sync data).
2. Use the correct **email and password** for Neon Auth (the account allow-listed in `admin_users`).
3. Try a private/incognito window to rule out stale cookies.
4. If password forgotten: use Neon Auth **password reset** flow configured for your Neon project (operator resets via Neon console if needed).

## Optional recovery credential

Product decision: **one optional second allow-listed email**, same owner role (not a different permission level). If enabled:

- Add the second user in Neon Auth and `admin_users` using your normal provisioning process.
- Store recovery credentials only with the owner (password manager), not in the repo.

## Session expired

- The app returns to the sign-in screen without showing stale private data.
- Sign in again; balances reload from the server.

## Lost or broken phone (PWA)

- Vendara is a web PWA; data is **not** stored in the install for ledger/products.
- On a new device, open the production URL and sign in.
- Old device: remove home-screen shortcut; no server action required unless device compromise is suspected (rotate password).

## Device compromise suspected

1. Rotate password in Neon Auth.
2. Review recent ledger entries in the app.
3. Operator: check Vercel/Neon access logs per `incident-response.md`.

## Operator cannot “unlock” ledger entries

- Ledger **void** and corrections follow product rules (void with reason; no silent deletes).
- Do not edit production data by hand except via documented migration/incident procedures.

## Escalation

- Application down: check Vercel status and `GET /api/health`.
- Data wrong: stop further entries, preserve evidence, follow `incident-response.md`.
