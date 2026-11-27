import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { Octokit } from '@octokit/rest';
import { PrismaService } from './prisma.service';
import { scoreActivity, isBot, isMeaningfulPatch, dhakaDay, ScoringWeights } from './scoring/scoring.engine';
import { dedupeExternal } from './sync.util';
import { dhakaDayRange } from './date.util';

type GitHubClient = InstanceType<typeof Octokit>;

@Injectable()
export class SyncService {
  private readonly log = new Logger(SyncService.name);
  private running = false;
  private lastManualStarted = 0;
  constructor(private db: PrismaService) {}

  @Cron('0 7 * * *', { timeZone: 'Asia/Dhaka' }) morning() { return this.run('CRON_MORNING'); }
  @Cron('0 18 * * *', { timeZone: 'Asia/Dhaka' }) evening() { return this.run('CRON_EVENING'); }

  private async syncOrganizationMembers(octokit: GitHubClient) {
    const discovered: any[] = await octokit.paginate(octokit.orgs.listMembers, { org: process.env.GITHUB_ORG, filter: 'all', per_page: 100 } as any);
    const activeLogins = new Set<string>();
    for (const member of discovered.filter(item => !isBot({ login: item.login, type: item.type }))) {
      const login = String(member.login);
      activeLogins.add(login.toLowerCase());
      const profile: any = await octokit.users.getByUsername({ username: login }).then(response => response.data).catch(() => null);
      const name = profile?.name?.trim() || login;
      await this.db.member.upsert({
        where: { githubUsername: login },
        create: { name, designation: null, githubUsername: login, gitEmails: [], avatarUrl: profile?.avatar_url || member.avatar_url || null },
        update: { name, avatarUrl: profile?.avatar_url || member.avatar_url || null, isActive: true, isVisibleOnLeaderboard: true },
      });
    }
    const existing = await this.db.member.findMany({ select: { id: true, githubUsername: true } });
    const departedIds = existing.filter(member => !activeLogins.has(member.githubUsername.toLowerCase())).map(member => member.id);
    if (departedIds.length) await this.db.member.updateMany({ where: { id: { in: departedIds } }, data: { isActive: false, isVisibleOnLeaderboard: false } });
    return { discovered: activeLogins.size, departed: departedIds.length };
  }

  private async findMember(login?: string, email?: string, repositoryId?: string) {
    if (!login && !email) return null;
    return this.db.member.findFirst({ where: { OR: [{ githubUsername: login || '' }, { gitEmails: { has: email || '' } }] } });
  }

