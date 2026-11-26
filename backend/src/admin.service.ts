import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SyncService } from './sync.service';
@Injectable()
export class AdminService {
  constructor(private db: PrismaService, private sync: SyncService) {}
  members() { return this.db.member.findMany({ orderBy: { name: 'asc' } }); }
  createMember(data: any) { return this.db.member.create({ data }); }
  updateMember(id: string, data: any) { return this.db.member.update({ where: { id }, data }); }
  removeMember(id: string) { return this.db.member.update({ where: { id }, data: { isActive: false, isVisibleOnLeaderboard: false } }); }
  async repositories() { const rows = await this.db.repository.findMany({ orderBy: { name: 'asc' } }); return rows.map(row => ({ ...row, githubRepoId: row.githubRepoId.toString() })); }
  logs() { return this.db.syncLog.findMany({ orderBy: { executedAt: 'desc' }, take: 100 }); }
  trigger(full = false) { return this.sync.run('ADMIN_MANUAL', full); }
  triggerRepository(id: string, full = false) { return this.sync.run('ADMIN_MANUAL', full, id).then(result => ({ ...result, repositoryId: id })); }
  async assignUnmapped(id: string, memberId: string) { const identity = await this.db.unmappedContributor.findUnique({ where: { id }, include: { activities: true } }); if (!identity) throw new NotFoundException('Unmapped contributor not found'); await this.db.member.findUniqueOrThrow({ where: { id: memberId } }); const result = await this.db.$transaction(async tx => { for (const activity of identity.activities) await tx.contribution.upsert({ where: { externalId: activity.externalId }, create: { externalId: activity.externalId, type: activity.type, title: activity.title, url: activity.url, basePoints: activity.basePoints, impactBonus: activity.impactBonus, totalPoints: activity.totalPoints, additions: activity.additions, deletions: activity.deletions, occurredAt: activity.occurredAt, memberId, repositoryId: activity.repositoryId }, update: { memberId, totalPoints: activity.totalPoints, title: activity.title } }); await tx.unmappedContribution.deleteMany({ where: { unmappedContributorId: id } }); return tx.unmappedContributor.update({ where: { id }, data: { memberId } }); }, { timeout: 60_000 }); return { assigned: true, activitiesRecovered: identity.activities.length, contributor: result }; }
}
