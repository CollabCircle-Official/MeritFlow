# MeritFlow UI/UX reference

## Visual direction

MeritFlow uses a warm executive workspace instead of a generic dark dashboard:

| Role | Color | Use |
| --- | --- | --- |
| Canvas | `#F7F5F0` | Application background and subtle radial atmosphere |
| Card | `#FFFDF9` | Elevated panels, forms, and navigation surfaces |
| Ink | `#172033` | Primary text, active navigation, and high-contrast actions |
| Muted | `#687386` | Supporting labels, timestamps, and explanatory copy |
| Line | `#E4DED4` | Hairline borders and separators |
| Terracotta | `#D97757` | Primary actions, brand mark, focus accents, and progress |
| Teal | `#1E8A70` | Healthy state, verified activity, and success feedback |

The interface uses rounded cards, restrained shadows, generous spacing, sticky navigation, and responsive layouts. Content remains operational and factual: every label explains a real metric, action, or state.

## Shared shell

- The sticky header identifies MeritFlow by CollabCircle, shows the live workspace state, and links to protected Admin controls with a lock icon.
- The footer provides product ownership, internal-workspace context, and the Asia/Dhaka operating timezone.
- Focus-visible outlines are available for keyboard navigation across links, buttons, inputs, and selects.

## Main dashboard

The home screen prioritizes the selected period, synchronization status, KPI strip, leaderboard, project matrix, and contribution velocity. The top three contributors receive podium cards; remaining members appear in a sortable, percentage-based list. Empty and API-error states are explicit and actionable.

## Admin session behavior

The Admin Panel uses the protected `x-admin-key` API flow. The key is held only in component memory and is never persisted to local storage. The signed-in state includes a visible **Sign out** action; signing out clears the key, loaded records, assignments, and session status before returning to the login gate.

## Admin information architecture

1. **Sync & system** — sync actions, audit logs, scoring configuration, and unmapped work recovery.
2. **Team mapping** — review automatically synchronized organization members and maintain designation plus additional commit emails.
3. **Repositories** — toggle tracking and trigger individual full resyncs.
4. **Audit export** — download period-specific CSV reports.

All four areas are responsive and usable on mobile and desktop widths.
