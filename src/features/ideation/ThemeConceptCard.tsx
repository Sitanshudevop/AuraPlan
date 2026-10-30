import React, { useState } from 'react';
import { ThemeIdea } from '../../types/ideation';
import { Currency } from '../../types/event';
import { Card } from '../../components/ui/Card';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { formatCurrency } from '../../utils/formatters';
import { ThemePaletteTab } from './ThemePaletteTab';
import { ThemeDecorTab } from './ThemeDecorTab';

interface ThemeConceptCardProps {
  idea: ThemeIdea;
  currency: Currency;
  onAddToPlan: (title: string, cost: number, category: 'decor' | 'av_photo' | 'venue' | 'catering', timelineTask: string) => void;
}

export const ThemeConceptCard: React.FC<ThemeConceptCardProps> = ({
  idea,
  currency,
  onAddToPlan,
}) => {
  const [activeTab, setActiveTab] = useState<string>('palette');
  const [copiedHex, setCopiedHex] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1800);
  };

  const handleAdd = (
    id: string,
    title: string,
    cost: number,
    category: 'decor' | 'av_photo' | 'venue' | 'catering',
    task: string
  ) => {
    onAddToPlan(title, cost, category, task);
    setAddedIds((prev) => new Set(prev).add(id));
  };

  const conceptTabs = [
    { id: 'palette', label: 'Palette', count: idea.colors.length },
    { id: 'decor', label: 'Decor', count: idea.decorConcepts.length },
    { id: 'menus', label: 'Menus', count: idea.menuItems.length },
  ];

  return (
    <Card className="p-5 sm:p-6 space-y-4 rounded-xl border border-stone-200/80 dark:border-white/[0.08]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-200/80 dark:border-white/[0.08]">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-[#111113] dark:text-[#EDEDEF]">
            {idea.title}
          </h3>
          <p className="text-xs text-stone-500 dark:text-[#8B8B93] mt-0.5 leading-relaxed">
            {idea.description}
          </p>
        </div>
        <SegmentedTabs
          tabs={conceptTabs}
          activeTab={activeTab}
          onChange={setActiveTab}
          variant="segmented"
        />
      </div>

      {activeTab === 'palette' && (
        <ThemePaletteTab
          colors={idea.colors}
          copiedHex={copiedHex}
          onCopyHex={handleCopyHex}
        />
      )}

      {activeTab === 'decor' && (
        <ThemeDecorTab
          decorConcepts={idea.decorConcepts}
          currency={currency}
          addedIds={addedIds}
          onAdd={handleAdd}
        />
      )}

      {activeTab === 'menus' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {idea.menuItems.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-lg border border-stone-200/80 dark:border-white/[0.08] bg-stone-50/30 dark:bg-white/[0.02] text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#111113] dark:text-[#EDEDEF]">{item.name}</span>
                <span className="tabular-nums text-xs font-semibold text-stone-700 dark:text-[#EDEDEF]">
                  {formatCurrency(item.estimatedCostPerHead, currency)} / head
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-[#8B8B93] leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
