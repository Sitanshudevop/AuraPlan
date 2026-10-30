import React from 'react';

export type BadgeVariant = 'emerald' | 'amber' | 'rose' | 'indigo' | 'neutral' | 'stone';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  emerald: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    dot: 'bg-emerald-500',
  },
  amber: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    dot: 'bg-amber-500',
  },
  rose: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    dot: 'bg-rose-500',
  },
  indigo: {
    bg: 'bg-[#6E79F5]/10 dark:bg-[#6E79F5]/15',
    text: 'text-[#5D68E2] dark:text-[#6E79F5]',
    dot: 'bg-[#6E79F5]',
  },
  neutral: {
    bg: 'bg-black/[0.05] dark:bg-white/[0.06]',
    text: 'text-stone-700 dark:text-[#8B8B93]',
    dot: 'bg-stone-400 dark:bg-zinc-500',
  },
  stone: {
    bg: 'bg-black/[0.05] dark:bg-white/[0.06]',
    text: 'text-stone-700 dark:text-[#8B8B93]',
    dot: 'bg-stone-400 dark:bg-zinc-500',
  },
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  dot = false,
}) => {
  const style = variantStyles[variant] || variantStyles.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1.5 h-5 px-2 text-xs font-medium rounded-md select-none ${style.bg} ${style.text} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.dot}`} />}
      {children}
    </span>
  );
};
