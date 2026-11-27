'use client';

import { Clock3 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LiveClock() {
  const [now, setNow] = useState('');
  useEffect(() => { const update = () => setNow(new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }).format(new Date())); update(); const timer = window.setInterval(update, 1000); return () => window.clearInterval(timer); }, []);
  return <div className="hidden items-center gap-2 text-xs font-medium text-ink sm:flex" title="Current time in Asia/Dhaka"><Clock3 size={15} className="text-red-600" /><span className="font-mono">{now || '--:--:--'}</span><span className="muted">BDT</span></div>;
}
