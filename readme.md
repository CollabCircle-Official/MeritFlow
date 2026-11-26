# MeritFlow by CollabCircle

MeritFlow is an internal contribution analytics, leaderboard, and audit platform. It snapshots GitHub activity into Neon PostgreSQL and serves dashboards from the database rather than querying GitHub during page loads.

## Local setup

1. Copy `backend/.env.example` to `backend/.env`; preserve the existing `DATABASE_URL` and `DIRECT_URL` values and fill in GitHub/admin settings.
2. From `backend`, run `npm install`, `npx prisma generate`, `npx prisma db push`, then `npm run start:dev`.
3. From `frontend`, copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_API_URL=http://localhost:4000/api`, run `npm install`, then `npm run dev`.

Production builds are `npm run build` in each application. Deployment instructions are in `doc/DEPLOYMENT.md`.

Live GitHub synchronization requires a valid `GITHUB_TOKEN`; protected admin operations require `ADMIN_SECRET_KEY`.

## Admin workflow

Open `/admin` and authenticate with `ADMIN_SECRET_KEY`. From the Admin Panel you can add or edit members, assign GitHub usernames and multiple commit emails, activate or hide members, recover unmapped GitHub work, run scheduled or full syncs, configure scoring weights, govern repositories, resync individual repositories, inspect sync diagnostics, and export audit CSVs. Member profiles do not need to be supplied through source-code changes or chat.

## Structure

- `backend`: NestJS REST API, Prisma schema, scheduled GitHub sync, scoring engine.
- `frontend`: Next.js App Router dashboard, project/member views, admin controls.
- `doc`: architecture, scoring, and deployment specifications.
- `testing`: verification plan and test coverage map.
