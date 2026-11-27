import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { SyncService } from './sync.service';
@Injectable()
export class AdminService {
  constructor(private db: PrismaService, private sync: SyncService) {}
  members() { return this.db.member.findMany({ orderBy: { name: 'asc' } }); }
  updateMember(id: string, data: any) { return this.db.member.update({ where: { id }, data }); }
  async repositories() { const rows = await this.db.repository.findMany({ orderBy: { name: 'asc' } }); return rows.map(row => ({ ...row, githubRepoId: row.githubRepoId.toString() })); }
  logs() { return this.db.syncLog.findMany({ orderBy: { executedAt: 'desc' }, take: 100 }); }
  trigger(full = false) { return this.sync.run('ADMIN_MANUAL', full); }
  triggerRepository(id: string, full = false) { return this.sync.run('ADMIN_MANUAL', full, id).then(result => ({ ...result, repositoryId: id })); }
}
