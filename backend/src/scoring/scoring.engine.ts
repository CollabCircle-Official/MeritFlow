export type ActivityKind = 'pr' | 'commit' | 'issue_opened' | 'issue_closed';
export type ScoringWeights = { mergedPr?: number; directCommit?: number; lowReturnCommit?: number; impactCap?: number; issue?: number };
export type FileChange = { filename: string; additions?: number; deletions?: number; patch?: string };
export type ScoringInput = { kind: ActivityKind; additions?: number; deletions?: number; meaningfulChanges?: number; isMergeCommit?: boolean; isBot?: boolean; commitsOnRepoDay?: number; descriptionLength?: number; files?: FileChange[]; weights?: ScoringWeights };
export const NOISE_FILES = new Set(['package-lock.json', 'yarn.lock', 'pnpm-lock.yaml', 'bun.lockb', '.ds_store']);
const GENERATED_EXTENSIONS = /\.(min\.js|map|lock|generated\.[^./]+|svg|png|jpe?g|gif|ico|woff2?)$/i;
export function isBot(actor?: { login?: string; type?: string }): boolean { const login = (actor?.login || '').toLowerCase(); return actor?.type === 'Bot' || login.endsWith('[bot]') || ['dependabot[bot]', 'github-actions[bot]', 'renovate[bot]'].includes(login); }
export function isNoiseFile(filename: string): boolean { const path = filename.trim().toLowerCase().replaceAll('\\', '/'); const normalized = path.split('/').pop() || ''; const generatedDirectory = /(^|\/)(?:build|dist|out|coverage|\.next)\//.test(path); return generatedDirectory || NOISE_FILES.has(normalized) || GENERATED_EXTENSIONS.test(normalized); }
export function isMeaningfulPatch(file: FileChange): boolean { if (isNoiseFile(file.filename)) return false; if (!file.patch) return (file.additions || 0) + (file.deletions || 0) > 0; return file.patch.split('\n').some(line => (/^[+-]/.test(line) && !/^\+\+\+|^---/.test(line) && /\S/.test(line.slice(1)))); }
export function effectiveLines(additions = 0, deletions = 0, files: FileChange[] = []): number { if (!files.length) return Math.max(0, additions) + Math.max(0, deletions) * 0.5; return files.filter(isMeaningfulPatch).reduce((n, f) => n + (f.additions || 0) + (f.deletions || 0) * 0.5, 0); }
export function impactBonus(additions = 0, deletions = 0, files: FileChange[] = []): number { return Math.min(3, Math.floor(effectiveLines(additions, deletions, files) / 80) * 0.5); }
export function scoreActivity(input: ScoringInput): number {
  if (input.isBot || (input.kind === 'commit' && (input.isMergeCommit || input.meaningfulChanges === 0))) return 0;
  if (input.kind === 'issue_opened' && (input.descriptionLength || 0) <= 30) return 0;
  const weights = input.weights || {}; const base = input.kind === 'pr' ? weights.mergedPr ?? 4 : input.kind === 'commit' ? (input.commitsOnRepoDay || 0) > 8 ? weights.lowReturnCommit ?? .25 : weights.directCommit ?? 1.5 : weights.issue ?? 1;
  return base + (input.kind === 'pr' || input.kind === 'commit' ? Math.min(weights.impactCap ?? 3, impactBonus(input.additions, input.deletions, input.files)) : 0);
}
export function percentage(points: number, total: number): number { return total <= 0 ? 0 : Number(((points / total) * 100).toFixed(2)); }
export type Rankable = { totalPoints: number; mergedPrs: number; effectiveLines: number; earliest: Date };
export function rank<T extends Rankable>(items: T[]): T[] { return [...items].sort((a, b) => b.totalPoints - a.totalPoints || b.mergedPrs - a.mergedPrs || b.effectiveLines - a.effectiveLines || a.earliest.getTime() - b.earliest.getTime()); }
export function activeStreak(dates: Date[], now = new Date()): number { const days = new Set(dates.map(d => dhakaDay(d))); let cursor = new Date(`${dhakaDay(now)}T00:00:00+06:00`); let count = 0; while (days.has(dhakaDay(cursor))) { count++; cursor = new Date(cursor.getTime() - 86400000); } return count; }
export function dhakaDay(date: Date): string { return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Dhaka', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date); }
