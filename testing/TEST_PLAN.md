# MeritFlow test plan

## Automated

- `cd backend && npm test`: 15 passing tests covering scoring math, noise filtering, direct-commit diminishing returns, merge/short-issue/bot filters, zero-division safety, tie-break ranking, Dhaka period boundaries, streaks, incremental event deduplication, and REST API integration responses.
- The REST integration suite covers health and empty-state API responses; live Neon verification covers Prisma persistence, sync retries, API period boundaries, and unique contribution recovery.

## Manual acceptance

- Boot with an empty database and confirm dashboard empty state.
- Verify both Dhaka cron schedules and admin cooldown behavior.
- Import a PR workflow repository and confirm merged PR commits are not direct commits.
- Confirm bot, merge, lockfile-only, whitespace-only, and zero-change activity is excluded.
- Run two overlapping incremental syncs across the ninth same-day direct commit and confirm the persisted daily cap remains applied.
- Map multiple emails to one member and verify all contributions aggregate.
- Run a sync and verify GitHub organization members are imported automatically; edit only designation and additional emails.
- Force GitHub failure and verify a FAILED/PARTIAL SyncLog and unchanged prior snapshot.
- Verify CSV exports, responsive dashboard, project breakdown, member timeline, and admin repository/member controls.
- Verify the warm visual theme, sticky header/footer, keyboard focus states, responsive Admin layout, and Admin sign-out clearing the protected session.
- Live verification completed against `CollabCircle-Official`: repositories synchronized, organization members imported from GitHub, leaderboard/analytics populated, and CSV export returned HTTP 200.

## Release gates

- `cd backend && npm run build` succeeds.
- `cd backend && npm test -- --runInBand` passes all suites.
- `cd frontend && npm run lint` reports zero errors or warnings.
- `cd frontend && npm run build` succeeds with TypeScript and framework checks enabled.
