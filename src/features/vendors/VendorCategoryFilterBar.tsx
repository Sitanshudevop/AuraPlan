import React from 'react';
import { formatCategory } from '../../utils/formatters';

interface VendorCategoryFilterBarProps {
  categories: string[];
  totalVendors: number;
  categoryFilter: string;
  onSelectCategory: (cat: string) => void;
}

export const VendorCategoryFilterBar: React.FC<VendorCategoryFilterBarProps> = ({
  categories,
  totalVendors,
  categoryFilter,
  onSelectCategory,
}) => {
  return (
    <div className="shrink-0 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 border-b border-stone-200/80 dark:border-white/[0.08]">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
          categoryFilter === 'all'
            ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[#111113] dark:text-[#EDEDEF] font-medium'
            : 'text-stone-500 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF]'
        }`}
      >
        All categories ({totalVendors})
      </button>
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelectCategory(cat)}
          className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap ${
            categoryFilter === cat
              ? 'bg-black/[0.06] dark:bg-white/[0.08] text-[#111113] dark:text-[#EDEDEF] font-medium'
              : 'text-stone-500 dark:text-[#8B8B93] hover:text-stone-900 dark:hover:text-[#EDEDEF]'
          }`}
        >
          {formatCategory(cat)}
        </button>
      ))}
    </div>
  );
};

