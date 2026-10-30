import React from 'react';

export interface StatItem {
  label: string;
  value: string | number;
  helper?: React.ReactNode;
  statusTone?: 'green' | 'amber' | 'red';
  progress?: number; // 0 to 100
}

interface StatStripProps {
  stats: StatItem[];
  className?: string;
}

export const StatStrip: React.FC<StatStripProps> = ({ stats, className = '' }) => {
  return (
    <div
      className={`bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-white/[0.08] rounded-xl overflow-hidden divide-y md:divide-y-0 md:divide-x divide-stone-200/80 dark:divide-white/[0.08] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 ${className}`}
    >
      {stats.map((stat, i) => {
        let valueColor = 'text-[#111113] dark:text-[#EDEDEF]';
        if (stat.statusTone === 'red') valueColor = 'text-red-600 dark:text-red-400';
        if (stat.statusTone === 'amber') valueColor = 'text-amber-600 dark:text-amber-400';
        if (stat.statusTone === 'green') valueColor = 'text-emerald-600 dark:text-emerald-400';

        return (
          <div key={i} className="p-4 sm:p-5 flex flex-col justify-between space-y-2">
            <span className="text-[13px] font-normal text-stone-500 dark:text-[#8B8B93]">
              {stat.label}
            </span>
            <div className={`text-2xl font-semibold tracking-tight tabular-nums ${valueColor}`}>
              {stat.value}
            </div>
            {stat.progress !== undefined && (
              <div className="w-full bg-stone-100 dark:bg-white/[0.08] h-1 rounded-full overflow-hidden my-1">
                <div
                  className="bg-[#6E79F5] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, stat.progress))}%` }}
                />
              </div>
            )}
            {stat.helper && (
              <div className="text-xs text-stone-500 dark:text-[#8B8B93] leading-none">
                {stat.helper}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
