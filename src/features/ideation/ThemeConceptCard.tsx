import React, { useState } from 'react';
import { ThemeIdea } from '../../types/ideation';
import { Currency } from '../../types/event';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { SegmentedTabs } from '../../components/ui/SegmentedTabs';
import { formatCurrency } from '../../utils/formatters';
import { Check, Plus } from 'lucide-react';

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

      {/* Tab 1: Color Palette */}
      {activeTab === 'palette' && (
        <div className="space-y-2 pt-1">
          <div className="text-xs text-stone-400 dark:text-zinc-500">
            Click swatch to copy hex code
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {idea.colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => handleCopyHex(color.hex)}
                className="flex items-center gap-2.5 p-2 rounded-lg border border-stone-200/80 dark:border-white/[0.08] hover:border-stone-300 dark:hover:border-white/[0.14] transition-colors text-left bg-stone-50/50 dark:bg-white/[0.02]"
                title={`Click to copy ${color.hex}`}
              >
                <div
                  className="w-7 h-7 rounded-md border border-black/10 dark:border-white/10 shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: color.hex }}
                >
                  {copiedHex === color.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow-xs" />}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-medium text-[#111113] dark:text-[#EDEDEF] block truncate">
                    {color.name}
                  </span>
                  <span className="text-[11px] text-stone-400 dark:text-zinc-500 tabular-nums">
                    {copiedHex === color.hex ? 'Copied' : color.hex}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Decor Concepts */}
      {activeTab === 'decor' && (
        <div className="space-y-2.5 pt-1">
          {idea.decorConcepts.map((dc) => {
            const isAdded = addedIds.has(dc.id);
            return (
              <div
                key={dc.id}
                className="flex items-center justify-between p-3.5 rounded-lg border border-stone-200/80 dark:border-white/[0.08] bg-stone-50/30 dark:bg-white/[0.02] text-xs gap-3"
              >
                <div className="pr-2 min-w-0 flex-1">
                  <div className="font-medium text-[#111113] dark:text-[#EDEDEF]">{dc.title}</div>
                  <p className="text-xs text-stone-500 dark:text-[#8B8B93] mt-0.5 leading-relaxed">{dc.description}</p>
                  <div className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1">Milestone: {dc.timelineTask}</div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <div className="font-semibold text-[#111113] dark:text-[#EDEDEF] tabular-nums">
                    {formatCurrency(dc.estimatedCost, currency)}
                  </div>
                  <Button
                    variant={isAdded ? 'secondary' : 'outline'}
                    size="xs"
                    disabled={isAdded}
                    onClick={() => handleAdd(dc.id, dc.title, dc.estimatedCost, dc.category, dc.timelineTask)}
                    icon={isAdded ? <Check className="w-3 h-3 text-emerald-500" /> : <Plus className="w-3 h-3" />}
                  >
                    {isAdded ? 'Added' : 'Add to plan'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Menus */}
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
