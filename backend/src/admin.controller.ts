import { Body, Controller, Get, Headers, Param, Patch, Post, Query, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AdminService } from './admin.service';
import { PrismaService } from './prisma.service';
import { periodRange } from './date.util';
import { UpdateMemberDto } from './admin.dto';

@Controller('api/admin')
export class AdminController {
  constructor(private admin: AdminService, private db: PrismaService) {}
  private guard(key?: string) { if (!key || key !== process.env.ADMIN_SECRET_KEY) throw new UnauthorizedException('Invalid admin key'); }
  @Post('auth/verify') verify(@Headers('x-admin-key') key: string) { this.guard(key); return { valid: true }; }
  @Post('sync') sync(@Headers('x-admin-key') key: string, @Query('fullBackfill') full?: string) { this.guard(key); return this.admin.trigger(full === 'true'); }
  @Get('sync-logs') logs(@Headers('x-admin-key') key: string) { this.guard(key); return this.admin.logs(); }
  @Get('system-config') config(@Headers('x-admin-key') key: string) { this.guard(key); return this.db.systemConfig.upsert({ where: { id: 'default' }, create: { id: 'default', scoringWeights: {} }, update: {} }); }
  @Patch('system-config') updateConfig(@Headers('x-admin-key') key: string, @Body() body: any) { this.guard(key); return this.db.systemConfig.update({ where: { id: 'default' }, data: { orgName: body.orgName, syncMorningCron: body.syncMorningCron, syncEveningCron: body.syncEveningCron, scoringWeights: body.scoringWeights } }); }
  @Get('unmapped-contributors') unmapped(@Headers('x-admin-key') key: string) { this.guard(key); return this.db.unmappedContributor.findMany({ orderBy: { lastSeenAt: 'desc' } }); }
  @Patch('unmapped-contributors/:id/assign') assignUnmapped(@Headers('x-admin-key') key: string, @Param('id') id: string, @Body() body: { memberId: string }) { this.guard(key); return this.admin.assignUnmapped(id, body.memberId); }
  @Get('members') members(@Headers('x-admin-key') key: string) { this.guard(key); return this.admin.members(); }
  @Patch('members/:id') update(@Headers('x-admin-key') key: string, @Param('id') id: string, @Body() body: UpdateMemberDto) { this.guard(key); return this.admin.updateMember(id, body); }
  @Get('repositories') repositories(@Headers('x-admin-key') key: string) { this.guard(key); return this.admin.repositories(); }
  @Patch('repositories/:id') repository(@Headers('x-admin-key') key: string, @Param('id') id: string, @Body() body: any) { this.guard(key); return this.db.repository.update({ where: { id }, data: body }); }
  @Post('repositories/:id/sync') repositorySync(@Headers('x-admin-key') key: string, @Param('id') id: string, @Query('fullBackfill') full?: string) { this.guard(key); return this.admin.triggerRepository(id, full === 'true'); }
  @Get('export/csv') async csv(@Headers('x-admin-key') key: string, @Query('period') period = 'current_month', @Res() response: Response) {
    this.guard(key);
    const rows = await this.db.contribution.findMany({ where: { occurredAt: periodRange(period), member: { isActive: true } }, include: { member: true } });
    const grouped = new Map<string, any>();
    for (const row of rows) { const current = grouped.get(row.memberId) || { member: row.member, points: 0, mergedPrs: 0, commits: 0, issues: 0 }; current.points += row.totalPoints; current.mergedPrs += row.type === 'MERGED_PR' ? 1 : 0; current.commits += row.type === 'DIRECT_COMMIT' ? 1 : 0; current.issues += row.type.startsWith('ISSUE') ? 1 : 0; grouped.set(row.memberId, current); }
    const total = [...grouped.values()].reduce((sum, row) => sum + row.points, 0); const pct = (points: number) => total <= 0 ? 0 : Number((points / total * 100).toFixed(2));
    const output = ['member,githubUsername,meritPoints,percentage,mergedPrs,commits,issues', ...[...grouped.values()].map(x => [x.member.name, x.member.githubUsername, x.points.toFixed(2), pct(x.points).toFixed(2), x.mergedPrs, x.commits, x.issues].map(v => `"${String(v).replaceAll('"', '""')}"`).join(','))].join('\n');
    return response.header('Content-Type', 'text/csv').attachment(`meritflow-${period}.csv`).send(output);
  }
}
