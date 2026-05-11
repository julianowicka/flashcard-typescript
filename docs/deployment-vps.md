# VPS Deployment Notes

This app is intended to run as a Next.js application backed by PostgreSQL.

## Runtime Services

- Node.js app process running `next start`
- PostgreSQL database
- Reverse proxy, for example Nginx or Caddy
- Process manager, for example systemd or PM2
- Regular PostgreSQL backups

## Required Environment Variables

```text
DATABASE_URL
AUTH_SECRET
AUTH_TRUST_HOST
AUTH_GITHUB_ID
AUTH_GITHUB_SECRET
```

`AUTH_TRUST_HOST=true` is expected when Auth.js is deployed behind a reverse proxy on a VPS.

## First Deploy Flow

```bash
npm install
npm run db:generate
npm run db:deploy
npm run build
npm run start
```

For the first production database migration, create and review the migration locally or in staging before deploying it to the VPS.

## Database Backup Direction

Use PostgreSQL-native backups:

```bash
pg_dump "$DATABASE_URL" > flashcards-$(date +%F).sql
```

For production, automate backups and test restore regularly. Backups matter more than fancy schema design once real users start studying.

## Migration Rules

- Never edit a migration that has already been applied to production.
- Prefer additive migrations for product features.
- Use `deletedAt` for core learning content instead of hard deletion.
- Review destructive migrations manually before running `npm run db:deploy`.
- Keep `StudyProgress`, `StudySession`, and `StudyAnswer` separate from content tables.

## Reverse Proxy Notes

Forward these headers to Next.js/Auth.js:

```text
Host
X-Forwarded-Host
X-Forwarded-Proto
X-Forwarded-For
```

Use HTTPS in production before enabling real logins.
