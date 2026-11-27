'use client';

import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LiveClock() {
  const [now, setNow] = useState('');
  useEffect(() => { const update = () => setNow(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date())); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, []);
  return <div className="flex items-center gap-2 rounded-full border border-red-200/80 bg-white/90 px-3 py-1.5 text-xs font-medium text-ink shadow-[0_0_18px_rgba(220,38,38,0.28),0_0_34px_rgba(220,38,38,0.12)]" title="Current time in Asia/Dhaka"><span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-red-600" /></span><Clock3 size={15} className="text-red-600" /><span className="font-mono">{now || '--:--:--'}</span><span className="text-red-700">BDT</span></div>;
}
