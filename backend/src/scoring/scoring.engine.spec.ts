import { activeStreak, effectiveLines, impactBonus, isMeaningfulPatch, percentage, rank, scoreActivity, scoreIdea } from './scoring.engine';
describe('scoring engine', () => {
  it('caps impact', () => expect(impactBonus(100000, 100000)).toBe(3));
  it('uses the daily diminishing return after eight commits', () => expect(scoreActivity({ kind: 'commit', meaningfulChanges: 1, commitsOnRepoDay: 9 })).toBe(.25));
  it('supports persisted scoring-weight overrides without changing defaults', () => expect(scoreActivity({ kind: 'pr', weights: { mergedPr: 6, impactCap: 1 } })).toBe(6));
  it('caps idea contribution scores through the adoption rubric', () => expect(['PROPOSED', 'ACCEPTED', 'IMPLEMENTED', 'OUTCOME'].map(scoreIdea)).toEqual([1, 2, 4, 5]));
  it('filters merges, short issues, and bots', () => { expect(scoreActivity({ kind: 'commit', meaningfulChanges: 1, isMergeCommit: true })).toBe(0); expect(scoreActivity({ kind: 'issue_opened', descriptionLength: 30 })).toBe(0); expect(scoreActivity({ kind: 'pr', isBot: true })).toBe(0); });
  it('filters lockfiles, generated assets, and whitespace-only patches', () => { expect(isMeaningfulPatch({ filename: 'package-lock.json', additions: 10 })).toBe(false); expect(isMeaningfulPatch({ filename: 'src/a.ts', patch: '   +   \n  -  ' })).toBe(false); expect(isMeaningfulPatch({ filename: 'src/a.ts', additions: 3, deletions: 1 })).toBe(true); expect(effectiveLines(100, 100, [{ filename: 'package-lock.json', additions: 1000 }])).toBe(0); });
  it('avoids division by zero', () => expect(percentage(2, 0)).toBe(0));
  it('tie breaks by PRs, impact, and earliest contribution', () => expect(rank([{ totalPoints: 1, mergedPrs: 1, effectiveLines: 10, earliest: new Date(2) }, { totalPoints: 1, mergedPrs: 2, effectiveLines: 0, earliest: new Date(3) }])[0].mergedPrs).toBe(2));
  it('calculates a consecutive Dhaka-day streak', () => expect(activeStreak([new Date('2026-11-25T10:00:00Z'), new Date('2026-11-24T10:00:00Z')], new Date('2026-11-25T15:00:00Z'))).toBe(2));
});
