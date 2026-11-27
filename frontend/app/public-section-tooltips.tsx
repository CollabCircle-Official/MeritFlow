'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

export const publicSectionTooltips = {
  overview: 'Use the period controls to compare verified contribution results across all available records, this month, or a specific completed month.',
  meritScore: 'The total of verified merit points earned by contributors in the selected period.',
  contributors: 'The number of organization members with verified contribution activity in the selected period.',
  activity: 'The combined count of merged pull requests and direct commits included in the selected period.',
  projects: 'The number of repositories currently included in MeritFlow tracking.',
  leaderboard: 'A ranked view of contributors using verified merit points, contribution share, pull requests, commits, and issues.',
  members: 'This breakdown shows how the selected period’s verified merit points are distributed across contributors.',
  repositories: 'This breakdown shows the verified merit points and record volume attributed to each tracked repository.',
  velocity: 'Daily verified merit points reveal when contribution activity occurred and which day reached the period peak.',
} as const;

type PublicSection = keyof typeof publicSectionTooltips;

export default function PublicSectionTooltip({ section }: { section: PublicSection }) {
  const [open, setOpen] = useState(false);
  return <span className="group relative inline-flex shrink-0"><button type="button" aria-label={`About ${section}`} aria-expanded={open} onClick={() => setOpen(value => !value)} className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-current/20 text-current/60 transition hover:border-azure hover:text-azure focus:outline-none focus:ring-2 focus:ring-azure/40"><Info size={14} aria-hidden="true" /></button><span role="tooltip" className={`pointer-events-none absolute left-0 top-full z-30 mt-2 w-64 rounded-xl border border-line bg-white p-3 text-left text-xs font-normal leading-5 text-ink shadow-[0_12px_30px_rgba(18,31,54,.16)] transition ${open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-1 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100'}`}>{publicSectionTooltips[section]}</span></span>;
}
