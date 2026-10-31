import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const variantClasses = {
  // Primary: ONE accent fill (#5560E6) - WCAG 2.1 AA compliant (4.91:1 contrast on white)
  primary:
    'bg-[#5560E6] text-white hover:bg-[#4752D8] active:bg-[#3C46C7] border border-transparent dark:border-transparent',
  // Secondary: hairline border, transparent background
  secondary:
    'bg-transparent text-stone-800 dark:text-[#EDEDEF] border border-stone-200 dark:border-white/[0.08] hover:bg-stone-100/70 dark:hover:bg-white/[0.04]',
  // Outline: same as secondary
  outline:
    'bg-transparent text-stone-700 dark:text-[#EDEDEF] border border-stone-200 dark:border-white/[0.08] hover:bg-stone-100/70 dark:hover:bg-white/[0.04]',
  // Ghost: plain text only
  ghost:
    'bg-transparent text-stone-600 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF] hover:bg-stone-100/70 dark:hover:bg-white/[0.04] border border-transparent',
  // Danger: restrained red with hairline border
  danger:
    'bg-transparent text-red-600 dark:text-red-400 border border-red-500/20 hover:bg-red-500/10',
};

const sizeClasses = {
  xs: 'min-h-[36px] sm:min-h-0 h-7 px-2 text-xs gap-1 rounded-md touch-manipulation',
  sm: 'min-h-[44px] sm:min-h-0 h-8 px-2.5 text-xs font-medium gap-1.5 rounded-lg touch-manipulation',
  md: 'min-h-[44px] sm:min-h-0 h-9 px-3.5 text-sm font-medium gap-2 rounded-lg touch-manipulation',
  lg: 'min-h-[44px] sm:min-h-0 h-10 px-4 text-sm font-medium gap-2 rounded-lg touch-manipulation',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'secondary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled}
      className={`inline-flex items-center justify-center font-sans tracking-tight transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5560E6] focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-[#0B0B0C] disabled:opacity-40 disabled:pointer-events-none select-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0 [&>svg]:w-4 [&>svg]:h-4 [&>svg]:stroke-[1.5]">{icon}</span>}
      {children}
    </button>
  );
};
