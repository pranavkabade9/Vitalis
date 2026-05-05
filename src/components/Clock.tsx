import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2 shadow-sm flex flex-col items-end min-w-[140px]">
      <span className="text-lg font-bold text-slate-800 dark:text-white leading-none">
        {format(time, 'h:mm:ss a')}
      </span>
      <span className="text-[10px] font-bold text-brand-500 uppercase tracking-widest mt-1">
        {format(time, 'EEEE')}
      </span>
      <span className="text-[10px] font-medium text-slate-400">
        {format(time, 'd MMM yyyy')}
      </span>
    </div>
  );
}
