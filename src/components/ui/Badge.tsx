import React from 'react';

export type BadgeVariant = 'emerald' | 'amber' | 'rose' | 'indigo' | 'stone' | 'obsidian';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/60',
  amber: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/60',
  rose: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/60',
  indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-400 dark:border-indigo-800/60',
  stone: 'bg-stone-100 text-stone-700 border-stone-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700',
  obsidian: 'bg-stone-900 text-stone-100 border-stone-800 dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-300',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'stone',
  className = '',
  size = 'sm',
}) => {
  const sizeStyle = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs';
  return (
    <span
      className={`inline-flex items-center font-medium border rounded-full transition-colors ${sizeStyle} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
};
