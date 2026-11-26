# MeritFlow architecture

The frontend calls the NestJS API. The API reads all dashboard data from Neon PostgreSQL through Prisma. Scheduled NestJS jobs call GitHub twice daily at 07:00 and 18:00 Asia/Dhaka, upserting repositories and deduplicated contribution records. `lastSyncedAt` plus a fifteen-minute overlap makes incremental windows safe; unique `externalId` makes retries idempotent. Manual sync is protected by `x-admin-key` and an in-process concurrency lock.

```text
GitHub Organization -> SyncService -> Prisma -> Neon PostgreSQL
                                            ^
Next.js/Vercel -> REST API/Render ----------------+
```

`Member` identity mapping accepts a GitHub username or any configured Git email. Unknown authors are persisted in `UnmappedContributor` and exposed to administrators. The production UI exposes empty states when no snapshot exists, and unique external IDs plus Prisma upserts make retries idempotent. Sync failures are recorded in `SyncLog` without replacing prior records.
