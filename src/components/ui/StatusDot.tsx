import React from 'react';

export type StatusTone =
  | 'green'
  | 'amber'
  | 'red'
  | 'neutral'
  | 'accent'
  | 'confirmed'
  | 'pending'
  | 'conflict';

interface StatusDotProps {
  status?: StatusTone;
  label?: React.ReactNode;
  className?: string;
}

const dotColors: Record<StatusTone, string> = {
  green: 'bg-[#10B981]',
  confirmed: 'bg-[#10B981]',
  amber: 'bg-[#F59E0B]',
  pending: 'bg-[#F59E0B]',
  red: 'bg-[#EF4444]',
  conflict: 'bg-[#EF4444]',
  neutral: 'bg-stone-400 dark:bg-zinc-500',
  accent: 'bg-[#6E79F5]',
};

export const StatusDot: React.FC<StatusDotProps> = ({
  status = 'neutral',
  label,
  className = '',
}) => {
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-stone-700 dark:text-[#8B8B93] ${className}`}>
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[status] || dotColors.neutral}`}
        aria-hidden="true"
      />
      {label && <span>{label}</span>}
    </span>
  );
};
