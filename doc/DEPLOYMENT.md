# Deployment

## Neon and Render backend

Create a Neon PostgreSQL database and retain the existing `DATABASE_URL` and `DIRECT_URL` values. In Render, create a Node web service rooted at `backend`, run `npm install && npx prisma generate && npx prisma db push && npm run build`, and start with `npm start`. Set `PORT` (Render supplies it), `GITHUB_TOKEN`, `GITHUB_ORG`, `ADMIN_SECRET_KEY`, `FRONTEND_URL`, and `TZ=Asia/Dhaka`. The service binds to `0.0.0.0` and exposes `/api/health`.

The local workspace keeps the configured `GITHUB_TOKEN` and `ADMIN_SECRET_KEY` private. For deployment, provide those values through Render's secret environment variables; never commit them to source control. Both are required before running a GitHub sync or using the protected admin panel.

## Vercel frontend

Import the repository into Vercel with root directory `frontend`. Build with `npm run build` and set `NEXT_PUBLIC_API_URL` to the Render API URL including `/api`. Add the Vercel origin to `FRONTEND_URL`.

Run an admin full backfill after the first deployment, then review the sync log and unmapped identities before relying on financial exports.

After deployment, use `/admin` to add the CollabCircle team members and map each GitHub username plus any secondary commit emails. Assign the queued unmapped identities from the same panel; their stored contributions will then appear in the leaderboard and audit exports.

The CSV export is aggregated per active member for the requested period and includes merit points, reconciled percentage share, merged PR count, direct commit count, issue count, department, and GitHub identity.
