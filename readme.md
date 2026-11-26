# MeritFlow by CollabCircle

MeritFlow is an internal contribution-intelligence and audit platform for CollabCircle engineering teams. It synchronizes GitHub activity into Neon PostgreSQL, applies deterministic contribution scoring, and serves database-first dashboards for leadership review, team recognition, profit-sharing, and vesting audits.

## Product capabilities

- Twice-daily GitHub synchronization at 07:00 and 18:00 Asia/Dhaka.
- Full historical backfills and protected manual sync controls.
- Merged PR, direct commit, issue, impact-bonus, bot-filtering, anti-double-counting, and daily-cap scoring rules.
- Period-aware dashboard, leaderboard, ranking, percentage shares, streaks, project breakdowns, member analytics, and activity timelines.
- Unmapped contributor queue so no verified GitHub work is lost before identity mapping.
- Protected Admin Panel for team identity, repository governance, sync diagnostics, scoring configuration, unmapped-work recovery, and audit CSV exports.
- Responsive executive UI with an ivory canvas, ink typography, terracotta primary actions, teal status accents, sticky navigation, and a consistent footer.

## Technology

- Backend: NestJS, TypeScript, Prisma, Neon PostgreSQL, Octokit, scheduled jobs.
- Frontend: Next.js App Router, TypeScript, Tailwind CSS, Lucide icons.
- Hosting targets: Render for the backend and Vercel for the frontend.

## Local development

### Backend

Preserve the existing Neon credentials in `backend/.env`. Do not replace that file with the example file.

```powershell
cd backend
npm install
npx prisma generate
npx prisma db push
npm run start:dev
```

The API runs at `http://localhost:4000`. Swagger is available at `http://localhost:4000/api/docs`.

### Frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

The application runs at `http://localhost:3000`. Set `NEXT_PUBLIC_API_URL=http://localhost:4000/api` in `.env.local`.

## Admin workflow

Open `http://localhost:3000/admin` and authenticate with the configured `ADMIN_SECRET_KEY`. The Admin Panel provides:

- Team mapping: add/edit members, designation, department, GitHub username, multiple Git emails, active state, and leaderboard visibility.
- Sync & system: manual sync, full backfill, sync logs, scoring weights, and unmapped contributor assignment.
- Repositories: tracking toggles and individual repository resync.
- Audit export: last-month, current-year, and all-time CSV exports.

The admin key is held only in the browser session memory. Selecting **Sign out** clears the key and all loaded admin data from the page.

## Verification commands

```powershell
cd backend
npm run build
npm test -- --runInBand

cd ..\frontend
npm run lint
npm run build
```

## Repository structure

```text
backend/   NestJS API, Prisma schema, sync engine, scoring, tests
frontend/  Next.js dashboard, member/project views, Admin Panel
doc/       Architecture, scoring, deployment, UI/UX, requirements matrix
testing/   Test plan and release gates
```

## Documentation

- `doc/ARCHITECTURE.md` — data flow, caching, sync, and resilience.
- `doc/SCORING_RULES.md` — exact scoring and ranking rules.
- `doc/UI_UX.md` — visual system, page hierarchy, and interaction standards.
- `doc/DEPLOYMENT.md` — Render, Vercel, Neon, and post-deployment workflow.
- `testing/TEST_PLAN.md` — automated and manual acceptance checks.

## Security notes

Never commit `backend/.env`, `frontend/.env.local`, GitHub tokens, Neon credentials, or the admin secret. Use Render and Vercel secret environment variables in production.
