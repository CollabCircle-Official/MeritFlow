'use client';

import { Info } from 'lucide-react';
import { useState } from 'react';

export const adminSectionTooltips = {
  signIn: 'Use the administrator secret key configured for this MeritFlow deployment.',
  sync: 'Run a normal synchronization for recent GitHub changes or a full backfill when historical records need to be rebuilt.',
  activity: 'Review the latest synchronization outcomes, processed record counts, and execution durations.',
  configuration: 'Control the organization identity, scheduled sync windows, and scoring values used during processing.',
  members: 'GitHub organization membership is synchronized automatically. Only designation and additional commit emails are editable here.',
  repositories: 'Review repositories discovered from GitHub, pause tracking when needed, and preserve history for unavailable repositories.',
  exports: 'Download verified contribution records for a selected reporting period as CSV.',
} as const;

type AdminSection = keyof typeof adminSectionTooltips;

export default function AdminSectionTooltip({ section }: { section: AdminSection }) {
  const [open, setOpen] = useState(false);
  return <span className="group relative inline-flex shrink-0"><button type="button" aria-label={`About ${section}`} aria-expanded={open} onClick={() => setOpen(value => !value)} className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-current/20 text-current/60 transition hover:border-azure hover:text-azure focus:outline-none focus:ring-2 focus:ring-azure/40"><Info size={14} aria-hidden="true" /></button><span role="tooltip" className={`pointer-events-none absolute left-0 top-full z-30 mt-2 w-72 rounded-xl border border-line bg-white p-3 text-left text-xs font-normal leading-5 text-ink shadow-[0_12px_30px_rgba(18,31,54,.16)] transition ${open ? 'visible translate-y-0 opacity-100' : 'invisible translate-y-1 opacity-0 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100'}`}>{adminSectionTooltips[section]}</span></span>;
}
