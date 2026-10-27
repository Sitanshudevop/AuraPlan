import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const variantClasses = {
  primary: 'bg-[#18181B] text-white hover:bg-stone-800 dark:bg-[#FAFAFA] dark:text-[#18181B] dark:hover:bg-zinc-200 border border-transparent shadow-sm active:scale-[0.98]',
  secondary: 'bg-stone-100 text-stone-800 hover:bg-stone-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 border border-stone-200 dark:border-zinc-700',
  outline: 'bg-transparent text-stone-700 dark:text-zinc-300 hover:bg-stone-100 dark:hover:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700',
  ghost: 'bg-transparent text-stone-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-zinc-800 border-transparent',
  danger: 'bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800',
};

const sizeClasses = {
  xs: 'px-2 py-1 text-xs gap-1 rounded',
  sm: 'px-2.5 py-1.5 text-xs font-medium gap-1.5 rounded-md',
  md: 'px-3.5 py-2 text-sm font-medium gap-2 rounded-md',
  lg: 'px-4 py-2.5 text-base font-medium gap-2.5 rounded-lg',
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
      className={`inline-flex items-center justify-center font-sans transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 disabled:opacity-50 disabled:pointer-events-none ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
