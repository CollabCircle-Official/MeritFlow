import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { activeStreak, dhakaDay, percentage, rank } from './scoring/scoring.engine';
import { nextSync, periodRange } from './date.util';

function ordinal(value: number): string {
  const suffix = value % 100 >= 11 && value % 100 <= 13 ? 'th' : ({ 1: 'st', 2: 'nd', 3: 'rd' } as Record<number, string>)[value % 10] || 'th';
  return `${value}${suffix}`;
}

function serializeRepository(repository: any) {
  return repository ? { ...repository, githubRepoId: repository.githubRepoId.toString() } : repository;
}

@Injectable()
export class AppService {
  constructor(private db: PrismaService) {}
  private range(period = 'current_month') { return periodRange(period); }
  private syncMeta(last: any, lastRepo: any) { return { lastSyncedAt: lastRepo?.lastSyncedAt || null, lastSyncStatus: last?.status || null, nextScheduledSync: nextSync().toISOString(), timezone: 'Asia/Dhaka' }; }
  async summary(period: string) {
    const where: any = { occurredAt: this.range(period), member: { isActive: true } };
    const [rows, repoCount, last, lastRepo] = await Promise.all([this.db.contribution.findMany({ where, include: { member: true } }), this.db.repository.count({ where: { isTracked: true } }), this.db.syncLog.findFirst({ orderBy: { executedAt: 'desc' } }), this.db.repository.findFirst({ where: { lastSyncedAt: { not: null } }, orderBy: { lastSyncedAt: 'desc' }, select: { lastSyncedAt: true } })]);
    const total = rows.reduce((s, x) => s + x.totalPoints, 0); const members = new Set(rows.map(x => x.memberId)); const prs = rows.filter(x => x.type === 'MERGED_PR').length; const commits = rows.filter(x => x.type === 'DIRECT_COMMIT').length; const grouped = rows.reduce((a: any, x) => { a[x.memberId] = (a[x.memberId] || 0) + x.totalPoints; return a; }, {}); const topId = Object.entries(grouped).sort(([, a]: any, [, b]: any) => b - a)[0]?.[0];
    return { totalPoints: Number(total.toFixed(2)), activeContributors: members.size, trackedRepositories: repoCount, mergedPrs: prs, commits, topPerformer: rows.find(x => x.memberId === topId)?.member || null, ...this.syncMeta(last, lastRepo) };
  }
  async leaderboard(period: string) {
    const rows = await this.db.contribution.findMany({ where: { occurredAt: this.range(period), member: { isActive: true, isVisibleOnLeaderboard: true } }, include: { member: true }, orderBy: { occurredAt: 'asc' } });
    const total = rows.reduce((s, x) => s + x.totalPoints, 0); const map = new Map<string, any>();
    for (const x of rows) { const m = map.get(x.memberId) || { member: x.member, totalPoints: 0, mergedPrs: 0, commits: 0, issues: 0, effectiveLines: 0, earliest: x.occurredAt, dates: [] }; m.totalPoints += x.totalPoints; m.mergedPrs += x.type === 'MERGED_PR' ? 1 : 0; m.commits += x.type === 'DIRECT_COMMIT' ? 1 : 0; m.issues += x.type.startsWith('ISSUE') ? 1 : 0; m.effectiveLines += x.additions + x.deletions * 0.5; m.earliest = x.occurredAt < m.earliest ? x.occurredAt : m.earliest; m.dates.push(x.occurredAt); map.set(x.memberId, m); }
    return rank([...map.values()]).map((x, i) => ({ ...x, rank: i + 1, rankLabel: ordinal(i + 1), totalPoints: Number(x.totalPoints.toFixed(2)), percentage: percentage(x.totalPoints, total), streak: activeStreak(x.dates), badge: i === 0 && period === 'last_month' ? 'Monthly Top Contributor' : null, dates: undefined }));
  }
  async projects(period = 'current_month') { const repos = await this.db.repository.findMany({ where: { isTracked: true }, include: { _count: { select: { contributions: true } }, contributions: { where: { occurredAt: this.range(period) }, select: { totalPoints: true } } }, orderBy: { name: 'asc' } }); return repos.map(r => ({ ...r, githubRepoId: r.githubRepoId.toString(), totalPoints: r.contributions.reduce((n, c) => n + c.totalPoints, 0), contributions: undefined })); }
  async project(id: string, period: string) { const rows = await this.db.contribution.findMany({ where: { repositoryId: id, occurredAt: this.range(period) }, include: { member: true }, orderBy: { occurredAt: 'desc' }, take: 100 }); const total = rows.reduce((s, x) => s + x.totalPoints, 0); const members: any = {}; for (const x of rows) { members[x.memberId] ??= { member: x.member, points: 0 }; members[x.memberId].points += x.totalPoints; } return { repositoryId: id, totalPoints: Number(total.toFixed(2)), members: Object.values(members).map((x: any) => ({ ...x, percentage: percentage(x.points, total) })), recent: rows }; }
  async member(id: string, period: string) { const rows = await this.db.contribution.findMany({ where: { memberId: id, occurredAt: this.range(period) }, include: { repository: true }, orderBy: { occurredAt: 'desc' }, take: 200 }); const total = rows.reduce((s, x) => s + x.totalPoints, 0); const byDay = rows.reduce((a: any, x) => { const d = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', weekday: 'long' }).format(x.occurredAt); a[d] = (a[d] || 0) + x.totalPoints; return a; }, {}); const byHour = rows.reduce((a: any, x) => { const h = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', hour12: false }).format(x.occurredAt); a[h] = (a[h] || 0) + x.totalPoints; return a; }, {}); const recent = rows.map(x => ({ ...x, repository: serializeRepository(x.repository) })); return { member: await this.db.member.findUnique({ where: { id } }), totalPoints: Number(total.toFixed(2)), projects: Object.values(rows.reduce((a: any, x) => { a[x.repositoryId] ??= { repository: serializeRepository(x.repository), points: 0 }; a[x.repositoryId].points += x.totalPoints; return a; }, {})).map((x: any) => ({ ...x, percentage: percentage(x.points, total) })), streak: activeStreak(rows.map(x => x.occurredAt)), activityByDayOfWeek: byDay, activityByTimeOfDay: byHour, timeline: rows.reduce((a: any, x) => { const d = dhakaDay(x.occurredAt); a[d] = (a[d] || 0) + x.totalPoints; return a; }, {}), recent }; }
  async timeline(period: string) { const rows = await this.db.contribution.findMany({ where: { occurredAt: this.range(period) }, select: { occurredAt: true, totalPoints: true } }); const values: any = rows.reduce((a: any, x) => { const d = dhakaDay(x.occurredAt); a[d] ??= { date: d, points: 0 }; a[d].points += x.totalPoints; return a; }, {}); return Object.values(values).sort((a: any, b: any) => a.date.localeCompare(b.date)); }
}
