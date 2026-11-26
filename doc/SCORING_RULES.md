# MeritFlow scoring rules

- Merged PR: 4.0 base points. Commits attached to a merged PR must not also be imported as direct commits.
- Valid direct commit: 1.5 points; commit 9 and later in the same repository/day earn 0.25 points. Merge commits, zero-change commits, lockfile-only changes, generated assets, and whitespace-only changes are excluded.
- Impact: `min(3.0, floor((additions + deletions * 0.5) / 80) * 0.5)` for PRs and direct commits.
- Issue opened with a description longer than 30 characters: 1.0 point. Issue closed: 1.0 point.
- Bot actors are excluded. Percentages are `member points / organization points * 100`, rounded to two decimals; an empty total returns 0.00%.
- Ranking sorts by total points, merged PR count, effective lines changed, then earliest contribution timestamp.
- The daily count is reconciled against already-persisted same-day direct commits, so incremental sync windows cannot reset the cap. Defaults are stored in `SystemConfig.scoringWeights`; administrators may intentionally override them through the protected system-config endpoint.
