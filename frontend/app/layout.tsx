import './globals.css';
import Link from 'next/link';
import { Merriweather } from 'next/font/google';
import type { Viewport } from 'next';
import { ArrowUpRight, ExternalLink, Globe2, LockKeyhole, Mail, UsersRound } from 'lucide-react';
import LiveClock from './live-clock';

const merriweather = Merriweather({ subsets: ['latin'], display: 'swap', weight: ['400', '700', '900'] });
export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover' };
const headerButtonStyle = { backgroundColor: '#5D866C', borderColor: '#5D866C', color: '#FFFFFF' };

const footerLinks = [
  { label: 'Gmail', value: process.env.Gmail, icon: Mail, href: (value: string) => `mailto:${value}` },
  { label: 'Website', value: process.env.Website, icon: Globe2, href: (value: string) => value },
  { label: 'LinkedIn', value: process.env.Linkedin, icon: ExternalLink, href: (value: string) => value },
  { label: 'Facebook', value: process.env.Facebook, icon: ExternalLink, href: (value: string) => value },
  { label: 'Instagram', value: process.env.Instagram, icon: ExternalLink, href: (value: string) => value },
  { label: 'X', value: process.env.X, icon: ExternalLink, href: (value: string) => value },
  { label: 'YouTube', value: process.env.YouTube, icon: ExternalLink, href: (value: string) => value },
];
const visibleFooterLinks = footerLinks.filter(link => Boolean(link.value?.trim()));

export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><head><title>CollabCircle&apos;s Contribution Tracking Panel</title><meta name="description" content="CollabCircle&apos;s Contribution Tracking Panel" /></head><body className={merriweather.className}><header className="sticky top-0 z-20 border-b border-[#eadfd3] bg-[#FFF1E4]" style={{ backgroundColor: '#FFF1E4' }}><div className="relative mx-auto flex min-h-14 max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-5 sm:py-4 max-sm:flex-wrap max-sm:justify-center"><Link href="/" className="order-1 flex items-center gap-2 text-base font-semibold tracking-tight sm:gap-3 sm:text-lg"><span className="brand-mark">M</span><span>MeritFlow</span></Link><div className="pointer-events-none absolute left-1/2 top-1/2 order-3 -translate-x-1/2 -translate-y-1/2 max-sm:static max-sm:order-3 max-sm:w-full max-sm:translate-x-0 max-sm:translate-y-0"><div className="pointer-events-auto flex justify-center"><LiveClock /></div></div><nav className="order-2 flex items-center gap-1.5 text-xs sm:gap-2 sm:text-sm"><Link href="/members" style={headerButtonStyle} className="flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-medium transition hover:brightness-90 sm:gap-2 sm:px-3"><UsersRound size={14} aria-hidden="true" /> <span>Members</span></Link><Link href="/admin" aria-label="Open administrator controls" title="Administrator controls" style={headerButtonStyle} className="flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 font-medium transition hover:brightness-90 sm:gap-2 sm:px-3"><LockKeyhole size={14} aria-hidden="true" /> <span>Admin</span> <ArrowUpRight size={13} aria-hidden="true" /></Link></nav></div></header>{children}<footer className="mt-16 border-t border-line/80 bg-card/70"><div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 text-sm sm:flex-row sm:items-center sm:justify-between"><p className="font-semibold">MeritFlow</p>{visibleFooterLinks.length > 0 && <nav aria-label="Social media and company links" className="flex flex-wrap items-center gap-2">{visibleFooterLinks.map(({ label, value, icon: Icon, href }) => <a key={label} href={href(value!)} target={label === 'Gmail' ? undefined : '_blank'} rel={label === 'Gmail' ? undefined : 'noreferrer'} aria-label={label} className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-xs font-medium transition hover:border-azure hover:bg-azure/10"><Icon size={13} aria-hidden="true" />{label}</a>)}</nav>}</div></footer></body></html>;
}
