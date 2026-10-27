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
      className={`bg-white dark:bg-[#121215] border border-stone-200 dark:border-zinc-800 rounded-lg p-5 transition-all duration-150 ${
        hoverable ? 'hover:border-stone-300 dark:hover:border-zinc-700 cursor-pointer shadow-sm' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};
