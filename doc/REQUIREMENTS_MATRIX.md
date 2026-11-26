# Requirements verification matrix

| Area | Evidence | Status |
| --- | --- | --- |
| NestJS, Prisma, Neon, Render binding | `backend/package.json`, `backend/src/main.ts`, `backend/prisma/schema.prisma` | Verified |
| Dhaka cron schedule and incremental cache | `backend/src/sync.service.ts`, `backend/src/date.util.ts` | Verified in code; live organization backfill completed |
| Scoring, anti-double-counting, caps, bots, ranking | `backend/src/scoring/scoring.engine.ts`, `backend/src/sync.service.ts`, and scoring tests | Verified: 15 automated tests pass; live mapped-member scoring confirmed |
| Public REST API and Swagger | Controllers, `/api/docs`, live `/api/docs-json` smoke test | Verified: all public empty-state endpoints returned HTTP 200 |
| Protected admin sync, identity, repositories, exports | `backend/src/admin.controller.ts`, frontend admin tabs | Verified in build/runtime; Admin can add/edit members, map identities, toggle member/repository state, resync repositories, configure scoring, assign unmapped work, and export CSV |
| Empty-state and database-first dashboard | `frontend/app/page.tsx`, live public endpoint smoke test | Verified |
| Production frontend | Next App Router, Tailwind, Lucide icons, responsive views, shared header/footer, Admin sign-out | Verified: lint and build pass |
| Documentation and deployment files | `doc/`, `testing/`, root README/license files | Verified |
| Live organization synchronization | Full backfill against `CollabCircle-Official` | Verified: 8 repositories scanned successfully; `smri29` identity mapped and scored live; remaining GitHub identities await member mapping |
