import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = 'h-4 w-full' }) => {
  return (
    <div
      className={`animate-pulse bg-stone-200/80 dark:bg-zinc-800 rounded ${className}`}
      aria-hidden="true"
    />
  );
};

export const TabSkeleton: React.FC = () => {
  return (
    <div
      className="space-y-6 p-6 animate-pulse"
      role="status"
      aria-busy="true"
      aria-label="Loading workspace module..."
    >
      <div className="h-8 bg-stone-200 dark:bg-zinc-800 rounded w-1/4" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 bg-stone-200 dark:bg-zinc-800 rounded" />
        <div className="h-28 bg-stone-200 dark:bg-zinc-800 rounded" />
        <div className="h-28 bg-stone-200 dark:bg-zinc-800 rounded" />
      </div>
      <div className="h-64 bg-stone-200 dark:bg-zinc-800 rounded" />
      <span className="sr-only">Loading workspace module...</span>
    </div>
  );
};