  private async syncRepository(octokit: GitHubClient, githubRepo: any, full: boolean, onlyRepositoryId: string|undefined, weights: ScoringWeights) {
    const repo = await this.db.repository.upsert({ where: { githubRepoId: githubRepo.id }, create: { githubRepoId: githubRepo.id, name: githubRepo.name, fullName: githubRepo.full_name, description: githubRepo.description, isPrivate: githubRepo.private, defaultBranch: githubRepo.default_branch || 'main', isAvailable: true }, update: { name: githubRepo.name, description: githubRepo.description, isPrivate: githubRepo.private, defaultBranch: githubRepo.default_branch || 'main', isAvailable: true } });
    if (onlyRepositoryId && repo.id !== onlyRepositoryId) return 0;
    if (!repo.isTracked && !full && !onlyRepositoryId) return 0;
    const sinceDate = full || !repo.lastSyncedAt ? undefined : new Date(repo.lastSyncedAt.getTime() - 15 * 60 * 1000);
    const since = sinceDate?.toISOString();
    const prCommitShas = new Set<string>();
    let processed = 0;
    const pulls: any[] = dedupeExternal(since ? (await octokit.paginate(octokit.search.issuesAndPullRequests, { q: `repo:${process.env.GITHUB_ORG}/${githubRepo.name} is:pr is:merged updated:>=${since.slice(0, 10)}`, per_page: 100 } as any)).map((x: any) => ({ ...x, number: x.number, merged_at: x.pull_request?.merged_at })) : await octokit.paginate(octokit.pulls.list, { owner: process.env.GITHUB_ORG, repo: githubRepo.name, state: 'closed', per_page: 100 } as any));
    for (const pr of pulls) {
      const detail: any = await octokit.pulls.get({ owner: process.env.GITHUB_ORG, repo: githubRepo.name, pull_number: pr.number });
      const mergedAt = pr.merged_at || detail.data?.merged_at;
      if (!mergedAt || (sinceDate && new Date(mergedAt) < sinceDate) || isBot({ login: pr.user?.login, type: pr.user?.type })) continue;
      const commits: any[] = await octokit.paginate(octokit.pulls.listCommits, { owner: process.env.GITHUB_ORG, repo: githubRepo.name, pull_number: pr.number, per_page: 100 } as any);
      commits.forEach((commit: any) => prCommitShas.add(commit.sha));
      const member = await this.findMember(pr.user?.login, undefined, repo.id);
      const occurredAt = new Date(mergedAt); const additions = detail.data?.additions || pr.additions || 0; const deletions = detail.data?.deletions || pr.deletions || 0; const total = scoreActivity({ kind: 'pr', additions, deletions, weights }); const basePoints = weights.mergedPr ?? 4;
      if (!member) continue;
      await this.db.contribution.upsert({ where: { externalId: `pr_${pr.id}` }, create: { externalId: `pr_${pr.id}`, type: 'MERGED_PR', title: pr.title, url: pr.html_url, basePoints, impactBonus: total - basePoints, totalPoints: total, additions, deletions, occurredAt, memberId: member.id, repositoryId: repo.id }, update: { title: pr.title, totalPoints: total } }); processed++;
    }
    const issues: any[] = dedupeExternal(await octokit.paginate(octokit.issues.listForRepo, { owner: process.env.GITHUB_ORG, repo: githubRepo.name, state: 'all', per_page: 100, ...(since ? { since } : {}) } as any));
    for (const issue of issues.filter((item: any) => !item.pull_request)) {
      const issuePoints = weights.issue ?? 1; const openerBot = isBot({ login: issue.user?.login, type: issue.user?.type }); const opener = openerBot ? null : await this.findMember(issue.user?.login, undefined, repo.id);
      if ((issue.body || '').trim().length > 30 && opener) { const occurredAt = new Date(issue.created_at); await this.db.contribution.upsert({ where: { externalId: `issue_${issue.id}_opened` }, create: { externalId: `issue_${issue.id}_opened`, type: 'ISSUE_OPENED', title: issue.title, url: issue.html_url, basePoints: issuePoints, totalPoints: issuePoints, occurredAt, memberId: opener.id, repositoryId: repo.id }, update: { title: issue.title } }); processed++; }
      if (issue.state === 'closed') { const closerLogin = issue.closed_by?.login || issue.user?.login; const closerBot = isBot({ login: closerLogin, type: issue.closed_by?.type }); const closer = closerBot ? null : await this.findMember(closerLogin, undefined, repo.id); if (closer) { const occurredAt = new Date(issue.closed_at || issue.updated_at); await this.db.contribution.upsert({ where: { externalId: `issue_${issue.id}_closed` }, create: { externalId: `issue_${issue.id}_closed`, type: 'ISSUE_CLOSED', title: issue.title, url: issue.html_url, basePoints: issuePoints, totalPoints: issuePoints, occurredAt, memberId: closer.id, repositoryId: repo.id }, update: { title: issue.title } }); processed++; } }
    }
    const commits: any[] = dedupeExternal(await octokit.paginate(octokit.repos.listCommits, { owner: process.env.GITHUB_ORG, repo: githubRepo.name, per_page: 100, ...(since ? { since } : {}) } as any));
    const dailyCounts = new Map<string, number>();
    for (const commit of commits) {
      if (prCommitShas.has(commit.sha) || isBot({ login: commit.author?.login, type: commit.author?.type })) continue;
      const login = commit.author?.login; const email = commit.commit?.author?.email; const occurredAt = new Date(commit.commit?.author?.date || Date.now()); const details: any = await octokit.repos.getCommit({ owner: process.env.GITHUB_ORG, repo: githubRepo.name, ref: commit.sha }); const files = (details.data.files || []).map((file: any) => ({ filename: file.filename, additions: file.additions, deletions: file.deletions, patch: file.patch })); const meaningfulChanges = files.filter(isMeaningfulPatch).length; const day = dhakaDay(occurredAt);
      if (!dailyCounts.has(day)) dailyCounts.set(day, await this.db.contribution.count({ where: { repositoryId: repo.id, type: 'DIRECT_COMMIT', occurredAt: dhakaDayRange(day) } }));
      const existing = await this.db.contribution.findUnique({ where: { externalId: commit.sha }, select: { id: true } }); const count = (dailyCounts.get(day) || 0) - (existing ? 1 : 0) + 1; const total = scoreActivity({ kind: 'commit', additions: details.data.stats?.additions || 0, deletions: details.data.stats?.deletions || 0, files, meaningfulChanges, commitsOnRepoDay: count, isMergeCommit: (commit.parents?.length || 0) > 1, weights }); if (!total) continue; dailyCounts.set(day, Math.max(dailyCounts.get(day) || 0, count)); const normalBase = weights.directCommit ?? 1.5; const lowBase = weights.lowReturnCommit ?? .25; const basePoints = count > 8 ? lowBase : normalBase; const member = await this.findMember(login, email, repo.id);
      if (!member) continue;
      await this.db.contribution.upsert({ where: { externalId: commit.sha }, create: { externalId: commit.sha, type: 'DIRECT_COMMIT', title: commit.commit?.message || 'Commit', url: commit.html_url, basePoints, impactBonus: total - basePoints, totalPoints: total, additions: details.data.stats?.additions || 0, deletions: details.data.stats?.deletions || 0, occurredAt, memberId: member.id, repositoryId: repo.id }, update: { title: commit.commit?.message || 'Commit', totalPoints: total } }); processed++;
    }
    await this.db.repository.update({ where: { id: repo.id }, data: { lastSyncedAt: new Date() } }); return processed;
  }

