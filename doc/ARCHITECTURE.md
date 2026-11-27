# MeritFlow architecture

The frontend calls the NestJS API. The API reads all dashboard data from Neon PostgreSQL through Prisma. Scheduled NestJS jobs call GitHub twice daily at 07:00 and 18:00 Asia/Dhaka, synchronizing organization members, repositories, and deduplicated contribution records. `lastSyncedAt` plus a fifteen-minute overlap makes incremental windows safe; unique `externalId` makes retries idempotent. Manual sync is protected by `x-admin-key` and an in-process concurrency lock.

```text
GitHub Organization -> SyncService -> Prisma -> Neon PostgreSQL
                                            ^
Next.js/Vercel -> REST API/Render ----------------+
```

`Member` records are sourced from the GitHub organization-members API. Administrators maintain only designation and additional Git emails. Contributions from authors outside synchronized organization membership are ignored because GitHub membership is the source of truth. Members no longer present in GitHub are deactivated without deleting contribution history. The production UI exposes empty states when no snapshot exists, and unique external IDs plus Prisma upserts make retries idempotent. Sync failures are recorded in `SyncLog` without replacing prior records.
