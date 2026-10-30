import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-white/[0.08] rounded-xl p-5 sm:p-6 transition-colors duration-150 ${
        hoverable ? 'hover:border-stone-300 dark:hover:border-white/[0.14] cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
