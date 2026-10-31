import React from 'react';

export interface TabOption {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

interface SegmentedTabsProps {
  tabs: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  variant?: 'underline' | 'segmented';
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  className = '',
  variant = 'underline',
}) => {
  if (variant === 'segmented') {
    return (
      <div className={`inline-flex items-center p-0.5 bg-stone-100 dark:bg-white/[0.04] rounded-lg border border-stone-200/80 dark:border-white/[0.08] ${className}`}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-white dark:bg-[#161618] text-[#111113] dark:text-[#EDEDEF] shadow-xs'
                  : 'text-stone-500 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF]'
              }`}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className="text-[11px] font-mono tabular-nums text-stone-500 dark:text-zinc-500">
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-6 border-b border-stone-200/80 dark:border-white/[0.08] overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 pb-2.5 text-sm font-medium transition-colors relative whitespace-nowrap ${
              isActive
                ? 'text-[#111113] dark:text-[#EDEDEF]'
                : 'text-stone-500 dark:text-[#8B8B93] hover:text-stone-800 dark:hover:text-[#EDEDEF]'
            }`}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-xs px-1.5 py-0.2 rounded font-mono tabular-nums ${
                  isActive
                    ? 'bg-stone-200/70 dark:bg-white/[0.1] text-stone-800 dark:text-[#EDEDEF]'
                    : 'text-stone-500 dark:text-zinc-500'
                }`}
              >
                {tab.count}
              </span>
            )}
            {isActive && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6E79F5] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};

