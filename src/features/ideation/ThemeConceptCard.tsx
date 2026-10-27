import React, { useState } from 'react';
import { ThemeIdea } from '../../types/ideation';
import { Currency } from '../../types/event';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency } from '../../utils/formatters';
import { Check, Plus, Palette } from 'lucide-react';

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
    <Card className="space-y-5 p-6 border-stone-200 dark:border-zinc-800">
      <div>
        <div className="flex items-center justify-between">
          <Badge variant="indigo" size="sm">Cohesive Concept</Badge>
          <span className="text-xs text-stone-400 font-mono">Curated Experience</span>
        </div>
        <h3 className="text-base font-bold text-stone-900 dark:text-white mt-2">
          {idea.title}
        </h3>
        <p className="text-xs text-stone-500 dark:text-zinc-400 mt-1">
          {idea.description}
        </p>
      </div>

      {/* Color Palette Hex Swatches */}
      <div className="space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-zinc-300">
          <Palette className="w-3.5 h-3.5 text-indigo-500" />
          <span>Curated Color Palette (Click swatch to copy HEX)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {idea.colors.map((color, idx) => (
            <button
              key={idx}
              onClick={() => handleCopyHex(color.hex)}
              className="flex items-center gap-2 p-2 rounded-lg border border-stone-200 dark:border-zinc-800 hover:border-stone-400 transition-all text-left bg-stone-50/50 dark:bg-zinc-900/40 group"
              title={`Click to copy ${color.hex}`}
            >
              <div
                className="w-7 h-7 rounded-md shadow-xs border border-black/10 shrink-0 flex items-center justify-center"
                style={{ backgroundColor: color.hex }}
              >
                {copiedHex === color.hex && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-stone-900 dark:text-white block truncate">
                  {color.name}
                </span>
                <span className="text-[10px] font-mono text-stone-500 group-hover:text-stone-900 dark:group-hover:text-white">
                  {copiedHex === color.hex ? 'Copied!' : color.hex}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Decor & Lighting Concepts */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
          Decor & Architectural Highlights
        </h4>
        <div className="space-y-2">
          {idea.decorConcepts.map((dc) => {
            const isAdded = addedIds.has(dc.id);
            return (
              <div
                key={dc.id}
                className="flex items-center justify-between p-3 rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50/40 dark:bg-zinc-900/40 text-xs"
              >
                <div className="pr-3">
                  <div className="font-semibold text-stone-900 dark:text-white">{dc.title}</div>
                  <p className="text-[11px] text-stone-500 dark:text-zinc-400">{dc.description}</p>
                  <div className="text-[10px] text-stone-400 font-mono mt-0.5">Task: {dc.timelineTask}</div>
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
                    icon={isAdded ? <Check className="w-3 h-3 text-emerald-600" /> : <Plus className="w-3 h-3" />}
                  >
                    {isAdded ? 'Added' : 'Add to Plan'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Signature Menu Ideas */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-zinc-400">
          Signature Culinary Moments
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {idea.menuItems.map((item) => (
            <div
              key={item.id}
              className="p-2.5 rounded-lg border border-stone-200 dark:border-zinc-800 bg-stone-50/30 dark:bg-zinc-900/30 text-xs space-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-900 dark:text-white">{item.name}</span>
                <span className="font-mono text-emerald-600 font-semibold tabular-nums">
                  {formatCurrency(item.estimatedCostPerHead, currency)} / head
                </span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-zinc-400">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