  async run(trigger: 'CRON_MORNING'|'CRON_EVENING'|'ADMIN_MANUAL', full = false, onlyRepositoryId?: string) {
    if (trigger === 'ADMIN_MANUAL' && Date.now() - this.lastManualStarted < 30_000) return { status: 'cooldown' };
    if (this.running) return { status: 'already_running' };
    this.running = true; const started = Date.now(); let processed = 0; let reposCompleted = 0; if (trigger === 'ADMIN_MANUAL') this.lastManualStarted = started;
    try {
      if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_ORG) throw new Error('GITHUB_TOKEN and GITHUB_ORG are required for sync');
      const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
      const config = await this.db.systemConfig.upsert({ where: { id: 'default' }, create: { id: 'default', scoringWeights: {} }, update: {} });
      const weights = (config.scoringWeights || {}) as ScoringWeights;
      const memberSync = await this.syncOrganizationMembers(octokit);
      const repositories: any[] = dedupeExternal(await octokit.paginate(octokit.repos.listForOrg, { org: process.env.GITHUB_ORG, per_page: 100, type: 'all' } as any));
      const githubRepositoryIds = new Set(repositories.map(repository => String(repository.id)));
      const existingRepositories = await this.db.repository.findMany({ select: { id: true, githubRepoId: true } });
      if (onlyRepositoryId) {
        const target = existingRepositories.find(repository => repository.id === onlyRepositoryId);
        if (!target || !githubRepositoryIds.has(String(target.githubRepoId))) {
          if (target) await this.db.repository.update({ where: { id: target.id }, data: { isAvailable: false, isTracked: false } });
          throw new Error('Repository no longer exists in the GitHub organization and cannot be resynchronized.');
        }
      } else {
        const staleIds = existingRepositories.filter(repository => !githubRepositoryIds.has(String(repository.githubRepoId))).map(repository => repository.id);
        if (staleIds.length) await this.db.repository.updateMany({ where: { id: { in: staleIds } }, data: { isTracked: false, isAvailable: false } });
      }
      const errors: string[] = [];
      for (const githubRepo of repositories) {
        try {
          processed += await this.syncRepository(octokit, githubRepo, full, onlyRepositoryId, weights);
          reposCompleted++;
        } catch (error: any) {
          const message = `${githubRepo.full_name}: ${error.message}`;
          errors.push(message);
          this.log.error(`Repository sync failed: ${message}`);
          if (onlyRepositoryId) throw error;
        }
      }
      const status = errors.length ? 'PARTIAL' as const : 'SUCCESS' as const;
      const logResult = { status, reposScanned: onlyRepositoryId ? reposCompleted : repositories.length, recordsProcessed: processed, durationMs: Date.now() - started, ...(errors.length ? { errorMessage: errors.join(' | ') } : {}) };
      await this.db.syncLog.create({ data: { triggerType: trigger, ...logResult } });
      return { ...logResult, membersDiscovered: memberSync.discovered, membersDeparted: memberSync.departed };
    } catch (error: any) { const result = { status: (reposCompleted > 0 ? 'PARTIAL' : 'FAILED') as 'PARTIAL'|'FAILED', reposScanned: reposCompleted, recordsProcessed: processed, durationMs: Date.now() - started, errorMessage: error.message }; await this.db.syncLog.create({ data: { triggerType: trigger, ...result } }).catch(() => undefined); this.log.error(error.message); return result; } finally { this.running = false; }
  }
}
