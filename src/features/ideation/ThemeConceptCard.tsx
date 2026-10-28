import React, { useState } from 'react';
import { ThemeIdea } from '../../types/ideation';
import { Currency } from '../../types/event';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { Check, Plus, Palette, Sparkles, Utensils } from 'lucide-react';

interface ThemeConceptCardProps {
  idea: ThemeIdea;
  currency: Currency;
  onAddToPlan: (title: string, cost: number, category: 'decor' | 'av_photo' | 'venue' | 'catering', timelineTask: string) => void;
}

type TabType = 'palette' | 'decor' | 'menus';

export const ThemeConceptCard: React.FC<ThemeConceptCardProps> = ({
  idea,
  currency,
  onAddToPlan,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('palette');
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

  return (
    <Card className="p-5 sm:p-6 space-y-4 rounded-2xl border-stone-200 dark:border-zinc-800">
      <div>
        <div className="flex items-center justify-between">
          <Badge variant="indigo" size="sm">Cohesive Concept</Badge>
          <span className="text-xs text-stone-600 dark:text-zinc-400 font-mono">Curated Experience</span>
        </div>
        <h3 className="text-base font-serif font-bold text-stone-900 dark:text-white mt-2">
          {idea.title}
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1 leading-relaxed">
          {idea.description}
        </p>
      </div>

      {/* Progressive Disclosure Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-zinc-800/60 rounded-xl">
        <button
          onClick={() => setActiveTab('palette')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'palette'
              ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs font-semibold'
              : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Palette ({idea.colors.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('decor')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'decor'
              ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs font-semibold'
              : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Decor ({idea.decorConcepts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('menus')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'menus'
              ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-white shadow-xs font-semibold'
              : 'text-stone-600 dark:text-zinc-400 hover:text-stone-900'
          }`}
        >
          <Utensils className="w-3.5 h-3.5" />
          <span>Menus ({idea.menuItems.length})</span>
        </button>
      </div>

      {/* Tab Panel 1: Color Palette */}
      {activeTab === 'palette' && (
        <div className="space-y-3 pt-1">
          <div className="text-xs text-stone-500 dark:text-zinc-400">
            Click any swatch to copy its HEX value to your clipboard:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {idea.colors.map((color, idx) => (
              <button
                key={idx}
                onClick={() => handleCopyHex(color.hex)}
                className="flex items-center gap-2.5 p-2 rounded-xl border border-stone-200 dark:border-zinc-800 hover:border-amber-500/40 transition-all text-left bg-stone-50/50 dark:bg-zinc-900/40 group"
                title={`Click to copy ${color.hex}`}
              >
                <div
                  className="w-8 h-8 rounded-lg shadow-xs border border-black/10 shrink-0 flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{ backgroundColor: color.hex }}
                >
                  {copiedHex === color.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-stone-900 dark:text-white block truncate">
                    {color.name}
                  </span>
                  <span className="text-[10px] font-mono text-stone-500 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                    {copiedHex === color.hex ? 'Copied!' : color.hex}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tab Panel 2: Decor & Architectural Concepts */}
      {activeTab === 'decor' && (
        <div className="space-y-2.5 pt-1">
          {idea.decorConcepts.map((dc) => {
            const isAdded = addedIds.has(dc.id);
            return (
              <div
                key={dc.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/40 dark:bg-zinc-900/40 text-xs gap-3"
              >
                <div className="pr-2 min-w-0 flex-1">
                  <div className="font-semibold text-stone-900 dark:text-white">{dc.title}</div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5 leading-relaxed">{dc.description}</p>
                  <div className="text-[10px] text-stone-600 dark:text-zinc-400 font-mono mt-1">Task: {dc.timelineTask}</div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <div className="font-mono font-bold text-stone-900 dark:text-white tabular-nums">
                    {formatCurrency(dc.estimatedCost, currency)}
                  </div>
                  <Button
                    variant={isAdded ? 'secondary' : 'outline'}
                    size="xs"
                    disabled={isAdded}
                    onClick={() => handleAdd(dc.id, dc.title, dc.estimatedCost, dc.category, dc.timelineTask)}
                    icon={isAdded ? <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> : <Plus className="w-3 h-3" />}
                  >
                    {isAdded ? 'Added' : 'Add to Plan'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab Panel 3: Signature Culinary Menus */}
      {activeTab === 'menus' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {idea.menuItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl border border-stone-200 dark:border-zinc-800 bg-stone-50/40 dark:bg-zinc-900/30 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 dark:text-white">{item.name}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold tabular-nums text-[11px]">
                  {formatCurrency(item.estimatedCostPerHead, currency)} / head
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
