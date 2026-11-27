# CollabCircle's Contribution Tracking Panel

MeritFlow is the technical project name for CollabCircle's Contribution Tracking Panel, an internal contribution-tracking and audit platform. It synchronizes GitHub activity into Neon PostgreSQL, applies deterministic contribution scoring, and serves database-first dashboards for leadership review, team recognition, profit-sharing, and vesting audits.

## Product capabilities

- Twice-daily GitHub synchronization at 07:00 and 18:00 Asia/Dhaka.
- Full historical backfills and protected manual sync controls.
- Merged PR, direct commit, issue, impact-bonus, bot-filtering, anti-double-counting, and daily-cap scoring rules.
- Admin-reviewed idea contributions linked to synchronized members and projects. Approved ideas use a capped 1/2/4/5-point adoption rubric; rejected and void ideas never affect public analytics.
- Period-aware dashboard, leaderboard, ranking, percentage shares, streaks, project breakdowns, member analytics, and activity timelines.
- Automatic GitHub organization-member synchronization with GitHub as the source of truth.
- Protected Admin Panel for team identity, repository governance, sync diagnostics, scoring configuration, and audit CSV exports.
- Idea Contributions workspace for recording, approving, rejecting, and soft-voiding project ideas without additional GitHub API requests.
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

- Team mapping: review GitHub-synchronized members and maintain only designation and additional commit emails.
- Sync & system: scheduled/manual sync, full backfill, sync logs, and scoring weights.
- Repositories: tracking toggles and individual repository resync.
- Idea contributions: create project-linked ideas, select synchronized members, review adoption level, approve/reject, and void while preserving audit history.
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
